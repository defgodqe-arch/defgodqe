/* defgodqe — TikTok-style YouTube Shorts doom scroll */
(function () {
  'use strict';
  if (window.__defgodqeDoomScroll) return;
  window.__defgodqeDoomScroll = true;

  const videos = [
    { id: '-Bybm8MNcaA', title: 'Minecraft Shorts Compilation', creator: 'YouTube' },
    { id: 'nK5dVAopN2w', title: 'Best of Minecraft Shorts', creator: 'YouTube' },
    { id: 'X-VK2bbUHus', title: "Minecraft's Most FUNNY Shorts", creator: 'YouTube' }
  ];

  const style = document.createElement('style');
  style.textContent = `
    #dfDoomOverlay{position:fixed;inset:0;z-index:99990;background:#05070b;color:#fff;display:none;overflow:hidden}
    #dfDoomOverlay.df-open{display:block}
    #dfDoomFeed{height:100dvh;width:100%;overflow-y:auto;scroll-snap-type:y mandatory;scroll-behavior:smooth;overscroll-behavior:contain}
    .df-doom-card{position:relative;height:100dvh;width:100%;scroll-snap-align:start;scroll-snap-stop:always;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 35%,#202000 0,#090b10 38%,#030407 100%)}
    .df-doom-video{width:min(100vw,56.25dvh);height:min(100dvh,177.78vw);border:0;background:#000;box-shadow:0 0 45px rgba(250,204,21,.16)}
    .df-doom-shade{position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.42),transparent 25%,transparent 62%,rgba(0,0,0,.72))}
    .df-doom-info{position:absolute;left:18px;right:90px;bottom:28px;max-width:650px;text-shadow:0 2px 8px #000}
    .df-doom-title{font-size:20px;font-weight:800}.df-doom-creator{margin-top:5px;color:#facc15;font-size:13px}
    .df-doom-actions{position:absolute;right:18px;bottom:28px;display:flex;flex-direction:column;gap:12px}
    .df-doom-action,.df-doom-close{width:48px;height:48px;border:1px solid rgba(250,204,21,.45);border-radius:50%;background:rgba(10,13,20,.72);color:#fff;display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(12px);font-size:20px}
    .df-doom-action:hover,.df-doom-close:hover{border-color:#facc15;box-shadow:0 0 20px rgba(250,204,21,.35)}
    .df-doom-close{position:absolute;top:18px;right:18px;z-index:5}
    .df-doom-top{position:absolute;top:20px;left:22px;z-index:5;font-weight:900;letter-spacing:.08em;color:#facc15;text-shadow:0 0 16px rgba(250,204,21,.5)}
    .df-doom-hint{position:absolute;top:50%;right:8px;transform:translateY(-50%);writing-mode:vertical-rl;color:rgba(255,255,255,.55);font-size:11px;letter-spacing:.12em;pointer-events:none}
    @media(max-width:600px){.df-doom-info{bottom:24px;left:14px;right:74px}.df-doom-actions{right:12px;bottom:24px}.df-doom-title{font-size:17px}.df-doom-video{width:100vw;height:100dvh;object-fit:cover}}
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'dfDoomOverlay';
  overlay.innerHTML = `
    <div class="df-doom-top">⚡ DOOM SCROLL</div>
    <button class="df-doom-close" id="dfDoomClose" aria-label="Close doom scroll">×</button>
    <div id="dfDoomFeed"></div>
  `;
  document.body.appendChild(overlay);
  const feed = overlay.querySelector('#dfDoomFeed');

  videos.forEach((v, i) => {
    const card = document.createElement('section');
    card.className = 'df-doom-card';
    card.dataset.index = i;
    card.innerHTML = `
      <iframe class="df-doom-video" title="${v.title}" data-src="https://www.youtube.com/embed/${v.id}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>
      <div class="df-doom-shade"></div>
      <div class="df-doom-info"><div class="df-doom-title">${v.title}</div><div class="df-doom-creator">@${v.creator} • YouTube</div></div>
      <div class="df-doom-actions">
        <button class="df-doom-action" data-open="${v.id}" title="Open on YouTube">▶</button>
        <button class="df-doom-action" data-next title="Next short">↓</button>
      </div>
      ${i === 0 ? '<div class="df-doom-hint">SCROLL TO NEXT</div>' : ''}
    `;
    feed.appendChild(card);
  });

  const frames = [...feed.querySelectorAll('iframe')];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const frame = entry.target;
      if (entry.isIntersecting) frame.src = frame.dataset.src;
      else if (frame.src) frame.src = 'about:blank';
    });
  }, { threshold: 0.7 });
  frames.forEach(f => observer.observe(f));

  function open() {
    overlay.classList.add('df-open');
    document.body.style.overflow = 'hidden';
    feed.scrollTop = 0;
    if (frames[0].src !== frames[0].dataset.src) frames[0].src = frames[0].dataset.src;
  }
  function close() {
    overlay.classList.remove('df-open');
    document.body.style.overflow = '';
    frames.forEach(f => { f.src = 'about:blank'; });
  }
  window.defgodqeDoomScrollOpen = open;
  window.defgodqeDoomScrollClose = close;

  overlay.querySelector('#dfDoomClose').addEventListener('click', close);
  overlay.addEventListener('click', e => {
    const openBtn = e.target.closest('[data-open]');
    if (openBtn) window.open('https://www.youtube.com/watch?v=' + openBtn.dataset.open, '_blank', 'noopener');
    const next = e.target.closest('[data-next]');
    if (next) next.closest('.df-doom-card').nextElementSibling?.scrollIntoView({behavior:'smooth'});
  });
  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('df-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowDown') { e.preventDefault(); feed.scrollBy({top:innerHeight,behavior:'smooth'}); }
    if (e.key === 'ArrowUp') { e.preventDefault(); feed.scrollBy({top:-innerHeight,behavior:'smooth'}); }
  });

  function addSidebarButton() {
    if (document.getElementById('dfDoomBtn')) return true;
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return false;
    const button = document.createElement('button');
    button.id = 'dfDoomBtn';
    button.type = 'button';
    button.title = 'Doom Scroll';
    button.setAttribute('aria-label','Open Doom Scroll');
    button.innerHTML = '<span style="font-size:18px">📱</span><span>Doom scroll</span><span style="margin-left:auto;font-size:10px;opacity:.6">SHORTS</span>';
    button.style.cssText = 'width:calc(100% - 24px);margin:10px 12px;padding:11px 12px;display:flex;align-items:center;gap:10px;border:1px solid rgba(250,204,21,.28);border-radius:12px;background:rgba(250,204,21,.07);color:inherit;cursor:pointer;font-weight:700;text-align:left;';
    button.addEventListener('click', open);
    const newChat = document.getElementById('newChatBtn');
    (newChat?.parentElement || sidebar).after(button);
    return true;
  }
  if (!addSidebarButton()) {
    const mo = new MutationObserver(() => { if (addSidebarButton()) mo.disconnect(); });
    mo.observe(document.body, {childList:true,subtree:true});
  }
})();
