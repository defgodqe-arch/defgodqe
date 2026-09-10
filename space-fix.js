/* defgodqe — chat typing fix
   Keeps the Space key available inside chat/composer text controls.
   Some global keyboard shortcuts can accidentally preventDefault() on Space;
   we isolate normal text entry before those handlers can consume the key.
*/
(() => {
  'use strict';
  if (window.__defgodqeSpaceFix) return;
  window.__defgodqeSpaceFix = true;

  function isTextControl(el) {
    if (!el || !(el instanceof HTMLElement)) return false;
    if (el.isContentEditable) return true;
    if (el.tagName === 'TEXTAREA') return true;
    if (el.tagName !== 'INPUT') return false;
    const type = (el.type || 'text').toLowerCase();
    return !['button', 'submit', 'reset', 'checkbox', 'radio', 'range', 'file', 'color', 'date', 'datetime-local', 'month', 'time', 'week', 'number', 'password', 'hidden'].includes(type);
  }

  // Capture Space before global shortcut handlers. We intentionally do NOT
  // call preventDefault(), so the browser inserts a real space character.
  document.addEventListener('keydown', (event) => {
    if (event.key !== ' ' && event.code !== 'Space') return;
    if (!isTextControl(document.activeElement)) return;

    // Let native text editing handle Space, while stopping global app
    // shortcuts from turning it into a command or preventing the character.
    event.stopImmediatePropagation();
  }, true);
})();
