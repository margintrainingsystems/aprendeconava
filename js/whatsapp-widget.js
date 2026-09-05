// ============================================================
// AVA — Botón flotante de WhatsApp
// Usa el primer contacto cargado en Núcleo > WhatsApp como número
// principal. Si no hay ninguno cargado (o no tiene teléfono), no
// muestra nada — nunca rompe la página.
// ============================================================
(function () {
  'use strict';
  if (typeof supabaseClient === 'undefined') return;

  async function injectButton() {
    try {
      const { data, error } = await supabaseClient
        .from('whatsapp_contacts')
        .select('*')
        .order('order_index', { ascending: true })
        .limit(1);

      if (error || !data || !data.length || !data[0].phone) return;

      const contact = data[0];
      const text = encodeURIComponent(contact.message || 'Hola!');
      const url = `https://wa.me/${contact.phone}?text=${text}`;

      const btn = document.createElement('a');
      btn.href = url;
      btn.target = '_blank';
      btn.rel = 'noopener';
      btn.className = 'whatsapp-float';
      btn.setAttribute('aria-label', 'Escribinos por WhatsApp');
      btn.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 3a9 9 0 0 0-7.8 13.4L3 21l4.7-1.2A9 9 0 1 0 12 3Z" stroke="#16171B" stroke-width="1.6" stroke-linejoin="round"/><path d="M8.3 8.2c.3-.6.5-.6.9-.6.2 0 .5 0 .7.5.2.5.7 1.6.8 1.8.1.1 0 .3-.1.5-.2.2-.3.3-.5.5-.2.2-.4.4-.2.7.2.4.9 1.3 1.9 2.1 1.3 1 2.3 1.4 2.7 1.5.3.1.5.1.7-.1.2-.3.7-.8 1-1.1.2-.3.4-.2.7-.1.3.1 1.7.8 2 1 .3.1.5.2.6.3.1.4 0 .9-.2 1.4-.3.5-1.3 1-1.9 1.1-.5.1-1.1.1-3.6-.8-3-1.1-5-4.2-5.1-4.4-.2-.2-1.2-1.6-1.2-3.1 0-1.4.7-2.1 1-2.4Z" fill="#16171B"/></svg>`;
      document.body.appendChild(btn);
    } catch (e) {
      /* silencio: sin botón, el resto de la página sigue funcionando */
    }
  }

  async function fillAreasList() {
    const container = document.getElementById('whatsapp-areas');
    if (!container) return;
    try {
      const { data, error } = await supabaseClient
        .from('whatsapp_contacts')
        .select('*')
        .order('order_index', { ascending: true });

      if (error || !data || !data.length) {
        container.innerHTML = '';
        return;
      }
      container.innerHTML = data
        .filter((c) => c.phone)
        .map((c) => {
          const text = encodeURIComponent(c.message || 'Hola!');
          const url = `https://wa.me/${c.phone}?text=${text}`;
          return `<a href="${url}" target="_blank" rel="noopener" style="color:var(--green); font-weight:600;">${c.area} →</a>`;
        })
        .join('');
    } catch (e) {
      container.innerHTML = '';
    }
  }

  injectButton();
  fillAreasList();
})();
