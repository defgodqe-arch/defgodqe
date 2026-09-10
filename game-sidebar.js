/* defgodqe — four direct mini-game launchers */
(() => {
  'use strict';
  if (window.__defgodqeGameSidebar) return;
  window.__defgodqeGameSidebar = true;

  const games = [
    ['⚡','Neon Orb Run','Dodge the falling energy blocks.','run'],
    ['◈','Cyber Breaker','Smash the neon core.','breaker'],
    ['▣','Memory Matrix','Match every glowing pair.','memory'],
    ['✦','Meteor Blaster','Blast the incoming meteors.','meteor']
  ];

  const css = `
    #dfMiniGameLinks{margin:8px 10px 10px;padding:10px;border:1px solid rgba(250,204,21,.12);border-radius:14px;background:rgba(255,255,255,.025)}
    #dfMiniGameLinks .df-mg-title{font-size:9px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#64748b;margin:0 3px 7px}
    #dfMiniGameLinks .df-mg-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
    #dfMiniGameLinks button{min-width:0;display:flex;align-items:center;gap:7px;padding:8px;border:1px solid rgba(255,255,255,.07);border-radius:10px;background:rgba(255,255,255,.035);color:#cbd5e1;cursor:pointer;text-align:left;transition:.16s}
    #dfMiniGameLinks button:hover{transform:translateY(-1px);border-color:rgba(250,204,21,.4);background:rgba(250,204,21,.07);box-shadow:0 0 18px rgba(250,204,21,.08)}
    #dfMiniGameLinks .df-mg-icon{width:24px;height:24px;display:grid;place-items:center;border-radius:7px;background:rgba(250,204,21,.09);color:#fde047;font-size:13px;flex:0 0 24px}
    #dfMiniGameLinks b{display:block;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #dfMiniGameLinks small{display:block;color:#64748b;font-size:7px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    @media(max-width:700px){#dfMiniGameLinks .df-mg-grid{grid-template-columns:1fr}}
  `;
  const style=document.createElement('style');style.id='df-mini-game-links-style';style.textContent=css;document.head.appendChild(style);

  function launch(id){
    const arcade=document.getElementById('dfGameBtn');
    if(!arcade){window.__defgodqeGamePending=id;return;}
    arcade.click();
    let tries=0;
    const timer=setInterval(()=>{
      const choice=document.querySelector(`#dfGameOverlay [data-game="${id}"]`);
      if(choice){clearInterval(timer);choice.click();}
      if(++tries>30)clearInterval(timer);
    },50);
  }

  function install(){
    if(document.getElementById('dfMiniGameLinks')) return true;
    const sidebar=document.getElementById('sidebar');if(!sidebar)return false;
    const user=sidebar.querySelector('#authRow')?.parentElement;if(!user)return false;
    const box=document.createElement('section');box.id='dfMiniGameLinks';
    box.innerHTML='<div class="df-mg-title">Mini games</div><div class="df-mg-grid"></div>';
    const grid=box.querySelector('.df-mg-grid');
    games.forEach(([icon,name,desc,id])=>{
      const b=document.createElement('button');b.type='button';b.title=desc;b.innerHTML=`<span class="df-mg-icon">${icon}</span><span><b>${name}</b><small>${desc}</small></span>`;b.onclick=()=>launch(id);grid.appendChild(b);
    });
    user.before(box);return true;
  }
  if(!install()){const mo=new MutationObserver(()=>{if(install())mo.disconnect()});mo.observe(document.body,{childList:true,subtree:true});}
})();
