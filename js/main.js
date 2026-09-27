// ============================================================
// AVA — Comportamiento compartido en todas las páginas
// ============================================================
(function () {
  'use strict';

  /* ---------- Menú mobile ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const ICON_MENU = '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  const ICON_CLOSE = '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 3l12 12M15 3L3 15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

  const header = document.querySelector('.nav');
  function setMenu(open) {
    // El menú arranca justo debajo del encabezado, esté o no visible la
    // franja de arrepentimiento/baja de arriba.
    if (open && header) navLinks.style.top = Math.max(0, header.getBoundingClientRect().bottom) + 'px';
    navLinks.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    navToggle.innerHTML = open ? ICON_CLOSE : ICON_MENU;
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('is-open')));
    navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
        setMenu(false);
        navToggle.focus();
      }
    });
  }

  /* ---------- Aparición al hacer scroll ---------- */
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

  /* ---------- Aviso breve reutilizable ----------
     La región "status" existe desde que carga la página: los lectores de
     pantalla solo anuncian cambios en regiones que ya estaban en el DOM. */
  let toastTimer = null;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  window.avaToast = function (message) {
    toast.textContent = message;
    toast.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-shown'), 4200);
  };

  /* ---------- Campus ----------
     Mientras no haya link del Campus cargado en Núcleo, el botón avisa que
     todavía no abrió (sin JavaScript, lleva a la lista de espera). Con el
     link cargado, site-data.js lo activa y el aviso deja de aparecer. */
  document.querySelectorAll('[data-campus-link]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if ('campusOpen' in btn.dataset) return;
      e.preventDefault();
      const text = 'El Campus todavía no está abierto. Vas a poder entrar apenas abramos inscripciones.';
      window.avaToast(window.avaText ? window.avaText('campus_closed', text) : text);
    });
  });

  /* ---------- Carruseles horizontales (Másteres y reseñas) ---------- */
  document.querySelectorAll('.shelf').forEach((shelf) => {
    const track = shelf.querySelector('.shelf-track');
    const prev = shelf.querySelector('[data-shelf-prev]');
    const next = shelf.querySelector('[data-shelf-next]');
    if (!track) return;

    function update() {
      const max = track.scrollWidth - track.clientWidth - 4;
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft >= max;
      // Si todo entra en pantalla, las flechas no aportan nada.
      const controls = shelf.querySelector('.shelf-controls');
      if (controls) controls.hidden = max <= 0;
    }

    function scrollByCard(dir) {
      const card = track.firstElementChild;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 20;
      const amount = card ? card.getBoundingClientRect().width + gap : 320;
      track.scrollBy({ left: dir * amount, behavior: 'smooth' });
    }

    prev && prev.addEventListener('click', () => scrollByCard(-1));
    next && next.addEventListener('click', () => scrollByCard(1));
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    // Las tarjetas llegan después, desde Supabase: recalculamos cuando cambia el contenido.
    new MutationObserver(update).observe(track, { childList: true });
    update();
  });

  /* ---------- Año en el footer ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
