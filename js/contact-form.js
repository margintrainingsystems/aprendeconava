// ============================================================
// AVA — Formulario de contacto: guarda el mensaje en Supabase
// (tabla "leads", visible desde Núcleo > Mensajes)
// ============================================================
(function () {
  'use strict';
  const form = document.querySelector('form[name="contacto"]');
  if (!form) return;

  const successMsg = document.getElementById('contact-success');
  const errorMsg = document.getElementById('contact-error');
  const btn = form.querySelector('button[type="submit"]');
  const t = (key, fallback) => (window.avaText ? window.avaText(key, fallback) : fallback);

  function showError(text) {
    errorMsg.querySelector('span:last-child').textContent = text;
    errorMsg.hidden = false;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    successMsg.hidden = true;
    errorMsg.hidden = true;

    // Honeypot: campo oculto que ninguna persona completa, pero los bots sí.
    // Si viene lleno, se simula el envío y no se guarda nada.
    const honeypot = document.getElementById('ct-empresa');
    if (honeypot && honeypot.value.trim() !== '') {
      form.reset();
      successMsg.hidden = false;
      return;
    }

    if (typeof supabaseClient === 'undefined') {
      showError(t('contact_error_connection', 'No pudimos conectarnos para enviar tu mensaje. Revisá tu conexión y probá de nuevo.'));
      return;
    }

    // El texto del botón puede haber cambiado desde Núcleo: se toma recién ahora.
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = t('form_sending', 'Enviando…');

    let failed = true;
    try {
      const { error } = await supabaseClient.from('leads').insert({
        privacy_consent: document.getElementById('ct-privacidad').checked,
        source: 'contacto',
        name: document.getElementById('ct-nombre').value.trim(),
        email: document.getElementById('ct-email').value.trim(),
        motivo: document.getElementById('ct-motivo').value,
        message: document.getElementById('ct-mensaje').value.trim(),
      });
      failed = Boolean(error);
    } catch (err) {
      failed = true;
    }

    btn.disabled = false;
    btn.textContent = original;

    if (failed) {
      // No borramos lo que escribió: puede reintentar sin perder nada.
      showError(t('contact_error_send', 'No pudimos enviar tu mensaje. Probá de nuevo en unos minutos; lo que escribiste sigue acá.'));
      return;
    }
    form.reset();
    successMsg.hidden = false;
  });
})();
