// ============================================================
// AVA — Acordeón de preguntas frecuentes
// Expuesto como window.avaBindFAQ para volver a activarlo cuando
// site-data.js inserta las preguntas cargadas desde Supabase.
// ============================================================
(function () {
  'use strict';

  function close(item) {
    item.classList.remove('is-open');
    item.querySelector('[data-faq-toggle]').setAttribute('aria-expanded', 'false');
    item.querySelector('.faq-a').style.maxHeight = null;
  }

  window.avaBindFAQ = function () {
    document.querySelectorAll('[data-faq-toggle]').forEach((btn) => {
      if (btn.dataset.faqBound) return;
      btn.dataset.faqBound = '1';
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-a');

      btn.addEventListener('click', () => {
        const willOpen = !item.classList.contains('is-open');
        document.querySelectorAll('.faq-item.is-open').forEach((open) => open !== item && close(open));
        if (!willOpen) return close(item);
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      });
    });
  };

  window.avaBindFAQ();
})();
