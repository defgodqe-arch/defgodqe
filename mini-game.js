/* defgodqe — mini game: Neon Orb Run */
(function(){
  'use strict';
  if(window.__defgodqeMiniGame) return;
  window.__defgodqeMiniGame=true;

  const style=document.createElement('style');
  style.textContent=`
#dfGameBtn{position:relative;overflow:hidden}
#dfGameBtn::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(250,204,21,.16),transparent);transform:translateX(-100%);animation:dfGameShine 3s infinite}
@keyframes dfGameShine{60%,100%{transform:translateX(100%)}}
#dfGameOverlay{position:fixed;inset:0;z-index:10001;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(2,5,10,.78);backdrop-filter:blur(14px)}
#dfGamePanel{position:relative;width:min(760px,96vw);height:min(620px,90vh);overflow:hidden;border:1px solid rgba(250,204,21,.3);border-radius:24px;background:linear-gradient(145deg,#111827,#070a10);box-shadow:0 0 80px rgba(250,204,21,.13),0 30px 100px rgba(0,0,0,.6)}
#dfGameCanvas{display:block;width:100%;height:100%;touch-action:none}
#dfGameHud{position:absolute;left:18px;right:18px;top:14px;display:flex;justify-content:space-between;align-items:center;pointer-events:none;font:700 14px Inter,system-ui;color:#fff;text-shadow:0 0 14px rgba(250,204,21,.5)}
#dfGameHud b{color:#facc15;font-size:20px}
#dfGameClose{position:absolute;right:14px;top:10px;z-index:3;width:38px;height:38px;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:rgba(10,13,20,.72);color:#fff;font-size:22px;cursor:pointer}
#dfGameStart{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:radial-gradient(circle,rgba(250,204,21,.09),rgba(5,8,13,.92) 55%);font-family:Inter,system-ui;color:#fff}
#dfGameStart h2{font-size:34px;margin:0 0 8px;font-weight:800}#dfGameStart h2 span{color:#facc15}#dfGameStart p{color:#94a3b8;margin:0 0 22px}#dfGameStart button{border:0;border-radius:14px;padding:12px 22px;background:#facc15;color:#111827;font-weight:800;cursor:pointer;box-shadow:0 0 28px rgba(250,204,21,.25)}
@media(max-width:600px){#dfGamePanel{width:100vw;height:100dvh;border-radius:0}#dfGameStart h2{font-size:28px}}
`;
  document.head.appendChild(style);

  function addButton(){
    if(document.getElementById('dfGameBtn')) return;
    const sidebar=document.getElementById('sidebar'); if(!sidebar) return;
    const user=sidebar.querySelector('#authRow')?.parentElement;
    if(!user) return;
    const wrap=document.createElement('div');wrap.className='px-3 pb-2';
    wrap.innerHTML='<button id="dfGameBtn" type="button" class="flex w-full items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-brand/10"><span style="font-size:17px">◈</span><span>Mini game</span><span style="margin-left:auto;font-size:10px;color:#facc15">PLAY</span></button>';
    user.before(wrap);
    document.getElementById('dfGameBtn').onclick=openGame;
  }

  const overlay=document.createElement('div');overlay.id='dfGameOverlay';overlay.innerHTML='<div id="dfGamePanel"><canvas id="dfGameCanvas"></canvas><div id="dfGameHud"><span>SCORE <b id="dfGameScore">0</b></span><span>BEST <b id="dfGameBest">0</b></span></div><button id="dfGameClose" aria-label="Close game">×</button><div id="dfGameStart"><h2>NEON <span>ORB RUN</span></h2><p>Move the orb. Dodge the incoming energy blocks.</p><button id="dfGameStartBtn">START GAME</button></div></div>';
  document.body.appendChild(overlay);

  const canvas=overlay.querySelector('#dfGameCanvas'),ctx=canvas.getContext('2d');let raf=0,running=false,score=0,best=Number(localStorage.getItem('df_game_best')||0),player={x:0,y:0,r:15},blocks=[],keys={},last=0,spawn=0;
  overlay.querySelector('#dfGameBest').textContent=best;
  function resize(){const r=canvas.getBoundingClientRect(),d=devicePixelRatio||1;canvas.width=r.width*d;canvas.height=r.height*d;ctx.setTransform(d,0,0,d,0,0);player.y=r.height-70;if(!player.x)player.x=r.width/2}
  function openGame(){overlay.style.display='flex';resize();overlay.querySelector('#dfGameStart').style.display='flex'}
  function closeGame(){running=false;cancelAnimationFrame(raf);overlay.style.display='none'}
  function start(){score=0;blocks=[];running=true;last=performance.now();spawn=0;const r=canvas.getBoundingClientRect();player={x:r.width/2,y:r.height-70,r:15};overlay.querySelector('#dfGameScore').textContent='0';overlay.querySelector('#dfGameStart').style.display='none';raf=requestAnimationFrame(loop)}
  function spawnBlock(){const r=canvas.getBoundingClientRect(),w=24+Math.random()*42;blocks.push({x:Math.random()*(r.width-w),y:-w,w,h:w,v:180+Math.random()*110+score*2})}
  function loop(t){if(!running)return;const dt=Math.min((t-last)/1000,.035);last=t;const r=canvas.getBoundingClientRect();ctx.clearRect(0,0,r.width,r.height);ctx.fillStyle='#070a10';ctx.fillRect(0,0,r.width,r.height);
    ctx.strokeStyle='rgba(250,204,21,.045)';ctx.lineWidth=1;for(let x=0;x<r.width;x+=36){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,r.height);ctx.stroke()}for(let y=0;y<r.height;y+=36){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(r.width,y);ctx.stroke()}
    let dx=(keys.ArrowRight||keys.d?1:0)-(keys.ArrowLeft||keys.a?1:0);player.x=Math.max(player.r,Math.min(r.width-player.r,player.x+dx*330*dt));
    if(pointer.active)player.x=Math.max(player.r,Math.min(r.width-player.r,pointer.x));
    spawn-=dt;if(spawn<=0){spawnBlock();spawn=Math.max(.28,.72-score/180)}
    blocks.forEach(b=>{b.y+=b.v*dt;ctx.shadowBlur=18;ctx.shadowColor='#facc15';ctx.fillStyle='#facc15';ctx.fillRect(b.x,b.y,b.w,b.h);ctx.shadowBlur=0});
    blocks=blocks.filter(b=>b.y<r.height+60);score+=dt*10;overlay.querySelector('#dfGameScore').textContent=Math.floor(score);
    ctx.beginPath();ctx.arc(player.x,player.y,player.r,0,Math.PI*2);ctx.shadowBlur=30;ctx.shadowColor='#facc15';ctx.fillStyle='#fde047';ctx.fill();ctx.shadowBlur=0;ctx.beginPath();ctx.arc(player.x-5,player.y-5,5,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();
    for(const b of blocks){const cx=Math.max(b.x,Math.min(player.x,b.x+b.w)),cy=Math.max(b.y,Math.min(player.y,b.y+b.h));if((player.x-cx)**2+(player.y-cy)**2<(player.r+3)**2)return gameOver()}
    raf=requestAnimationFrame(loop)
  }
  function gameOver(){running=false;cancelAnimationFrame(raf);const n=Math.floor(score);if(n>best){best=n;localStorage.setItem('df_game_best',best);overlay.querySelector('#dfGameBest').textContent=best}overlay.querySelector('#dfGameStart').style.display='flex';overlay.querySelector('#dfGameStart h2').innerHTML='GAME <span>OVER</span>';overlay.querySelector('#dfGameStart p').textContent='Score: '+n+' • Best: '+best;overlay.querySelector('#dfGameStartBtn').textContent='PLAY AGAIN'}
  const pointer={active:false,x:0};canvas.addEventListener('pointerdown',e=>{pointer.active=true;pointer.x=e.clientX-canvas.getBoundingClientRect().left});canvas.addEventListener('pointermove',e=>{if(pointer.active)pointer.x=e.clientX-canvas.getBoundingClientRect().left});window.addEventListener('pointerup',()=>pointer.active=false);window.addEventListener('keydown',e=>{keys[e.key]=true;if(e.key==='Escape')closeGame()});window.addEventListener('keyup',e=>keys[e.key]=false);window.addEventListener('resize',resize);overlay.querySelector('#dfGameClose').onclick=closeGame;overlay.querySelector('#dfGameStartBtn').onclick=start;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addButton,{once:true});else addButton();
  const observer=new MutationObserver(addButton);observer.observe(document.body,{childList:true,subtree:true});
})();
