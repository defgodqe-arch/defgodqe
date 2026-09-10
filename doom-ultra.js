/* defgodqe — Doom Ultra interaction layer */
(function(){
'use strict';
if(window.__defgodqeDoomUltra)return;
window.__defgodqeDoomUltra=true;
const SAVED='defgodqe-doom-saved-v1';
const getSaved=()=>{try{return JSON.parse(localStorage.getItem(SAVED)||'[]')}catch{return[]}};
const setSaved=x=>{try{localStorage.setItem(SAVED,JSON.stringify(x.slice(-500)))}catch{}};
function css(){if(document.getElementById('dfUltraStyle'))return;const s=document.createElement('style');s.id='dfUltraStyle';s.textContent=`
#dfUltraTools{position:fixed;right:64px;top:74px;z-index:7;display:flex;gap:7px}#dfUltraTools button{border:1px solid rgba(255,255,255,.14);background:rgba(10,10,14,.72);backdrop-filter:blur(14px);color:#fff;border-radius:12px;padding:8px 10px;font-weight:800;cursor:pointer}#dfUltraToast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,20px);z-index:20;background:rgba(15,15,18,.94);border:1px solid rgba(255,255,255,.15);color:#fff;padding:11px 15px;border-radius:14px;opacity:0;pointer-events:none;transition:.22s;font-weight:800;box-shadow:0 15px 50px #000}#dfUltraToast.show{opacity:1;transform:translate(-50%,0)}.df-ultra-progress{position:absolute;z-index:5;left:50%;bottom:0;transform:translateX(-50%);width:min(100vw,56.25dvh);height:3px;background:rgba(255,255,255,.16)}.df-ultra-progress i{display:block;width:0;height:100%;background:#fff}.df-o-video{cursor:pointer}.df-ultra-saved{background:#fff!important;color:#000!important}
@media(max-width:650px){#dfUltraTools{right:54px;top:62px}#dfUltraTools button{padding:7px 9px;font-size:12px}}
`;document.head.appendChild(s)}
function toast(t){let x=document.getElementById('dfUltraToast');if(!x){x=document.createElement('div');x.id='dfUltraToast';document.body.appendChild(x)}x.textContent=t;x.classList.add('show');clearTimeout(x.__t);x.__t=setTimeout(()=>x.classList.remove('show'),1500)}
function cardTools(card){if(card.querySelector('.df-ultra-progress'))return;const p=document.createElement('div');p.className='df-ultra-progress';p.innerHTML='<i></i>';card.appendChild(p);const v=card.querySelector('video');const bar=p.firstElementChild;v.addEventListener('timeupdate',()=>{bar.style.width=v.duration?Math.min(100,v.currentTime/v.duration*100)+'%':'0%'},{passive:true});v.addEventListener('ended',()=>{bar.style.width='100%'},{passive:true})}
function bind(){const root=document.getElementById('dfOwned'),feed=document.getElementById('dfOwnedFeed');if(!root||!feed||feed.__ultra)return false;feed.__ultra=true;css();const tools=document.createElement('div');tools.id='dfUltraTools';tools.innerHTML='<button id="dfUltraMute" title="Mute/unmute">🔊 Sound</button><button id="dfUltraSaved" title="Show saved videos">☆ Saved</button>';root.appendChild(tools);let muted=false;
 const apply=()=>feed.querySelectorAll('.df-o-card').forEach(c=>cardTools(c));
 new MutationObserver(apply).observe(feed,{childList:true});apply();
 tools.querySelector('#dfUltraMute').onclick=()=>{muted=!muted;feed.querySelectorAll('video').forEach(v=>v.muted=muted);tools.querySelector('#dfUltraMute').textContent=muted?'🔇 Muted':'🔊 Sound';toast(muted?'Sound off':'Sound on')};
 tools.querySelector('#dfUltraSaved').onclick=()=>{const ids=new Set(getSaved().map(String));const cards=[...feed.querySelectorAll('.df-o-card')];cards.forEach(c=>{const b=c.querySelector('[data-like]');c.style.display=ids.has(String(b?.dataset.like))?'flex':'none'});toast('Showing saved videos')};
 feed.addEventListener('dblclick',e=>{if(e.target.closest('button'))return;const c=e.target.closest('.df-o-card'),b=c?.querySelector('[data-like]');if(!b)return;b.click();toast('Liked')});
 feed.addEventListener('click',e=>{const c=e.target.closest('.df-o-card');if(!c)return;const b=c.querySelector('[data-like]');if(!b)return;if(e.target.closest('[data-like]')){const id=b.dataset.like;const arr=getSaved();if(!arr.map(String).includes(String(id)))setSaved([...arr,id]);}if(e.target.closest('.df-o-video')){const v=c.querySelector('video');if(v.paused)v.play().catch(()=>{});else v.pause()}});
 document.addEventListener('keydown',e=>{if(!root.classList.contains('open'))return;if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;const cards=[...feed.querySelectorAll('.df-o-card')],i=Math.max(0,Number(root.dataset.ultraIndex||0));if(e.key==='ArrowDown'){cards[Math.min(cards.length-1,i+1)]?.scrollIntoView({behavior:'smooth'});root.dataset.ultraIndex=String(Math.min(cards.length-1,i+1))}if(e.key==='ArrowUp'){cards[Math.max(0,i-1)]?.scrollIntoView({behavior:'smooth'});root.dataset.ultraIndex=String(Math.max(0,i-1))}if(e.key===' '){e.preventDefault();const v=cards[i]?.querySelector('video');if(v){if(v.paused)v.play().catch(()=>{});else v.pause()}}if(e.key.toLowerCase()==='m')tools.querySelector('#dfUltraMute').click()});
 return true}
function hook(){if(typeof window.defgodqeOwnedDoomOpen!=='function')return setTimeout(hook,250);if(window.defgodqeOwnedDoomOpen.__ultraWrapped)return;const old=window.defgodqeOwnedDoomOpen;const wrapped=async function(){await old();setTimeout(bind,50)};wrapped.__ultraWrapped=true;window.defgodqeOwnedDoomOpen=wrapped}
hook();
})();
