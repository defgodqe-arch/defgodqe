/* defgodqe — Doom Ultra experience layer
 * Adds polished short-video interactions without replacing the working feed:
 * save, mute, volume memory, progress, loading state, double-tap likes,
 * swipe/keyboard navigation, next-video preloading, share sheet, copy link,
 * not-interested filtering, view counter, and creator-friendly controls.
 */
(function(){
'use strict';
if(window.__defgodqeDoomUltra)return;
window.__defgodqeDoomUltra=true;
const SAVED='defgodqe-doom-saved-v2', HIDDEN='defgodqe-doom-hidden-v1', MUTED='defgodqe-doom-muted-v1';
const read=(k,d)=>{try{const x=JSON.parse(localStorage.getItem(k));return x==null?d:x}catch{return d}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const saved=()=>read(SAVED,[]), hidden=()=>new Set(read(HIDDEN,[]).map(String));
function toast(t){let x=document.getElementById('dfUltraToast');if(!x){x=document.createElement('div');x.id='dfUltraToast';document.body.appendChild(x)}x.textContent=t;x.classList.add('show');clearTimeout(x.__t);x.__t=setTimeout(()=>x.classList.remove('show'),1700)}
function css(){if(document.getElementById('dfUltraStyle'))return;const s=document.createElement('style');s.id='dfUltraStyle';s.textContent=`
#dfUltraTools{position:fixed;right:64px;top:74px;z-index:7;display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end;max-width:310px}#dfUltraTools button{border:1px solid rgba(255,255,255,.15);background:rgba(8,8,12,.72);backdrop-filter:blur(16px);color:#fff;border-radius:13px;padding:8px 11px;font-weight:850;cursor:pointer;transition:.18s;box-shadow:0 8px 30px rgba(0,0,0,.2)}#dfUltraTools button:hover{transform:translateY(-1px);background:rgba(255,255,255,.15)}#dfUltraToast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,20px);z-index:50;background:rgba(15,15,18,.96);border:1px solid rgba(255,255,255,.16);color:#fff;padding:11px 16px;border-radius:15px;opacity:0;pointer-events:none;transition:.22s;font-weight:850;box-shadow:0 18px 60px #000;white-space:nowrap}#dfUltraToast.show{opacity:1;transform:translate(-50%,0)}
.df-ultra-progress{position:absolute;z-index:5;left:50%;bottom:0;transform:translateX(-50%);width:min(100vw,56.25dvh);height:3px;background:rgba(255,255,255,.18);overflow:hidden}.df-ultra-progress i{display:block;width:0;height:100%;background:#fff;box-shadow:0 0 12px rgba(255,255,255,.7)}
.df-ultra-loader{position:absolute;z-index:4;left:50%;top:50%;transform:translate(-50%,-50%);width:42px;height:42px;border:3px solid rgba(255,255,255,.22);border-top-color:#fff;border-radius:50%;animation:dfSpin .8s linear infinite;pointer-events:none;opacity:0;transition:.2s}.df-ultra-loading .df-ultra-loader{opacity:1}@keyframes dfSpin{to{transform:translate(-50%,-50%) rotate(360deg)}}
.df-ultra-save{position:absolute!important;right:max(12px,calc(50% - min(28.125dvh,50vw) + 12px));bottom:248px;z-index:4;width:48px;height:48px;border:0;border-radius:50%;background:rgba(15,15,18,.68);backdrop-filter:blur(10px);color:#fff;font-size:21px;cursor:pointer}.df-ultra-save.on{background:#fff;color:#000}.df-ultra-menu{position:absolute!important;right:max(12px,calc(50% - min(28.125dvh,50vw) + 12px));top:82px;z-index:4;width:40px;height:40px;border:0;border-radius:50%;background:rgba(15,15,18,.65);color:#fff;font-size:20px;cursor:pointer}.df-ultra-views{display:inline-block;color:#aaa;font-size:12px;font-weight:750;margin-top:5px}.df-ultra-hidden{display:none!important}.df-o-video{cursor:pointer;touch-action:pan-y}
@media(max-width:650px){#dfUltraTools{right:52px;top:61px;max-width:240px}#dfUltraTools button{padding:7px 9px;font-size:12px}.df-ultra-save{right:10px;bottom:205px}.df-ultra-menu{right:10px;top:68px}}
`;document.head.appendChild(s)}
function cardTools(card){
 if(card.dataset.ultraReady)return;card.dataset.ultraReady='1';
 const v=card.querySelector('video');if(!v)return;
 const p=document.createElement('div');p.className='df-ultra-progress';p.innerHTML='<i></i>';card.appendChild(p);
 const loader=document.createElement('div');loader.className='df-ultra-loader';card.appendChild(loader);
 const like=card.querySelector('[data-like]');const id=like?.dataset.like||'';
 const sb=document.createElement('button');sb.className='df-ultra-save';sb.type='button';sb.title='Save video';sb.textContent=saved().map(String).includes(String(id))?'★':'☆';if(saved().map(String).includes(String(id)))sb.classList.add('on');card.appendChild(sb);
 const menu=document.createElement('button');menu.className='df-ultra-menu';menu.type='button';menu.title='More';menu.textContent='⋯';card.appendChild(menu);
 const info=card.querySelector('.df-o-title');if(info&&!card.querySelector('.df-ultra-views')){const views=document.createElement('span');views.className='df-ultra-views';views.textContent=(Number(card.dataset.views||0)+1).toLocaleString()+' views';info.appendChild(views)}
 const bar=p.firstElementChild;
 v.addEventListener('timeupdate',()=>{if(v.duration)bar.style.width=Math.min(100,v.currentTime/v.duration*100)+'%'},{passive:true});
 v.addEventListener('loadstart',()=>card.classList.add('df-ultra-loading'),{passive:true});
 v.addEventListener('canplay',()=>card.classList.remove('df-ultra-loading'),{passive:true});
 v.addEventListener('waiting',()=>card.classList.add('df-ultra-loading'),{passive:true});
 v.addEventListener('playing',()=>card.classList.remove('df-ultra-loading'),{passive:true});
 v.addEventListener('ended',()=>bar.style.width='100%',{passive:true});
 sb.onclick=e=>{e.stopPropagation();let a=saved();const ix=a.map(String).indexOf(String(id));if(ix>=0){a.splice(ix,1);sb.textContent='☆';sb.classList.remove('on');toast('Removed from saved')}else{a.push(id);write(SAVED,a.slice(-500));sb.textContent='★';sb.classList.add('on');toast('Saved')}write(SAVED,a.slice(-500))};
 menu.onclick=e=>{e.stopPropagation();const choice=prompt('Video options:\n1 = Not interested\n2 = Copy link\n3 = Share');if(choice==='1'){let h=hidden();h.add(String(id));write(HIDDEN,[...h].slice(-500));card.classList.add('df-ultra-hidden');toast('We will show you fewer videos like this')}if(choice==='2')copy(v.currentSrc||v.src);if(choice==='3')share(v.currentSrc||v.src)};
}
async function copy(url){try{await navigator.clipboard.writeText(url);toast('Video link copied')}catch{toast('Copy is unavailable')}}
async function share(url){try{if(navigator.share)await navigator.share({title:'defgodqe short',url});else await copy(url)}catch{}}
function applyHidden(feed){const h=hidden();feed.querySelectorAll('.df-o-card').forEach(c=>{const id=c.querySelector('[data-like]')?.dataset.like;if(id&&h.has(String(id)))c.classList.add('df-ultra-hidden')})}
function bind(){
 const root=document.getElementById('dfOwned'),feed=document.getElementById('dfOwnedFeed');if(!root||!feed||feed.__ultra)return false;feed.__ultra=true;css();
 const tools=document.createElement('div');tools.id='dfUltraTools';tools.innerHTML='<button id="dfUltraMute">🔊 Sound</button><button id="dfUltraSaved">☆ Saved</button><button id="dfUltraTop">⌃ Top</button>';root.appendChild(tools);
 let muted=read(MUTED,false);const setMute=x=>{muted=x;write(MUTED,x);feed.querySelectorAll('video').forEach(v=>v.muted=x);tools.querySelector('#dfUltraMute').textContent=x?'🔇 Muted':'🔊 Sound'};setMute(muted);
 const apply=()=>{feed.querySelectorAll('.df-o-card').forEach(cardTools);applyHidden(feed)};
 new MutationObserver(()=>{apply();preload()}).observe(feed,{childList:true,subtree:true});apply();
 tools.querySelector('#dfUltraMute').onclick=()=>{setMute(!muted);toast(muted?'Sound off':'Sound on')};
 tools.querySelector('#dfUltraSaved').onclick=()=>{const ids=new Set(saved().map(String));let any=false;feed.querySelectorAll('.df-o-card').forEach(c=>{const id=c.querySelector('[data-like]')?.dataset.like;c.style.display=ids.has(String(id))?'flex':'none';if(ids.has(String(id)))any=true});toast(any?'Showing saved videos':'No saved videos yet')};
 tools.querySelector('#dfUltraTop').onclick=()=>feed.scrollTo({top:0,behavior:'smooth'});
 feed.addEventListener('dblclick',e=>{if(e.target.closest('button'))return;const c=e.target.closest('.df-o-card'),b=c?.querySelector('[data-like]');if(!b)return;b.click();const v=c.querySelector('video');v?.pause();setTimeout(()=>v?.play().catch(()=>{}),100);toast('♥ Liked')});
 feed.addEventListener('click',e=>{const c=e.target.closest('.df-o-card');if(!c)return;const v=c.querySelector('video');if(e.target.closest('[data-like]'))return;if(e.target.closest('.df-o-video')){if(v.paused)v.play().catch(()=>{});else v.pause()}if(e.target.closest('[data-share]'))share(v?.currentSrc||v?.src||'')});
 let touchY=0,touchX=0,touchAt=0;feed.addEventListener('touchstart',e=>{const t=e.changedTouches[0];touchY=t.clientY;touchX=t.clientX;touchAt=Date.now()},{passive:true});feed.addEventListener('touchend',e=>{const t=e.changedTouches[0],dy=t.clientY-touchY,dx=t.clientX-touchX;if(Date.now()-touchAt>650||Math.abs(dy)<55||Math.abs(dy)<Math.abs(dx))return;const cards=[...feed.querySelectorAll('.df-o-card:not(.df-ultra-hidden)')];const current=cards.findIndex(c=>{const r=c.getBoundingClientRect();return r.top>-r.height*.25&&r.top<r.height*.25});const next=dy<0?current+1:current-1;if(cards[next])cards[next].scrollIntoView({behavior:'smooth'})},{passive:true});
 document.addEventListener('keydown',e=>{if(!root.classList.contains('open'))return;if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;const cards=[...feed.querySelectorAll('.df-o-card:not(.df-ultra-hidden)')];if(!cards.length)return;let i=cards.findIndex(c=>{const r=c.getBoundingClientRect();return r.top>-r.height*.25&&r.top<r.height*.25});if(i<0)i=0;if(e.key==='ArrowDown'||e.key==='j'){e.preventDefault();cards[Math.min(cards.length-1,i+1)]?.scrollIntoView({behavior:'smooth'})}if(e.key==='ArrowUp'||e.key==='k'){e.preventDefault();cards[Math.max(0,i-1)]?.scrollIntoView({behavior:'smooth'})}if(e.key==='m'){e.preventDefault();tools.querySelector('#dfUltraMute').click()}if(e.key==='s'){e.preventDefault();cards[i]?.querySelector('.df-ultra-save')?.click()}if(e.key==='Enter'){const v=cards[i]?.querySelector('video');if(v){if(v.paused)v.play().catch(()=>{});else v.pause()}}});
 function preload(){const cards=[...feed.querySelectorAll('.df-o-card:not(.df-ultra-hidden)')];let current=cards.findIndex(c=>{const r=c.getBoundingClientRect();return r.top>-r.height*.35&&r.top<r.height*.35});if(current<0)current=0;cards.forEach((c,n)=>{const v=c.querySelector('video');if(!v)return;v.preload=Math.abs(n-current)<=4?'auto':'metadata';if(n===current+1&&v.readyState<3){try{v.load()}catch{}}})}
 return true;
}
function hook(){if(typeof window.defgodqeOwnedDoomOpen!=='function')return setTimeout(hook,200);if(window.defgodqeOwnedDoomOpen.__ultraWrapped)return;const old=window.defgodqeOwnedDoomOpen;const wrapped=async function(){await old();setTimeout(bind,60)};wrapped.__ultraWrapped=true;window.defgodqeOwnedDoomOpen=wrapped}
hook();
})();
