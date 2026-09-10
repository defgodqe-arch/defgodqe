/* defgodqe — realism layer
 * Makes the interface feel like a real production social/AI app without replacing core systems.
 */
(()=>{'use strict';if(window.__defgodqeRealism)return;window.__defgodqeRealism=true;
const $=(s,r=document)=>r.querySelector(s); const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const style=document.createElement('style');style.textContent=`
:root{--df-real-bg:rgba(15,18,25,.78);--df-real-border:rgba(255,255,255,.10)}
.df-real-toast{position:fixed;left:50%;bottom:24px;transform:translate(-50%,20px);opacity:0;z-index:999999;padding:11px 16px;border:1px solid var(--df-real-border);border-radius:14px;background:var(--df-real-bg);backdrop-filter:blur(18px);color:#fff;font:500 14px system-ui;box-shadow:0 12px 35px #0008;transition:.25s}.df-real-toast.show{transform:translate(-50%,0);opacity:1}
.df-real-status{position:fixed;right:18px;bottom:18px;z-index:999998;display:flex;align-items:center;gap:7px;padding:7px 10px;border:1px solid var(--df-real-border);border-radius:999px;background:var(--df-real-bg);backdrop-filter:blur(14px);color:#cfd5df;font:500 11px system-ui}.df-real-dot{width:7px;height:7px;border-radius:50%;background:#45e08a;box-shadow:0 0 10px #45e08a}
.df-real-skeleton{position:relative;overflow:hidden}.df-real-skeleton:after{content:"";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,#ffffff12,transparent);animation:dfShimmer 1.2s infinite}@keyframes dfShimmer{to{transform:translateX(100%)}}
@media(max-width:700px){.df-real-status{bottom:8px;right:8px}.df-real-toast{bottom:60px;max-width:calc(100vw - 30px);text-align:center}}
`;document.head.appendChild(style);
function toast(msg){let t=$('.df-real-toast');if(!t){t=document.createElement('div');t.className='df-real-toast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove('show'),2200)}
function status(){if($('.df-real-status'))return;const s=document.createElement('div');s.className='df-real-status';s.innerHTML='<i class="df-real-dot"></i><span>Connected</span>';document.body.appendChild(s)}
function markButtons(){document.querySelectorAll('button').forEach(b=>{if(!b.dataset.realTitle&&b.textContent.trim())b.dataset.realTitle=b.textContent.trim()})}
function network(){const set=()=>{const n=navigator.onLine;const s=$('.df-real-status');if(s){s.querySelector('i').style.background=n?'#45e08a':'#ffb020';s.querySelector('i').style.boxShadow=n?'0 0 10px #45e08a':'0 0 10px #ffb020';s.querySelector('span').textContent=n?'Connected':'Offline'}};window.addEventListener('online',()=>{set();toast('Back online — syncing is ready')});window.addEventListener('offline',()=>{set();toast('You are offline — local features still work')});set()}
function saveDraft(){const i=$('#input')||$('#composer textarea');if(!i)return;const v=i.value||'';if(v)localStorage.setItem('defgodqe-draft',v);else localStorage.removeItem('defgodqe-draft')}
function restoreDraft(){const i=$('#input')||$('#composer textarea');if(!i)return;const v=localStorage.getItem('defgodqe-draft');if(v&&!i.value){i.value=v;i.dispatchEvent(new Event('input',{bubbles:true}));toast('Draft restored')}}
function interaction(){document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;if(b.dataset.realTitle==='')return; if(/^(Follow|Share|Comment)$/i.test(b.textContent.trim()))toast(b.textContent.trim()+' opened')},true)}
function init(){status();markButtons();network();restoreDraft();const i=$('#input')||$('#composer textarea');if(i){i.addEventListener('input',saveDraft);i.addEventListener('blur',saveDraft)}interaction();window.defgodqeRealism={toast};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();