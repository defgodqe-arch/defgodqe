"""defgodqe local Qwen3-TTS bridge.

Supports both preset voices and real zero-shot voice cloning through the
Base model from flybirdxx/ComfyUI-Qwen-TTS.

Keep this service bound to localhost; it has no authentication.
"""
from __future__ import annotations

import argparse
import base64
import io
import json
import os
import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import numpy as np
import soundfile as sf
import torch


def find_qwen_path(explicit: str | None) -> str:
    candidates = []
    if explicit:
        candidates.append(explicit)
    candidates.extend([
        os.path.join(os.getcwd(), "ComfyUI", "custom_nodes", "ComfyUI-Qwen-TTS"),
        os.path.join(os.getcwd(), "custom_nodes", "ComfyUI-Qwen-TTS"),
    ])
    for path in candidates:
        if os.path.isdir(path) and os.path.isdir(os.path.join(path, "qwen_tts")):
            return os.path.abspath(path)
    raise RuntimeError("Could not find ComfyUI-Qwen-TTS. Pass --qwen-path pointing to its folder.")


class TTSRuntime:
    def __init__(self, qwen_path: str):
        sys.path.insert(0, qwen_path)
        from qwen_tts import Qwen3TTSModel
        self.Qwen3TTSModel = Qwen3TTSModel
        self.models = {}
        self.clone_prompt = None
        self.clone_meta = {}
        self.lock = threading.Lock()

    def _device(self):
        if torch.cuda.is_available(): return "cuda:0"
        if hasattr(torch, "xpu") and torch.xpu.is_available(): return "xpu:0"
        if hasattr(torch.backends, "mps") and torch.backends.mps.is_available(): return "mps"
        return "cpu"

    def _load(self, size: str, base: bool = False):
        size = size if size in {"0.6B", "1.7B"} else "1.7B"
        key = (size, base)
        if key in self.models:
            return self.models[key]
        device = self._device()
        dtype = torch.bfloat16 if device != "cpu" else torch.float32
        kind = "Base" if base else "CustomVoice"
        model_id = f"Qwen/Qwen3-TTS-12Hz-{size}-{kind}"
        kwargs = {"device_map": device, "dtype": dtype, "attn_implementation": "sdpa"}
        if device == "cpu": kwargs.pop("attn_implementation", None)
        model = self.Qwen3TTSModel.from_pretrained(model_id, **kwargs)
        self.models[key] = model
        return model

    @staticmethod
    def _decode_audio(data: str):
        if data.startswith("data:"):
            data = data.split(",", 1)[1]
        raw = base64.b64decode(data)
        audio, sr = sf.read(io.BytesIO(raw), dtype="float32", always_2d=False)
        if audio.ndim > 1:
            audio = np.mean(audio, axis=1)
        return audio, sr

    @staticmethod
    def _wav(audio, sr):
        out = io.BytesIO()
        sf.write(out, np.asarray(audio, dtype=np.float32), sr, format="WAV", subtype="PCM_16")
        return out.getvalue()

    def set_clone_voice(self, audio_b64: str, ref_text: str, model_size: str, x_vector_only: bool):
        with self.lock:
            model = self._load(model_size, base=True)
            audio = self._decode_audio(audio_b64)
            prompt = model.create_voice_clone_prompt(
                ref_audio=audio,
                ref_text=None if x_vector_only else (ref_text.strip() or None),
                x_vector_only_mode=x_vector_only,
            )
            self.clone_prompt = prompt
            self.clone_meta = {
                "model": model_size,
                "x_vector_only": bool(x_vector_only),
                "has_transcript": bool(ref_text.strip()),
            }
            return self.clone_meta

    def clear_clone(self):
        with self.lock:
            self.clone_prompt = None
            self.clone_meta = {}

    def synthesize(self, text: str, speaker: str, language: str, model_size: str, instruct: str):
        with self.lock:
            if self.clone_prompt is not None:
                model = self._load(self.clone_meta.get("model", "1.7B"), base=True)
                wavs, sr = model.generate_voice_clone(
                    text=text,
                    language=language or "Auto",
                    voice_clone_prompt=self.clone_prompt,
                    x_vector_only_mode=self.clone_meta.get("x_vector_only", False),
                    do_sample=True,
                    max_new_tokens=2048,
                )
            else:
                model = self._load(model_size, base=False)
                wavs, sr = model.generate_custom_voice(
                    text=text,
                    language=language or "Auto",
                    speaker=speaker or "Ryan",
                    instruct=instruct or None,
                    max_new_tokens=2048,
                )
            return self._wav(wavs[0], sr)


RUNTIME: TTSRuntime | None = None


class Handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    def _json(self, code, data):
        raw = json.dumps(data).encode("utf-8")
        self.send_response(code); self._cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(raw))); self.end_headers()
        self.wfile.write(raw)

    def do_OPTIONS(self):
        self.send_response(204); self._cors(); self.end_headers()

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/health":
            self._json(200, {"ok": True, "service": "defgodqe-qwen3-tts", "voiceClone": bool(RUNTIME.clone_prompt)})
            return
        if path == "/voice":
            self._json(200, {"ok": True, "active": bool(RUNTIME.clone_prompt), "meta": RUNTIME.clone_meta})
            return
        self._json(404, {"ok": False, "error": "not found"})

    def do_POST(self):
        path = self.path.split("?", 1)[0]
        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length) or b"{}")
            if path == "/voice/clone":
                audio = str(payload.get("audio", "")).strip()
                if not audio: raise ValueError("audio is required")
                meta = RUNTIME.set_clone_voice(
                    audio,
                    str(payload.get("refText", "")),
                    str(payload.get("model", "1.7B")),
                    bool(payload.get("xVectorOnly", False)),
                )
                self._json(200, {"ok": True, "active": True, "meta": meta})
                return
            if path == "/voice/clear":
                RUNTIME.clear_clone()
                self._json(200, {"ok": True, "active": False})
                return
            if path == "/tts":
                text = str(payload.get("text", "")).strip()
                if not text: raise ValueError("text is required")
                audio = RUNTIME.synthesize(
                    text,
                    str(payload.get("speaker", "Ryan")),
                    str(payload.get("language", "Auto")),
                    str(payload.get("model", "1.7B")),
                    str(payload.get("instruct", "")),
                )
                self.send_response(200); self._cors()
                self.send_header("Content-Type", "audio/wav")
                self.send_header("Content-Length", str(len(audio))); self.end_headers()
                self.wfile.write(audio)
                return
            self._json(404, {"ok": False, "error": "not found"})
        except Exception as exc:
            self._json(500, {"ok": False, "error": f"{type(exc).__name__}: {exc}"})


def main():
    global RUNTIME
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--qwen-path", default=None)
    args = parser.parse_args()
    qwen_path = find_qwen_path(args.qwen_path)
    print(f"[defgodqe] Qwen TTS path: {qwen_path}")
    RUNTIME = TTSRuntime(qwen_path)
    print(f"[defgodqe] Qwen TTS bridge: http://{args.host}:{args.port}")
    ThreadingHTTPServer((args.host, args.port), Handler).serve_forever()


if __name__ == "__main__":
    main()
