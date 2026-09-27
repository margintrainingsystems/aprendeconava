// ============================================================
// AVA — Botón de arrepentimiento y botón de baja de servicio
// (Disposición 954/2025): sin registro, con código del pedido al
// instante. El pedido queda en Núcleo > Mensajes para confirmarlo
// por email dentro de las 24 horas.
// ============================================================
(function () {
  'use strict';
  const form = document.getElementById('request-form');
  if (!form) return;

  const kind = form.dataset.requestKind; // 'arrepentimiento' | 'baja'
  const prefix = kind === 'baja' ? 'BAJ' : 'ARR';
  const t = (key, fallback) => (window.avaText ? window.avaText(key, fallback) : fallback);
  const btn = form.querySelector('[data-request-submit]');
  const formView = form.querySelector('[data-step="form"]');
  const doneView = form.querySelector('[data-step="done"]');
  const codeEl = form.querySelector('[data-request-code]');
  const copyBtn = form.querySelector('[data-code-copy]');
  const value = (name) => form.elements[name].value.trim();

  const errorMsg = document.createElement('p');
  errorMsg.className = 'form-note form-note-error';
  errorMsg.setAttribute('role', 'alert');
  errorMsg.hidden = true;
  errorMsg.style.marginTop = '16px';
  errorMsg.innerHTML = '<span aria-hidden="true">!</span><span></span>';
  formView.appendChild(errorMsg);
  function showError(text) {
    errorMsg.lastElementChild.textContent = text;
    errorMsg.hidden = false;
  }

  // Código legible: sin 0/O ni 1/I para que no se confundan al dictarlo.
  const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  function newCode() {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    return `${prefix}-${Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('')}`;
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
      // Sin permiso de portapapeles: se selecciona el código para copiarlo a mano.
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
    if (typeof supabaseClient === 'undefined') {
      return showError(t('request_error_connection', 'No pudimos conectarnos para enviar tu pedido. Revisá tu conexión y probá de nuevo.'));
    }

    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = t('form_sending', 'Enviando…');

    let code = null;
    let failed = true;
    // Si el código justo ya existía (muy improbable), se prueba con otro.
    for (let attempt = 0; attempt < 3 && failed; attempt++) {
      code = newCode();
      try {
        const { error } = await supabaseClient.from('leads').insert({
          source: kind,
          request_code: code,
          name: value('nombre'),
          last_name: value('apellido'),
          email: value('email'),
          phone: value('telefono'),
          motivo: value('operacion') || null,
          message: value('comentario') || null,
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
      return showError(t('request_error_send', 'No pudimos registrar tu pedido. Probá de nuevo en unos minutos; tus datos siguen cargados.'));
    }
    showDone(code);
  });
})();
