/* ============================================
   AURA — Player (Howler.js)
   Audio réel uniquement — pas de mode démo
   ============================================ */

const Player = (() => {

  let howl         = null;
  let currentTrack = null;
  let isPlaying    = false;
  let volume       = 0.8;
  let progressInterval = null;

  /* ---- DOM refs ---- */
  const dom = {};

  function getDom() {
    if (!dom.ready) {
      dom.player       = document.getElementById('player');
      dom.cover        = document.getElementById('player-cover');
      dom.title        = document.getElementById('player-title');
      dom.artist       = document.getElementById('player-artist');
      dom.playBtn      = document.getElementById('player-play');
      dom.progressFill = document.getElementById('player-progress-fill');
      dom.progressBar  = document.getElementById('player-progress-bar');
      dom.timeEl       = document.getElementById('player-time');
      dom.durationEl   = document.getElementById('player-duration');
      dom.volumeSlider = document.getElementById('player-volume');
      dom.ready        = true;
    }
    return dom;
  }

  /* ==========================================
     LOAD
  ========================================== */

  function load(track) {
    // Stop previous
    if (howl) {
      howl.stop();
      howl.unload();
      howl = null;
    }
    stopProgress();

    currentTrack = track;
    isPlaying    = false;

    // Guard — pas d'URL audio
    if (!track.audioUrl || track.audioUrl.trim() === '') {
      if (window.Toast) Toast.info('Aucun fichier audio disponible pour ce morceau.');
      return;
    }

    // UI
    const d = getDom();
    if (d.player) d.player.classList.remove('hidden-player');
    if (d.cover)  d.cover.src          = track.coverUrl || '';
    if (d.title)  d.title.textContent  = track.title    || '—';
    if (d.artist) d.artist.textContent = track.artist   || '—';
    if (d.playBtn) d.playBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    setProgress(0);

    // Floating player
    if (window.Layout) Layout.updateFloatingPlayer(track, false);

    // Howler
    howl = new Howl({
      src:     [track.audioUrl],
      html5:   true,
      volume,
      preload: true,

      onload() {
        howl.play();
      },

      onplay() {
        isPlaying = true;
        updatePlayBtn(true);
        startProgress();
        startVisualizer();
        if (window.Layout) Layout.setFloatingPlayIcon(true);
      },

      onpause() {
        isPlaying = false;
        updatePlayBtn(false);
        stopProgress();
        pauseVisualizer();
        if (window.Layout) Layout.setFloatingPlayIcon(false);
      },

      onstop() {
        isPlaying = false;
        updatePlayBtn(false);
        stopProgress();
        pauseVisualizer();
        setProgress(0);
        if (window.Layout) Layout.setFloatingPlayIcon(false);
      },

      onend() {
        isPlaying = false;
        updatePlayBtn(false);
        stopProgress();
        pauseVisualizer();
        setProgress(0);
        if (window.Layout) Layout.setFloatingPlayIcon(false);
      },

      onloaderror(id, err) {
        console.error('[Player] Erreur chargement:', err);
        updatePlayBtn(false);
        if (window.Toast) Toast.error('Impossible de charger ce fichier audio.');
      },

      onplayerror(id, err) {
        // Déverrouille le contexte audio mobile (iOS/Android)
        Howler.ctx?.resume().then(() => {
          if (howl) howl.play();
        });
      },
    });
  }

  /* ==========================================
     CONTROLS
  ========================================== */

  function togglePlay() {
    if (!howl) return;
    if (howl.playing()) howl.pause();
    else                howl.play();
  }

  function seek(ratio) {
    if (!howl) return;
    const dur = howl.duration();
    if (dur > 0) howl.seek(dur * ratio);
  }

  function setVolume(val) {
    volume = Math.max(0, Math.min(1, val));
    if (howl) howl.volume(volume);
    Howler.volume(volume);
  }

  /* ==========================================
     PROGRESS
  ========================================== */

  function startProgress() {
    stopProgress();
    progressInterval = setInterval(() => {
      if (!howl || !howl.playing()) return;
      const current = howl.seek()     || 0;
      const total   = howl.duration() || 1;
      const pct     = Math.min(100, (current / total) * 100);

      setProgress(pct);

      const d = getDom();
      if (d.timeEl)     d.timeEl.textContent     = formatDuration(current);
      if (d.durationEl) d.durationEl.textContent = formatDuration(total);
      if (window.Layout) Layout.setFloatingProgress(pct);
    }, 300);
  }

  function stopProgress() {
    if (progressInterval) { clearInterval(progressInterval); progressInterval = null; }
  }

  function setProgress(pct) {
    const d = getDom();
    if (d.progressFill) d.progressFill.style.width = `${pct}%`;
  }

  /* ==========================================
     VISUALIZER
  ========================================== */

  function startVisualizer() {
    document.querySelectorAll('.visualizer-bar').forEach(b => b.classList.remove('paused'));
  }

  function pauseVisualizer() {
    document.querySelectorAll('.visualizer-bar').forEach(b => b.classList.add('paused'));
  }

  /* ==========================================
     UI
  ========================================== */

  function updatePlayBtn(playing) {
    const d = getDom();
    if (d.playBtn) d.playBtn.innerHTML = playing
      ? '<i class="fa-solid fa-pause"></i>'
      : '<i class="fa-solid fa-play"></i>';
  }

  /* ==========================================
     INIT
  ========================================== */

  function init() {
    const d = getDom();
    if (!d.player) return;

    d.playBtn?.addEventListener('click', togglePlay);

    d.progressBar?.addEventListener('click', e => {
      const rect  = d.progressBar.getBoundingClientRect();
      seek((e.clientX - rect.left) / rect.width);
    });

    d.volumeSlider?.addEventListener('input', e => setVolume(parseFloat(e.target.value)));
    if (d.volumeSlider) d.volumeSlider.value = volume;
  }

  return {
    load,
    togglePlay,
    seek,
    setVolume,
    init,
    get isPlaying()    { return isPlaying; },
    get currentTrack() { return currentTrack; },
  };

})();

window.Player = Player;
