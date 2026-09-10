/* defgodqe — modern AI experience layer
   Keeps the existing AI core intact and adds a polished, ChatGPT-style interface. */
(() => {
  const init = () => {
    if (document.documentElement.dataset.dfEnhanced === '2') return;
    document.documentElement.dataset.dfEnhanced = '2';

    const style = document.createElement('style');
    style.textContent = `
      :root{--df-yellow:#facc15;--df-gold:#eab308;--df-bg:#080b11;--df-card:#101722;--df-border:rgba(255,255,255,.09)}
      body{background:radial-gradient(900px 500px at 50% -10%,rgba(250,204,21,.055),transparent 65%),var(--df-bg)!important}
      header{background:rgba(7,10,16,.76)!important;backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);box-shadow:0 1px 0 rgba(255,255,255,.035)}
      header:after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:1px;background:linear-gradient(90deg,transparent,rgba(250,204,21,.24),transparent);pointer-events:none}
      .sidebar{background:linear-gradient(180deg,#0c1119,#090d14)!important;box-shadow:8px 0 40px rgba(0,0,0,.12)}
      #chatList:empty:after{content:"Your conversations will appear here";display:block;padding:18px 12px;color:#475569;font-size:12px;line-height:1.5;text-align:center}
      #composer{border:1px solid var(--df-border)!important;background:linear-gradient(145deg,rgba(20,27,39,.94),rgba(8,12,19,.96))!important;box-shadow:0 18px 55px rgba(0,0,0,.28),0 0 0 1px rgba(250,204,21,.025) inset!important;backdrop-filter:blur(20px);transition:.2s ease}
      #composer:focus-within{border-color:rgba(250,204,21,.3)!important;box-shadow:0 20px 65px rgba(0,0,0,.36),0 0 30px rgba(250,204,21,.06)!important;transform:translateY(-1px)}
      #input{caret-color:var(--df-yellow)}
      #input::placeholder{color:#64748b;transition:.2s}.df-input-focus #input::placeholder{opacity:.35}
      .orb{box-shadow:0 0 30px rgba(250,204,21,.36),0 0 90px rgba(250,204,21,.13),inset -8px -8px 22px rgba(202,138,4,.5),inset 8px 8px 18px rgba(255,251,230,.5)!important}
      .orb:before{content:"";position:absolute;inset:-18px;border:1px solid rgba(250,204,21,.16);border-radius:50%;animation:dfPulse 2.5s ease-in-out infinite;pointer-events:none}
      @keyframes dfPulse{0%,100%{transform:scale(.94);opacity:.35}50%{transform:scale(1.06);opacity:.8}}
      #sendBtn{box-shadow:0 0 0 rgba(250,204,21,0);transition:transform .16s,box-shadow .2s,filter .2s!important}
      #sendBtn:hover{transform:translateY(-1px) scale(1.03);box-shadow:0 0 26px rgba(250,204,21,.24);filter:brightness(1.06)}
      #sendBtn:active{transform:scale(.95)}
      button{user-select:none;-webkit-user-select:none}
      .df-top-action{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border:1px solid transparent;border-radius:10px;color:#94a3b8;transition:.18s}
      .df-top-action:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.08);color:#fff}
      .df-online{display:inline-flex;align-items:center;gap:6px;margin-left:8px;padding:4px 8px;border:1px solid rgba(250,204,21,.14);border-radius:999px;background:rgba(250,204,21,.055);color:#aab4c3;font:600 10px/1 system-ui,sans-serif;letter-spacing:.04em}
      .df-online i{width:6px;height:6px;border-radius:50%;background:var(--df-yellow);box-shadow:0 0 9px var(--df-yellow)}
      .df-menu{position:fixed;z-index:100001;min-width:220px;padding:6px;border:1px solid rgba(255,255,255,.1);border-radius:14px;background:rgba(14,19,28,.96);box-shadow:0 20px 60px rgba(0,0,0,.45);backdrop-filter:blur(22px);animation:dfMenu .16s ease}
      @keyframes dfMenu{from{opacity:0;transform:translateY(-5px) scale(.98)}to{opacity:1;transform:none}}
      .df-menu button{display:flex;width:100%;align-items:center;gap:10px;padding:9px 10px;border-radius:9px;color:#cbd5e1;font-size:12px;text-align:left}.df-menu button:hover{background:rgba(255,255,255,.07);color:#fff}.df-menu svg{width:15px;height:15px;color:#94a3b8}.df-menu .danger{color:#fca5a5}.df-menu .danger svg{color:#f87171}.df-divider{height:1px;background:rgba(255,255,255,.07);margin:5px 4px}
      .df-modal-backdrop{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.58);backdrop-filter:blur(8px);animation:dfFade .18s ease}.df-modal{width:min(520px,100%);max-height:min(700px,90vh);overflow:auto;border:1px solid rgba(255,255,255,.1);border-radius:20px;background:linear-gradient(145deg,#111824,#0b1018);box-shadow:0 30px 100px rgba(0,0,0,.55);animation:dfModal .2s cubic-bezier(.16,1,.3,1)}
      @keyframes dfFade{from{opacity:0}to{opacity:1}}@keyframes dfModal{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:none}}
      .df-modal-head{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.07)}.df-modal-title{font-size:15px;font-weight:700;color:#fff}.df-modal-sub{font-size:11px;color:#64748b;margin-top:3px}.df-modal-body{padding:18px 20px}.df-setting{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:13px 0;border-bottom:1px solid rgba(255,255,255,.055)}.df-setting:last-child{border-bottom:0}.df-setting-title{font-size:13px;color:#e2e8f0}.df-setting-desc{font-size:11px;color:#64748b;margin-top:3px}.df-switch{width:40px;height:22px;border-radius:999px;background:#263244;padding:3px;transition:.2s}.df-switch span{display:block;width:16px;height:16px;border-radius:50%;background:#94a3b8;transition:.2s}.df-switch.on{background:var(--df-yellow)}.df-switch.on span{transform:translateX(18px);background:#111827}
      .df-toast{position:fixed;left:50%;bottom:24px;z-index:100002;transform:translate(-50%,12px);opacity:0;pointer-events:none;padding:10px 14px;border:1px solid rgba(250,204,21,.2);border-radius:12px;background:rgba(10,14,22,.94);color:#e5e7eb;box-shadow:0 15px 45px rgba(0,0,0,.4),0 0 25px rgba(250,204,21,.08);backdrop-filter:blur(16px);font:600 12px/1.2 system-ui,sans-serif;transition:.2s}.df-toast.show{opacity:1;transform:translate(-50%,0)}
      .df-shortcut{margin-left:auto;color:#475569;font-size:10px}.df-search-input{width:100%;padding:11px 12px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:#0a0f17;color:#e2e8f0;outline:none}.df-search-input:focus{border-color:rgba(250,204,21,.35)}
      @media(max-width:640px){.df-online{display:none}.df-toast{bottom:14px;max-width:calc(100vw - 28px);text-align:center}.df-modal{border-radius:18px}.df-top-action{width:32px;height:32px}}
      @media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;scroll-behavior:auto!important}}
    `;
    document.head.appendChild(style);

    const toast = text => {
      let el=document.querySelector('.df-toast');
      if(!el){el=document.createElement('div');el.className='df-toast';document.body.appendChild(el)}
      el.textContent=text;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),1800);
    };

    const icon = name => `<i data-lucide="${name}"></i>`;
    const refreshIcons = () => { try{window.lucide?.createIcons?.()}catch(_){} };

    const closeMenus = () => document.querySelectorAll('.df-menu').forEach(x=>x.remove());
    document.addEventListener('click', e => { if(!e.target.closest('.df-menu')&&!e.target.closest('.df-top-action')) closeMenus(); });

    const openMenu = (button, items) => {
      closeMenus();
      const menu=document.createElement('div');menu.className='df-menu';
      menu.innerHTML=items.map(x=>x==='divider'?'<div class="df-divider"></div>':`<button type="button" class="${x.danger?'danger':''}" data-action="${x.id}">${icon(x.icon)}<span>${x.label}</span>${x.shortcut?`<span class="df-shortcut">${x.shortcut}</span>`:''}</button>`).join('');
      document.body.appendChild(menu);
      const r=button.getBoundingClientRect();
      menu.style.top=Math.min(window.innerHeight-menu.offsetHeight-10,r.bottom+7)+'px';
      menu.style.left=Math.max(10,Math.min(window.innerWidth-menu.offsetWidth-10,r.right-menu.offsetWidth))+'px';
      menu.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;handleAction(b.dataset.action);closeMenus()});
      refreshIcons();
    };

    const handleAction = action => {
      if(action==='new'){document.querySelector('#newChatBtn')?.click();return}
      if(action==='search'){openSearch();return}
      if(action==='settings'){openSettings();return}
      if(action==='focus'){document.querySelector('#input')?.focus();return}
      if(action==='export'){exportChat();return}
      if(action==='clear'){if(confirm('Clear this conversation?')){document.querySelector('#newChatBtn')?.click();toast('New conversation started')}}
    };

    const addHeaderTools = () => {
      const right=document.querySelector('header .ml-auto');
      if(!right || document.querySelector('#dfTools')) return;
      const wrap=document.createElement('div');wrap.id='dfTools';wrap.className='flex items-center gap-0.5 mr-1';
      const search=document.createElement('button');search.className='df-top-action';search.id='dfSearch';search.title='Search chats';search.innerHTML=icon('search');search.onclick=()=>openSearch();
      const more=document.createElement('button');more.className='df-top-action';more.id='dfMore';more.title='More';more.innerHTML=icon('ellipsis');more.onclick=()=>openMenu(more,[{id:'new',icon:'plus',label:'New chat',shortcut:'Ctrl+Shift+O'},{id:'search',icon:'search',label:'Search chats',shortcut:'Ctrl+Shift+F'},{id:'export',icon:'download',label:'Export conversation'},{id:'divider'},{id:'settings',icon:'settings',label:'Settings'},{id:'clear',icon:'trash-2',label:'Clear conversation',danger:true}]);
      wrap.append(search,more);right.prepend(wrap);refreshIcons();
    };

    const openSearch = () => {
      closeMenus();
      if(document.querySelector('#dfSearchModal')) return;
      const back=document.createElement('div');back.id='dfSearchModal';back.className='df-modal-backdrop';
      back.innerHTML=`<div class="df-modal" role="dialog" aria-modal="true"><div class="df-modal-head"><div><div class="df-modal-title">Search chats</div><div class="df-modal-sub">Find a conversation quickly</div></div><button class="df-top-action" data-close>${icon('x')}</button></div><div class="df-modal-body"><input class="df-search-input" id="dfChatSearch" placeholder="Search conversation titles…" autofocus><div id="dfSearchResults" class="mt-3 space-y-1"></div></div></div>`;
      document.body.appendChild(back);refreshIcons();
      const input=back.querySelector('#dfChatSearch');input.addEventListener('input',()=>renderSearch(input.value));
      back.addEventListener('click',e=>{if(e.target===back||e.target.closest('[data-close]'))back.remove()});renderSearch('');
    };

    const renderSearch = query => {
      const out=document.querySelector('#dfSearchResults');if(!out)return;
      const q=query.trim().toLowerCase();
      const items=[...document.querySelectorAll('#chatList button,#chatList [role="button"]')].filter(x=>!q||x.textContent.toLowerCase().includes(q));
      if(!items.length){out.innerHTML='<div class="px-2 py-6 text-center text-xs text-slate-500">No matching chats</div>';return}
      out.innerHTML=items.slice(0,20).map((x,i)=>`<button type="button" class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-300 hover:bg-white/5" data-index="${i}">${icon('message-square')}<span class="truncate">${x.textContent.trim()||'Conversation'}</span></button>`).join('');refreshIcons();
      out.querySelectorAll('[data-index]').forEach((b,i)=>b.onclick=()=>{items[i].click();document.querySelector('#dfSearchModal')?.remove()});
    };

    const openSettings = () => {
      closeMenus();if(document.querySelector('#dfSettings'))return;
      const back=document.createElement('div');back.id='dfSettings';back.className='df-modal-backdrop';
      back.innerHTML=`<div class="df-modal" role="dialog" aria-modal="true"><div class="df-modal-head"><div><div class="df-modal-title">defgodqe settings</div><div class="df-modal-sub">Customize your AI workspace</div></div><button class="df-top-action" data-close>${icon('x')}</button></div><div class="df-modal-body"><div class="df-setting"><div><div class="df-setting-title">Smooth animations</div><div class="df-setting-desc">Use subtle motion throughout the interface.</div></div><button class="df-switch on" data-setting="motion"><span></span></button></div><div class="df-setting"><div><div class="df-setting-title">Compact interface</div><div class="df-setting-desc">Reduce spacing to fit more messages on screen.</div></div><button class="df-switch" data-setting="compact"><span></span></button></div><div class="df-setting"><div><div class="df-setting-title">Enter to send</div><div class="df-setting-desc">Press Enter to send; Shift+Enter creates a new line.</div></div><button class="df-switch on" data-setting="enter"><span></span></button></div></div></div>`;
      document.body.appendChild(back);refreshIcons();
      back.addEventListener('click',e=>{if(e.target===back||e.target.closest('[data-close]'))back.remove()});
      back.querySelectorAll('.df-switch').forEach(s=>s.onclick=()=>{s.classList.toggle('on');const key=s.dataset.setting;localStorage.setItem('df-'+key,s.classList.contains('on')?'1':'0');applySettings()});
    };

    const applySettings = () => {
      const motion=localStorage.getItem('df-motion')!=='0';const compact=localStorage.getItem('df-compact')==='1';
      document.documentElement.classList.toggle('df-compact',compact);
      if(!motion)document.documentElement.style.setProperty('--df-motion','0s');else document.documentElement.style.removeProperty('--df-motion');
      const s=document.querySelector('#dfSettings');if(s){s.querySelector('[data-setting="motion"]')?.classList.toggle('on',motion);s.querySelector('[data-setting="compact"]')?.classList.toggle('on',compact);s.querySelector('[data-setting="enter"]')?.classList.toggle('on',localStorage.getItem('df-enter')!=='0')}
    };

    const exportChat = () => {
      const messages=document.querySelector('#messages');
      if(!messages || !messages.textContent.trim()){toast('Nothing to export yet');return}
      const text=messages.innerText.trim();const blob=new Blob([`defgodqe conversation\n\n${text}`],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`defgodqe-chat-${new Date().toISOString().slice(0,10)}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Conversation exported');
    };

    const addOnline=()=>{const label=document.querySelector('#modelLabel');if(!label||label.parentElement.querySelector('.df-online'))return;const b=document.createElement('span');b.className='df-online';b.innerHTML='<i></i> ONLINE';label.parentElement.appendChild(b)};
    const bind=()=>{addHeaderTools();addOnline();applySettings();const input=document.querySelector('#input');if(input&&!input.dataset.dfKeys){input.dataset.dfKeys='1';input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&localStorage.getItem('df-enter')!=='0'){e.preventDefault();document.querySelector('#sendBtn')?.click()}});input.addEventListener('focus',()=>document.body.classList.add('df-input-focus'));input.addEventListener('blur',()=>document.body.classList.remove('df-input-focus'))}};

    document.addEventListener('keydown',e=>{
      const mod=e.ctrlKey||e.metaKey;
      if(mod&&e.shiftKey&&e.key.toLowerCase()==='o'){e.preventDefault();handleAction('new')}
      if(mod&&e.shiftKey&&e.key.toLowerCase()==='f'){e.preventDefault();handleAction('search')}
      if(e.key==='Escape'){closeMenus();document.querySelector('#dfSearchModal')?.remove();document.querySelector('#dfSettings')?.remove();document.querySelector('#modelMenu')?.classList.add('hidden');document.querySelector('#modeMenu')?.classList.add('hidden')}
    });
    window.addEventListener('online',()=>toast('Connection restored'));window.addEventListener('offline',()=>toast('You are offline'));
    bind();new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
