/* defgodqe — mobile app install experience */
(function () {
  let deferredPrompt = null;
  let installButton = null;

  const HIDDEN_KEY = 'defgodqe_install_button_hidden';

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  function isHiddenByUser() {
    try { return localStorage.getItem(HIDDEN_KEY) === '1'; } catch (_) { return false; }
  }

  function hideButtonForever() {
    try { localStorage.setItem(HIDDEN_KEY, '1'); } catch (_) {}
    if (installButton) installButton.remove();
    installButton = null;
  }

  function createButton() {
    if (installButton || isStandalone() || isHiddenByUser()) return;

    installButton = document.createElement('div');
    installButton.id = 'defgodqeInstallBtn';
    installButton.style.cssText = [
      'position:fixed', 'right:14px', 'bottom:calc(82px + env(safe-area-inset-bottom, 0px))',
      'z-index:9998', 'display:flex', 'align-items:center', 'gap:6px', 'padding:6px',
      'border:1px solid rgba(250,204,21,.45)', 'border-radius:999px', 'background:#facc15',
      'color:#111827', 'font:700 13px Inter,system-ui,sans-serif', 'box-shadow:0 8px 30px rgba(0,0,0,.35)'
    ].join(';');

    const install = document.createElement('button');
    install.type = 'button';
    install.setAttribute('aria-label', 'Install defgodqe as an app');
    install.textContent = '⬇ Install app';
    install.style.cssText = 'border:0;background:transparent;color:#111827;font:inherit;padding:7px 9px;cursor:pointer;touch-action:manipulation;';
    install.addEventListener('click', installApp);

    const close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'Hide install app button');
    close.title = 'Hide install app button';
    close.textContent = '×';
    close.style.cssText = 'width:28px;height:28px;border:0;border-radius:50%;background:rgba(17,24,39,.12);color:#111827;font:700 20px/24px system-ui;cursor:pointer;touch-action:manipulation;';
    close.addEventListener('click', hideButtonForever);

    installButton.appendChild(install);
    installButton.appendChild(close);
    document.body.appendChild(installButton);
  }

  function hideButton() {
    if (installButton) installButton.remove();
    installButton = null;
  }

  async function installApp() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch (_) {}
      deferredPrompt = null;
      hideButton();
      return;
    }

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
    if (isStandalone() || isHiddenByUser()) return;
    createButton();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
