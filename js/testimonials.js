// ============================================================
// AVA — Reseñas: carrusel de aprobadas + envío de nuevas reseñas
// ============================================================
(function () {
  'use strict';
  if (typeof supabaseClient === 'undefined') return;

  function cardHTML(t) {
    const masters = (t.masters || []).join(', ');
    return `
      <article class="testimonial-card">
        <p class="testimonial-quote">${t.testimonial}</p>
        <div>
          <div class="testimonial-name">${t.student_name}</div>
          ${masters ? `<div class="testimonial-masters">${masters}</div>` : ''}
        </div>
      </article>`;
  }

  async function loadCarousel() {
    const tracks = document.querySelectorAll('[data-testimonials-track]');
    if (!tracks.length) return;
    try {
      const { data, error } = await supabaseClient
        .from('testimonials')
        .select('*')
        .eq('status', 'aprobado')
        .order('created_at', { ascending: false });

      tracks.forEach((track) => {
        if (error || !data || !data.length) {
          const wrapper = track.closest('[id]') || track.closest('section');
          if (wrapper) wrapper.style.display = 'none';
          return;
        }
        track.innerHTML = data.map(cardHTML).join('');
      });
    } catch (e) {
      const wrapper = document.getElementById('testimonials-shelf');
      if (wrapper) wrapper.style.display = 'none';
    }
  }

  async function loadMasterChecks() {
    const container = document.getElementById('tf-masters-checks');
    if (!container) return;
    try {
      const { data, error } = await supabaseClient.from('masters').select('name').order('order_index', { ascending: true });
      if (error || !data) {
        container.innerHTML = '';
        return;
      }
      container.innerHTML = data
        .map(
          (m, i) => `
        <label class="check-chip">
          <input type="checkbox" name="master" value="${m.name}" id="tf-master-${i}">
          ${m.name}
        </label>`
        )
        .join('');
    } catch (e) {
      container.innerHTML = '';
    }
  }

  const form = document.getElementById('testimonial-form');
  if (form) {
    loadMasterChecks();
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('tf-submit');
      btn.disabled = true;
      btn.textContent = 'Enviando…';

      const selectedMasters = Array.from(form.querySelectorAll('input[name="master"]:checked')).map((i) => i.value);
      const payload = {
        student_name: document.getElementById('tf-name').value.trim(),
        testimonial: document.getElementById('tf-testimonial').value.trim(),
        masters: selectedMasters,
      };

      try {
        await supabaseClient.from('testimonials').insert(payload);
      } catch (err) {
        /* silencio */
      }

      btn.disabled = false;
      btn.textContent = 'Enviar mi reseña';
      form.reset();
      document.getElementById('tf-success').style.display = 'block';
      window.avaToast && window.avaToast('¡Gracias por tu reseña!');
    });
  }

  loadCarousel();
})();
