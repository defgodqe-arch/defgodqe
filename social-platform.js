/* defgodqe — Social Platform upgrade
 * Frontend-first social layer with graceful local persistence and optional API sync.
 */
(() => {
  const KEY = 'defgodqe-social-platform-v1';
  const USER_KEY = 'defgodqe-social-user';
  const API = (window.DEFGODQE_SOCIAL_API || '').replace(/\/$/, '');
  const state = JSON.parse(localStorage.getItem(KEY) || '{"users":{},"videos":{},"likes":{},"comments":{},"follows":{},"notifications":[],"messages":{},"sounds":{},"events":[],"settings":{}}');
  const me = () => { try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; } };
  const save = () => localStorage.setItem(KEY, JSON.stringify(state));
  const uid = () => crypto.randomUUID?.() || ('id-' + Date.now() + '-' + Math.random().toString(36).slice(2));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const user = () => me() || {id:'guest',username:'guest'};
  const toast = m => window.defgodqeRealism?.toast?.(m) || window.defgodqeMega?.toast?.(m);

  function ensureUser() {
    const u = user();
    if (!state.users[u.id]) state.users[u.id] = {id:u.id,username:u.username || 'guest',bio:'',avatar:'',banner:'',followers:0,following:0,likes:0};
    return state.users[u.id];
  }
  function notify(target, type, text, data={}) {
    if (!target || target === user().id) return;
    state.notifications.unshift({id:uid(),target,type,text,data,read:false,createdAt:Date.now()});
    state.notifications = state.notifications.slice(0,300); save();
  }
  function emit(type,data) { state.events.push({id:uid(),type,data,at:Date.now()}); state.events=state.events.slice(-500); save(); }

  async function api(path, options={}) {
    if (!API) return null;
    try { const r=await fetch(API+path,{headers:{'content-type':'application/json',...(options.headers||{})},...options}); if(!r.ok) return null; return await r.json().catch(()=>({})); } catch { return null; }
  }

  function videoId(v) { return String(v?.id || v?.videoId || v?.dataset?.videoId || ''); }
  function creatorId(v) { return String(v?.creatorId || v?.userId || v?.authorId || v?.dataset?.userId || ''); }
  function title(v) { return v?.title || v?.caption || v?.description || 'Untitled video'; }

  function like(id) {
    const k = user().id + ':' + id; const on = !state.likes[k];
    if(on) state.likes[k]=true; else delete state.likes[k];
    const v=state.videos[id]; if(v) v.likes=Math.max(0,(v.likes||0)+(on?1:-1));
    if(on && v?.creatorId) notify(v.creatorId,'like',`${user().username || 'Someone'} liked your video`,{videoId:id});
    emit(on?'like':'unlike',{videoId:id,userId:user().id}); save(); return on;
  }
  function follow(id) {
    if(!id || id===user().id) return false;
    const k=user().id+':'+id, on=!state.follows[k]; on?state.follows[k]=true:delete state.follows[k];
    state.users[id] ||= {id,username:'creator',followers:0,following:0}; state.users[id].followers=Math.max(0,(state.users[id].followers||0)+(on?1:-1));
    ensureUser().following=Math.max(0,(ensureUser().following||0)+(on?1:-1));
    if(on) notify(id,'follow',`${user().username || 'Someone'} followed you`);
    emit(on?'follow':'unfollow',{target:id,userId:user().id}); save(); return on;
  }
  function addComment(videoId,text,parentId=null) {
    text=String(text||'').trim().slice(0,1000); if(!text) return null;
    const c={id:uid(),videoId,userId:user().id,username:user().username||'guest',text,parentId,createdAt:Date.now(),likes:0};
    (state.comments[videoId] ||= []).push(c); const v=state.videos[videoId]; if(v?.creatorId) notify(v.creatorId,'comment',`${c.username} commented on your video`,{videoId,commentId:c.id});
    if(parentId){const p=(state.comments[videoId]||[]).find(x=>x.id===parentId);if(p)notify(p.userId,'mention',`${c.username} replied to your comment`,{videoId,commentId:c.id});}
    emit('comment',c);save();return c;
  }

  function soundPage(soundId) {
    const list=Object.values(state.videos).filter(v=>v.soundId===soundId); return {sound:state.sounds[soundId],videos:list};
  }
  function trackWatch(id,seconds=0,completed=false) {
    state.events.push({id:uid(),type:completed?'complete':'watch',data:{videoId:id,userId:user().id,seconds},at:Date.now()}); state.events=state.events.slice(-1000); save();
  }
  function feed(mode='for-you') {
    let vs=Object.values(state.videos);
    if(mode==='following') vs=vs.filter(v=>v.creatorId && state.follows[user().id+':'+v.creatorId]);
    if(mode==='trending') vs.sort((a,b)=>((b.likes||0)*4+(b.views||0)*.5)-((a.likes||0)*4+(a.views||0)*.5));
    else vs.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
    return vs;
  }

  function injectStyles(){ if(document.getElementById('dfSocialStyles'))return; const s=document.createElement('style');s.id='dfSocialStyles';s.textContent=`
#dfSocialHub{position:fixed;inset:0;z-index:99999;background:rgba(5,7,15,.96);backdrop-filter:blur(18px);display:none;color:#fff;font-family:system-ui,sans-serif}#dfSocialHub.open{display:block}.dfsh{max-width:1180px;height:100%;margin:auto;padding:22px;overflow:auto}.dfsh-top{display:flex;gap:10px;align-items:center;position:sticky;top:0;background:rgba(5,7,15,.9);padding-bottom:14px;z-index:2}.dfsh-top button,.dfsh-card button{border:1px solid #ffffff20;background:#ffffff10;color:#fff;border-radius:12px;padding:9px 12px;cursor:pointer}.dfsh-top button.active{background:#fff;color:#000}.dfsh-close{margin-left:auto}.dfsh-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}.dfsh-card{background:#ffffff0d;border:1px solid #ffffff12;border-radius:18px;padding:14px}.dfsh-card img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:12px;background:#111}.dfsh-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.dfsh-muted{opacity:.65;font-size:13px}.dfsh-input{width:100%;box-sizing:border-box;padding:12px;border-radius:12px;border:1px solid #ffffff18;background:#0006;color:#fff;margin:7px 0}.dfsh-comments{max-height:240px;overflow:auto}.dfsh-comment{padding:9px 0;border-bottom:1px solid #ffffff10}.dfsh-profile{display:flex;gap:18px;align-items:center;padding:18px 0}.dfsh-avatar{width:76px;height:76px;border-radius:50%;object-fit:cover;background:#222}.dfsh-pill{display:inline-block;padding:4px 8px;border-radius:999px;background:#ffffff10;margin:2px;font-size:12px}.dfsh-notif{padding:12px;border-bottom:1px solid #ffffff10}.dfsh-unread{background:#ffffff0d}@media(max-width:600px){.dfsh{padding:12px}.dfsh-top{overflow:auto}.dfsh-grid{grid-template-columns:1fr 1fr}}
`;document.head.appendChild(s); }

  function renderHub(){
    injectStyles(); let hub=document.getElementById('dfSocialHub'); if(!hub){hub=document.createElement('div');hub.id='dfSocialHub';document.body.appendChild(hub);}
    hub.classList.add('open');
    hub.innerHTML=`<div class="dfsh"><div class="dfsh-top"><b>defgodqe social</b><button data-tab="feed" class="active">For You</button><button data-tab="following">Following</button><button data-tab="trending">Trending</button><button data-tab="explore">Explore</button><button data-tab="profile">Profile</button><button data-tab="messages">Messages</button><button data-tab="notifications">🔔 ${state.notifications.filter(n=>n.target===user().id&&!n.read).length||''}</button><button data-tab="creator">Creator</button><button class="dfsh-close">✕</button></div><main id="dfshMain"></main></div>`;
    hub.querySelector('.dfsh-close').onclick=()=>hub.classList.remove('open'); hub.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>renderTab(b.dataset.tab)); renderTab('feed');
  }
  function renderTab(tab){ const m=document.getElementById('dfshMain'); if(!m)return; document.querySelectorAll('#dfSocialHub [data-tab]').forEach(x=>x.classList.toggle('active',x.dataset.tab===tab));
    if(tab==='feed'||tab==='following'||tab==='trending'){const vs=feed(tab);m.innerHTML=`<h2>${tab==='feed'?'For You':tab[0].toUpperCase()+tab.slice(1)}</h2><div class="dfsh-grid">${vs.map(v=>card(v)).join('')||'<p class="dfsh-muted">Publish videos to start building your feed.</p>'}</div>`;wireCards(m);}
    else if(tab==='profile'){profileView(m,user().id);}
    else if(tab==='notifications'){const ns=state.notifications.filter(n=>n.target===user().id);m.innerHTML='<h2>Notifications</h2>'+ (ns.map(n=>`<div class="dfsh-notif ${n.read?'':'dfsh-unread'}"><b>${esc(n.type)}</b> ${esc(n.text)}<div class="dfsh-muted">${new Date(n.createdAt).toLocaleString()}</div></div>`).join('')||'<p>No notifications yet.</p>');ns.forEach(n=>n.read=true);save();}
    else if(tab==='messages'){messagesView(m);}
    else if(tab==='explore'){exploreView(m);}
    else if(tab==='creator'){creatorView(m);}
  }
  function card(v){const liked=!!state.likes[user().id+':'+v.id], following=!!state.follows[user().id+':'+v.creatorId];return `<article class="dfsh-card" data-video="${esc(v.id)}"><img src="${esc(v.thumbnail||v.poster||'')}" onerror="this.style.display='none'"><h3>${esc(title(v))}</h3><div class="dfsh-muted">@${esc(v.username||state.users[v.creatorId]?.username||'creator')} · ${v.views||0} views</div><div class="dfsh-row"><button data-like>${liked?'♥':'♡'} ${v.likes||0}</button><button data-follow>${following?'Following':'Follow'}</button><button data-comment>💬 ${(state.comments[v.id]||[]).length}</button><button data-share>↗ Share</button></div><div class="dfsh-comments" data-comments></div></article>`;}
  function wireCards(root){root.querySelectorAll('[data-video]').forEach(c=>{const id=c.dataset.video,v=state.videos[id];c.querySelector('[data-like]').onclick=()=>{like(id);renderTab('feed')};c.querySelector('[data-follow]').onclick=()=>{follow(v.creatorId);renderTab('feed')};c.querySelector('[data-share]').onclick=()=>navigator.clipboard?.writeText(location.href+'#video='+encodeURIComponent(id));const box=c.querySelector('[data-comments]');const cs=state.comments[id]||[];box.innerHTML=cs.slice(-10).map(x=>`<div class="dfsh-comment"><b>@${esc(x.username)}</b> ${esc(x.text)} <button data-reply="${x.id}">Reply</button></div>`).join('')+`<input class="dfsh-input" placeholder="Add a comment…" data-newcomment>`;c.querySelector('[data-newcomment]').onkeydown=e=>{if(e.key==='Enter'){addComment(id,e.target.value);renderTab('feed')}};box.querySelectorAll('[data-reply]').forEach(b=>b.onclick=()=>{const t=prompt('Reply');if(t){addComment(id,t,b.dataset.reply);renderTab('feed')}});});}

  function profileView(m,id){const u=state.users[id]||{id,username:user().username||'guest',bio:''};const vs=Object.values(state.videos).filter(v=>v.creatorId===id);m.innerHTML=`<div class="dfsh-profile"><img class="dfsh-avatar" src="${esc(u.avatar||'')}" onerror="this.style.display='none'"><div><h2>@${esc(u.username)}</h2><p>${esc(u.bio||'No bio yet.')}</p><span class="dfsh-pill">${u.followers||0} followers</span><span class="dfsh-pill">${u.following||0} following</span><span class="dfsh-pill">${u.likes||0} likes</span></div></div><button id="editProfile">Edit profile</button><h3>Videos</h3><div class="dfsh-grid">${vs.map(card).join('')||'<p class="dfsh-muted">No published videos yet.</p>'}</div>`;m.querySelector('#editProfile').onclick=()=>{const bio=prompt('Bio',u.bio||'');if(bio!==null){u.bio=bio.slice(0,160);save();profileView(m,id)}};wireCards(m);}

  function messagesView(m){const threads=Object.keys(state.messages).filter(k=>k.startsWith(user().id+':'));m.innerHTML=`<h2>Messages</h2><input id="dfMsgUser" class="dfsh-input" placeholder="Username to message"><input id="dfMsgText" class="dfsh-input" placeholder="Write a message…"><button id="dfSendMsg">Send</button><div>${threads.map(k=>{const arr=state.messages[k]||[],x=arr[arr.length-1];return `<div class="dfsh-card"><b>@${esc(x?.otherUsername||k.split(':')[1])}</b><p>${esc(x?.text||'')}</p></div>`}).join('')}</div>`;m.querySelector('#dfSendMsg').onclick=()=>{const name=m.querySelector('#dfMsgUser').value.trim(),text=m.querySelector('#dfMsgText').value.trim();if(!name||!text)return;const target=Object.values(state.users).find(x=>x.username?.toLowerCase()===name.toLowerCase());if(!target){toast?.('User not found');return;}const k=user().id+':'+target.id;(state.messages[k] ||= []).push({id:uid(),from:user().id,to:target.id,otherUsername:target.username,text,read:false,createdAt:Date.now()});notify(target.id,'message',`${user().username} sent you a message`);emit('message',{to:target.id});save();messagesView(m);};}

  function exploreView(m){m.innerHTML='<h2>Explore</h2><input id="dfExplore" class="dfsh-input" placeholder="Search users, videos, hashtags, sounds"><div id="dfResults"></div>';const input=m.querySelector('#dfExplore'),out=m.querySelector('#dfResults');const go=()=>{const q=input.value.toLowerCase().trim();const users=Object.values(state.users).filter(u=>(u.username||'').toLowerCase().includes(q));const vs=Object.values(state.videos).filter(v=>(title(v)+' '+(v.hashtags||[]).join(' ')+(v.soundName||'')).toLowerCase().includes(q));out.innerHTML=`<h3>Creators</h3><div class="dfsh-grid">${users.map(u=>`<div class="dfsh-card"><b>@${esc(u.username)}</b><button data-u="${u.id}">View</button></div>`).join('')}</div><h3>Videos</h3><div class="dfsh-grid">${vs.map(card).join('')}</div>`;out.querySelectorAll('[data-u]').forEach(b=>b.onclick=()=>profileView(out,b.dataset.u));wireCards(out)};input.oninput=go;go();}

  function creatorView(m){const own=Object.values(state.videos).filter(v=>v.creatorId===user().id);const views=own.reduce((n,v)=>n+(v.views||0),0),likes=own.reduce((n,v)=>n+(v.likes||0),0),watch=state.events.filter(e=>e.type==='watch'&&own.some(v=>v.id===e.data.videoId)).reduce((n,e)=>n+(e.data.seconds||0),0);m.innerHTML=`<h2>Creator dashboard</h2><div class="dfsh-grid"><div class="dfsh-card"><h3>${own.length}</h3><span>Videos</span></div><div class="dfsh-card"><h3>${views}</h3><span>Views</span></div><div class="dfsh-card"><h3>${likes}</h3><span>Likes</span></div><div class="dfsh-card"><h3>${Math.round(watch)}s</h3><span>Watch time</span></div></div><p class="dfsh-muted">AI creator tools are exposed through the creator workflow when the AI service is available.</p>`;}

  // Register published videos when the existing uploader/feed creates them.
  function registerVideo(v){if(!v)return;const id=videoId(v)||uid();const u=user();state.videos[id]={...state.videos[id],...v,id,creatorId:v.creatorId||u.id,username:v.username||u.username||'guest',createdAt:v.createdAt||Date.now(),likes:v.likes||0,views:v.views||0,hashtags:v.hashtags||[]};ensureUser();save();return id;}
  function hookVideos(){document.querySelectorAll('video').forEach(v=>{if(v.dataset.dfSocialHook)return;v.dataset.dfSocialHook='1';v.addEventListener('play',()=>{const id=v.closest('[data-video-id]')?.dataset.videoId||v.dataset.videoId;if(id)trackWatch(id,0,false)});v.addEventListener('timeupdate',()=>{const id=v.closest('[data-video-id]')?.dataset.videoId||v.dataset.videoId;if(id && Math.floor(v.currentTime)%10===0)trackWatch(id,10,v.ended)});});}
  document.addEventListener('dblclick',e=>{const v=e.target.closest?.('[data-video-id],[data-video]');if(v){const id=v.dataset.videoId||v.dataset.video;if(id){like(id);toast?.('Liked ❤️');}}});
  document.addEventListener('click',e=>{const sound=e.target.closest?.('[data-sound-id]');if(sound){const id=sound.dataset.soundId;const r=soundPage(id);toast?.(`${r.videos.length} videos use this sound`);}});
  new MutationObserver(hookVideos).observe(document.documentElement,{childList:true,subtree:true});hookVideos();ensureUser();save();

  window.defgodqeSocial={open:renderHub,like,follow,comment:addComment,feed,trackWatch,registerVideo,soundPage,notify,events:()=>state.events,notifications:()=>state.notifications.filter(n=>n.target===user().id),profile:id=>profileView(document.getElementById('dfshMain'),id)};
  // Add a discoverable entry point without replacing existing navigation.
  window.addEventListener('defgodqe-auth-changed',()=>{ensureUser();save();});
  setTimeout(()=>{const b=document.querySelector('[data-social-hub],#socialBtn,#messagesBtn');if(b&&!b.dataset.dfSocialBound){b.dataset.dfSocialBound='1';b.addEventListener('click',renderHub);}},500);
})();
