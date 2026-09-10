
import { createIcons, icons } from 'https://cdn.jsdelivr.net/npm/lucide@latest/+esm';

/* ============================================================
   defgodqe — AI Assistant
   Cloudflare Worker AI Edition
   ============================================================ */

const $ = (id) => document.getElementById(id);

const el = {
  sidebar: $('sidebar'),
  openSidebar: $('openSidebar'),
  closeSidebar: $('closeSidebar'),
  backdrop: $('sidebarBackdrop'),
  newChatBtn: $('newChatBtn'),
  chatList: $('chatList'),
  userName: $('userName'),
  signBtn: $('signBtn'),

  modelBtn: $('modelBtn'),
  modelMenu: $('modelMenu'),
  modelLabel: $('modelLabel'),

  modeBtn: $('modeBtn'),
  modeMenu: $('modeMenu'),
  modeLabel: $('modeLabel'),

  webBtn: $('webBtn'),

  scroll: $('scroll'),
  welcome: $('welcome'),
  messages: $('messages'),
  suggestGrid: $('suggestGrid'),

  attachRow: $('attachRow'),
  composer: $('composer'),
  input: $('input'),
  attachBtn: $('attachBtn'),
  imgBtn: $('imgBtn'),
  sendBtn: $('sendBtn'),
  stopBtn: $('stopBtn'),
  fileInput: $('fileInput'),
  imgHint: $('imgHint'),
  toast: $('toast'),

  voiceBtn: $('voiceBtn'),
  voiceOverlay: $('voiceOverlay'),
  voiceClose: $('voiceClose'),
  voiceSelect: $('voiceSelect'),
  vStatus: $('vStatus'),
  vCaption: $('vCaption'),
  vCanvas: $('vCanvas'),
  vMic: $('vMic'),
  vStop: $('vStop'),
  vMute: $('vMute'),
  vHands: $('vHands')
};

/* ============================================================
   CLOUDFLARE
   ============================================================ */

const CLOUDFLARE_WORKER_BASE =
  'https://defgodqe-ai.defgodqe.workers.dev';

const CLOUDFLARE_WORKER_URL =
  `${CLOUDFLARE_WORKER_BASE}/chat`;

const CLOUDFLARE_WEB_SEARCH_URL =
  `${CLOUDFLARE_WORKER_BASE}/web-search`;

const CLOUDFLARE_IMAGE_URL =
  `${CLOUDFLARE_WORKER_BASE}/generate-image`;

/* ============================================================
   MODELS
   ============================================================ */

const MODELS = [
  {
    id: 'cloudflare-llama',
    label: 'defgodqe AI',
    desc: 'Cloudflare AI — fast & cloud-powered',
    icon: 'brain'
  }
];

/* ============================================================
   MODES
   ============================================================ */

const MODES = {
  Normal: {
    icon: 'sparkles',
    prompt:
      'Respond in a friendly, helpful and balanced way.'
  },

  Developer: {
    icon: 'code',
    prompt:
      'You are in Developer mode. Be technical, precise and code-focused. Give complete working code whenever practical.'
  },

  Gamer: {
    icon: 'gamepad-2',
    prompt:
      'You are in Gamer mode. Be energetic and casual. Be especially strong with Minecraft, Fortnite, Roblox, servers, commands, plugins and gaming.'
  },

  Creative: {
    icon: 'palette',
    prompt:
      'You are in Creative mode. Be imaginative, vivid and enthusiastic. Help with stories, lore, names, worldbuilding and ideas.'
  },

  Professional: {
    icon: 'briefcase',
    prompt:
      'You are in Professional mode. Be clear, concise and business-like.'
  },

  Teacher: {
    icon: 'graduation-cap',
    prompt:
      'You are in Teacher mode. Explain things patiently and step by step using simple examples.'
  }
};

/* ============================================================
   PERSONALITY
   ============================================================ */

const BASE_SYSTEM = `
You are defgodqe, an advanced AI assistant.

Your name is defgodqe.

Never say you are ChatGPT.
Never say you are made by OpenAI.
Never claim to be another AI.

Your tagline is:

"Your AI. Your Ideas. Your World."

Be intelligent, helpful, creative, confident and friendly.

Match the user's tone.

Do not constantly remind the user that you are an AI.

Be honest about limitations.

Never fabricate:
- facts
- sources
- URLs
- code results
- actions
- files
- real-world events

Use Markdown when useful.

Keep simple answers short.

Structure complicated answers clearly.

You are especially strong at:
- coding
- JavaScript
- HTML
- CSS
- web applications
- Cloudflare
- AI applications
- Minecraft
- Minecraft servers
- plugins
- gaming
- technology
- creativity
- troubleshooting

When giving code, make it complete and runnable whenever practical.

When troubleshooting, give clear numbered steps.

If the user asks what to do next, give the next concrete step.
`;

/* ============================================================
   SUGGESTIONS
   ============================================================ */

const SUGGESTIONS = [
  {
    icon: 'code',
    title: 'Write code',
    text: 'Build me a responsive pricing page in HTML and Tailwind CSS.'
  },
  {
    icon: 'gamepad-2',
    title: 'Minecraft help',
    text: 'Give me a command to summon a custom armored zombie with full diamond gear.'
  },
  {
    icon: 'feather',
    title: 'Get creative',
    text: 'Write an epic short backstory for a Minecraft SMP villain.'
  },
  {
    icon: 'graduation-cap',
    title: 'Explain simply',
    text: 'Explain how neural networks work like I am 12 years old.'
  }
];

/* ============================================================
   STATE
   ============================================================ */

const KV_PREFIX = 'defgodqe:chat:';
const KV_INDEX = 'defgodqe:index';
const LS_SETTINGS = 'defgodqe:settings';

let state = {
  model: 'cloudflare-llama',
  mode: 'Normal',
  web: false,
  currentId: null,
  chats: [],
  messages: [],
  attachments: [],
  imgMode: false,
  signedIn: false
};

let generating = false;
let currentController = null;

/* ============================================================
   UTILITIES
   ============================================================ */

function icon() {
  try {
    createIcons({ icons });
  } catch (error) {
    console.warn('Icon rendering error:', error);
  }
}

function toast(message) {
  if (!el.toast) return;

  el.toast.textContent = message;
  el.toast.style.opacity = '1';
  el.toast.style.transform = 'translate(-50%, 0)';

  clearTimeout(toast.timer);

  toast.timer = setTimeout(() => {
    el.toast.style.opacity = '0';
    el.toast.style.transform = 'translate(-50%, 16px)';
  }, 1800);
}

function uid() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  );
}

function esc(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[c]
  );
}

function scrollBottom(smooth = false) {
  if (!el.scroll) return;

  el.scroll.scrollTo({
    top: el.scroll.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto'
  });
}

function isSafeUrl(url) {
  try {
    const parsed = new URL(String(url || ''));

    return (
      parsed.protocol === 'http:' ||
      parsed.protocol === 'https:'
    );
  } catch {
    return false;
  }
}

function getDomain(url) {
  try {
    return new URL(url)
      .hostname
      .replace(/^www\./i, '');
  } catch {
    return '';
  }
}

function normalizeSources(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  const seen = new Set();
  const output = [];

  for (const source of input) {
    if (!source) continue;

    const url = String(
      source.url ||
      source.href ||
      ''
    ).trim();

    if (!isSafeUrl(url)) continue;

    if (seen.has(url)) continue;

    seen.add(url);

    output.push({
      title:
        String(
          source.title ||
          source.name ||
          getDomain(url) ||
          url
        ).trim(),

      url,

      domain:
        String(
          source.domain ||
          getDomain(url)
        ).trim()
    });

    if (output.length >= 8) {
      break;
    }
  }

  return output;
}

/* ============================================================
   MARKDOWN
   ============================================================ */

if (typeof marked !== 'undefined') {
  marked.setOptions({
    breaks: true,
    gfm: true
  });
}

function renderMarkdown(text) {
  const source = String(text || '');

  if (typeof marked === 'undefined') {
    const div = document.createElement('div');
    div.textContent = source;
    return div;
  }

  let html = marked.parse(source);

  if (typeof DOMPurify !== 'undefined') {
    html = DOMPurify.sanitize(html, {
      ADD_ATTR: [
        'target',
        'rel'
      ]
    });
  }

  const tmp = document.createElement('div');

  tmp.innerHTML = html;

  tmp.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href');

    if (!isSafeUrl(href)) {
      a.removeAttribute('href');
      a.removeAttribute('target');
      a.removeAttribute('rel');
      return;
    }

    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.style.cursor = 'pointer';
  });

  tmp.querySelectorAll('pre > code').forEach((code) => {
    const pre = code.parentElement;

    if (!pre) return;

    const wrapper =
      document.createElement('div');

    wrapper.className = 'codeblock';

    let language = '';

    for (const c of code.className.split(/\s+/)) {
      if (c.startsWith('language-')) {
        language = c.slice(9);
      }
    }

    const header =
      document.createElement('div');

    header.className = 'codeblock-head';

    header.innerHTML = `
      <span>${esc(language || 'code')}</span>

      <button class="copy-btn" type="button">
        <i data-lucide="copy" class="h-3.5 w-3.5"></i>
        Copy
      </button>
    `;

    try {
      if (
        typeof hljs !== 'undefined' &&
        language &&
        hljs.getLanguage(language)
      ) {
        code.innerHTML =
          hljs.highlight(
            code.textContent,
            { language }
          ).value;
      } else if (
        typeof hljs !== 'undefined'
      ) {
        code.innerHTML =
          hljs.highlightAuto(
            code.textContent
          ).value;
      }
    } catch (error) {
      console.warn(
        'Highlight error:',
        error
      );
    }

    pre.parentNode.insertBefore(
      wrapper,
      pre
    );

    wrapper.appendChild(header);
    wrapper.appendChild(pre);

    header
      .querySelector('.copy-btn')
      ?.addEventListener(
        'click',
        async () => {
          try {
            await navigator.clipboard.writeText(
              code.textContent
            );

            toast('Code copied');
          } catch {
            toast('Could not copy code');
          }
        }
      );
  });

  return tmp;
}

