/* defgodqe — Neon Tag inside the Mini Arcade selector */
(function(){
  'use strict';
  if(window.__defgodqeNeonArcade)return;
  window.__defgodqeNeonArcade=true;

  const css=`
    .dfNeonArcadeChoice{position:relative!important;overflow:hidden!important;border-color:rgba(250,204,21,.48)!important;background:linear-gradient(145deg,rgba(250,204,21,.14),rgba(255,255,255,.025))!important;box-shadow:0 0 26px rgba(250,204,21,.12)!important}
    .dfNeonArcadeChoice::after{content:"LIVE";position:absolute;right:12px;top:10px;font:900 9px Inter,system-ui,sans-serif;letter-spacing:.08em;color:#fef08a;border:1px solid rgba(250,204,21,.32);padding:3px 6px;border-radius:999px;background:rgba(250,204,21,.09)}
    .dfNeonArcadeChoice strong{color:#fde047!important;text-shadow:0 0 12px rgba(250,204,21,.3)}
  `;
  const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);

  function launch(){
    if(window.defgodqeMultiplayer?.open){window.defgodqeMultiplayer.open();return true}
    const start=Date.now();
    const timer=setInterval(()=>{
      if(window.defgodqeMultiplayer?.open){clearInterval(timer);window.defgodqeMultiplayer.open();return}
      if(Date.now()-start>8000){clearInterval(timer);alert('Neon Tag is still loading. Please try again in a moment.')}
    },100);
    return false;
  }

  function add(){
    document.querySelectorAll('.dfGameChoices').forEach(grid=>{
      if(grid.querySelector('.dfNeonArcadeChoice'))return;
      const buttons=grid.querySelectorAll('[data-game]');
      if(!buttons.length)return;
      const b=document.createElement('button');
      b.type='button';
      b.className='dfGameChoice dfNeonArcadeChoice';
      b.innerHTML='<strong>⚡ Neon Tag</strong><small>Enter the multiplayer laser freeze arena.</small>';
      b.addEventListener('click',launch);
      grid.appendChild(b);
    });
  }

  function boot(){
    add();
    const mo=new MutationObserver(add);
    mo.observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>mo.disconnect(),30000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();