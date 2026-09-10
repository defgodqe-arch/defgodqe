/* defgodqe — published video audio + pause controls */
(() => {
  const ROOTS = ['#dfOwned', '#dfOwnedFeed', '#doomScroll', '#doom-feed', '#scroll'];

  function fixVideo(video) {
    if (!(video instanceof HTMLVideoElement)) return;
    video.muted = false;
    video.defaultMuted = false;
    video.removeAttribute('muted');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.volume = 1;
    addPauseUI(video);
  }

  function addPauseUI(video) {
    if (video.dataset.defgodqePauseReady === '1') return;
    video.dataset.defgodqePauseReady = '1';
    const wrap = video.parentElement;
    if (!wrap) return;
    wrap.classList.add('defgodqe-video-wrap');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'defgodqe-pause-btn';
    button.setAttribute('aria-label', 'Pause video');
    button.innerHTML = '❚❚';
    Object.assign(button.style, {position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',zIndex:'20',width:'64px',height:'64px',border:'0',borderRadius:'50%',background:'rgba(0,0,0,.62)',color:'#fff',fontSize:'24px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:'0',transition:'opacity .18s'});
    wrap.style.position = wrap.style.position || 'relative';
    wrap.appendChild(button);
    const sync = () => { button.textContent = video.paused ? '▶' : '❚❚'; button.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video'); };
    button.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); video.paused ? video.play().catch(()=>{}) : video.pause(); sync(); });
    video.addEventListener('click', e => { e.preventDefault(); video.paused ? video.play().catch(()=>{}) : video.pause(); sync(); });
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    sync();
    wrap.addEventListener('mouseenter', () => { button.style.opacity='1'; });
    wrap.addEventListener('mouseleave', () => { button.style.opacity=video.paused?'1':'0'; });
    button.style.opacity = video.paused ? '1' : '0';
  }

  function scan(root = document) { root.querySelectorAll?.('video').forEach(fixVideo); }
  scan();
  ROOTS.forEach(sel => { const el=document.querySelector(sel); if(el) new MutationObserver(()=>scan(el)).observe(el,{childList:true,subtree:true}); });
  new MutationObserver(()=>scan()).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('pointerdown', () => document.querySelectorAll('video').forEach(v => { if(!v.paused) fixVideo(v); }), true);
  document.addEventListener('play', e => { if(e.target instanceof HTMLVideoElement) fixVideo(e.target); }, true);
  window.defgodqeAudioFix = {fixVideo,scan};
})();