/* ============================================================
   SETTINGS
   ============================================================ */

function saveSettings() {
  try {
    localStorage.setItem(
      LS_SETTINGS,
      JSON.stringify({
        model: state.model,
        mode: state.mode,
        web: state.web,
        voice:
          el.voiceSelect?.value || ''
      })
    );
  } catch (error) {
    console.warn(
      'Settings save error:',
      error
    );
  }
}

function loadSettings() {
  try {
    const raw =
      localStorage.getItem(
        LS_SETTINGS
      );

    const settings =
      raw
        ? JSON.parse(raw)
        : {};

    if (
      settings.model &&
      MODELS.some(
        (m) =>
          m.id === settings.model
      )
    ) {
      state.model =
        settings.model;
    }

    if (
      settings.mode &&
      MODES[settings.mode]
    ) {
      state.mode =
        settings.mode;
    }

    state.web =
      !!settings.web;

    if (
      settings.voice &&
      el.voiceSelect
    ) {
      el.voiceSelect.value =
        settings.voice;
    }
  } catch (error) {
    console.warn(
      'Could not load settings:',
      error
    );
  }

  const model =
    MODELS.find(
      (m) =>
        m.id === state.model
    ) ||
    MODELS[0];

  if (el.modelLabel) {
    el.modelLabel.textContent =
      model.label;
  }

  if (el.modeLabel) {
    el.modeLabel.textContent =
      state.mode;
  }

  updateWebButton();
}

function updateWebButton() {
  if (!el.webBtn) return;

  el.webBtn.classList.toggle(
    'text-brand',
    state.web
  );

  el.webBtn.classList.toggle(
    'border-brand/40',
    state.web
  );

  el.webBtn.classList.toggle(
    'bg-brand/10',
    state.web
  );

  el.webBtn.classList.toggle(
    'text-slate-400',
    !state.web
  );

  el.webBtn.setAttribute(
    'aria-pressed',
    state.web
      ? 'true'
      : 'false'
  );

  el.webBtn.title =
    state.web
      ? 'Web search is ON'
      : 'Web search is OFF';

  updateImageModeUI();
}

/* ============================================================
   MODEL MENU
   ============================================================ */

function buildModelMenu() {
  if (!el.modelMenu) return;

  el.modelMenu.innerHTML =
    MODELS.map(
      (model) => `
        <button
          type="button"
          data-model="${esc(model.id)}"
          class="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-white/5"
        >
          <i
            data-lucide="${esc(model.icon)}"
            class="mt-0.5 h-4 w-4 text-brand"
          ></i>

          <div class="min-w-0">
            <div class="text-sm font-medium text-white">
              ${esc(model.label)}
            </div>

            <div class="text-[11px] text-slate-500">
              ${esc(model.desc)}
            </div>
          </div>

          <i
            data-lucide="check"
            class="ml-auto mt-0.5 h-4 w-4 text-brand ${
              model.id === state.model
                ? ''
                : 'hidden'
            }"
          ></i>
        </button>
      `
    ).join('');

  icon();

  el.modelMenu
    .querySelectorAll(
      '[data-model]'
    )
    .forEach((button) => {
      button.addEventListener(
        'click',
        () => {
          state.model =
            button.dataset.model;

          const selected =
            MODELS.find(
              (m) =>
                m.id === state.model
            );

          if (el.modelLabel) {
            el.modelLabel.textContent =
              selected?.label ||
              'defgodqe AI';
          }

          el.modelMenu.classList.add(
            'hidden'
          );

          saveSettings();
          buildModelMenu();

          toast(
            'Model: defgodqe AI'
          );
        }
      );
    });
}

/* ============================================================
   MODE MENU
   ============================================================ */

function buildModeMenu() {
  if (!el.modeMenu) return;

  el.modeMenu.innerHTML =
    Object.keys(MODES)
      .map(
        (name) => `
          <button
            type="button"
            data-mode="${esc(name)}"
            class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition hover:bg-white/5"
          >
            <i
              data-lucide="${esc(
                MODES[name].icon
              )}"
              class="h-4 w-4 text-brand"
            ></i>

            <span class="text-slate-200">
              ${esc(name)}
            </span>

            <i
              data-lucide="check"
              class="ml-auto h-4 w-4 text-brand ${
                name === state.mode
                  ? ''
                  : 'hidden'
              }"
            ></i>
          </button>
        `
      )
      .join('');

  icon();

  el.modeMenu
    .querySelectorAll(
      '[data-mode]'
    )
    .forEach((button) => {
      button.addEventListener(
        'click',
        () => {
          state.mode =
            button.dataset.mode;

          if (el.modeLabel) {
            el.modeLabel.textContent =
              state.mode;
          }

          el.modeMenu.classList.add(
            'hidden'
          );

          saveSettings();
          buildModeMenu();

          toast(
            `Mode: ${state.mode}`
          );
        }
      );
    });
}

/* ============================================================
   MENUS
   ============================================================ */

function toggleMenu(menu) {
  if (!menu) return;

  const wasOpen =
    !menu.classList.contains(
      'hidden'
    );

  el.modelMenu?.classList.add(
    'hidden'
  );

  el.modeMenu?.classList.add(
    'hidden'
  );

  if (!wasOpen) {
    menu.classList.remove(
      'hidden'
    );
  }
}

el.modelBtn?.addEventListener(
  'click',
  (event) => {
    event.stopPropagation();
    toggleMenu(
      el.modelMenu
    );
  }
);

el.modeBtn?.addEventListener(
  'click',
  (event) => {
    event.stopPropagation();
    toggleMenu(
      el.modeMenu
    );
  }
);

document.addEventListener(
  'click',
  () => {
    el.modelMenu?.classList.add(
      'hidden'
    );

    el.modeMenu?.classList.add(
      'hidden'
    );
  }
);

/* ============================================================
   WEB SEARCH TOGGLE
   ============================================================ */

el.webBtn?.addEventListener(
  'click',
  () => {
    if (generating) return;

    state.web =
      !state.web;

    updateWebButton();
    saveSettings();

    toast(
      state.web
        ? 'Web search on'
        : 'Web search off'
    );
  }
);

/* ============================================================
   STORAGE
   ============================================================ */

function kvGet(key) {
  try {
    return localStorage.getItem(
      key
    );
  } catch {
    return null;
  }
}

function kvSet(key, value) {
  try {
    localStorage.setItem(
      key,
      value
    );
  } catch (error) {
    console.warn(
      'Storage error:',
      error
    );
  }
}

function kvDel(key) {
  try {
    localStorage.removeItem(
      key
    );
  } catch {}
}

async function loadIndex() {
  const raw =
    kvGet(KV_INDEX);

  try {
    state.chats =
      raw
        ? JSON.parse(raw)
        : [];
  } catch {
    state.chats = [];
  }

  state.chats.sort(
    (a, b) =>
      b.updated - a.updated
  );
}

async function saveIndex() {
  kvSet(
    KV_INDEX,
    JSON.stringify(
      state.chats
    )
  );
}

async function saveCurrentChat() {
  if (
    !state.currentId ||
    !state.messages.length
  ) {
    return;
  }

  const existing =
    state.chats.find(
      (chat) =>
        chat.id ===
        state.currentId
    );

  const firstUser =
    state.messages.find(
      (message) =>
        message.role === 'user'
    );

  const title =
    existing?.title &&
    existing.title !==
      'New chat'
      ? existing.title
      : firstUser
        ? String(
            firstUser.content ||
              ''
          )
            .replace(
              /\s+/g,
              ' '
            )
            .slice(0, 42) ||
          'New chat'
        : 'New chat';

  const meta = {
    id: state.currentId,
    title,
    updated: Date.now()
  };

  const index =
    state.chats.findIndex(
      (chat) =>
        chat.id ===
        state.currentId
    );

  if (index >= 0) {
    state.chats[index] =
      meta;
  } else {
    state.chats.unshift(
      meta
    );
  }

  state.chats.sort(
    (a, b) =>
      b.updated - a.updated
  );

  kvSet(
    KV_PREFIX +
      state.currentId,
    JSON.stringify(
      state.messages
    )
  );

  await saveIndex();

  renderChatList();
}

async function loadChat(id) {
  const raw =
    kvGet(
      KV_PREFIX + id
    );

  try {
    state.messages =
      raw
        ? JSON.parse(raw)
        : [];
  } catch {
    state.messages = [];
  }

  state.currentId = id;
  state.attachments = [];

  renderAttachments();
  renderMessages();
  renderChatList();
  closeSidebarMobile();
}

