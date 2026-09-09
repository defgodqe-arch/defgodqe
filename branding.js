/* defgodqe AI branding + launch animation */
(() => {
  const LOGO = 'https://raw.githubusercontent.com/defgodqe-arch/defgodqe-ai/main/Screenshot_2026-02-27_164030.png';
  const FALLBACK_LOGO = new URL('./icon.svg', document.baseURI).href;

  const logoFallback = (img) => {
    if (!img || img.dataset.dfLogoFallback === '1') return;
    img.dataset.dfLogoFallback = '1';
    img.src = FALLBACK_LOGO;
  };

  const launch = document.createElement('div');
  launch.id = 'df-launch';
  launch.innerHTML = `
    <div class="df-launch-grid"></div>
    <div class="df-launch-ring df-launch-ring-a"></div>
    <div class="df-launch-ring df-launch-ring-b"></div>
    <div class="df-launch-scan"></div>
    <div class="df-launch-core">
      <div class="df-launch-logo-wrap">
        <div class="df-launch-pulse"></div>
        <img src="${LOGO}" alt="defgodqe" class="df-launch-logo" draggable="false">
      </div>
      <div class="df-launch-title">DEFGODQE</div>
      <div class="df-launch-status"><span></span> INITIALIZING AI...</div>
    </div>`;
  document.documentElement.appendChild(launch);

  const launchLogo = launch.querySelector('.df-launch-logo');
  if (launchLogo) launchLogo.addEventListener('error', () => logoFallback(launchLogo), { once:true });

  const style = document.createElement('style');
  style.textContent = `
    #df-launch { position:fixed; inset:0; z-index:99999; display:flex; align-items:center; justify-content:center; overflow:hidden; background:#050505; opacity:1; visibility:visible; transition:opacity .65s ease,visibility .65s ease; }
    #df-launch.df-launch-hide { opacity:0; visibility:hidden; pointer-events:none; }
    .df-launch-grid { position:absolute; inset:-50%; background-image:linear-gradient(rgba(250,204,21,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(250,204,21,.055) 1px,transparent 1px); background-size:48px 48px; transform:perspective(500px) rotateX(60deg) translateY(20%); animation:dfGrid 3s linear infinite; }
    .df-launch-ring { position:absolute; width:260px; height:260px; border:1px solid rgba(250,204,21,.22); border-radius:50%; box-shadow:0 0 40px rgba(250,204,21,.08); }
    .df-launch-ring-a { animation:dfSpin 4s linear infinite; }
    .df-launch-ring-b { width:320px; height:320px; border-style:dashed; animation:dfSpinReverse 6s linear infinite; }
    .df-launch-scan { position:absolute; width:70vw; height:1px; background:linear-gradient(90deg,transparent,rgba(250,204,21,.5),transparent); box-shadow:0 0 18px rgba(250,204,21,.35); animation:dfScan 2.2s ease-in-out infinite; }
    .df-launch-core { position:relative; z-index:2; text-align:center; transform:translateY(10px); animation:dfCoreIn 1s cubic-bezier(.16,1,.3,1) forwards; }
    .df-launch-logo-wrap { position:relative; width:118px; height:118px; margin:auto; border-radius:50%; display:grid; place-items:center; }
    .df-launch-logo-wrap:before { content:""; position:absolute; inset:0; border-radius:50%; border:1px solid rgba(250,204,21,.6); box-shadow:0 0 70px rgba(250,204,21,.3),inset 0 0 30px rgba(250,204,21,.12); animation:dfPulse 1.4s ease-in-out infinite; }
    .df-launch-pulse { position:absolute; inset:-18px; border:1px solid rgba(250,204,21,.15); border-radius:50%; animation:dfExpand 1.8s ease-out infinite; }
    .df-launch-logo { width:84px; height:84px; object-fit:cover; border-radius:50%; position:relative; z-index:2; animation:dfLogoFloat 2s ease-in-out infinite; box-shadow:0 0 35px rgba(250,204,21,.35); }
    .df-launch-title { margin-top:28px; font:800 24px/1 system-ui,sans-serif; letter-spacing:.45em; color:#fff; text-shadow:0 0 22px rgba(250,204,21,.45); }
    .df-launch-status { margin-top:12px; color:#94a3b8; font:500 11px/1 system-ui,sans-serif; letter-spacing:.18em; }
    .df-launch-status span { display:inline-block; width:6px; height:6px; margin-right:8px; border-radius:50%; background:#facc15; box-shadow:0 0 12px #facc15; animation:dfBlink 1s infinite; }

    /* ========================================================
       DEFGODQE SIDEBAR REDESIGN
       ======================================================== */
    .sidebar {
      width:292px !important;
      flex:0 0 292px !important;
      background:radial-gradient(circle at 15% 0%,rgba(250,204,21,.09),transparent 30%),linear-gradient(180deg,#0b1019 0%,#080c13 100%) !important;
      border-right:1px solid rgba(255,255,255,.07) !important;
      box-shadow:18px 0 55px rgba(0,0,0,.18);
      position:relative;
      overflow:hidden;
      z-index:50;
    }
    .sidebar::before { content:""; position:absolute; left:0; top:0; width:2px; height:100%; background:linear-gradient(180deg,#facc15,rgba(250,204,21,.08) 42%,transparent 85%); opacity:.8; pointer-events:none; }
    .sidebar > div:first-child { position:relative; margin:10px 10px 8px; padding:11px !important; min-height:62px; border:1px solid rgba(255,255,255,.07); border-radius:16px; background:rgba(255,255,255,.035); box-shadow:inset 0 1px 0 rgba(255,255,255,.04); }
    .sidebar > div:first-child > div:first-child { width:42px !important; height:42px !important; border-radius:13px !important; background:linear-gradient(145deg,#facc15,#ca8a04) !important; box-shadow:0 0 24px rgba(250,204,21,.18); position:relative; }
    .sidebar > div:first-child > div:first-child img { display:none !important; }
    .sidebar > div:first-child > div:first-child::after { content:"D"; position:absolute; inset:0; display:grid; place-items:center; color:#090b10; font:900 22px/1 system-ui,sans-serif; letter-spacing:-.06em; }
    .sidebar > div:first-child .text-sm { font-size:14px !important; letter-spacing:.01em; }
    .sidebar > div:first-child .text-\\[10px\\] { color:#64748b !important; margin-top:2px; }
    #closeSidebar { width:36px; height:36px; display:grid; place-items:center; border-radius:10px; background:rgba(255,255,255,.04); flex-shrink:0; }
    #closeSidebar:hover { background:rgba(250,204,21,.1); color:#facc15 !important; }
    #newChatBtn { min-height:48px; justify-content:center; border:1px solid rgba(250,204,21,.3) !important; background:linear-gradient(135deg,rgba(250,204,21,.16),rgba(250,204,21,.06)) !important; box-shadow:0 8px 28px rgba(250,204,21,.07); font-weight:700 !important; letter-spacing:.01em; transition:all .18s ease; }
    #newChatBtn:hover { border-color:rgba(250,204,21,.55) !important; background:linear-gradient(135deg,rgba(250,204,21,.22),rgba(250,204,21,.09)) !important; transform:translateY(-1px); }
    #newChatBtn i { color:#facc15; }
    .sidebar > .mt-4 { margin:20px 14px 7px !important; padding:0 !important; color:#64748b !important; font-size:10px !important; letter-spacing:.16em !important; }
    #chatList { padding:4px 9px 14px !important; margin-top:0 !important; scrollbar-width:none; min-height:0; }
    #chatList::-webkit-scrollbar { display:none; }
    #chatList > * { border:1px solid transparent; border-radius:12px; margin:3px 0; transition:all .18s ease; }
    #chatList > *:hover { background:rgba(255,255,255,.055) !important; border-color:rgba(255,255,255,.07); transform:translateX(2px); }
    #chatList > * button { transition:color .18s ease,background .18s ease; }
    .sidebar .border-t { border-top-color:rgba(255,255,255,.07) !important; background:linear-gradient(180deg,rgba(255,255,255,.015),rgba(0,0,0,.12)); padding:10px !important; }
    #authRow { padding:9px !important; border:1px solid rgba(255,255,255,.06); background:rgba(255,255,255,.035); border-radius:15px !important; }
    #authRow > div:first-child { width:36px !important; height:36px !important; background:rgba(250,204,21,.1) !important; border:1px solid rgba(250,204,21,.18); }
    #userName { color:#f1f5f9 !important; font-weight:650 !important; }
    #signBtn { border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.045) !important; transition:all .18s ease; }
    #signBtn:hover { border-color:rgba(250,204,21,.35); background:rgba(250,204,21,.1) !important; color:#facc15 !important; }

    /* Mobile-first behavior: sidebar becomes a true drawer instead of shrinking the app. */
    @media (max-width:1023px) {
      .sidebar {
        position:fixed !important;
        left:0 !important;
        top:0 !important;
        bottom:0 !important;
        width:min(310px,88vw) !important;
        max-width:310px !important;
        flex:none !important;
        transform:translate3d(-105%,0,0);
        transition:transform .24s cubic-bezier(.22,1,.36,1),box-shadow .24s ease !important;
        box-shadow:20px 0 70px rgba(0,0,0,.6) !important;
        height:100dvh !important;
        height:100vh !important;
        padding-top:env(safe-area-inset-top) !important;
        padding-bottom:env(safe-area-inset-bottom) !important;
        touch-action:pan-y;
        overscroll-behavior:contain;
      }
      .sidebar.open {
        transform:translate3d(0,0,0) !important;
      }
      .sidebar > div:first-child { margin-top:max(10px,env(safe-area-inset-top)) !important; }
      #closeSidebar { min-width:42px; min-height:42px; }
      #newChatBtn { min-height:50px; }
      #chatList > * { min-height:44px; }
      #chatList > * button { min-height:40px; }
    }

    /* Prevent horizontal overflow and make the chat surface fit narrow phones. */
    @media (max-width:480px) {
      html,body { width:100%; max-width:100%; overflow-x:hidden !important; }
      .sidebar { width:88vw !important; max-width:310px !important; }
      .sidebar > div:first-child { margin-left:8px; margin-right:8px; }
      #chatList { padding-left:7px !important; padding-right:7px !important; }
      #authRow { margin:0 !important; }
      .df-launch-ring { width:210px; height:210px; }
      .df-launch-ring-b { width:260px; height:260px; }
      .df-launch-title { font-size:20px; letter-spacing:.32em; }
      .df-launch-logo-wrap { width:100px; height:100px; }
      .df-launch-logo { width:72px; height:72px; }
    }

    @media (max-height:620px) and (max-width:1023px) {
      .sidebar > div:first-child { min-height:52px; padding:7px !important; }
      .sidebar > div:first-child > div:first-child { width:36px !important; height:36px !important; }
      .sidebar > .mt-4 { margin-top:10px !important; }
      #newChatBtn { min-height:44px; }
      #chatList > * { min-height:40px; }
    }

    .orb { position:relative; }
    .orb .df-brand-orb { position:absolute; inset:10%; width:80%; height:80%; object-fit:cover; border-radius:50%; z-index:2; pointer-events:none; user-select:none; box-shadow:0 0 35px rgba(250,204,21,.35); }
    @keyframes dfCoreIn { from { opacity:0; transform:translateY(30px) scale(.92); filter:blur(10px); } to { opacity:1; transform:none; filter:none; } }
    @keyframes dfPulse { 50% { transform:scale(1.12); opacity:.65; } }
    @keyframes dfExpand { 0% { transform:scale(.7); opacity:.7; } 100% { transform:scale(1.25); opacity:0; } }
    @keyframes dfLogoFloat { 50% { transform:translateY(-4px) scale(1.02); } }
    @keyframes dfSpin { to { transform:rotate(360deg); } }
    @keyframes dfSpinReverse { to { transform:rotate(-360deg); } }
    @keyframes dfGrid { to { transform:perspective(500px) rotateX(60deg) translateY(5%); } }
    @keyframes dfScan { 0%,100% { transform:translateY(-35vh); opacity:0; } 35% { opacity:1; } 65% { opacity:1; } }
    @keyframes dfBlink { 50% { opacity:.25; } }
    @media (prefers-reduced-motion:reduce) { #df-launch * { animation:none!important; } }
  `;
  document.head.appendChild(style);

  function applyBranding() {
    document.querySelectorAll('img[alt="defgodqe logo"]').forEach(img => {
      if (!img.dataset.dfLogoFallback) img.src = LOGO;
      if (!img.dataset.dfLogoErrorBound) {
        img.dataset.dfLogoErrorBound = '1';
        img.addEventListener('error', () => logoFallback(img), { once:true });
      }
    });

    document.querySelectorAll('.orb').forEach(orb => {
      if (orb.querySelector('.df-brand-orb')) return;
      const img = document.createElement('img');
      img.className = 'df-brand-orb'; img.src = LOGO; img.alt = 'defgodqe AI'; img.draggable = false;
      img.addEventListener('error', () => logoFallback(img), { once:true });
      orb.appendChild(img);
    });

    document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach(link => { link.href = FALLBACK_LOGO; });
  }

  const hideLaunch = () => {
    const el = document.getElementById('df-launch');
    if (!el) return;
    el.classList.add('df-launch-hide');
    setTimeout(() => el.remove(), 700);
  };

  applyBranding();
  new MutationObserver(applyBranding).observe(document.documentElement, { childList:true, subtree:true });
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) setTimeout(hideLaunch,250);
  else setTimeout(hideLaunch,2300);
})();
