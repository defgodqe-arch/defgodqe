/* defgodqe — Advanced Direct Messages
 * Local-first messaging UI. Ready to sync to the social API when backend endpoints exist.
 */
(() => {
  'use strict';
  const KEY = 'defgodqe-dm-v2';
  const USER_KEY = 'defgodqe-social-user';
  const getMe = () => { try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; } };
  const me = () => getMe() || { id: 'guest', username: 'guest' };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uid = () => crypto.randomUUID?.() || `dm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{"threads":{},"typing":{}}'); } catch { return {threads:{},typing:{}}; } };
  const state = load();
  const save = () => localStorage.setItem(KEY, JSON.stringify(state));
  const social = () => { try { return JSON.parse(localStorage.getItem('defgodqe-social-platform-v1') || '{}'); } catch { return {}; } };
  const toast = m => window.defgodqeRealism?.toast?.(m) || window.defgodqeMega?.toast?.(m);

  function userByName(name) {
    const s = social(); const list = Object.values(s.users || {});
    return list.find(u => String(u.username || '').toLowerCase() === String(name).trim().replace(/^@/,'').toLowerCase());
  }
  function key(a,b) { return [String(a),String(b)].sort().join(':'); }
  function ensureThread(other) {
    const k = key(me().id, other.id); state.threads[k] ||= {id:k,type:'dm',members:[me().id,other.id],names:{[me().id]:me().username||'guest',[other.id]:other.username||'user'},messages:[],updatedAt:Date.now()}; return state.threads[k];
  }
  function groupKey() { return `group:${uid()}`; }
  function unread(t) { return (t.messages || []).filter(x => x.to === me().id && !x.read).length; }
  function allThreads() { return Object.values(state.threads).filter(t => (t.members || []).includes(me().id)).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0)); }
  function send(thread, payload) {
    const msg = {id:uid(),from:me().id,fromName:me().username||'guest',createdAt:Date.now(),read:false,...payload};
    thread.messages.push(msg); thread.updatedAt=msg.createdAt; save();
    window.dispatchEvent(new CustomEvent('defgodqe-dm-message',{detail:msg}));
    return msg;
  }

  function styles(){
    if(document.getElementById('dfDMStyles')) return;
    const s=document.createElement('style'); s.id='dfDMStyles'; s.textContent=`
#dfDM{position:fixed;inset:0;z-index:100001;display:none;background:rgba(3,5,12,.97);color:#fff;font-family:system-ui,sans-serif;backdrop-filter:blur(22px)}#dfDM.open{display:block}.dfdm-shell{height:100%;max-width:1180px;margin:auto;display:grid;grid-template-columns:310px 1fr;overflow:hidden;border:1px solid #ffffff12;background:#080b14}.dfdm-side{border-right:1px solid #ffffff12;overflow:auto}.dfdm-head,.dfdm-chathead{padding:16px;border-bottom:1px solid #ffffff12;display:flex;gap:10px;align-items:center}.dfdm-head b{font-size:19px}.dfdm-close{margin-left:auto}.dfdm-btn{border:1px solid #ffffff18;background:#ffffff0d;color:#fff;border-radius:12px;padding:9px 12px;cursor:pointer}.dfdm-list{padding:8px}.dfdm-thread{width:100%;text-align:left;border:0;background:transparent;color:#fff;padding:13px;border-radius:14px;cursor:pointer}.dfdm-thread:hover,.dfdm-thread.active{background:#ffffff0c}.dfdm-name{font-weight:700}.dfdm-preview{font-size:12px;opacity:.55;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dfdm-unread{display:inline-flex;min-width:20px;height:20px;align-items:center;justify-content:center;border-radius:999px;background:#fff;color:#000;font-size:11px;float:right}.dfdm-main{display:flex;flex-direction:column;min-width:0}.dfdm-chat{flex:1;overflow:auto;padding:20px}.dfdm-empty{opacity:.6;text-align:center;margin:auto}.dfdm-msg{max-width:min(72%,560px);margin:8px 0;padding:10px 13px;border-radius:17px;background:#ffffff0b;border:1px solid #ffffff0d}.dfdm-msg.mine{margin-left:auto;background:#ffffff16}.dfdm-meta{font-size:11px;opacity:.5;margin-top:4px}.dfdm-video{margin-top:7px;border-radius:12px;overflow:hidden;border:1px solid #ffffff12}.dfdm-video video{display:block;width:100%;max-height:300px;object-fit:cover}.dfdm-compose{display:flex;gap:8px;padding:12px;border-top:1px solid #ffffff12}.dfdm-compose input{flex:1;min-width:0;border:1px solid #ffffff16;background:#0008;color:#fff;border-radius:14px;padding:12px}.dfdm-typing{min-height:20px;padding:0 20px 5px;font-size:12px;opacity:.6}.dfdm-new{padding:12px;border-bottom:1px solid #ffffff12}.dfdm-new input{width:100%;box-sizing:border-box;border:1px solid #ffffff16;background:#0008;color:#fff;border-radius:12px;padding:10px}.dfdm-groupbar{padding:10px 16px;border-bottom:1px solid #ffffff12;font-size:12px;opacity:.65}.dfdm-file{display:none}@media(max-width:700px){.dfdm-shell{grid-template-columns:1fr}.dfdm-side{display:none}.dfdm-shell.mobile-list .dfdm-main{display:none}.dfdm-msg{max-width:86%}}
`;
    document.head.appendChild(s);
  }

  function open(){ styles(); let root=document.getElementById('dfDM'); if(!root){root=document.createElement('div');root.id='dfDM';document.body.appendChild(root);} root.classList.add('open'); render(); }
  function close(){ document.getElementById('dfDM')?.classList.remove('open'); }

  let active=null;
  function render(){
    const root=document.getElementById('dfDM'); if(!root)return;
    const threads=allThreads(); active=active && state.threads[active] ? active : (threads[0]?.id || null);
    root.innerHTML=`<div class="dfdm-shell"><aside class="dfdm-side"><div class="dfdm-head"><b>Messages</b><button class="dfdm-btn" id="dmGroup">＋ Group</button><button class="dfdm-btn dfdm-close">✕</button></div><div class="dfdm-new"><input id="dmNewUser" placeholder="Message @username…"></div><div class="dfdm-list">${threads.map(t=>threadRow(t)).join('') || '<div style="padding:16px;opacity:.55">No conversations yet.</div>'}</div></aside><section class="dfdm-main">${active ? chatView(state.threads[active]) : '<div class="dfdm-empty">Start a conversation from the left.</div>'}</section></div>`;
    root.querySelector('.dfdm-close').onclick=close;
    root.querySelector('#dmGroup').onclick=()=>createGroup();
    root.querySelector('#dmNewUser').onkeydown=e=>{if(e.key==='Enter')startDM(e.target.value)};
    root.querySelectorAll('[data-thread]').forEach(b=>b.onclick=()=>{active=b.dataset.thread;markRead(state.threads[active]);render();});
    if(active) wireChat(state.threads[active]);
  }
  function threadRow(t){ const other=(t.members||[]).filter(x=>x!==me().id)[0]; const name=t.type==='group'?(t.title||'Group chat'):(t.names?.[other]||'User'); const last=t.messages?.[t.messages.length-1]; return `<button class="dfdm-thread ${active===t.id?'active':''}" data-thread="${esc(t.id)}"><span class="dfdm-name">${esc(name)}</span>${unread(t)?`<span class="dfdm-unread">${unread(t)}</span>`:''}<div class="dfdm-preview">${esc(last?.type==='video'?'🎬 Video':last?.text||'New conversation')}</div></button>`; }

  function chatView(t){
    const title=t.type==='group'?(t.title||'Group chat'):(t.names?.[(t.members||[]).find(x=>x!==me().id)]||'Conversation');
    return `<div class="dfdm-chathead"><button class="dfdm-btn" id="dmBack">←</button><div><b>${esc(title)}</b><div class="dfdm-preview">${t.type==='group' ? `${t.members.length} members` : '1-on-1 message'}</div></div></div>${t.type==='group'?`<div class="dfdm-groupbar">Group chat · ${t.members.length} members</div>`:''}<div class="dfdm-chat" id="dmChat">${(t.messages||[]).map(messageHTML).join('')||'<div class="dfdm-empty">Say hello 👋</div>'}</div><div class="dfdm-typing" id="dmTyping"></div><div class="dfdm-compose"><label class="dfdm-btn" title="Send a video">🎬<input class="dfdm-file" id="dmVideo" type="file" accept="video/*"></label><input id="dmText" autocomplete="off" placeholder="Message…"><button class="dfdm-btn" id="dmSend">Send</button></div>`;
  }
  function messageHTML(x){
    const mine=x.from===me().id;
    if(x.type==='video') return `<div class="dfdm-msg ${mine?'mine':''}"><b>${mine?'You':'@'+esc(x.fromName)}</b><div class="dfdm-video"><video src="${esc(x.url)}" controls playsinline preload="metadata"></video></div>${x.caption?`<div>${esc(x.caption)}</div>`:''}<div class="dfdm-meta">${new Date(x.createdAt).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})} ${mine&&x.read?'· Read':''}</div></div>`;
    return `<div class="dfdm-msg ${mine?'mine':''}"><b>${mine?'You':'@'+esc(x.fromName)}</b><div>${esc(x.text)}</div><div class="dfdm-meta">${new Date(x.createdAt).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})} ${mine&&x.read?'· Read':''}</div></div>`;
  }
  function markRead(t){if(!t)return;(t.messages||[]).forEach(x=>{if(x.to===me().id)x.read=true;});save();}

  function wireChat(t){
    const chat=document.getElementById('dmChat'); if(chat) chat.scrollTop=chat.scrollHeight;
    document.getElementById('dmBack')?.addEventListener('click',()=>{document.querySelector('.dfdm-shell')?.classList.add('mobile-list');});
    const input=document.getElementById('dmText'); const sendNow=()=>{const text=input.value.trim();if(!text)return;send(t,{to:t.type==='group'?null:(t.members||[]).find(x=>x!==me().id),text});input.value='';clearTyping(t);render();};
    document.getElementById('dmSend')?.addEventListener('click',sendNow); input?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendNow();}else{setTyping(t,true);}}); input?.addEventListener('blur',()=>clearTyping(t));
    document.getElementById('dmVideo')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>100*1024*1024){toast('Video must be 100MB or smaller');return;}const url=URL.createObjectURL(f);send(t,{to:t.type==='group'?null:(t.members||[]).find(x=>x!==me().id),type:'video',url,name:f.name,size:f.size});render();});
    markRead(t); setTimeout(()=>renderTyping(t),250);
  }
  function setTyping(t,on){state.typing[t.id]={userId:me().id,username:me().username||'guest',at:Date.now(),on};save();renderTyping(t);}
  function clearTyping(t){if(state.typing[t.id]?.userId===me().id){delete state.typing[t.id];save();renderTyping(t);}}
  function renderTyping(t){const el=document.getElementById('dmTyping');if(!el)return;const x=state.typing[t.id];el.textContent=x&&x.userId!==me().id&&Date.now()-x.at<5000?`@${x.username} is typing…`:'';}
  function startDM(name){const target=userByName(name);if(!target){toast('That username was not found');return;}active=ensureThread(target).id;save();render();document.getElementById('dmText')?.focus();}
  function createGroup(){const names=prompt('Enter usernames separated by commas');if(!names)return;const members=[me().id];for(const n of names.split(',').map(x=>x.trim()).filter(Boolean)){const u=userByName(n);if(u&&!members.includes(u.id))members.push(u.id);}if(members.length<2){toast('Add at least one valid user');return;}const id=groupKey();state.threads[id]={id,type:'group',title:'New group',members,names:Object.fromEntries(members.map(x=>[x,x===me().id?me().username:(social().users?.[x]?.username||'user')])),messages:[],updatedAt:Date.now()};active=id;save();render();}

  // Keep the existing social Messages button, if present, but open the advanced messenger.
  function bind(){
    document.querySelectorAll('#dfSocialHub [data-tab="messages"], [data-messages], #messagesBtn').forEach(el=>{if(el.dataset.dmBound)return;el.dataset.dmBound='1';el.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();open();},true);});
  }
  new MutationObserver(bind).observe(document.documentElement,{subtree:true,childList:true});
  window.addEventListener('defgodqe-auth-changed',()=>{if(document.getElementById('dfDM')?.classList.contains('open'))render();});
  setInterval(()=>{if(active&&document.getElementById('dfDM')?.classList.contains('open'))renderTyping(state.threads[active]);},1000);
  setTimeout(bind,800);
  window.defgodqeDM={open,close,startDM,createGroup,send,threads:allThreads};
})();
