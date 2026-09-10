/* defgodqe — native-size mobile/PWA layout fix */
(function () {
  'use strict';

  const css = `
    @media (max-width: 1023px) {
      :root { --df-safe-top: env(safe-area-inset-top, 0px); --df-safe-bottom: env(safe-area-inset-bottom, 0px); }

      html {
        width: 100% !important;
        min-width: 100% !important;
        max-width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
      }

      body {
        width: 100% !important;
        min-width: 100% !important;
        max-width: 100% !important;
        height: 100% !important;
        min-height: 100dvh !important;
        max-height: 100dvh !important;
        margin: 0 !important;
        overflow: hidden !important;
        position: relative !important;
        inset: auto !important;
      }

      body > div.flex.h-screen.w-screen,
      body > div:first-of-type {
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        height: 100dvh !important;
        max-height: 100dvh !important;
        margin: 0 !important;
        padding: 0 !important;
        display: flex !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
      }

      main {
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        height: 100dvh !important;
        min-height: 0 !important;
        max-height: 100dvh !important;
        flex: 1 1 0% !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
      }

      header {
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        height: auto !important;
        min-height: calc(52px + var(--df-safe-top)) !important;
        max-height: calc(64px + var(--df-safe-top)) !important;
        box-sizing: border-box !important;
        padding: calc(6px + var(--df-safe-top)) 4px 6px !important;
        gap: 2px !important;
        overflow: hidden !important;
        flex-shrink: 0 !important;
      }

      #openSidebar,
      #webBtn,
      #voiceBtn {
        width: 38px !important;
        min-width: 38px !important;
        max-width: 38px !important;
        height: 38px !important;
        min-height: 38px !important;
        max-height: 38px !important;
        flex: 0 0 38px !important;
        padding: 0 !important;
      }

      #modelBtn {
        min-width: 0 !important;
        max-width: 100% !important;
        padding: 5px 6px !important;
        overflow: hidden !important;
      }
      #modelLabel {
        display: block !important;
        min-width: 0 !important;
        max-width: calc(100% - 16px) !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }
      #modeBtn { display: none !important; }
      header > div.relative:first-of-type { flex: 1 1 auto !important; min-width: 0 !important; }
      header > .ml-auto { flex: 0 0 auto !important; min-width: 0 !important; margin-left: auto !important; gap: 1px !important; }
      #webBtn span, #voiceBtn span { display: none !important; }

      #scroll {
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        min-height: 0 !important;
        flex: 1 1 0% !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
        box-sizing: border-box !important;
        -webkit-overflow-scrolling: touch !important;
      }

      #welcome,
      #messages {
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      #welcome { padding: 18px 10px 110px !important; }
      #messages { padding: 14px 10px 120px !important; }
      .msg-in, .prose-df, .codeblock { min-width: 0 !important; max-width: 100% !important; overflow-wrap: anywhere !important; }
      .prose-df pre, .codeblock pre { max-width: 100% !important; overflow-x: auto !important; }
      img, video, canvas, iframe { max-width: 100% !important; }

      main > div:last-child {
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        padding: 5px 5px calc(5px + var(--df-safe-bottom)) !important;
        flex-shrink: 0 !important;
      }
      #attachRow { max-width: 100% !important; overflow-x: auto !important; }
      #composer {
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        margin: 0 !important;
      }
      #input {
        min-width: 0 !important;
        width: auto !important;
        flex: 1 1 auto !important;
        font-size: 16px !important;
      }
      #attachBtn, #imgBtn, #stopBtn, #sendBtn {
        width: 38px !important;
        min-width: 38px !important;
        max-width: 38px !important;
        height: 38px !important;
        min-height: 38px !important;
        flex: 0 0 38px !important;
      }

      #sidebar {
        width: min(86vw, 320px) !important;
        max-width: 320px !important;
        height: 100dvh !important;
      }

      #modelMenu, #modeMenu {
        position: fixed !important;
        left: 7px !important;
        right: 7px !important;
        width: auto !important;
        max-width: none !important;
        top: calc(58px + var(--df-safe-top)) !important;
        max-height: 62dvh !important;
        overflow-y: auto !important;
        z-index: 100 !important;
      }
    }

    @media (max-width: 360px) {
      #webBtn { display: none !important; }
      #modelBtn { font-size: 11px !important; }
      #openSidebar, #voiceBtn { width: 36px !important; min-width: 36px !important; max-width: 36px !important; height: 36px !important; flex-basis: 36px !important; }
      #attachBtn, #imgBtn, #stopBtn, #sendBtn { width: 36px !important; min-width: 36px !important; max-width: 36px !important; height: 36px !important; flex-basis: 36px !important; }
    }
  `;

  function apply() {
    if (document.getElementById('defgodqe-native-mobile-fix')) return;
    const style = document.createElement('style');
    style.id = 'defgodqe-native-mobile-fix';
    style.textContent = css;
    document.head.appendChild(style);
  }

  apply();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once: true });
})();
