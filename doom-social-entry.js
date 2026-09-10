/* defgodqe — TikTok-style social homepage entry inside Doom Scroll */
(function(){
  'use strict';
  if(window.__defgodqeSocialEntry)return;
  window.__defgodqeSocialEntry=true;

  const STYLE_ID='dfDoomSocialEntryStyle';
  const BUTTON_ID='dfDoomSocialHome';

  function addButton(){
    const overlay=document.getElementById('dfDoomOverlay');
    if(!overlay || document.getElementById(BUTTON_ID)) return !!overlay;

    if(!document.getElementById(STYLE_ID)){
      const style=document.createElement('style');
      style.id=STYLE_ID;
      style.textContent=`
        #${BUTTON_ID}{
          position:fixed;top:18px;left:18px;z-index:100001;
          height:46px;padding:0 16px;border:1px solid rgba(255,255,255,.22);
          border-radius:24px;background:rgba(15,15,20,.78);backdrop-filter:blur(14px);
          color:#fff;font:700 14px Inter,system-ui,sans-serif;cursor:pointer;
          display:flex;align-items:center;gap:8px;box-shadow:0 4px 20px rgba(0,0,0,.35);
          transition:transform .15s ease,background .15s ease;
        }
        #${BUTTON_ID}:hover{transform:translateY(-1px) scale(1.03);background:rgba(40,40,48,.92)}
        #${BUTTON_ID}:active{transform:scale(.97)}
        @media(max-width:600px){#${BUTTON_ID}{top:12px;left:12px;height:42px;padding:0 13px;font-size:13px}}
      `;
      document.head.appendChild(style);
    }

    const btn=document.createElement('button');
    btn.id=BUTTON_ID;
    btn.type='button';
    btn.setAttribute('aria-label','Open defgodqe social home');
    btn.innerHTML='<span style="font-size:17px">⌂</span><span>Social Home</span>';
    btn.addEventListener('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      const social=document.getElementById('dfSocial');
      if(!social){
        alert('Social Home is still loading. Try again in a moment.');
        return;
      }
      const home=social.querySelector('.df-s-tab[data-page="home"]');
      if(home) home.click();
      social.classList.add('open');
      document.body.style.overflow='hidden';
    });
    overlay.appendChild(btn);
    return true;
  }

  function watch(){
    if(addButton()) return;
    const mo=new MutationObserver(function(){
      if(addButton()) mo.disconnect();
    });
    mo.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',watch,{once:true});
  else watch();
})();
