/* defgodqe AI branding + launch animation */
(() => {
  // Keep the logo inside the frontend repo so it cannot break when the AI Worker changes.
  const LOGO = new URL('./icon.svg', document.baseURI).href;

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

  const style = document.createElement('style');
  style.textContent = `
    #df-launch {
      position: fixed; inset: 0; z-index: 99999; display: flex;
      align-items: center; justify-content: center; overflow: hidden;
      background: #050505; opacity: 1; visibility: visible;
      transition: opacity .65s ease, visibility .65s ease;
    }
    #df-launch.df-launch-hide { opacity: 0; visibility: hidden; pointer-events: none; }
    .df-launch-grid {
      position: absolute; inset: -50%;
      background-image: linear-gradient(rgba(250,204,21,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(250,204,21,.055) 1px, transparent 1px);
      background-size: 48px 48px;
      transform: perspective(500px) rotateX(60deg) translateY(20%);
      animation: dfGrid 3s linear infinite;
    }
    .df-launch-ring { position: absolute; width: 260px; height: 260px; border: 1px solid rgba(250,204,21,.22); border-radius: 50%; box-shadow: 0 0 40px rgba(250,204,21,.08); }
    .df-launch-ring-a { animation: dfSpin 4s linear infinite; }
    .df-launch-ring-b { width: 320px; height: 320px; border-style: dashed; animation: dfSpinReverse 6s linear infinite; }
    .df-launch-scan { position:absolute; width:70vw; height:1px; background:linear-gradient(90deg,transparent,rgba(250,204,21,.5),transparent); box-shadow:0 0 18px rgba(250,204,21,.35); animation:dfScan 2.2s ease-in-out infinite; }
    .df-launch-core { position: relative; z-index: 2; text-align: center; transform: translateY(10px); animation: dfCoreIn 1s cubic-bezier(.16,1,.3,1) forwards; }
    .df-launch-logo-wrap { position: relative; width: 118px; height: 118px; margin: auto; border-radius: 50%; display: grid; place-items: center; }
    .df-launch-logo-wrap:before { content:""; position:absolute; inset:0; border-radius:50%; border:1px solid rgba(250,204,21,.6); box-shadow:0 0 70px rgba(250,204,21,.3), inset 0 0 30px rgba(250,204,21,.12); animation:dfPulse 1.4s ease-in-out infinite; }
    .df-launch-pulse { position:absolute; inset:-18px; border:1px solid rgba(250,204,21,.15); border-radius:50%; animation:dfExpand 1.8s ease-out infinite; }
    .df-launch-logo { width:84px; height:84px; object-fit:cover; border-radius:50%; position:relative; z-index:2; animation:dfLogoFloat 2s ease-in-out infinite; box-shadow:0 0 35px rgba(250,204,21,.35); }
    .df-launch-title { margin-top:28px; font:800 24px/1 system-ui,sans-serif; letter-spacing:.45em; color:#fff; text-shadow:0 0 22px rgba(250,204,21,.45); }
    .df-launch-status { margin-top:12px; color:#94a3b8; font:500 11px/1 system-ui,sans-serif; letter-spacing:.18em; }
    .df-launch-status span { display:inline-block; width:6px; height:6px; margin-right:8px; border-radius:50%; background:#facc15; box-shadow:0 0 12px #facc15; animation:dfBlink 1s infinite; }
    @keyframes dfCoreIn { from { opacity:0; transform:translateY(30px) scale(.92); filter:blur(10px); } to { opacity:1; transform:none; filter:none; } }
    @keyframes dfPulse { 50% { transform:scale(1.12); opacity:.65; } }
    @keyframes dfExpand { 0% { transform:scale(.7); opacity:.7; } 100% { transform:scale(1.25); opacity:0; } }
    @keyframes dfLogoFloat { 50% { transform:translateY(-4px) scale(1.02); } }
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
    // Only repair the actual brand/logo elements. Do NOT replace chat/image results.
    document.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src') || '';
      const alt = (img.getAttribute('alt') || '').toLowerCase();
      if (src.includes('Screenshot_2026-02-27_164030.png') || alt.includes('defgodqe logo')) {
        img.src = LOGO;
      }
    });

    document.querySelectorAll('.orb').forEach(orb => {
      if (orb.querySelector('.df-brand-orb')) return;
      const img = document.createElement('img');
      img.className = 'df-brand-orb';
      img.src = LOGO;
      img.alt = 'defgodqe AI';
      img.draggable = false;
      orb.appendChild(img);
    });

    document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach(link => {
      link.href = LOGO;
    });
  }

  const hideLaunch = () => {
    const el = document.getElementById('df-launch');
    if (!el) return;
    el.classList.add('df-launch-hide');
    setTimeout(() => el.remove(), 700);
  };

  applyBranding();
  new MutationObserver(applyBranding).observe(document.documentElement, { childList: true, subtree: true });

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) setTimeout(hideLaunch, 250);
  else setTimeout(hideLaunch, 2300);
})();
