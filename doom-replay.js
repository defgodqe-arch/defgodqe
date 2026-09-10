/* defgodqe — Doom Scroll replay safety
 * Restarts a card from the beginning whenever the user leaves it and later
 * returns, so revisiting never resumes halfway through an old playback. */
(function(){
'use strict';
if(window.__defgodqeDoomReplay)return;
window.__defgodqeDoomReplay=true;
let lastIndex=-1;
function frame(index){return document.querySelector('#dfDoomFeed iframe[data-index="'+index+'"]')}
function msg(f,type){try{f?.contentWindow?.postMessage({type,'x-tiktok-player':true},'*')}catch{}}
function restart(index){const f=frame(index);if(!f)return;msg(f,'pause');try{f.contentWindow?.postMessage({type:'seekTo',value:0,'x-tiktok-player':true},'*')}catch{};setTimeout(()=>{msg(f,'play');},60)}
function resetPrevious(index){if(lastIndex>=0&&lastIndex!==index){const old=frame(lastIndex);msg(old,'pause');msg(old,'mute');restart(index)}else if(lastIndex<0){restart(index)}lastIndex=index}
function watch(){
 const feed=document.getElementById('dfDoomFeed');if(!feed)return;
 feed.addEventListener('scroll',()=>{clearTimeout(feed.__dfReplayTimer);feed.__dfReplayTimer=setTimeout(()=>{
   if(!document.getElementById('dfDoomOverlay')?.classList.contains('df-open'))return;
   const index=Math.max(0,Math.min(99,Math.round(feed.scrollTop/Math.max(1,innerHeight))));
   if(index!==lastIndex)resetPrevious(index);
 },120)},{passive:true});
 const exit=document.getElementById('dfDoomExit');exit?.addEventListener('click',()=>{lastIndex=-1});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();
new MutationObserver(watch).observe(document.body,{childList:true,subtree:true});
})();