async function deleteChat(id) {
  kvDel(
    KV_PREFIX + id
  );

  state.chats =
    state.chats.filter(
      (chat) =>
        chat.id !== id
    );

  await saveIndex();

  if (
    state.currentId === id
  ) {
    newChat();
  }

  renderChatList();
}

function newChat() {
  if (currentController) {
    try {
      currentController.abort();
    } catch {}
  }

  currentController = null;
  generating = false;

  state.currentId = uid();
  state.messages = [];
  state.attachments = [];
  state.imgMode = false;

  updateImageModeUI();

  renderAttachments();
  renderMessages();
  renderChatList();

  if (el.input) {
    el.input.value = '';
    autoGrow();
    el.input.focus();
  }

  closeSidebarMobile();
}

/* ============================================================
   SIDEBAR
   ============================================================ */

function renderChatList() {
  if (!el.chatList) return;

  if (!state.chats.length) {
    el.chatList.innerHTML = `
      <div class="px-3 py-6 text-center text-xs text-slate-600">
        No chats yet.<br>
        Start a conversation!
      </div>
    `;

    return;
  }

  el.chatList.innerHTML =
    state.chats
      .map(
        (chat) => `
          <div
            data-id="${esc(chat.id)}"
            class="chat-item group flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition ${
              chat.id ===
              state.currentId
                ? 'bg-white/10 text-white'
                : 'text-slate-400 hover:bg-white/5'
            }"
          >
            <i
              data-lucide="message-square"
              class="h-4 w-4 shrink-0 opacity-70"
            ></i>

            <span class="min-w-0 flex-1 truncate">
              ${esc(chat.title)}
            </span>

            <button
              type="button"
              data-del="${esc(chat.id)}"
              class="shrink-0 text-slate-600 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
            >
              <i
                data-lucide="trash-2"
                class="h-3.5 w-3.5"
              ></i>
            </button>
          </div>
        `
      )
      .join('');

  icon();

  el.chatList
    .querySelectorAll(
      '.chat-item'
    )
    .forEach((row) => {
      row.addEventListener(
        'click',
        (event) => {
          if (
            event.target.closest(
              '[data-del]'
            )
          ) {
            return;
          }

          loadChat(
            row.dataset.id
          );
        }
      );
    });

  el.chatList
    .querySelectorAll(
      '[data-del]'
    )
    .forEach((button) => {
      button.addEventListener(
        'click',
        (event) => {
          event.stopPropagation();

          deleteChat(
            button.dataset.del
          );
        }
      );
    });
}

/* ============================================================
   MESSAGE RENDERING
   ============================================================ */

function renderMessages() {
  if (
    !el.messages ||
    !el.welcome
  ) {
    return;
  }

  if (!state.messages.length) {
    el.welcome.classList.remove(
      'hidden'
    );

    el.messages.classList.add(
      'hidden'
    );

    el.messages.innerHTML =
      '';

    return;
  }

  el.welcome.classList.add(
    'hidden'
  );

  el.messages.classList.remove(
    'hidden'
  );

  el.messages.innerHTML =
    '';

  for (
    const message of state.messages
  ) {
    el.messages.appendChild(
      buildMessageEl(message)
    );
  }

  icon();
  scrollBottom();
}

function buildMessageEl(message) {
  const row =
    document.createElement('div');

  row.className =
    'msg-in mb-6 flex gap-3 ' +
    (
      message.role === 'user'
        ? 'flex-row-reverse'
        : ''
    );

  const avatar =
    document.createElement('div');

  avatar.className =
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ' +
    (
      message.role === 'user'
        ? 'bg-white/10'
        : 'bg-brand/15'
    );

  avatar.innerHTML =
    message.role === 'user'
      ? `
        <i
          data-lucide="user"
          class="h-4 w-4 text-slate-300"
        ></i>
      `
      : `
        <svg viewBox="0 0 64 64" class="h-5 w-5">
          <path
            d="M20 16h9a16 16 0 0 1 0 32h-9z"
            fill="none"
            stroke="#facc15"
            stroke-width="7"
            stroke-linejoin="round"
          />
          <circle
            cx="30"
            cy="32"
            r="5"
            fill="#facc15"
          />
        </svg>
      `;

  const body =
    document.createElement('div');

  body.className =
    'min-w-0 flex-1 ' +
    (
      message.role === 'user'
        ? 'flex flex-col items-end'
        : ''
    );

  const bubble =
    document.createElement('div');

  if (
    message.role === 'user'
  ) {
    bubble.className =
      'inline-block max-w-full rounded-2xl rounded-tr-md bg-white/10 px-4 py-2.5 text-[15px] leading-relaxed text-slate-100 whitespace-pre-wrap break-words';

    bubble.textContent =
      message.content ||
      '';
  } else {
    bubble.className =
      'prose-df max-w-none';

    bubble.appendChild(
      renderMarkdown(
        message.content ||
          ''
      )
    );
  }

  body.appendChild(bubble);

  /* ----------------------------------------------------------
     WEB SOURCES
     ---------------------------------------------------------- */

  const sources =
    normalizeSources(
      message.sources
    );

  if (
    message.role === 'assistant' &&
    sources.length
  ) {
    const sourceWrap =
      document.createElement('div');

    sourceWrap.className =
      'web-sources mt-3';

    const heading =
      document.createElement('div');

    heading.className =
      'web-sources-title flex items-center gap-1.5 text-xs font-medium text-slate-400';

    heading.innerHTML = `
      <i
        data-lucide="globe-2"
        class="h-3.5 w-3.5 text-brand"
      ></i>

      Sources
    `;

    sourceWrap.appendChild(
      heading
    );

    const list =
      document.createElement('div');

    list.className =
      'web-sources-list mt-1.5 flex flex-col gap-1.5';

    for (
      const source of sources
    ) {
      const link =
        document.createElement('a');

      link.href =
        source.url;

      link.target =
        '_blank';

      link.rel =
        'noopener noreferrer';

      link.className =
        'web-source flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-slate-300 transition hover:border-brand/30 hover:bg-brand/5 hover:text-white';

      const iconEl =
        document.createElement(
          'i'
        );

      iconEl.setAttribute(
        'data-lucide',
        'external-link'
      );

      iconEl.className =
        'web-source-icon h-3.5 w-3.5 shrink-0 text-brand';

      const content =
        document.createElement(
          'div'
        );

      content.className =
        'web-source-content min-w-0 flex-1';

      const title =
        document.createElement(
          'div'
        );

      title.className =
        'web-source-title truncate font-medium';

      title.textContent =
        source.title;

      const domain =
        document.createElement(
          'div'
        );

      domain.className =
        'web-source-domain mt-0.5 truncate text-[10px] text-slate-500';

      domain.textContent =
        source.domain;

      content.appendChild(
        title
      );

      if (source.domain) {
        content.appendChild(
          domain
        );
      }

      link.appendChild(
        iconEl
      );

      link.appendChild(
        content
      );

      list.appendChild(
        link
      );
    }

    if (list.children.length) {
      sourceWrap.appendChild(
        list
      );

      body.appendChild(
        sourceWrap
      );
    }
  }

  /* ----------------------------------------------------------
     IMAGES
     ---------------------------------------------------------- */

  if (
    Array.isArray(
      message.images
    ) &&
    message.images.length
  ) {
    const wrap =
      document.createElement(
        'div'
      );

    wrap.className =
      'mt-3 flex flex-wrap gap-3 ' +
      (
        message.role === 'user'
          ? 'justify-end'
          : ''
      );

    for (
      const src of message.images
    ) {
      if (
        typeof src !== 'string'
      ) {
        continue;
      }

      const image =
        document.createElement(
          'img'
        );

      image.src =
        src;

      image.loading =
        'lazy';

      image.alt =
        'Generated image';

      image.className =
        'gen-img max-h-[520px] max-w-full rounded-xl border border-white/10 object-contain shadow-lg';

      image.addEventListener(
        'click',
        () => {
          try {
            window.open(
              src,
              '_blank',
              'noopener,noreferrer'
            );
          } catch {}
        }
      );

      wrap.appendChild(
        image
      );
    }

    body.appendChild(
      wrap
    );
  }

  /* ----------------------------------------------------------
     FILES
     ---------------------------------------------------------- */

  if (
    Array.isArray(
      message.files
    ) &&
    message.files.length
  ) {
    const wrap =
      document.createElement(
        'div'
      );

    wrap.className =
      'mt-2 flex flex-wrap gap-2';

    for (
      const name of message.files
    ) {
      const chip =
        document.createElement(
          'div'
        );

      chip.className =
        'flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-300';

      chip.innerHTML = `
        <i
          data-lucide="file-text"
          class="h-3.5 w-3.5 text-brand"
        ></i>
        ${esc(name)}
      `;

      wrap.appendChild(
        chip
      );
    }

    body.appendChild(
      wrap
    );
  }

  /* ----------------------------------------------------------
     ASSISTANT ACTIONS
     ---------------------------------------------------------- */

  if (
    message.role === 'assistant' &&
    message.content
  ) {
    const actions =
      document.createElement(
        'div'
      );

    actions.className =
      'msg-actions mt-1.5 flex items-center gap-1';

    actions.innerHTML = `
      <button type="button" data-act="copy">
        <i
          data-lucide="copy"
          class="h-3.5 w-3.5"
        ></i>
        Copy
      </button>

      <button type="button" data-act="regen">
        <i
          data-lucide="refresh-cw"
          class="h-3.5 w-3.5"
        ></i>
        Regenerate
      </button>
    `;

    actions
      .querySelector(
        '[data-act="copy"]'
      )
      ?.addEventListener(
        'click',
        async () => {
          try {
            await navigator.clipboard.writeText(
              message.content
            );

            toast('Copied');
          } catch {
            toast(
              'Could not copy'
            );
          }
        }
      );

    actions
      .querySelector(
        '[data-act="regen"]'
      )
      ?.addEventListener(
        'click',
        () => {
          regenerate(
            message
          );
        }
      );

    body.appendChild(
      actions
    );
  }

  row.appendChild(
    avatar
  );

  row.appendChild(
    body
  );

  return row;
}

