/* defgodqe — app-wide performance + UX boost
 * Non-destructive layer: augments the existing app without replacing its core.
 */
(function(){
'use strict';
if(window.__defgodqeAppBoost)return;
window.__defgodqeAppBoost=true;

const KEY='defgodqe-app-boost-v1';
const state={draft:'',focus:false,offline:!navigator.onLine};
try{Object.assign(state,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{}

const css=`
:root{--df-accent:#facc15;--df-glow:rgba(250,204,21,.16)}
body:before{content:"";position:fixed;inset:0;pointer-events:none;z-index:-1;background:radial-gradient(700px 360px at 50% -12%,rgba(250,204,21,.055),transparent 70%)}
#dfBoostStatus{position:fixed;right:14px;bottom:14px;z-index:9998;display:flex;align-items:center;gap:7px;padding:7px 10px;border:1px solid rgba(255,255,255,.08);border-radius:999px;background:rgba(8,11,17,.78);backdrop-filter:blur(14px);color:#94a3b8;font:700 10px system-ui;box-shadow:0 8px 30px rgba(0,0,0,.2);transition:.2s}
#dfBoostStatus i{width:6px;height:6px;border-radius:50%;background:#22c55e;box-shadow:0 0 9px rgba(34,197,94,.7)}#dfBoostStatus.off i{background:#ef4444;box-shadow:0 0 9px rgba(239,68,68,.6)}
#dfBoostFocus{position:fixed;inset:0;z-index:9997;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.82);backdrop-filter:blur(18px)}#dfBoostFocus.open{display:flex}
.df-bf{width:min(760px,calc(100vw - 28px));padding:24px;border:1px solid rgba(250,204,21,.2);border-radius:24px;background:linear-gradient(145deg,#111824,#090d14);box-shadow:0 30px 100px #000;color:#fff}
.df-bf h2{margin:0;font-size:20px}.df-bf p{color:#64748b;font-size:12px}.df-bf-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:18px}.df-bf button{padding:13px 12px;border:1px solid rgba(255,255,255,.08);border-radius:13px;background:#111722;color:#dbe3ef;text-align:left;font-weight:700;cursor:pointer}.df-bf button:hover{border-color:rgba(250,204,21,.3);background:#171e2a;transform:translateY(-1px)}
#dfBoostDraft{position:fixed;left:50%;bottom:6px;transform:translateX(-50%);z-index:9996;font:600 9px system-ui;color:#475569;pointer-events:none;opacity:0;transition:.2s}#dfBoostDraft.show{opacity:1}
body.df-boost-focus #sidebar,body.df-boost-focus header{opacity:.18;filter:blur(2px)}body.df-boost-focus main{filter:saturate(1.08)}
@media(max-width:650px){#dfBoostStatus{right:8px;bottom:8px}.df-bf-grid{grid-template-columns:1fr 1fr}.df-bf{padding:18px}}
@media(prefers-reduced-motion:reduce){#dfBoostFocus *{transition:none!important}}
`;
const s=document.createElement('style');s.id='dfBoostStyle';s.textContent=css;document.head.appendChild(s);

function persist(){try{localStorage.setItem(KEY,JSON.stringify({draft:state.draft,focus:state.focus}))}catch{}}
function notify(text){let x=document.getElementById('dfBoostToast');if(!x){x=document.createElement('div');x.id='dfBoostToast';x.style.cssText='position:fixed;left:50%;bottom:28px;z-index:10000;transform:translate(-50%,14px);opacity:0;padding:10px 14px;border:1px solid rgba(250,204,21,.22);border-radius:12px;background:rgba(9,13,20,.94);color:#fff;font:700 12px system-ui;box-shadow:0 15px 50px #000;transition:.2s';document.body.appendChild(x)}x.textContent=text;x.style.opacity='1';x.style.transform='translate(-50%,0)';clearTimeout(x._t);x._t=setTimeout(()=>{x.style.opacity='0';x.style.transform='translate(-50%,14px)'},1600)}
function input(){return document.getElementById('input')||document.querySelector('#composer textarea')}
function saveDraft(){const el=input();if(!el)return;state.draft=el.value||'';persist();const b=document.getElementById('dfBoostDraft');if(b)b.classList.toggle('show',!!state.draft)}
function restoreDraft(){const el=input();if(!el||!state.draft||el.value)return;if(state.draft.length>0){el.value=state.draft;el.dispatchEvent(new Event('input',{bubbles:true}));const b=document.getElementById('dfBoostDraft');if(b)b.classList.add('show')}}
function clearDraft(){state.draft='';persist();const b=document.getElementById('dfBoostDraft');if(b)b.classList.remove('show')}
function send(){const b=document.getElementById('sendBtn');if(b){b.click();setTimeout(clearDraft,120)}}
function updateStatus(){const x=document.getElementById('dfBoostStatus');if(!x)return;const on=navigator.onLine;x.classList.toggle('off',!on);x.title=on?'Online':'Offline';x.innerHTML='<i></i><span>'+ (on?'ONLINE':'OFFLINE') +'</span>'}
function setupStatus(){const x=document.createElement('div');x.id='dfBoostStatus';x.innerHTML='<i></i><span>ONLINE</span>';document.body.appendChild(x);updateStatus();window.addEventListener('online',()=>{updateStatus();notify('Back online')});window.addEventListener('offline',()=>{updateStatus();notify('Offline — local features still work')})}

function openFocus(){const el=document.getElementById('dfBoostFocus');if(!el)return;el.classList.add('open');state.focus=true;document.body.classList.add('df-boost-focus');persist();}
function closeFocus(){const el=document.getElementById('dfBoostFocus');if(!el)return;el.classList.remove('open');state.focus=false;document.body.classList.remove('df-boost-focus');persist()}
function action(name){
 if(name==='chat'){document.getElementById('newChatBtn')?.click();closeFocus();return}
 if(name==='doom'){window.defgodqeOwnedDoomOpen?.();closeFocus();return}
 if(name==='games'){document.getElementById('dfGameBtn')?.click();closeFocus();return}
 if(name==='voice'){document.getElementById('voiceBtn')?.click();closeFocus();return}
 if(name==='web'){document.getElementById('webBtn')?.click();closeFocus();return}
 if(name==='focus'){closeFocus();state.focus=!state.focus;document.body.classList.toggle('df-boost-focus',state.focus);persist();notify(state.focus?'Focus mode on':'Focus mode off');return}
 if(name==='fullscreen'){document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.();return}
 if(name==='clear'){clearDraft();if(confirm('Start a fresh conversation?'))document.getElementById('newChatBtn')?.click();closeFocus();return}
 if(name==='reload'){location.reload();return}
}
function setupFocus(){const el=document.createElement('div');el.id='dfBoostFocus';el.innerHTML='<div class="df-bf"><h2>defgodqe quick actions</h2><p>One place for the most important parts of your app.</p><div class="df-bf-grid"><button data-a="chat">＋ New chat</button><button data-a="doom">📱 Doom scroll</button><button data-a="games">🎮 Mini games</button><button data-a="voice">🎙 Voice</button><button data-a="web">🌎 Web search</button><button data-a="focus">⚡ Focus mode</button><button data-a="fullscreen">⛶ Fullscreen</button><button data-a="clear">🧹 Fresh start</button><button data-a="reload">↻ Reload app</button></div></div>';document.body.appendChild(el);el.addEventListener('click',e=>{if(e.target===el)closeFocus();const b=e.target.closest('[data-a]');if(b)action(b.dataset.a)})}

function performance(){
 document.querySelectorAll('img').forEach(img=>{if(!img.loading)img.loading='lazy';if(!img.decoding)img.decoding='async'});
 if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const img=e.target;if(img.dataset.src&&!img.src)img.src=img.dataset.src;io.unobserve(img)}),{rootMargin:'300px'});document.querySelectorAll('img[data-src]').forEach(x=>io.observe(x))}
}
function wire(){
 setupStatus();setupFocus();
 const d=document.createElement('div');d.id='dfBoostDraft';d.textContent='Draft saved';document.body.appendChild(d);
 const el=input();if(el){el.addEventListener('input',saveDraft,{passive:true});restoreDraft()}
 performance();
 new MutationObserver(()=>{const e=input();if(e&&!e.__dfBoost){e.__dfBoost=true;e.addEventListener('input',saveDraft,{passive:true});restoreDraft()}performance()}).observe(document.body,{childList:true,subtree:true});
 document.addEventListener('keydown',e=>{
   const tag=document.activeElement?.tagName;
   if(e.key==='Escape'){closeFocus();return}
   if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='o'){e.preventDefault();document.getElementById('newChatBtn')?.click();return}
   if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='f'){e.preventDefault();document.getElementById('dfSearch')?.click();return}
   if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='d'){e.preventDefault();window.defgodqeOwnedDoomOpen?.();return}
   if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='g'){e.preventDefault();document.getElementById('dfGameBtn')?.click();return}
   if(e.ctrlKey&&e.key.toLowerCase()==='j'){e.preventDefault();openFocus();return}
   if(e.key==='Enter'&&!e.shiftKey&&!e.ctrlKey&&!e.altKey&&tag!=='INPUT'){const i=input();if(i&&document.activeElement===i){e.preventDefault();send()}}
 },true);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)saveDraft()});
 window.addEventListener('beforeunload',saveDraft);
 if(state.focus){document.body.classList.add('df-boost-focus')}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire,{once:true});else wire();
window.defgodqeAppBoost={notify,openFocus,closeFocus,saveDraft};
})();
