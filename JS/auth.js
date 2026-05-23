/* ============================================
   AURA — Auth Manager
   ============================================ */

const Auth = (() => {
  let currentUser = null;
  let currentProfile = null;

  /* ---------- SESSION ---------- */

  async function getSession() {
    const sb = getSupabase();
    const { data: { session } } = await sb.auth.getSession();
    return session;
  }

  async function getCurrentUser() {
    if (currentUser) return currentUser;
    const sb = getSupabase();
    const { data: { user } } = await sb.auth.getUser();
    currentUser = user;
    return user;
  }

  async function getCurrentProfile() {
    if (currentProfile) return currentProfile;
    const user = await getCurrentUser();
    if (!user) return null;
    const sb = getSupabase();
    const { data } = await sb
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    currentProfile = data;
    return data;
  }

  function clearCache() {
    currentUser = null;
    currentProfile = null;
  }

  /* ---------- REGISTER ---------- */

  async function register({ email, password, username, displayName }) {
    const sb = getSupabase();

    // Vérifier unicité username
    const { data: existing } = await sb
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (existing) throw new Error('Ce username est déjà pris.');

    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: displayName || username },
      },
    });

    if (error) throw error;
    return data;
  }

  /* ---------- LOGIN ---------- */

  async function login({ email, password }) {
    const sb = getSupabase();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    currentUser = data.user;
    return data;
  }

  /* ---------- LOGOUT ---------- */

  async function logout() {
    const sb = getSupabase();
    clearCache();
    const { error } = await sb.auth.signOut();
    if (error) throw error;
    window.location.href = '/aura/pages/login.html';
  }

  /* ---------- GUARD ---------- */

  /**
   * Protège une page : redirige vers login si non connecté
   * @returns {Object} session
   */
  async function requireAuth() {
    const session = await getSession();
    if (!session) {
      window.location.href = 'login.html';
      return null;
    }
    return session;
  }

  /**
   * Sur les pages auth : redirige vers home si déjà connecté
   */
  async function redirectIfLoggedIn() {
    const session = await getSession();
    if (session) {
      window.location.href = '/pages/home.html';
    }
  }

  /* ---------- AUTH STATE CHANGE ---------- */

  function onAuthChange(callback) {
    const sb = getSupabase();
    return sb.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') clearCache();
      callback(event, session);
    });
  }

  return {
    getSession,
    getCurrentUser,
    getCurrentProfile,
    clearCache,
    register,
    login,
    logout,
    requireAuth,
    redirectIfLoggedIn,
    onAuthChange,
  };
})();

window.Auth = Auth;
