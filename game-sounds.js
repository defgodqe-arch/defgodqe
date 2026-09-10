/* defgodqe — arcade sound effects (Web Audio, no external files) */
(function(){
  'use strict';
  if(window.__defgodqeGameSounds) return;
  window.__defgodqeGameSounds=true;
  let ac=null,master=null;
  function init(){if(!ac){ac=new(window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.gain.value=.14;master.connect(ac.destination)}if(ac.state==='suspended')ac.resume()}
  function tone(freq,dur,type='sine',vol=.16,slide=0){try{init();const o=ac.createOscillator(),g=ac.createGain(),n=ac.currentTime;o.type=type;o.frequency.setValueAtTime(freq,n);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,freq+slide),n+dur);g.gain.setValueAtTime(.0001,n);g.gain.exponentialRampToValueAtTime(vol,n+.008);g.gain.exponentialRampToValueAtTime(.0001,n+dur);o.connect(g);g.connect(master);o.start(n);o.stop(n+dur+.02)}catch(e){}}
  const s={click:()=>tone(520,.06,'square',.10,70),start:()=>{tone(330,.08,'sawtooth',.13,150);setTimeout(()=>tone(660,.12,'sine',.13,220),70)},hit:()=>tone(180,.08,'square',.14,-70),coin:()=>{tone(740,.06,'sine',.12,140);setTimeout(()=>tone(1040,.10,'sine',.10,180),55)},match:()=>{tone(520,.07,'sine',.12,170);setTimeout(()=>tone(780,.11,'sine',.11,210),70)},shoot:()=>tone(170,.055,'sawtooth',.10,500),explode:()=>{tone(90,.15,'sawtooth',.18,-50);setTimeout(()=>tone(55,.16,'square',.09,-15),45)},over:()=>{tone(300,.10,'sawtooth',.13,-110);setTimeout(()=>tone(180,.18,'sawtooth',.11,-80),95)},win:()=>[523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,.12,'sine',.12,70),i*95))};
  window.defgodqeSfx=s;
  function isGame(){const o=document.getElementById('dfGameOverlay');return !!o&&getComputedStyle(o).display!=='none'}
  document.addEventListener('pointerdown',e=>{if(!isGame())return;const t=e.target;if(t.closest('#dfGameClose'))s.click();else if(t.closest('.dfGameChoice,#dfGameStartBtn,.dfArcadeBack'))s.start();else if(t.closest('.dfMemoryCard'))s.match();else if(t.closest('#dfGameCanvas'))s.shoot()},{passive:true});
  document.addEventListener('keydown',e=>{if(!isGame())return;if(e.code==='Space')s.shoot();else if(['ArrowLeft','ArrowRight','a','d'].includes(e.key))s.click();else if(e.key==='Escape')s.click()});
  let wasPlaying=false,lastMenu=false;
  setInterval(()=>{const o=document.getElementById('dfGameOverlay');if(!o)return;const open=getComputedStyle(o).display!=='none';const m=document.getElementById('dfArcadeMenu');const playing=open&&m&&getComputedStyle(m).display==='none';if(playing&&!wasPlaying)s.start();if(!playing&&wasPlaying&&open)s.over();if(open&&!lastMenu&&m&&getComputedStyle(m).display!=='none')s.click();wasPlaying=playing;lastMenu=open&&m&&getComputedStyle(m).display!=='none'},250);
  document.addEventListener('pointerdown',()=>{try{init()}catch(e){}},{once:true});
})();
