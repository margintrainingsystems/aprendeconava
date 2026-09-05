// ============================================================
// ACADEMIA AVA — Acordeón de FAQ
// Expuesto como window.avaBindFAQ para poder re-activarlo después
// de que site-data.js inserte las preguntas cargadas desde Supabase.
// ============================================================
(function () {
  'use strict';

  window.avaBindFAQ = function () {
    document.querySelectorAll('[data-faq-toggle]').forEach((btn) => {
      if (btn.dataset.faqBound) return;
      btn.dataset.faqBound = '1';

      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-a');

      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        document.querySelectorAll('.faq-item.is-open').forEach((openItem) => {
          if (openItem !== item) {
            openItem.classList.remove('is-open');
            openItem.querySelector('.faq-a').style.maxHeight = null;
          }
        });
        item.classList.toggle('is-open', !isOpen);
        answer.style.maxHeight = !isOpen ? answer.scrollHeight + 'px' : null;
      });
    });
  };

  window.avaBindFAQ();
})();
