/* defgodqe — direct mini-game sidebar buttons */
(function(){
  'use strict';
  if(window.__defgodqeSidebarGames) return;
  window.__defgodqeSidebarGames=true;

  const games=[
    ['⚡','Neon Orb Run','Endless dodge runner','run'],
    ['◈','Cyber Breaker','Breakout waves + power-ups','breaker'],
    ['▣','Memory Matrix','Fast memory challenge','memory'],
    ['✦','Meteor Blaster','Blast enemy waves + bosses','meteor']
  ];

  const css=`
    #dfSidebarGames{margin:8px 10px 10px;padding:9px;border:1px solid rgba(250,204,21,.16);border-radius:14px;background:rgba(250,204,21,.025)}
    #dfSidebarGamesTitle{padding:0 4px 7px;font:800 9px Inter,system-ui,sans-serif;letter-spacing:.13em;text-transform:uppercase;color:#64748b}
    #dfSidebarGamesGrid{display:grid;grid-template-columns:1fr 1fr;gap:5px}
    .df-side-game{display:flex;align-items:center;gap:7px;min-width:0;padding:8px 7px;border:1px solid rgba(255,255,255,.07);border-radius:10px;background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.015));color:#e2e8f0;cursor:pointer;text-align:left;transition:.16s}
    .df-side-game:hover{transform:translateY(-1px);border-color:rgba(250,204,21,.45);background:rgba(250,204,21,.07);box-shadow:0 0 18px rgba(250,204,21,.08)}
    .df-side-game i{font-style:normal;display:grid;place-items:center;width:24px;height:24px;flex:0 0 24px;border-radius:7px;background:rgba(250,204,21,.1);color:#fde047;font-size:13px}
    .df-side-game span{min-width:0;font:700 9px/1.1 Inter,system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .df-side-game small{display:block;margin-top:2px;color:#64748b;font:500 7px/1.1 Inter,system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    @media(max-width:700px){#dfSidebarGames{margin-left:8px;margin-right:8px}.df-side-game{padding:9px 6px}}
  `;
  const s=document.createElement('style');s.id='df-sidebar-games-style';s.textContent=css;document.head.appendChild(s);

  function launch(id){
    const arcade=document.getElementById('dfGameBtn');
    if(arcade) arcade.click();
    const tryStart=()=>{
      const game=document.querySelector('#dfUltimateMenu [data-game="'+id+'"]');
      if(game){game.click();return true}
      return false;
    };
    if(!tryStart()) setTimeout(tryStart,80);
    if(!tryStart()) setTimeout(tryStart,220);
  }

  function install(){
    if(document.getElementById('dfSidebarGames')) return true;
    const sidebar=document.getElementById('sidebar');
    if(!sidebar) return false;
    const anchor=document.getElementById('dfSidebarExperiences');
    const box=document.createElement('div');box.id='dfSidebarGames';
    box.innerHTML='<div id="dfSidebarGamesTitle">Mini Games</div><div id="dfSidebarGamesGrid"></div>';
    const grid=box.querySelector('#dfSidebarGamesGrid');
    games.forEach(g=>{
      const b=document.createElement('button');b.type='button';b.className='df-side-game';b.title=g[1]+' — '+g[2];
      b.innerHTML='<i>'+g[0]+'</i><span>'+g[1]+'<small>'+g[2]+'</small></span>';
      b.onclick=()=>launch(g[3]);grid.appendChild(b);
    });
    if(anchor) anchor.before(box); else sidebar.appendChild(box);
    return true;
  }
  if(!install()){
    const mo=new MutationObserver(()=>{if(install()) mo.disconnect()});
    mo.observe(document.body,{childList:true,subtree:true});
  }
})();
