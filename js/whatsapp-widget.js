// ============================================================
// AVA — WhatsApp: botón flotante (primer número cargado en Núcleo)
// y lista de áreas en Contacto. Sin números cargados no se muestra nada.
// ============================================================
(function () {
  'use strict';
  if (typeof supabaseClient === 'undefined') return;

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function waUrl(c) {
    const phone = String(c.phone || '').replace(/\D/g, '');
    return `https://wa.me/${phone}?text=${encodeURIComponent(c.message || '¡Hola!')}`;
  }

  async function init() {
    let contacts = [];
    try {
      const { data, error } = await supabaseClient
        .from('whatsapp_contacts')
        .select('area, phone, message')
        .order('order_index', { ascending: true });
      if (!error && data) contacts = data.filter((c) => String(c.phone || '').replace(/\D/g, '').length >= 8);
    } catch (e) { return; }
    if (!contacts.length) return;

    // Botón flotante con el primer número de la lista
    const btn = document.createElement('a');
    btn.href = waUrl(contacts[0]);
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.className = 'whatsapp-float';
    const label = () => {
      const text = 'Escribinos por WhatsApp';
      return window.avaText ? window.avaText('whatsapp_float_label', text) : text;
    };
    btn.setAttribute('aria-label', label());
    // Si los textos de Núcleo llegan después, se actualiza la etiqueta.
    document.addEventListener('ava:copy', () => btn.setAttribute('aria-label', label()));
    btn.innerHTML = '<svg aria-hidden="true" focusable="false" width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 3a9 9 0 0 0-7.8 13.4L3 21l4.7-1.2A9 9 0 1 0 12 3Z" stroke="#16171B" stroke-width="1.6" stroke-linejoin="round"/><path d="M8.3 8.2c.3-.6.5-.6.9-.6.2 0 .5 0 .7.5.2.5.7 1.6.8 1.8.1.1 0 .3-.1.5-.2.2-.3.3-.5.5-.2.2-.4.4-.2.7.2.4.9 1.3 1.9 2.1 1.3 1 2.3 1.4 2.7 1.5.3.1.5.1.7-.1.2-.3.7-.8 1-1.1.2-.3.4-.2.7-.1.3.1 1.7.8 2 1 .3.1.5.2.6.3.1.4 0 .9-.2 1.4-.3.5-1.3 1-1.9 1.1-.5.1-1.1.1-3.6-.8-3-1.1-5-4.2-5.1-4.4-.2-.2-1.2-1.6-1.2-3.1 0-1.4.7-2.1 1-2.4Z" fill="#16171B"/></svg>';
    document.body.appendChild(btn);

    // Lista por área en Contacto
    const container = document.getElementById('whatsapp-areas');
    const block = document.querySelector('[data-whatsapp-block]');
    if (container && block) {
      container.innerHTML = contacts
        .map((c) => `<a href="${esc(waUrl(c))}" target="_blank" rel="noopener">${esc(c.area)} →</a>`)
        .join('');
      block.hidden = false;
    }
  }

  init();
})();
