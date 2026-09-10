/* defgodqe — mobile app install experience */
(function () {
  let deferredPrompt = null;
  let installButton = null;

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  function createButton() {
    if (installButton || isStandalone()) return;

    installButton = document.createElement('button');
    installButton.id = 'defgodqeInstallBtn';
    installButton.type = 'button';
    installButton.setAttribute('aria-label', 'Install defgodqe as an app');
    installButton.innerHTML = '<span aria-hidden="true">⬇</span><span>Install app</span>';
    installButton.style.cssText = [
      'position:fixed', 'right:14px', 'bottom:calc(82px + env(safe-area-inset-bottom, 0px))',
      'z-index:9998', 'display:flex', 'align-items:center', 'gap:8px', 'padding:11px 15px',
      'border:1px solid rgba(250,204,21,.45)', 'border-radius:999px', 'background:#facc15',
      'color:#111827', 'font:700 13px Inter,system-ui,sans-serif', 'box-shadow:0 8px 30px rgba(0,0,0,.35)',
      'cursor:pointer', 'touch-action:manipulation'
    ].join(';');
    installButton.addEventListener('click', install);
    document.body.appendChild(installButton);
  }

  function hideButton() {
    if (installButton) installButton.remove();
    installButton = null;
  }

  async function install() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch (_) {}
      deferredPrompt = null;
      hideButton();
      return;
    }

    // iPhone/iPad Safari does not expose beforeinstallprompt.
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIOS) {
      showIOSHelp();
    } else if (navigator.serviceWorker && !isStandalone()) {
      alert('To install defgodqe, open your browser menu and choose “Add to Home Screen” or “Install app”.');
    }
  }

  function showIOSHelp() {
    const old = document.getElementById('defgodqeIOSHelp');
    if (old) old.remove();

    const box = document.createElement('div');
    box.id = 'defgodqeIOSHelp';
    box.style.cssText = 'position:fixed;inset:auto 12px 20px;z-index:10000;padding:18px;border:1px solid rgba(250,204,21,.35);border-radius:18px;background:#111827;color:#fff;font:15px Inter,system-ui,sans-serif;box-shadow:0 16px 50px rgba(0,0,0,.5);text-align:left;';
    box.innerHTML = '<strong style="color:#facc15;font-size:17px">Install defgodqe</strong><div style="margin-top:8px;line-height:1.5">In Safari, tap <b>Share</b> ⬆ and choose <b>Add to Home Screen</b>. Then open defgodqe from your Home Screen for the full app experience.</div><button type="button" style="margin-top:13px;width:100%;padding:10px;border:0;border-radius:12px;background:#facc15;color:#111827;font-weight:700">Got it</button>';
    box.querySelector('button').onclick = () => box.remove();
    document.body.appendChild(box);
  }

  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    deferredPrompt = event;
    createButton();
  });

  window.addEventListener('appinstalled', hideButton);

  function init() {
    if (isStandalone()) return;
    createButton();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
