// ============================================================
// AVA — Reseñas: carrusel de las aprobadas + envío de reseñas nuevas
// ============================================================
(function () {
  'use strict';
  const hasDB = typeof supabaseClient !== 'undefined';
  const t = (key, fallback) => (window.avaText ? window.avaText(key, fallback) : fallback);

  // Las reseñas las escribe cualquier visitante: todo se escapa antes de
  // insertarlo, para que nadie pueda meter código en la página.
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function cardHTML(t) {
    const masters = (Array.isArray(t.masters) ? t.masters : []).map(esc).join(', ');
    return `
      <article class="testimonial-card">
        <p class="testimonial-quote">${esc(t.testimonial)}</p>
        <div>
          <div class="testimonial-name">${esc(t.student_name)}</div>
          ${masters ? `<div class="testimonial-masters">${masters}</div>` : ''}
        </div>
      </article>`;
  }

  /* Home: la sección arranca oculta y solo aparece si hay reseñas aprobadas.
     Página de reseñas: sin reseñas, se muestra un aviso en vez de un hueco. */
  async function loadCarousel() {
    const tracks = document.querySelectorAll('[data-testimonials-track]');
    if (!tracks.length) return;
    let data = null;
    try {
      const res = await supabaseClient
        .from('testimonials')
        .select('student_name, testimonial, masters')
        .eq('status', 'aprobado')
        .order('created_at', { ascending: false });
      if (!res.error) data = res.data;
    } catch (e) { /* sin conexión: se queda el estado inicial */ }

    tracks.forEach((track) => {
      const section = track.closest('section');
      const empty = track.querySelector('[data-testimonials-empty]');
      if (data && data.length) {
        track.innerHTML = data.map(cardHTML).join('');
        if (section) section.hidden = false;
      } else if (empty) {
        const controls = track.closest('.shelf') && track.closest('.shelf').querySelector('.shelf-controls');
        if (controls) controls.hidden = true;
      }
    });
  }

  async function loadMasterChecks() {
    const container = document.getElementById('tf-masters-checks');
    if (!container) return;
    try {
      const { data, error } = await supabaseClient.from('masters').select('name').order('order_index', { ascending: true });
      if (error || !data || !data.length) {
        container.closest('fieldset').hidden = true;
        return;
      }
      container.innerHTML = data
        .map(
          (m, i) => `
        <label class="check-chip" for="tf-master-${i}">
          <input type="checkbox" name="master" value="${esc(m.name)}" id="tf-master-${i}">
          ${esc(m.name)}
        </label>`
        )
        .join('');
    } catch (e) {
      container.closest('fieldset').hidden = true;
    }
  }

  const form = document.getElementById('testimonial-form');
  if (form) {
    if (hasDB) loadMasterChecks();
    else document.getElementById('tf-masters-checks').closest('fieldset').hidden = true;
    const btn = document.getElementById('tf-submit');
    const success = document.getElementById('tf-success');
    const errorMsg = document.getElementById('tf-error');
    function showError(text) {
      errorMsg.lastElementChild.textContent = text;
      errorMsg.hidden = false;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      success.hidden = true;
      errorMsg.hidden = true;

      const honeypot = document.getElementById('tf-empresa');
      if (honeypot && honeypot.value.trim() !== '') {
        form.reset();
        success.hidden = false;
        return;
      }

      if (!hasDB) {
        showError(t('reviews_error_connection', 'No pudimos conectarnos para enviar tu reseña. Revisá tu conexión y probá de nuevo.'));
        return;
      }

      // El texto del botón puede haber cambiado desde Núcleo: se toma recién ahora.
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = t('form_sending', 'Enviando…');

      let failed = true;
      try {
        const { error } = await supabaseClient.from('testimonials').insert({
          privacy_consent: document.getElementById('tf-privacidad').checked,
          student_name: document.getElementById('tf-name').value.trim(),
          testimonial: document.getElementById('tf-testimonial').value.trim(),
          masters: Array.from(form.querySelectorAll('input[name="master"]:checked')).map((i) => i.value),
        });
        failed = Boolean(error);
      } catch (err) {
        failed = true;
      }

      btn.disabled = false;
      btn.textContent = original;

      if (failed) {
        showError(t('reviews_error_send', 'No pudimos enviar tu reseña. Probá de nuevo en unos minutos; lo que escribiste sigue acá.'));
        return;
      }
      form.reset();
      success.hidden = false;
    });
  }

  if (hasDB) loadCarousel();
})();
