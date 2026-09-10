/* defgodqe — futuristic visual layer */
(function () {
  'use strict';
  if (document.getElementById('defgodqe-futuristic')) return;

  const css = `
:root{
  --df-yellow:#facc15;
  --df-yellow2:#fde047;
  --df-yellow3:#fff7a8;
  --df-glow:rgba(250,204,21,.42);
  --df-panel:rgba(10,13,20,.68);
  --df-line:rgba(250,204,21,.20);
}

html,body{background:#07090f !important;}
body{
  background:
    radial-gradient(circle at 50% -8%,rgba(255,235,80,.24),transparent 30%),
    radial-gradient(circle at 8% 35%,rgba(250,204,21,.11),transparent 25%),
    radial-gradient(circle at 92% 75%,rgba(250,204,21,.12),transparent 28%),
    linear-gradient(135deg,#090b12 0%,#0c1019 48%,#080a10 100%) !important;
}

body::before{
  content:"";position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.30;
  background-image:linear-gradient(rgba(250,204,21,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(250,204,21,.055) 1px,transparent 1px);
  background-size:42px 42px;
  mask-image:linear-gradient(to bottom,black,transparent 92%);
  animation:dfGrid 16s linear infinite;
}
body::after{
  content:"";position:fixed;inset:0;pointer-events:none;z-index:0;
  background:radial-gradient(circle at 50% 45%,transparent 20%,rgba(0,0,0,.30) 100%),linear-gradient(transparent 50%,rgba(250,204,21,.018) 50%);
  background-size:auto,100% 4px;
  mix-blend-mode:screen;
}
@keyframes dfGrid{from{transform:translateY(0)}to{transform:translateY(42px)}}

body > div.flex.h-screen.w-screen{position:relative;z-index:1;}

header{
  background:linear-gradient(180deg,rgba(22,25,35,.90),rgba(10,13,20,.66)) !important;
  border-bottom-color:rgba(250,204,21,.20) !important;
  backdrop-filter:blur(18px) saturate(150%);
  box-shadow:0 1px 0 rgba(255,255,255,.04),0 12px 40px rgba(0,0,0,.24),0 1px 18px rgba(250,204,21,.05);
}
header::after{
  content:"";display:block;position:absolute;left:0;right:0;bottom:-1px;height:1px;
  background:linear-gradient(90deg,transparent,#facc15,#fff7a8,#facc15,transparent);
  opacity:.65;animation:dfBeam 3.5s ease-in-out infinite;
}
@keyframes dfBeam{0%,100%{opacity:.25;transform:scaleX(.65)}50%{opacity:1;transform:scaleX(1)}}

header button,#composer,#modelBtn,#modeBtn{
  transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease,background .18s ease,filter .18s ease !important;
}
header button:hover,#modelBtn:hover,#modeBtn:hover{
  border-color:rgba(250,204,21,.30) !important;
  box-shadow:0 0 26px rgba(250,204,21,.18),inset 0 0 18px rgba(250,204,21,.035);
  filter:brightness(1.13);
}
header button:active,#composer button:active{transform:scale(.94) !important;}

#composer{
  border:1px solid rgba(250,204,21,.22) !important;
  background:linear-gradient(145deg,rgba(22,27,39,.90),rgba(7,10,16,.95)) !important;
  box-shadow:0 0 0 1px rgba(255,255,255,.025),0 18px 55px rgba(0,0,0,.44),0 0 38px rgba(250,204,21,.10) !important;
  backdrop-filter:blur(20px) saturate(150%);
  position:relative;
}
#composer::before{
  content:"";position:absolute;inset:-1px;border-radius:inherit;pointer-events:none;
  background:linear-gradient(90deg,transparent,rgba(250,204,21,.35),transparent);
  background-size:200% 100%;opacity:.28;animation:dfComposerBeam 4s linear infinite;
}
@keyframes dfComposerBeam{to{background-position:-200% 0}}
#composer:focus-within{
  border-color:rgba(253,224,71,.62) !important;
  box-shadow:0 0 0 3px rgba(250,204,21,.07),0 20px 65px rgba(0,0,0,.48),0 0 55px rgba(250,204,21,.20) !important;
}
#input::placeholder{color:#64748b !important;transition:color .2s ease;}
#composer:focus-within #input::placeholder{color:#cbd5e1 !important;}

.orb{
  box-shadow:0 0 25px 7px rgba(250,204,21,.48),0 0 85px 22px rgba(250,204,21,.24),0 0 150px 42px rgba(250,204,21,.10),inset -8px -8px 22px rgba(202,138,4,.55),inset 8px 8px 20px rgba(255,255,235,.72) !important;
  animation:dfOrbFloat 4s ease-in-out infinite,dfOrbPulse 2.3s ease-in-out infinite;
}
.orb::before{
  content:"";position:absolute;inset:-17px;border:1px solid rgba(250,204,21,.28);border-radius:50%;box-shadow:0 0 24px rgba(250,204,21,.18);animation:dfRing 7s linear infinite;
}
.orb::after{box-shadow:0 0 38px rgba(255,255,255,.18) inset;}
@keyframes dfOrbFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-10px) scale(1.035)}}
@keyframes dfOrbPulse{0%,100%{filter:brightness(1) saturate(1)}50%{filter:brightness(1.20) saturate(1.18)}}
@keyframes dfRing{to{transform:rotate(360deg)}}

/* Bright energy accents around interactive elements */
button:hover svg,[role="button"]:hover svg{filter:drop-shadow(0 0 5px rgba(253,224,71,.75));}
#sendBtn{box-shadow:0 0 16px rgba(250,204,21,.18);}
#sendBtn:hover{box-shadow:0 0 28px rgba(250,204,21,.42) !important;filter:brightness(1.16);}

.msg-in{animation:dfMessage .38s cubic-bezier(.2,.8,.2,1) both !important;}
@keyframes dfMessage{from{opacity:0;transform:translateY(10px) scale(.985);filter:blur(2px)}to{opacity:1;transform:none;filter:none}}

.web-source,.attachment-card,.codeblock{
  border-color:rgba(250,204,21,.17) !important;
  background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018)) !important;
  box-shadow:0 8px 28px rgba(0,0,0,.16),0 0 18px rgba(250,204,21,.035);
}
.web-source:hover{box-shadow:0 0 28px rgba(250,204,21,.15) !important;}

::-webkit-scrollbar-thumb{background:linear-gradient(#facc15,#a16207) !important;border:2px solid transparent;background-clip:padding-box;box-shadow:0 0 8px rgba(250,204,21,.3);}

@media (max-width:1023px){
  body::before{opacity:.20;background-size:32px 32px;}
  header{box-shadow:0 8px 30px rgba(0,0,0,.25),0 0 22px rgba(250,204,21,.05);}
  #composer{box-shadow:0 12px 40px rgba(0,0,0,.40),0 0 30px rgba(250,204,21,.10) !important;}
}

@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;}}
`;

  const style=document.createElement('style');
  style.id='defgodqe-futuristic';
  style.textContent=css;
  document.head.appendChild(style);
})();
