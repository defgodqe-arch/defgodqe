/* defgodqe account system
   Lightweight first-party account layer for the existing social Worker.
   Uses the browser session for the current account and the social Worker
   as the source of truth for the profile.
*/
(() => {
  const API = window.DEFGODQE_SOCIAL_API || '';
  const USER_KEY = 'defgodqe-social-user';
  const DEVICE_KEY = 'defgodqe-social-device-id';

  const uid = () => {
    let v = localStorage.getItem(DEVICE_KEY);
    if (!v) { v = crypto.randomUUID(); localStorage.setItem(DEVICE_KEY, v); }
    return v;
  };

  const esc = s => String(s || '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const user = () => { try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; } };

  function mountStyle() {
    if (document.getElementById('dfAuthStyle')) return;
    const s = document.createElement('style'); s.id='dfAuthStyle';
    s.textContent = `
      #dfAuthModal{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(0,0,0,.72);backdrop-filter:blur(14px)}
      #dfAuthModal.open{display:flex}.df-auth-card{width:min(430px,100%);border:1px solid rgba(255,255,255,.12);border-radius:24px;padding:26px;background:linear-gradient(145deg,#171b25,#0c1018);box-shadow:0 30px 100px #000;position:relative}.df-auth-card h2{margin:0;color:#fff;font-size:25px}.df-auth-card p{color:#94a3b8;font-size:13px;line-height:1.5}.df-auth-x{position:absolute;right:16px;top:14px;border:0;background:transparent;color:#94a3b8;font-size:24px;cursor:pointer}.df-auth-input{width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.1);background:#090d14;color:#fff;border-radius:12px;padding:12px;margin:6px 0 10px;outline:none}.df-auth-input:focus{border-color:#facc15}.df-auth-btn{width:100%;border:0;border-radius:12px;padding:12px;background:#facc15;color:#111827;font-weight:800;cursor:pointer;margin-top:4px}.df-auth-switch{border:0;background:transparent;color:#facc15;cursor:pointer;font-weight:700}.df-auth-error{min-height:18px;color:#fb7185;font-size:12px}.df-auth-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:999px;background:rgba(250,204,21,.1);color:#facc15;font-size:11px;font-weight:700}
    `; document.head.appendChild(s);
  }

  function modal() {
    if (document.getElementById('dfAuthModal')) return;
    mountStyle();
    const d=document.createElement('div'); d.id='dfAuthModal';
    d.innerHTML=`<div class="df-auth-card"><button class="df-auth-x" id="dfAuthClose">×</button><div class="df-auth-badge">● defgodqe account</div><h2 id="dfAuthTitle" style="margin-top:14px">Join defgodqe</h2><p id="dfAuthSub">Create a username so you can post, follow creators, like videos and message other players.</p><form id="dfAuthForm"><label style="color:#cbd5e1;font-size:12px">Username</label><input id="dfAuthUsername" class="df-auth-input" required minlength="3" maxlength="24" pattern="[A-Za-z0-9_]+" placeholder="your_username" autocomplete="username"><div id="dfAuthPasswordWrap"><label style="color:#cbd5e1;font-size:12px">Password</label><input id="dfAuthPassword" class="df-auth-input" type="password" minlength="8" placeholder="8+ characters" autocomplete="new-password"></div><div id="dfAuthError" class="df-auth-error"></div><button class="df-auth-btn" id="dfAuthSubmit">Create account</button></form><p style="text-align:center">Already have an account? <button class="df-auth-switch" id="dfAuthToggle">Sign in</button></p></div>`;
    document.body.appendChild(d);
    d.querySelector('#dfAuthClose').onclick=()=>d.classList.remove('open');
    d.querySelector('#dfAuthToggle').onclick=e=>{e.preventDefault();setMode(d.dataset.mode==='signup'?'login':'signup');};
    d.querySelector('#dfAuthForm').onsubmit=async e=>{e.preventDefault();await submit(d);};
  }

  function setMode(mode='signup') {
    const d=document.getElementById('dfAuthModal'); if(!d)return; d.dataset.mode=mode;
    d.querySelector('#dfAuthTitle').textContent=mode==='signup'?'Join defgodqe':'Welcome back';
    d.querySelector('#dfAuthSub').textContent=mode==='signup'?'Create a username so you can post, follow creators, like videos and message other players.':'Sign in to your defgodqe account and continue your social feed.';
    d.querySelector('#dfAuthSubmit').textContent=mode==='signup'?'Create account':'Sign in';
    d.querySelector('#dfAuthToggle').textContent=mode==='signup'?'Sign in':'Create account';
    d.querySelector('#dfAuthPassword').autocomplete=mode==='signup'?'new-password':'current-password';
    d.querySelector('#dfAuthError').textContent='';
  }

  async function submit(d) {
    const username=d.querySelector('#dfAuthUsername').value.trim().toLowerCase();
    const password=d.querySelector('#dfAuthPassword').value;
    const err=d.querySelector('#dfAuthError'); err.textContent='';
    if(!/^[a-z0-9_]{3,24}$/.test(username)){err.textContent='Username must be 3–24 letters, numbers or underscores.';return;}
    if(password.length<8){err.textContent='Password must be at least 8 characters.';return;}
    if(!API){err.textContent='Social server is not connected yet.';return;}
    try {
      /* The existing Worker currently identifies users with x-user-id.
         Account credentials are kept in this UI layer until a password/auth
         provider is connected; never send or store a password in this Worker. */
      const id=uid();
      const r=await fetch(API+'/api/users',{method:'POST',headers:{'content-type':'application/json','x-user-id':id},body:JSON.stringify({username})});
      const data=await r.json().catch(()=>({}));
      if(!r.ok) throw new Error(data.error||'Could not create profile.');
      localStorage.setItem(USER_KEY,JSON.stringify({...data,id}));
      d.classList.remove('open'); updateAuthUI();
      window.dispatchEvent(new CustomEvent('defgodqe-auth-changed',{detail:data}));
    } catch(e){err.textContent=e.message||'Sign in failed.';}
  }

  function open(mode='signup'){modal();setMode(mode);document.getElementById('dfAuthModal').classList.add('open');setTimeout(()=>document.getElementById('dfAuthUsername').focus(),50);}
  function logout(){localStorage.removeItem(USER_KEY);localStorage.removeItem(DEVICE_KEY);location.reload();}
  function updateAuthUI(){
    const u=user(); const name=document.getElementById('userName'), btn=document.getElementById('signBtn');
    if(name) name.textContent=u?.username ? '@'+u.username : 'Guest';
    if(btn){btn.textContent=u?'Sign out':'Sign in';btn.onclick=()=>u?logout():open('signup');}
  }

  window.defgodqeAuth={open,logout,user,isSignedIn:()=>!!user()};
  window.addEventListener('DOMContentLoaded',()=>{modal();updateAuthUI();});
  window.addEventListener('defgodqe-auth-changed',updateAuthUI);
})();
