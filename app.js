/* defgodqe — browser-side feature loader */
(function () {
  "use strict";

  if (window.__defgodqeFeatureLoaderStarted) return;
  window.__defgodqeFeatureLoaderStarted = true;

  const localScripts = [
    "space-fix.js",
    "audio-fix.js",
    "social-platform.js",
    "branding.js",
    "enhancements.js",
    "mobile-fix.js",
    "install.js",
    "mobile-app-fix.js",
    "pwa.js",
    "futuristic.js",
    "mini-game.js",
    "mini-game-neon-tag.js",
    "game-sounds.js",
    "cool-stuff.js",
    "feature-pack.js",
    "doom-scroll.js",
    "youtube-random-feed.js",
    "doom-social.js",
    "doom-social-entry.js",
    "sidebar-extras.js?v=neon-tag-fix-2",
    "doom-mobile-fix.js",
    "doom-replay.js",
    "doom-owned.js",
    "doom-tiktok.js",
    "doom-persistence.js",
    "doom-delete.js",
    "doom-recommendations.js",
    "doom-ultra.js",
    "doom-1000.js",
    "auth.js",
    "mini-games-ultimate.js",
    "multiplayer-game.js",
    "app-boost.js",
    "defgodqe-mega.js",
    "realism-layer.js",
    "web-search-fix.js",
    "direct-messages.js"
  ];

  // Use the live main branch. The previous pinned SHA no longer exists.
  const remoteCore =
    "https://cdn.jsdelivr.net/gh/defgodqe-arch/defgodqe-ai@main/app.js";

  function loadScript(src, module) {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      if (module) script.type = "module";
      script.onload = () => resolve();
      script.onerror = () => {
        console.warn("[defgodqe] Feature failed to load:", src);
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  async function boot() {
    const base = new URL("./", window.location.href);
    for (const file of localScripts) {
      await loadScript(new URL(file, base).href, false);
    }
    await loadScript(remoteCore, true);
    window.dispatchEvent(new CustomEvent("defgodqe:features-ready"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    void boot();
  }
})();
