/* defgodqe — working randomized Doom Scroll */
(function(){
'use strict';
if(window.__defgodqeDoomScroll)return;
window.__defgodqeDoomScroll=true;

// Real Zack D. Films video IDs. Using direct video IDs is more reliable than
// trying to embed the channel's UU uploads feed as a playlist. YouTube's embed
// docs require a real playlist ID for listType=playlist.
const SOURCE_PLAYLIST='PLAUHyQdeCeUQzyftt9qhHh-xGYyfk7w1V';
const VIDEO_IDS=[
 'SiUXHEvd_rA','G1DG_OV5oww','o6XRvViYlug','N3cAVsH5pW4',
 'V6bPomtNnis','YpecVts2qqc','wLaM_GLdZto','Pvl12OOpSXM',
 'RBYgcczTUYs','i8-YZWlSJFk','meEy3Jg4INM','HvaXcZAVpB8',
 'QfYwCuvhgGE','hKT2kCj6V-I','PURhWbQOjew','uqN5jWFYS00',
 'ciIAcD4eXsI','dq8xGCBSBcQ','ZtVfmhhZrkg','TciQ1iOKBkA',
 'cu61ElxVFlo','G4NzI382ZM','40j6qvMDVrE','NSmY5cVTBB4',
 '8jCzEQPz9n0','Sca9-pD1lXo','LLoUQnD_UdM','9ldmPrQRGj4',
 'SNI4d-mMgcA','wLaM_GLdZto','Pvl12OOpSXM','RBYgcczTUYs'
];
const VIDEO_COUNT=1000;
const slots=Array.from({length:VIDEO_COUNT},(_,i)=>i);
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
let order=shuffle(slots.slice());

const style=document.createElement('style');style.textContent=`
#dfDoomOverlay{position:fixed;inset:0;z-index:99990;background:#05070b;color:#fff;display:none;overflow:hidden}
#dfDoomOverlay.df-open{display:block}
#dfDoomFeed{height:100dvh;width:100%;overflow-y:auto;scroll-snap-type:y mandatory;overscroll-behavior:contain;contain:strict}
.df-doom-card{position:relative;height:100dvh;width:100%;scroll-snap-align:start;scroll-snap-stop:always;display:flex;align-items:center;justify-content:center;background:#030407;contain:layout paint}
.df-doom-player{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:1}.df-doom-video{width:min(100vw,56.25dvh);height:min(100dvh,177.78vw);border:0;background:#000;box-shadow:0 0 45px rgba(250,204,21,.16);pointer-events:auto}
.df-doom-shade{position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.42),transparent 25%,transparent 62%,rgba(0,0,0,.72));z-index:2}
.df-doom-info{position:absolute;left:18px;right:90px;bottom:28px;max-width:650px;text-shadow:0 2px 8px #000;z-index:3}.df-doom-title{font-size:20px;font-weight:800}.df-doom-creator{margin-top:5px;color:#facc15;font-size:13px}.df-doom-tag{display:inline-block;margin-top:7px;padding:4px 8px;border:1px solid rgba(250,204,21,.35);border-radius:999px;color:#facc15;background:rgba(250,204,21,.08);font-size:10px;font-weight:900;letter-spacing:.08em}
.df-doom-actions{position:absolute;right:18px;bottom:28px;display:flex;flex-direction:column;gap:12px;z-index:4}.df-doom-action,.df-doom-close{width:48px;height:48px;border:1px solid rgba(250,204,21,.45);border-radius:50%;background:rgba(10,13,20,.72);color:#fff;display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(12px);font-size:20px}.df-doom-close{position:absolute;top:18px;right:18px;z-index:5}.df-doom-top{position:absolute;top:20px;left:22px;z-index:5;font-weight:900;letter-spacing:.08em;color:#facc15;text-shadow:0 0 16px rgba(250,204,21,.5)}
.df-doom-loading{position:absolute;z-index:2;width:58px;height:58px;border:3px solid rgba(250,204,21,.18);border-top-color:#facc15;border-radius:50%;animation:dfDoomSpin .8s linear infinite;pointer-events:none}.df-ready .df-doom-loading{display:none}@keyframes dfDoomSpin{to{transform:rotate(360deg)}}
.df-doom-count{position:absolute;top:52px;left:22px;z-index:5;color:#a1a1aa;font-size:11px;font-weight:700}.df-doom-btn{position:relative;overflow:hidden}#dfDoomBtn{position:relative;overflow:hidden}#dfDoomBtn::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(250,204,21,.22),transparent);transform:translateX(-100%);animation:dfDoomShine 2.5s infinite;pointer-events:none}@keyframes dfDoomShine{60%,100%{transform:translateX(100%)}}
@media(max-width:600px){.df-doom-info{bottom:24px;left:14px;right:74px}.df-doom-actions{right:12px;bottom:24px}.df-doom-title{font-size:17px}.df-doom-video{width:100vw;height:100dvh;object-fit:cover}}
`;
document.head.appendChild(style);

const overlay=document.createElement('div');overlay.id='dfDoomOverlay';overlay.innerHTML='<div class="df-doom-top">⚡ DOOM SCROLL</div><div class="df-doom-count" id="dfDoomCount">1 / 1000</div><button class="df-doom-close" id="dfDoomClose" aria-label="Close doom scroll">×</button><div id="dfDoomFeed"></div>';document.body.appendChild(overlay);
const feed=overlay.querySelector('#dfDoomFeed');

for(let i=0;i<VIDEO_COUNT;i++){
 const c=document.createElement('section');c.className='df-doom-card';c.dataset.index=i;
 c.innerHTML='<div class="df-doom-loading"></div><div class="df-doom-info"><div class="df-doom-title">Random Short #'+(i+1)+'</div><div class="df-doom-creator">Zack D. Films • YouTube</div><span class="df-doom-tag">SHORTS</span></div><div class="df-doom-actions"><button class="df-doom-action" data-open title="Open video on YouTube">▶</button><button class="df-doom-action" data-next title="Next short">↓</button></div>';
 feed.appendChild(c);
}

// One shared iframe = one active video at a time.
const playerWrap=document.createElement('div');playerWrap.className='df-doom-player';playerWrap.innerHTML='<iframe id="dfDoomVideo" class="df-doom-video" title="Doom Scroll video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';feed.appendChild(playerWrap);
const frame=playerWrap.querySelector('#dfDoomVideo');
const cards=[...feed.querySelectorAll('.df-doom-card')];
let activeIndex=-1,isOpen=false,playToken=0,lastLoaded=-1;

function videoIdFor(position){return VIDEO_IDS[order[position]%VIDEO_IDS.length]}
function srcFor(position){
 const id=videoIdFor(position);
 return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=0&playsinline=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`;
}
function stopPlayer(){
 playToken++;
 try{if(frame.contentWindow)frame.contentWindow.postMessage(JSON.stringify({event:'command',func:'stopVideo',args:[]}),'https://www.youtube-nocookie.com')}catch(_){}
 frame.removeAttribute('src');lastLoaded=-1;
}
function playAt(position){
 if(!isOpen||position<0||position>=VIDEO_COUNT)return;
 const token=++playToken;activeIndex=position;
 overlay.querySelector('#dfDoomCount').textContent=(position+1)+' / '+VIDEO_COUNT;
 if(lastLoaded!==position){frame.src=srcFor(position);lastLoaded=position}
 cards.forEach((c,i)=>c.classList.toggle('df-ready',i===position));
 const play=()=>{if(!isOpen||activeIndex!==position||token!==playToken||!frame.contentWindow)return;try{const t='https://www.youtube-nocookie.com';const p=(func,args=[])=>frame.contentWindow.postMessage(JSON.stringify({event:'command',func,args}),t);p('unMute');p('setVolume',[100]);p('playVideo')}catch(_){}};
 setTimeout(play,250);setTimeout(play,800);setTimeout(play,1500);
}
function reshuffle(){order=shuffle(slots.slice())}
function open(){stopPlayer();reshuffle();isOpen=true;overlay.classList.add('df-open');document.body.style.overflow='hidden';feed.scrollTop=0;playAt(0)}
function close(){isOpen=false;stopPlayer();overlay.classList.remove('df-open');document.body.style.overflow=''}
function userPlay(){if(isOpen&&activeIndex>=0){try{frame.contentWindow?.postMessage(JSON.stringify({event:'command',func:'playVideo',args:[]}),'https://www.youtube-nocookie.com')}catch(_){}}}
window.defgodqeDoomScrollOpen=open;window.defgodqeDoomScrollClose=close;
overlay.querySelector('#dfDoomClose').addEventListener('click',close);
overlay.addEventListener('click',e=>{
 const o=e.target.closest('[data-open]');if(o){const c=o.closest('.df-doom-card');const p=c?Number(c.dataset.index):activeIndex;const id=videoIdFor(p);window.open('https://www.youtube.com/watch?v='+id,'_blank','noopener')}
 const n=e.target.closest('[data-next]');if(n){const c=n.closest('.df-doom-card');c?.nextElementSibling?.scrollIntoView({behavior:'smooth'})}
});
let scrollRaf=0;
feed.addEventListener('scroll',()=>{if(scrollRaf)return;scrollRaf=requestAnimationFrame(()=>{scrollRaf=0;if(!isOpen)return;const i=Math.max(0,Math.min(VIDEO_COUNT-1,Math.round(feed.scrollTop/innerHeight)));if(i!==activeIndex)playAt(i)})},{passive:true});
overlay.addEventListener('pointerdown',userPlay,{passive:true});
document.addEventListener('keydown',e=>{if(!isOpen)return;if(e.key==='Escape')close();if(e.key==='ArrowDown'){e.preventDefault();feed.scrollBy({top:innerHeight,behavior:'smooth'})}if(e.key==='ArrowUp'){e.preventDefault();feed.scrollBy({top:-innerHeight,behavior:'smooth'})}if(e.code==='Space'){e.preventDefault();userPlay()}});

function addSidebarButton(){
 if(document.getElementById('dfDoomBtn'))return true;const sidebar=document.getElementById('sidebar');if(!sidebar)return false;const user=sidebar.querySelector('#authRow')?.parentElement;if(!user)return false;
 const wrap=document.createElement('div');wrap.className='px-3 pb-2';wrap.innerHTML='<button id="dfDoomBtn" type="button" class="flex w-full items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-brand/10"><span style="font-size:17px">📱</span><span>Doom scroll</span><span style="margin-left:auto;font-size:10px;color:#facc15">1000 SHORTS</span></button>';
 const mini=sidebar.querySelector('#dfGameBtn')?.closest('.px-3.pb-2');if(mini)mini.after(wrap);else user.before(wrap);document.getElementById('dfDoomBtn').onclick=open;return true;
}
if(!addSidebarButton()){const mo=new MutationObserver(()=>{if(addSidebarButton())mo.disconnect()});mo.observe(document.body,{childList:true,subtree:true})}
})();