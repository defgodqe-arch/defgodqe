/* defgodqe AI branding */
(() => {
  const LOGO = 'https://raw.githubusercontent.com/defgodqe-arch/defgodqe-ai/main/Screenshot_2026-02-27_164030.png';

  function applyBranding() {
    // Sidebar logo
    document.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src') || '';
      if (src.includes('Screenshot_2026-02-27_164030.png') || src.includes('assets/')) {
        img.src = LOGO;
      }
    });

    // Use the defgodqe image inside the welcome AI orb while keeping the existing animation/glow.
    document.querySelectorAll('.orb').forEach(orb => {
      if (orb.querySelector('.df-brand-orb')) return;
      const img = document.createElement('img');
      img.className = 'df-brand-orb';
      img.src = LOGO;
      img.alt = 'defgodqe AI';
      img.draggable = false;
      orb.appendChild(img);
    });

    // Use the same image for the browser/PWA icon.
    document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach(link => {
      link.href = LOGO;
    });
  }

  const style = document.createElement('style');
  style.textContent = `
    .orb { position: relative; overflow: hidden; }
    .df-brand-orb {
      position: absolute;
      inset: 10%;
      width: 80%;
      height: 80%;
      object-fit: cover;
      border-radius: 50%;
      z-index: 3;
      pointer-events: none;
      user-select: none;
      box-shadow: 0 0 28px rgba(250,204,21,.45), inset 0 0 20px rgba(255,255,255,.12);
    }
    @media (max-width: 480px) {
      .df-brand-orb { inset: 8%; width: 84%; height: 84%; }
    }
  `;
  document.head.appendChild(style);

  applyBranding();
  new MutationObserver(applyBranding).observe(document.documentElement, { childList: true, subtree: true });
})();
