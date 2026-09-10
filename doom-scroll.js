/* defgodqe — Doom Scroll: official TikTok player feed */
(function(){
'use strict';
if(window.__defgodqeDoomScroll)return;
window.__defgodqeDoomScroll=true;

const TIKTOK_POSTS=['6718335390845095173'];
const VIDEO_COUNT=100;
const FALLBACK_MESSAGE='No playable TikTok videos are configured yet.';
let activeIndex=0,isOpen=false,scrollTimer=0;

const style=document.createElement('style');style.textContent=`
#dfDoomOverlay{position:fixed;inset:0;z-index:99990;background:#000;display:none;overflow:hidden}#dfDoomOverlay.df-open{display:block}
#dfDoomFeed{position:absolute;inset:0;overflow-y:auto;scroll-snap-type:y mandatory;overscroll-behavior:contain;scrollbar-width:none}#dfDoomFeed::-webkit-scrollbar{display:none}
.df-doom-card{height:100dvh;scroll-snap-align:start;background:#000;display:flex;align-items:center;justify-content:center;position:relative}
.df-doom-player{width:min(100vw,56.25dvh);height:min(100dvh,177.7778vw);aspect-ratio:9/16;background:#000;position:relative}
.df-doom-player iframe{width:100%;height:100%;border:0;background:#000}
.df-doom-empty{color:#fff;font:600 16px system-ui;text-align:center;padding:28px}.df-doom-empty small{display:block;color:#aaa;margin-top:10px;font-weight:400}
#dfDoomExit{position:fixed;top:18px;right:18px;z-index:100001;width:46px;height:46px;border:1px solid rgba(255,255,255,.25);border-radius:50%;background:rgba(15,15,20,.82);color:#fff;font-size:26px;cursor:pointer}
`;document.head.appendChild(style);

const overlay=document.createElement('div');overlay.id='dfDoomOverlay';overlay.innerHTML='<div id="dfDoomFeed"></div><button id="dfDoomExit" type="button" aria-label="Close Doom Scroll">×</button>';document.body.appendChild(overlay);
const feed=overlay.querySelector('#dfDoomFeed');

function cleanId(value){
  if(value==null)return null;
  const s=String(value).trim();
  if(/^\d{15,25}$/.test(s))return s;
  try{const u=new URL(s);const m=u.pathname.match(/\/video\/(\d+)/);return m?m[1]:null;}catch{return null;}
}
function getPosts(){
  const injected=Array.isArray(window.defgodqeTikTokPosts)?window.defgodqeTikTokPosts:[];
  return [...new Set([...TIKTOK_POSTS,...injected].map(cleanId).filter(Boolean))];
}
function playerUrl(id,autoplay=false){
  return 'https://www.tiktok.com/player/v1/'+encodeURIComponent(id)+'?autoplay='+(autoplay?'1':'0')+'&loop=1&controls=1&description=1&music_info=1&rel=1';
}
function postMessage(iframe,message){try{iframe.contentWindow?.postMessage(message,'*');}catch{}}

function render(){
  feed.innerHTML='';
  const posts=getPosts();
  if(!posts.length){
    const card=document.createElement('section');card.className='df-doom-card';
    card.innerHTML='<div class="df-doom-empty">'+FALLBACK_MESSAGE+'<small>Connect TikTok Display API or add public TikTok post IDs.</small></div>';
    feed.appendChild(card);return;
  }
  for(let i=0;i<VIDEO_COUNT;i++){
    const id=posts[i%posts.length];
    const card=document.createElement('section');card.className='df-doom-card';card.dataset.index=i;
    const player=document.createElement('div');player.className='df-doom-player';
    const iframe=document.createElement('iframe');
    iframe.dataset.index=i;iframe.dataset.tiktokId=id;
    iframe.loading=i<2?'eager':'lazy';
    iframe.allow='autoplay; fullscreen; picture-in-picture';iframe.allowFullscreen=true;
    iframe.title='TikTok video';iframe.src=playerUrl(id,false);
    player.appendChild(iframe);card.appendChild(player);feed.appendChild(card);
  }
}

function getIframes(){return [...feed.querySelectorAll('iframe[data-index]')];}
function pauseAll(exceptIndex=-1){
  getIframes().forEach(frame=>{const i=Number(frame.dataset.index);if(i!==exceptIndex)postMessage(frame,{type:'pause'});});
}
function playOnly(index){
  if(!isOpen)return;
  pauseAll(index);
  const frame=feed.querySelector('iframe[data-index="'+index+'"]');
  if(!frame)return;
  /* Load the active player with autoplay enabled, then explicitly play it. */
  const id=frame.dataset.tiktokId;
  const desired=playerUrl(id,true);
  if(frame.src!==desired)frame.src=desired;
  postMessage(frame,{type:'play'});
}
function stopAll(){pauseAll(-1);getIframes().forEach(frame=>postMessage(frame,{type:'mute'}));}

window.defgodqeDoomAddTikTok=function(value){
  const id=cleanId(value);if(!id)return false;
  if(!Array.isArray(window.defgodqeTikTokPosts))window.defgodqeTikTokPosts=[];
  if(!window.defgodqeTikTokPosts.includes(id))window.defgodqeTikTokPosts.push(id);
  render();return true;
};
window.defgodqeDoomSetTikToks=function(values){
  window.defgodqeTikTokPosts=Array.isArray(values)?values.map(cleanId).filter(Boolean):[];
  render();return getPosts();
};

render();
function getIndex(){return Math.max(0,Math.min(VIDEO_COUNT-1,Math.round(feed.scrollTop/Math.max(1,innerHeight))));}
function go(dir){const n=Math.max(0,Math.min(VIDEO_COUNT-1,activeIndex+dir));activeIndex=n;feed.scrollTo({top:n*innerHeight,behavior:'smooth'});setTimeout(()=>playOnly(activeIndex),320);}
function open(){
  isOpen=true;activeIndex=0;render();overlay.classList.add('df-open');document.body.style.overflow='hidden';feed.scrollTop=0;
  setTimeout(()=>playOnly(0),250);
}
function close(){isOpen=false;clearTimeout(scrollTimer);stopAll();overlay.classList.remove('df-open');document.body.style.overflow='';}
window.defgodqeDoomScrollOpen=open;window.defgodqeDoomScrollClose=close;
overlay.querySelector('#dfDoomExit').onclick=close;

feed.addEventListener('scroll',()=>{
  clearTimeout(scrollTimer);
  scrollTimer=setTimeout(()=>{
    const next=getIndex();
    if(next!==activeIndex){activeIndex=next;playOnly(activeIndex);}else playOnly(activeIndex);
  },80);
},{passive:true});

let wheelLocked=false;
feed.addEventListener('wheel',e=>{if(!isOpen)return;e.preventDefault();if(wheelLocked)return;wheelLocked=true;go(e.deltaY>0?1:-1);setTimeout(()=>wheelLocked=false,280);},{passive:false});
document.addEventListener('keydown',e=>{if(!isOpen)return;if(e.key==='Escape')close();if(e.key==='ArrowDown'){e.preventDefault();go(1);}if(e.key==='ArrowUp'){e.preventDefault();go(-1);}});

/* Enforce one active player and stop playback whenever Doom Scroll is left. */
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll();else if(isOpen)playOnly(activeIndex);});

function addSidebarButton(){
  if(document.getElementById('dfDoomBtn'))return true;
  const sidebar=document.getElementById('sidebar');if(!sidebar)return false;
  const user=sidebar.querySelector('#authRow')?.parentElement;if(!user)return false;
  const wrap=document.createElement('div');wrap.className='px-3 pb-2';
  wrap.innerHTML='<button id="dfDoomBtn" type="button" class="flex w-full items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-3 py-2.5 text-sm font-semibold text-slate-200"><span>📱</span><span>Doom scroll</span><span style="margin-left:auto;font-size:10px;color:#facc15">TIKTOK</span></button>';
  user.before(wrap);document.getElementById('dfDoomBtn').onclick=open;return true;
}
if(!addSidebarButton()){const mo=new MutationObserver(()=>{if(addSidebarButton())mo.disconnect();});mo.observe(document.body,{childList:true,subtree:true});}
})();