/* ============================================================
   COMPOSER
   ============================================================ */

function autoGrow() {
  if (!el.input) return;

  el.input.style.height =
    'auto';

  el.input.style.height =
    Math.min(
      el.input.scrollHeight,
      176
    ) + 'px';
}

el.input?.addEventListener(
  'input',
  autoGrow
);

el.input?.addEventListener(
  'keydown',
  (event) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {
      event.preventDefault();
      onSend();
    }
  }
);

el.sendBtn?.addEventListener(
  'click',
  onSend
);

el.stopBtn?.addEventListener(
  'click',
  stopGeneration
);

/* ============================================================
   STOP
   ============================================================ */

function stopGeneration() {
  if (!generating) return;

  if (currentController) {
    try {
      currentController.abort();
    } catch {}
  }

  currentController = null;
  generating = false;

  el.sendBtn?.classList.remove(
    'hidden'
  );

  el.stopBtn?.classList.add(
    'hidden'
  );

  toast(
    state.web
      ? 'Web search stopped'
      : 'Generation stopped'
  );
}

/* ============================================================
   IMAGE MODE
   ============================================================ */

function updateImageModeUI() {
  if (!el.imgBtn) return;

  el.imgBtn.classList.toggle(
    'text-brand',
    state.imgMode
  );

  el.imgBtn.classList.toggle(
    'bg-brand/10',
    state.imgMode
  );

  el.imgBtn.classList.toggle(
    'border-brand/40',
    state.imgMode
  );

  el.imgHint?.classList.toggle(
    'hidden',
    !state.imgMode
  );

  if (el.input) {
    if (state.imgMode) {
      el.input.placeholder =
        'Describe an image to generate…';
    } else if (state.web) {
      el.input.placeholder =
        'Search the web with defgodqe…';
    } else {
      el.input.placeholder =
        'Message defgodqe…';
    }
  }
}

el.imgBtn?.addEventListener(
  'click',
  () => {
    if (generating) return;

    state.imgMode =
      !state.imgMode;

    /*
     * Image mode and web search
     * are mutually exclusive.
     */

    if (state.imgMode) {
      state.web = false;
      updateWebButton();
      saveSettings();
    }

    updateImageModeUI();

    toast(
      state.imgMode
        ? 'Image mode on'
        : 'Image mode off'
    );
  }
);

/* ============================================================
   ATTACHMENTS
   ============================================================ */

el.attachBtn?.addEventListener(
  'click',
  () => {
    el.fileInput?.click();
  }
);

el.fileInput?.addEventListener(
  'change',
  async (event) => {
    const files =
      Array.from(
        event.target.files || []
      );

    for (
      const file of files
    ) {
      await addAttachment(
        file
      );
    }

    event.target.value = '';

    renderAttachments();
  }
);

async function addAttachment(file) {
  const isImage =
    file.type.startsWith(
      'image/'
    );

  const attachment = {
    name: file.name,
    type: file.type,
    kind: isImage
      ? 'image'
      : 'text'
  };

  try {
    if (isImage) {
      attachment.dataUrl =
        await readAsDataURL(
          file
        );
    } else {
      const text =
        await file.text();

      attachment.text =
        text.slice(
          0,
          200000
        );
    }
  } catch (error) {
    console.error(
      'Attachment error:',
      error
    );

    attachment.text =
      '';
  }

  state.attachments.push(
    attachment
  );
}

function readAsDataURL(file) {
  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onload = () =>
        resolve(
          reader.result
        );

      reader.onerror =
        reject;

      reader.readAsDataURL(
        file
      );
    }
  );
}

function renderAttachments() {
  if (!el.attachRow) return;

  if (
    !state.attachments.length
  ) {
    el.attachRow.classList.add(
      'hidden'
    );

    el.attachRow.innerHTML =
      '';

    return;
  }

  el.attachRow.classList.remove(
    'hidden'
  );

  el.attachRow.innerHTML =
    state.attachments
      .map(
        (
          attachment,
          index
        ) =>
          attachment.kind ===
          'image'
            ? `
              <div class="relative">
                <img
                  src="${esc(
                    attachment.dataUrl
                  )}"
                  class="h-16 w-16 rounded-lg border border-white/10 object-cover"
                />

                <button
                  type="button"
                  data-rm="${index}"
                  class="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-card border border-white/10 text-slate-300 hover:text-red-400"
                >
                  <i
                    data-lucide="x"
                    class="h-3 w-3"
                  ></i>
                </button>
              </div>
            `
            : `
              <div
                class="relative flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 pr-6 text-xs text-slate-300"
              >
                <i
                  data-lucide="file-text"
                  class="h-4 w-4 text-brand"
                ></i>

                ${esc(
                  attachment.name
                )}

                <button
                  type="button"
                  data-rm="${index}"
                  class="absolute right-1 top-1 text-slate-500 hover:text-red-400"
                >
                  <i
                    data-lucide="x"
                    class="h-3 w-3"
                  ></i>
                </button>
              </div>
            `
      )
      .join('');

  icon();

  el.attachRow
    .querySelectorAll(
      '[data-rm]'
    )
    .forEach((button) => {
      button.addEventListener(
        'click',
        () => {
          state.attachments.splice(
            Number(
              button.dataset.rm
            ),
            1
          );

          renderAttachments();
        }
      );
    });
}

/* ============================================================
   SUGGESTIONS
   ============================================================ */

function renderSuggestions() {
  if (!el.suggestGrid) return;

  el.suggestGrid.innerHTML =
    SUGGESTIONS.map(
      (suggestion) => `
        <button
          type="button"
          data-text="${esc(
            suggestion.text
          )}"
          class="group flex items-start gap-3 rounded-xl border border-white/10 bg-card px-4 py-3 text-left transition hover:border-brand/40 hover:bg-white/5"
        >
          <i
            data-lucide="${esc(
              suggestion.icon
            )}"
            class="mt-0.5 h-4 w-4 text-brand"
          ></i>

          <div>
            <div class="text-sm font-medium text-white">
              ${esc(
                suggestion.title
              )}
            </div>

            <div class="mt-0.5 text-[13px] leading-snug text-slate-500">
              ${esc(
                suggestion.text
              )}
            </div>
          </div>
        </button>
      `
    )
    .join('');

  icon();

  el.suggestGrid
    .querySelectorAll(
      '[data-text]'
    )
    .forEach((button) => {
      button.addEventListener(
        'click',
        () => {
          if (!el.input) return;

          el.input.value =
            button.dataset.text;

          autoGrow();
          onSend();
        }
      );
    });
}

/* ============================================================
   SYSTEM PROMPT
   ============================================================ */

function buildSystemPrompt() {
  return (
    BASE_SYSTEM +
    `

Current mode: ${state.mode}.

${MODES[state.mode].prompt}

Current date: ${new Date().toDateString()}.
`
  );
}

/* ============================================================
   API MESSAGES
   ============================================================ */

function buildApiMessages() {
  const messages = [
    {
      role: 'system',
      content:
        buildSystemPrompt()
    }
  ];

  const history =
    state.messages.slice(-20);

  for (
    const message of history
  ) {
    messages.push({
      role: message.role,
      content:
        message.apiContent ||
        message.content ||
        ''
    });
  }

  return messages;
}

/* ============================================================
   SEND
   ============================================================ */

async function onSend() {
  if (generating) return;

  const text =
    el.input?.value.trim() ||
    '';

  if (
    !text &&
    !state.attachments.length
  ) {
    return;
  }

  /* ----------------------------------------------------------
     IMAGE MODE
     ---------------------------------------------------------- */

  if (
    state.imgMode &&
    text
  ) {
    el.input.value = '';
    autoGrow();

    await generateImage(
      text
    );

    return;
  }

  /* ----------------------------------------------------------
     ATTACHMENTS
     ---------------------------------------------------------- */

  const attachments =
    state.attachments.slice();

  state.attachments = [];

  renderAttachments();

  const images =
    attachments.filter(
      (a) =>
        a.kind === 'image'
    );

  const textFiles =
    attachments.filter(
      (a) =>
        a.kind === 'text'
    );

  const userMessage = {
    role: 'user',
    content: text
  };

  if (images.length) {
    userMessage.images =
      images.map(
        (image) =>
          image.dataUrl
      );
  }

  if (textFiles.length) {
    userMessage.files =
      textFiles.map(
        (file) =>
          file.name
      );
  }

  let apiContent =
    text || '';

  if (textFiles.length) {
    apiContent +=
      textFiles
        .map(
          (file) => `

[Attached file: ${file.name}]
${file.text || '[No readable text found]'}
[End of ${file.name}]
`
        )
        .join('');
  }

  if (images.length) {
    apiContent += `

[The user attached ${
      images.length
    } image${
      images.length === 1
        ? ''
        : 's'
    }. The current defgodqe text model cannot see image pixels.]
`;
  }

  userMessage.apiContent =
    apiContent;

  state.messages.push(
    userMessage
  );

  el.input.value = '';
  autoGrow();

  renderMessages();

  /*
   * Web search only uses the
   * actual text query.
   *
   * If there is no text, normal
   * chat handles the attachment.
   */

  if (
    state.web &&
    text
  ) {
    await sendWebSearch(
      text
    );

    return;
  }

  await sendChatRequest();
}

