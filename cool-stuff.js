/* defgodqe — extra futuristic UX layer */
(function(){
  'use strict';
  if(window.__defgodqeCoolStuff) return;
  window.__defgodqeCoolStuff=true;

  const css=`
#dfFxCanvas{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:.7}
body>div.flex.h-screen.w-screen{z-index:1}
#dfCommandPalette{position:fixed;inset:0;z-index:99999;display:none;align-items:flex-start;justify-content:center;padding:12vh 18px 24px;background:rgba(0,0,0,.58);backdrop-filter:blur(12px)}
#dfCommandPalette.open{display:flex}
.df-cp{width:min(620px,100%);border:1px solid rgba(250,204,21,.35);border-radius:22px;background:linear-gradient(145deg,rgba(20,24,34,.98),rgba(7,10,16,.98));box-shadow:0 25px 100px rgba(0,0,0,.7),0 0 60px rgba(250,204,21,.14);overflow:hidden}
.df-cp-head{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid rgba(250,204,21,.14)}
.df-cp-head input{flex:1;background:transparent;border:0;outline:0;color:#fff;font-size:16px}
.df-cp-head kbd{font-size:11px;color:#94a3b8;border:1px solid rgba(255,255,255,.12);border-radius:7px;padding:3px 7px}
.df-cp-list{padding:8px;max-height:55vh;overflow:auto}
.df-cp-item{display:flex;align-items:center;gap:12px;width:100%;padding:13px 14px;border:1px solid transparent;border-radius:13px;background:transparent;color:#e2e8f0;text-align:left;cursor:pointer}
.df-cp-item:hover,.df-cp-item.active{background:rgba(250,204,21,.09);border-color:rgba(250,204,21,.18);color:#fff}
.df-cp-icon{width:34px;height:34px;display:grid;place-items:center;border-radius:10px;background:rgba(250,204,21,.1);color:#fde047}
.df-cp-meta{margin-left:auto;font-size:11px;color:#64748b}
#dfToast{position:fixed;left:50%;bottom:28px;z-index:100000;transform:translate(-50%,20px);opacity:0;pointer-events:none;padding:10px 15px;border:1px solid rgba(250,204,21,.28);border-radius:999px;background:rgba(10,13,20,.92);color:#fef08a;box-shadow:0 10px 35px rgba(0,0,0,.4),0 0 25px rgba(250,204,21,.12);font-size:13px;transition:.25s ease;backdrop-filter:blur(12px)}
#dfToast.show{opacity:1;transform:translate(-50%,0)}
#dfLiveCore{position:fixed;right:18px;bottom:18px;z-index:20;display:flex;align-items:center;gap:7px;padding:6px 10px;border:1px solid rgba(250,204,21,.16);border-radius:999px;background:rgba(8,11,17,.58);backdrop-filter:blur(10px);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8;pointer-events:none}
#dfLiveCore i{width:6px;height:6px;border-radius:50%;background:#facc15;box-shadow:0 0 10px #facc15;animation:dfLivePulse 1.5s infinite}
@keyframes dfLivePulse{50%{opacity:.35;transform:scale(.7)}}
@media(max-width:1023px){#dfLiveCore{right:10px;bottom:10px}.df-cp{border-radius:18px}}
`;
  const st=document.createElement('style');st.id='defgodqe-cool-stuff';st.textContent=css;document.head.appendChild(st);

  const canvas=document.createElement('canvas');canvas.id='dfFxCanvas';document.body.appendChild(canvas);const ctx=canvas.getContext('2d');
  let W=0,H=0,pts=[];
  function resize(){W=canvas.width=innerWidth*devicePixelRatio;H=canvas.height=innerHeight*devicePixelRatio;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);pts=Array.from({length:Math.min(55,Math.max(20,Math.floor(innerWidth/28)))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:.5+Math.random()*1.5,v:.08+Math.random()*.22,p:Math.random()*6.28}))}
  function draw(){ctx.clearRect(0,0,innerWidth,innerHeight);for(const p of pts){p.y-=p.v;p.p+=.01;if(p.y<-5)p.y=innerHeight+5;const a=.12+.08*Math.sin(p.p);ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(250,204,21,${a})`;ctx.fill()}requestAnimationFrame(draw)}
  addEventListener('resize',resize,{passive:true});resize();draw();

  const palette=document.createElement('div');palette.id='dfCommandPalette';palette.innerHTML=`<div class="df-cp"><div class="df-cp-head"><span style="color:#facc15">⌘</span><input id="dfCpInput" placeholder="Search commands…" autocomplete="off"><kbd>ESC</kbd></div><div class="df-cp-list" id="dfCpList"></div></div>`;document.body.appendChild(palette);
  const toast=document.createElement('div');toast.id='dfToast';document.body.appendChild(toast);const live=document.createElement('div');live.id='dfLiveCore';live.innerHTML='<i></i><span>defgodqe online</span>';document.body.appendChild(live);
  const commands=[
    ['✦','New chat','Start a fresh conversation',()=>document.getElementById('newChatBtn')?.click()],
    ['◈','Mini arcade','Open the four-game arcade',()=>document.getElementById('dfGameBtn')?.click()],
    ['◎','Web data','Toggle web search',()=>document.getElementById('webBtn')?.click()],
    ['◉','Focus chat','Jump to the message box',()=>document.getElementById('input')?.focus()],
    ['⇩','Install app','Show the app install prompt',()=>document.getElementById('dfInstallBtn')?.click()]
  ];
  let selected=0;
  function render(filter=''){const list=document.getElementById('dfCpList');const q=filter.toLowerCase();const arr=commands.filter(c=>(c[1]+' '+c[2]).toLowerCase().includes(q));selected=Math.min(selected,Math.max(0,arr.length-1));list.innerHTML=arr.map((c,i)=>`<button class="df-cp-item ${i===selected?'active':''}" data-i="${i}"><span class="df-cp-icon">${c[0]}</span><span><b>${c[1]}</b><br><small style="color:#64748b">${c[2]}</small></span><span class="df-cp-meta">${i+1}</span></button>`).join('');list.querySelectorAll('.df-cp-item').forEach((b,i)=>b.onclick=()=>{arr[i][3]();close();})}
  function open(){palette.classList.add('open');selected=0;render();setTimeout(()=>document.getElementById('dfCpInput')?.focus(),20)}
  function close(){palette.classList.remove('open')}
  function notify(t){toast.textContent=t;toast.classList.add('show');clearTimeout(window.__dfToast);window.__dfToast=setTimeout(()=>toast.classList.remove('show'),1800)}
  document.getElementById('dfCpInput').addEventListener('input',e=>{selected=0;render(e.target.value)});
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();palette.classList.contains('open')?close():open();return}if(!palette.classList.contains('open'))return;if(e.key==='Escape'){close();return}const items=palette.querySelectorAll('.df-cp-item');if(e.key==='ArrowDown'){e.preventDefault();selected=Math.min(selected+1,items.length-1);render(document.getElementById('dfCpInput').value)}if(e.key==='ArrowUp'){e.preventDefault();selected=Math.max(selected-1,0);render(document.getElementById('dfCpInput').value)}if(e.key==='Enter'&&items[selected])items[selected].click()});
  palette.addEventListener('click',e=>{if(e.target===palette)close()});
  let lastOnline=navigator.onLine;addEventListener('online',()=>{if(!lastOnline)notify('Connection restored');lastOnline=true;live.querySelector('span').textContent='defgodqe online'});addEventListener('offline',()=>{lastOnline=false;notify('You are offline');live.querySelector('span').textContent='defgodqe offline'});
})();
