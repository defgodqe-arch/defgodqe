/* defgodqe — stable browser bootstrap */
(function () {
  "use strict";

  if (window.__defgodqeBootstrapStarted) return;
  window.__defgodqeBootstrapStarted = true;

  /*
   * IMPORTANT: app-core.js is the owner of the base UI.
   * Optional features must never run before the core is initialized.
   */
  const localScripts = [
    "opening-animation.js",
    "features.js",
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
    "direct-messages.js",
    "voice-upgrade.js"
  ];

  const base = new URL("./", window.location.href);

  function loadScript(src) {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.onload = resolve;
      script.onerror = () => {
        console.warn("[defgodqe] Optional script failed:", src);
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  async function loadLucide() {
    if (window.lucide?.createIcons) return true;
    await loadScript("https://unpkg.com/lucide@latest/dist/umd/lucide.js");
    return Boolean(window.lucide?.createIcons);
  }

  async function loadCore() {
    const response = await fetch(new URL("app-core.js", base).href, { cache: "no-store" });
    if (!response.ok) throw new Error(`app-core.js returned HTTP ${response.status}`);

    let source = await response.text();
    source = source.replace(/^\s*import\s+\{\s*createIcons\s*,\s*icons\s*\}\s+from\s+['"][^'"]+['"]\s*;?\s*/m, "");

    const createIcons = window.lucide?.createIcons;
    const icons = window.lucide?.icons;
    if (typeof createIcons !== "function") throw new Error("Lucide failed to initialize");

    const run = new Function("createIcons", "icons", source);
    run(createIcons, icons);
  }

  function rescuePrimaryControls() {
    const ids = [
      "openSidebar", "newChatBtn", "signBtn", "modelBtn", "modeBtn",
      "webBtn", "voiceBtn", "attachBtn", "imgBtn", "sendBtn"
    ];

    for (const id of ids) {
      const node = document.getElementById(id);
      if (!node) continue;
      node.style.setProperty("visibility", "visible", "important");
      node.style.setProperty("opacity", "1", "important");
    }

    try {
      window.lucide?.createIcons?.({ icons: window.lucide.icons });
    } catch (_) {}
  }

  async function boot() {
    try {
      await loadLucide();
      await loadCore();
    } catch (error) {
      console.error("[defgodqe] Core boot failed:", error);
      rescuePrimaryControls();
      return;
    }

    /* Core is ready. Optional features are isolated so one broken feature
       cannot break the base AI application. */
    for (const file of localScripts) {
      try {
        await loadScript(new URL(file, base).href);
      } catch (error) {
        console.warn("[defgodqe] Feature skipped:", file, error);
      }
    }

    rescuePrimaryControls();
    window.dispatchEvent(new CustomEvent("defgodqe:features-ready"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => void boot(), { once: true });
  } else {
    void boot();
  }
})();
