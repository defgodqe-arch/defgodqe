/* defgodqe — modern AI chat visual layer
 * Applies the supplied dark/glass/yellow design without replacing the working chat runtime.
 * Intentionally does not register keyboard handlers, so normal space/typing behavior is preserved.
 */
(function () {
  'use strict';
  if (window.__defgodqeUiTheme) return;
  window.__defgodqeUiTheme = true;

  const style = document.createElement('style');
  style.id = 'defgodqe-ui-theme';
  style.textContent = `
    :root {
      --df-ink:#0a0d14;
      --df-panel:#0f131c;
      --df-card:#151b26;
      --df-brand:#facc15;
      --df-line:rgba(255,255,255,.07);
      --df-glass:rgba(21,27,38,.78);
    }

    html,body { background:var(--df-ink)!important; color:#e2e8f0; }
    body { font-family:Inter,ui-sans-serif,system-ui,sans-serif; }

    #sidebar {
      background:linear-gradient(180deg,rgba(15,19,28,.98),rgba(10,13,20,.98))!important;
      border-right:1px solid var(--df-line)!important;
      box-shadow:12px 0 45px rgba(0,0,0,.22);
    }
    #sidebar button, #sidebar a {
      transition:background .16s ease,border-color .16s ease,color .16s ease,transform .16s ease,box-shadow .16s ease;
    }
    #newChatBtn {
      background:rgba(255,255,255,.045)!important;
      border:1px solid rgba(255,255,255,.10)!important;
      border-radius:13px!important;
    }
    #newChatBtn:hover {
      background:rgba(250,204,21,.09)!important;
      border-color:rgba(250,204,21,.38)!important;
      box-shadow:0 0 20px rgba(250,204,21,.08);
    }
    #chatList > * {
      border:1px solid transparent;
      border-radius:11px;
    }
    #chatList > *:hover {
      background:rgba(255,255,255,.045)!important;
      border-color:rgba(255,255,255,.07);
    }

    main { background:var(--df-ink); }
    main > header {
      background:rgba(10,13,20,.82)!important;
      border-bottom:1px solid var(--df-line)!important;
      backdrop-filter:blur(18px);
    }
    #modelBtn,#modeBtn,#webBtn,#voiceBtn {
      border-radius:10px!important;
      transition:all .16s ease;
    }
    #modelBtn:hover,#modeBtn:hover,#webBtn:hover {
      background:rgba(255,255,255,.045)!important;
    }
    #voiceBtn {
      border-color:rgba(250,204,21,.36)!important;
      background:rgba(250,204,21,.08)!important;
      color:var(--df-brand)!important;
      box-shadow:0 0 18px rgba(250,204,21,.05);
    }

    #scroll { background:radial-gradient(circle at 50% 32%,rgba(250,204,21,.035),transparent 34%),var(--df-ink); }
    #welcome { position:relative; }
    #welcome h1 { letter-spacing:-.035em; }
    #welcome p { color:#94a3b8!important; }

    /* Keep the signature yellow orb visible and gently alive. */
    .orb {
      position:relative!important;
      width:150px!important;
      height:150px!important;
      border-radius:50%!important;
      background:radial-gradient(circle at 38% 34%,#fff8b0 0 5%,#fde047 14%,#facc15 34%,#eab308 57%,rgba(234,179,8,.08) 72%,transparent 74%)!important;
      box-shadow:0 0 22px rgba(250,204,21,.65),0 0 65px rgba(250,204,21,.34),0 0 120px rgba(250,204,21,.14)!important;
      animation:dfOrbFloat 3.6s ease-in-out infinite,dfOrbGlow 2.1s ease-in-out infinite alternate!important;
      isolation:isolate;
    }
    .orb:before,.orb:after {
      content:""; position:absolute; inset:-14px; border:1px solid rgba(250,204,21,.22); border-radius:50%;
      animation:dfOrbRing 4s linear infinite;
    }
    .orb:after { inset:-28px; opacity:.35; animation-duration:6s; animation-direction:reverse; }
    .orb span {
      position:absolute; inset:20%; border-radius:50%;
      background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.75),rgba(250,204,21,.18) 42%,transparent 70%);
      filter:blur(4px);
    }
    @keyframes dfOrbFloat {0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-8px) scale(1.035)}}
    @keyframes dfOrbGlow {from{filter:saturate(1) brightness(.96)}to{filter:saturate(1.25) brightness(1.12)}}
    @keyframes dfOrbRing {to{transform:rotate(360deg)}}

    #suggestGrid > * {
      background:rgba(21,27,38,.62)!important;
      border:1px solid rgba(255,255,255,.08)!important;
      border-radius:14px!important;
      backdrop-filter:blur(12px);
      transition:all .16s ease!important;
    }
    #suggestGrid > *:hover {
      border-color:rgba(250,204,21,.32)!important;
      background:rgba(250,204,21,.055)!important;
      transform:translateY(-1px);
      box-shadow:0 8px 28px rgba(0,0,0,.2),0 0 20px rgba(250,204,21,.05);
    }

    #messages > * { animation:dfMessageIn .18s ease both; }
    @keyframes dfMessageIn {from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
    #messages pre {
      border:1px solid rgba(255,255,255,.08)!important;
      border-radius:12px!important;
      background:#0b0f16!important;
    }

    /* Composer from the supplied design. */
    body > div > main > div:last-child,
    main > div:last-child {
      background:rgba(10,13,20,.86);
      backdrop-filter:blur(18px);
    }
    #composer {
      background:rgba(21,27,38,.82)!important;
      border:1px solid rgba(255,255,255,.09)!important;
      border-radius:18px!important;
      box-shadow:0 12px 40px rgba(0,0,0,.20);
    }
    #composer:focus-within {
      border-color:rgba(250,204,21,.48)!important;
      box-shadow:0 0 0 1px rgba(250,204,21,.08),0 12px 45px rgba(0,0,0,.24),0 0 26px rgba(250,204,21,.05);
    }
    #input { color:#f1f5f9!important; }
    #input::placeholder { color:#64748b!important; }
    #attachBtn,#imgBtn {
      border-radius:11px!important;
      color:#94a3b8!important;
    }
    #attachBtn:hover,#imgBtn:hover { background:rgba(255,255,255,.055)!important;color:#fff!important; }
    #sendBtn {
      background:var(--df-brand)!important;
      color:#0a0d14!important;
      box-shadow:0 0 18px rgba(250,204,21,.16);
    }
    #sendBtn:hover { background:#fde047!important;box-shadow:0 0 25px rgba(250,204,21,.24); }

    #voiceOverlay {
      background:rgba(10,13,20,.96)!important;
      backdrop-filter:blur(22px);
    }
    #vMic {
      background:var(--df-brand)!important;
      box-shadow:0 0 28px rgba(250,204,21,.25),0 0 70px rgba(250,204,21,.10);
    }
    #vStatus { color:var(--df-brand)!important; }

    #toast {
      background:rgba(21,27,38,.94)!important;
      border-color:rgba(250,204,21,.22)!important;
      box-shadow:0 10px 35px rgba(0,0,0,.28),0 0 22px rgba(250,204,21,.05);
    }

    @media(max-width:700px){
      .orb { width:118px!important;height:118px!important; }
      #sidebar { width:280px!important; }
      #composer { border-radius:16px!important; }
    }
  `;
  document.head.appendChild(style);
})();
