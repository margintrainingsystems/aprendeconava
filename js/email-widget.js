// ============================================================
// AVA — Emails de contacto por área (editables desde Núcleo)
// El primero de la lista es el email principal: se usa en Privacidad,
// en los datos para Google y en cualquier [data-email-primary].
// ============================================================
(function () {
  'use strict';
  if (typeof supabaseClient === 'undefined') return;

  let primary = null;

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Se expone para que site-data.js lo vuelva a aplicar cuando inserta textos
  // desde Núcleo que traen un link de email adentro (ej. Privacidad).
  window.avaApplyPrimaryEmail = function () {
    if (!primary) return;
    document.querySelectorAll('[data-email-primary]').forEach((el) => {
      el.href = `mailto:${primary}`;
      el.textContent = primary;
    });
    document.querySelectorAll('script[data-org-schema]').forEach((schemaEl) => {
      try {
        const json = JSON.parse(schemaEl.textContent);
        json.email = primary;
        schemaEl.textContent = JSON.stringify(json);
      } catch (e) { /* schema inválido: no lo tocamos */ }
    });
  };

  async function init() {
    try {
      const { data, error } = await supabaseClient
        .from('email_contacts')
        .select('area, email')
        .order('order_index', { ascending: true });
      if (error || !data || !data.length) return;
      const valid = data.filter((c) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email || ''));
      if (!valid.length) return;
      primary = valid[0].email;

      const container = document.getElementById('email-areas');
      if (container) {
        container.innerHTML = valid
          .map((c) => `<p class="body-md">${esc(c.area)}: <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></p>`)
          .join('');
      }
      window.avaApplyPrimaryEmail();
    } catch (e) { /* sin conexión: queda el email del HTML */ }
  }

  init();
})();
