/* defgodqe — sidebar experience launcher */
(function(){
'use strict';
if(window.__defgodqeSidebarExtras)return;
window.__defgodqeSidebarExtras=true;

const items=[
  ['📱','Doom Scroll','1000 Shorts','doom'],
  ['🎙️','Voice Mode','Talk to defgodqe','voice'],
  ['🌐','Web Search','Search the web','web'],
  ['⚡','Feature Lab','Explore features','features'],
  ['⌘','Command Center','Quick actions','commands'],
  ['🎯','Focus Mode','Distraction-free chat','focus'],
  ['✨','Surprise Me','Get a random idea','surprise']
];

const css=`
#dfSidebarExperiences{padding:8px 12px 10px}
#dfSidebarExperiences .df-exp-label{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#64748b;font-weight:800;padding:0 4px 7px}
#dfSidebarExperiences .df-exp-grid{display:grid;gap:6px}
#dfSidebarExperiences .df-exp-btn,#dfNeonTagWrap #dfNeonTagBtn{position:relative;overflow:hidden;width:100%;display:flex;align-items:center;gap:9px;padding:10px 11px;border:1px solid rgba(255,255,255,.08);border-radius:13px;background:linear-gradient(135deg,rgba(255,255,255,.045),rgba(255,255,255,.018));color:#cbd5e1;text-align:left;cursor:pointer;transition:transform .18s,border-color .18s,background .18s,box-shadow .18s;font:600 13px Inter,system-ui,sans-serif}
#dfSidebarExperiences .df-exp-btn:hover{transform:translateX(2px);border-color:rgba(250,204,21,.28);background:rgba(250,204,21,.06);box-shadow:0 0 18px rgba(250,204,21,.08)}
#dfSidebarExperiences .df-exp-icon{width:24px;text-align:center;font-size:16px;filter:drop-shadow(0 0 7px rgba(250,204,21,.25))}
#dfSidebarExperiences .df-exp-copy{min-width:0;display:flex;flex-direction:column;gap:2px}
#dfSidebarExperiences .df-exp-copy strong{color:#e2e8f0;font-size:12px}
#dfSidebarExperiences .df-exp-copy small{color:#64748b;font-size:10px;font-weight:500}
#dfSidebarExperiences .df-exp-btn::after,#dfNeonTagWrap #dfNeonTagBtn::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(250,204,21,.16),transparent);transform:translateX(-110%);animation:dfSideShine 4s infinite}
#dfNeonTagWrap{padding:0 12px 7px}
#dfNeonTagWrap #dfNeonTagBtn{border-color:rgba(250,204,21,.38);background:linear-gradient(135deg,rgba(250,204,21,.13),rgba(250,204,21,.035));box-shadow:0 0 22px rgba(250,204,21,.10),inset 0 0 18px rgba(250,204,21,.035);color:#fef3c7}
#dfNeonTagWrap #dfNeonTagBtn:hover{transform:translateY(-1px) scale(1.01);border-color:rgba(250,204,21,.72);box-shadow:0 0 30px rgba(250,204,21,.18),inset 0 0 20px rgba(250,204,21,.06)}
#dfNeonTagWrap .df-neon-icon{width:25px;text-align:center;font-size:18px;color:#fde047;text-shadow:0 0 12px #facc15}
#dfNeonTagWrap .df-neon-copy{display:flex;flex-direction:column;gap:2px;min-width:0}
#dfNeonTagWrap .df-neon-copy strong{font-size:13px;color:#fff}
#dfNeonTagWrap .df-neon-copy small{font-size:9px;letter-spacing:.09em;color:#facc15;font-weight:800}
#dfNeonTagWrap .df-neon-hot{margin-left:auto;font-size:9px;font-weight:900;color:#fef08a;border:1px solid rgba(250,204,21,.28);padding:3px 6px;border-radius:999px;background:rgba(250,204,21,.08)}
@keyframes dfSideShine{0%,55%{transform:translateX(-110%)}80%,100%{transform:translateX(110%)}}
@media(max-width:600px){#dfSidebarExperiences{padding-left:9px;padding-right:9px}#dfNeonTagWrap{padding-left:9px;padding-right:9px}}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

function toast(msg){
  const t=document.createElement('div');
  t.textContent=msg;
  t.style='position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:20000;background:#0b1220;color:#fde68a;border:1px solid rgba(250,204,21,.3);padding:10px 14px;border-radius:12px;box-shadow:0 10px 35px rgba(0,0,0,.45);font:700 12px Inter,system-ui,sans-serif';
  document.body.appendChild(t);setTimeout(()=>t.remove(),2200);
}
function click(id){const el=document.getElementById(id);if(el){el.click();return true}return false}
function action(type){
 if(type==='doom')return window.defgodqeDoomScrollOpen?.();
 if(type==='multiplayer'){
   if(window.defgodqeMultiplayer?.open){window.defgodqeMultiplayer.open();return true}
   toast('Loading Neon Tag…');
   const start=Date.now();
   const timer=setInterval(()=>{
     if(window.defgodqeMultiplayer?.open){clearInterval(timer);window.defgodqeMultiplayer.open();return}
     if(Date.now()-start>8000){clearInterval(timer);toast('Neon Tag is still loading — refresh once')}
   },100);
   return false;
 }
 if(type==='games')return click('dfGameBtn');
 if(type==='voice')return click('voiceBtn')||click('voiceModeBtn');
 if(type==='web')return click('webSearchBtn')||click('searchWebBtn');
 if(type==='features')return window.defgodqeOpenFeatureLab?.()||toast('Feature Lab is ready');
 if(type==='commands')return window.defgodqeOpenCommandCenter?.()||toast('Command Center is ready');
 if(type==='focus')return document.body.classList.toggle('df-focus-mode');
 if(type==='surprise'){const ideas=['Build a new mini-game','Generate a Minecraft challenge','Create a viral short idea','Design a new app feature'];return toast(ideas[Math.floor(Math.random()*ideas.length)])}
}

function installExplore(){
 if(document.getElementById('dfSidebarExperiences'))return true;
 const sidebar=document.getElementById('sidebar');if(!sidebar)return false;
 const user=sidebar.querySelector('#authRow')?.parentElement;if(!user)return false;
 const box=document.createElement('div');box.id='dfSidebarExperiences';
 box.innerHTML='<div class="df-exp-label">Explore</div><div class="df-exp-grid"></div>';
 const grid=box.querySelector('.df-exp-grid');
 items.forEach(x=>{
   const b=document.createElement('button');b.type='button';b.className='df-exp-btn';
   b.innerHTML='<span class="df-exp-icon">'+x[0]+'</span><span class="df-exp-copy"><strong>'+x[1]+'</strong><small>'+x[2]+'</small></span>';
   b.onclick=()=>action(x[3]);grid.appendChild(b);
 });
 user.before(box);return true;
}

function installNeonTag(){
 if(document.getElementById('dfNeonTagWrap'))return true;
 const sidebar=document.getElementById('sidebar');if(!sidebar)return false;
 const gameBtn=document.getElementById('dfGameBtn');if(!gameBtn)return false;
 const gameWrap=gameBtn.closest('.px-3')||gameBtn.parentElement;
 if(!gameWrap||!gameWrap.parentElement)return false;
 const wrap=document.createElement('div');wrap.id='dfNeonTagWrap';
 wrap.innerHTML='<button id="dfNeonTagBtn" type="button" aria-label="Open Neon Tag laser freeze arena"><span class="df-neon-icon">⚡</span><span class="df-neon-copy"><strong>Neon Tag</strong><small>LASER FREEZE ARENA</small></span><span class="df-neon-hot">LIVE</span></button>';
 gameWrap.parentElement.insertBefore(wrap,gameWrap);
 document.getElementById('dfNeonTagBtn').onclick=()=>action('multiplayer');
 return true;
}

function boot(){
 const a=installExplore();
 const n=installNeonTag();
 return a&&n;
}

if(!boot()){
 const mo=new MutationObserver(()=>{if(boot())mo.disconnect()});
 mo.observe(document.body,{childList:true,subtree:true});
 setTimeout(()=>mo.disconnect(),15000);
}
})();