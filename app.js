/*
 * defgodqe upgrade loader
 *
 * The original working app is preserved at commit 013d26575d03aebd4c6dbc6bb62427f5650d2a93.
 * This loader keeps that UI/voice/history implementation intact and adds a lightweight
 * optimization layer before loading it.
 */

const CORE_APP =
  'https://cdn.jsdelivr.net/gh/defgodqe-arch/defgodqe@013d26575d03aebd4c6dbc6bb62427f5650d2a93/app.js';

const WORKER_CHAT = 'https://defgodqe-ai.defgodqe.workers.dev/chat';
const MEMORY_KEY = 'defgodqe:memory:v1';
const CLIENT_KEY = 'defgodqe:client-id:v1';
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
  try {
    return JSON.parse(localStorage.getItem(MEMORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveMemory(items) {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(items.slice(-20)));
  } catch {}
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

    const candidate = explicit?.[1] ||
      (name ? `The user's name is ${name[1].trim()}.` : '') ||
      (preference ? `The user ${text.replace(/\s+/g, ' ').trim()}.` : '');

    if (candidate && !existing.has(candidate)) {
      memory.push(candidate);
      existing.add(candidate);
    }
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
    @media(max-width:640px){.df-stream-preview{margin-left:12px}}
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
      const piece =
        data.response ??
        data.response?.response ??
        data.text ??
        data.delta ??
        data.result?.response ??
        '';
      if (typeof piece === 'string' && piece) {
        state.text += piece;
        if (preview) {
          preview.textContent = state.text;
          const container = document.getElementById('messages');
          if (container) container.scrollTop = container.scrollHeight;
        }
      }
    } catch {
      // Some stream chunks may split JSON across network packets.
    }
  }
}

async function streamChat(originalFetch, input, init) {
  const requestInit = { ...(init || {}) };
  let body;

  try {
    body = typeof requestInit.body === 'string'
      ? JSON.parse(requestInit.body)
      : requestInit.body;
  } catch {
    return originalFetch(input, init);
  }

  if (!body || !Array.isArray(body.messages)) {
    return originalFetch(input, init);
  }

  updateMemory(body.messages);

  const memory = getMemory();
  if (memory.length) {
    const messages = body.messages.slice();
    const firstSystem = messages.find((m) => m?.role === 'system');
    const memoryText = `\n\nPersistent user memory (use only when relevant):\n${memory.map((m) => `- ${m}`).join('\n')}`;
    if (firstSystem) {
      firstSystem.content = `${firstSystem.content || ''}${memoryText}`;
    } else {
      messages.unshift({ role: 'system', content: `Persistent user memory:\n${memory.map((m) => `- ${m}`).join('\n')}` });
    }
    body.messages = messages;
  }

  const url = new URL(typeof input === 'string' ? input : input.url, location.href);
  url.searchParams.set('stream', '1');

  const headers = new Headers(requestInit.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('X-Defgodqe-Client', getClientId());

  const preview = createStreamPreview();
  const response = await originalFetch(url.toString(), {
    ...requestInit,
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    preview?.remove();
    return response;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const streamState = { buffer: '', text: '' };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      parseStreamChunk(decoder.decode(value, { stream: true }), preview, streamState);
    }
    parseStreamChunk(decoder.decode(), preview, streamState);
  } finally {
    preview?.remove();
  }

  const finalText = streamState.text.trim();
  if (!finalText) {
    return new Response(JSON.stringify({ success: true, response: '' }), {
      status: response.status,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true, response: finalText }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
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
} catch (error) {
  console.error('defgodqe core failed to load:', error);
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = 'defgodqe could not load its core app. Please refresh.';
    toast.style.opacity = '1';
  }
}
