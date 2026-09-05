// ============================================================
// NÚCLEO — Cliente de Supabase (compartido por todo el panel)
// ============================================================
// Este proyecto se conecta al mismo Supabase que usa el sitio público
// de AVA. La clave "anon" es pública por diseño: la seguridad real la
// dan las políticas de RLS configuradas en la base (lectura pública,
// escritura solo para usuarios autenticados).

const SUPABASE_URL = 'https://mryuhzpenzpyhfidwsup.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yeXVoenBlbnpweWhmaWR3c3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxODExNDcsImV4cCI6MjEwMjc1NzE0N30.SevGerh6JTDIz67EeWxiADed-sUkIDy3NoFrOqmvgfI';

// Si el CDN de Supabase no llegó a cargar (red lenta, bloqueador, etc.)
// dejamos supabaseClient sin definir en vez de romper el resto de la página.
// Todo el código que lo usa ya chequea "typeof supabaseClient !== 'undefined'" antes.
let supabaseClient;
try {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
  console.warn('No se pudo inicializar Supabase (¿falló la carga del CDN?). El sitio sigue funcionando con el contenido estático.');
}
