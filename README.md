# AVA — Sitio institucional

Sitio estático (HTML + CSS + JS, sin build ni frameworks) conectado a Supabase. Todo lo que se ve —textos, precios, Másteres, preguntas frecuentes, reseñas, WhatsApp, emails y redes— se edita desde **Núcleo**. El HTML trae una copia de cada texto: si la base no responde, el sitio se ve igual con esa copia.

## Estructura

```
/
├── index.html                 Inicio
├── sobre-ava.html             Sobre AVA y la fundadora
├── propuesta-academica.html   Másteres, principios y certificación
├── suscripcion.html           Plan, desglose de precios, lista de espera y preguntas frecuentes
├── resenas.html               Reseñas aprobadas y formulario para dejar una
├── contacto.html              Formulario, WhatsApp, emails y redes
├── privacidad.html            Política de privacidad (texto editable desde Núcleo)
├── terminos.html              Términos y condiciones (texto editable desde Núcleo)
├── arrepentimiento.html       Botón de arrepentimiento (formulario sin registro, con código)
├── baja.html                  Botón de baja de servicio (formulario sin registro, con código)
├── 404.html
├── robots.txt · sitemap.xml
├── netlify.toml               Seguridad del sitio (ver abajo)
├── css/
│   ├── base.css               Colores, tipografía, botones (compartido con Núcleo)
│   ├── components.css         Menú, pie, tarjetas, formularios, textos editables
│   ├── hero.css               Portada del inicio
│   └── inner.css              Páginas internas
├── js/
│   ├── supabase-client.js     Conexión con la base
│   ├── site-data.js           Textos, precios, Másteres y preguntas desde la base
│   ├── main.js                Menú, animaciones, carruseles, aviso del Campus
│   ├── hero-motif.js          Animación del isotipo en la portada
│   ├── faq.js                 Preguntas frecuentes desplegables
│   ├── waitlist.js            Lista de espera
│   ├── contact-form.js        Formulario de contacto
│   ├── testimonials.js        Carrusel y formulario de reseñas
│   ├── consumer-request.js    Pedidos de arrepentimiento y de baja
│   ├── whatsapp-widget.js     Botón flotante y números por área
│   └── email-widget.js        Emails por área y email principal
└── assets/                    Logos, favicons e imagen para compartir en redes
```

## Cómo se conectan los textos con Núcleo

Cada texto del HTML tiene una marca con su clave en la base (tabla `site_copy`):

- `data-copy="clave"`: una línea o un párrafo.
- `data-copy-block="clave"`: varios párrafos (renglón vacío = párrafo nuevo, `## ` = título, `- ` = lista).
- `data-copy-list="clave"`: un ítem por renglón (beneficios del plan).
- `data-copy-options="clave"`: opciones de un desplegable (motivos de contacto).
- `data-copy-placeholder="clave"`: texto de ejemplo dentro de un campo.

Estados de inscripción (Suscripción): el CRM dice si las inscripciones están abiertas y si queda lugar (`crm_enrollment_status`, sin el número del cupo). Los textos con `data-copy-state="clave"` cambian de clave según el estado: cerradas usa `waitlist_title` y `waitlist_intro`; abiertas, `waitlist_open_title` y `waitlist_open_intro`; con el cupo completo, `waitlist_full_title` y `waitlist_full_intro`. Lo marcado con `data-raffle-only` (la casilla del sorteo) se oculta después de la apertura, porque quien se anota después ya no participa.

Precio en pesos: `data-ars-note` muestra `plan_ars_note` con `{pesos}` (precio anual en pesos al dólar blue, calculado por el CRM con `crm_public_prices`) y `{cotizacion}`. Mientras ese texto esté vacío en Núcleo, no se muestra.

En cualquier texto se pueden usar `{cantidad}` / `{Cantidad}` (cantidad de Másteres en palabras), `{garantia}` (días de garantía) y `{anio}` (año actual), y `*texto*` para cursiva. Un campo vacío en Núcleo oculta ese texto en el sitio (salvo los obligatorios, como botones y etiquetas de formularios).

Lo único que no se edita desde Núcleo son los títulos y descripciones para Google y redes (`<title>`, `description`, `og:`): los buscadores y WhatsApp/LinkedIn leen el HTML sin ejecutar código, así que cambiarlos desde la base no tendría efecto real en cómo se ve el link compartido.

## Cómo subirlo (GitHub + Netlify)

1. En el repositorio de GitHub del sitio, reemplazá los archivos por el contenido de esta carpeta (lo de adentro, no la carpeta).
2. Netlify publica solo al detectar el cambio. Build command vacío, publish directory `.`.
3. Los textos que editaste en Núcleo **no se pisan** al subir una versión nueva: viven en la base, no en el HTML.

## Seguridad (netlify.toml)

El sitio le indica al navegador que solo acepte código y conexiones de su propio dominio, de Supabase, de Google Fonts y del CDN de la librería de Supabase. Si algún día sumás Google Analytics, un píxel o un chat externo, hay que agregar su dominio en la línea `Content-Security-Policy` de `netlify.toml`; si no, el navegador lo va a bloquear. `README.md` no se publica (devuelve 404).

## Botón de arrepentimiento y botón de baja (Disposición 954/2025)

Los dos links están en una franja arriba de todo, en todas las páginas (se ven en el primer acceso) y también en el pie. Cada página tiene un formulario sin registro: al enviarlo, la persona ve al instante el código de su pedido (`ARR-XXXXXX` o `BAJ-XXXXXX`). El pedido llega a Núcleo → Mensajes, donde hay que confirmarlo por email dentro de las 24 horas con el botón "Enviar confirmación por email" (el email sale redactado con el código) y después marcarlo como confirmado.

## Antes de abrir inscripciones

- **Pago**: conectar PayPal y Mercado Pago (se paga en sus sitios; AVA no recibe datos de tarjetas). Lo que ya prometen los Términos y hay que cumplir al conectarlo: casilla para aceptar los Términos antes de pagar, precio total, cantidad y monto de cuotas (y CFT/TEA si hubiera interés) antes de confirmar, email de confirmación con link a los Términos, y aviso por email al menos 15 días antes de cada renovación automática.
- **Casilla de privacidad**: contacto, lista de espera y reseñas tienen una casilla obligatoria (texto editable en Núcleo → Contenido del sitio → Textos generales → Formularios). En la base queda guardado que la persona la marcó (`privacy_consent`). Arrepentimiento y baja no llevan casilla, porque la Disposición 954/2025 no permite sumarles requisitos: tienen un aviso.
- **Datos de quien presta el servicio**: cargar el CUIT y un domicilio para notificaciones en Núcleo → Contenido del sitio → Términos y condiciones → Quién presta el servicio (mientras estén vacíos, no se muestran; se ven en Términos y en Privacidad).
- **Campus**: cuando exista, cargar su link en Núcleo → Contenido del sitio → Textos generales → Campus. Mientras esté vacío, el botón avisa que todavía no abrió.
- **Dominio**: canonical, sitemap y datos para Google ya usan `https://aprendeconava.com`; falta conectar el dominio en Netlify.
