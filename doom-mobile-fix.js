/* defgodqe — mobile Doom Scroll swipe support */
(function(){
'use strict';
if(window.__defgodqeDoomMobileFix)return;
window.__defgodqeDoomMobileFix=true;

function install(){
  const overlay=document.getElementById('dfDoomOverlay');
  const feed=document.getElementById('dfDoomFeed');
  if(!overlay||!feed)return false;
  if(feed.dataset.mobileSwipeReady==='1')return true;
  feed.dataset.mobileSwipeReady='1';

  const style=document.createElement('style');
  style.textContent=`
    @media(max-width:700px){
      #dfDoomFeed{touch-action:none!important;overflow-y:hidden!important;overflow-x:hidden!important;overscroll-behavior:none!important;user-select:none!important;-webkit-user-select:none!important}
      #dfDoomOverlay.df-open{touch-action:none!important}
    }
  `;
  document.head.appendChild(style);

  let startY=0,startX=0,startTime=0,moved=false,locked=false;
  const threshold=45;
  feed.addEventListener('touchstart',e=>{
    if(!overlay.classList.contains('df-open')||!e.touches[0])return;
    const t=e.touches[0];
    startY=t.clientY;startX=t.clientX;startTime=Date.now();moved=false;
  },{passive:true});

  feed.addEventListener('touchmove',e=>{
    if(!overlay.classList.contains('df-open')||!e.touches[0])return;
    const t=e.touches[0];
    const dy=t.clientY-startY,dx=t.clientX-startX;
    if(Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx))moved=true;
    if(moved)e.preventDefault();
  },{passive:false});

  feed.addEventListener('touchend',e=>{
    if(!overlay.classList.contains('df-open')||!moved||locked)return;
    const dy=(e.changedTouches[0]?.clientY??startY)-startY;
    const elapsed=Date.now()-startTime;
    if(Math.abs(dy)<threshold)return;
    locked=true;
    if(typeof window.defgodqeDoomScrollNext==='function'&&dy<0)window.defgodqeDoomScrollNext();
    else if(typeof window.defgodqeDoomScrollPrev==='function'&&dy>0)window.defgodqeDoomScrollPrev();
    else{
      const cards=Math.max(1,Math.round(innerHeight));
      const current=Math.max(0,Math.min(999,Math.round(feed.scrollTop/cards)));
      const next=Math.max(0,Math.min(999,current+(dy<0?1:-1)));
      feed.scrollTop=next*cards;
      feed.dispatchEvent(new Event('scroll'));
    }
    window.setTimeout(()=>{locked=false},260);
    void elapsed;
  },{passive:true});

  return true;
}

if(!install()){
  const mo=new MutationObserver(()=>{if(install())mo.disconnect()});
  mo.observe(document.body,{childList:true,subtree:true});
}
})();
