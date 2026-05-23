/* ============================================
   AURA — Supabase Configuration
   ============================================
   Remplacez les valeurs ci-dessous par vos
   propres clés Supabase depuis :
   https://app.supabase.com → Settings → API
   ============================================ */
// Configuration Supabase
const SUPABASE_URL = window.ENV?.SUPABASE_URL || 'https://yhmkphqyicsydyhdhxmw.supabase.co';
const SUPABASE_ANON_KEY = window.ENV?.SUPABASE_ANON_KEY || 'sb_publishable_z4hE-k7dN6NrvGkqm0muUA_hVHd3RZz';

// Import depuis CDN (chargé dans chaque page HTML)
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

let supabaseClient = null;

/**
 * Initialise et retourne le client Supabase
 * @returns {Object} Client Supabase
 */
function getSupabase() {
  if (!supabaseClient) {
    if (typeof supabase === 'undefined') {
      console.error('❌ Supabase SDK non chargé. Vérifiez le script CDN dans votre HTML.');
      return null;
    }
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'aura-auth',
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  return supabaseClient;
}

// Export global
window.getSupabase = getSupabase;
window.SUPABASE_URL = SUPABASE_URL;
