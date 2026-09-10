/* defgodqe — Doom Scroll: clean direct-video fullscreen feed + temporary cache */
(function(){
'use strict';
if(window.__defgodqeDoomScroll)return;
window.__defgodqeDoomScroll=true;
const VIDEO_SOURCES=[];
const VIDEO_COUNT=1000;
const PRELOAD_COUNT=10;
const CACHE_NAME='defgodqe-doom-temporary-v3';
const slots=Array.from({length:VIDEO_COUNT},(_,i)=>i);
const shuffle=a=>{for(let i=a.length-1;i>0;i--;){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
let order=shuffle(slots.slice());
let cacheEnabled=typeof caches!=='undefined'&&VIDEO_SOURCES.length>0;
let cacheWarm=new Set();
const style=document.createElement('style');style.textContent=`
#dfDoomOverlay{position:fixed;inset:0;z-index:99990;background:#000;display:none;overflow:hidden;contain:strict}
#dfDoomOverlay.df-open{display:block}
#dfDoomFeed{position:absolute;inset:0;width:100%;height:100%;overflow-y:auto;overflow-x:hidden;scroll-snap-type:y mandatory;overscroll-behavior:contain;scrollbar-width:none;touch-action:pan-y;contain:strict;-webkit-overflow-scrolling:touch}
#dfDoomFeed::-webkit-scrollbar{display:none}
.df-doom-card{height:100dvh;min-height:100dvh;width:100%;scroll-snap-align:start;background:#000;contain:strict}
.df-doom-player{position:fixed!important;inset:0!important;width:100%!important;height:100%!important;display:flex!important;align-items:center!important;justify-content:center!important;z-index:99991!important;background:#000!important;padding:0!important;pointer-events:none!important;contain:strict;overflow:hidden}
#dfDoomVideo{position:relative!important;display:block!important;width:min(100vw,56.25dvh)!important;height:min(100dvh,177.7778vw)!important;max-width:100vw!important;max-height:100dvh!important;aspect-ratio:9/16!important;border:0!important;background:#000!important;pointer-events:none!important;object-fit:contain!important;visibility:visible!important;opacity:1!important;contain:strict;overflow:hidden}
#dfDoomOverlay iframe,#dfDoomOverlay .html5-video-player,#dfDoomOverlay .ytp-chrome-bottom,#dfDoomOverlay .ytp-chrome-top,#dfDoomOverlay .ytp-gradient-bottom,#dfDoomOverlay .ytp-gradient-top,#dfDoomOverlay .ytp-watermark,#dfDoomOverlay .ytp-pause-overlay,#dfDoomOverlay .ytp-endscreen-content,#dfDoomOverlay .ytp-ce-element,#dfDoomOverlay [class*="ytp-"],#dfDoomOverlay [id*="youtube" i],#dfDoomOverlay [class*="youtube" i]{display:none!important;visibility:hidden!important;pointer-events:none!important}
#dfDoomVideo::-webkit-media-controls,#dfDoomVideo::-webkit-media-controls-enclosure,#dfDoomVideo::-webkit-media-controls-panel{display:none!important}
#dfDoomExit{position:fixed;top:18px;right:18px;z-index:100000;width:46px;height:46px;border:1px solid rgba(255,255,255,.25);border-radius:50%;background:rgba(15,15,20,.78);backdrop-filter:blur(12px);color:#fff;font-size:26px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,.35);transition:transform .15s ease,background .15s ease}
#dfDoomExit:hover{transform:scale(1.08);background:rgba(40,40,48,.9)}#dfDoomExit:active{transform:scale(.95)}
`;document.head.appendChild(style);
const overlay=document.createElement('div');overlay.id='dfDoomOverlay';overlay.innerHTML='<div id="dfDoomFeed"></div><button id="dfDoomExit" type="button" aria-label="Exit video feed" title="Exit">×</button>';document.body.appendChild(overlay);
const feed=overlay.querySelector('#dfDoomFeed'),exitBtn=overlay.querySelector('#dfDoomExit');
for(let i=0;i<VIDEO_COUNT;i++){const c=document.createElement('section');c.className='df-doom-card';c.dataset.index=i;feed.appendChild(c)}
const playerWrap=document.createElement('div');playerWrap.className='df-doom-player';playerWrap.innerHTML='<video id="dfDoomVideo" playsinline webkit-playsinline preload="auto" controlslist="nodownload nofullscreen noremoteplayback" disablepictureinpicture></video>';overlay.appendChild(playerWrap);
const doomVideo=playerWrap.querySelector('#dfDoomVideo');let activeIndex=-1,isOpen=false,playToken=0,scrollTimer=0;
function sourceFor(position){return VIDEO_SOURCES.length?VIDEO_SOURCES[order[position]%VIDEO_SOURCES.length]:null}
async function openCache(){if(!cacheEnabled)return null;try{return await caches.open(CACHE_NAME)}catch(_){return null}}
async function clearTemporaryCache(){if(typeof caches==='undefined')return;try{await caches.delete(CACHE_NAME)}catch(_){}cacheWarm.clear()}
async function cacheVideo(url){if(!cacheEnabled||!url)return null;try{const cache=await openCache();if(!cache)return null;const existing=await cache.match(url);if(existing){cacheWarm.add(url);return url}const response=await fetch(url,{mode:'cors',credentials:'omit',cache:'no-store'});if(!response.ok)return null;await cache.put(url,response.clone());cacheWarm.add(url);return url}catch(_){return null}}
async function preloadAround(position){if(!cacheEnabled)return;const jobs=[];for(let d=1;d<=PRELOAD_COUNT;d++){const p=position+d;if(p>=VIDEO_COUNT)break;const u=sourceFor(p);if(u&&!cacheWarm.has(u))jobs.push(cacheVideo(u))}await Promise.allSettled(jobs)}
async function loadActive(auto){const url=sourceFor(activeIndex);if(!url)return;const token=++playToken;const cached=await cacheVideo(url);if(!isOpen||token!==playToken)return;doomVideo.controls=false;doomVideo.src=cached||url;doomVideo.load();if(auto)try{await doomVideo.play()}catch(_){}preloadAround(activeIndex)}
function playAt(position,immediate){if(!isOpen||position<0||position>=VIDEO_COUNT)return;if(position===activeIndex&&!immediate)return;activeIndex=position;loadActive(true)}
function getIndex(){return Math.max(0,Math.min(VIDEO_COUNT-1,Math.round(feed.scrollTop/Math.max(1,innerHeight))))}
function goToVideo(direction){if(!isOpen)return;const next=Math.max(0,Math.min(VIDEO_COUNT-1,activeIndex+direction));if(next===activeIndex)return;feed.scrollTop=next*Math.max(1,innerHeight);playAt(next,true)}
doomVideo.addEventListener('ended',()=>{if(isOpen)goToVideo(1)});
function open(){isOpen=true;order=shuffle(slots.slice());activeIndex=0;playToken++;overlay.classList.add('df-open');document.body.style.overflow='hidden';feed.scrollTop=0;loadActive(true)}
async function close(){isOpen=false;playToken++;clearTimeout(scrollTimer);try{doomVideo.pause()}catch(_){}doomVideo.removeAttribute('src');doomVideo.load();overlay.classList.remove('df-open');document.body.style.overflow='';await clearTemporaryCache()}
window.defgodqeDoomScrollOpen=open;window.defgodqeDoomScrollClose=close;window.defgodqeDoomScrollNext=()=>goToVideo(1);window.defgodqeDoomScrollPrev=()=>goToVideo(-1);window.defgodqeDoomScrollClearCache=clearTemporaryCache;
exitBtn.addEventListener('click',close);feed.addEventListener('scroll',()=>{if(!isOpen)return;clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{const i=getIndex();if(i!==activeIndex)playAt(i,true)},100)},{passive:true});
let wheelLocked=false;feed.addEventListener('wheel',e=>{if(!isOpen)return;e.preventDefault();if(wheelLocked)return;wheelLocked=true;goToVideo(e.deltaY>0?1:-1);setTimeout(()=>{wheelLocked=false},260)},{passive:false});
document.addEventListener('keydown',e=>{if(!isOpen)return;if(e.key==='Escape')close();if(e.key==='ArrowDown'){e.preventDefault();goToVideo(1)}if(e.key==='ArrowUp'){e.preventDefault();goToVideo(-1)}});
function addSidebarButton(){if(document.getElementById('dfDoomBtn'))return true;const sidebar=document.getElementById('sidebar');if(!sidebar)return false;const user=sidebar.querySelector('#authRow')?.parentElement;if(!user)return false;const wrap=document.createElement('div');wrap.className='px-3 pb-2';wrap.innerHTML='<button id="dfDoomBtn" type="button" class="flex w-full items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-brand/10"><span style="font-size:17px">📱</span><span>Doom scroll</span><span style="margin-left:auto;font-size:10px;color:#facc15">1000 SHORTS</span></button>';const mini=sidebar.querySelector('#dfGameBtn')?.closest('.px-3.pb-2');if(mini)mini.after(wrap);else user.before(wrap);document.getElementById('dfDoomBtn').onclick=open;return true}
if(!addSidebarButton()){const mo=new MutationObserver(()=>{if(addSidebarButton())mo.disconnect()});mo.observe(document.body,{childList:true,subtree:true})}
})();