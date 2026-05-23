/* ============================================
   AURA — Utilities
   ============================================ */

/* ---------- TOAST ---------- */

const Toast = (() => {
  function show(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fa-solid ${icons[type]}"></i><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  return {
    success: (msg, dur) => show(msg, 'success', dur),
    error:   (msg, dur) => show(msg, 'error', dur),
    info:    (msg, dur) => show(msg, 'info', dur),
  };
})();

/* ---------- FORMAT ---------- */

function formatDate(dateString) {
  const date = new Date(dateString);
  const now  = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60)     return 'À l\'instant';
  if (diff < 3600)   return `${Math.floor(diff / 60)}min`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function formatCount(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace('.0', '') + 'K';
  return n?.toString() || '0';
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ---------- DOM HELPERS ---------- */

function $(selector, parent = document) {
  return parent.querySelector(selector);
}

function $$(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

function el(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') element.className = v;
    else if (k.startsWith('on'))
      element.addEventListener(k.slice(2).toLowerCase(), v);
    else element.setAttribute(k, v);
  });
  children.forEach(child => {
    if (typeof child === 'string') element.appendChild(document.createTextNode(child));
    else if (child) element.appendChild(child);
  });
  return element;
}

/* ---------- AVATAR PLACEHOLDER ---------- */

function getAvatarUrl(profile) {
  if (profile?.avatar_url) return profile.avatar_url;
  const name = encodeURIComponent(profile?.username || profile?.display_name || '?');
  return `https://ui-avatars.com/api/?name=${name}&background=7c3aed&color=fff&size=128&bold=true`;
}

/* ---------- COVER PLACEHOLDER ---------- */

const COVER_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80',
  'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&q=80',
  'https://images.unsplash.com/photo-1487537708073-aa096503b083?w=600&q=80',
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&q=80',
];

function getCoverUrl(url, index = 0) {
  if (url) return url;
  return COVER_PLACEHOLDERS[index % COVER_PLACEHOLDERS.length];
}

/* ---------- MOOD CONFIG ---------- */

const MOODS = {
  dark:  { label: 'Dark',  icon: 'fa-moon',         color: '#818cf8', gradient: 'linear-gradient(135deg,#1a1a2e,#16213e)' },
  chill: { label: 'Chill', icon: 'fa-snowflake',    color: '#06b6d4', gradient: 'linear-gradient(135deg,#0f2027,#203a43,#2c5364)' },
  rage:  { label: 'Rage',  icon: 'fa-fire',         color: '#ef4444', gradient: 'linear-gradient(135deg,#1a0000,#3d0000)' },
  focus: { label: 'Focus', icon: 'fa-bullseye',     color: '#a78bfa', gradient: 'linear-gradient(135deg,#0d0d1a,#1a0a2e)' },
  love:  { label: 'Love',  icon: 'fa-heart',        color: '#ec4899', gradient: 'linear-gradient(135deg,#1a0010,#2d0020)' },
  gym:   { label: 'Gym',   icon: 'fa-dumbbell',     color: '#f59e0b', gradient: 'linear-gradient(135deg,#1a1000,#2d1900)' },
  night: { label: 'Night', icon: 'fa-star',         color: '#c4b5fd', gradient: 'linear-gradient(135deg,#05051a,#0a0a2e)' },
};

function getMoodConfig(mood) {
  return MOODS[mood?.toLowerCase()] || MOODS.dark;
}

/* ---------- DEBOUNCE ---------- */

function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ---------- URL PARAMS ---------- */

function getParams() {
  return Object.fromEntries(new URLSearchParams(window.location.search));
}

/* ---------- LOADING OVERLAY ---------- */

function showLoading(text = 'Chargement...') {
  let overlay = document.getElementById('loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(5,5,8,0.85);
      backdrop-filter:blur(8px);z-index:9999;
      display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;
    `;
    overlay.innerHTML = `
      <div style="width:48px;height:48px;border:3px solid rgba(124,58,237,0.2);
        border-top-color:var(--violet);border-radius:50%;animation:spin 0.8s linear infinite;"></div>
      <span style="color:var(--text-secondary);font-size:14px;">${text}</span>
    `;
    document.body.appendChild(overlay);
  }
}

function hideLoading() {
  document.getElementById('loading-overlay')?.remove();
}

/* ---------- EXPORTS ---------- */

window.Toast     = Toast;
window.formatDate     = formatDate;
window.formatCount    = formatCount;
window.formatDuration = formatDuration;
window.$          = $;
window.$$         = $$;
window.el         = el;
window.getAvatarUrl     = getAvatarUrl;
window.getCoverUrl      = getCoverUrl;
window.MOODS            = MOODS;
window.getMoodConfig    = getMoodConfig;
window.debounce         = debounce;
window.getParams        = getParams;
window.showLoading      = showLoading;
window.hideLoading      = hideLoading;
