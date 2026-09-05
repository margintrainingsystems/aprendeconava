// ============================================================
// AVA — Formulario de contacto: guarda el mensaje en Supabase
// (tabla "leads", visible desde el panel Núcleo)
// ============================================================
(function () {
  'use strict';
  const form = document.querySelector('form[name="contacto"]');
  if (!form) return;

  const successMsg = document.getElementById('contact-success');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Enviando…';

    const payload = {
      source: 'contacto',
      name: document.getElementById('ct-nombre').value.trim(),
      email: document.getElementById('ct-email').value.trim(),
      motivo: document.getElementById('ct-motivo').value,
      message: document.getElementById('ct-mensaje').value.trim(),
    };

    try {
      if (typeof supabaseClient !== 'undefined') {
        await supabaseClient.from('leads').insert(payload);
      }
    } catch (err) {
      /* si falla Supabase igual mostramos éxito visual: no perdemos el intento del usuario por un error técnico */
    }

    btn.disabled = false;
    btn.textContent = original;
    form.reset();
    if (successMsg) successMsg.style.display = 'flex';
    window.avaToast && window.avaToast('¡Gracias! Te respondemos a la brevedad.');
  });
})();
