# Pendientes antes de publicar

## 1. Dominio — resuelto
El sitio ya usa tu dominio real, `https://aprendeconava.com/`, en canonical, og:url, sitemap.xml, robots.txt y los JSON-LD. Cuando conectes `campus.aprendeconava.com`, avisame para reemplazar el aviso temporal del botón "Acceder al Campus" por el link real.

Los siguientes puntos siguen siendo **placeholders sin confirmar** — los inventé para que el sitio se vea completo mientras lo revisás:

## 2. Email de contacto
Usé `hola@aprendeconava.com` en `contacto.html`, `privacidad.html` y los JSON-LD. En el FAQ de `suscripcion.html` vos misma pusiste `consultas.aprendeconava@gmail.com`. Definime cuál es el email oficial y lo dejo consistente en todos lados.

## 3. Redes sociales
En el footer de todas las páginas puse links genéricos (instagram.com/, linkedin.com/, facebook.com/) que no apuntan a ningún perfil real. Reemplazalos por los tuyos.

## 4. Checkout / pago
El Paso 2 del checkout simulado no está conectado a ningún procesador de pago real, tal como acordamos. Cuando quieras sumar PayPal (o el medio que definas), avisame.

## 5. Formularios y datos — ahora en Supabase
El formulario de contacto y el de interés de suscripción ya no usan Netlify Forms: guardan directo en la tabla "leads" de Supabase, y los administrás desde el panel Núcleo (sección Mensajes). Precios y catálogo de Másteres también se leen en vivo desde ahí — ver el README de Núcleo para el setup.

## 6. Foto de la fundadora
En sobre-ava.html uso el ícono del logo en lugar de una foto real, porque no tenía una tuya. Si me pasás una, la reemplazo.

## 7. Analytics (Google Analytics 4)
Dejé el código de GA4 insertado en las 6 páginas del sitio, pero comentado — no mide nada todavía. Pasame tu Measurement ID (G-XXXXXXXXXX) y lo activo, o buscá "G-XXXXXXXXXX" en cada .html y reemplazalo vos misma antes de descomentar el bloque.

## 8. SEO — resuelto en esta vuelta
- Títulos y descriptions recortados al largo que Google no trunca (50-60 / 150-160 caracteres)
- Imagen para compartir en redes (WhatsApp, LinkedIn, etc.) generada y conectada en las 6 páginas — antes no existía o usaba el ícono cuadrado del favicon
- Datos estructurados nuevos: preguntas frecuentes de Suscripción (para aparecer como desplegable en Google), listado de Másteres como cursos, y migas de pan en todas las páginas internas
- Los logos pesaban hasta 96KB mostrados a 40px de alto — los reduje a 7-14KB sin cambiar cómo se ven (afecta directo a la velocidad de carga)

## 9. Accesibilidad — resuelto en esta vuelta
El gris usado en textos chicos (pie de página, fechas, hints) no llegaba al mínimo de contraste WCAG AA. Lo aclaré (#63656E → #82858E) en el sitio y en Núcleo.

## 10. Legal
Agregué una página de Privacidad en lenguaje simple porque el sitio ahora guarda datos reales (nombre, email) en Supabase. No es un documento legal formal — si querés algo que cumpla estrictamente con la Ley de Protección de Datos Personales, conviene que lo redacte o revise un profesional.

## 11. Términos y condiciones — nuevo
Agregué /terminos.html porque el sitio promete una garantía de 15 días y describe qué incluye la suscripción, pero no había ningún documento que lo respalde formalmente. Mismo criterio que Privacidad: lenguaje simple, no reemplaza una revisión legal profesional.
