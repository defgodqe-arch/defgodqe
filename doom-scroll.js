/* defgodqe — Doom Scroll: video-only fullscreen YouTube feed */
(function(){
'use strict';
if(window.__defgodqeDoomScroll)return;
window.__defgodqeDoomScroll=true;

const VIDEO_IDS=['SiUXHEvd_rA','G1DG_OV5oww','o6XRvViYlug','N3cAVsH5pW4','V6bPomtNnis','YpecVts2qqc','wLaM_GLdZto','Pvl12OOpSXM','RBYgcczTUYs','i8-YZWlSJFk','meEy3Jg4INM','HvaXcZAVpB8','QfYwCuvhgGE','hKT2kCj6V-I','PURhWbQOjew','uqN5jWFYS00','ciIAcD4eXsI','dq8xGCBSBcQ','ZtVfmhhZrkg','TciQ1iOKBkA','cu61ElxVFlo','G4NzI382ZM','40j6qvMDVrE','NSmY5cVTBB4','8jCzEQPz9n0','Sca9-pD1lXo','LLoUQnD_UdM','9ldmPrQRGj4','SNI4d-mMgcA'];
const VIDEO_COUNT=1000;
const slots=Array.from({length:VIDEO_COUNT},(_,i)=>i);
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
let order=shuffle(slots.slice());

const style=document.createElement('style');style.textContent=`
#dfDoomOverlay{position:fixed;inset:0;z-index:99990;background:#000;display:none;overflow:hidden;contain:strict}
#dfDoomOverlay.df-open{display:block}
#dfDoomFeed{position:absolute;inset:0;width:100%;height:100%;overflow-y:auto;overflow-x:hidden;scroll-snap-type:y mandatory;overscroll-behavior:contain;scrollbar-width:none;touch-action:pan-y;contain:strict;-webkit-overflow-scrolling:touch}
#dfDoomFeed::-webkit-scrollbar{display:none}
.df-doom-card{height:100dvh;min-height:100dvh;width:100%;scroll-snap-align:start;background:#000;contain:strict}
.df-doom-player{position:fixed!important;inset:0!important;width:100%!important;height:100%!important;display:flex!important;align-items:center!important;justify-content:center!important;z-index:99991!important;background:#000!important;padding:0!important;pointer-events:none!important;contain:strict;overflow:hidden}
#dfDoomPlayer{position:relative!important;display:block!important;width:min(100vw,56.25dvh)!important;height:min(100dvh,177.7778vw)!important;max-width:100vw!important;max-height:100dvh!important;aspect-ratio:9/16!important;border:0!important;background:#000!important;pointer-events:none!important;visibility:visible!important;opacity:1!important;contain:strict;overflow:hidden}
#dfDoomPlayer iframe{position:absolute!important;top:0!important;left:0!important;width:100%!important;height:100%!important;border:0!important;pointer-events:none!important}
#dfDoomExit{position:fixed;top:18px;right:18px;z-index:100000;width:46px;height:46px;border:1px solid rgba(255,255,255,.25);border-radius:50%;background:rgba(15,15,20,.78);backdrop-filter:blur(12px);color:#fff;font-size:26px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,.35);transition:transform .15s ease,background .15s ease}
#dfDoomExit:hover{transform:scale(1.08);background:rgba(40,40,48,.9)}
#dfDoomExit:active{transform:scale(.95)}
`;
document.head.appendChild(style);

const overlay=document.createElement('div');
overlay.id='dfDoomOverlay';
overlay.innerHTML='<div id="dfDoomFeed"></div><button id="dfDoomExit" type="button" aria-label="Exit video feed" title="Exit">×</button>';
document.body.appendChild(overlay);
const feed=overlay.querySelector('#dfDoomFeed');
const exitBtn=overlay.querySelector('#dfDoomExit');

for(let i=0;i<VIDEO_COUNT;i++){
  const c=document.createElement('section');
  c.className='df-doom-card';
  c.dataset.index=i;
  feed.appendChild(c);
}

const playerWrap=document.createElement('div');
playerWrap.className='df-doom-player';
playerWrap.innerHTML='<div id="dfDoomPlayer"></div>';
overlay.appendChild(playerWrap);

let ytPlayer=null,ytReady=false,activeIndex=-1,isOpen=false,playToken=0;
let scrollTimer=0;
function videoIdFor(position){return VIDEO_IDS[order[position]%VIDEO_IDS.length]}
function ensureYouTube(){
  if(window.YT&&window.YT.Player){createPlayer();return}
  if(document.getElementById('dfDoomYTApi'))return;
  const s=document.createElement('script');
  s.id='dfDoomYTApi';
  s.src='https://www.youtube.com/iframe_api';
  s.async=true;
  document.head.appendChild(s);
  const previous=window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady=function(){
    if(typeof previous==='function')try{previous()}catch(_){}
    createPlayer();
  };
}
function createPlayer(){
  if(ytPlayer||!window.YT||!window.YT.Player)return;
  ytPlayer=new YT.Player('dfDoomPlayer',{
    width:'100%',height:'100%',videoId:videoIdFor(Math.max(0,activeIndex)),
    playerVars:{autoplay:0,controls:0,playsinline:1,rel:0,enablejsapi:1,disablekb:1,fs:0,iv_load_policy:3,cc_load_policy:0,modestbranding:1,origin:location.origin},
    events:{
      onReady:function(){ytReady=true;if(isOpen&&activeIndex>=0)loadActive(true)},
      onStateChange:function(event){
        if(isOpen&&event.data===2){
          clearTimeout(window.__dfDoomResumeTimer);
          window.__dfDoomResumeTimer=setTimeout(()=>{if(isOpen&&ytReady&&ytPlayer)try{ytPlayer.playVideo()}catch(_){}},80);
        }
      },
      onError:function(){}
    }
  });
}
function loadActive(auto){
  if(!ytReady||!ytPlayer||activeIndex<0)return;
  const id=videoIdFor(activeIndex),token=++playToken;
  try{
    ytPlayer.loadVideoById(id);
    if(auto)setTimeout(()=>{if(isOpen&&token===playToken&&ytPlayer)try{ytPlayer.playVideo();ytPlayer.unMute();ytPlayer.setVolume(100)}catch(_){}},120);
  }catch(_){}
}
function playAt(position,immediate){
  if(!isOpen||position<0||position>=VIDEO_COUNT)return;
  if(position===activeIndex&&!immediate)return;
  activeIndex=position;
  if(!ytPlayer){ensureYouTube();return}
  loadActive(true);
}
function getIndex(){return Math.max(0,Math.min(VIDEO_COUNT-1,Math.round(feed.scrollTop/Math.max(1,innerHeight))))}
function goToVideo(direction){
  if(!isOpen)return;
  const next=Math.max(0,Math.min(VIDEO_COUNT-1,activeIndex+direction));
  if(next===activeIndex)return;
  feed.scrollTop=next*Math.max(1,innerHeight);
  playAt(next,true);
}
function open(){
  isOpen=true;
  order=shuffle(slots.slice());
  activeIndex=0;
  playToken++;
  overlay.classList.add('df-open');
  document.body.style.overflow='hidden';
  feed.scrollTop=0;
  ensureYouTube();
  if(ytReady)loadActive(true);
}
function close(){
  isOpen=false;
  playToken++;
  clearTimeout(scrollTimer);
  clearTimeout(window.__dfDoomResumeTimer);
  if(ytReady&&ytPlayer)try{ytPlayer.stopVideo()}catch(_){}
  overlay.classList.remove('df-open');
  document.body.style.overflow='';
}
window.defgodqeDoomScrollOpen=open;
window.defgodqeDoomScrollClose=close;
exitBtn.addEventListener('click',close);

feed.addEventListener('scroll',()=>{
  if(!isOpen)return;
  clearTimeout(scrollTimer);
  scrollTimer=setTimeout(()=>{const i=getIndex();if(i!==activeIndex)playAt(i,true)},140);
},{passive:true});

let wheelLocked=false;
feed.addEventListener('wheel',e=>{
  if(!isOpen)return;
  e.preventDefault();
  if(wheelLocked)return;
  wheelLocked=true;
  goToVideo(e.deltaY>0?1:-1);
  window.setTimeout(()=>{wheelLocked=false},260);
},{passive:false});

document.addEventListener('keydown',e=>{
  if(!isOpen)return;
  if(e.key==='Escape')close();
  if(e.key==='ArrowDown'){e.preventDefault();goToVideo(1)}
  if(e.key==='ArrowUp'){e.preventDefault();goToVideo(-1)}
});

function addSidebarButton(){
  if(document.getElementById('dfDoomBtn'))return true;
  const sidebar=document.getElementById('sidebar');
  if(!sidebar)return false;
  const user=sidebar.querySelector('#authRow')?.parentElement;
  if(!user)return false;
  const wrap=document.createElement('div');
  wrap.className='px-3 pb-2';
  wrap.innerHTML='<button id="dfDoomBtn" type="button" class="flex w-full items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-brand/10"><span style="font-size:17px">📱</span><span>Doom scroll</span><span style="margin-left:auto;font-size:10px;color:#facc15">1000 SHORTS</span></button>';
  const mini=sidebar.querySelector('#dfGameBtn')?.closest('.px-3.pb-2');
  if(mini)mini.after(wrap);else user.before(wrap);
  document.getElementById('dfDoomBtn').onclick=open;
  return true;
}
if(!addSidebarButton()){
  const mo=new MutationObserver(()=>{if(addSidebarButton())mo.disconnect()});
  mo.observe(document.body,{childList:true,subtree:true});
}
})();
