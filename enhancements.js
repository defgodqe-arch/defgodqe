/* defgodqe — premium UI + usability layer
   Safe overlay: does not replace the working AI core. */
(() => {
  const init = () => {
    if (document.documentElement.dataset.dfEnhanced === '1') return;
    document.documentElement.dataset.dfEnhanced = '1';

    const style = document.createElement('style');
    style.textContent = `
      :root { --df-yellow:#facc15; --df-gold:#eab308; --df-glass:rgba(15,20,30,.72); }
      body { background:radial-gradient(circle at 55% 15%,rgba(250,204,21,.035),transparent 32%),#080b11 !important; }
      header { background:rgba(5,8,14,.68); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); position:relative; z-index:10; }
      header::after { content:""; position:absolute; left:0; right:0; bottom:-1px; height:1px; background:linear-gradient(90deg,transparent,rgba(250,204,21,.22),transparent); pointer-events:none; }
      #scroll { scroll-behavior:smooth; background:radial-gradient(circle at 50% 35%,rgba(250,204,21,.025),transparent 38%); }
      #welcome { animation:dfWelcome .7s cubic-bezier(.16,1,.3,1); }
      @keyframes dfWelcome { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
      .orb { box-shadow:0 0 28px rgba(250,204,21,.35),0 0 70px rgba(250,204,21,.18),inset -8px -8px 22px rgba(202,138,4,.5),inset 8px 8px 18px rgba(255,251,230,.5) !important; }
      .orb::before { content:""; position:absolute; inset:-18px; border-radius:50%; border:1px solid rgba(250,204,21,.16); animation:dfOrbPulse 2.4s ease-in-out infinite; pointer-events:none; }
      .orb::after { transition:filter .25s ease; }
      .orb:hover::after { filter:brightness(1.2); }
      @keyframes dfOrbPulse { 0%,100%{transform:scale(.92);opacity:.35} 50%{transform:scale(1.08);opacity:.8} }
      #composer { border:1px solid rgba(255,255,255,.09) !important; background:linear-gradient(145deg,rgba(20,27,39,.9),rgba(9,13,21,.94)) !important; box-shadow:0 12px 45px rgba(0,0,0,.25),0 0 0 1px rgba(250,204,21,.025) inset !important; backdrop-filter:blur(20px); transition:border-color .2s,box-shadow .2s,transform .2s; }
      #composer:focus-within { border-color:rgba(250,204,21,.28) !important; box-shadow:0 16px 55px rgba(0,0,0,.32),0 0 28px rgba(250,204,21,.055),0 0 0 1px rgba(250,204,21,.06) inset !important; transform:translateY(-1px); }
      #input { caret-color:#facc15; }
      #input::placeholder { transition:opacity .2s; }
      #input:focus::placeholder { opacity:.45; }
      button { -webkit-user-select:none; user-select:none; }
      #modelBtn, #modeBtn, #webBtn, #voiceBtn { backdrop-filter:blur(10px); }
      #modelBtn:hover, #modeBtn:hover, #webBtn:hover, #voiceBtn:hover { transform:translateY(-1px); }
      #sendBtn { box-shadow:0 0 0 0 rgba(250,204,21,.4); transition:transform .16s,box-shadow .2s,filter .2s !important; }
      #sendBtn:hover { transform:translateY(-1px) scale(1.02); box-shadow:0 0 24px rgba(250,204,21,.22); filter:brightness(1.06); }
      #sendBtn:active { transform:scale(.96); }
      .msg-in { animation:dfMessage .35s cubic-bezier(.16,1,.3,1) !important; }
      @keyframes dfMessage { from{opacity:0;transform:translateY(8px) scale(.99)} to{opacity:1;transform:none} }
      .codeblock { box-shadow:0 10px 30px rgba(0,0,0,.16); }
      .web-source, .attachment-card, .gen-img { transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease; }
      .web-source:hover, .attachment-card:hover { transform:translateY(-1px); }
      .df-online { display:inline-flex; align-items:center; gap:6px; margin-left:8px; padding:4px 8px; border:1px solid rgba(250,204,21,.14); border-radius:999px; background:rgba(250,204,21,.055); color:#aab4c3; font:600 10px/1 system-ui,sans-serif; letter-spacing:.04em; opacity:.9; }
      .df-online i { width:6px; height:6px; border-radius:50%; background:#facc15; box-shadow:0 0 9px #facc15; }
      .df-toast { position:fixed; left:50%; bottom:24px; z-index:100000; transform:translate(-50%,12px); opacity:0; pointer-events:none; padding:9px 13px; border:1px solid rgba(250,204,21,.22); border-radius:11px; background:rgba(10,14,22,.92); color:#e5e7eb; box-shadow:0 12px 40px rgba(0,0,0,.4),0 0 25px rgba(250,204,21,.08); backdrop-filter:blur(16px); font:600 12px/1.2 system-ui,sans-serif; transition:opacity .2s,transform .2s; }
      .df-toast.show { opacity:1; transform:translate(-50%,0); }
      @media(max-width:640px){ .df-online{display:none} #composer{border-radius:18px !important} .df-toast{bottom:14px;max-width:calc(100vw - 28px);text-align:center} }
      @media(prefers-reduced-motion:reduce){#welcome,.msg-in,.orb::before{animation:none!important} *{scroll-behavior:auto!important}}
    `;
    document.head.appendChild(style);

    const toast = (text) => {
      let el = document.querySelector('.df-toast');
      if (!el) { el=document.createElement('div'); el.className='df-toast'; document.body.appendChild(el); }
      el.textContent=text;
      el.classList.add('show');
      clearTimeout(el._timer);
      el._timer=setTimeout(()=>el.classList.remove('show'),1800);
    };

    const addOnline = () => {
      const label=document.querySelector('#modelLabel');
      if (!label || label.parentElement.querySelector('.df-online')) return;
      const badge=document.createElement('span');
      badge.className='df-online';
      badge.innerHTML='<i></i> ONLINE';
      label.parentElement.appendChild(badge);
    };

    const bind = () => {
      addOnline();
      const input=document.querySelector('#input');
      if (input && !input.dataset.dfKeys) {
        input.dataset.dfKeys='1';
        input.addEventListener('keydown',(e)=>{
          if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k') { e.preventDefault(); input.focus(); input.select(); }
        });
      }
    };

    document.addEventListener('keydown',(e)=>{
      if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k') {
        e.preventDefault(); document.querySelector('#input')?.focus(); toast('Ready — start typing');
      }
      if (e.key==='Escape') {
        document.querySelector('#modelMenu')?.classList.add('hidden');
        document.querySelector('#modeMenu')?.classList.add('hidden');
        document.querySelector('#sidebar')?.classList.remove('open');
        document.querySelector('#sidebarBackdrop')?.classList.add('hidden');
      }
    });

    window.addEventListener('online',()=>toast('Connection restored'));
    window.addEventListener('offline',()=>toast('You are offline'));
    bind();
    new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});
  };

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
