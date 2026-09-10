/* defgodqe — final mobile fit fix */
(function () {
  const css = `
@media (max-width:1023px){
  html,body{width:100%;max-width:100%;height:100%;height:100dvh;margin:0!important;padding:0!important;overflow:hidden!important;-webkit-text-size-adjust:100%;}
  body{position:fixed!important;inset:0!important;overscroll-behavior:none;}
  body>div.flex.h-screen.w-screen{position:fixed!important;inset:0!important;width:100vw!important;max-width:100vw!important;height:100dvh!important;max-height:100dvh!important;display:flex!important;overflow:hidden!important;}
  main{width:100%!important;max-width:100%!important;min-width:0!important;height:100dvh!important;max-height:100dvh!important;overflow:hidden!important;}
  header{height:auto!important;min-height:56px!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;display:flex!important;flex-wrap:nowrap!important;gap:2px!important;padding:8px 4px!important;overflow:hidden!important;}
  #openSidebar{display:flex!important;flex:0 0 40px!important;width:40px!important;min-width:40px!important;height:40px!important;}
  header>div.relative{min-width:0!important;}
  header>div.relative:first-of-type{flex:1 1 auto!important;}
  header>div.relative:nth-of-type(2){flex:0 0 auto!important;}
  #modelBtn{max-width:100%!important;min-width:0!important;overflow:hidden!important;}
  #modelLabel{display:block!important;max-width:calc(100% - 18px)!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;}
  #modeBtn{display:none!important;}
  header>.ml-auto{margin-left:auto!important;display:flex!important;flex:0 0 auto!important;min-width:0!important;gap:2px!important;}
  #webBtn,#voiceBtn{display:flex!important;align-items:center!important;justify-content:center!important;flex:0 0 40px!important;width:40px!important;min-width:40px!important;max-width:40px!important;height:40px!important;padding:0!important;}
  #webBtn span,#voiceBtn span{display:none!important;}
  #scroll{width:100%!important;max-width:100%!important;min-width:0!important;flex:1 1 auto!important;overflow-x:hidden!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;}
  #welcome,#messages{box-sizing:border-box!important;width:100%!important;max-width:100%!important;min-width:0!important;}
  #welcome{padding:20px 12px 120px!important;}
  #messages{padding:16px 12px 130px!important;}
  .msg-in,.prose-df,.codeblock{min-width:0!important;max-width:100%!important;overflow-wrap:anywhere!important;}
  .prose-df pre,.codeblock pre{max-width:100%!important;overflow-x:auto!important;}
  img,video,canvas,iframe{max-width:100%!important;height:auto;}
  main>div:last-child{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;padding:6px!important;padding-bottom:max(6px,env(safe-area-inset-bottom))!important;}
  #attachRow{max-width:100%!important;overflow-x:auto!important;}
  #composer{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;display:flex!important;}
  #input{flex:1 1 auto!important;min-width:0!important;width:auto!important;font-size:16px!important;}
  #attachBtn,#imgBtn,#stopBtn,#sendBtn{flex:0 0 40px!important;width:40px!important;min-width:40px!important;max-width:40px!important;height:40px!important;}
  #sidebar{position:fixed!important;inset:0 auto 0 0!important;width:min(88vw,330px)!important;height:100dvh!important;z-index:60!important;transform:translate3d(-105%,0,0)!important;}
  #sidebar.open{transform:translate3d(0,0,0)!important;}
  #sidebarBackdrop{z-index:55!important;}
  #modelMenu,#modeMenu{position:fixed!important;left:8px!important;right:8px!important;top:64px!important;width:auto!important;max-height:65dvh!important;overflow:auto!important;z-index:100!important;}
}
@media (max-width:430px){
  header{padding-left:3px!important;padding-right:3px!important;}
  #openSidebar,#webBtn,#voiceBtn{flex-basis:38px!important;width:38px!important;min-width:38px!important;max-width:38px!important;height:38px!important;}
  #modelBtn{font-size:12px!important;padding-left:5px!important;padding-right:5px!important;}
  #attachBtn,#imgBtn,#stopBtn,#sendBtn{flex-basis:38px!important;width:38px!important;min-width:38px!important;max-width:38px!important;height:38px!important;}
}
@media (max-width:360px){
  #modelLabel{font-size:11px!important;}
}
`;
  function install(){
    if(document.getElementById('defgodqe-hard-mobile-fix'))return;
    const s=document.createElement('style');s.id='defgodqe-hard-mobile-fix';s.textContent=css;document.head.appendChild(s);
  }
  install();
})();
