/* defgodqe — Doom Scroll: working TikTok vertical feed */
(function(){
'use strict';
if(window.__defgodqeDoomScroll)return;
window.__defgodqeDoomScroll=true;

// TikTok official Player embeds. Only one iframe is kept alive at a time.
const TIKTOK_POSTS=[
  '6718335390845095173',
  '7080213458555737986',
  '7080217258545735586',
  '7077642457847994444',
  '7080217258529732386'
];
const VIDEO_COUNT=100;
const slots=Array.from({length:VIDEO_COUNT},(_,i)=>i);
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
let order=shuffle(slots.slice());

const style=document.createElement('style');
style.textContent=`
#dfDoomOverlay{position:fixed;inset:0;z-index:99990;background:#000;display:none;overflow:hidden}
#dfDoomOverlay.df-open{display:block}
#dfDoomFeed{position:absolute;inset:0;width:100%;height:100%;overflow-y:auto;overflow-x:hidden;scroll-snap-type:y mandatory;overscroll-behavior:contain;scrollbar-width:none;touch-action:pan-y;-webkit-overflow-scrolling:touch}
#dfDoomFeed::-webkit-scrollbar{display:none}
.df-doom-card{position:relative;height:100dvh;min-height:100dvh;width:100%;scroll-snap-align:start;background:#000;overflow:hidden}
.df-doom-card.active{z-index:2}
.df-doom-player{position:absolute;inset:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#000;overflow:hidden}
.df-doom-player iframe{display:block;width:min(100vw,56.25dvh);height:min(100dvh,177.7778vw);max-width:100vw;max-height:100dvh;aspect-ratio:9/16;border:0;background:#000}
#dfDoomExit{position:fixed;top:18px;right:18px;z-index:100000;width:46px;height:46px;border:1px solid rgba(255,255,255,.28);border-radius:50%;background:rgba(15,15,20,.84);backdrop-filter:blur(12px);color:#fff;font-size:26px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,.45)}
#dfDoomStatus{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:100001;padding:8px 12px;border-radius:999px;background:rgba(0,0,0,.7);color:#fff;font:600 12px system-ui;opacity:0;pointer-events:none;transition:opacity .2s}
#dfDoomStatus.show{opacity:1}
@media(max-width:600px){#dfDoomExit{top:12px;right:12px;width:44px;height:44px}}
`;
document.head.appendChild(style);

const overlay=document.createElement('div');
overlay.id='dfDoomOverlay';
overlay.innerHTML='<div id="dfDoomFeed"></div><button id="dfDoomExit" type="button" aria-label="Exit video feed" title="Exit">×</button><div id="dfDoomStatus">Loading TikTok…</div>';
document.body.appendChild(overlay);
const feed=overlay.querySelector('#dfDoomFeed');
const exitBtn=overlay.querySelector('#dfDoomExit');
const status=overlay.querySelector('#dfDoomStatus');

for(let i=0;i<VIDEO_COUNT;i++){
  const c=document.createElement('section');
  c.className='df-doom-card';
  c.dataset.index=i;
  feed.appendChild(c);
}

const player=document.createElement('iframe');
player.id='dfDoomTikTok';
player.title='TikTok video';
player.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';
player.setAttribute('scrolling','no');
player.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
let playerWrap=null;
let activeIndex=-1,isOpen=false,scrollTimer=0,loadToken=0;

function postIdFor(position){return TIKTOK_POSTS[order[position]%TIKTOK_POSTS.length]}
function playerUrl(id){return 'https://www.tiktok.com/player/v1/'+id+'?autoplay=1&loop=1&controls=1&description=1&music_info=1&rel=1'}
function showStatus(text){status.textContent=text;status.classList.add('show');clearTimeout(showStatus.timer);showStatus.timer=setTimeout(()=>status.classList.remove('show'),2200)}
function movePlayerTo(card){
  if(!card)return;
  if(!playerWrap){
    playerWrap=document.createElement('div');
    playerWrap.className='df-doom-player';
    playerWrap.appendChild(player);
  }
  card.appendChild(playerWrap);
  document.querySelectorAll('.df-doom-card.active').forEach(x=>x.classList.remove('active'));
  card.classList.add('active');
}
function loadActive(){
  if(!isOpen||activeIndex<0)return;
  const card=feed.querySelector('.df-doom-card[data-index="'+activeIndex+'"]');
  if(!card)return;
  movePlayerTo(card);
  const token=++loadToken;
  const id=postIdFor(activeIndex);
  player.src='about:blank';
  setTimeout(()=>{
    if(!isOpen||token!==loadToken)return;
    player.src=playerUrl(id);
  },20);
  showStatus('Loading TikTok…');
}
function playAt(position,immediate){
  if(!isOpen||position<0||position>=VIDEO_COUNT)return;
  if(position===activeIndex&&!immediate)return;
  activeIndex=position;
  loadActive();
}
function getIndex(){return Math.max(0,Math.min(VIDEO_COUNT-1,Math.round(feed.scrollTop/Math.max(1,feed.clientHeight))))}
function goToVideo(direction){
  if(!isOpen)return;
  const next=Math.max(0,Math.min(VIDEO_COUNT-1,activeIndex+direction));
  if(next===activeIndex)return;
  feed.scrollTo({top:next*Math.max(1,feed.clientHeight),behavior:'smooth'});
  setTimeout(()=>playAt(next,true),180);
}
function open(){
  isOpen=true;
  order=shuffle(slots.slice());
  activeIndex=0;
  loadToken++;
  overlay.classList.add('df-open');
  document.body.style.overflow='hidden';
  feed.scrollTop=0;
  loadActive();
}
function close(){
  isOpen=false;
  loadToken++;
  clearTimeout(scrollTimer);
  player.src='about:blank';
  overlay.classList.remove('df-open');
  document.body.style.overflow='';
}
window.defgodqeDoomScrollOpen=open;
window.defgodqeDoomScrollClose=close;
window.defgodqeDoomScrollNext=()=>goToVideo(1);
window.defgodqeDoomScrollPrev=()=>goToVideo(-1);

exitBtn.addEventListener('click',close);
feed.addEventListener('scroll',()=>{
  if(!isOpen)return;
  clearTimeout(scrollTimer);
  scrollTimer=setTimeout(()=>{
    const i=getIndex();
    if(i!==activeIndex)playAt(i,true);
  },90);
},{passive:true});

// Desktop mouse-wheel navigation.
let wheelLocked=false;
document.addEventListener('wheel',e=>{
  if(!isOpen)return;
  if(e.target.closest('#dfDoomTikTok'))return;
  if(wheelLocked)return;
  wheelLocked=true;
  goToVideo(e.deltaY>0?1:-1);
  setTimeout(()=>wheelLocked=false,280);
},{passive:true});

document.addEventListener('keydown',e=>{
  if(!isOpen)return;
  if(e.key==='Escape'){e.preventDefault();close()}
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
  wrap.innerHTML='<button id="dfDoomBtn" type="button" class="flex w-full items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-brand/10"><span style="font-size:17px">📱</span><span>Doom scroll</span><span style="margin-left:auto;font-size:10px;color:#facc15">TIKTOK</span></button>';
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
