// ============================================================
// ACADEMIA AVA — Animación de ensamblado del isotipo en el hero
// ============================================================
(function () {
  'use strict';
  const motif = document.querySelector('.hero-motif');
  if (!motif) return;

  requestAnimationFrame(() => {
    setTimeout(() => {
      motif.classList.add('is-ready');
      setTimeout(() => motif.classList.add('is-settled'), 1150);
    }, 220);
  });
})();
