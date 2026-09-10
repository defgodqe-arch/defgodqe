/* defgodqe — futuristic visual layer */
(function () {
  'use strict';
  if (document.getElementById('defgodqe-futuristic')) return;

  const css = `
:root{
  --df-yellow:#facc15;
  --df-yellow2:#fde047;
  --df-glow:rgba(250,204,21,.28);
  --df-panel:rgba(10,13,20,.72);
  --df-line:rgba(250,204,21,.12);
}

body{
  background:
    radial-gradient(circle at 50% -10%,rgba(250,204,21,.10),transparent 34%),
    radial-gradient(circle at 100% 100%,rgba(250,204,21,.055),transparent 30%),
    #080b12 !important;
}

body::before{
  content:"";position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.22;
  background-image:linear-gradient(rgba(250,204,21,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(250,204,21,.035) 1px,transparent 1px);
  background-size:42px 42px;
  mask-image:linear-gradient(to bottom,black,transparent 88%);
}

body::after{
  content:"";position:fixed;inset:0;pointer-events:none;z-index:0;
  background:radial-gradient(circle at 50% 45%,transparent 25%,rgba(0,0,0,.38) 100%);
}

body > div.flex.h-screen.w-screen{position:relative;z-index:1;}

header{
  background:linear-gradient(180deg,rgba(15,19,29,.88),rgba(10,13,20,.66)) !important;
  border-bottom-color:rgba(250,204,21,.10) !important;
  backdrop-filter:blur(18px) saturate(130%);
  box-shadow:0 1px 0 rgba(255,255,255,.025),0 12px 40px rgba(0,0,0,.18);
}

header button,#composer, #modelBtn, #modeBtn{
  transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease,background .18s ease !important;
}

header button:hover,#modelBtn:hover,#modeBtn:hover{
  box-shadow:0 0 22px rgba(250,204,21,.10);
}

header button:active,#composer button:active{transform:scale(.95) !important;}

#composer{
  border:1px solid rgba(250,204,21,.14) !important;
  background:linear-gradient(145deg,rgba(18,23,34,.88),rgba(8,11,18,.94)) !important;
  box-shadow:0 0 0 1px rgba(255,255,255,.018),0 18px 55px rgba(0,0,0,.42),0 0 35px rgba(250,204,21,.055) !important;
  backdrop-filter:blur(20px) saturate(140%);
}

#composer:focus-within{
  border-color:rgba(250,204,21,.34) !important;
  box-shadow:0 0 0 3px rgba(250,204,21,.045),0 20px 60px rgba(0,0,0,.46),0 0 45px rgba(250,204,21,.10) !important;
}

#input::placeholder{color:#64748b !important;transition:color .2s ease;}
#composer:focus-within #input::placeholder{color:#94a3b8 !important;}

.orb{
  box-shadow:0 0 28px 5px rgba(250,204,21,.30),0 0 85px 18px rgba(250,204,21,.13),inset -8px -8px 22px rgba(202,138,4,.55),inset 8px 8px 18px rgba(255,251,230,.5) !important;
  animation:dfOrbFloat 4s ease-in-out infinite,dfOrbPulse 2.8s ease-in-out infinite;
}
.orb::before{
  content:"";position:absolute;inset:-16px;border:1px solid rgba(250,204,21,.16);border-radius:50%;animation:dfRing 8s linear infinite;}
.orb::after{box-shadow:0 0 30px rgba(255,255,255,.12) inset;}

@keyframes dfOrbFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-8px) scale(1.025)}}
@keyframes dfOrbPulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.08)}}
@keyframes dfRing{to{transform:rotate(360deg)}}

.msg-in{animation:dfMessage .38s cubic-bezier(.2,.8,.2,1) both !important;}
@keyframes dfMessage{from{opacity:0;transform:translateY(10px) scale(.985);filter:blur(2px)}to{opacity:1;transform:none;filter:none}}

.web-source,.attachment-card,.codeblock{
  border-color:rgba(250,204,21,.10) !important;
  background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.018)) !important;
  box-shadow:0 8px 28px rgba(0,0,0,.14);
}
.web-source:hover{box-shadow:0 0 22px rgba(250,204,21,.08) !important;}

::-webkit-scrollbar-thumb{background:linear-gradient(#30394b,#1d2534) !important;border:2px solid transparent;background-clip:padding-box;}

@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;}}
`;

  const style=document.createElement('style');
  style.id='defgodqe-futuristic';
  style.textContent=css;
  document.head.appendChild(style);
})();
