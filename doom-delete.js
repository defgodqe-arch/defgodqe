/* defgodqe — creator video deletion controls
 * Shows a Delete button only on videos owned by the current creator.
 * Local videos are removed from local metadata + IndexedDB.
 * Cloud videos use DELETE /api/videos/:id; the Worker must authorize ownership.
 */
(function(){
'use strict';
if(window.__defgodqeDoomDelete)return;
window.__defgodqeDoomDelete=true;
const API=(window.DEFGODQE_SOCIAL_API||'').replace(/\/$/,''), LOCAL='defgodqe-owned-feed-v1', USER='defgodqe-social-user', DEVICE='defgodqe-social-device-id';
const getUser=()=>{try{return JSON.parse(localStorage.getItem(USER)||'null')}catch{return null}};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const meta=()=>{try{const x=JSON.parse(localStorage.getItem(LOCAL)||'[]');return Array.isArray(x)?x:[]}catch{return[]}};
const save=x=>{try{localStorage.setItem(LOCAL,JSON.stringify(x))}catch{}};
const headers=()=>({'x-user-id':localStorage.getItem(DEVICE)||'owned-'+Date.now()});
async function apiDelete(id){
 if(!API)throw Error('Cloud deletion is unavailable while the social server is disconnected.');
 const r=await fetch(API+'/api/videos/'+encodeURIComponent(id),{method:'DELETE',headers:headers()});
 const d=await r.json().catch(()=>({}));
 if(!r.ok)throw Error(d.error||'The social server rejected deletion.');
 return d;
}
function currentIdentity(){
 const u=getUser()||{};
 return {id:String(u.id||u.userId||u.user_id||''),username:String(u.username||'').toLowerCase()};
}
function owns(card){
 const uid=String(card.dataset.ownerId||''), name=String(card.dataset.ownerName||'').toLowerCase();
 const me=currentIdentity();
 return card.dataset.local==='true' || (me.id&&uid&&me.id===uid) || (me.username&&name&&me.username===name);
}
function decorate(){
 const root=document.getElementById('dfOwned'), feed=document.getElementById('dfOwnedFeed');
 if(!root||!feed)return;
 feed.querySelectorAll('.df-o-card').forEach(card=>{
  if(card.querySelector('.df-o-delete'))return;
  const i=Number(card.dataset.i); 
  const raw=card.querySelector('[data-like]')?.dataset.like||'';
  const ownerName=card.querySelector('.df-o-user span')?.textContent?.replace(/^@/,'')||'';
  const local=String(raw).startsWith('local-');
  card.dataset.ownerId=local?'local':card.dataset.ownerId||'';
  card.dataset.ownerName=ownerName;
  card.dataset.local=local?'true':'false';
  if(!owns(card))continue;
  const actions=card.querySelector('.df-o-actions');
  if(!actions)continue;
  const b=document.createElement('button');
  b.className='df-o-act df-o-delete'; b.dataset.deleteVideo=raw; b.type='button';
  b.setAttribute('aria-label','Delete video'); b.innerHTML='🗑<small>Delete</small>';
  actions.appendChild(b);
 });
}
function removeLocal(id){
 const arr=meta(); const item=arr.find(x=>String(x.id)===String(id));
 if(item?.url?.startsWith('blob:')){try{URL.revokeObjectURL(item.url)}catch{}}
 save(arr.filter(x=>String(x.id)!==String(id)));
 return window.defgodqeDoomVault?.remove?.(id)||Promise.resolve();
}
async function removeCard(button,id){
 const card=button.closest('.df-o-card');
 if(!card||!owns(card))return;
 if(!confirm('Delete this video? It will no longer be shown in your defgodqe feed.'))return;
 button.disabled=true;
 try{
  if(String(id).startsWith('local-')) await removeLocal(id);
  else await apiDelete(id);
  card.querySelector('video')?.pause();
  card.remove();
  window.dispatchEvent(new CustomEvent('defgodqe-video-deleted',{detail:{id}}));
 }catch(e){button.disabled=false;alert(e.message||'Could not delete this video.');}
}
const style=document.createElement('style');style.textContent=`
.df-o-delete{font-size:18px!important}.df-o-delete:hover{background:#ff3b30!important;color:#fff!important;transform:scale(1.06)}.df-o-delete:disabled{opacity:.5;cursor:wait}
`;document.head.appendChild(style);
const mo=new MutationObserver(()=>decorate());
function start(){const feed=document.getElementById('dfOwnedFeed');if(feed)mo.observe(feed,{childList:true,subtree:true});decorate();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
setTimeout(start,500);setTimeout(start,1500);setTimeout(start,3000);
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-delete-video]');if(b){e.preventDefault();e.stopPropagation();removeCard(b,b.dataset.deleteVideo)}},true);
})();