/* ============================================================
   NORMAL CLOUDFLARE CHAT
   ============================================================ */

async function sendChatRequest() {
  if (generating) return;

  generating = true;

  el.sendBtn?.classList.add(
    'hidden'
  );

  el.stopBtn?.classList.remove(
    'hidden'
  );

  const row =
    buildTypingRow();

  el.messages.appendChild(
    row
  );

  scrollBottom(true);

  currentController =
    new AbortController();

  let responseText =
    '';

  try {
    const response =
      await fetch(
        CLOUDFLARE_WORKER_URL,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({
            messages:
              buildApiMessages()
          }),

          signal:
            currentController.signal
        }
      );

    const data =
      await parseJsonResponse(
        response,
        'Cloudflare chat'
      );

    if (!response.ok) {
      throw new Error(
        data?.error ||
        `Worker returned HTTP ${response.status}`
      );
    }

    if (
      data?.success === false
    ) {
      throw new Error(
        data.error ||
        'Cloudflare AI request failed.'
      );
    }

    responseText =
      data?.response ||
      data?.result?.response ||
      '';

    if (!responseText) {
      throw new Error(
        'Cloudflare returned an empty response.'
      );
    }

    updateTypingRow(
      row,
      responseText
    );
  } catch (error) {
    if (
      error?.name ===
      'AbortError'
    ) {
      responseText =
        '_(Generation stopped)_';
    } else {
      console.error(
        'Cloudflare chat error:',
        error
      );

      responseText =
        `⚠️ **I couldn't connect to defgodqe.**

**Error:** \`${error?.message || 'Unknown error'}\`

Make sure your Cloudflare Worker is deployed and that the \`AI\` binding is connected.`;

      toast(
        'Cloudflare connection error'
      );
    }

    updateTypingRow(
      row,
      responseText
    );
  } finally {
    currentController =
      null;
  }

  if (!responseText) {
    responseText =
      '_(No response received)_';
  }

  state.messages.push({
    role: 'assistant',
    content:
      responseText
  });

  generating = false;

  el.sendBtn?.classList.remove(
    'hidden'
  );

  el.stopBtn?.classList.add(
    'hidden'
  );

  renderMessages();

  await saveCurrentChat();
}

/* ============================================================
   WEB SEARCH
   ============================================================ */

async function sendWebSearch(query) {
  if (generating) return;

  query =
    String(query || '')
      .trim();

  if (!query) {
    return sendChatRequest();
  }

  generating = true;

  el.sendBtn?.classList.add(
    'hidden'
  );

  el.stopBtn?.classList.remove(
    'hidden'
  );

  const row =
    buildWebTypingRow();

  el.messages.appendChild(
    row
  );

  scrollBottom(true);

  currentController =
    new AbortController();

  let responseText =
    '';

  let sources = [];

  try {
    const response =
      await fetch(
        CLOUDFLARE_WEB_SEARCH_URL,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({
            query
          }),

          signal:
            currentController.signal
        }
      );

    const data =
      await parseJsonResponse(
        response,
        'Web search'
      );

    if (!response.ok) {
      throw new Error(
        data?.error ||
        `Web search returned HTTP ${response.status}`
      );
    }

    if (
      data?.success === false
    ) {
      throw new Error(
        data?.error ||
        'Web search failed.'
      );
    }

    responseText =
      data?.response ||
      '';

    sources =
      normalizeSources(
        data?.sources ||
        data?.citations ||
        []
      );

    if (!responseText) {
      throw new Error(
        'Web search returned an empty answer.'
      );
    }

    responseText =
      removeSourcesSection(
        responseText
      );

    updateTypingRow(
      row,
      responseText
    );

    if (sources.length) {
      toast(
        `${sources.length} source${
          sources.length === 1
            ? ''
            : 's'
        } found`
      );
    } else {
      toast(
        'Web search complete'
      );
    }
  } catch (error) {
    if (
      error?.name ===
      'AbortError'
    ) {
      responseText =
        '_(Web search stopped)_';
    } else {
      console.error(
        'Web search error:',
        error
      );

      responseText =
        `⚠️ **Web search failed.**

**Error:** \`${error?.message || 'Unknown error'}\`

Make sure your Cloudflare Worker has the \`/web-search\` endpoint configured correctly.`;

      toast(
        'Web search failed'
      );
    }

    updateTypingRow(
      row,
      responseText
    );
  } finally {
    currentController =
      null;
  }

  if (!responseText) {
    responseText =
      '_(No search response received)_';
  }

  state.messages.push({
    role: 'assistant',
    content:
      responseText,
    sources
  });

  generating = false;

  el.sendBtn?.classList.remove(
    'hidden'
  );

  el.stopBtn?.classList.add(
    'hidden'
  );

  renderMessages();

  await saveCurrentChat();
}

/* ============================================================
   RESPONSE PARSER
   ============================================================ */

async function parseJsonResponse(
  response,
  label
) {
  try {
    return await response.json();
  } catch {
    let body = '';

    try {
      body =
        await response
          .clone()
          .text();
    } catch {}

    throw new Error(
      `${label} returned invalid JSON (${response.status}).${
        body
          ? ` ${body.slice(0, 300)}`
          : ''
      }`
    );
  }
}

/* ============================================================
   UPDATE TYPING ROW
   ============================================================ */

function updateTypingRow(
  row,
  text
) {
  if (!row) return;

  const prose =
    row.querySelector(
      '.prose-df'
    );

  if (!prose) return;

  prose.innerHTML = '';

  prose.appendChild(
    renderMarkdown(text)
  );

  icon();

  scrollBottom();
}

/* ============================================================
   REMOVE SOURCES SECTION
   ============================================================ */

function removeSourcesSection(text) {
  const sourceText =
    String(text || '');

  /*
   * Removes a trailing:
   *
   * ## Sources
   *
   * section from the AI answer.
   */

  const match =
    sourceText.match(
      /\n#{1,3}\s*Sources\s*\n/i
    );

  if (!match) {
    return sourceText.trim();
  }

  return sourceText
    .slice(
      0,
      match.index
    )
    .trim();
}

/* ============================================================
   WEB TYPING ROW
   ============================================================ */

function buildWebTypingRow() {
  const row =
    document.createElement(
      'div'
    );

  row.className =
    'msg-in mb-6 flex gap-3';

  row.innerHTML = `
    <div
      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/15"
    >
      <i
        data-lucide="globe-2"
        class="h-5 w-5 text-brand"
      ></i>
    </div>

    <div class="min-w-0 flex-1">
      <div class="prose-df max-w-none">
        <div class="flex items-center gap-2 py-2 text-sm text-slate-400">
          <span class="typing">
            <span></span>
            <span></span>
            <span></span>
          </span>

          <span>
            Searching the web…
          </span>
        </div>
      </div>
    </div>
  `;

  icon();

  return row;
}

/* ============================================================
   TYPING ROW
   ============================================================ */

function buildTypingRow() {
  const row =
    document.createElement(
      'div'
    );

  row.className =
    'msg-in mb-6 flex gap-3';

  row.innerHTML = `
    <div
      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/15"
    >
      <svg viewBox="0 0 64 64" class="h-5 w-5">
        <path
          d="M20 16h9a16 16 0 0 1 0 32h-9z"
          fill="none"
          stroke="#facc15"
          stroke-width="7"
          stroke-linejoin="round"
        />
        <circle
          cx="30"
          cy="32"
          r="5"
          fill="#facc15"
        />
      </svg>
    </div>

    <div class="min-w-0 flex-1">
      <div class="prose-df max-w-none">
        <div class="typing py-2">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  `;

  return row;
}

/* ============================================================
   REGENERATE
   ============================================================ */

async function regenerate(message) {
  if (generating) return;

  const index =
    state.messages.indexOf(
      message
    );

  if (index < 0) return;

  /*
   * Remove the selected assistant
   * response and anything after it.
   */

  state.messages =
    state.messages.slice(
      0,
      index
    );

  renderMessages();

  const lastUser =
    [...state.messages]
      .reverse()
      .find(
        (item) =>
          item.role === 'user'
      );

  if (
    state.web &&
    lastUser?.content
  ) {
    await sendWebSearch(
      lastUser.content
    );

    return;
  }

  await sendChatRequest();
}

/* ============================================================
   IMAGE GENERATION
   ============================================================ */

