// ============================================================
// AVA — Datos en vivo desde Supabase (progressive enhancement)
// El HTML trae una copia estática de cada texto y precio: si la
// conexión falla, la página se queda con esa copia. Nunca se rompe.
//
// Textos editables desde Núcleo (la clave es la de la tabla site_copy):
//   data-copy="clave"             una línea o párrafo (*texto* = cursiva)
//   data-copy-block="clave"       varios párrafos ("## " título, "- " lista)
//   data-copy-list="clave"        un ítem por renglón (lista con íconos)
//   data-copy-options="clave"     opciones de un <select>, una por renglón
//   data-copy-placeholder="clave" texto de ejemplo de un campo
// Marcadores que se pueden escribir en cualquier texto:
//   {cantidad} / {Cantidad}  cantidad de Másteres en palabras ("cinco" / "Cinco")
//   {garantia}               días de garantía (Núcleo > Precios)
//   {anio}                   año actual
// ============================================================
(function () {
  'use strict';

  /* ---------- Textos para el resto de los scripts ----------
     Se define antes de cualquier consulta: si Supabase no carga,
     avaText devuelve el texto de respaldo y nada se rompe. */
  const copy = {};
  window.avaText = function (key, fallback) {
    const value = copy[key];
    return typeof value === 'string' && value.trim() ? value : fallback;
  };

  if (typeof supabaseClient === 'undefined') return;

  /* ---------- Utilidades ---------- */
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  const formatNumber = (n) => new Intl.NumberFormat('es-AR').format(Number(n) || 0);

  /* ---------- Colores de Máster ----------
     Solo 3 acentos que rotan: el sistema nunca necesita un color nuevo
     cada vez que se suma un Máster. El verde queda reservado para la marca. */
  const ACCENTS = ['var(--accent-1)', 'var(--accent-2)', 'var(--accent-3)'];
  function accentFor(m, i) {
    const token = (m && m.color_token) || '';
    return /^accent-[1-3]$/.test(token) ? `var(--${token})` : ACCENTS[i % ACCENTS.length];
  }

  /* ---------- Cantidad de Másteres en palabras ---------- */
  const NUMBER_WORDS = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce'];
  function numberWord(n, capitalize) {
    const w = NUMBER_WORDS[n] || String(n);
    return capitalize ? w.charAt(0).toUpperCase() + w.slice(1) : w;
  }

  /* ---------- Estado compartido ----------
     Arranca con los valores del HTML estático, así los marcadores
     muestran algo coherente aunque todavía no haya llegado la base. */
  const firstText = (sel) => {
    const el = document.querySelector(sel);
    return el ? el.textContent.trim() : '';
  };
  const state = {
    pricing: null,
    masters: null,
    guarantee: firstText('[data-price="guarantee"]'),
    countWord: firstText('[data-master-count-word]'),
  };

  /* ---------- Marcadores y formato en línea ---------- */
  function tokens(html) {
    const count = state.masters ? state.masters.length : null;
    const word = count != null ? numberWord(count, false) : state.countWord.toLowerCase();
    const cap = word.charAt(0).toUpperCase() + word.slice(1);
    const guarantee = state.pricing ? state.pricing.guarantee_days : state.guarantee;
    return html
      .replace(/\{cantidad\}/g, `<span data-master-count-word>${esc(word)}</span>`)
      .replace(/\{Cantidad\}/g, `<span data-master-count-word="cap">${esc(cap)}</span>`)
      .replace(/\{garantia\}/g, `<span data-price="guarantee">${esc(guarantee)}</span>`)
      .replace(/\{anio\}/g, `<span data-year>${new Date().getFullYear()}</span>`);
  }
  const italics = (html) => html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  // Texto simple: se escapa (nadie puede meter código), después cursiva y marcadores.
  const inline = (value) => tokens(italics(esc(value.trim())));
  // Texto para Google (schema): sin etiquetas y con los marcadores resueltos.
  function plain(value) {
    const guarantee = state.pricing ? state.pricing.guarantee_days : state.guarantee;
    const word = state.masters ? numberWord(state.masters.length, false) : state.countWord.toLowerCase();
    return String(value)
      .replace(/\{cantidad\}/g, word)
      .replace(/\{Cantidad\}/g, word.charAt(0).toUpperCase() + word.slice(1))
      .replace(/\{garantia\}/g, guarantee)
      .replace(/\{anio\}/g, new Date().getFullYear())
      .replace(/<[^>]+>/g, '')
      .replace(/\*([^*\n]+)\*/g, '$1')
      .trim();
  }

  /* ---------- Bloques de varios párrafos ----------
     Renglón vacío = párrafo nuevo · "## " = título de sección ·
     "- " = ítem de lista · Enter simple = salto de línea.
     Estos bloques los escribe solo quien administra Núcleo, así que
     admiten HTML (por ejemplo, un link de email en Privacidad). */
  function renderBlock(value) {
    const parts = [];
    let current = null;
    String(value).replace(/\r\n?/g, '\n').split('\n').forEach((raw) => {
      const line = raw.trim();
      if (!line) { current = null; return; }
      if (line.startsWith('## ')) {
        parts.push({ type: 'h', text: line.slice(3).trim() });
        current = null;
      } else if (/^[-•]\s+/.test(line)) {
        if (!current || current.type !== 'ul') { current = { type: 'ul', items: [] }; parts.push(current); }
        current.items.push(line.replace(/^[-•]\s+/, ''));
      } else {
        if (!current || current.type !== 'p') { current = { type: 'p', lines: [] }; parts.push(current); }
        current.lines.push(line);
      }
    });

    const fmt = (s) => tokens(italics(s));
    const toHTML = (part) => {
      if (part.type === 'h') return `<h2 class="h-lg">${fmt(part.text)}</h2>`;
      if (part.type === 'ul') return `<ul class="copy-list">${part.items.map((i) => `<li>${fmt(i)}</li>`).join('')}</ul>`;
      return `<p class="body-lg">${part.lines.map(fmt).join('<br>')}</p>`;
    };

    // Con títulos, cada "## " abre una sección propia (Privacidad, Términos).
    let html = '';
    let open = false;
    parts.forEach((part) => {
      if (part.type === 'h') {
        if (open) html += '</div>';
        html += '<div class="copy-section">';
        open = true;
      }
      html += toHTML(part);
    });
    if (open) html += '</div>';
    return html;
  }

  /* ---------- Aplicar textos ---------- */
  // Etiquetas que nunca deberían quedar vacías: si el campo se borra, queda el texto original.
  const KEEP_IF_EMPTY = new Set(['LABEL', 'LEGEND', 'BUTTON', 'SELECT', 'H1']);

  // Un campo vacío en Núcleo oculta ese texto. Solo se vuelve a mostrar
  // lo que ocultamos nosotros, nunca algo que otro script dejó oculto.
  function setEmpty(el, empty) {
    if (empty) {
      el.hidden = true;
      el.dataset.copyEmpty = '';
    } else if ('copyEmpty' in el.dataset) {
      el.hidden = false;
      delete el.dataset.copyEmpty;
    }
  }

  function applyCopy() {
    document.querySelectorAll('[data-copy]').forEach((el) => {
      const value = copy[el.dataset.copy];
      if (typeof value !== 'string') return;
      if (!value.trim()) {
        if (!KEEP_IF_EMPTY.has(el.tagName)) setEmpty(el, true);
        return;
      }
      setEmpty(el, false);
      el.innerHTML = inline(value);
    });

    document.querySelectorAll('[data-copy-block]').forEach((el) => {
      const value = copy[el.dataset.copyBlock];
      if (typeof value !== 'string') return;
      setEmpty(el, !value.trim());
      if (value.trim()) el.innerHTML = renderBlock(value);
    });

    document.querySelectorAll('[data-copy-list]').forEach((el) => {
      const value = copy[el.dataset.copyList];
      if (typeof value !== 'string' || !value.trim()) return;
      const icon = el.querySelector('li svg');
      const iconHTML = icon ? icon.outerHTML : '';
      el.innerHTML = value
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => `<li>${iconHTML}<span>${inline(l)}</span></li>`)
        .join('');
    });

    document.querySelectorAll('[data-copy-options]').forEach((el) => {
      const value = copy[el.dataset.copyOptions];
      if (typeof value !== 'string' || !value.trim()) return;
      const selected = el.value;
      el.innerHTML = value
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => `<option value="${esc(l)}">${esc(l)}</option>`)
        .join('');
      if ([...el.options].some((o) => o.value === selected)) el.value = selected;
    });

    // Bloques que solo se muestran si el texto correspondiente tiene contenido.
    // Si la clave no está en la base, queda como viene en el HTML.
    document.querySelectorAll('[data-show-if-copy]').forEach((el) => {
      const value = copy[el.dataset.showIfCopy];
      if (typeof value !== 'string') return;
      el.hidden = !value.trim();
    });

    document.querySelectorAll('[data-copy-placeholder]').forEach((el) => {
      const value = copy[el.dataset.copyPlaceholder];
      if (typeof value === 'string') el.placeholder = value.trim();
    });
  }

  /* ---------- Link del Campus ---------- */
  function applyCampus() {
    const url = (copy.campus_url || '').trim();
    if (!/^https:\/\/\S+$/i.test(url)) return;
    document.querySelectorAll('[data-campus-link]').forEach((link) => {
      link.href = url;
      link.dataset.campusOpen = '';
    });
  }

  /* ---------- Redes sociales (Núcleo > Redes) ----------
     Sin redes cargadas, no se muestra el bloque "Seguinos"/"Redes" vacío. */
  async function loadSocial() {
    if (!document.querySelector('[data-social-list], script[data-org-schema]')) return;
    try {
      const { data, error } = await supabaseClient.from('social_links').select('name, url').order('order_index', { ascending: true });
      if (error || !data) return;
      const links = data.filter((s) => /^https:\/\/\S+$/i.test(s.url || ''));
      document.querySelectorAll('[data-social-list]').forEach((ul) => {
        ul.innerHTML = links
          .map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}<span class="visually-hidden"> (se abre en otra pestaña)</span></a></li>`)
          .join('');
      });
      document.querySelectorAll('[data-social-group]').forEach((group) => (group.hidden = !links.length));
      // Google solo recibe perfiles reales, nunca placeholders.
      document.querySelectorAll('script[data-org-schema]').forEach((schemaEl) => {
        try {
          const json = JSON.parse(schemaEl.textContent);
          if (links.length) json.sameAs = links.map((s) => s.url);
          else delete json.sameAs;
          schemaEl.textContent = JSON.stringify(json);
        } catch (e) { /* schema inválido: no lo tocamos */ }
      });
    } catch (e) {
      /* sin conexión: el bloque de redes queda oculto */
    }
  }

  /* ---------- Precios, cantidad de Másteres y año ----------
     Se vuelve a aplicar cada vez que llega algo nuevo (textos, FAQ,
     precios o Másteres), porque los textos pueden traer marcadores. */
  function applyDynamic() {
    const setAll = (sel, val) => document.querySelectorAll(sel).forEach((el) => (el.textContent = val));
    const masters = state.masters;
    const pricing = state.pricing;

    if (masters) {
      document.querySelectorAll('[data-master-count-word]').forEach((el) => {
        el.textContent = numberWord(masters.length, el.dataset.masterCountWord === 'cap');
      });
    }

    if (pricing) {
      const perYear = window.avaText('plan_per_year', '/año');
      const rows = document.querySelector('[data-master-price-rows]');
      if (rows && masters) {
        const icon = rows.querySelector('.value-check');
        const iconHTML = icon ? icon.outerHTML : '';
        rows.innerHTML = masters
          .map(
            (m) => `
          <div class="value-row">
            ${iconHTML}
            <span class="value-label">Máster ${esc(m.name)}</span>
            <span class="value-dots" aria-hidden="true"></span>
            <span class="value-amount">${esc(pricing.currency)} ${formatNumber(m.price)}<span data-copy="plan_per_year">${esc(perYear)}</span></span>
          </div>`
          )
          .join('');
      }
      if (masters) setAll('[data-price="total-separate"]', formatNumber(masters.reduce((sum, m) => sum + Number(m.price || 0), 0)));
      setAll('[data-price="promo"]', formatNumber(pricing.price_promo));
      setAll('[data-price="regular"]', formatNumber(pricing.price_regular));
      setAll('[data-price="currency"]', pricing.currency);
      setAll('[data-price="guarantee"]', pricing.guarantee_days);

      // Sin oferta activa: un solo precio, sin nada tachado.
      const showPromo = pricing.show_promo !== false;
      document.querySelectorAll('[data-show-if-promo]').forEach((el) => (el.hidden = !showPromo));
      document.querySelectorAll('[data-plan-tag]').forEach((el) => {
        el.textContent = showPromo
          ? window.avaText('plan_tag_promo', 'Plan único · precio de lanzamiento')
          : window.avaText('plan_tag', 'Plan único');
      });
      document.querySelectorAll('[data-final-label]').forEach((el) => {
        el.textContent = showPromo
          ? window.avaText('plan_promo_label', 'Precio promocional de lanzamiento')
          : window.avaText('plan_regular_label', 'Precio de suscripción anual');
      });
    }

    setAll('[data-year]', new Date().getFullYear());
  }

  /* ---------- Consultas (una sola por tabla, compartidas) ---------- */
  const once = {};
  function fetchOnce(name, run) {
    if (!once[name]) once[name] = run().catch(() => null);
    return once[name];
  }
  const getMasters = () =>
    fetchOnce('masters', async () => {
      const { data, error } = await supabaseClient.from('masters').select('*').order('order_index', { ascending: true });
      return error || !data || !data.length ? null : data;
    });
  const getPricing = () =>
    fetchOnce('pricing', async () => {
      const { data, error } = await supabaseClient.from('pricing_plan').select('*').eq('id', 1).single();
      return error || !data ? null : data;
    });

  const needsMasters = () =>
    document.querySelector('[data-masters-track], [data-master-details], [data-master-count-word], [data-master-price-rows]');
  const needsPricing = () => document.querySelector('[data-price], [data-master-price-rows]');

  // Se llama al arrancar y después de insertar textos (que pueden traer marcadores
  // nuevos). Cada tabla se pide y se dibuja una sola vez; lo demás es applyDynamic().
  const requested = { masters: false, pricing: false };
  function loadNumbers() {
    if (!requested.masters && needsMasters()) {
      requested.masters = true;
      getMasters().then((data) => {
        if (!data) return;
        state.masters = data;
        renderMasters();
        renderMasterDetails();
        applyDynamic();
      });
    }
    if (!requested.pricing && needsPricing()) {
      requested.pricing = true;
      getPricing().then((data) => {
        if (!data) return;
        state.pricing = data;
        applyDynamic();
      });
    }
  }

  /* ---------- Másteres en el home (carrusel) ---------- */
  function renderMasters() {
    const track = document.querySelector('[data-masters-track]');
    if (!track || !state.masters) return;
    track.innerHTML = state.masters
      .map(
        (m, i) => `
      <article class="master-card" style="--card-accent:${accentFor(m, i)}">
        <span class="master-card-index">${String(i + 1).padStart(2, '0')}</span>
        <div>
          <h3>${esc(m.name)}</h3>
          <p class="master-card-desc">${esc(m.description)}</p>
        </div>
        <ul class="master-card-list">
          ${(m.topics || []).map((t) => `<li>${esc(typeof t === 'string' ? t : t.name)}</li>`).join('')}
        </ul>
      </article>`
      )
      .join('');
  }

  /* ---------- Detalle de todos los Másteres (propuesta académica) ----------
     Una sección por Máster: si se suma uno desde Núcleo, aparece solo. */
  function renderMasterDetails() {
    const container = document.querySelector('[data-master-details]');
    if (!container || !state.masters) return;
    const data = state.masters;

    container.innerHTML = data
      .map((m, i) => {
        const topics = (m.topics || [])
          .map((t) => {
            const name = typeof t === 'string' ? t : t.name;
            const desc = typeof t === 'string' ? '' : t.description || '';
            return `
              <div>
                <h3 class="h-md">${esc(name)}</h3>
                ${desc ? `<p class="body-md">${esc(desc)}</p>` : ''}
              </div>`;
          })
          .join('');
        return `
  <section class="section section-border-t">
    <div class="container">
      <div class="master-detail">
        <div class="master-detail-head">
          <span class="master-card-index" style="color:${accentFor(m, i)}">${String(i + 1).padStart(2, '0')}</span>
          <div>
            <h2 class="h-xl">${esc(m.name)}</h2>
            <p class="body-lg" style="margin-top:8px; max-width:60ch;">${esc(m.description)}</p>
          </div>
        </div>
        <div class="master-detail-grid">${topics}</div>
      </div>
    </div>
  </section>`;
      })
      .join('');

    // El listado de cursos para Google sigue siempre al catálogo real.
    const schemaEl = document.querySelector('script[data-course-schema]');
    if (schemaEl) {
      schemaEl.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Másteres de AVA',
        itemListElement: data.map((m, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Course',
            name: `Máster ${m.name}`,
            description: m.description,
            provider: { '@type': 'Organization', name: 'AVA', sameAs: 'https://aprendeconava.com/' },
          },
        })),
      });
    }
  }

  /* ---------- Preguntas frecuentes (suscripción) ---------- */
  async function loadFAQ() {
    const list = document.querySelector('[data-faq-list]');
    if (!list) return;
    try {
      const { data, error } = await supabaseClient.from('faq_items').select('question, answer').order('order_index', { ascending: true });
      if (error || !data || !data.length) return;

      list.innerHTML = data
        .map(
          (f, i) => `
        <div class="faq-item">
          <button type="button" class="faq-q" data-faq-toggle aria-expanded="false" aria-controls="faq-a-${i}">
            ${esc(f.question)}
            <span class="plus" aria-hidden="true"><svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
          </button>
          <div class="faq-a" id="faq-a-${i}"><p>${tokens(italics(f.answer))}</p></div>
        </div>`
        )
        .join('');
      window.avaBindFAQ && window.avaBindFAQ();
      loadNumbers();

      // El schema FAQPage coincide siempre con lo visible (requisito de Google).
      const schemaEl = document.querySelector('script[data-faq-schema]');
      if (schemaEl) {
        if (needsPricing()) {
          const pricing = await getPricing();
          if (pricing) state.pricing = pricing;
        }
        schemaEl.textContent = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: data.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: plain(f.answer) },
          })),
        });
      }
    } catch (e) {
      /* silencio: se queda el FAQ estático del HTML */
    }
  }

  /* ---------- Textos de todas las páginas ---------- */
  async function loadCopy() {
    try {
      const { data, error } = await supabaseClient.from('site_copy').select('key, value');
      if (error || !data) return;
      data.forEach((row) => { copy[row.key] = row.value == null ? '' : String(row.value); });
      applyCopy();
      applyCampus();
      loadNumbers();
      applyDynamic();
      // Los textos pueden traer el link del email principal: lo sincronizamos.
      window.avaApplyPrimaryEmail && window.avaApplyPrimaryEmail();
      // Aviso para los scripts que crean elementos por su cuenta (ej. WhatsApp).
      document.dispatchEvent(new CustomEvent('ava:copy'));
    } catch (e) {
      /* silencio: se queda el texto estático del HTML */
    }
  }

  loadCopy();
  loadFAQ();
  loadSocial();
  loadNumbers();
})();
