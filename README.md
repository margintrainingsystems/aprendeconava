# Academia AVA — Sitio institucional

Sitio estático (HTML + CSS + JS, sin build ni frameworks) para aprendeconava.com.

## Estructura

```
/
├── index.html                 Inicio
├── sobre-ava.html              Sobre AVA + Fundadora
├── propuesta-academica.html    Másteres, metodología, certificación
├── suscripcion.html            Plan, checkout simulado, FAQ
├── contacto.html               Formulario de contacto
├── 404.html
├── robots.txt
├── sitemap.xml
├── netlify.toml
├── css/
│   ├── base.css                Tokens de marca (color, tipografía, botones)
│   ├── components.css          Nav, footer, tarjetas, shelf de Másteres
│   ├── hero.css                Hero y motivo geométrico animado
│   └── inner.css                Páginas internas (fundadora, plan, checkout, contacto)
├── js/
│   ├── main.js                  Nav mobile, animaciones al hacer scroll, toasts
│   ├── hero-motif.js            Ensamblado animado del isotipo en el hero
│   ├── checkout.js              Pasos del checkout simulado
│   ├── faq.js                   Acordeón de preguntas frecuentes
│   └── contact-form.js          Envío del formulario de contacto
└── assets/
    ├── logo/                    Los 6 archivos de logo que enviaste
    └── favicon-*.png
```

## Cómo subirlo (GitHub drag-and-drop + Netlify)

1. **GitHub**: creá un repositorio nuevo (puede ser privado). Entrá a la página del repo vacío y usá la opción "uploading an existing file" — arrastrá **todo el contenido de esta carpeta** (no la carpeta en sí, sino lo que está adentro) y confirmá el commit.
2. **Netlify**: "Add new site" → "Import an existing project" → conectá GitHub → elegí el repositorio.
   - Build command: dejalo vacío.
   - Publish directory: `.` (la raíz).
   - Netlify va a detectar solo los formularios (`suscripcion.html` y `contacto.html` los tienen marcados con `data-netlify="true"`).
3. Una vez desplegado, andá a **Site settings → Forms** en Netlify para ver los leads que entren por el checkout y por contacto, o configurá una notificación por email desde ahí.
4. Dominio: en **Domain settings**, agregá `aprendeconava.com` (o el dominio que hayas registrado) y seguí los pasos de DNS que te indique Netlify.

## Pendientes antes de publicar (ver PENDIENTES.md)

Hay contenido de placeholder (email, redes sociales, dominio) que armé para que el sitio se vea completo, pero **no está confirmado como real**. Están listados con el archivo y la línea exacta en `PENDIENTES.md`.

## Sobre el checkout de suscripción

Tal como pediste, el flujo de suscripción está armado como si funcionara de punta a punta (datos → pago → confirmación), pero:
- Los campos de tarjeta (número, vencimiento, CVV) son **solo visuales**: no tienen atributo `name`, así que nunca se envían a ningún lado.
- Los datos del Paso 1 (nombre, email, país) sí se guardan como lead real a través de Netlify Forms, para que tengas registro de quién mostró intención de suscribirse.
- Cuando quieras conectar un cobro real (PayPal, etc.), avisame y lo integramos ahí.

## Campus

El botón "Acceder al Campus" todavía no lleva a ningún lado real: muestra un aviso ("Todavía no está activo..."). Cuando el campus esté armado como sitio aparte, hay que reemplazar ese comportamiento por el link real en `js/main.js` (buscá `data-campus-link`) y en cada `<a data-campus-link>` del HTML.
