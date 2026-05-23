/* ============================================
   AURA — Layout Component v2
   Sidebar · Topbar · Player · Mobile Nav
   Floating draggable mini-player on mobile
   ============================================ */

const Layout = (() => {

  /* ========== RENDER HELPERS ========== */

  function renderSidebar(activePage = '') {
    const navItems = [
      { page: 'home',     icon: 'fa-house',             label: 'Home',      href: 'home.html' },
      { page: 'search',   icon: 'fa-magnifying-glass',  label: 'Recherche', href: 'search.html' },
      { page: 'upload',   icon: 'fa-circle-plus',       label: 'Publier',   href: 'upload.html' },
      { page: 'playlist', icon: 'fa-layer-group',       label: 'Playlists', href: 'playlist.html' },
      { page: 'profile',  icon: 'fa-user',              label: 'Profil',    href: 'profile.html' },
      { page: 'settings', icon: 'fa-gear',              label: 'Réglages',  href: 'settings.html' },
    ];

    return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <div class="logo-text">AURA</div>
        <div class="logo-tagline">Your Musical Identity</div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section">
          <div class="nav-section-label">Navigation</div>
          ${navItems.slice(0, 3).map(item => `
            <a href="${item.href}" class="nav-link ${activePage === item.page ? 'active' : ''}">
              <i class="fa-solid ${item.icon}"></i>
              <span>${item.label}</span>
            </a>
          `).join('')}
        </div>
        <div class="nav-section">
          <div class="nav-section-label">Bibliothèque</div>
          ${navItems.slice(3).map(item => `
            <a href="${item.href}" class="nav-link ${activePage === item.page ? 'active' : ''}">
              <i class="fa-solid ${item.icon}"></i>
              <span>${item.label}</span>
            </a>
          `).join('')}
        </div>
      </nav>
      <div class="sidebar-user" id="sidebar-user-card"
           onclick="window.location.href='profile.html'">
        <img class="sidebar-avatar" id="sidebar-avatar" src="" alt="avatar">
        <div class="sidebar-user-info">
          <div class="sidebar-username" id="sidebar-username">...</div>
          <div class="sidebar-handle"   id="sidebar-handle">@...</div>
        </div>
        <button class="btn-ghost btn-icon"
                onclick="event.stopPropagation(); Auth.logout();"
                title="Déconnexion">
          <i class="fa-solid fa-arrow-right-from-bracket" style="font-size:14px;"></i>
        </button>
      </div>
    </aside>`;
  }

  function renderTopbar() {
    return `
    <header class="topbar" id="topbar">
      <button class="topbar-icon-btn" id="menu-toggle"
              style="display:none;" onclick="Layout.toggleSidebar()">
        <i class="fa-solid fa-bars"></i>
      </button>
      <div class="topbar-search">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" class="topbar-search-input"
               placeholder="Chercher un artiste, titre, profil..."
               id="topbar-search-input" autocomplete="off">
      </div>
      <div class="topbar-actions">
        <div class="topbar-icon-btn" title="Notifications">
          <i class="fa-solid fa-bell"></i>
          <span class="badge"></span>
        </div>
        <img id="topbar-avatar" src="" alt="avatar"
             style="width:34px;height:34px;border-radius:50%;object-fit:cover;
                    cursor:pointer;border:2px solid var(--violet);"
             onclick="window.location.href='profile.html'">
      </div>
    </header>`;
  }

  /* Desktop full-bar player */
  function renderPlayer() {
    return `
    <div id="player" class="hidden-player">
      <div class="player-track">
        <img id="player-cover" class="player-cover" src="" alt="cover">
        <div class="player-info">
          <div class="player-title"  id="player-title">—</div>
          <div class="player-artist" id="player-artist">—</div>
        </div>
      </div>

      <div class="player-controls">
        <div class="player-buttons">
          <div class="player-btn" title="Précédent">
            <i class="fa-solid fa-backward-step"></i>
          </div>
          <div class="player-btn player-btn-play" id="player-play"
               onclick="Player.togglePlay()">
            <i class="fa-solid fa-play"></i>
          </div>
          <div class="player-btn" title="Suivant">
            <i class="fa-solid fa-forward-step"></i>
          </div>
        </div>
        <div class="player-progress">
          <span class="player-time" id="player-time">0:00</span>
          <div class="progress-bar" id="player-progress-bar">
            <div class="progress-fill" id="player-progress-fill"></div>
          </div>
          <span class="player-time" id="player-duration">0:00</span>
        </div>
      </div>

      <div class="player-right">
        <div class="visualizer">
          <div class="visualizer-bar paused" style="height:8px;"></div>
          <div class="visualizer-bar paused" style="height:16px;"></div>
          <div class="visualizer-bar paused" style="height:12px;"></div>
          <div class="visualizer-bar paused" style="height:20px;"></div>
          <div class="visualizer-bar paused" style="height:10px;"></div>
        </div>
        <div class="volume-control">
          <i class="fa-solid fa-volume-high"
             style="color:var(--text-muted);font-size:13px;"></i>
          <input type="range" class="volume-slider" id="player-volume"
                 min="0" max="1" step="0.05" value="0.8">
        </div>
      </div>
    </div>`;
  }

  /* Mobile floating draggable pill */
  function renderFloatingPlayer() {
    return `
    <div id="floating-player" class="fp-hidden">
      <img class="fp-cover" id="fp-cover"
           src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect fill='%23141424' width='40' height='40' rx='8'/%3E%3Ctext x='50%25' y='55%25' text-anchor='middle' dominant-baseline='middle' font-size='18'%3E🎵%3C/text%3E%3C/svg%3E"
           alt="cover">
      <div class="fp-info">
        <div class="fp-title"  id="fp-title">Aucun morceau</div>
        <div class="fp-artist" id="fp-artist">—</div>
      </div>
      <button class="fp-play" id="fp-play-btn" onclick="Player.togglePlay()">
        <i class="fa-solid fa-play" id="fp-play-icon"></i>
      </button>
      <!-- Progress mini bar -->
      <div class="fp-progress">
        <div class="fp-progress-fill" id="fp-progress-fill"></div>
      </div>
    </div>`;
  }

  function renderMobileNav(activePage = '') {
    const items = [
      { page: 'home',     icon: 'fa-house',            label: 'Home',    href: 'home.html' },
      { page: 'search',   icon: 'fa-magnifying-glass', label: 'Explore', href: 'search.html' },
      { page: 'upload',   icon: 'fa-circle-plus',      label: 'Post',    href: 'upload.html' },
      { page: 'playlist', icon: 'fa-layer-group',      label: 'Library', href: 'playlist.html' },
      { page: 'profile',  icon: 'fa-user',             label: 'Profil',  href: 'profile.html' },
    ];
    return `
    <nav class="mobile-nav" id="mobile-nav">
      <div class="mobile-nav-inner">
        ${items.map(item => `
          <a href="${item.href}"
             class="mobile-nav-item ${activePage === item.page ? 'active' : ''}">
            <i class="fa-solid ${item.icon}"></i>
            <span>${item.label}</span>
          </a>
        `).join('')}
      </div>
    </nav>`;
  }

  /* ========== INJECT ALL ========== */

  function inject(options = {}) {
    const { page = '' } = options;

    const mounts = {
      'sidebar-mount':    renderSidebar(page),
      'topbar-mount':     renderTopbar(),
      'player-mount':     renderPlayer(),
      'mobile-nav-mount': renderMobileNav(page),
      'toast-mount':      '<div id="toast-container"></div>',
    };

    Object.entries(mounts).forEach(([id, html]) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    });

    // Inject floating player directly into body
    if (!document.getElementById('floating-player')) {
      document.body.insertAdjacentHTML('beforeend', renderFloatingPlayer());
    }

    // Show hamburger on mobile
    if (window.innerWidth <= 768) {
      const toggle = document.getElementById('menu-toggle');
      if (toggle) toggle.style.display = 'flex';
    }

    // Topbar search → search page
    const searchInput = document.getElementById('topbar-search-input');
    if (searchInput) {
      searchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && e.target.value.trim()) {
          window.location.href = `search.html?q=${encodeURIComponent(e.target.value.trim())}`;
        }
      });
    }

    // Init desktop player + floating player
    setTimeout(() => {
      if (window.Player) Player.init();
      initFloatingPlayer();
    }, 60);
  }

  /* ========== FLOATING PLAYER DRAG ========== */

  function initFloatingPlayer() {
    const fp = document.getElementById('floating-player');
    if (!fp) return;

    let isDragging = false;
    let startX, startY, startLeft, startTop;
    let hasMoved = false;

    /* Touch start */
    fp.addEventListener('touchstart', e => {
      // Don't drag if tapping the play button
      if (e.target.closest('#fp-play-btn')) return;

      isDragging = true;
      hasMoved   = false;
      fp.classList.add('dragging');

      const touch = e.touches[0];
      const rect  = fp.getBoundingClientRect();

      startX    = touch.clientX;
      startY    = touch.clientY;
      startLeft = rect.left;
      startTop  = rect.top;

      e.preventDefault();
    }, { passive: false });

    /* Touch move */
    fp.addEventListener('touchmove', e => {
      if (!isDragging) return;
      const touch = e.touches[0];

      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true;

      let newLeft = startLeft + dx;
      let newTop  = startTop  + dy;

      // Keep inside viewport
      const W = window.innerWidth;
      const H = window.innerHeight;
      const W_fp = fp.offsetWidth;
      const H_fp = fp.offsetHeight;

      newLeft = Math.max(8, Math.min(W - W_fp - 8, newLeft));
      newTop  = Math.max(8, Math.min(H - H_fp - 8, newTop));

      // Switch from bottom/right to absolute coords
      fp.style.right  = 'auto';
      fp.style.bottom = 'auto';
      fp.style.left   = newLeft + 'px';
      fp.style.top    = newTop  + 'px';

      e.preventDefault();
    }, { passive: false });

    /* Touch end */
    fp.addEventListener('touchend', e => {
      isDragging = false;
      fp.classList.remove('dragging');
      // Snap to nearest edge horizontally
      snapToEdge(fp);
    });

    /* Mouse drag (desktop fallback, hidden anyway) */
    fp.addEventListener('mousedown', e => {
      if (e.target.closest('#fp-play-btn')) return;
      isDragging = true;
      hasMoved   = false;
      fp.classList.add('dragging');

      const rect = fp.getBoundingClientRect();
      startX    = e.clientX;
      startY    = e.clientY;
      startLeft = rect.left;
      startTop  = rect.top;
      e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true;

      let newLeft = startLeft + dx;
      let newTop  = startTop  + dy;

      const W    = window.innerWidth;
      const H    = window.innerHeight;
      const W_fp = fp.offsetWidth;
      const H_fp = fp.offsetHeight;

      newLeft = Math.max(8, Math.min(W - W_fp - 8, newLeft));
      newTop  = Math.max(8, Math.min(H - H_fp - 8, newTop));

      fp.style.right  = 'auto';
      fp.style.bottom = 'auto';
      fp.style.left   = newLeft + 'px';
      fp.style.top    = newTop  + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      fp.classList.remove('dragging');
      snapToEdge(fp);
    });
  }

  /* Snap the pill to the nearest left or right edge */
  function snapToEdge(fp) {
    const rect   = fp.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const W      = window.innerWidth;

    fp.style.transition = 'left 0.25s cubic-bezier(0.34,1.56,0.64,1), top 0.1s ease';

    if (center < W / 2) {
      // Snap left
      fp.style.left  = '12px';
    } else {
      // Snap right
      fp.style.left  = (W - fp.offsetWidth - 12) + 'px';
    }

    setTimeout(() => { fp.style.transition = ''; }, 300);
  }

  /* ========== UPDATE FLOATING PLAYER ========== */

  function updateFloatingPlayer(track, isPlaying) {
    const fp = document.getElementById('floating-player');
    if (!fp) return;

    // Show
    fp.classList.remove('fp-hidden');

    const cover  = document.getElementById('fp-cover');
    const title  = document.getElementById('fp-title');
    const artist = document.getElementById('fp-artist');
    const icon   = document.getElementById('fp-play-icon');

    if (cover && track.coverUrl) {
      cover.src = track.coverUrl;
      cover.onerror = () => {
        cover.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect fill='%23141424' width='40' height='40' rx='8'/%3E%3Ctext x='50%25' y='55%25' text-anchor='middle' dominant-baseline='middle' font-size='18'%3E🎵%3C/text%3E%3C/svg%3E";
      };
    }
    if (title)  title.textContent  = track.title  || '—';
    if (artist) artist.textContent = track.artist || '—';
    if (icon)   icon.className     = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
  }

  function setFloatingProgress(pct) {
    const fill = document.getElementById('fp-progress-fill');
    if (fill) fill.style.width = `${Math.min(100, pct)}%`;
  }

  function setFloatingPlayIcon(isPlaying) {
    const icon = document.getElementById('fp-play-icon');
    if (icon) icon.className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
  }

  /* ========== POPULATE USER ========== */

  async function populateUser() {
    try {
      const profile = await Auth.getCurrentProfile();
      if (!profile) return;

      const avatarUrl = getAvatarUrl(profile);

      const sidebarAvatar   = document.getElementById('sidebar-avatar');
      const sidebarUsername = document.getElementById('sidebar-username');
      const sidebarHandle   = document.getElementById('sidebar-handle');
      const topbarAvatar    = document.getElementById('topbar-avatar');

      if (sidebarAvatar)   sidebarAvatar.src           = avatarUrl;
      if (sidebarUsername) sidebarUsername.textContent = profile.display_name || profile.username;
      if (sidebarHandle)   sidebarHandle.textContent   = `@${profile.username}`;
      if (topbarAvatar)    topbarAvatar.src             = avatarUrl;

      applyMoodTheme(profile.current_mood);
    } catch (e) {
      console.warn('Layout.populateUser error:', e);
    }
  }

  /* ========== MOOD THEME ========== */

  function applyMoodTheme(mood) {
    if (!mood) return;
    const config = getMoodConfig(mood);
    document.documentElement.style.setProperty('--mood-current', config.color);
    document.documentElement.style.setProperty('--mood-gradient', config.gradient);
  }

  /* ========== SIDEBAR TOGGLE ========== */

  function injectSidebarOverlay() {
    if (document.getElementById('sidebar-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'sidebar-overlay';
    Object.assign(overlay.style, {
      display:        'none',
      position:       'fixed',
      inset:          '0',
      background:     'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(2px)',
      zIndex:         '299',
      cursor:         'pointer',
    });
    overlay.addEventListener('click', toggleSidebar);
    document.body.appendChild(overlay);
  }

  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar) return;
    const isOpen = sidebar.classList.toggle('open');
    if (overlay) overlay.style.display = isOpen ? 'block' : 'none';
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  /* ========== FULL INIT ========== */

  async function init(options = {}) {
    inject(options);
    injectSidebarOverlay();
    const session = await Auth.requireAuth();
    if (!session) return null;
    await populateUser();
    return session;
  }

  return {
    inject,
    init,
    populateUser,
    applyMoodTheme,
    toggleSidebar,
    injectSidebarOverlay,
    updateFloatingPlayer,
    setFloatingProgress,
    setFloatingPlayIcon,
  };
})();

window.Layout = Layout;
