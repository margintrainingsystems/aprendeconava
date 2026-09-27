// ============================================================
// AVA — Acordeón de preguntas frecuentes
// Expuesto como window.avaBindFAQ para volver a activarlo cuando
// site-data.js inserta las preguntas cargadas desde Supabase.
// ============================================================
(function () {
  'use strict';

  function close(item) {
    const answer = item.querySelector('.faq-a');
    item.classList.remove('is-open');
    item.querySelector('[data-faq-toggle]').setAttribute('aria-expanded', 'false');
    // Si quedó en "none" (abierta del todo), se fija la altura actual para que el cierre se anime.
    if (answer.style.maxHeight === 'none') {
      answer.style.maxHeight = answer.scrollHeight + 'px';
      void answer.offsetHeight;
    }
    answer.style.maxHeight = null;
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
        // Terminada la animación, se libera la altura: si cambia el ancho
        // (rotar el celular), el texto no queda cortado.
        answer.addEventListener('transitionend', function done(ev) {
          if (ev.propertyName !== 'max-height') return;
          answer.removeEventListener('transitionend', done);
          if (item.classList.contains('is-open')) answer.style.maxHeight = 'none';
        });
      });
    });
  };

  window.avaBindFAQ();
})();
