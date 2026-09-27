// ============================================================
// AVA — Cliente de Supabase del sitio público
// ============================================================
// Es la misma base que usa Núcleo. La clave "anon" es pública por diseño:
// la seguridad real la dan las políticas de RLS de la base (lectura pública
// del contenido; los formularios solo pueden crear mensajes y reseñas
// pendientes; editar cualquier cosa queda reservado a la cuenta admin).

const SUPABASE_URL = 'https://mryuhzpenzpyhfidwsup.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yeXVoenBlbnpweWhmaWR3c3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxODExNDcsImV4cCI6MjEwMjc1NzE0N30.SevGerh6JTDIz67EeWxiADed-sUkIDy3NoFrOqmvgfI';

// Si el CDN de Supabase no llegó a cargar (red lenta, bloqueador, etc.)
// dejamos supabaseClient sin definir en vez de romper el resto de la página.
// Todo el código que lo usa ya chequea "typeof supabaseClient !== 'undefined'" antes.
let supabaseClient;
try {
  // El sitio público no inicia sesión: sin sesión guardada, el navegador no almacena nada.
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
} catch (e) {
  console.warn('No se pudo inicializar Supabase (¿falló la carga del CDN?). El sitio sigue funcionando con el contenido estático.');
}
