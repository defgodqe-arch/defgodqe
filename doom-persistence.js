/* defgodqe — persistent creator-video vault
 * Keeps locally posted videos in IndexedDB instead of relying on temporary blob URLs.
 * Existing social API posts continue to use the cloud backend.
 */
(function(){
'use strict';
if(window.__defgodqeDoomPersistence)return;
window.__defgodqeDoomPersistence=true;
const DB='defgodqe-doom-vault-v1', STORE='videos', META='defgodqe-owned-feed-v1';
let dbPromise=null;
function db(){
 if(dbPromise)return dbPromise;
 dbPromise=new Promise((resolve,reject)=>{
  const r=indexedDB.open(DB,1);
  r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:'id'});};
  r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error);
 });
 return dbPromise;
}
async function put(id,blob,meta){const d=await db();return new Promise((res,rej)=>{const t=d.transaction(STORE,'readwrite');t.objectStore(STORE).put({id,blob,meta,updatedAt:Date.now()});t.oncomplete=res;t.onerror=()=>rej(t.error);});}
async function all(){const d=await db();return new Promise((res,rej)=>{const t=d.transaction(STORE,'readonly');const r=t.objectStore(STORE).getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error);});}
async function get(id){const d=await db();return new Promise((res,rej)=>{const t=d.transaction(STORE,'readonly');const r=t.objectStore(STORE).get(id);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
async function remove(id){const d=await db();return new Promise((res,rej)=>{const t=d.transaction(STORE,'readwrite');t.objectStore(STORE).delete(id);t.oncomplete=res;t.onerror=()=>rej(t.error);});}
function readMeta(){try{const x=JSON.parse(localStorage.getItem(META)||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
function writeMeta(x){try{localStorage.setItem(META,JSON.stringify(x))}catch(e){console.warn('doom metadata storage full',e)}}
async function restore(){
 try{
  const rows=await all(); if(!rows.length)return;
  const meta=readMeta(); const byId=new Map(meta.map(x=>[x.id,x]));
  for(const row of rows){
   const m=byId.get(row.id)||row.meta||{};
   m.id=row.id; m.url=URL.createObjectURL(row.blob); byId.set(row.id,m);
  }
  writeMeta([...byId.values()]);
 }catch(e){console.warn('defgodqe doom restore failed',e)}
}
async function captureLocalPost(){
 try{
  const input=document.getElementById('dfOFile');
  const file=input&&input.files&&input.files[0]; if(!file)return;
  await new Promise(r=>setTimeout(r,350));
  const arr=readMeta(); const row=arr.find(x=>x.id&&String(x.id).startsWith('local-'));
  if(!row)return;
  await put(row.id,file,{id:row.id,title:row.title,user:row.user,userId:row.userId,likes:row.likes,tags:row.tags});
  row.url=URL.createObjectURL(file); writeMeta(arr);
 }catch(e){console.warn('defgodqe doom save failed',e)}
}
restore();
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#dfOPost');if(b)captureLocalPost();},true);
window.defgodqeDoomVault={put,get,all,remove,restore};
})();
