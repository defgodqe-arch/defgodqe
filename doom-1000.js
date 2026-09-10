/* defgodqe — Doom 1000x experience layer */
(function(){
'use strict';
if(window.__defgodqeDoom1000)return;
window.__defgodqeDoom1000=true;
const KEY='defgodqe-doom-prefs-v1', HIDDEN='defgodqe-doom-hidden-v1';
const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
let hidden=new Set(read(HIDDEN,[]).map(String));
const toast=t=>{let x=document.getElementById('df1000Toast');if(!x){x=document.createElement('div');x.id='df1000Toast';document.body.appendChild(x)}x.textContent=t;x.classList.add('show');clearTimeout(x._t);x._t=setTimeout(()=>x.classList.remove('show'),1300)};
function css(){if(document.getElementById('df1000Style'))return;const s=document.createElement('style');s.id='df1000Style';s.textContent=`
#df1000Hud{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:12;display:flex;gap:6px;padding:6px;border:1px solid rgba(255,255,255,.12);border-radius:17px;background:rgba(8,8,12,.72);backdrop-filter:blur(18px);box-shadow:0 15px 50px #000}#df1000Hud button{border:0;border-radius:12px;background:rgba(255,255,255,.08);color:#fff;padding:8px 11px;font-weight:850;cursor:pointer}#df1000Hud button:hover{background:rgba(255,255,255,.16)}#df1000Toast{position:fixed;left:50%;bottom:76px;transform:translate(-50%,10px);z-index:30;background:rgba(12,12,16,.95);border:1px solid rgba(255,255,255,.14);padding:10px 14px;border-radius:13px;color:#fff;font-weight:800;opacity:0;pointer-events:none;transition:.2s}#df1000Toast.show{opacity:1;transform:translate(-50%,0)}.df1000-hidden{display:none!important}.df1000-now{outline:1px solid rgba(255,255,255,.35);outline-offset:-1px}
@media(max-width:650px){#df1000Hud{bottom:7px;max-width:calc(100vw - 14px);overflow:auto}#df1000Hud button{padding:8px 9px;font-size:11px;white-space:nowrap}}
`;document.head.appendChild(s)}
function bind(){const root=document.getElementById('dfOwned'),feed=document.getElementById('dfOwnedFeed');if(!root||!feed)return false;if(root.__doom1000)return true;root.__doom1000=true;css();
 const hud=document.createElement('div');hud.id='df1000Hud';hud.innerHTML='<button data-x="shuffle">🔀 Shuffle</button><button data-x="speed">1× Speed</button><button data-x="focus">⛶ Focus</button><button data-x="hide">🚫 Not interested</button><button data-x="top">↑ Top</button>';root.appendChild(hud);
 let speed=1,focus=false;
 const cards=()=>[...feed.querySelectorAll('.df-o-card')];
 const current=()=>cards().find(c=>{const v=c.querySelector('video');return v&&!v.paused})||cards()[0];
 const sync=()=>cards().forEach(c=>{const id=c.querySelector('[data-like]')?.dataset.like;if(hidden.has(String(id)))c.classList.add('df1000-hidden');else c.classList.remove('df1000-hidden')});
 hud.onclick=e=>{const b=e.target.closest('button');if(!b)return;const x=b.dataset.x;
  if(x==='top'){feed.scrollTo({top:0,behavior:'smooth'});toast('Back to top')}
  if(x==='shuffle'){const cs=cards().filter(c=>!c.classList.contains('df1000-hidden'));if(cs.length){const c=cs[Math.floor(Math.random()*cs.length)];c.scrollIntoView({behavior:'smooth'});toast('Random short')}}
  if(x==='speed'){speed=speed===1?1.25:speed===1.25?1.5:speed===1.5?2:1;feed.querySelectorAll('video').forEach(v=>v.playbackRate=speed);b.textContent=speed+'× Speed';toast('Playback '+speed+'×')}
  if(x==='focus'){focus=!focus;root.classList.toggle('df1000-focus',focus);b.textContent=focus?'✕ Exit focus':'⛶ Focus';toast(focus?'Focus mode':'Focus mode off')}
  if(x==='hide'){const c=current();const id=c?.querySelector('[data-like]')?.dataset.like;if(id){hidden.add(String(id));write(HIDDEN,[...hidden]);c.classList.add('df1000-hidden');const next=cards().find(z=>!z.classList.contains('df1000-hidden'));next?.scrollIntoView({behavior:'smooth'});toast('Not interested')}}
 };
 feed.addEventListener('play',e=>{if(e.target?.tagName==='VIDEO'){e.target.playbackRate=speed;cards().forEach(c=>c.classList.remove('df1000-now'));e.target.closest('.df-o-card')?.classList.add('df1000-now')}},true);
 feed.addEventListener('dblclick',e=>{if(e.target.closest('button'))return;const c=e.target.closest('.df-o-card');if(c){c.querySelector('[data-like]')?.click();toast('❤️ Liked')}});
 feed.addEventListener('contextmenu',e=>{const c=e.target.closest('.df-o-card');if(c){e.preventDefault();const id=c.querySelector('[data-like]')?.dataset.like;if(id){hidden.add(String(id));write(HIDDEN,[...hidden]);c.classList.add('df1000-hidden');toast('Hidden')}}});
 document.addEventListener('keydown',e=>{if(!root.classList.contains('open')||['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;const cs=cards().filter(c=>!c.classList.contains('df1000-hidden'));const c=current();let i=Math.max(0,cs.indexOf(c));if(e.key==='j'||e.key==='ArrowDown'){e.preventDefault();cs[Math.min(cs.length-1,i+1)]?.scrollIntoView({behavior:'smooth'})}if(e.key==='k'||e.key==='ArrowUp'){e.preventDefault();cs[Math.max(0,i-1)]?.scrollIntoView({behavior:'smooth'})}if(e.key==='l'){c?.querySelector('[data-like]')?.click();toast('❤️ Liked')}if(e.key==='s'){hud.querySelector('[data-x="speed"]').click()}if(e.key==='f'){hud.querySelector('[data-x="focus"]').click()}});
 new MutationObserver(sync).observe(feed,{childList:true,subtree:true});sync();return true}
function hook(){if(bind())return;setTimeout(hook,200)}hook();
})();