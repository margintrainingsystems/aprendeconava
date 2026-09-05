// ============================================================
// AVA — Datos en vivo desde Supabase (progressive enhancement)
// Si falla la conexión, el sitio se queda con el contenido
// estático que ya está en el HTML. Nunca rompe la página.
// ============================================================
(function () {
  'use strict';
  if (typeof supabaseClient === 'undefined') return;

  const COLOR_VAR = { blue: 'var(--blue)', violet: 'var(--violet)', orange: 'var(--orange)', pink: 'var(--pink)', green: 'var(--green)' };

  /* ---------- Precios (usado en suscripcion.html) ---------- */
  window.avaLoadPricing = async function () {
    try {
      const [{ data: pricing, error: pricingError }, { data: masters, error: mastersError }] = await Promise.all([
        supabaseClient.from('pricing_plan').select('*').eq('id', 1).single(),
        supabaseClient.from('masters').select('name, price').order('order_index', { ascending: true }),
      ]);
      if (pricingError || !pricing) return;

      // Filas de precio individual por Máster: se arman con el precio real de cada uno.
      const rowsContainer = document.querySelector('[data-master-price-rows]');
      let total = pricing.price_per_master ? pricing.price_per_master * 5 : 0;
      if (!mastersError && masters && masters.length) {
        total = masters.reduce((sum, m) => sum + Number(m.price || 0), 0);
        if (rowsContainer) {
          rowsContainer.innerHTML = masters
            .map(
              (m) => `
            <div class="value-row">
              <span class="value-check"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l3 3 5-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
              <span class="value-label">Máster ${m.name}</span>
              <span class="value-dots" aria-hidden="true"></span>
              <span class="value-amount">${pricing.currency} ${m.price}/año</span>
            </div>`
            )
            .join('');
        }
      }

      document.querySelectorAll('[data-price="promo"]').forEach((el) => (el.textContent = pricing.price_promo));
      document.querySelectorAll('[data-price="regular"]').forEach((el) => (el.textContent = pricing.price_regular));
      document.querySelectorAll('[data-price="total-separate"]').forEach((el) => (el.textContent = total));
      document.querySelectorAll('[data-price="currency"]').forEach((el) => (el.textContent = pricing.currency));
      document.querySelectorAll('[data-price="guarantee"]').forEach((el) => (el.textContent = pricing.guarantee_days));

      // Si no hay promoción activa, ocultamos todo lo que compare contra un precio "regular"
      // tachado (tanto en el desglose como en la tarjeta del plan) y mostramos un precio único.
      const showPromo = pricing.show_promo !== false;
      document.querySelectorAll('[data-show-if-promo]').forEach((el) => {
        el.style.display = showPromo ? '' : 'none';
      });
      const regularRow = document.querySelector('[data-row="regular"]');
      if (regularRow) regularRow.style.display = showPromo ? '' : 'none';
      const planTag = document.querySelector('[data-plan-tag]');
      if (planTag) planTag.textContent = showPromo ? 'Plan único · precio de lanzamiento' : 'Plan único';
      const finalLabel = document.querySelector('[data-final-label]');
      if (finalLabel) finalLabel.textContent = showPromo ? 'Precio promocional de lanzamiento' : 'Precio de suscripción anual';
    } catch (e) {
      /* silencio: se queda el precio estático del HTML */
    }
  };

  /* ---------- Másteres (usado en index.html) ---------- */
  window.avaLoadMasters = async function () {
    const track = document.querySelector('[data-masters-track]');
    if (!track) return;
    try {
      const { data, error } = await supabaseClient.from('masters').select('*').order('order_index', { ascending: true });
      if (error || !data || !data.length) return;

      track.innerHTML = data
        .map(
          (m, i) => `
        <article class="master-card" style="--card-accent:${COLOR_VAR[m.color_token] || 'var(--green)'}">
          <span class="master-card-index">${String(i + 1).padStart(2, '0')}</span>
          <div>
            <h3>${m.name}</h3>
            <p class="master-card-desc">${m.description}</p>
          </div>
          <ul class="master-card-list">
            ${(m.topics || []).map((t) => `<li>${typeof t === 'string' ? t : t.name}</li>`).join('')}
          </ul>
        </article>`
        )
        .join('');
    } catch (e) {
      /* silencio: se queda el catálogo estático del HTML */
    }
  };

  /* ---------- FAQ (usado en suscripcion.html) ---------- */
  window.avaLoadFAQ = async function () {
    const list = document.querySelector('[data-faq-list]');
    if (!list) return;
    try {
      const { data, error } = await supabaseClient.from('faq_items').select('*').order('order_index', { ascending: true });
      if (error || !data || !data.length) return;

      list.innerHTML = data
        .map(
          (f) => `
        <div class="faq-item reveal is-visible">
          <button class="faq-q" data-faq-toggle>
            ${f.question}
            <span class="plus"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
          </button>
          <div class="faq-a"><p>${f.answer}</p></div>
        </div>`
        )
        .join('');

      // Volvemos a activar el acordeón sobre los items nuevos.
      window.avaBindFAQ && window.avaBindFAQ();

      // Actualizamos el schema FAQPage para que coincida exactamente con lo visible (SEO).
      const schemaEl = document.querySelector('script[data-faq-schema]');
      if (schemaEl) {
        schemaEl.textContent = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: data.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer.replace(/<[^>]+>/g, '') },
          })),
        });
      }
    } catch (e) {
      /* silencio: se queda el FAQ estático del HTML */
    }
  };

  /* ---------- Detalle de Másteres (usado en propuesta-academica.html) ---------- */
  window.avaLoadMasterDetails = async function () {
    const sections = document.querySelectorAll('[data-master-detail]');
    if (!sections.length) return;
    try {
      const { data, error } = await supabaseClient.from('masters').select('*').order('order_index', { ascending: true });
      if (error || !data || !data.length) return;

      sections.forEach((section) => {
        const idx = Number(section.dataset.masterDetail);
        const m = data[idx - 1];
        if (!m) return;

        const titleEl = section.querySelector('[data-detail-name]');
        const descEl = section.querySelector('[data-detail-desc]');
        const gridEl = section.querySelector('[data-detail-grid]');
        const indexEl = section.querySelector('[data-detail-index]');
        if (indexEl) indexEl.style.color = COLOR_VAR[m.color_token] || 'var(--green)';
        if (titleEl) titleEl.textContent = m.name;
        if (descEl) descEl.textContent = m.description;
        if (gridEl) {
          gridEl.innerHTML = (m.topics || [])
            .map((t) => {
              const name = typeof t === 'string' ? t : t.name;
              const desc = typeof t === 'string' ? '' : t.description || '';
              return `
              <div class="reveal is-visible">
                <h3 class="h-md">${name}</h3>
                <p class="body-md">${desc}</p>
              </div>`;
            })
            .join('');
        }
      });
    } catch (e) {
      /* silencio: se queda el detalle estático del HTML */
    }
  };

  /* ---------- Textos editables (usado en varias páginas) ---------- */
  window.avaLoadCopy = async function () {
    try {
      const { data, error } = await supabaseClient.from('site_copy').select('key, value');
      if (error || !data) return;
      data.forEach((row) => {
        const domKey = row.key.replace(/_/g, '-');
        // Bloques de un solo párrafo: reemplazan el texto tal cual.
        const singleEl = document.getElementById(domKey);
        if (singleEl) {
          singleEl.textContent = row.value;
          return;
        }
        // Bloques multi-párrafo: el contenedor tiene [data-copy-block], separamos por línea en blanco
        // y generamos un <p> por párrafo (así una persona no técnica edita todo en un solo textarea).
        const blockEl = document.querySelector(`[data-copy-block="${domKey}"]`);
        if (blockEl) {
          const paragraphs = row.value.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
          blockEl.innerHTML = paragraphs
            .map((p, i) => `<p class="body-lg"${i > 0 ? ' style="margin-top:16px;"' : ''}>${p}</p>`)
            .join('');
        }
      });
    } catch (e) {
      /* silencio: se queda el texto estático del HTML */
    }
  };

  async function boot() {
    if (document.querySelector('[data-faq-list]')) await window.avaLoadFAQ();
    if (document.querySelector('[data-price]')) window.avaLoadPricing();
    if (document.querySelector('[data-masters-track]')) window.avaLoadMasters();
    if (document.querySelector('[data-master-detail]')) window.avaLoadMasterDetails();
    window.avaLoadCopy();
  }
  boot();
})();
