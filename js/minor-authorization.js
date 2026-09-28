// ============================================================
// AVA — Autorización de madre, padre o tutor/a para personas
// menores de edad. Se firma escribiendo el nombre completo y
// marcando la declaración; queda en Núcleo > Autorizaciones.
// ============================================================
(function () {
  'use strict';
  const form = document.getElementById('minor-auth-form');
  if (!form) return;

  const t = (key, fallback) => (window.avaText ? window.avaText(key, fallback) : fallback);
  const btn = form.querySelector('[data-request-submit]');
  const formView = form.querySelector('[data-step="form"]');
  const doneView = form.querySelector('[data-step="done"]');
  const codeEl = form.querySelector('[data-request-code]');
  const copyBtn = form.querySelector('[data-code-copy]');
  const value = (name) => form.elements[name].value.trim();
  const checked = (name) => form.elements[name].checked;

  const errorMsg = document.createElement('p');
  errorMsg.className = 'form-note form-note-error';
  errorMsg.setAttribute('role', 'alert');
  errorMsg.hidden = true;
  errorMsg.style.marginTop = '16px';
  errorMsg.innerHTML = '<span aria-hidden="true">!</span><span></span>';
  formView.appendChild(errorMsg);
  function showError(text, focusEl) {
    errorMsg.lastElementChild.textContent = text;
    errorMsg.hidden = false;
    if (focusEl) focusEl.focus();
  }

  // La fecha de nacimiento tiene que ser de una persona menor de 18 años.
  const birth = form.elements.menor_nacimiento;
  const today = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate() + 1);
  birth.max = iso(today);
  birth.min = iso(minDate);

  // Código legible: sin 0/O ni 1/I para que no se confundan al dictarlo.
  const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  function newCode() {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    return `AUT-${Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('')}`;
  }

  function showDone(code) {
    codeEl.textContent = code;
    formView.classList.remove('is-active');
    doneView.classList.add('is-active');
    doneView.focus({ preventScroll: true });
    form.closest('.form-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(codeEl.textContent);
      window.avaToast && window.avaToast(t('request_copied', 'Código copiado.'));
    } catch (e) {
      const range = document.createRange();
      range.selectNodeContents(codeEl);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.hidden = true;

    // Honeypot: los bots ven la confirmación, pero no se guarda nada.
    if (value('empresa') !== '') return showDone(newCode());

    if (!checked('suscripcion') && !checked('sorteo')) {
      return showError(t('minor_auth_error_scope', 'Marcá al menos una opción de lo que autorizás.'), form.elements.suscripcion);
    }
    const b = value('menor_nacimiento');
    if (!b || b > birth.max || b < birth.min) {
      return showError(t('minor_auth_error_birthdate', 'La fecha de nacimiento tiene que ser de una persona menor de 18 años.'), birth);
    }
    if (typeof supabaseClient === 'undefined') {
      return showError(t('minor_auth_error_connection', 'No pudimos conectarnos para enviar la autorización. Revisá tu conexión y probá de nuevo.'));
    }

    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = t('form_sending', 'Enviando…');

    let code = null;
    let failed = true;
    for (let attempt = 0; attempt < 3 && failed; attempt++) {
      code = newCode();
      try {
        const { error } = await supabaseClient.from('minor_authorizations').insert({
          auth_code: code,
          adult_name: value('nombre'),
          adult_last_name: value('apellido'),
          adult_doc_type: value('doc_tipo'),
          adult_doc_number: value('doc_numero'),
          relationship: value('vinculo'),
          adult_email: value('email'),
          adult_phone: value('telefono') || null,
          minor_name: value('menor_nombre'),
          minor_last_name: value('menor_apellido'),
          minor_birthdate: b,
          minor_email: value('menor_email') || null,
          authorize_subscription: checked('suscripcion'),
          authorize_raffle: checked('sorteo'),
          declaration: checked('declaracion'),
          terms_accepted: checked('terminos'),
          privacy_consent: checked('privacidad'),
          signature: value('firma'),
        });
        failed = Boolean(error);
        if (error && error.code !== '23505') break;
      } catch (err) {
        failed = true;
        break;
      }
    }

    btn.disabled = false;
    btn.textContent = original;
    if (failed) {
      return showError(t('minor_auth_error_send', 'No pudimos registrar la autorización. Revisá los datos y probá de nuevo; lo que completaste sigue acá.'));
    }
    showDone(code);
  });
})();
