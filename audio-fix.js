/* defgodqe — published video audio fix */
(() => {
  const ROOTS = ['#dfOwned', '#dfOwnedFeed', '#doomScroll', '#doom-feed', '#scroll'];

  function fixVideo(video) {
    if (!(video instanceof HTMLVideoElement)) return;
    // Published videos should retain/play their original audio track.
    video.muted = false;
    video.defaultMuted = false;
    video.removeAttribute('muted');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.volume = 1;
  }

  function scan(root = document) {
    root.querySelectorAll?.('video').forEach(fixVideo);
  }

  function unmuteActive() {
    document.querySelectorAll('video').forEach(v => {
      if (!v.paused) fixVideo(v);
    });
  }

  scan();
  ROOTS.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) new MutationObserver(() => scan(el)).observe(el, {childList:true, subtree:true});
  });
  new MutationObserver(() => scan()).observe(document.documentElement, {childList:true, subtree:true});

  document.addEventListener('click', () => {
    unmuteActive();
  }, true);
  document.addEventListener('pointerdown', () => {
    unmuteActive();
  }, true);
  document.addEventListener('play', e => {
    if (e.target instanceof HTMLVideoElement) {
      fixVideo(e.target);
      // Audio is allowed after the user's interaction with the app/feed.
      e.target.play().catch(() => {});
    }
  }, true);

  window.defgodqeAudioFix = { fixVideo, scan };
})();
