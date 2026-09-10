/* defgodqe — unified old-school shell for the new AI app
 * Keeps the restored AI runtime and all existing feature modules, while making
 * the visible application feel like the original defgodqe interface.
 */
(() => {
  'use strict';
  if (window.__defgodqeOldLookShell) return;
  window.__defgodqeOldLookShell = true;

  const inject = () => {
    if (document.getElementById('defgodqe-old-look-shell')) return;
    const style = document.createElement('style');
    style.id = 'defgodqe-old-look-shell';
    style.textContent = `
      :root{--df-brand:#facc15;--df-bg:#050505;--df-panel:rgba(12,15,22,.86);--df-line:rgba(255,255,255,.08)}
      body{background:var(--df-bg)!important;color:#e5e7eb!important}
      #sidebar{background:linear-gradient(180deg,rgba(15,19,28,.98),rgba(5,7,11,.98))!important;border-right:1px solid var(--df-line)!important;box-shadow:16px 0 50px rgba(0,0,0,.28)!important}
      #sidebar .df-old-nav{display:flex;flex-direction:column;gap:7px;padding:0 12px 10px}
      .df-old-btn{width:100%;min-height:43px;display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(255,255,255,.035);color:#cbd5e1;font-size:13px;font-weight:600;cursor:pointer;transition:.16s ease;box-shadow:inset 0 1px rgba(255,255,255,.025)}
      .df-old-btn:hover{background:rgba(250,204,21,.08);border-color:rgba(250,204,21,.34);color:#fff;transform:translateY(-1px);box-shadow:0 0 20px rgba(250,204,21,.06)}
      .df-old-btn.df-active{background:rgba(250,204,21,.11);border-color:rgba(250,204,21,.42);color:#facc15;box-shadow:0 0 22px rgba(250,204,21,.08)}
      .df-old-btn .df-nav-icon{width:17px;height:17px;display:grid;place-items:center;color:#facc15;flex:0 0 auto}
      .df-old-btn .df-nav-badge{margin-left:auto;font-size:9px;letter-spacing:.08em;color:#facc15;border:1px solid rgba(250,204,21,.24);background:rgba(250,204,21,.07);border-radius:999px;padding:3px 6px}
      main{background:#050505!important}
      main>header{background:rgba(5,5,5,.82)!important;border-bottom:1px solid rgba(255,255,255,.07)!important;backdrop-filter:blur(18px)}
      #scroll{background:radial-gradient(circle at 50% 30%,rgba(250,204,21,.045),transparent 34%),#050505!important}
      #welcome h1{font-weight:800;letter-spacing:-.04em}
      #welcome .orb,.orb{width:150px!important;height:150px!important;box-shadow:0 0 28px rgba(250,204,21,.65),0 0 80px rgba(250,204,21,.3),0 0 150px rgba(250,204,21,.12)!important}
      #composer{background:rgba(18,22,31,.82)!important;border:1px solid rgba(255,255,255,.1)!important;border-radius:18px!important;backdrop-filter:blur(18px);box-shadow:0 15px 45px rgba(0,0,0,.28)!important}
      #composer:focus-within{border-color:rgba(250,204,21,.48)!important;box-shadow:0 0 0 1px rgba(250,204,21,.08),0 15px 50px rgba(0,0,0,.3),0 0 30px rgba(250,204,21,.06)!important}
      #sendBtn{background:#facc15!important;color:#050505!important;border-radius:11px!important;box-shadow:0 0 22px rgba(250,204,21,.18)}
      #sendBtn:hover{background:#fde047!important;box-shadow:0 0 30px rgba(250,204,21,.3)}
      #modelBtn,#modeBtn,#webBtn,#voiceBtn{border-radius:10px!important}
      #voiceBtn{border-color:rgba(250,204,21,.4)!important;background:rgba(250,204,21,.1)!important;color:#facc15!important}
      #dfOldFeaturePanel{position:fixed;inset:0;z-index:100010;display:none;background:rgba(3,5,9,.96);backdrop-filter:blur(20px);color:#fff}
      #dfOldFeaturePanel.open{display:flex;align-items:center;justify-content:center;padding:18px}
      .df-feature-card{width:min(920px,100%);max-height:min(760px,94dvh);overflow:auto;border:1px solid rgba(250,204,21,.18);border-radius:22px;background:linear-gradient(180deg,rgba(20,25,35,.96),rgba(9,12,18,.97));box-shadow:0 30px 90px rgba(0,0,0,.55),0 0 45px rgba(250,204,21,.06);padding:22px}
      .df-feature-head{display:flex;align-items:center;gap:10px;margin-bottom:18px}.df-feature-head h2{margin:0;font-size:20px}.df-feature-close{margin-left:auto;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:#fff;border-radius:10px;padding:8px 11px;cursor:pointer}.df-feature-close:hover{border-color:rgba(250,204,21,.35);color:#facc15}
      .df-feature-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.df-feature-tile{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.035);border-radius:16px;padding:15px;cursor:pointer;text-align:left;color:#fff}.df-feature-tile:hover{border-color:rgba(250,204,21,.3);background:rgba(250,204,21,.06)}.df-feature-tile b{display:block;margin-bottom:5px}.df-feature-tile span{font-size:12px;color:#94a3b8}
      @media(max-width:700px){#sidebar .df-old-nav{padding:0 10px 10px}.df-feature-grid{grid-template-columns:1fr}.df-feature-card{padding:15px}.df-old-btn{min-height:45px}}
    `;
    document.head.appendChild(style);
  };

  const icon = (name) => `<i data-lucide="${name}" class="h-4 w-4"></i>`;
  const open = (fn) => { try { if (typeof fn === 'function') fn(); else window.alert('This feature is still loading. Try again in a moment.'); } catch(e) { console.warn(e); } };

  function makeButton(id, label, iconName, action, badge='') {
    if (document.getElementById(id)) return null;
    const b=document.createElement('button');
    b.id=id;b.type='button';b.className='df-old-btn';
    b.innerHTML=`<span class="df-nav-icon">${icon(iconName)}</span><span>${label}</span>${badge?`<span class="df-nav-badge">${badge}</span>`:''}`;
    b.addEventListener('click',action);return b;
  }

  function installNav(){
    const sidebar=document.getElementById('sidebar');
    if(!sidebar)return false;
    if(sidebar.querySelector('.df-old-nav')) return true;
    const auth=sidebar.querySelector('#authRow')?.parentElement;
    const nav=document.createElement('div');nav.className='df-old-nav';
    const chats=makeButton('dfOldChats','Chats','message-square',()=>{
      document.getElementById('welcome')?.scrollIntoView({behavior:'smooth'});
      document.querySelectorAll('.df-old-btn').forEach(x=>x.classList.remove('df-active'));chats?.classList.add('df-active');
    });
    const doom=makeButton('dfOldDoom','Doom Scroll','smartphone',()=>open(window.defgodqeDoomScrollOpen),'TIKTOK');
    const social=makeButton('dfOldSocial','defgodqe Social','users',()=>{
      if(typeof window.defgodqeSocialOpen==='function') return window.defgodqeSocialOpen();
      if(typeof window.defgodqeDoomSocialOpen==='function') return window.defgodqeDoomSocialOpen();
      const hub=document.getElementById('dfSocialHub'); if(hub){hub.classList.add('open');return;}
      toast('Social is loading…');
    },'SOCIAL');
    const neon=makeButton('dfOldNeon','Neon Tag','zap',()=>{
      if(window.defgodqeMultiplayer?.open) return window.defgodqeMultiplayer.open();
      toast('Neon Tag multiplayer is loading…');
    },'LIVE');
    const games=makeButton('dfOldGames','Mini Games','gamepad-2',()=>{
      if(window.defgodqeUltimateArcade?.open) return window.defgodqeUltimateArcade.open();
      if(window.defgodqeMiniArcade?.open) return window.defgodqeMiniArcade.open();
      toast('Mini games are loading…');
    },'ARCADE');
    [chats,doom,social,neon,games].forEach(x=>x&&nav.appendChild(x));
    if(auth)auth.before(nav);else sidebar.appendChild(nav);
    try{window.lucide?.createIcons?.();}catch{}
    try{window.createIcons?.();}catch{}
    return true;
  }

  function toast(message){
    const t=document.getElementById('toast');if(t){t.textContent=message;t.style.opacity='1';t.style.transform='translate(-50%,0)';clearTimeout(t.__dfTimer);t.__dfTimer=setTimeout(()=>{t.style.opacity='0';t.style.transform='translate(-50%,16px)'},1800);return;}
  }

  function installFeaturePanel(){
    if(document.getElementById('dfOldFeaturePanel'))return;
    const panel=document.createElement('div');panel.id='dfOldFeaturePanel';panel.innerHTML=`<section class="df-feature-card"><div class="df-feature-head"><div class="df-nav-icon">${icon('sparkles')}</div><h2>defgodqe</h2><button class="df-feature-close" type="button">Close</button></div><div class="df-feature-grid"><button class="df-feature-tile" data-action="social"><b>Social home</b><span>Upload videos, follow creators, like, comment, explore and message.</span></button><button class="df-feature-tile" data-action="doom"><b>Doom Scroll</b><span>Full-screen short-video scrolling with mouse wheel and touch.</span></button><button class="df-feature-tile" data-action="games"><b>Mini Games</b><span>Launch the upgraded defarcade collection.</span></button><button class="df-feature-tile" data-action="neon"><b>Neon Tag</b><span>Open the multiplayer laser freeze-tag arena.</span></button></div></section>`;
    document.body.appendChild(panel);panel.querySelector('.df-feature-close').onclick=()=>panel.classList.remove('open');
    panel.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{panel.classList.remove('open');const a=b.dataset.action;if(a==='doom')open(window.defgodqeDoomScrollOpen);else if(a==='games')open(window.defgodqeUltimateArcade?.open||window.defgodqeMiniArcade?.open);else if(a==='neon')open(window.defgodqeMultiplayer?.open);else if(a==='social')open(window.defgodqeSocialOpen||window.defgodqeDoomSocialOpen);});
  }

  function installOrbVoiceState(){
    const orb=document.querySelector('.orb');if(!orb)return;
    if(window.__defgodqeOrbVoiceInstalled)return;window.__defgodqeOrbVoiceInstalled=true;
    const set=(mode)=>{orb.dataset.voiceState=mode;orb.classList.toggle('df-speaking',mode==='speaking');orb.classList.toggle('df-listening',mode==='listening');};
    const s=document.createElement('style');s.textContent=`.orb.df-speaking{animation:dfVoiceSpeak .55s ease-in-out infinite alternate!important;filter:brightness(1.15) saturate(1.35)}.orb.df-listening{animation:dfVoiceListen .9s ease-in-out infinite!important;filter:brightness(1.08)}@keyframes dfVoiceSpeak{from{transform:scale(1);box-shadow:0 0 25px rgba(250,204,21,.65),0 0 70px rgba(250,204,21,.3)}to{transform:scale(1.12);box-shadow:0 0 42px rgba(250,204,21,.9),0 0 120px rgba(250,204,21,.5)}}@keyframes dfVoiceListen{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}`;document.head.appendChild(s);
    window.defgodqeOrbState=set;
    const voiceBtn=document.getElementById('voiceBtn');voiceBtn?.addEventListener('click',()=>set('listening'));
    const originalSpeech=window.speechSynthesis?.speak?.bind(window.speechSynthesis);
    if(originalSpeech&&window.speechSynthesis){window.speechSynthesis.speak=(utterance)=>{set('speaking');utterance.addEventListener?.('end',()=>set('idle'));utterance.addEventListener?.('error',()=>set('idle'));return originalSpeech(utterance)};}
  }

  function boot(){
    inject();installFeaturePanel();installNav();installOrbVoiceState();
    const mo=new MutationObserver(()=>{installNav();installOrbVoiceState();});mo.observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>mo.disconnect(),10000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
