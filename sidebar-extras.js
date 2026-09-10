/* defgodqe — sidebar experience launcher */
(function(){
'use strict';
if(window.__defgodqeSidebarExtras)return;
window.__defgodqeSidebarExtras=true;

const items=[
  ['📱','Doom Scroll','1000 Shorts','doom'],
  ['🕹️','Multiplayer','NEON TAG • 8 players','multiplayer'],
  ['🎮','Mini Arcade','4 Games','games'],
  ['🎙️','Voice Mode','Talk to defgodqe','voice'],
  ['🌐','Web Search','Search the web','web'],
  ['⚡','Feature Lab','Explore features','features'],
  ['⌘','Command Center','Quick actions','commands'],
  ['🎯','Focus Mode','Distraction-free chat','focus'],
  ['✨','Surprise Me','Get a random idea','surprise']
];

const css=`
#dfSidebarExperiences{margin-top:14px;padding:0 10px 10px}
.df-exp-label{padding:0 4px 7px;font-size:10px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:#475569}
.df-exp-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.df-exp-btn{position:relative;min-width:0;display:flex;align-items:center;gap:8px;padding:9px 8px;border:1px solid rgba(255,255,255,.06);border-radius:12px;background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.018));color:#cbd5e1;text-align:left;cursor:pointer;transition:transform .16s ease,border-color .16s ease,background .16s ease,box-shadow .16s ease;overflow:hidden}
.df-exp-btn::after{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent,rgba(250,204,21,.10),transparent);transform:translateX(-120%);transition:transform .35s ease}
.df-exp-btn:hover{transform:translateY(-1px);border-color:rgba(250,204,21,.25);background:rgba(250,204,21,.06);box-shadow:0 8px 24px rgba(0,0,0,.18)}
.df-exp-btn:hover::after{transform:translateX(120%)}
.df-exp-icon{width:27px;height:27px;flex:0 0 27px;display:grid;place-items:center;border-radius:8px;background:rgba(250,204,21,.09);font-size:14px}
.df-exp-text{min-width:0;line-height:1.1}.df-exp-text b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;color:#e2e8f0}.df-exp-text small{display:block;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:8px;color:#64748b}
.df-exp-hot{position:absolute;right:5px;top:4px;font-size:7px;color:#facc15;opacity:.8}
#dfExpToast{position:fixed;left:50%;bottom:24px;z-index:100010;transform:translate(-50%,12px);opacity:0;pointer-events:none;padding:9px 13px;border:1px solid rgba(250,204,21,.22);border-radius:999px;background:rgba(8,11,17,.94);color:#fef08a;font:600 12px Inter,system-ui,sans-serif;backdrop-filter:blur(12px);transition:.2s}
#dfExpToast.show{opacity:1;transform:translate(-50%,0)}
@media(max-width:700px){#dfSidebarExperiences{padding-left:8px;padding-right:8px}.df-exp-btn{padding:10px 7px}}
`;
const st=document.createElement('style');st.id='df-sidebar-extras-style';st.textContent=css;document.head.appendChild(st);

function click(id){const e=document.getElementById(id);if(e){e.click();return true}return false}
function toast(text){let t=document.getElementById('dfExpToast');if(!t){t=document.createElement('div');t.id='dfExpToast';document.body.appendChild(t)}t.textContent=text;t.classList.add('show');clearTimeout(window.__dfExpToast);window.__dfExpToast=setTimeout(()=>t.classList.remove('show'),1600)}
function action(type){
 if(type==='doom')return window.defgodqeDoomScrollOpen?.();
 if(type==='multiplayer')return window.defgodqeMultiplayer?.open?.();
 if(type==='games')return click('dfGameBtn');
 if(type==='voice')return click('voiceBtn');
 if(type==='web')return click('webBtn');
 if(type==='features')return click('dfFeatureBtn');
 if(type==='commands'){document.dispatchEvent(new KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true}));return}
 if(type==='focus'){document.body.classList.toggle('df-focus-mode');toast(document.body.classList.contains('df-focus-mode')?'Focus mode on':'Focus mode off');return}
 if(type==='surprise'){const el=document.getElementById('input')||document.querySelector('textarea');if(el){const prompts=['Invent a crazy new feature for defgodqe.','Give me a futuristic game idea I can build.','Create an epic Minecraft challenge.','Design a new AI mode nobody has seen before.','Give me a project I can finish this weekend.'];el.focus();el.value=prompts[Math.floor(Math.random()*prompts.length)];el.dispatchEvent(new Event('input',{bubbles:true}));toast('Surprise prompt ready');}return}
}
function install(){
 if(document.getElementById('dfSidebarExperiences'))return true;
 const sidebar=document.getElementById('sidebar');if(!sidebar)return false;
 const user=sidebar.querySelector('#authRow')?.parentElement;if(!user)return false;
 const box=document.createElement('div');box.id='dfSidebarExperiences';
 box.innerHTML='<div class="df-exp-label">Explore</div><div class="df-exp-grid"></div>';
 const grid=box.querySelector('.df-exp-grid');
 items.forEach((x,i)=>{const b=document.createElement('button');b.className='df-exp-btn';b.type='button';b.title=x[1]+' — '+x[2];b.innerHTML='<span class="df-exp-icon">'+x[0]+'</span><span class="df-exp-text"><b>'+x[1]+'</b><small>'+x[2]+'</small></span>'+(i<3?'<span class="df-exp-hot">NEW</span>':'');b.onclick=()=>action(x[3]);grid.appendChild(b)});
 user.before(box);return true;
}
if(!install()){const mo=new MutationObserver(()=>{if(install())mo.disconnect()});mo.observe(document.body,{childList:true,subtree:true})}
})();
