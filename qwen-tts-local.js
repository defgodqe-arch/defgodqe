/* defgodqe — local Qwen3-TTS bridge
 *
 * Uses the flybirdxx/ComfyUI-Qwen-TTS runtime through a tiny local HTTP
 * service. If the local service is unavailable, the normal defgodqe Worker
 * /tts endpoint is left untouched as a fallback.
 */
(() => {
  'use strict';
  if (window.__defgodqeQwenTTS) return;
  window.__defgodqeQwenTTS = true;

  const KEY = 'defgodqe:qwen-tts-settings';
  const defaults = {
    enabled: true,
    endpoint: 'http://127.0.0.1:8765',
    speaker: 'Ryan',
    language: 'Auto',
    model: '1.7B',
    instruct: ''
  };

  const load = () => {
    try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
    catch { return { ...defaults }; }
  };
  const save = (v) => localStorage.setItem(KEY, JSON.stringify(v));
  const state = load();

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    const isWorkerTTS = /\/tts(?:[?#]|$)/.test(url);
    if (!state.enabled || !isWorkerTTS) return originalFetch(input, init);

    try {
      let body = init?.body;
      if (typeof body !== 'string') return originalFetch(input, init);
      const payload = JSON.parse(body);
      const text = String(payload.text || payload.input || '').trim();
      if (!text) return originalFetch(input, init);

      const r = await originalFetch(`${state.endpoint.replace(/\/$/, '')}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          speaker: state.speaker,
          language: state.language,
          model: state.model,
          instruct: state.instruct
        })
      });
      if (!r.ok) throw new Error(`Qwen TTS HTTP ${r.status}`);
      return r;
    } catch (err) {
      console.warn('[defgodqe] Local Qwen TTS unavailable; using Worker TTS fallback.', err);
      return originalFetch(input, init);
    }
  };

  window.defgodqeQwenTTS = {
    get settings() { return { ...state }; },
    configure(next = {}) {
      Object.assign(state, next);
      save(state);
      return { ...state };
    },
    async test() {
      const r = await originalFetch(`${state.endpoint.replace(/\/$/, '')}/health`);
      if (!r.ok) throw new Error(`Qwen TTS bridge HTTP ${r.status}`);
      return r.json();
    }
  };
})();
