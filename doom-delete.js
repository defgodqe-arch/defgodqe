/* defgodqe — reliable creator video deletion controls */
(function(){
'use strict';
if(window.__defgodqeDoomDelete)return;
window.__defgodqeDoomDelete=true;
const API=(window.DEFGODQE_SOCIAL_API||'').replace(/\/$/,''), LOCAL='defgodqe-owned-feed-v1', USER='defgodqe-social-user', DEVICE='defgodqe-social-device-id';
const getUser=()=>{try{return JSON.parse(localStorage.getItem(USER)||'null')}catch{return null}};
const meta=()=>{try{const x=JSON.parse(localStorage.getItem(LOCAL)||'[]');return Array.isArray(x)?x:[]}catch{return[]}};
const save=x=>{try{localStorage.setItem(LOCAL,JSON.stringify(x))}catch{}};
const headers=()=>({'x-user-id':localStorage.getItem(DEVICE)||''});
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function identity(){const u=getUser()||{};return String(u.username||'').trim().toLowerCase()}
function isMine(card,id,name){
 const my=identity();
 if(String(id).startsWith('local-')||card.dataset.local==='true')return true;
 return !!my && !!name && my===String(name).replace(/^@/,'').trim().toLowerCase();
}
function decorate(){
 const feed=document.getElementById('dfOwnedFeed');if(!feed)return;
 feed.querySelectorAll('.df-o-card').forEach(card=>{
  const like=card.querySelector('[data-like]');const id=like?.dataset.like||'';
  const name=card.querySelector('.df-o-user span')?.textContent||'';
  card.dataset.local=String(id).startsWith('local-')?'true':'false';
  if(!isMine(card,id,name))return;
  const actions=card.querySelector('.df-o-actions');if(!actions||actions.querySelector('[data-delete-video]'))return;
  const b=document.createElement('button');
  b.type='button';b.className='df-o-act df-o-delete';b.dataset.deleteVideo=id;b.title='Delete video';b.setAttribute('aria-label','Delete video');
  b.innerHTML='🗑<small>Delete</small>';actions.appendChild(b);
 });
}
async function deleteLocal(id){
 const arr=meta(),item=arr.find(x=>String(x.id)===String(id));
 if(item?.url?.startsWith('blob:')){try{URL.revokeObjectURL(item.url)}catch{}}
 save(arr.filter(x=>String(x.id)!==String(id)));
 try{await window.defgodqeDoomVault?.remove?.(id)}catch{}
}
async function deleteRemote(id){
 if(!API)throw Error('Social server is not connected.');
 const r=await fetch(API+'/api/videos/'+encodeURIComponent(id),{method:'DELETE',headers:headers()});
 const d=await r.json().catch(()=>({}));
 if(!r.ok)throw Error(d.error||'The social server rejected deletion.');
}
async function remove(button,id){
 const card=button.closest('.df-o-card');if(!card)return;
 const name=card.querySelector('.df-o-user span')?.textContent||'';
 if(!isMine(card,id,name))return alert('You can only delete your own videos.');
 if(!confirm('Delete this video? It will no longer be shown in your defgodqe feed.'))return;
 button.disabled=true;
 try{
  if(String(id).startsWith('local-'))await deleteLocal(id);else await deleteRemote(id);
  card.querySelector('video')?.pause();card.remove();
  window.dispatchEvent(new CustomEvent('defgodqe-video-deleted',{detail:{id}}));
 }catch(e){button.disabled=false;alert(e.message||'Could not delete this video.');}
}
const style=document.createElement('style');style.id='dfDoomDeleteStyle';style.textContent=`
.df-o-actions .df-o-delete{display:grid!important;visibility:visible!important;opacity:1!important;position:relative!important;z-index:20!important;font-size:18px!important;background:rgba(220,38,38,.88)!important;color:#fff!important;border:2px solid rgba(255,255,255,.35)!important;box-shadow:0 4px 18px rgba(0,0,0,.45)!important}.df-o-actions .df-o-delete:hover{transform:scale(1.08)}.df-o-actions .df-o-delete:disabled{opacity:.55!important}
`;
document.head.appendChild(style);
function watch(){const feed=document.getElementById('dfOwnedFeed');if(!feed)return false;decorate();if(!feed.__dfDeleteObserved){const mo=new MutationObserver(decorate);mo.observe(feed,{childList:true,subtree:true});feed.__dfDeleteObserved=true;}return true}
function start(){if(watch())return;const bodyMo=new MutationObserver(()=>{if(watch())bodyMo.disconnect()});bodyMo.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
[100,500,1000,2000,4000].forEach(ms=>setTimeout(decorate,ms));
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-delete-video]');if(b){e.preventDefault();e.stopImmediatePropagation();remove(b,b.dataset.deleteVideo)}},true);
})();