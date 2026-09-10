/* defgodqe — local Qwen3-TTS + real voice cloning bridge */
(() => {
  'use strict';
  if (window.__defgodqeQwenTTS) return;
  window.__defgodqeQwenTTS = true;

  const KEY = 'defgodqe:qwen-tts-settings';
  const defaults = { enabled:true, endpoint:'http://127.0.0.1:8765', speaker:'Ryan', language:'Auto', model:'1.7B', instruct:'', voiceClone:false };
  const load = () => { try { return {...defaults, ...JSON.parse(localStorage.getItem(KEY)||'{}')}; } catch { return {...defaults}; } };
  const save = v => localStorage.setItem(KEY, JSON.stringify(v));
  const state = load();
  const base = () => state.endpoint.replace(/\/$/, '');
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    if (!state.enabled || !/\/tts(?:[?#]|$)/.test(url)) return originalFetch(input, init);
    try {
      const body = init?.body;
      if (typeof body !== 'string') return originalFetch(input, init);
      const payload = JSON.parse(body);
      const text = String(payload.text || payload.input || '').trim();
      if (!text) return originalFetch(input, init);
      const r = await originalFetch(`${base()}/tts`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({text, speaker:state.speaker, language:state.language, model:state.model, instruct:state.instruct})});
      if (!r.ok) throw new Error(`Qwen TTS HTTP ${r.status}`);
      return r;
    } catch (err) {
      console.warn('[defgodqe] Local Qwen TTS unavailable; using Worker TTS fallback.', err);
      return originalFetch(input, init);
    }
  };

  async function cloneVoice(file, refText = '', options = {}) {
    if (!(file instanceof Blob)) throw new Error('Provide a voice recording/audio file.');
    const buffer = await file.arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunk = 0x8000;
    for (let i=0;i<bytes.length;i+=chunk) binary += String.fromCharCode(...bytes.subarray(i,i+chunk));
    const audio = btoa(binary);
    const r = await originalFetch(`${base()}/voice/clone`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({audio, refText, model:options.model || state.model, xVectorOnly:!!options.xVectorOnly})});
    if (!r.ok) { const e = await r.json().catch(()=>({})); throw new Error(e.error || `Voice clone HTTP ${r.status}`); }
    const result = await r.json();
    state.voiceClone = true; save(state);
    return result;
  }

  async function clearVoice() {
    const r = await originalFetch(`${base()}/voice/clear`, {method:'POST', headers:{'Content-Type':'application/json'}, body:'{}'});
    if (!r.ok) throw new Error(`Voice clear HTTP ${r.status}`);
    state.voiceClone = false; save(state); return r.json();
  }

  function installVoiceCloneUI() {
    if (document.getElementById('defgodqe-voice-clone')) return;
    const wrap = document.createElement('div');
    wrap.id = 'defgodqe-voice-clone';
    wrap.innerHTML = `
      <button id="dg-vc-open" type="button" aria-label="Voice clone">🎙️ Voice</button>
      <div id="dg-vc-panel" hidden>
        <div class="dg-vc-title">defgodqe voice</div>
        <div class="dg-vc-sub">Give defgodqe a short sample and it will speak in that voice.</div>
        <input id="dg-vc-file" type="file" accept="audio/*,.wav,.mp3,.m4a,.webm" />
        <input id="dg-vc-text" type="text" placeholder="What was said in the sample? (optional)" />
        <button id="dg-vc-apply" type="button">Clone this voice</button>
        <button id="dg-vc-clear" type="button">Use default voice</button>
        <div id="dg-vc-status" role="status"></div>
      </div>`;
    const style = document.createElement('style');
    style.textContent = `#defgodqe-voice-clone{position:fixed;right:18px;bottom:18px;z-index:2147483000;font:14px system-ui,sans-serif}#dg-vc-open,#dg-vc-panel button{border:1px solid rgba(250,204,21,.55);background:rgba(15,15,18,.94);color:#facc15;border-radius:12px;padding:10px 13px;cursor:pointer;box-shadow:0 0 18px rgba(250,204,21,.12)}#dg-vc-panel{width:290px;margin-bottom:8px;padding:15px;border:1px solid rgba(250,204,21,.35);border-radius:16px;background:rgba(10,10,13,.97);backdrop-filter:blur(18px);box-shadow:0 12px 50px rgba(0,0,0,.45)}.dg-vc-title{font-weight:800;font-size:16px;color:#facc15}.dg-vc-sub{color:#aaa;font-size:12px;line-height:1.4;margin:5px 0 12px}#dg-vc-panel input{width:100%;box-sizing:border-box;margin:5px 0;padding:9px;border-radius:9px;border:1px solid #333;background:#151519;color:#eee}#dg-vc-panel button{margin:6px 5px 0 0;padding:8px 10px}#dg-vc-status{font-size:12px;color:#aaa;margin-top:9px;min-height:16px}`;
    document.head.appendChild(style); document.body.appendChild(wrap);
    const panel = wrap.querySelector('#dg-vc-panel');
    wrap.querySelector('#dg-vc-open').onclick = () => panel.hidden = !panel.hidden;
    const status = wrap.querySelector('#dg-vc-status');
    wrap.querySelector('#dg-vc-apply').onclick = async () => {
      const file = wrap.querySelector('#dg-vc-file').files[0];
      if (!file) { status.textContent='Choose a short voice sample first.'; return; }
      status.textContent='Building your voice profile…';
      try { await cloneVoice(file, wrap.querySelector('#dg-vc-text').value); status.textContent='Voice cloned. New defgodqe responses will use it.'; }
      catch (e) { status.textContent=`Voice clone failed: ${e.message}`; }
    };
    wrap.querySelector('#dg-vc-clear').onclick = async () => { status.textContent='Switching voice…'; try { await clearVoice(); status.textContent='Default voice restored.'; } catch(e) { status.textContent=e.message; } };
  }

  window.defgodqeQwenTTS = {
    get settings(){ return {...state}; },
    configure(next={}){ Object.assign(state,next); save(state); return {...state}; },
    cloneVoice,
    clearVoice,
    async test(){ const r=await originalFetch(`${base()}/health`); if(!r.ok) throw new Error(`Qwen TTS bridge HTTP ${r.status}`); return r.json(); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installVoiceCloneUI, {once:true}); else installVoiceCloneUI();
})();

import './game-sidebar.js';
