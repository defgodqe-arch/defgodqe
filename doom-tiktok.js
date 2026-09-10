/* defgodqe — TikTok-style Doom Scroll polish
 * Enhances the existing first-party Doom feed without replacing its upload/backend logic.
 */
(function(){
'use strict';
if(window.__defgodqeTikTokDoom)return;
window.__defgodqeTikTokDoom=true;

const style=document.createElement('style');
style.textContent=`
#dfOwned{background:#000}
#dfOwnedFeed{scroll-behavior:smooth;scroll-snap-stop:always}
.df-o-card{background:#000;touch-action:pan-y;user-select:none}
.df-o-video{cursor:pointer;transform:translateZ(0);transition:filter .18s ease}
.df-o-card.is-active .df-o-video{filter:none}
.df-o-top{height:74px;padding:0 16px;gap:12px;background:linear-gradient(rgba(0,0,0,.72),rgba(0,0,0,0));}
.df-o-brand{letter-spacing:-.4px}
.df-o-brand span{display:none}
.df-o-tab{background:transparent!important;border-radius:0;padding:22px 5px 13px;color:rgba(255,255,255,.65);position:relative;font-size:14px}
.df-o-tab.active{color:#fff}
.df-o-tab.active:after{content:"";position:absolute;left:12px;right:12px;bottom:7px;height:2px;border-radius:2px;background:#fff}
#dfOUpload{background:rgba(255,255,255,.12)!important;border-color:rgba(255,255,255,.22)!important}
.df-o-info{bottom:30px;right:94px;max-width:560px}
.df-o-user{font-size:16px}
.df-o-avatar{box-shadow:0 0 0 1px rgba(255,255,255,.35)}
.df-o-follow{border-radius:6px;padding:5px 11px}
.df-o-title{font-size:15px;max-width:540px}
.df-o-tags{line-height:1.4}
.df-o-actions{bottom:34px;gap:15px}
.df-o-act{width:52px;height:52px;background:rgba(0,0,0,.48);border:1px solid rgba(255,255,255,.08);font-size:23px;transition:transform .12s ease,background .12s ease}
.df-o-act:active{transform:scale(.88)}
.df-o-act small{display:block;line-height:1;font-size:10px;color:rgba(255,255,255,.9)}
.df-o-act.liked{background:#fff;color:#000}
.df-o-progress{position:absolute;left:0;right:0;bottom:0;height:3px;background:rgba(255,255,255,.18);z-index:5}
.df-o-progress i{display:block;height:100%;width:0;background:#fff;transition:width .08s linear}
.df-o-play{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:72px;height:72px;border:0;border-radius:50%;background:rgba(0,0,0,.48);color:#fff;font-size:30px;display:grid;place-items:center;opacity:0;pointer-events:none;z-index:4;backdrop-filter:blur(8px);transition:opacity .15s ease,transform .15s ease}
.df-o-card.show-play .df-o-play{opacity:1;transform:translate(-50%,-50%) scale(1)}
.df-o-heart-pop{position:absolute;left:50%;top:48%;font-size:92px;z-index:7;pointer-events:none;opacity:0;transform:translate(-50%,-50%) scale(.5);text-shadow:0 8px 35px rgba(0,0,0,.45)}
.df-o-heart-pop.show{animation:dfHeart .65s cubic-bezier(.2,.8,.2,1)}
@keyframes dfHeart{0%{opacity:0;transform:translate(-50%,-50%) scale(.35)}20%{opacity:1;transform:translate(-50%,-50%) scale(1.12)}70%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.18)}}
.df-o-comments{position:fixed;z-index:20;left:50%;bottom:0;transform:translate(-50%,105%);width:min(560px,100%);max-height:65dvh;background:rgba(18,18,20,.97);border-radius:20px 20px 0 0;padding:18px;box-sizing:border-box;transition:transform .22s ease;box-shadow:0 -20px 60px rgba(0,0,0,.45);backdrop-filter:blur(18px)}
.df-o-comments.open{transform:translate(-50%,0)}
.df-o-comments h3{margin:0 0 12px;font-size:15px;text-align:center}
.df-o-comments .df-comment-list{max-height:45dvh;overflow:auto}
.df-o-comments .df-comment-row{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.06)}
.df-o-comments .df-comment-avatar{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:#333;font-size:12px;font-weight:900;flex:none}
.df-o-comments .df-comment-name{font-size:12px;font-weight:900}.df-o-comments .df-comment-text{font-size:13px;color:#ddd;margin-top:2px}
.df-o-comments form{display:flex;gap:8px;margin-top:12px}.df-o-comments input{flex:1;background:#29292e;border:0;color:#fff;border-radius:22px;padding:12px 15px;outline:none}.df-o-comments button{border:0;border-radius:22px;padding:0 15px;font-weight:900}
.df-o-mute{position:absolute;right:16px;top:78px;z-index:5;width:40px;height:40px;border:1px solid rgba(255,255,255,.16);border-radius:50%;background:rgba(0,0,0,.42);color:#fff;display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(8px)}
@media(max-width:650px){.df-o-top{height:62px;padding:0 9px}.df-o-tab{font-size:13px;padding:19px 3px 10px}.df-o-tab.active:after{bottom:5px}.df-o-info{bottom:28px;left:12px;right:78px}.df-o-actions{right:9px;bottom:32px;gap:13px}.df-o-act{width:48px;height:48px}.df-o-mute{top:68px;right:10px}}
`;
document.head.appendChild(style);

const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
let root,feed,commentSheet,currentId=null;
const getRoot=()=>document.getElementById('dfOwned');
function cardState(c){
 if(!c)return;
 c.classList.add('is-active');
 const v=c.querySelector('video'); if(!v)return;
 let bar=c.querySelector('.df-o-progress'); if(!bar){bar=document.createElement('div');bar.className='df-o-progress';bar.innerHTML='<i></i>';c.appendChild(bar)}
 let play=c.querySelector('.df-o-play'); if(!play){play=document.createElement('button');play.className='df-o-play';play.type='button';play.textContent='▶';c.appendChild(play);play.onclick=e=>{e.stopPropagation();toggle(v,c)}}
 let mute=c.querySelector('.df-o-mute'); if(!mute){mute=document.createElement('button');mute.className='df-o-mute';mute.type='button';mute.title='Sound';mute.textContent=v.muted?'🔇':'🔊';c.appendChild(mute);mute.onclick=e=>{e.stopPropagation();v.muted=!v.muted;mute.textContent=v.muted?'🔇':'🔊';if(!v.muted)v.play().catch(()=>{})}}
 let heart=c.querySelector('.df-o-heart-pop'); if(!heart){heart=document.createElement('div');heart.className='df-o-heart-pop';heart.textContent='♥';c.appendChild(heart)}
 v.ontimeupdate=()=>{if(v.duration)bar.firstElementChild.style.width=((v.currentTime/v.duration)*100)+'%'};
 v.onplay=()=>{play.textContent='❚❚';c.classList.remove('show-play')};
 v.onpause=()=>{play.textContent='▶';c.classList.add('show-play')};
 c.onclick=e=>{if(e.target.closest('button,a,input'))return;toggle(v,c)};
 c.ondblclick=e=>{if(e.target.closest('button'))return;heart.classList.remove('show');void heart.offsetWidth;heart.classList.add('show');const like=c.querySelector('[data-like]');if(like&&!like.classList.contains('liked'))like.click()};
}
function toggle(v,c){if(v.paused)v.play().catch(()=>{});else v.pause()}
function installComments(){
 if(document.getElementById('dfTikComments'))return;
 commentSheet=document.createElement('aside');commentSheet.id='dfTikComments';commentSheet.className='df-o-comments';commentSheet.innerHTML='<h3>Comments</h3><div class="df-comment-list"></div><form><input maxlength="300" placeholder="Add a comment..."><button>Post</button></form>';
 document.body.appendChild(commentSheet);
 commentSheet.querySelector('form').onsubmit=e=>{e.preventDefault();const input=e.currentTarget.querySelector('input');const text=input.value.trim();if(!text)return;const list=commentSheet.querySelector('.df-comment-list');const me=(()=>{try{return JSON.parse(localStorage.getItem('defgodqe-social-user')||'null')}catch{return null}})();const name=me?.username||'you';list.insertAdjacentHTML('beforeend',`<div class="df-comment-row"><div class="df-comment-avatar">${esc(name[0]?.toUpperCase()||'Y')}</div><div><div class="df-comment-name">@${esc(name)}</div><div class="df-comment-text">${esc(text)}</div></div></div>`);input.value='';list.scrollTop=list.scrollHeight};
 commentSheet.addEventListener('click',e=>{if(e.target===commentSheet)commentSheet.classList.remove('open')});
}
function bind(){
 root=getRoot();if(!root)return false;feed=root.querySelector('#dfOwnedFeed');if(!feed)return false;installComments();
 feed.querySelectorAll('.df-o-card').forEach(card=>cardState(card));
 feed.querySelectorAll('[data-comment]').forEach(btn=>{if(btn.dataset.tiktokBound)return;btn.dataset.tiktokBound='1';btn.addEventListener('click',e=>{e.stopPropagation();currentId=btn.dataset.comment;commentSheet.classList.add('open');setTimeout(()=>commentSheet.querySelector('input')?.focus(),180)})});
 return true;
}
const mo=new MutationObserver(()=>bind());
function watch(){if(bind()){mo.observe(document.getElementById('dfOwnedFeed'),{childList:true,subtree:true});return}setTimeout(watch,250)}
watch();
window.defgodqeTikTokDoom={refresh:bind};
})();
