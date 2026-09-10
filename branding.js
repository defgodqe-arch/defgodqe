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
      <div class="df-launch-orb-wrap">
        <div class="df-launch-orb-aura"></div>
        <div class="df-launch-orb"></div>
        <div class="df-launch-orb-glint"></div>
      </div>
      <div class="df-launch-title">DEFGODQE</div>
      <div class="df-launch-status"><span></span> INITIALIZING AI...</div>
    </div>`;
  document.documentElement.appendChild(launch);

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

    .df-launch-orb-wrap { position:relative; width:118px; height:118px; margin:auto; display:grid; place-items:center; }
    .df-launch-orb-aura { position:absolute; inset:-30px; border-radius:50%; background:radial-gradient(circle,rgba(250,204,21,.28) 0%,rgba(250,204,21,.12) 35%,transparent 70%); filter:blur(8px); animation:dfOrbAura 1.8s ease-in-out infinite; }
    .df-launch-orb { position:relative; width:84px; height:84px; border-radius:50%; background:radial-gradient(circle at 35% 30%,#fff8bd 0%,#fef08a 12%,#facc15 42%,#eab308 68%,#a16207 100%); border:1px solid rgba(255,244,150,.9); box-shadow:0 0 18px rgba(250,204,21,.85),0 0 45px rgba(250,204,21,.55),0 0 90px rgba(250,204,21,.3),inset -10px -12px 22px rgba(120,75,0,.25),inset 8px 8px 18px rgba(255,255,220,.38); animation:dfOrbFloat 2s ease-in-out infinite,dfOrbGlow 1.5s ease-in-out infinite; }
    .df-launch-orb::before { content:""; position:absolute; inset:7px; border-radius:50%; border:1px solid rgba(255,255,210,.3); animation:dfOrbRing 2s linear infinite; }
    .df-launch-orb::after { content:""; position:absolute; top:14px; left:20px; width:20px; height:10px; border-radius:50%; background:rgba(255,255,235,.72); filter:blur(5px); transform:rotate(-25deg); }
    .df-launch-orb-glint { position:absolute; width:140px; height:140px; border-radius:50%; border:1px solid rgba(250,204,21,.22); animation:dfExpand 1.8s ease-out infinite; pointer-events:none; }

    .df-launch-title { margin-top:28px; font:800 24px/1 system-ui,sans-serif; letter-spacing:.45em; color:#fff; text-shadow:0 0 22px rgba(250,204,21,.45); }
    .df-launch-status { margin-top:12px; color:#94a3b8; font:500 11px/1 system-ui,sans-serif; letter-spacing:.18em; }
    .df-launch-status span { display:inline-block; width:6px; height:6px; margin-right:8px; border-radius:50%; background:#facc15; box-shadow:0 0 12px #facc15; animation:dfBlink 1s infinite; }

    .sidebar { width:292px !important; background:radial-gradient(circle at 15% 0%,rgba(250,204,21,.09),transparent 30%),linear-gradient(180deg,#0b1019 0%,#080c13 100%) !important; border-right:1px solid rgba(255,255,255,.07) !important; box-shadow:18px 0 55px rgba(0,0,0,.18); position:relative; overflow:hidden; }
    .sidebar::before { content:""; position:absolute; left:0; top:0; width:2px; height:100%; background:linear-gradient(180deg,#facc15,rgba(250,204,21,.08) 42%,transparent 85%); opacity:.8; pointer-events:none; }
    .sidebar > div:first-child { position:relative; margin:10px 10px 8px; padding:11px !important; min-height:62px; border:1px solid rgba(255,255,255,.07); border-radius:16px; background:rgba(255,255,255,.035); box-shadow:inset 0 1px 0 rgba(255,255,255,.04); }
    .sidebar > div:first-child > div:first-child { width:42px !important; height:42px !important; border-radius:13px !important; background:linear-gradient(145deg,#facc15,#ca8a04) !important; box-shadow:0 0 24px rgba(250,204,21,.18); position:relative; }
    .sidebar > div:first-child > div:first-child img { display:none !important; }
    .sidebar > div:first-child > div:first-child::after { content:"D"; position:absolute; inset:0; display:grid; place-items:center; color:#090b10; font:900 22px/1 system-ui,sans-serif; letter-spacing:-.06em; }
    .sidebar > div:first-child .text-sm { font-size:14px !important; letter-spacing:.01em; }
    .sidebar > div:first-child .text-\\[10px\\] { color:#64748b !important; margin-top:2px; }
    #closeSidebar { width:32px; height:32px; display:grid; place-items:center; border-radius:10px; background:rgba(255,255,255,.04); }
    #closeSidebar:hover { background:rgba(250,204,21,.1); color:#facc15 !important; }
    #newChatBtn { height:48px; justify-content:center; border:1px solid rgba(250,204,21,.3) !important; background:linear-gradient(135deg,rgba(250,204,21,.16),rgba(250,204,21,.06)) !important; box-shadow:0 8px 28px rgba(250,204,21,.07); font-weight:700 !important; letter-spacing:.01em; transition:all .18s ease; }
    #newChatBtn:hover { border-color:rgba(250,204,21,.55) !important; background:linear-gradient(135deg,rgba(250,204,21,.22),rgba(250,204,21,.09)) !important; transform:translateY(-1px); }
    #newChatBtn i { color:#facc15; }
    .sidebar > .mt-4 { margin:20px 14px 7px !important; padding:0 !important; color:#64748b !important; font-size:10px !important; letter-spacing:.16em !important; }
    #chatList { padding:4px 9px 14px !important; margin-top:0 !important; scrollbar-width:none; }
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
    @media (max-width:1023px) { .sidebar { width:292px !important; box-shadow:18px 0 60px rgba(0,0,0,.45); } }
    @media (max-width:480px) { .sidebar { width:min(292px,88vw) !important; } }

    /* Keep the center orb clean: no logo/image overlay. */
    .orb .df-brand-orb { display:none !important; }
    .orb { position:relative; }

    @keyframes dfCoreIn { from { opacity:0; transform:translateY(30px) scale(.92); filter:blur(10px); } to { opacity:1; transform:none; filter:none; } }
    @keyframes dfOrbFloat { 50% { transform:translateY(-5px) scale(1.035); } }
    @keyframes dfOrbGlow { 0%,100% { filter:brightness(1); } 50% { filter:brightness(1.18); } }
    @keyframes dfOrbAura { 0%,100% { transform:scale(.9); opacity:.65; } 50% { transform:scale(1.16); opacity:1; } }
    @keyframes dfOrbRing { to { transform:rotate(360deg); } }
    @keyframes dfExpand { 0% { transform:scale(.7); opacity:.7; } 100% { transform:scale(1.25); opacity:0; } }
    @keyframes dfSpin { to { transform:rotate(360deg); } }
    @keyframes dfSpinReverse { to { transform:rotate(-360deg); } }
    @keyframes dfGrid { to { transform:perspective(500px) rotateX(60deg) translateY(5%); } }
    @keyframes dfScan { 0%,100% { transform:translateY(-35vh); opacity:0; } 35% { opacity:1; } 65% { opacity:1; } }
    @keyframes dfBlink { 50% { opacity:.25; } }
    @media (max-width:480px) { .df-launch-ring { width:210px; height:210px; } .df-launch-ring-b { width:260px; height:260px; } .df-launch-title { font-size:20px; letter-spacing:.32em; } }
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

    document.querySelectorAll('.orb .df-brand-orb').forEach(img => img.remove());
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
