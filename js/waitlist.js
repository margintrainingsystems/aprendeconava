// ============================================================
// AVA — Lista de espera de suscripción (suscripcion.html)
// No es un checkout: todavía no cobramos nada. Guarda nombre,
// apellido, email, país y teléfono en la tabla "leads" de Supabase
// (source: "suscripcion"), visible desde el panel Núcleo.
// ============================================================
(function () {
  'use strict';

  const form = document.getElementById('waitlist-form');
  if (!form) return;

  function showDone() {
    form.querySelectorAll('.checkout-view').forEach((v) => {
      v.classList.toggle('is-active', v.dataset.step === 'done');
    });
    form.closest('.checkout-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = form.querySelector('[data-waitlist-submit]');
    btn.disabled = true;
    btn.textContent = 'Enviando…';

    const payload = {
      source: 'suscripcion',
      name: form.querySelector('#co-nombre').value.trim(),
      last_name: form.querySelector('#co-apellido').value.trim(),
      email: form.querySelector('#co-email').value.trim(),
      country: form.querySelector('#co-pais').value.trim(),
      phone: form.querySelector('#co-telefono').value.trim(),
    };

    try {
      if (typeof supabaseClient !== 'undefined') {
        await supabaseClient.from('leads').insert(payload);
      }
    } catch (err) {
      /* si falla Supabase igual mostramos la confirmación: no bloqueamos a la persona por un error técnico */
    }

    btn.disabled = false;
    btn.textContent = 'Anotarme a la lista de espera';
    showDone();
  });
})();
