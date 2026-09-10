/* defgodqe — hard mobile viewport/layout fix */
(function () {
  const css = `
@media (max-width: 1023px) {
  html, body { width:100%; max-width:100%; height:100%; min-height:100%; overflow:hidden !important; }
  body { margin:0 !important; position:fixed; inset:0; }
  body > div.flex.h-screen.w-screen { width:100vw !important; max-width:100vw !important; height:100dvh !important; min-height:100dvh !important; overflow:hidden !important; }
  main { width:100% !important; max-width:100% !important; min-width:0 !important; height:100dvh !important; overflow:hidden !important; }

  header { width:100% !important; max-width:100% !important; min-width:0 !important; box-sizing:border-box !important; display:flex !important; flex-wrap:nowrap !important; gap:2px !important; padding-left:6px !important; padding-right:6px !important; overflow:hidden !important; }
  #openSidebar { flex:0 0 40px !important; width:40px !important; min-width:40px !important; padding:0 !important; }
  header > .relative { min-width:0 !important; flex:1 1 auto !important; }
  #modelBtn, #modeBtn { width:100% !important; max-width:none !important; min-width:0 !important; padding-left:6px !important; padding-right:6px !important; overflow:hidden !important; }
  #modelLabel, #modeLabel { max-width:100% !important; overflow:hidden !important; text-overflow:ellipsis !important; white-space:nowrap !important; }
  header > .ml-auto { margin-left:auto !important; flex:0 0 auto !important; width:auto !important; min-width:0 !important; gap:1px !important; }
  #webBtn, #voiceBtn { flex:0 0 40px !important; width:40px !important; min-width:40px !important; max-width:40px !important; padding:0 !important; }

  #scroll { width:100% !important; max-width:100% !important; min-width:0 !important; overflow-x:hidden !important; overflow-y:auto !important; }
  #welcome, #messages { width:100% !important; max-width:100% !important; min-width:0 !important; box-sizing:border-box !important; }
  #welcome { padding-left:12px !important; padding-right:12px !important; }
  #messages { padding-left:12px !important; padding-right:12px !important; }

  main > div:last-child { width:100% !important; max-width:100% !important; min-width:0 !important; box-sizing:border-box !important; padding-left:6px !important; padding-right:6px !important; }
  #composer { width:100% !important; max-width:100% !important; min-width:0 !important; box-sizing:border-box !important; display:flex !important; }
  #input { min-width:0 !important; width:auto !important; flex:1 1 auto !important; }
  #attachBtn, #imgBtn, #stopBtn, #sendBtn { flex:0 0 40px !important; width:40px !important; min-width:40px !important; max-width:40px !important; }

  img, video, canvas, iframe, pre, table { max-width:100% !important; }
  .prose-df, .msg-in, .codeblock { min-width:0 !important; max-width:100% !important; overflow-wrap:anywhere !important; }
}

@media (max-width:430px) {
  header { padding-left:4px !important; padding-right:4px !important; }
  #openSidebar, #webBtn, #voiceBtn { flex-basis:38px !important; width:38px !important; min-width:38px !important; max-width:38px !important; }
  #modelBtn, #modeBtn { font-size:12px !important; }
  #composer { border-radius:16px !important; }
  #attachBtn, #imgBtn, #stopBtn, #sendBtn { flex-basis:38px !important; width:38px !important; min-width:38px !important; max-width:38px !important; }
}

@media (max-width:360px) {
  #modeBtn { display:none !important; }
  #modelBtn { font-size:11px !important; }
  #modelBtn .text-slate-500, #modelBtn svg { flex-shrink:0 !important; }
  #webBtn { display:none !important; }
}

@media (max-height:600px) and (max-width:1023px) {
  #welcome { padding-top:12px !important; padding-bottom:90px !important; }
  .orb { width:54px !important; height:54px !important; margin-bottom:10px !important; }
}
`;
  function install() {
    if (document.getElementById('defgodqe-hard-mobile-fix')) return;
    const style = document.createElement('style');
    style.id = 'defgodqe-hard-mobile-fix';
    style.textContent = css;
    document.head.appendChild(style);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once:true });
  else install();
})();
