/* defgodqe — Doom Scroll: native fullscreen vertical video feed */
(function(){
'use strict';
if(window.__defgodqeDoomScroll)return;
window.__defgodqeDoomScroll=true;

/*
 * Add your own MP4/WebM video URLs here.
 * These are played by the browser's native <video> element — no YouTube player,
 * iframe, YouTube branding, or YouTube controls are used.
 */
const VIDEO_URLS=[
  '/videos/short-01.mp4',
  '/videos/short-02.mp4',
  '/videos/short-03.mp4',
  '/videos/short-04.mp4',
  '/videos/short-05.mp4'
];
const VIDEO_COUNT=1000;
const slots=Array.from({length:VIDEO_COUNT},(_,i)=>i);
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
let order=shuffle(slots.slice());

const style=document.createElement('style');style.textContent=`
#dfDoomOverlay{position:fixed;inset:0;z-index:99990;background:#000;display:none;overflow:hidden}
#dfDoomOverlay.df-open{display:block}
#dfDoomFeed{position:absolute;inset:0;width:100%;height:100%;overflow-y:auto;overflow-x:hidden;scroll-snap-type:y mandatory;overscroll-behavior:contain;scrollbar-width:none;touch-action:pan-y}
#dfDoomFeed::-webkit-scrollbar{display:none}
.df-doom-card{height:100dvh;min-height:100dvh;width:100%;scroll-snap-align:start;scroll-snap-stop:always;background:#000}
.df-doom-player{position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;display:flex!important;align-items:center!important;justify-content:center!important;z-index:99991!important;background:#000;pointer-events:none!important}
#dfDoomVideo{display:block!important;width:100vw!important;height:100dvh!important;object-fit:contain!important;background:#000!important;pointer-events:none!important}
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
playerWrap.innerHTML='<video id="dfDoomVideo" playsinline preload="auto" muted></video>';
overlay.appendChild(playerWrap);
const video=playerWrap.querySelector('#dfDoomVideo');

let activeIndex=-1,isOpen=false,playToken=0;
function videoUrlFor(position){return VIDEO_URLS[order[position]%VIDEO_URLS.length]}
function loadActive(auto){
  if(!isOpen||activeIndex<0||!VIDEO_URLS.length)return;
  const token=++playToken;
  const src=videoUrlFor(activeIndex);
  if(video.src!==new URL(src,location.href).href)video.src=src;
  else video.currentTime=0;
  video.load();
  video.muted=false;
  if(auto){
    const play=()=>{if(isOpen&&token===playToken)video.play().catch(()=>{video.muted=true;video.play().catch(()=>{})})};
    video.addEventListener('canplay',play,{once:true});
    setTimeout(play,100);
  }
}
function playAt(position){
  if(!isOpen||position<0||position>=VIDEO_COUNT)return;
  activeIndex=position;
  loadActive(true);
}
function goToVideo(direction){
  if(!isOpen)return;
  const next=Math.max(0,Math.min(VIDEO_COUNT-1,activeIndex+direction));
  if(next===activeIndex)return;
  feed.scrollTo({top:next*Math.max(1,innerHeight),behavior:'smooth'});
  playAt(next);
}
function open(){
  isOpen=true;
  order=shuffle(slots.slice());
  activeIndex=0;
  playToken++;
  overlay.classList.add('df-open');
  document.body.style.overflow='hidden';
  feed.scrollTop=0;
  loadActive(true);
}
function close(){
  isOpen=false;
  playToken++;
  video.pause();
  video.removeAttribute('src');
  video.load();
  overlay.classList.remove('df-open');
  document.body.style.overflow='';
}
window.defgodqeDoomScrollOpen=open;
window.defgodqeDoomScrollClose=close;
exitBtn.addEventListener('click',close);

let scrollRaf=0;
feed.addEventListener('scroll',()=>{
  if(scrollRaf)return;
  scrollRaf=requestAnimationFrame(()=>{
    scrollRaf=0;
    if(!isOpen)return;
    const i=Math.max(0,Math.min(VIDEO_COUNT-1,Math.round(feed.scrollTop/Math.max(1,innerHeight))));
    if(i!==activeIndex)playAt(i);
  });
},{passive:true});

/* Mouse wheel: one wheel action = one video. */
let wheelLocked=false;
feed.addEventListener('wheel',e=>{
  if(!isOpen)return;
  e.preventDefault();
  if(wheelLocked)return;
  wheelLocked=true;
  goToVideo(e.deltaY>0?1:-1);
  window.setTimeout(()=>{wheelLocked=false},350);
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
