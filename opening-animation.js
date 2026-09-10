/* defgodqe cinematic startup animation */
(function () {
  if (window.__defgodqeSplashLoaded) return;
  window.__defgodqeSplashLoaded = true;

  const logo = 'https://raw.githubusercontent.com/defgodqe-arch/defgodqe-ai/main/Screenshot_2026-02-27_164030.png';
  const splash = document.createElement('div');
  splash.id = 'defgodqe-startup';
  splash.innerHTML = `
    <div class="df-startup-grid"></div>
    <div class="df-startup-particles"></div>
    <div class="df-startup-ring df-ring-a"></div>
    <div class="df-startup-ring df-ring-b"></div>
    <div class="df-startup-core">
      <div class="df-startup-glow"></div>
      <img src="${logo}" alt="defgodqe" />
    </div>
    <div class="df-startup-name">defgodqe</div>
    <div class="df-startup-status"><span></span> INITIALIZING AI SYSTEMS</div>
    <div class="df-startup-line"></div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #defgodqe-startup{position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;flex-direction:column;background:#05070b;color:#fff;overflow:hidden;opacity:1;transition:opacity .55s ease,visibility .55s ease}
    #defgodqe-startup.df-startup-hide{opacity:0;visibility:hidden;pointer-events:none}
    .df-startup-grid{position:absolute;inset:-50%;background-image:linear-gradient(rgba(250,204,21,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(250,204,21,.055) 1px,transparent 1px);background-size:42px 42px;transform:perspective(500px) rotateX(58deg) translateY(24%);animation:dfGrid 5s linear infinite;mask-image:linear-gradient(to bottom,transparent 0%,black 35%,black 80%,transparent 100%)}
    .df-startup-particles{position:absolute;inset:0;background-image:radial-gradient(circle,rgba(250,204,21,.8) 0 1px,transparent 1.5px);background-size:83px 97px;opacity:.16;animation:dfParticles 7s linear infinite}
    .df-startup-ring{position:absolute;width:245px;height:245px;border:1px solid rgba(250,204,21,.22);border-radius:50%;box-shadow:0 0 35px rgba(250,204,21,.06);animation:dfSpin 8s linear infinite}
    .df-ring-a{transform:rotateX(65deg) rotateZ(0deg);border-right-color:rgba(250,204,21,.9);border-left-color:transparent}
    .df-ring-b{width:310px;height:310px;transform:rotateX(65deg) rotateZ(45deg);animation-direction:reverse;border-top-color:rgba(255,255,255,.45);border-bottom-color:transparent}
    .df-startup-core{position:relative;width:150px;height:150px;border-radius:38px;display:flex;align-items:center;justify-content:center;animation:dfCore 2.2s cubic-bezier(.2,.8,.2,1) both}
    .df-startup-core img{position:relative;width:112px;height:112px;object-fit:cover;border-radius:28px;image-rendering:auto;box-shadow:0 0 0 1px rgba(250,204,21,.3),0 0 45px rgba(250,204,21,.32);animation:dfLogo 1.8s ease-in-out infinite alternate}
    .df-startup-glow{position:absolute;inset:12px;border-radius:34px;background:rgba(250,204,21,.12);filter:blur(25px);animation:dfGlow 1.5s ease-in-out infinite alternate}
    .df-startup-name{margin-top:27px;font-size:32px;font-weight:900;letter-spacing:-.04em;opacity:0;transform:translateY(12px);animation:dfText .7s .35s ease-out forwards}
    .df-startup-name:after{content:'';display:block;height:2px;width:0;margin:7px auto 0;background:#facc15;box-shadow:0 0 14px #facc15;animation:dfLine .7s .7s ease-out forwards}
    .df-startup-status{margin-top:20px;font-size:9px;letter-spacing:.24em;color:#64748b;opacity:0;animation:dfText .6s .8s ease-out forwards}.df-startup-status span{display:inline-block;width:6px;height:6px;border-radius:50%;background:#facc15;box-shadow:0 0 10px #facc15;margin-right:8px;animation:dfBlink .8s infinite}
    .df-startup-line{position:absolute;bottom:34px;width:min(280px,65vw);height:1px;background:linear-gradient(90deg,transparent,#facc15,transparent);transform:scaleX(0);animation:dfLine .9s .9s ease-out forwards}
    @keyframes dfGrid{to{transform:perspective(500px) rotateX(58deg) translateY(30%)}}
    @keyframes dfParticles{to{transform:translateY(-97px)}}
    @keyframes dfSpin{to{transform:rotateX(65deg) rotateZ(360deg)}}
    @keyframes dfCore{from{transform:scale(.45);opacity:0;filter:blur(8px)}to{transform:scale(1);opacity:1;filter:blur(0)}}
    @keyframes dfLogo{from{transform:scale(.98);filter:brightness(1)}to{transform:scale(1.035);filter:brightness(1.18)}}
    @keyframes dfGlow{from{opacity:.45;transform:scale(.9)}to{opacity:.9;transform:scale(1.08)}}
    @keyframes dfText{to{opacity:1;transform:translateY(0)}}
    @keyframes dfLine{to{width:100%}}
    @keyframes dfBlink{50%{opacity:.25}}
    @media(prefers-reduced-motion:reduce){#defgodqe-startup *{animation-duration:.01ms!important;animation-iteration-count:1!important}}
  `;
  document.head.appendChild(style);
  document.documentElement.appendChild(splash);

  const hide = () => {
    if (splash.classList.contains('df-startup-hide')) return;
    splash.classList.add('df-startup-hide');
    setTimeout(() => splash.remove(), 650);
  };

  window.addEventListener('load', () => setTimeout(hide, 1500), { once:true });
  setTimeout(hide, 2600);

  /* ============================================================
     UI RECOVERY
     The main app must never depend on optional feature scripts to
     make the sidebar controls visible. This small layer creates the
     launchers directly and retries until the sidebar is available.
     ============================================================ */
  function loadOptional(src) {
    return new Promise(resolve => {
      if (document.querySelector(`script[data-defgodqe-src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.dataset.defgodqeSrc = src;
      s.onload = () => resolve();
      s.onerror = () => resolve();
      document.head.appendChild(s);
    });
  }

  function installSidebarLaunchers() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return false;
    const authRow = sidebar.querySelector('#authRow');
    const footer = authRow ? authRow.parentElement : sidebar.lastElementChild;
    if (!footer) return false;

    if (!document.getElementById('dfRecoveryTools')) {
      const box = document.createElement('div');
      box.id = 'dfRecoveryTools';
      box.innerHTML = `
        <div class="df-recovery-title">EXPLORE</div>
        <button type="button" data-recovery="doom"><span>📱</span><b>Doom Scroll</b><small>Short videos</small></button>
        <button type="button" data-recovery="neon"><span>⚡</span><b>Neon Tag</b><small>Laser freeze arena</small></button>
        <button type="button" data-recovery="games"><span>🎮</span><b>Mini Games</b><small>Play the arcade</small></button>
        <button type="button" data-recovery="features"><span>✨</span><b>Feature Lab</b><small>More defgodqe tools</small></button>
      `;
      const st = document.createElement('style');
      st.textContent = `
        #dfRecoveryTools{display:grid;gap:6px;padding:8px 12px 10px;flex:none!important;visibility:visible!important;opacity:1!important}
        #dfRecoveryTools .df-recovery-title{font:800 10px/1 Inter,system-ui,sans-serif;letter-spacing:.14em;color:#64748b;padding:2px 4px 5px}
        #dfRecoveryTools button{position:relative!important;display:flex!important;align-items:center!important;width:100%!important;min-height:42px!important;box-sizing:border-box!important;gap:9px!important;padding:9px 10px!important;border:1px solid rgba(255,255,255,.09)!important;border-radius:12px!important;background:linear-gradient(135deg,rgba(255,255,255,.05),rgba(255,255,255,.018))!important;color:#e5e7eb!important;text-align:left!important;cursor:pointer!important;font:600 12px Inter,system-ui,sans-serif!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important}
        #dfRecoveryTools button:hover{border-color:rgba(250,204,21,.55)!important;background:rgba(250,204,21,.08)!important;transform:translateX(2px)}
        #dfRecoveryTools button span{width:22px;text-align:center;font-size:16px}
        #dfRecoveryTools button b{color:#f8fafc;flex:1}
        #dfRecoveryTools button small{font-size:9px;color:#64748b;font-weight:600}
        #dfRecoveryTools button:nth-of-type(2){border-color:rgba(250,204,21,.4)!important;background:rgba(250,204,21,.08)!important}
        #dfRecoveryTools button:nth-of-type(2) b{color:#fde68a}
      `;
      document.head.appendChild(st);
      footer.before(box);

      box.querySelector('[data-recovery="doom"]').onclick = async () => {
        await loadOptional('./doom-scroll.js');
        if (window.defgodqeDoomScrollOpen) window.defgodqeDoomScrollOpen();
        else document.getElementById('dfDoomScrollBtn')?.click();
      };
      box.querySelector('[data-recovery="neon"]').onclick = async () => {
        await loadOptional('./multiplayer-game.js');
        if (window.defgodqeMultiplayer?.open) window.defgodqeMultiplayer.open();
        else document.getElementById('dfNeonTagBtn')?.click();
      };
      box.querySelector('[data-recovery="games"]').onclick = async () => {
        await loadOptional('./mini-game.js');
        document.getElementById('dfGameBtn')?.click();
      };
      box.querySelector('[data-recovery="features"]').onclick = async () => {
        await loadOptional('./features.js');
        if (window.defgodqeOpenFeatureLab) window.defgodqeOpenFeatureLab();
      };
    }
    return true;
  }

  function recover() {
    installSidebarLaunchers();
    const splashNode = document.getElementById('defgodqe-startup');
    if (splashNode) {
      splashNode.style.pointerEvents = 'none';
      splashNode.style.setProperty('z-index','1','important');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', recover, {once:true});
  } else {
    recover();
  }
  const recoveryTimer = setInterval(() => {
    recover();
    if (document.getElementById('dfRecoveryTools')) clearInterval(recoveryTimer);
  }, 500);
  setTimeout(() => clearInterval(recoveryTimer), 10000);
})();
