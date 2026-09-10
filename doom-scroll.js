/* defgodqe — TikTok-style YouTube Shorts doom scroll */
(function () {
  'use strict';
  if (window.__defgodqeDoomScroll) return;
  window.__defgodqeDoomScroll = true;

  const videos = [
    { id:'YWOuN6w4Yqs', title:'Zack D. Films — Quick Story', creator:'Zack D. Films', tag:'ZACK' },
    { id:'-Bybm8MNcaA', title:'Minecraft Shorts Compilation', creator:'Minecraft', tag:'MINECRAFT' },
    { id:'nK5dVAopN2w', title:'Best of Minecraft Shorts', creator:'Minecraft', tag:'MINECRAFT' },
    { id:'I6toZpRP2ig', title:'1 Minute History', creator:'History', tag:'HISTORY' },
    { id:'X-VK2bbUHus', title:"Minecraft's Most FUNNY Shorts", creator:'Minecraft', tag:'FUNNY' },
    { id:'7dVRKvIyRTg', title:'Zack D. Films — Short', creator:'Zack D. Films', tag:'ZACK' },
    { id:'oW8Tb4Mpd3s', title:'I Tested Every Zack D. Films Video', creator:'Sambucha', tag:'CREATORS' }
  ];

  const style=document.createElement('style');
  style.textContent=`#dfDoomOverlay{position:fixed;inset:0;z-index:99990;background:#05070b;color:#fff;display:none;overflow:hidden}#dfDoomOverlay.df-open{display:block}#dfDoomFeed{height:100dvh;width:100%;overflow-y:auto;scroll-snap-type:y mandatory;overscroll-behavior:contain}.df-doom-card{position:relative;height:100dvh;width:100%;scroll-snap-align:start;scroll-snap-stop:always;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 35%,#202000 0,#090b10 38%,#030407 100%)}.df-doom-video{width:min(100vw,56.25dvh);height:min(100dvh,177.78vw);border:0;background:#000;box-shadow:0 0 45px rgba(250,204,21,.16)}.df-doom-shade{position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.42),transparent 25%,transparent 62%,rgba(0,0,0,.72))}.df-doom-info{position:absolute;left:18px;right:90px;bottom:28px;max-width:650px;text-shadow:0 2px 8px #000}.df-doom-title{font-size:20px;font-weight:800}.df-doom-creator{margin-top:5px;color:#facc15;font-size:13px}.df-doom-tag{display:inline-block;margin-top:7px;padding:4px 8px;border:1px solid rgba(250,204,21,.35);border-radius:999px;color:#facc15;background:rgba(250,204,21,.08);font-size:10px;font-weight:900;letter-spacing:.08em}.df-doom-actions{position:absolute;right:18px;bottom:28px;display:flex;flex-direction:column;gap:12px}.df-doom-action,.df-doom-close{width:48px;height:48px;border:1px solid rgba(250,204,21,.45);border-radius:50%;background:rgba(10,13,20,.72);color:#fff;display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(12px);font-size:20px}.df-doom-close{position:absolute;top:18px;right:18px;z-index:5}.df-doom-top{position:absolute;top:20px;left:22px;z-index:5;font-weight:900;letter-spacing:.08em;color:#facc15;text-shadow:0 0 16px rgba(250,204,21,.5)}.df-doom-loading{position:absolute;z-index:2;width:58px;height:58px;border:3px solid rgba(250,204,21,.18);border-top-color:#facc15;border-radius:50%;animation:dfDoomSpin .8s linear infinite;pointer-events:none}@keyframes dfDoomSpin{to{transform:rotate(360deg)}}#dfDoomBtn{position:relative;overflow:hidden}#dfDoomBtn::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(250,204,21,.22),transparent);transform:translateX(-100%);animation:dfDoomShine 2.5s infinite;pointer-events:none}@keyframes dfDoomShine{60%,100%{transform:translateX(100%)}}#dfDoomBtn:hover{background:rgba(250,204,21,.10)!important}@media(max-width:600px){.df-doom-info{bottom:24px;left:14px;right:74px}.df-doom-actions{right:12px;bottom:24px}.df-doom-title{font-size:17px}.df-doom-video{width:100vw;height:100dvh;object-fit:cover}}`;
  document.head.appendChild(style);

  const overlay=document.createElement('div');overlay.id='dfDoomOverlay';overlay.innerHTML='<div class="df-doom-top">⚡ DOOM SCROLL</div><button class="df-doom-close" id="dfDoomClose" aria-label="Close doom scroll">×</button><div id="dfDoomFeed"></div>';document.body.appendChild(overlay);
  const feed=overlay.querySelector('#dfDoomFeed');

  videos.forEach((v,i)=>{const card=document.createElement('section');card.className='df-doom-card';card.dataset.index=i;const src=`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&mute=0&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&vq=hd720`;card.innerHTML=`<div class="df-doom-loading"></div><iframe class="df-doom-video" title="${v.title}" data-src="${src}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe><div class="df-doom-shade"></div><div class="df-doom-info"><div class="df-doom-title">${v.title}</div><div class="df-doom-creator">${v.creator} • YouTube</div><span class="df-doom-tag">${v.tag}</span></div><div class="df-doom-actions"><button class="df-doom-action" data-open="${v.id}" title="Open on YouTube">▶</button><button class="df-doom-action" data-next title="Next short">↓</button></div>`;feed.appendChild(card)});

  const cards=[...feed.querySelectorAll('.df-doom-card')],frames=cards.map(c=>c.querySelector('iframe'));let activeIndex=-1,isOpen=false;
  function stopFrame(frame){if(!frame)return;try{if(frame.contentWindow&&frame.getAttribute('src'))frame.contentWindow.postMessage(JSON.stringify({event:'command',func:'stopVideo',args:[]}),'https://www.youtube-nocookie.com')}catch(_){}frame.removeAttribute('src')}
  function stopAll(){frames.forEach(stopFrame);activeIndex=-1}
  function loadFrame(frame){if(frame&&!frame.getAttribute('src'))frame.setAttribute('src',frame.dataset.src)}
  function playOnly(index){if(!isOpen||index<0||index>=frames.length)return;frames.forEach((f,i)=>{if(i!==index)stopFrame(f)});activeIndex=index;const frame=frames[index];loadFrame(frame);const enable=()=>{if(!isOpen||activeIndex!==index||!frame.contentWindow)return;try{const target='https://www.youtube-nocookie.com';frame.contentWindow.postMessage(JSON.stringify({event:'command',func:'unMute',args:[]} ),target);frame.contentWindow.postMessage(JSON.stringify({event:'command',func:'setVolume',args:[100]}),target);frame.contentWindow.postMessage(JSON.stringify({event:'command',func:'playVideo',args:[]}),target)}catch(_){}};setTimeout(enable,250);setTimeout(enable,900)}

  const observer=new IntersectionObserver(entries=>{if(!isOpen)return;const best=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(best)playOnly(Number(best.target.dataset.index))},{threshold:[.65,.8,.95]});cards.forEach(c=>observer.observe(c));
  function open(){stopAll();isOpen=true;overlay.classList.add('df-open');document.body.style.overflow='hidden';feed.scrollTop=0;playOnly(0)}
  function close(){isOpen=false;stopAll();overlay.classList.remove('df-open');document.body.style.overflow=''}
  function boostAudio(){if(isOpen&&activeIndex>=0)playOnly(activeIndex)}
  window.defgodqeDoomScrollOpen=open;window.defgodqeDoomScrollClose=close;
  overlay.querySelector('#dfDoomClose').addEventListener('click',close);
  overlay.addEventListener('click',e=>{const o=e.target.closest('[data-open]');if(o)window.open('https://www.youtube.com/watch?v='+o.dataset.open,'_blank','noopener');const n=e.target.closest('[data-next]');if(n)n.closest('.df-doom-card').nextElementSibling?.scrollIntoView({behavior:'smooth'})});
  feed.addEventListener('scroll',()=>requestAnimationFrame(()=>{if(isOpen){const i=Math.round(feed.scrollTop/innerHeight);if(i!==activeIndex)playOnly(i)}}),{passive:true});
  overlay.addEventListener('pointerdown',boostAudio,{passive:true});
  document.addEventListener('keydown',e=>{if(!isOpen)return;if(e.key==='Escape')close();if(e.key==='ArrowDown'){e.preventDefault();feed.scrollBy({top:innerHeight,behavior:'smooth'})}if(e.key==='ArrowUp'){e.preventDefault();feed.scrollBy({top:-innerHeight,behavior:'smooth'})}if(e.code==='Space'){e.preventDefault();boostAudio()}});

  function addSidebarButton(){if(document.getElementById('dfDoomBtn'))return true;const sidebar=document.getElementById('sidebar');if(!sidebar)return false;const user=sidebar.querySelector('#authRow')?.parentElement;if(!user)return false;const wrap=document.createElement('div');wrap.className='px-3 pb-2';wrap.innerHTML='<button id="dfDoomBtn" type="button" class="flex w-full items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-brand/10"><span style="font-size:17px">📱</span><span>Doom scroll</span><span style="margin-left:auto;font-size:10px;color:#facc15">SHORTS</span></button>';const mini=sidebar.querySelector('#dfGameBtn')?.closest('.px-3.pb-2');if(mini)mini.after(wrap);else user.before(wrap);document.getElementById('dfDoomBtn').onclick=open;return true}
  if(!addSidebarButton()){const mo=new MutationObserver(()=>{if(addSidebarButton())mo.disconnect()});mo.observe(document.body,{childList:true,subtree:true})}
})();