async function generateImage(
  prompt
) {
  if (generating) return;

  generating = true;

  el.sendBtn?.classList.add(
    'hidden'
  );

  el.stopBtn?.classList.remove(
    'hidden'
  );

  const userMessage = {
    role: 'user',
    content:
      '🎨 ' + prompt
  };

  state.messages.push(
    userMessage
  );

  renderMessages();

  const typing =
    buildTypingRow();

  el.messages.appendChild(
    typing
  );

  scrollBottom(true);

  currentController =
    new AbortController();

  try {
    const response =
      await fetch(
        CLOUDFLARE_IMAGE_URL,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({
            prompt
          }),

          signal:
            currentController.signal
        }
      );

    const data =
      await parseJsonResponse(
        response,
        'Image Worker'
      );

    if (!response.ok) {
      throw new Error(
        data?.error ||
        `Image Worker returned HTTP ${response.status}`
      );
    }

    if (
      data?.success === false
    ) {
      throw new Error(
        data.error ||
        'Image generation failed.'
      );
    }

    if (!data?.image) {
      throw new Error(
        'Cloudflare returned no image.'
      );
    }

    const mime =
      data.mimeType ||
      'image/jpeg';

    const imageSrc =
      String(
        data.image
      ).startsWith(
        'data:'
      )
        ? data.image
        : `data:${mime};base64,${data.image}`;

    state.messages.push({
      role: 'assistant',
      content:
        '🎨 **Here is your generated image:**',
      images: [
        imageSrc
      ]
    });

    toast(
      'Image generated'
    );
  } catch (error) {
    if (
      error?.name ===
      'AbortError'
    ) {
      state.messages.push({
        role: 'assistant',
        content:
          '_(Image generation stopped)_'
      });
    } else {
      console.error(
        'Image generation error:',
        error
      );

      state.messages.push({
        role: 'assistant',
        content:
          `⚠️ **Image generation failed.**

**Error:** \`${error?.message || 'Unknown error'}\`

Make sure the Cloudflare Worker has the \`/generate-image\` endpoint and the \`AI\` binding enabled.`
      });

      toast(
        'Image generation failed'
      );
    }
  } finally {
    currentController =
      null;

    generating = false;

    el.sendBtn?.classList.remove(
      'hidden'
    );

    el.stopBtn?.classList.add(
      'hidden'
    );

    renderMessages();

    await saveCurrentChat();
  }
}

/* ============================================================
   AUTH
   ============================================================ */

function refreshAuth() {
  state.signedIn = false;

  if (el.userName) {
    el.userName.textContent =
      'Local';
  }

  if (el.signBtn) {
    el.signBtn.textContent =
      'Local';

    el.signBtn.disabled =
      true;

    el.signBtn.classList.add(
      'opacity-60',
      'cursor-default'
    );
  }
}

/* ============================================================
   MOBILE SIDEBAR
   ============================================================ */

function openSidebarMobile() {
  el.sidebar?.classList.add(
    'open'
  );

  el.backdrop?.classList.remove(
    'hidden'
  );
}

function closeSidebarMobile() {
  el.sidebar?.classList.remove(
    'open'
  );

  el.backdrop?.classList.add(
    'hidden'
  );
}

el.openSidebar?.addEventListener(
  'click',
  openSidebarMobile
);

el.closeSidebar?.addEventListener(
  'click',
  closeSidebarMobile
);

el.backdrop?.addEventListener(
  'click',
  closeSidebarMobile
);

el.newChatBtn?.addEventListener(
  'click',
  newChat
);

/* ============================================================
   VOICE
   ============================================================ */

const voice = {
  active: false,
  listening: false,
  speaking: false,
  muted: false,
  handsFree: false,
  busy: false,

  recog: null,
  raf: null,
  ctx: null,

  particles: [],
  arcs: [],

  t: 0,
  energy: 0.15,
  targetEnergy: 0.15,

  availableVoices: [],
  selectedVoice: null,
  selectedLanguage: 'auto',

  mode: 'idle'
};

/* ============================================================
   LANGUAGE
   ============================================================ */

function detectLanguage(text) {
  const value =
    String(text || '')
      .toLowerCase();

  const spanish =
    /\b(el|la|los|las|un|una|que|qué|de|del|y|o|pero|porque|para|con|por|como|cómo|cuando|donde|quien|es|son|está|hola|gracias|quiero|puedo|puedes|tengo|hacer|ayuda|necesito|dime|esto|eso|más|ahora|mañana|hoy|sí)\b/i;

  const spanishChars =
    /[áéíóúüñ¿¡]/i;

  return (
    spanish.test(value) ||
    spanishChars.test(value)
  )
    ? 'es'
    : 'en';
}

function languageFamily(lang) {
  return String(lang || '')
    .toLowerCase()
    .split('-')[0];
}

function voiceKey(v) {
  return [
    v.name,
    v.lang,
    v.voiceURI
  ].join('|');
}

function isEnglishVoice(v) {
  return (
    languageFamily(
      v?.lang
    ) === 'en'
  );
}

function isSpanishVoice(v) {
  return (
    languageFamily(
      v?.lang
    ) === 'es'
  );
}

function voiceScore(v) {
  const name =
    String(
      v.name || ''
    ).toLowerCase();

  let score = 0;

  [
    'google',
    'microsoft',
    'natural',
    'neural',
    'premium',
    'enhanced',
    'siri',
    'samantha',
    'alex',
    'aria',
    'jenny',
    'monica',
    'paulina',
    'jorge',
    'sofia'
  ].forEach(
    (
      part,
      index
    ) => {
      if (
        name.includes(part)
      ) {
        score +=
          100 -
          index * 3;
      }
    }
  );

  if (
    v.lang?.toLowerCase() ===
    'en-us'
  ) {
    score += 30;
  }

  if (
    v.lang?.toLowerCase() ===
    'es-us'
  ) {
    score += 35;
  }

  if (
    v.lang?.toLowerCase() ===
    'es-mx'
  ) {
    score += 32;
  }

  if (v.localService) {
    score += 5;
  }

  return score;
}

/* ============================================================
   VOICE LIST
   ============================================================ */

function loadVoices() {
  if (
    !('speechSynthesis' in window)
  ) {
    return;
  }

  const voices =
    speechSynthesis.getVoices();

  if (!voices.length) {
    return;
  }

  voice.availableVoices =
    voices
      .slice()
      .sort(
        (a, b) =>
          voiceScore(b) -
          voiceScore(a)
      );

  buildVoiceSelector();
}

function buildVoiceSelector() {
  if (!el.voiceSelect) {
    return;
  }

  const previous =
    el.voiceSelect.value;

  const english =
    voice.availableVoices.filter(
      isEnglishVoice
    );

  const spanish =
    voice.availableVoices.filter(
      isSpanishVoice
    );

  let html = `
    <option value="auto">
      Auto — English / Spanish
    </option>
  `;

  if (english.length) {
    html += `
      <option disabled>
        ── English voices ──
      </option>
    `;

    for (
      const v of english
    ) {
      html += `
        <option value="${esc(
          voiceKey(v)
        )}">
          🇺🇸 ${esc(
            v.name
          )} · ${esc(
            v.lang
          )}
        </option>
      `;
    }
  }

  if (spanish.length) {
    html += `
      <option disabled>
        ── Spanish voices ──
      </option>
    `;

    for (
      const v of spanish
    ) {
      html += `
        <option value="${esc(
          voiceKey(v)
        )}">
          🇪🇸 ${esc(
            v.name
          )} · ${esc(
            v.lang
          )}
        </option>
      `;
    }
  }

  el.voiceSelect.innerHTML =
    html;

  if (
    previous &&
    Array.from(
      el.voiceSelect.options
    ).some(
      (option) =>
        option.value ===
        previous
    )
  ) {
    el.voiceSelect.value =
      previous;
  } else {
    el.voiceSelect.value =
      'auto';
  }

  updateSelectedVoice();
}

function updateSelectedVoice() {
  if (!el.voiceSelect) {
    voice.selectedVoice =
      null;

    voice.selectedLanguage =
      'auto';

    return;
  }

  const value =
    el.voiceSelect.value;

  if (
    !value ||
    value === 'auto'
  ) {
    voice.selectedVoice =
      null;

    voice.selectedLanguage =
      'auto';

    return;
  }

  voice.selectedVoice =
    voice.availableVoices.find(
      (v) =>
        voiceKey(v) ===
        value
    ) || null;

  voice.selectedLanguage =
    languageFamily(
      voice.selectedVoice?.lang
    );
}

function getBestVoice(
  language
) {
  const family =
    languageFamily(
      language
    );

  if (
    voice.selectedVoice &&
    languageFamily(
      voice.selectedVoice.lang
    ) === family
  ) {
    return voice.selectedVoice;
  }

  return (
    voice.availableVoices.find(
      (v) =>
        languageFamily(
          v.lang
        ) === family
    ) || null
  );
}

/* ============================================================
   VOICE SPHERE
   ============================================================ */

function initVoiceSphere() {
  if (
    voice.ctx ||
    !el.vCanvas
  ) {
    return;
  }

  voice.ctx =
    el.vCanvas.getContext(
      '2d'
    );

  for (
    let i = 0;
    i < 450;
    i++
  ) {
    const u =
      Math.random();

    const v =
      Math.random();

    voice.particles.push({
      theta:
        Math.PI *
        2 *
        u,

      phi:
        Math.acos(
          2 * v - 1
        ),

      radius:
        0.75 +
        Math.random() *
          0.3,

      speed:
        0.2 +
        Math.random() *
          0.8,

      size:
        0.6 +
        Math.random() *
          1.7,

      hue:
        38 +
        Math.random() *
          18,

      phase:
        Math.random() *
        Math.PI *
        2
    });
  }

  for (
    let i = 0;
    i < 5;
    i++
  ) {
    voice.arcs.push({
      phase:
        Math.random() *
        Math.PI *
        2,

      speed:
        0.2 +
        Math.random() *
          0.5,

      radius:
        0.65 +
        Math.random() *
          0.3
    });
  }
}

