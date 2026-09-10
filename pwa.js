/* defgodqe — register PWA service worker */
(function () {
  if (!('serviceWorker' in navigator)) return;

  function register() {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(function (error) {
      console.warn('defgodqe PWA service worker registration failed:', error);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', register, { once: true });
  } else {
    register();
  }
})();
