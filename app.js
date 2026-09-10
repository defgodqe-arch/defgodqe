/* defgodqe — emergency stable UI bootstrap */
(function () {
  'use strict';

  if (window.__defgodqeEmergencyBoot) return;
  window.__defgodqeEmergencyBoot = true;

  function forceUIVisible() {
    var ids = [
      'sidebar','openSidebar','closeSidebar','newChatBtn','signBtn',
      'modelBtn','modeBtn','webBtn','voiceBtn','attachBtn','imgBtn',
      'sendBtn','stopBtn','composer','scroll','welcome','messages'
    ];
    ids.forEach(function (id) {
      var node = document.getElementById(id);
      if (!node) return;
      node.style.removeProperty('display');
      node.style.removeProperty('visibility');
      node.style.removeProperty('opacity');
      node.style.removeProperty('color');
      node.style.removeProperty('pointer-events');
    });
    document.querySelectorAll('button').forEach(function (button) {
      button.style.removeProperty('display');
      button.style.removeProperty('visibility');
      button.style.removeProperty('opacity');
      button.style.removeProperty('color');
      button.style.pointerEvents = 'auto';
    });
  }

  function load(src) {
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = resolve;
      s.onerror = function () {
        console.warn('[defgodqe] script failed:', src);
        resolve();
      };
      document.head.appendChild(s);
    });
  }

  async function boot() {
    forceUIVisible();

    // Load the AI core directly without asking Vite/Rollup to parse its
    // remote Lucide import. The core is plain browser JavaScript at runtime.
    try {
      await load('https://unpkg.com/lucide@latest/dist/umd/lucide.js');
      var response = await fetch('./app-core.js?ui-fix=4', { cache: 'no-store' });
      if (!response.ok) throw new Error('app-core.js HTTP ' + response.status);
      var source = await response.text();
      source = source.replace(/^\s*import\s+\{\s*createIcons\s*,\s*icons\s*\}\s+from\s+['"][^'"]+['"]\s*;?\s*/m, '');
      new Function('createIcons', 'icons', source)(window.lucide.createIcons, window.lucide.icons);
    } catch (error) {
      console.error('[defgodqe] core boot failed:', error);
    }

    // Keep optional features from being able to prevent the base app from loading.
    var optional = [
      'space-fix.js','audio-fix.js','social-platform.js','branding.js',
      'enhancements.js','mobile-fix.js','install.js','mobile-app-fix.js','pwa.js',
      'futuristic.js','mini-game.js','mini-game-neon-tag.js','game-sounds.js',
      'cool-stuff.js','feature-pack.js','doom-scroll.js','youtube-random-feed.js',
      'doom-social.js','doom-social-entry.js','sidebar-extras.js?v=neon-tag-fix-3',
      'doom-mobile-fix.js','doom-replay.js','doom-owned.js','doom-tiktok.js',
      'doom-persistence.js','doom-delete.js','doom-recommendations.js','doom-ultra.js',
      'doom-1000.js','auth.js','mini-games-ultimate.js','multiplayer-game.js',
      'app-boost.js','defgodqe-mega.js','realism-layer.js','web-search-fix.js',
      'direct-messages.js'
    ];
    for (var i = 0; i < optional.length; i++) await load(optional[i]);

    forceUIVisible();
    try { window.lucide && window.lucide.createIcons({ icons: window.lucide.icons }); } catch (_) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
