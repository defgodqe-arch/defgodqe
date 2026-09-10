/* defgodqe — compact mobile layout + reliable voice access */
(function () {
  'use strict';

  const css = `
    @media (max-width: 1023px) {
      :root {
        --df-safe-top: env(safe-area-inset-top, 0px);
        --df-safe-bottom: env(safe-area-inset-bottom, 0px);
      }

      html, body {
        width: 100%!important;
        min-width: 100%!important;
        max-width: 100%!important;
        height: 100%!important;
        height: 100dvh!important;
        margin: 0!important;
        padding: 0!important;
        overflow: hidden!important;
        -webkit-text-size-adjust: 100%!important;
      }

      body {
        position: fixed!important;
        inset: 0!important;
        overscroll-behavior: none;
      }

      body > div.flex.h-screen.w-screen,
      body > div:first-of-type {
        width: 100vw!important;
        max-width: 100vw!important;
        height: 100dvh!important;
        max-height: 100dvh!important;
        margin: 0!important;
        padding: 0!important;
        display: flex!important;
        overflow: hidden!important;
      }

      main {
        width: 100%!important;
        min-width: 0!important;
        max-width: 100%!important;
        height: 100dvh!important;
        min-height: 0!important;
        max-height: 100dvh!important;
        flex: 1 1 0%!important;
        overflow: hidden!important;
        box-sizing: border-box!important;
      }

      /* Compact mobile header. Keep voice reachable at all sizes. */
      header {
        width: 100%!important;
        min-width: 0!important;
        max-width: 100%!important;
        height: auto!important;
        min-height: calc(48px + var(--df-safe-top))!important;
        max-height: calc(58px + var(--df-safe-top))!important;
        padding: calc(5px + var(--df-safe-top)) 5px 5px!important;
        gap: 2px!important;
        overflow: visible!important;
        flex-shrink: 0!important;
      }

      #openSidebar,
      #webBtn,
      #voiceBtn {
        display: flex!important;
        align-items: center!important;
        justify-content: center!important;
        width: 34px!important;
        min-width: 34px!important;
        max-width: 34px!important;
        height: 34px!important;
        min-height: 34px!important;
        max-height: 34px!important;
        flex: 0 0 34px!important;
        padding: 0!important;
        position: relative!important;
        z-index: 200!important;
        touch-action: manipulation!important;
      }

      #voiceBtn { cursor: pointer!important; }
      #webBtn span, #voiceBtn span { display: none!important; }

      header > div.relative:first-of-type {
        flex: 1 1 auto!important;
        min-width: 0!important;
        max-width: none!important;
      }

      header > div.relative:nth-of-type(2) { display: none!important; }

      #modelBtn {
        width: auto!important;
        min-width: 0!important;
        max-width: 100%!important;
        height: 34px!important;
        min-height: 34px!important;
        padding: 4px 6px!important;
        font-size: 12px!important;
        overflow: hidden!important;
      }

      #modelLabel {
        display: block!important;
        min-width: 0!important;
        max-width: calc(100% - 16px)!important;
        overflow: hidden!important;
        text-overflow: ellipsis!important;
        white-space: nowrap!important;
      }

      #modeBtn { display: none!important; }

      header > .ml-auto {
        flex: 0 0 auto!important;
        min-width: 0!important;
        margin-left: auto!important;
        gap: 1px!important;
      }

      #scroll {
        width: 100%!important;
        min-width: 0!important;
        max-width: 100%!important;
        min-height: 0!important;
        flex: 1 1 0%!important;
        overflow-x: hidden!important;
        overflow-y: auto!important;
        box-sizing: border-box!important;
        -webkit-overflow-scrolling: touch!important;
      }

      #welcome, #messages {
        width: 100%!important;
        min-width: 0!important;
        max-width: 100%!important;
        box-sizing: border-box!important;
      }

      #welcome {
        padding: 12px 9px 95px!important;
      }

      #welcome .orb,
      .orb {
        width: 58px!important;
        height: 58px!important;
        margin-bottom: 12px!important;
      }

      #welcome h1 {
        font-size: 1.45rem!important;
        line-height: 1.15!important;
      }

      #welcome p {
        font-size: 13px!important;
        line-height: 1.45!important;
        max-width: 300px!important;
      }

      #suggestGrid {
        width: 100%!important;
        max-width: 390px!important;
        gap: 6px!important;
        margin-top: 14px!important;
      }

      #suggestGrid button {
        min-height: 42px!important;
        height: 42px!important;
        padding: 7px 9px!important;
        font-size: 12px!important;
      }

      #messages { padding: 10px 9px 105px!important; }

      .msg-in, .prose-df, .codeblock {
        min-width: 0!important;
        max-width: 100%!important;
        overflow-wrap: anywhere!important;
      }

      .prose-df { font-size: 14px!important; line-height: 1.55!important; }
      .prose-df pre, .codeblock pre { max-width: 100%!important; overflow-x: auto!important; }
      img, video, canvas, iframe { max-width: 100%!important; height: auto!important; }

      main > div:last-child {
        width: 100%!important;
        min-width: 0!important;
        max-width: 100%!important;
        box-sizing: border-box!important;
        padding: 4px 5px calc(4px + var(--df-safe-bottom))!important;
        flex-shrink: 0!important;
      }

      #attachRow { max-width: 100%!important; overflow-x: auto!important; }

      #composer {
        width: 100%!important;
        min-width: 0!important;
        max-width: 100%!important;
        min-height: 46px!important;
        box-sizing: border-box!important;
        margin: 0!important;
        padding: 3px!important;
      }

      #input {
        min-width: 0!important;
        width: auto!important;
        flex: 1 1 auto!important;
        min-height: 38px!important;
        max-height: 110px!important;
        font-size: 16px!important;
        padding: 7px 5px!important;
      }

      #attachBtn, #imgBtn, #stopBtn, #sendBtn {
        width: 34px!important;
        min-width: 34px!important;
        max-width: 34px!important;
        height: 34px!important;
        min-height: 34px!important;
        flex: 0 0 34px!important;
      }

      /* Voice overlay must cover the mobile viewport and sit above every app layer. */
      #voiceOverlay {
        position: fixed!important;
        inset: 0!important;
        width: 100vw!important;
        height: 100dvh!important;
        max-width: 100vw!important;
        max-height: 100dvh!important;
        min-height: 100dvh!important;
        z-index: 2147483000!important;
        overflow: hidden!important;
        padding: calc(8px + var(--df-safe-top)) 10px calc(10px + var(--df-safe-bottom))!important;
        box-sizing: border-box!important;
      }

      #voiceOverlay #voiceClose {
        position: absolute!important;
        top: calc(8px + var(--df-safe-top))!important;
        right: 10px!important;
        z-index: 2147483002!important;
      }

      #vStage {
        width: min(62vw, 260px)!important;
        height: min(62vw, 260px)!important;
        max-width: calc(100vw - 50px)!important;
        max-height: calc(100vw - 50px)!important;
      }

      #voiceOverlay select { max-width: 46vw!important; }

      #sidebar {
        width: min(82vw, 290px)!important;
        max-width: 290px!important;
        height: 100dvh!important;
      }

      #modelMenu, #modeMenu {
        position: fixed!important;
        left: 7px!important;
        right: 7px!important;
        width: auto!important;
        max-width: none!important;
        top: calc(54px + var(--df-safe-top))!important;
        max-height: 62dvh!important;
        overflow-y: auto!important;
        z-index: 2147482000!important;
      }
    }

    @media (max-width: 430px) {
      #openSidebar, #webBtn, #voiceBtn {
        width: 32px!important;
        min-width: 32px!important;
        max-width: 32px!important;
        height: 32px!important;
        min-height: 32px!important;
        flex-basis: 32px!important;
      }

      #modelBtn { height: 32px!important; min-height: 32px!important; font-size: 11px!important; }
      #attachBtn, #imgBtn, #stopBtn, #sendBtn {
        width: 32px!important;
        min-width: 32px!important;
        max-width: 32px!important;
        height: 32px!important;
        min-height: 32px!important;
        flex-basis: 32px!important;
      }
    }

    @media (max-width: 360px) {
      #modelLabel { font-size: 10px!important; }
      #welcome h1 { font-size: 1.3rem!important; }
      #welcome p { font-size: 12px!important; }
    }
  `;

  function apply() {
    let style = document.getElementById('defgodqe-native-mobile-fix');
    if (!style) {
      style = document.createElement('style');
      style.id = 'defgodqe-native-mobile-fix';
      document.head.appendChild(style);
    }
    style.textContent = css;
  }

  apply();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply, { once: true });
  }
})();
