/* defgodqe — browser-side feature loader
 *
 * The project contains a large collection of legacy browser scripts. Loading
 * them at runtime keeps Vite/Rollup from trying to parse every legacy file as
 * part of the production module graph while preserving the existing app.
 */
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

  // This is the previous working core hosted in the defgodqe-ai repository.
  // It is intentionally loaded as a browser module instead of a Rollup import.
  const remoteCore =
    "https://cdn.jsdelivr.net/gh/defgodqe-arch/defgodqe-ai@013d26575d03aebd4c6dbc6bb62427f5650d2a93/app.js";

  function loadScript(src, module) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      if (module) script.type = "module";

      script.onload = () => resolve();
      script.onerror = () => {
        console.warn("[defgodqe] Feature failed to load:", src);
        // Non-critical enhancement scripts should not prevent the rest of the
        // application from starting.
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
    boot();
  }
})();
