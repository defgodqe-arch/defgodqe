/* defgodqe — feature pack: lots of useful AI-app upgrades in one lightweight module */
(function(){
  'use strict';
  if(window.__defgodqeFeaturePack)return;
  window.__defgodqeFeaturePack=true;

  const css=`
#dfFeatureBtn{position:fixed;right:18px;bottom:62px;z-index:80;display:flex;align-items:center;gap:7px;padding:9px 12px;border:1px solid rgba(250,204,21,.25);border-radius:13px;background:rgba(15,19,28,.86);color:#fef08a;font-size:12px;font-weight:700;backdrop-filter:blur(14px);box-shadow:0 10px 30px rgba(0,0,0,.25);cursor:pointer}
#dfFeatureBtn:hover{background:rgba(30,35,45,.95);transform:translateY(-1px)}
#dfFeatureModal{position:fixed;inset:0;z-index:100001;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(0,0,0,.62);backdrop-filter:blur(14px)}
#dfFeatureModal.open{display:flex}
.df-fm{width:min(920px,100%);max-height:min(760px,90vh);overflow:hidden;border:1px solid rgba(250,204,21,.22);border-radius:24px;background:#0b0f17;box-shadow:0 30px 120px rgba(0,0,0,.7)}
.df-fm-head{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.07)}
.df-fm-head b{font-size:17px;color:#fff}.df-fm-head small{color:#64748b}.df-fm-head input{margin-left:auto;width:min(300px,45%);padding:9px 12px;border:1px solid rgba(255,255,255,.09);border-radius:10px;background:#111722;color:#fff;outline:0}
.df-fm-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;padding:14px;overflow:auto;max-height:calc(min(760px,90vh) - 70px)}
.df-fm-card{display:flex;align-items:center;gap:10px;padding:12px;border:1px solid rgba(255,255,255,.07);border-radius:14px;background:#101621;color:#e2e8f0;text-align:left;cursor:pointer}.df-fm-card:hover{border-color:rgba(250,204,21,.3);background:#151c28}.df-fm-icon{width:32px;height:32px;display:grid;place-items:center;border-radius:9px;background:rgba(250,204,21,.1);color:#fde047}.df-fm-card b{font-size:12px}.df-fm-card small{display:block;color:#64748b;margin-top:2px;font-size:10px}
.df-fm-close{margin-left:8px;width:34px;height:34px;border:0;border-radius:10px;background:#151a24;color:#94a3b8;font-size:20px;cursor:pointer}.df-fm-close:hover{color:#fff}
#dfReadingBar{position:fixed;top:0;left:0;width:0;height:2px;background:#facc15;z-index:100002;box-shadow:0 0 12px rgba(250,204,21,.7);pointer-events:none}
body.df-focus-mode #sidebar,body.df-focus-mode header{display:none!important}body.df-focus-mode main{width:100%!important}body.df-focus-mode #dfFeatureBtn{opacity:.45}
body.df-compact-mode .message,body.df-compact-mode [class*="message"]{margin-top:2px!important;margin-bottom:2px!important}
body.df-large-text{font-size:18px!important}body.df-reduced-motion *,body.df-reduced-motion *::before,body.df-reduced-motion *::after{animation-duration:.001ms!important;transition-duration:.001ms!important;scroll-behavior:auto!important}
@media(max-width:700px){#dfFeatureBtn{right:10px;bottom:58px;padding:8px 10px}.df-fm-grid{grid-template-columns:1fr 1fr}.df-fm-head input{width:42%}}
@media(max-width:450px){.df-fm-grid{grid-template-columns:1fr}.df-fm-head input{width:40%}}
`;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  const toast=document.createElement('div');toast.id='dfFeatureToast';toast.style.cssText='position:fixed;left:50%;bottom:28px;z-index:100003;transform:translate(-50%,20px);opacity:0;pointer-events:none;padding:10px 14px;border:1px solid rgba(250,204,21,.25);border-radius:999px;background:rgba(10,13,20,.94);color:#fef08a;font:600 12px system-ui;transition:.2s;backdrop-filter:blur(12px)';document.body.appendChild(toast);
  let toastTimer;
  function notify(text){toast.textContent=text;toast.style.opacity='1';toast.style.transform='translate(-50%,0)';clearTimeout(toastTimer);toastTimer=setTimeout(()=>{toast.style.opacity='0';toast.style.transform='translate(-50%,20px)'},1700)}
  function clickId(id){const e=document.getElementById(id);if(e){e.click();return true}return false}
  function copyText(text){if(navigator.clipboard)navigator.clipboard.writeText(text).then(()=>notify('Copied'))}
  function chatInput(){return document.getElementById('input')||document.querySelector('textarea')||document.querySelector('input[type=text]')}
  function setInput(text){const el=chatInput();if(!el){notify('Chat input not found');return}el.focus();el.value=text;el.dispatchEvent(new Event('input',{bubbles:true}));notify('Added to prompt')}

  const features=[
    ['✦','New chat','Start fresh',()=>clickId('newChatBtn')],
    ['⌘','Command palette','Open command search',()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true}))}],
    ['◎','Web search','Toggle live web mode',()=>clickId('webBtn')],
    ['◉','Voice mode','Open voice controls',()=>clickId('voiceBtn')],
    ['🎮','Mini arcade','Open games',()=>clickId('dfGameBtn')],
    ['📱','Doom scroll','Open 1000-short feed',()=>window.defgodqeDoomScrollOpen?.()],
    ['⚡','Focus mode','Hide distractions',()=>document.body.classList.toggle('df-focus-mode')],
    ['▤','Compact mode','Tighter chat spacing',()=>document.body.classList.toggle('df-compact-mode')],
    ['A','Large text','Increase readability',()=>document.body.classList.toggle('df-large-text')],
    ['◌','Reduce motion','Disable most animations',()=>document.body.classList.toggle('df-reduced-motion')],
    ['↕','Scroll top','Jump to latest area',()=>{const s=document.getElementById('scroll');if(s)s.scrollTop=s.scrollHeight}],
    ['⌃','Scroll top page','Jump to top',()=>{const s=document.getElementById('scroll');if(s)s.scrollTo({top:0,behavior:'smooth'})}],
    ['⛶','Fullscreen','Toggle browser fullscreen',()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.()],
    ['⎋','Close menus','Escape active overlays',()=>document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))],
    ['?','Keyboard help','Show shortcuts',()=>notify('Ctrl+K palette • Enter send • Esc close • Doom: ↑ ↓')],
    ['↺','Reload app','Refresh safely',()=>location.reload()],
    ['⏱','Time','Show current time',()=>notify(new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}))],
    ['📅','Date','Show current date',()=>notify(new Date().toLocaleDateString())],
    ['🔗','Copy page link','Copy current URL',()=>copyText(location.href)],
    ['📋','Copy app name','Copy defgodqe',()=>copyText('defgodqe')],
    ['💡','Prompt: explain','Insert explanation prompt',()=>setInput('Explain this clearly, step by step, with examples.')],
    ['🧠','Prompt: brainstorm','Insert brainstorming prompt',()=>setInput('Brainstorm 10 creative ideas for this and rank the best 3.')],
    ['💻','Prompt: code','Insert coding prompt',()=>setInput('Write clean, production-ready code. Explain the important parts briefly.')],
    ['📝','Prompt: rewrite','Insert rewrite prompt',()=>setInput('Rewrite my text to be clearer, more polished, and natural while keeping my meaning.')],
    ['🔍','Prompt: analyze','Insert analysis prompt',()=>setInput('Analyze this carefully. Identify key points, risks, assumptions, and useful next steps.')],
    ['🎯','Prompt: plan','Insert planning prompt',()=>setInput('Turn this into a practical step-by-step plan with priorities and checkpoints.')],
    ['🧪','Prompt: debug','Insert debugging prompt',()=>setInput('Debug this. Find the root cause, explain it, and give me the smallest reliable fix.')],
    ['🌎','Prompt: research','Insert research prompt',()=>setInput('Research this thoroughly, compare reliable sources, and summarize the findings.')],
    ['📚','Prompt: teach','Insert teaching prompt',()=>setInput('Teach me this like a great tutor. Start simple, then build toward advanced concepts.')],
    ['🎨','Prompt: creative','Insert creative prompt',()=>setInput('Make this more creative, distinctive, polished, and visually interesting.')],
    ['⚙','Settings','Open available settings',()=>notify('Use the settings controls in your app')],
    ['🔔','Notifications','Check browser notification support',()=>notify('Notifications: '+('Notification' in window?'supported':'not supported'))],
    ['📶','Connection','Check network status',()=>notify(navigator.onLine?'Online':'Offline')],
    ['🖥','Screen info','Show viewport size',()=>notify(innerWidth+' × '+innerHeight)],
    ['💾','Storage info','Show local storage usage',()=>{let n=0;try{for(let i=0;i<localStorage.length;i++)n+=localStorage.getItem(localStorage.key(i))?.length||0}catch(_){}notify('Local storage: ~'+Math.round(n/1024)+' KB')}],
    ['🧹','Clear temporary UI','Close panels and menus',()=>{document.querySelectorAll('.open').forEach(e=>e.classList.remove('open'));notify('UI cleaned up')}],
    ['🎛','Reset visual modes','Reset focus/readability modes',()=>{document.body.classList.remove('df-focus-mode','df-compact-mode','df-large-text','df-reduced-motion');notify('Visual modes reset')}],
    ['📖','Reading progress','Show chat scroll progress',()=>notify('Reading progress is shown by the top bar')],
    ['🧭','Quick navigate','Focus chat input',()=>chatInput()?.focus()],
    ['⌨','Send hint','Focus and remind send',()=>{chatInput()?.focus();notify('Type your message and press Enter')}],
    ['🔒','Privacy check','Show local privacy note',()=>notify('Your UI preferences stay in this browser unless your app syncs them')],
    ['✨','Surprise me','Insert a random creative task',()=>{const a=['Invent a futuristic Minecraft empire.','Design a new AI feature nobody has built yet.','Create a game mechanic that would be addictive but fair.','Write a cinematic opening scene for a sci-fi adventure.','Come up with 20 names for a legendary project.'];setInput(a[Math.floor(Math.random()*a.length)])}],
    ['🎲','Random idea','Generate a random idea prompt',()=>setInput('Give me one surprising idea that I can build today, then show me how to start.')],
    ['🧩','Feature ideas','Ask AI for features',()=>setInput('Give me 25 genuinely useful features I could add to my defgodqe AI app, grouped by category.')],
    ['🚀','Performance','Ask AI for optimization',()=>setInput('Audit this app concept for performance. List the biggest bottlenecks and highest-impact optimizations.')],
    ['📱','Mobile audit','Ask AI for mobile improvements',()=>setInput('Review this AI app from a mobile-first perspective and list the most important UX improvements.')],
    ['🛡','Security audit','Ask AI for security checks',()=>setInput('Give me a practical security checklist for an AI web app with a Cloudflare Worker backend.')],
    ['☁','Cloud audit','Ask AI for Cloudflare ideas',()=>setInput('Suggest practical Cloudflare improvements for speed, reliability, caching, and security in this app.')],
    ['🔧','Troubleshoot','Ask AI to diagnose',()=>setInput('Help me troubleshoot this app. Ask only the most important question if you need more information, otherwise give me likely fixes.')],
    ['🏆','Best practices','Ask for best practices',()=>setInput('Give me the current best practices for building a fast, modern AI chat app.')],
    ['📦','Export idea','Ask for export options',()=>setInput('Design a simple export system for chats, prompts, settings, and generated content.')],
    ['🌟','Roadmap','Generate product roadmap',()=>setInput('Build a roadmap for turning defgodqe into a polished AI platform, from core UX to advanced features.')],
    ['♻','Undo mode','Reset page state',()=>{try{sessionStorage.clear()}catch(_){}notify('Session UI state cleared')}],
    ['🔄','Reconnect','Retry current connection',()=>{try{location.reload()}catch(_){}}],
    ['📡','Worker test','Test the configured AI endpoint',async()=>{const u='https://defgodqe-ai.defgodqe.workers.dev';try{const r=await fetch(u,{method:'GET',cache:'no-store'});notify('Worker responded: '+r.status)}catch(_){notify('Worker request failed')}}]
  ];

  const btn=document.createElement('button');btn.id='dfFeatureBtn';btn.type='button';btn.innerHTML='<span>⚡</span><span>Features</span>';document.body.appendChild(btn);
  const modal=document.createElement('div');modal.id='dfFeatureModal';modal.innerHTML='<div class="df-fm"><div class="df-fm-head"><span style="font-size:22px">⚡</span><div><b>defgodqe features</b><small> • feature pack</small></div><input id="dfFeatureSearch" placeholder="Search features…" autocomplete="off"><button class="df-fm-close" aria-label="Close">×</button></div><div class="df-fm-grid" id="dfFeatureGrid"></div></div>';document.body.appendChild(modal);
  const grid=modal.querySelector('#dfFeatureGrid'),search=modal.querySelector('#dfFeatureSearch');
  function render(q=''){const x=q.toLowerCase();grid.innerHTML='';features.filter(f=>(f[1]+' '+f[2]).toLowerCase().includes(x)).forEach(f=>{const b=document.createElement('button');b.className='df-fm-card';b.innerHTML='<span class="df-fm-icon">'+f[0]+'</span><span><b>'+f[1]+'</b><small>'+f[2]+'</small></span>';b.onclick=()=>{try{f[3]()}catch(e){console.error(e);notify('Feature failed safely')}};grid.appendChild(b)})}
  function open(){render();modal.classList.add('open');setTimeout(()=>search.focus(),20)}function close(){modal.classList.remove('open')}
  btn.onclick=open;modal.querySelector('.df-fm-close').onclick=close;modal.addEventListener('click',e=>{if(e.target===modal)close()});search.addEventListener('input',e=>render(e.target.value));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))close()});

  const bar=document.createElement('div');bar.id='dfReadingBar';document.body.appendChild(bar);
  const sc=document.getElementById('scroll');if(sc)sc.addEventListener('scroll',()=>{const max=sc.scrollHeight-sc.clientHeight;bar.style.width=(max>0?Math.min(100,sc.scrollTop/max*100):0)+'%'},{passive:true});

  // Persist lightweight visual preferences.
  try{
    const saved=JSON.parse(localStorage.getItem('defgodqe-feature-modes')||'{}');
    for(const k of ['df-focus-mode','df-compact-mode','df-large-text','df-reduced-motion'])if(saved[k])document.body.classList.add(k);
    setInterval(()=>{const o={};for(const k of ['df-focus-mode','df-compact-mode','df-large-text','df-reduced-motion'])o[k]=document.body.classList.contains(k);localStorage.setItem('defgodqe-feature-modes',JSON.stringify(o))},2000);
  }catch(_){}
})();