function drawVoiceSphere() {
  const ctx =
    voice.ctx;

  if (
    !ctx ||
    !el.vCanvas
  ) {
    return;
  }

  const width =
    el.vCanvas.width;

  const height =
    el.vCanvas.height;

  const cx =
    width / 2;

  const cy =
    height / 2;

  const e =
    voice.energy;

  const radius =
    width *
    0.34 *
    (1 + e * 0.12);

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  ctx.globalCompositeOperation =
    'lighter';

  const glow =
    ctx.createRadialGradient(
      cx,
      cy,
      0,
      cx,
      cy,
      radius * 1.5
    );

  glow.addColorStop(
    0,
    `rgba(255,245,190,${0.6 + e * 0.3})`
  );

  glow.addColorStop(
    0.3,
    `rgba(255,205,70,${0.3 + e * 0.2})`
  );

  glow.addColorStop(
    1,
    'rgba(255,170,20,0)'
  );

  ctx.fillStyle =
    glow;

  ctx.beginPath();

  ctx.arc(
    cx,
    cy,
    radius * 1.5,
    0,
    Math.PI * 2
  );

  ctx.fill();

  const rotation =
    voice.t *
    (0.3 + e);

  for (
    const particle of
      voice.particles
  ) {
    const theta =
      particle.theta +
      rotation *
        particle.speed;

    const sinPhi =
      Math.sin(
        particle.phi
      );

    const x =
      sinPhi *
      Math.cos(theta);

    const y =
      Math.cos(
        particle.phi
      );

    const z =
      sinPhi *
      Math.sin(theta);

    const depth =
      (z + 1) / 2;

    const scale =
      0.65 +
      depth * 0.5;

    const px =
      cx +
      x *
        radius *
        particle.radius *
        scale;

    const py =
      cy +
      y *
        radius *
        particle.radius *
        scale;

    const twinkle =
      0.55 +
      Math.sin(
        voice.t * 3 +
        particle.phase
      ) *
        0.35;

    const alpha =
      Math.min(
        1,
        (0.2 +
          depth * 0.8) *
          twinkle *
          (0.5 + e)
      );

    ctx.fillStyle =
      `hsla(${particle.hue},100%,70%,${alpha})`;

    ctx.beginPath();

    ctx.arc(
      px,
      py,
      particle.size *
        scale *
        (0.8 + e),
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  ctx.globalCompositeOperation =
    'source-over';
}

function voiceOrbLoop() {
  voice.t +=
    0.016;

  if (
    voice.mode ===
    'talk'
  ) {
    voice.targetEnergy =
      0.75 +
      Math.random() *
        0.25;
  } else if (
    voice.mode ===
    'listen'
  ) {
    voice.targetEnergy =
      0.45 +
      Math.sin(
        voice.t * 4
      ) *
        0.1;
  } else if (
    voice.mode ===
    'think'
  ) {
    voice.targetEnergy =
      0.35 +
      Math.sin(
        voice.t * 2.5
      ) *
        0.1;
  } else {
    voice.targetEnergy =
      0.16 +
      Math.sin(
        voice.t * 1.3
      ) *
        0.04;
  }

  voice.energy +=
    (
      voice.targetEnergy -
      voice.energy
    ) *
    0.08;

  drawVoiceSphere();

  voice.raf =
    requestAnimationFrame(
      voiceOrbLoop
    );
}

function voiceMode(mode) {
  voice.mode =
    mode;
}

function voiceStatus(
  text,
  className =
    'text-brand'
) {
  if (!el.vStatus) return;

  el.vStatus.className =
    `mt-8 text-sm font-medium ${className}`;

  el.vStatus.textContent =
    text;
}

/* ============================================================
   OPEN / CLOSE VOICE
   ============================================================ */

function openVoice() {
  voice.active =
    true;

  initVoiceSphere();
  loadVoices();

  el.voiceOverlay?.classList.remove(
    'hidden'
  );

  el.voiceOverlay?.classList.add(
    'show'
  );

  voiceMode(
    'idle'
  );

  cancelAnimationFrame(
    voice.raf
  );

  voiceOrbLoop();

  updateSelectedVoice();

  voiceStatus(
    voice.selectedLanguage ===
      'es'
      ? 'Ready — Spanish voice'
      : 'Ready — English voice'
  );

  if (el.vCaption) {
    el.vCaption.textContent =
      state.messages.length
        ? ''
        : "Hi, I'm defgodqe. Ask me anything.";
  }
}

function closeVoice() {
  voice.active =
    false;

  voice.busy =
    false;

  stopSpeaking();

  if (
    voice.listening &&
    voice.recog
  ) {
    try {
      voice.recog.stop();
    } catch {}
  }

  voice.listening =
    false;

  cancelAnimationFrame(
    voice.raf
  );

  el.voiceOverlay?.classList.remove(
    'show'
  );

  el.voiceOverlay?.classList.add(
    'hidden'
  );
}

/* ============================================================
   TEXT TO SPEECH
   ============================================================ */

function cleanSpeechText(
  text
) {
  return String(text || '')
    .replace(
      /```[\s\S]*?```/g,
      ' code shown in chat '
    )
    .replace(
      /\[([^\]]+)\]\([^)]+\)/g,
      '$1'
    )
    .replace(
      /[*_#>`]/g,
      ''
    )
    .replace(
      /\s+/g,
      ' '
    )
    .trim();
}

function splitSpeech(
  text,
  max = 240
) {
  const normalized =
    text
      .replace(
        /\s+/g,
        ' '
      )
      .trim();

  if (
    normalized.length <=
    max
  ) {
    return [
      normalized
    ];
  }

  const sentences =
    normalized.match(
      /[^.!?]+[.!?]+|[^.!?]+$/g
    ) || [
      normalized
    ];

  const chunks = [];

  let current =
    '';

  for (
    const sentence of
      sentences
  ) {
    const clean =
      sentence.trim();

    if (
      (
        current +
        ' ' +
        clean
      )
        .trim()
        .length <= max
    ) {
      current =
        (
          current +
          ' ' +
          clean
        ).trim();
    } else {
      if (current) {
        chunks.push(
          current
        );
      }

      current =
        clean;
    }
  }

  if (current) {
    chunks.push(
      current
    );
  }

  return chunks;
}

function stopSpeaking() {
  if (
    'speechSynthesis' in
    window
  ) {
    speechSynthesis.cancel();
  }

  voice.speaking =
    false;

  if (el.vStop) {
    el.vStop.disabled =
      true;
  }

  if (
    voice.active &&
    !voice.listening
  ) {
    voiceMode(
      'idle'
    );
  }
}

async function speak(
  text
) {
  const clean =
    cleanSpeechText(
      text
    );

  if (
    !clean ||
    voice.muted ||
    !(
      'speechSynthesis' in
      window
    )
  ) {
    return;
  }

  updateSelectedVoice();

  const language =
    voice.selectedLanguage ===
    'es'
      ? 'es'
      : voice.selectedLanguage ===
          'en'
        ? 'en'
        : detectLanguage(
            clean
          );

  const selected =
    getBestVoice(
      language
    );

  const chunks =
    splitSpeech(
      clean.slice(
        0,
        6000
      )
    );

  voice.speaking =
    true;

  if (el.vStop) {
    el.vStop.disabled =
      false;
  }

  voiceMode(
    'talk'
  );

  let index =
    0;

  speechSynthesis.cancel();

  return new Promise(
    (resolve) => {
      const next =
        () => {
          if (
            !voice.speaking ||
            voice.muted
          ) {
            resolve();
            return;
          }

          if (
            index >=
            chunks.length
          ) {
            voice.speaking =
              false;

            if (el.vStop) {
              el.vStop.disabled =
                true;
            }

            voiceMode(
              'idle'
            );

            if (
              voice.handsFree &&
              voice.active &&
              !voice.busy
            ) {
              setTimeout(
                () => {
                  if (
                    voice.handsFree &&
                    voice.active &&
                    !voice.speaking &&
                    !voice.listening &&
                    !voice.busy
                  ) {
                    toggleMic();
                  }
                },
                400
              );
            }

            resolve();
            return;
          }

          const utterance =
            new SpeechSynthesisUtterance(
              chunks[index]
            );

          utterance.rate =
            0.98;

          utterance.pitch =
            language ===
            'es'
              ? 1.02
              : 1;

          utterance.volume =
            1;

          utterance.lang =
            selected?.lang ||
            (
              language ===
              'es'
                ? 'es-US'
                : 'en-US'
            );

          if (selected) {
            utterance.voice =
              selected;
          }

          utterance.onend =
            () => {
              index++;

              setTimeout(
                next,
                20
              );
            };

          utterance.onerror =
            () => {
              voice.speaking =
                false;

              if (el.vStop) {
                el.vStop.disabled =
                  true;
              }

              voiceMode(
                'idle'
              );

              resolve();
            };

          speechSynthesis.speak(
            utterance
          );
        };

      next();
    }
  );
}

/* ============================================================
   VOICE → CLOUDFLARE
   ============================================================ */

async function voiceAsk(
  text
) {
  text =
    String(text || '')
      .trim();

  if (
    !text ||
    voice.busy
  ) {
    return;
  }

  voice.busy =
    true;

  stopSpeaking();

  const language =
    detectLanguage(
      text
    );

  if (el.vCaption) {
    el.vCaption.textContent =
      text;
  }

  state.messages.push({
    role: 'user',
    content: text
  });

  renderMessages();

  voiceMode(
    'think'
  );

  voiceStatus(
    language === 'es'
      ? 'Pensando en español…'
      : state.web
        ? 'Searching the web…'
        : 'Thinking…',
    'text-slate-400'
  );

  let answer =
    '';

  let sources =
    [];

  const controller =
    new AbortController();

  try {
    if (state.web) {
      const response =
        await fetch(
          CLOUDFLARE_WEB_SEARCH_URL,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body: JSON.stringify({
              query: text
            }),

            signal:
              controller.signal
          }
        );

      const data =
        await parseJsonResponse(
          response,
          'Voice web search'
        );

      if (!response.ok) {
        throw new Error(
          data?.error ||
          `Web search returned HTTP ${response.status}`
        );
      }

      if (
        data?.success ===
        false
      ) {
        throw new Error(
          data.error ||
          'Web search failed'
        );
      }

      answer =
        data?.response ||
        '';

      sources =
        normalizeSources(
          data?.sources ||
          data?.citations ||
          []
        );

      answer =
        removeSourcesSection(
          answer
        );
    } else {
      /*
       * Add the current voice
       * message to the normal
       * conversation request.
       */

      const response =
        await fetch(
          CLOUDFLARE_WORKER_URL,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body: JSON.stringify({
              messages:
                buildApiMessages()
            }),

            signal:
              controller.signal
          }
        );

      const data =
        await parseJsonResponse(
          response,
          'Voice chat'
        );

      if (!response.ok) {
        throw new Error(
          data?.error ||
          `Worker returned HTTP ${response.status}`
        );
      }

      if (
        data?.success ===
        false
      ) {
        throw new Error(
          data.error ||
          'AI request failed'
        );
      }

      answer =
        data?.response ||
        data?.result?.response ||
        '';
    }

    if (!answer) {
      throw new Error(
        'Empty AI response'
      );
    }

    if (el.vCaption) {
      el.vCaption.textContent =
        cleanSpeechText(
          answer
        );
    }
  } catch (error) {
    console.error(
      'Voice AI error:',
      error
    );

    answer =
      "Sorry, I couldn't connect to defgodqe.";

    if (el.vCaption) {
      el.vCaption.textContent =
        answer;
    }
  }

  state.messages.push({
    role: 'assistant',
    content: answer,
    sources
  });

  renderMessages();

  await saveCurrentChat();

  voice.busy =
    false;

  if (!voice.muted) {
    await speak(
      answer
    );
  }
}

