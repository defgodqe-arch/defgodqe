/* defgodqe — TikTok-style social homepage entry inside Doom Scroll */
(function(){
  'use strict';
  if(window.__defgodqeSocialEntry)return;
  window.__defgodqeSocialEntry=true;
  const STYLE_ID='dfDoomSocialEntryStyle',BUTTON_ID='dfDoomSocialHome';
  function openSocialHome(){
    const social=document.getElementById('dfSocial');
    if(!social){alert('Social Home is still loading. Try again in a moment.');return;}
    const home=social.querySelector('.df-s-tab[data-page="home"]');
    if(home)home.click();
    social.classList.add('open');
    document.body.style.overflow='hidden';
  }
  function addButton(){
    const overlay=document.getElementById('dfDoomOverlay');
    if(!overlay)return false;
    if(!document.getElementById(STYLE_ID)){
      const style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
        #${BUTTON_ID}{position:fixed!important;top:18px!important;left:18px!important;z-index:2147483646!important;height:48px!important;min-width:142px!important;padding:0 17px!important;border:1px solid rgba(255,255,255,.28)!important;border-radius:999px!important;background:rgba(12,12,18,.92)!important;backdrop-filter:blur(16px)!important;color:#fff!important;font:800 14px Inter,system-ui,sans-serif!important;cursor:pointer!important;align-items:center!important;justify-content:center!important;gap:8px!important;box-shadow:0 6px 28px rgba(0,0,0,.5)!important;pointer-events:auto!important;visibility:visible!important;opacity:1!important}
        #${BUTTON_ID}:hover{transform:scale(1.04);background:rgba(35,35,45,.98)!important}#${BUTTON_ID}:active{transform:scale(.97)}
        @media(max-width:600px){#${BUTTON_ID}{top:12px!important;left:12px!important;height:44px!important;min-width:130px!important;font-size:13px!important}}
      `;document.head.appendChild(style);
    }
    let btn=document.getElementById(BUTTON_ID);
    if(!btn){
      btn=document.createElement('button');btn.id=BUTTON_ID;btn.type='button';btn.setAttribute('aria-label','Open defgodqe social home');btn.innerHTML='<span style="font-size:19px">⌂</span><span>Social Home</span>';
      btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openSocialHome()});
      document.body.appendChild(btn);
    }
    btn.style.display=overlay.classList.contains('df-open')?'flex':'none';
    return true;
  }
  function watch(){
    addButton();
    new MutationObserver(addButton).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch,{once:true});else watch();
})();
