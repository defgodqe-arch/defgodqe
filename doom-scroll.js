/* defgodqe — Doom Scroll: one real YouTube player, always synced to the visible card */
(function(){
'use strict';
if(window.__defgodqeDoomScroll)return;
window.__defgodqeDoomScroll=true;

const VIDEO_IDS=[
 'SiUXHEvd_rA','G1DG_OV5oww','o6XRvViYlug','N3cAVsH5pW4','V6bPomtNnis','YpecVts2qqc','wLaM_GLdZto','Pvl12OOpSXM',
 'RBYgcczTUYs','i8-YZWlSJFk','meEy3Jg4INM','HvaXcZAVpB8','QfYwCuvhgGE','hKT2kCj6V-I','PURhWbQOjew','uqN5jWFYS00',
 'ciIAcD4eXsI','dq8xGCBSBcQ','ZtVfmhhZrkg','TciQ1iOKBkA','cu61ElxVFlo','G4NzI382ZM','40j6qvMDVrE','NSmY5cVTBB4',
 '8jCzEQPz9n0','Sca9-pD1lXo','LLoUQnD_UdM','9ldmPrQRGj4','SNI4d-mMgcA'
];
const VIDEO_COUNT=1000;
const slots=Array.from({length:VIDEO_COUNT},(_,i)=>i);
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
let order=shuffle(slots.slice());

const style=document.createElement('style');style.textContent=`
#dfDoomOverlay{position:fixed;inset:0;z-index:99990;background:#030407;color:#fff;display:none;overflow:hidden}
#dfDoomOverlay.df-open{display:block}
#dfDoomFeed{position:absolute;inset:0;height:100%;width:100%;overflow-y:auto;scroll-snap-type:y mandatory;overscroll-behavior:contain}
.df-doom-card{position:relative;height:100dvh;width:100%;scroll-snap-align:start;scroll-snap-stop:always;display:flex;align-items:center;justify-content:center;background:#030407}
.df-doom-player{position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;display:flex!important;align-items:center!important;justify-content:center!important;z-index:99991!important;pointer-events:none!important;background:#030407}
#dfDoomPlayer{display:block!important;width:min(100vw,56.25dvh)!important;height:min(100dvh,177.78vw)!important;min-width:320px;min-height:180px;border:0!important;background:#000!important;box-shadow:0 0 45px rgba(250,204,21,.16);pointer-events:auto!important;visibility:visible!important;opacity:1!important}
.df-doom-info{position:absolute;left:18px;right:90px;bottom:28px;max-width:650px;text-shadow:0 2px 8px #000;z-index:99993}.df-doom-title{font-size:20px;font-weight:800}.df-doom-creator{margin-top:5px;color:#facc15;font-size:13px}.df-doom-tag{display:inline-block;margin-top:7px;padding:4px 8px;border:1px solid rgba(250,204,21,.35);border-radius:999px;color:#facc15;background:rgba(250,204,21,.08);font-size:10px;font-weight:900;letter-spacing:.08em}
.df-doom-actions{position:absolute;right:18px;bottom:28px;display:flex;flex-direction:column;gap:12px;z-index:99994}.df-doom-action,.df-doom-close{width:48px;height:48px;border:1px solid rgba(250,204,21,.45);border-radius:50%;background:rgba(10,13,20,.78);color:#fff;display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(12px);font-size:20px}.df-doom-close{position:fixed;top:18px;right:18px;z-index:99995}.df-doom-top{position:fixed;top:20px;left:22px;z-index:99995;font-weight:900;letter-spacing:.08em;color:#facc15;text-shadow:0 0 16px rgba(250,204,21,.5)}.df-doom-count{position:fixed;top:52px;left:22px;z-index:99995;color:#a1a1aa;font-size:11px;font-weight:700}
#dfDoomBtn{position:relative;overflow:hidden}#dfDoomBtn::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(250,204,21,.22),transparent);transform:translateX(-100%);animation:dfDoomShine 2.5s infinite;pointer-events:none}@keyframes dfDoomShine{60%,100%{transform:translateX(100%)}}
@media(max-width:600px){.df-doom-info{bottom:24px;left:14px;right:74px}.df-doom-actions{right:12px;bottom:24px}.df-doom-title{font-size:17px}#dfDoomPlayer{width:100vw!important;height:100dvh!important;min-width:0;min-height:0}}
`;
document.head.appendChild(style);

const overlay=document.createElement('div');overlay.id='dfDoomOverlay';overlay.innerHTML='<div class="df-doom-top">⚡ DOOM SCROLL</div><div class="df-doom-count" id="dfDoomCount">1 / 1000</div><button class="df-doom-close" id="dfDoomClose" aria-label="Close doom scroll">×</button><div id="dfDoomFeed"></div>';document.body.appendChild(overlay);
const feed=overlay.querySelector('#dfDoomFeed');

for(let i=0;i<VIDEO_COUNT;i++){
 const c=document.createElement('section');c.className='df-doom-card';c.dataset.index=i;
 c.innerHTML='<div class="df-doom-info"><div class="df-doom-title">Random Short #'+(i+1)+'</div><div class="df-doom-creator">Zack D. Films • YouTube</div><span class="df-doom-tag">SHORTS</span></div><div class="df-doom-actions"><button class="df-doom-action" data-open title="Open video on YouTube">▶</button><button class="df-doom-action" data-next title="Next short">↓</button></div>';
 feed.appendChild(c);
}

// The player is a single element outside the scroll feed. YouTube's IFrame API changes
// the actual video inside that player, preventing old videos from continuing invisibly.
const playerWrap=document.createElement('div');playerWrap.className='df-doom-player';playerWrap.innerHTML='<div id="dfDoomPlayer"></div>';overlay.appendChild(playerWrap);
let ytPlayer=null,ytReady=false,activeIndex=-1,isOpen=false,playToken=0;

function videoIdFor(position){return VIDEO_IDS[order[position]%VIDEO_IDS.length]}
function ensureYouTube(){
 if(window.YT&&window.YT.Player){createPlayer();return}
 if(document.getElementById('dfDoomYTApi'))return;
 const s=document.createElement('script');s.id='dfDoomYTApi';s.src='https://www.youtube.com/iframe_api';document.head.appendChild(s);
 const previous=window.onYouTubeIframeAPIReady;
 window.onYouTubeIframeAPIReady=function(){if(typeof previous==='function')try{previous()}catch(_){}createPlayer()};
}
function createPlayer(){
 if(ytPlayer||!window.YT||!window.YT.Player)return;
 ytPlayer=new YT.Player('dfDoomPlayer',{
   width:'100%',height:'100%',videoId:videoIdFor(Math.max(0,activeIndex)),
   playerVars:{autoplay:0,controls:1,playsinline:1,rel:0,enablejsapi:1,origin:location.origin},
   events:{onReady:function(){ytReady=true;if(isOpen&&activeIndex>=0)loadActive(true)},onError:function(){}}
 });
}
function loadActive(auto){
 if(!ytReady||!ytPlayer||activeIndex<0)return;
 const id=videoIdFor(activeIndex);const token=++playToken;
 try{
   if(auto)ytPlayer.loadVideoById(id);
   else ytPlayer.cueVideoById(id);
   setTimeout(()=>{if(isOpen&&token===playToken&&auto)try{ytPlayer.playVideo()}catch(_){}},250);
 }catch(_){ }
}
function playAt(position){
 if(!isOpen||position<0||position>=VIDEO_COUNT)return;
 activeIndex=position;
 overlay.querySelector('#dfDoomCount').textContent=(position+1)+' / '+VIDEO_COUNT;
 if(!ytPlayer){ensureYouTube();return}
 loadActive(true);
}
function reshuffle(){order=shuffle(slots.slice())}
function open(){
 isOpen=true;reshuffle();activeIndex=0;playToken++;overlay.classList.add('df-open');document.body.style.overflow='hidden';feed.scrollTop=0;ensureYouTube();if(ytReady)loadActive(true);
}
function close(){isOpen=false;playToken++;if(ytReady&&ytPlayer)try{ytPlayer.stopVideo()}catch(_){}overlay.classList.remove('df-open');document.body.style.overflow=''}
function userPlay(){if(ytReady&&ytPlayer)try{ytPlayer.playVideo();ytPlayer.unMute();ytPlayer.setVolume(100)}catch(_){}
}
window.defgodqeDoomScrollOpen=open;window.defgodqeDoomScrollClose=close;
overlay.querySelector('#dfDoomClose').addEventListener('click',close);
overlay.addEventListener('click',e=>{
 const o=e.target.closest('[data-open]');
 if(o){const c=o.closest('.df-doom-card');const p=c?Number(c.dataset.index):activeIndex;window.open('https://www.youtube.com/watch?v='+videoIdFor(p),'_blank','noopener')}
 const n=e.target.closest('[data-next]');
 if(n){const c=n.closest('.df-doom-card');c?.nextElementSibling?.scrollIntoView({behavior:'smooth'})}
});
let scrollRaf=0;
feed.addEventListener('scroll',()=>{if(scrollRaf)return;scrollRaf=requestAnimationFrame(()=>{scrollRaf=0;if(!isOpen)return;const i=Math.max(0,Math.min(VIDEO_COUNT-1,Math.round(feed.scrollTop/Math.max(1,innerHeight))));if(i!==activeIndex)playAt(i)})},{passive:true});
playerWrap.addEventListener('pointerdown',userPlay,{passive:true});
document.addEventListener('keydown',e=>{if(!isOpen)return;if(e.key==='Escape')close();if(e.key==='ArrowDown'){e.preventDefault();feed.scrollBy({top:innerHeight,behavior:'smooth'})}if(e.key==='ArrowUp'){e.preventDefault();feed.scrollBy({top:-innerHeight,behavior:'smooth'})}if(e.code==='Space'){e.preventDefault();userPlay()}});

function addSidebarButton(){
 if(document.getElementById('dfDoomBtn'))return true;const sidebar=document.getElementById('sidebar');if(!sidebar)return false;const user=sidebar.querySelector('#authRow')?.parentElement;if(!user)return false;
 const wrap=document.createElement('div');wrap.className='px-3 pb-2';wrap.innerHTML='<button id="dfDoomBtn" type="button" class="flex w-full items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-brand/10"><span style="font-size:17px">📱</span><span>Doom scroll</span><span style="margin-left:auto;font-size:10px;color:#facc15">1000 SHORTS</span></button>';
 const mini=sidebar.querySelector('#dfGameBtn')?.closest('.px-3.pb-2');if(mini)mini.after(wrap);else user.before(wrap);document.getElementById('dfDoomBtn').onclick=open;return true;
}
if(!addSidebarButton()){const mo=new MutationObserver(()=>{if(addSidebarButton())mo.disconnect()});mo.observe(document.body,{childList:true,subtree:true})}
})();