/* defgodqe — Doom recommendation + engagement layer */
(function(){
'use strict';
if(window.__defgodqeDoomRecommendations)return;
window.__defgodqeDoomRecommendations=true;
const KEY='defgodqe-doom-recommendation-history-v1';
const get=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}};
const save=x=>{try{localStorage.setItem(KEY,JSON.stringify(x))}catch{}};
const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
function history(){return get()}
function scoreCard(card,h){
 const video=card.querySelector('video');
 const id=card.querySelector('[data-like]')?.dataset.like||card.dataset.i;
 const x=h[id]||{};
 const tags=(card.textContent||'').toLowerCase();
 let s=(x.watch||0)*1.5+(x.complete||0)*10+(x.like||0)*35-(x.skip||0)*8;
 if(x.creator) s+=x.creator*3;
 ['gaming','minecraft','funny','ai','music','sports','science','cars','food','anime','tech'].forEach(t=>{if(tags.includes(t))s+=(h['_topic_'+t]?.affinity||0)*2});
 s+=Math.random()*12;
 return s;
}
function rank(){
 const feed=document.getElementById('dfOwnedFeed');if(!feed)return;
 const cards=[...feed.querySelectorAll('.df-o-card')];if(cards.length<2)return;
 const h=history();cards.sort((a,b)=>scoreCard(b,h)-scoreCard(a,h)).forEach(c=>feed.appendChild(c));
 cards.forEach((c,i)=>c.dataset.i=i);
}
function track(){
 const feed=document.getElementById('dfOwnedFeed');if(!feed||feed.__recBound)return;
 feed.__recBound=true;let last=null,lastStart=0;
 const note=(id,patch)=>{const h=history();h[id]={...(h[id]||{}),...patch};save(h)};
 feed.addEventListener('play',e=>{const v=e.target.closest?.('video');if(!v)return;const c=v.closest('.df-o-card');const id=c?.querySelector('[data-like]')?.dataset.like;if(id){last=id;lastStart=Date.now()}} ,true);
 feed.addEventListener('pause',e=>{const v=e.target.closest?.('video');if(!v||!last)return;const sec=Math.max(0,(Date.now()-lastStart)/1000);note(last,{watch:Math.min(120,(history()[last]?.watch||0)+sec),skip:sec<2?((history()[last]?.skip||0)+1):(history()[last]?.skip||0)});last=null},true);
 feed.addEventListener('ended',e=>{const v=e.target.closest?.('video');const c=v?.closest('.df-o-card');const id=c?.querySelector('[data-like]')?.dataset.like;if(id)note(id,{complete:(history()[id]?.complete||0)+1,watch:(history()[id]?.watch||0)+Math.min(120,v.duration||0)})},true);
 feed.addEventListener('click',e=>{const b=e.target.closest('[data-like]');if(!b)return;const id=b.dataset.like;const h=history();note(id,{like:b.classList.contains('liked')?1:0})});
}
function addSearch(){
 const root=document.getElementById('dfOwned');const top=root?.querySelector('.df-o-top');if(!root||!top||top.querySelector('#dfODoomSearch'))return;
 const input=document.createElement('input');input.id='dfODoomSearch';input.placeholder='Search creators, captions, tags';input.style.cssText='width:min(240px,24vw);min-width:120px;background:rgba(15,15,18,.78);color:#fff;border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:9px 11px;outline:none;font-weight:700';
 top.insertBefore(input,top.querySelector('#dfOUpload'));
 input.addEventListener('input',()=>{const q=input.value.trim().toLowerCase();document.querySelectorAll('#dfOwnedFeed .df-o-card').forEach(c=>{c.style.display=!q||c.textContent.toLowerCase().includes(q)?'flex':'none'})});
}
function hook(){
 if(typeof window.defgodqeOwnedDoomOpen!=='function')return setTimeout(hook,250);
 const original=window.defgodqeOwnedDoomOpen;
 if(original.__recommendationWrapped)return;
 const wrapped=async function(){await original();setTimeout(()=>{rank();track();addSearch()},80)};
 wrapped.__recommendationWrapped=true;window.defgodqeOwnedDoomOpen=wrapped;
}
hook();
})();