/* ============================================================
   SPEECH RECOGNITION
   ============================================================ */

function initRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return null;
  }

  const recognition =
    new SpeechRecognition();

  updateSelectedVoice();

  recognition.lang =
    voice.selectedVoice?.lang ||
    (
      voice.selectedLanguage ===
      'es'
        ? 'es-US'
        : 'en-US'
    );

  recognition.interimResults =
    true;

  recognition.continuous =
    false;

  let finalText =
    '';

  recognition.onstart =
    () => {
      voice.listening =
        true;

      finalText =
        '';

      el.vMic?.classList.add(
        'ring-4',
        'ring-brand/30'
      );

      voiceMode(
        'listen'
      );

      voiceStatus(
        recognition.lang
          .toLowerCase()
          .startsWith('es')
          ? 'Escuchando español…'
          : 'Listening…'
      );

      if (el.vCaption) {
        el.vCaption.textContent =
          '';
      }
    };

  recognition.onresult =
    (event) => {
      let interim =
        '';

      finalText =
        '';

      for (
        let i = 0;
        i <
        event.results.length;
        i++
      ) {
        const transcript =
          event.results[i][0]
            .transcript;

        if (
          event.results[i]
            .isFinal
        ) {
          finalText +=
            transcript;
        } else {
          interim +=
            transcript;
        }
      }

      if (el.vCaption) {
        el.vCaption.textContent =
          finalText ||
          interim;
      }
    };

  recognition.onerror =
    (event) => {
      console.warn(
        'Speech recognition:',
        event.error
      );

      if (
        event.error ===
        'not-allowed'
      ) {
        voiceStatus(
          'Microphone permission is required',
          'text-slate-400'
        );
      }

      stopListening();
    };

  recognition.onend =
    () => {
      stopListening();

      const text =
        (
          finalText ||
          el.vCaption
            ?.textContent ||
          ''
        ).trim();

      if (text) {
        voiceAsk(
          text
        );
      } else if (
        voice.handsFree &&
        voice.active &&
        !voice.busy
      ) {
        setTimeout(
          () => {
            if (
              voice.handsFree &&
              voice.active &&
              !voice.listening &&
              !voice.busy
            ) {
              toggleMic();
            }
          },
          400
        );
      }
    };

  return recognition;
}

function stopListening() {
  voice.listening =
    false;

  el.vMic?.classList.remove(
    'ring-4',
    'ring-brand/30'
  );

  if (
    !voice.speaking &&
    voice.mode ===
      'listen'
  ) {
    voiceMode(
      'idle'
    );
  }
}

function toggleMic() {
  if (
    voice.listening
  ) {
    try {
      voice.recog?.stop();
    } catch {}

    return;
  }

  if (voice.busy) {
    return;
  }

  voice.recog =
    initRecognition();

  if (!voice.recog) {
    voiceStatus(
      'Voice input is not supported in this browser',
      'text-slate-400'
    );

    return;
  }

  stopSpeaking();

  try {
    voice.recog.start();
  } catch (error) {
    console.warn(
      'Microphone start error:',
      error
    );
  }
}

/* ============================================================
   VOICE SELECTOR
   ============================================================ */

el.voiceSelect?.addEventListener(
  'change',
  () => {
    updateSelectedVoice();

    saveSettings();

    if (
      voice.selectedVoice
    ) {
      toast(
        `Voice: ${voice.selectedVoice.name}`
      );
    } else {
      toast(
        'Voice: Auto'
      );
    }
  }
);

if (
  'speechSynthesis' in
  window
) {
  loadVoices();

  speechSynthesis.addEventListener(
    'voiceschanged',
    loadVoices
  );
}

/* ============================================================
   HANDS FREE
   ============================================================ */

el.vHands?.addEventListener(
  'click',
  () => {
    voice.handsFree =
      !voice.handsFree;

    el.vHands.classList.toggle(
      'bg-brand',
      voice.handsFree
    );

    el.vHands.classList.toggle(
      'text-ink',
      voice.handsFree
    );

    el.vHands.classList.toggle(
      'border-brand',
      voice.handsFree
    );

    el.vHands.classList.toggle(
      'bg-white/5',
      !voice.handsFree
    );

    el.vHands.classList.toggle(
      'text-slate-300',
      !voice.handsFree
    );

    el.vHands.classList.toggle(
      'border-white/10',
      !voice.handsFree
    );

    el.vHands.setAttribute(
      'aria-pressed',
      voice.handsFree
        ? 'true'
        : 'false'
    );

    toast(
      voice.handsFree
        ? 'Hands-free on'
        : 'Hands-free off'
    );

    if (
      voice.handsFree &&
      voice.active &&
      !voice.speaking &&
      !voice.listening &&
      !voice.busy
    ) {
      toggleMic();
    }
  }
);

/* ============================================================
   VOICE BUTTONS
   ============================================================ */

el.voiceBtn?.addEventListener(
  'click',
  openVoice
);

el.voiceClose?.addEventListener(
  'click',
  closeVoice
);

el.vMic?.addEventListener(
  'click',
  toggleMic
);

el.vStop?.addEventListener(
  'click',
  stopSpeaking
);

el.vMute?.addEventListener(
  'click',
  () => {
    voice.muted =
      !voice.muted;

    if (voice.muted) {
      stopSpeaking();
    }

    if (el.vMute) {
      el.vMute.innerHTML =
        voice.muted
          ? `
            <i
              data-lucide="volume-x"
              class="h-5 w-5"
            ></i>
          `
          : `
            <i
              data-lucide="volume-2"
              class="h-5 w-5"
            ></i>
          `;
    }

    el.vMute?.setAttribute(
      'aria-pressed',
      voice.muted
        ? 'true'
        : 'false'
    );

    icon();
  }
);

/* ============================================================
   KEYBOARD
   ============================================================ */

document.addEventListener(
  'keydown',
  (event) => {
    if (
      event.key === 'Escape' &&
      voice.active
    ) {
      closeVoice();
    }
  }
);

/* ============================================================
   INITIALIZATION
   ============================================================ */

async function init() {
  try {
    icon();

    loadSettings();

    buildModelMenu();

    buildModeMenu();

    renderSuggestions();

    refreshAuth();

    await loadIndex();

    renderChatList();

    newChat();

    updateImageModeUI();

    console.log(
      'defgodqe initialized successfully.'
    );

    console.log(
      'Chat Worker:',
      CLOUDFLARE_WORKER_URL
    );

    console.log(
      'Web Search Worker:',
      CLOUDFLARE_WEB_SEARCH_URL
    );

    console.log(
      'Image Worker:',
      CLOUDFLARE_IMAGE_URL
    );
  } catch (error) {
    console.error(
      'defgodqe initialization error:',
      error
    );

    toast(
      'defgodqe failed to initialize'
    );
  }
}

init();
