/* defgodqe — fast, one-player-at-a-time YouTube Shorts doom scroll */
(function(){
'use strict';
if(window.__defgodqeDoomScroll)return;
window.__defgodqeDoomScroll=true;

const videos=[
{id:'YWOuN6w4Yqs',title:'Zack D. Films — Quick Story',creator:'Zack D. Films',tag:'ZACK'},
{id:'-Bybm8MNcaA',title:'Minecraft Shorts Compilation',creator:'Minecraft',tag:'MINECRAFT'},
{id:'nK5dVAopN2w',title:'Best of Minecraft Shorts',creator:'Minecraft',tag:'MINECRAFT'},
{id:'I6toZpRP2ig',title:'1 Minute History',creator:'History',tag:'HISTORY'},
{id:'X-VK2bbUHus',title:"Minecraft's Most FUNNY Shorts",creator:'Minecraft',tag:'FUNNY'},
{id:'7dVRKvIyRTg',title:'Zack D. Films — Short',creator:'Zack D. Films',tag:'ZACK'},
{id:'oW8Tb4Mpd3s',title:'I Tested Every Zack D. Films Video',creator:'Sambucha',tag:'CREATORS'}
];

// Network hints are cheap, but NO iframe/video is created with a src until Doom Scroll opens.
['https://www.youtube-nocookie.com','https://i.ytimg.com'].forEach(h=>{const l=document.createElement('link');l.rel='preconnect';l.href=h;l.crossOrigin='';document.head.appendChild(l)});

const style=document.createElement('style');style.textContent=`
#dfDoomOverlay{position:fixed;inset:0;z-index:99990;background:#05070b;color:#fff;display:none;overflow:hidden}
#dfDoomOverlay.df-open{display:block}
#dfDoomFeed{height:100dvh;width:100%;overflow-y:auto;scroll-snap-type:y mandatory;overscroll-behavior:contain}
.df-doom-card{position:relative;height:100dvh;width:100%;scroll-snap-align:start;scroll-snap-stop:always;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 35%,#202000 0,#090b10 38%,#030407 100%)}
.df-doom-video{width:min(100vw,56.25dvh);height:min(100dvh,177.78vw);border:0;background:#000;box-shadow:0 0 45px rgba(250,204,21,.16)}
.df-doom-shade{position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.42),transparent 25%,transparent 62%,rgba(0,0,0,.72))}
.df-doom-info{position:absolute;left:18px;right:90px;bottom:28px;max-width:650px;text-shadow:0 2px 8px #000}.df-doom-title{font-size:20px;font-weight:800}.df-doom-creator{margin-top:5px;color:#facc15;font-size:13px}.df-doom-tag{display:inline-block;margin-top:7px;padding:4px 8px;border:1px solid rgba(250,204,21,.35);border-radius:999px;color:#facc15;background:rgba(250,204,21,.08);font-size:10px;font-weight:900;letter-spacing:.08em}
.df-doom-actions{position:absolute;right:18px;bottom:28px;display:flex;flex-direction:column;gap:12px}.df-doom-action,.df-doom-close{width:48px;height:48px;border:1px solid rgba(250,204,21,.45);border-radius:50%;background:rgba(10,13,20,.72);color:#fff;display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(12px);font-size:20px}.df-doom-close{position:absolute;top:18px;right:18px;z-index:5}.df-doom-top{position:absolute;top:20px;left:22px;z-index:5;font-weight:900;letter-spacing:.08em;color:#facc15;text-shadow:0 0 16px rgba(250,204,21,.5)}
.df-doom-loading{position:absolute;z-index:2;width:58px;height:58px;border:3px solid rgba(250,204,21,.18);border-top-color:#facc15;border-radius:50%;animation:dfDoomSpin .8s linear infinite;pointer-events:none}.df-ready .df-doom-loading{display:none}@keyframes dfDoomSpin{to{transform:rotate(360deg)}}
#dfDoomBtn{position:relative;overflow:hidden}#dfDoomBtn::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(250,204,21,.22),transparent);transform:translateX(-100%);animation:dfDoomShine 2.5s infinite;pointer-events:none}@keyframes dfDoomShine{60%,100%{transform:translateX(100%)}}#dfDoomBtn:hover{background:rgba(250,204,21,.10)!important}
@media(max-width:600px){.df-doom-info{bottom:24px;left:14px;right:74px}.df-doom-actions{right:12px;bottom:24px}.df-doom-title{font-size:17px}.df-doom-video{width:100vw;height:100dvh;object-fit:cover}}
`;document.head.appendChild(style);

const overlay=document.createElement('div');overlay.id='dfDoomOverlay';overlay.innerHTML='<div class="df-doom-top">⚡ DOOM SCROLL</div><button class="df-doom-close" id="dfDoomClose" aria-label="Close doom scroll">×</button><div id="dfDoomFeed"></div>';document.body.appendChild(overlay);
const feed=overlay.querySelector('#dfDoomFeed');

// Cards contain no YouTube src initially. This makes the feature completely idle while closed.
videos.forEach((v,i)=>{const c=document.createElement('section');c.className='df-doom-card';c.dataset.index=i;c.innerHTML=`<div class="df-doom-loading"></div><iframe class="df-doom-video" title="${v.title}" data-video-id="${v.id}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="eager"></iframe><div class="df-doom-shade"></div><div class="df-doom-info"><div class="df-doom-title">${v.title}</div><div class="df-doom-creator">${v.creator} • YouTube</div><span class="df-doom-tag">${v.tag}</span></div><div class="df-doom-actions"><button class="df-doom-action" data-open="${v.id}" title="Open on YouTube">▶</button><button class="df-doom-action" data-next title="Next short">↓</button></div>`;feed.appendChild(c)});

const cards=[...feed.querySelectorAll('.df-doom-card')],frames=cards.map(c=>c.querySelector('iframe'));let activeIndex=-1,isOpen=false,playToken=0;
function srcFor(id){return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=0&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&vq=hd720`}
function stopFrame(f){if(!f)return;try{if(f.contentWindow&&f.src)f.contentWindow.postMessage(JSON.stringify({event:'command',func:'stopVideo',args:[]}),'https://www.youtube-nocookie.com')}catch(_){}f.removeAttribute('src');f.closest('.df-doom-card')?.classList.remove('df-ready')}
function stopAll(){playToken++;frames.forEach(stopFrame);activeIndex=-1}
function sendPlay(f,idx,token){if(!isOpen||idx!==activeIndex||token!==playToken||!f.contentWindow)return;try{const t='https://www.youtube-nocookie.com';const p=(func,args=[])=>f.contentWindow.postMessage(JSON.stringify({event:'command',func,args}),t);p('unMute');p('setVolume',[100]);p('playVideo')}catch(_){} }
function playOnly(index){
if(!isOpen||index<0||index>=frames.length)return;
const token=++playToken;
frames.forEach((f,i)=>{if(i!==index)stopFrame(f)});
activeIndex=index;
const f=frames[index];
if(!f.getAttribute('src'))f.setAttribute('src',srcFor(f.dataset.videoId));
f.closest('.df-doom-card')?.classList.add('df-ready');
// A single player is loaded. Give it a short head start, then enable audio after the user gesture.
setTimeout(()=>sendPlay(f,index,token),150);
setTimeout(()=>sendPlay(f,index,token),600);
setTimeout(()=>sendPlay(f,index,token),1200);
}

const observer=new IntersectionObserver(es=>{if(!isOpen)return;const best=es.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(best)playOnly(+best.target.dataset.index)},{threshold:[.7,.9]});cards.forEach(c=>observer.observe(c));
function open(){stopAll();isOpen=true;overlay.classList.add('df-open');document.body.style.overflow='hidden';feed.scrollTop=0;playOnly(0)}
function close(){isOpen=false;stopAll();overlay.classList.remove('df-open');document.body.style.overflow=''}
function userPlay(){if(isOpen&&activeIndex>=0){const f=frames[activeIndex];sendPlay(f,activeIndex,playToken)}}
window.defgodqeDoomScrollOpen=open;window.defgodqeDoomScrollClose=close;
overlay.querySelector('#dfDoomClose').addEventListener('click',close);
overlay.addEventListener('click',e=>{const o=e.target.closest('[data-open]');if(o)window.open('https://www.youtube.com/watch?v='+o.dataset.open,'_blank','noopener');const n=e.target.closest('[data-next]');if(n)n.closest('.df-doom-card').nextElementSibling?.scrollIntoView({behavior:'smooth'})});
feed.addEventListener('scroll',()=>requestAnimationFrame(()=>{if(isOpen){const i=Math.round(feed.scrollTop/innerHeight);if(i!==activeIndex)playOnly(i)}}),{passive:true});
overlay.addEventListener('pointerdown',userPlay,{passive:true});
document.addEventListener('keydown',e=>{if(!isOpen)return;if(e.key==='Escape')close();if(e.key==='ArrowDown'){e.preventDefault();feed.scrollBy({top:innerHeight,behavior:'smooth'})}if(e.key==='ArrowUp'){e.preventDefault();feed.scrollBy({top:-innerHeight,behavior:'smooth'})}if(e.code==='Space'){e.preventDefault();userPlay()}});
function addSidebarButton(){if(document.getElementById('dfDoomBtn'))return true;const sidebar=document.getElementById('sidebar');if(!sidebar)return false;const user=sidebar.querySelector('#authRow')?.parentElement;if(!user)return false;const wrap=document.createElement('div');wrap.className='px-3 pb-2';wrap.innerHTML='<button id="dfDoomBtn" type="button" class="flex w-full items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-brand/10"><span style="font-size:17px">📱</span><span>Doom scroll</span><span style="margin-left:auto;font-size:10px;color:#facc15">SHORTS</span></button>';const mini=sidebar.querySelector('#dfGameBtn')?.closest('.px-3.pb-2');if(mini)mini.after(wrap);else user.before(wrap);document.getElementById('dfDoomBtn').onclick=open;return true}
if(!addSidebarButton()){const mo=new MutationObserver(()=>{if(addSidebarButton())mo.disconnect()});mo.observe(document.body,{childList:true,subtree:true})}
})();
