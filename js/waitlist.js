// ============================================================
// AVA — Lista de espera (suscripcion.html)
// Todavía no se cobra nada: guarda nombre, apellido, email, país y
// teléfono en "leads" (source: "suscripcion"), visible en Núcleo.
// ============================================================
(function () {
  'use strict';
  const form = document.getElementById('waitlist-form');
  if (!form) return;

  const btn = form.querySelector('[data-waitlist-submit]');
  const t = (key, fallback) => (window.avaText ? window.avaText(key, fallback) : fallback);
  const formView = form.querySelector('[data-step="form"]');
  const doneView = form.querySelector('[data-step="done"]');

  let errorMsg = form.querySelector('[data-waitlist-error]');
  if (!errorMsg) {
    errorMsg = document.createElement('p');
    errorMsg.className = 'form-note form-note-error';
    errorMsg.setAttribute('role', 'alert');
    errorMsg.dataset.waitlistError = '';
    errorMsg.hidden = true;
    errorMsg.style.marginTop = '16px';
    errorMsg.innerHTML = '<span aria-hidden="true">!</span><span></span>';
    formView.appendChild(errorMsg);
  }

  function showDone() {
    formView.classList.remove('is-active');
    doneView.classList.add('is-active');
    doneView.focus({ preventScroll: true });
    form.closest('.form-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showError(text) {
    errorMsg.lastElementChild.textContent = text;
    errorMsg.hidden = false;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    errorMsg.hidden = true;

    const honeypot = form.querySelector('#wl-empresa');
    if (honeypot && honeypot.value.trim() !== '') {
      showDone();
      return;
    }
    if (typeof supabaseClient === 'undefined') {
      showError(t('waitlist_error_connection', 'No pudimos conectarnos para anotarte. Revisá tu conexión y probá de nuevo.'));
      return;
    }

    // El texto del botón puede haber cambiado desde Núcleo: se toma recién ahora.
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = t('form_sending', 'Enviando…');

    let failed = true;
    try {
      const { error } = await supabaseClient.from('leads').insert({
        privacy_consent: form.querySelector('#co-privacidad').checked,
        adult_confirmed: Boolean(form.querySelector('#co-mayor') && form.querySelector('#co-mayor').checked),
        publish_consent: Boolean(form.querySelector('#co-publicar') && form.querySelector('#co-publicar').checked),
        source: 'suscripcion',
        name: form.querySelector('#co-nombre').value.trim(),
        last_name: form.querySelector('#co-apellido').value.trim(),
        email: form.querySelector('#co-email').value.trim(),
        country: form.querySelector('#co-pais').value.trim(),
        phone: form.querySelector('#co-telefono').value.trim(),
      });
      failed = Boolean(error);
    } catch (err) {
      failed = true;
    }

    btn.disabled = false;
    btn.textContent = original;

    if (failed) {
      showError(t('waitlist_error_send', 'No pudimos anotarte. Probá de nuevo en unos minutos; tus datos siguen cargados.'));
      return;
    }
    showDone();
  });
})();
