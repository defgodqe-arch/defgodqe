"""defgodqe local Qwen3-TTS bridge.

This uses the qwen_tts package shipped with
flybirdxx/ComfyUI-Qwen-TTS. Keep this service local; it exposes no auth.

Default ComfyUI layout:
  ComfyUI/custom_nodes/ComfyUI-Qwen-TTS/

Run:
  python qwen-tts-server.py

Optional:
  python qwen-tts-server.py --qwen-path D:/ComfyUI/custom_nodes/ComfyUI-Qwen-TTS
"""
from __future__ import annotations

import argparse
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
    raise RuntimeError(
        "Could not find ComfyUI-Qwen-TTS. Pass --qwen-path pointing to its folder."
    )


class TTSRuntime:
    def __init__(self, qwen_path: str):
        sys.path.insert(0, qwen_path)
        from qwen_tts import Qwen3TTSModel
        self.Qwen3TTSModel = Qwen3TTSModel
        self.models = {}
        self.lock = threading.Lock()

    def _device(self):
        if torch.cuda.is_available():
            return "cuda:0"
        if hasattr(torch, "xpu") and torch.xpu.is_available():
            return "xpu:0"
        if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
            return "mps"
        return "cpu"

    def _load(self, size: str):
        size = size if size in {"0.6B", "1.7B"} else "1.7B"
        key = size
        if key in self.models:
            return self.models[key]
        device = self._device()
        dtype = torch.bfloat16 if device != "cpu" else torch.float32
        model_id = f"Qwen/Qwen3-TTS-12Hz-{size}-CustomVoice"
        kwargs = {"device_map": device, "dtype": dtype, "attn_implementation": "sdpa"}
        if device == "cpu":
            kwargs.pop("attn_implementation", None)
        model = self.Qwen3TTSModel.from_pretrained(model_id, **kwargs)
        self.models[key] = model
        return model

    def synthesize(self, text: str, speaker: str, language: str, model_size: str, instruct: str):
        with self.lock:
            model = self._load(model_size)
            wavs, sr = model.generate_custom_voice(
                text=text,
                language=language or "Auto",
                speaker=speaker or "Ryan",
                instruct=instruct or None,
                max_new_tokens=2048,
            )
            audio = np.asarray(wavs[0], dtype=np.float32)
            out = io.BytesIO()
            sf.write(out, audio, sr, format="WAV", subtype="PCM_16")
            return out.getvalue()


RUNTIME: TTSRuntime | None = None


class Handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    def _json(self, code, data):
        raw = json.dumps(data).encode("utf-8")
        self.send_response(code)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path.split("?", 1)[0] == "/health":
            self._json(200, {"ok": True, "service": "defgodqe-qwen3-tts"})
            return
        self._json(404, {"ok": False, "error": "not found"})

    def do_POST(self):
        if self.path.split("?", 1)[0] != "/tts":
            self._json(404, {"ok": False, "error": "not found"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length) or b"{}")
            text = str(payload.get("text", "")).strip()
            if not text:
                raise ValueError("text is required")
            audio = RUNTIME.synthesize(
                text,
                str(payload.get("speaker", "Ryan")),
                str(payload.get("language", "Auto")),
                str(payload.get("model", "1.7B")),
                str(payload.get("instruct", "")),
            )
            self.send_response(200)
            self._cors()
            self.send_header("Content-Type", "audio/wav")
            self.send_header("Content-Length", str(len(audio)))
            self.end_headers()
            self.wfile.write(audio)
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
