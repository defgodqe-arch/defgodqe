/* defgodqe — arcade sound effects (Web Audio, no external files) */
(function(){
  'use strict';
  if(window.__defgodqeGameSounds) return;
  window.__defgodqeGameSounds=true;
  let ac=null, master=null;
  function init(){if(!ac){ac=new (window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.gain.value=.12;master.connect(ac.destination)}if(ac.state==='suspended')ac.resume()}
  function tone(freq,dur,type='sine',vol=.18,slide=0){try{init();const o=ac.createOscillator(),g=ac.createGain(),now=ac.currentTime;o.type=type;o.frequency.setValueAtTime(freq,now);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,freq+slide),now+dur);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(vol,now+.008);g.gain.exponentialRampToValueAtTime(.0001,now+dur);o.connect(g);g.connect(master);o.start(now);o.stop(now+dur+.02)}catch(e){}}
  window.defgodqeSfx={click:()=>tone(520,.07,'square',.12,80),start:()=>{tone(330,.08,'sawtooth',.13,160);setTimeout(()=>tone(660,.12,'sine',.14,220),70)},hit:()=>tone(180,.09,'square',.16,-80),coin:()=>{tone(740,.07,'sine',.13,140);setTimeout(()=>tone(1040,.11,'sine',.11,180),55)},match:()=>{tone(520,.08,'sine',.12,180);setTimeout(()=>tone(780,.12,'sine',.12,220),75)},shoot:()=>tone(180,.055,'sawtooth',.10,520),explode:()=>{tone(90,.16,'sawtooth',.18,-55);setTimeout(()=>tone(55,.18,'square',.09,-20),50)},over:()=>{tone(300,.12,'sawtooth',.14,-120);setTimeout(()=>tone(180,.2,'sawtooth',.12,-90),110)},win:()=>{[523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,.13,'sine',.13,80),i*100))}};
  document.addEventListener('pointerdown',()=>{try{init()}catch(e){}},{once:true});
})();
