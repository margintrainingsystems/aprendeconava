// ============================================================
// ACADEMIA AVA — main.js (comportamiento compartido en todas las páginas)
// ============================================================

(function () {
  'use strict';

  /* ---------- Nav móvil ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.innerHTML = isOpen ? iconClose() : iconMenu();
    });

    navLinks.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.innerHTML = iconMenu();
      });
    });
  }

  function iconMenu() {
    return '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  }
  function iconClose() {
    return '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 3l12 12M15 3L3 15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Toast reutilizable ---------- */
  let toastTimer = null;
  window.avaToast = function (message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-shown'), 4200);
  };

  /* ---------- Botón de Campus (todavía no está activo) ---------- */
  document.querySelectorAll('[data-campus-link]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.avaToast('El Campus (campus.aprendeconava.com) todavía no está activo. Vas a poder entrar apenas abramos inscripciones.');
    });
  });

  /* ---------- Shelf horizontal (Másteres estilo streaming) ---------- */
  document.querySelectorAll('.shelf').forEach((shelf) => {
    const track = shelf.querySelector('.shelf-track');
    const prev = shelf.querySelector('[data-shelf-prev]');
    const next = shelf.querySelector('[data-shelf-next]');
    if (!track) return;

    function update() {
      const max = track.scrollWidth - track.clientWidth - 4;
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft >= max;
    }

    function scrollByCard(dir) {
      const card = track.querySelector('.master-card');
      const amount = card ? card.getBoundingClientRect().width + 20 : 320;
      track.scrollBy({ left: dir * amount, behavior: 'smooth' });
    }

    prev && prev.addEventListener('click', () => scrollByCard(-1));
    next && next.addEventListener('click', () => scrollByCard(1));
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ---------- Año dinámico en footer ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
