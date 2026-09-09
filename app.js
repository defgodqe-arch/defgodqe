/*
 * defgodqe upgrade loader
 * Preserves the original working app while adding cloud streaming,
 * memory, and enhanced voice controls.
 */

const CORE_APP =
  'https://cdn.jsdelivr.net/gh/defgodqe-arch/defgodqe@013d26575d03aebd4c6dbc6bb62427f5650d2a93/app.js';

const WORKER_CHAT = 'https://defgodqe-ai.defgodqe.workers.dev/chat';
const MEMORY_KEY = 'defgodqe:memory:v1';
const CLIENT_KEY = 'defgodqe:client-id:v1';
const VOICE_SETTINGS_KEY = 'defgodqe:voice-settings:v1';
const STREAM_STYLE_ID = 'defgodqe-stream-style';

function getClientId() {
  let id = localStorage.getItem(CLIENT_KEY);
  if (!id) {
    id = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(CLIENT_KEY, id);
  }
  return id;
}

function getMemory() {
  try { return JSON.parse(localStorage.getItem(MEMORY_KEY) || '[]'); }
  catch { return []; }
}

function saveMemory(items) {
  try { localStorage.setItem(MEMORY_KEY, JSON.stringify(items.slice(-20))); } catch {}
}

function updateMemory(messages) {
  const memory = getMemory();
  const existing = new Set(memory);
  for (const message of messages || []) {
    if (message?.role !== 'user') continue;
    const text = String(message.content || '').trim();
    if (!text) continue;
    const explicit = text.match(/(?:remember|don't forget|do not forget)\s*(?:that)?\s*[:\-]?\s*(.{3,240})/i);
    const name = text.match(/(?:my name is|call me)\s+([A-Za-z0-9 _-]{2,50})/i);
    const preference = text.match(/(?:i (?:like|love|prefer|use|want))\s+(.{3,180})/i);
    const candidate = explicit?.[1] || (name ? `The user's name is ${name[1].trim()}.` : '') || (preference ? `The user ${text.replace(/\s+/g, ' ').trim()}.` : '');
    if (candidate && !existing.has(candidate)) { memory.push(candidate); existing.add(candidate); }
  }
  saveMemory(memory);
}

function installStreamStyles() {
  if (document.getElementById(STREAM_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STREAM_STYLE_ID;
  style.textContent = `
    .df-stream-preview{margin:0 0 18px 44px;padding:10px 14px;border-left:2px solid rgba(250,204,21,.55);color:#cbd5e1;font-size:.94rem;line-height:1.65;white-space:pre-wrap;opacity:.96}
    .df-stream-preview::before{content:'defgodqe is typing';display:block;font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;color:#facc15;margin-bottom:4px;opacity:.8}
    .df-voice-controls{margin-top:12px;padding:12px;border:1px solid rgba(255,255,255,.1);border-radius:14px;background:rgba(255,255,255,.035)}
    .df-voice-title{font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;color:#facc15;margin-bottom:8px;font-weight:600}
    .df-voice-row{display:flex;align-items:center;gap:8px;margin-top:9px}
    .df-voice-row label{width:54px;font-size:.72rem;color:#94a3b8}
    .df-voice-row input[type=range]{flex:1;accent-color:#facc15}
    .df-voice-value{width:42px;text-align:right;font-size:.7rem;color:#cbd5e1}
    .df-voice-preview{margin-left:auto;border:1px solid rgba(250,204,21,.35);background:rgba(250,204,21,.08);color:#facc15;border-radius:9px;padding:6px 9px;font-size:.72rem;cursor:pointer}
    .df-voice-preview:hover{background:rgba(250,204,21,.15)}
    @media(max-width:640px){.df-stream-preview{margin-left:12px}.df-voice-row label{width:48px}}
  `;
  document.head.appendChild(style);
}

function createStreamPreview() {
  installStreamStyles();
  const container = document.getElementById('messages');
  if (!container) return null;
  const node = document.createElement('div');
  node.className = 'df-stream-preview';
  node.setAttribute('aria-live', 'polite');
  container.appendChild(node);
  container.scrollTop = container.scrollHeight;
  return node;
}

function parseStreamChunk(text, preview, state) {
  state.buffer += text;
  const lines = state.buffer.split(/\r?\n/);
  state.buffer = lines.pop() || '';
  for (const line of lines) {
    if (!line.startsWith('data:')) continue;
    const payload = line.slice(5).trim();
    if (!payload || payload === '[DONE]') continue;
    try {
      const data = JSON.parse(payload);
      const piece = data.response ?? data.text ?? data.delta ?? data.result?.response ?? '';
      if (typeof piece === 'string' && piece) {
        state.text += piece;
        if (preview) {
          preview.textContent = state.text;
          const container = document.getElementById('messages');
          if (container) container.scrollTop = container.scrollHeight;
        }
      }
    } catch {}
  }
}

async function streamChat(originalFetch, input, init) {
  const requestInit = { ...(init || {}) };
  let body;
  try { body = typeof requestInit.body === 'string' ? JSON.parse(requestInit.body) : requestInit.body; }
  catch { return originalFetch(input, init); }
  if (!body || !Array.isArray(body.messages)) return originalFetch(input, init);

  updateMemory(body.messages);
  const memory = getMemory();
  if (memory.length) {
    const messages = body.messages.slice();
    const firstSystem = messages.find(m => m?.role === 'system');
    const memoryText = `\n\nPersistent user memory (use only when relevant):\n${memory.map(m => `- ${m}`).join('\n')}`;
    if (firstSystem) firstSystem.content = `${firstSystem.content || ''}${memoryText}`;
    else messages.unshift({ role:'system', content:`Persistent user memory:\n${memory.map(m => `- ${m}`).join('\n')}` });
    body.messages = messages;
  }

  const url = new URL(typeof input === 'string' ? input : input.url, location.href);
  url.searchParams.set('stream', '1');
  const headers = new Headers(requestInit.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('X-Defgodqe-Client', getClientId());

  const preview = createStreamPreview();
  const response = await originalFetch(url.toString(), { ...requestInit, headers, body: JSON.stringify(body) });
  if (!response.ok || !response.body) { preview?.remove(); return response; }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const streamState = { buffer:'', text:'' };
  try {
    while (true) {
      const {done,value} = await reader.read();
      if (done) break;
      parseStreamChunk(decoder.decode(value,{stream:true}), preview, streamState);
    }
    parseStreamChunk(decoder.decode(), preview, streamState);
  } finally { preview?.remove(); }

  return new Response(JSON.stringify({success:true,response:streamState.text.trim()}), {
    status:200,
    headers:{'content-type':'application/json'}
  });
}

/* ============================================================
   Enhanced voice controls
   ============================================================ */

function readVoiceSettings() {
  try {
    return Object.assign({ rate:0.98, volume:1 }, JSON.parse(localStorage.getItem(VOICE_SETTINGS_KEY) || '{}'));
  } catch { return { rate:0.98, volume:1 }; }
}

function writeVoiceSettings(settings) {
  try { localStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify(settings)); } catch {}
}

const nativeSpeechSynthesis = window.speechSynthesis;
if (nativeSpeechSynthesis) {
  const nativeSpeak = nativeSpeechSynthesis.speak.bind(nativeSpeechSynthesis);
  nativeSpeechSynthesis.speak = function enhancedSpeak(utterance) {
    const settings = readVoiceSettings();
    if (utterance) {
      utterance.rate = Number(settings.rate) || 0.98;
      utterance.volume = Number(settings.volume) || 1;
    }
    return nativeSpeak(utterance);
  };
}

function addVoiceControls() {
  installStreamStyles();
  const select = document.getElementById('voiceSelect');
  if (!select || document.getElementById('defgodqeVoiceControls')) return;

  const settings = readVoiceSettings();
  const panel = document.createElement('div');
  panel.id = 'defgodqeVoiceControls';
  panel.className = 'df-voice-controls';
  panel.innerHTML = `
    <div class="df-voice-title">Voice settings</div>
    <div class="df-voice-row">
      <label for="dfVoiceRate">Speed</label>
      <input id="dfVoiceRate" type="range" min="0.65" max="1.5" step="0.01" value="${settings.rate}">
      <span id="dfVoiceRateValue" class="df-voice-value">${Number(settings.rate).toFixed(2)}x</span>
    </div>
    <div class="df-voice-row">
      <label for="dfVoiceVolume">Volume</label>
      <input id="dfVoiceVolume" type="range" min="0" max="1" step="0.01" value="${settings.volume}">
      <span id="dfVoiceVolumeValue" class="df-voice-value">${Math.round(settings.volume*100)}%</span>
    </div>
    <div class="df-voice-row">
      <button id="dfVoicePreview" type="button" class="df-voice-preview">🔊 Preview voice</button>
    </div>`;

  select.parentElement?.appendChild(panel);

  const rate = panel.querySelector('#dfVoiceRate');
  const volume = panel.querySelector('#dfVoiceVolume');
  const rateValue = panel.querySelector('#dfVoiceRateValue');
  const volumeValue = panel.querySelector('#dfVoiceVolumeValue');
  const preview = panel.querySelector('#dfVoicePreview');

  rate.addEventListener('input', () => {
    const value = Number(rate.value);
    rateValue.textContent = `${value.toFixed(2)}x`;
    const current = readVoiceSettings();
    writeVoiceSettings({...current, rate:value});
  });

  volume.addEventListener('input', () => {
    const value = Number(volume.value);
    volumeValue.textContent = `${Math.round(value*100)}%`;
    const current = readVoiceSettings();
    writeVoiceSettings({...current, volume:value});
  });

  preview.addEventListener('click', () => {
    if (!window.speechSynthesis) return;
    const selectedKey = select.value;
    const voices = window.speechSynthesis.getVoices();
    const selected = voices.find(v => `${v.name}|${v.lang}|${v.voiceURI}` === selectedKey);
    const settingsNow = readVoiceSettings();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance('Hi, I\'m defgodqe. This is a preview of my voice.');
    if (selected) {
      utterance.voice = selected;
      utterance.lang = selected.lang;
    } else {
      utterance.lang = 'en-US';
    }
    utterance.rate = Number(settingsNow.rate) || 0.98;
    utterance.volume = Number(settingsNow.volume) || 1;
    window.speechSynthesis.speak(utterance);
  });
}

const nativeFetch = window.fetch.bind(window);
window.fetch = function patchedFetch(input, init) {
  try {
    const url = new URL(typeof input === 'string' ? input : input.url, location.href);
    if (url.href.startsWith(WORKER_CHAT) && (init?.method || 'GET').toUpperCase() === 'POST') {
      return streamChat(nativeFetch, input, init);
    }
  } catch {}
  return nativeFetch(input, init);
};

installStreamStyles();

try {
  await import(CORE_APP);
  addVoiceControls();
  setTimeout(addVoiceControls, 500);
  setTimeout(addVoiceControls, 1500);
} catch (error) {
  console.error('defgodqe core failed to load:', error);
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = 'defgodqe could not load its core app. Please refresh.';
    toast.style.opacity = '1';
  }
}
