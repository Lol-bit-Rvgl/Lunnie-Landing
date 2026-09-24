/* ============================================================
   LUNNIE ♡ — discord-widget.js
   WS-free embed: estado de Discord en vivo vía Lanyard API
   (https://github.com/Phineas/lanyard | api.lanyard.rest)

   CONFIGURACIÓN:
   → Escribe abajo tu Discord User ID. Si lo dejas vacío o con
     valor de ejemplo, el widget mostrará un fallback elegante.

   Depende del contenedor #discord-widget en el HTML.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- CONFIG ---------- */
  const DISCORD_ID = '123456789012345678'; // TODO: pon tu Discord ID aquí
  const POLL_MS = 30000;                   // re-consulta cada 30s
  const CDN = 'https://cdn.discordapp.com';

  /* ---------- estado ---------- */
  let timer = null;

  /* ---------- helpers visuales ---------- */
  const $ = (sel) => document.getElementById(sel);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  const STATUS_META = {
    online:  { label: 'ONLINE',    cls: 'st-online',  color: '#00ff9f' },
    idle:    { label: 'INACTIVO',  cls: 'st-idle',    color: '#ffbf00' },
    dnd:     { label: 'NO MOLESTAR', cls: 'st-dnd',   color: '#c0236b' },
    offline: { label: 'OFFLINE',   cls: 'st-offline', color: '#41434f' }
  };

  const isValidId = (id) => /^\d{17,20}$/.test(String(id));

  function resolveAvatar(user) {
    if (user.avatar) {
      return `${CDN}/avatars/${user.id}/${user.avatar}.png?size=128`;
    }
    // Avatar por defecto de Discord (índice derivado del id)
    const idx = 1 + ((Number(user.id) >> 22) % 5);
    return `${CDN}/embed/avatars/${idx}.png`;
  }

  /* Encuentra una actividad "interesante": juego > spotify > otra */
  function pickActivity(activities) {
    if (!Array.isArray(activities)) return null;
    const byType = { 0: null, 1: null, 2: null, 3: null, 5: null };
    activities.forEach((a) => { if (byType[a.type] === null) byType[a.type] = a; });
    if (byType[0]) return byType[0];          // juego
    if (byType[2]) return byType[2];          // listening (spotify)
    return byType[1] || byType[3] || byType[5] || null;
  }

  /* Estado personal: actividad custom (type 4) o KV definido por el usuario */
  function personalStatus(data) {
    const custom = (data.activities || []).find((a) => a.type === 4);
    if (custom && custom.state) return custom.state;
    if (data.kv && data.kv.status) return data.kv.status;
    return '';
  }

  /* ---------- render (modo con datos) ---------- */
  function renderLive(data) {
    const root = $('discord-widget');
    root.innerHTML = '';

    const user = data.discord_user || {};
    const st = STATUS_META[data.discord_status] || STATUS_META.offline;

    /* cabecera */
    const head = el('div', 'dw-head');
    head.append(
      el('span', '', '▚ DISCORD // LIVE'),
      (function () {
        const live = el('span', 'meter live');
        live.textContent = '● POLLING';
        return live;
      })()
    );
    root.append(head);

    /* usuario + avatar con anillo de estado */
    const row = el('div', 'dw-user');
    const avBox = el('span', 'dw-avatar ' + st.cls);
    const img = document.createElement('img');
    img.src = resolveAvatar(user);
    img.alt = 'Avatar de ' + (user.global_name || user.username || 'Discord');
    avBox.appendChild(img);
    row.appendChild(avBox);

    const meta = el('div', '');
    meta.append(el('strong', 'dw-name', user.global_name || user.username || '????'));
    meta.append(el('span', 'dw-tag', (user.discriminator && user.discriminator !== '0' ? '#' + user.discriminator : '') + ' / ' + st.label));
    row.appendChild(meta);
    root.append(row);

    /* estado personal */
    const ps = personalStatus(data);
    if (ps) root.append(el('p', 'dw-status', '» ' + ps));

    /* actividad en vivo */
    const act = pickActivity(data.activities);
    root.append(renderActivity(act));

    /* pie: hora de la última lectura */
    const foot = el('div', 'dw-foot');
    foot.append(el('span', 'dw-clock', 'SINCRONIZADO ' + (new Date().toLocaleTimeString('es-ES'))));
    const btn = el('button', 'btn btn-ink', '↻ REINTENTAR');
    btn.type = 'button';
    btn.addEventListener('click', () => fetchNow());
    foot.appendChild(btn);
    root.append(foot);
  }

  function renderActivity(act) {
    const box = el('div', 'dw-activity');
    if (!act) {
      box.append(el('div', 'art', '🌌'));
      box.append(el('span', 'dw-activity-data', 'navegando el espacio… (sin actividad)'));
      return box;
    }

    if (act.type === 2 && act.name && act.name.toLowerCase() === 'spotify') {
      /* Listening to Spotify */
      const art = el('div', 'art');
      if (act.album_art_url) {
        const aImg = document.createElement('img');
        aImg.src = act.album_art_url;
        aImg.alt = 'Portada';
        art.appendChild(aImg);
      } else {
        art.textContent = '🎧';
      }
      box.appendChild(art);
      const data = el('div', 'dw-activity-data');
      data.append(el('b', 'spotify', '♪ ' + (act.title || 'escuchando Spotify')));
      data.append(el('span', '', (act.artist && act.artist[0] ? act.artist[0] + ' — ' : '') + (act.album || '')));
      box.appendChild(data);
      return box;
    }

    /* juego u otra actividad */
    const art = el('div', 'art', '🎮');
    box.appendChild(art);
    const data = el('div', 'dw-activity-data');
    data.append(el('b', '', act.name || '…'));
    if (act.details) data.append(el('span', '', act.details));
    if (act.state) data.append(el('span', '', act.state));
    box.appendChild(data);
    return box;
  }

  /* ---------- render (fallback: sin señal) ---------- */
  function renderError(reason) {
    const root = $('discord-widget');
    root.innerHTML = '';
    const err = el('div', 'dw-error');
    err.append(el('h3', '', '// SEÑAL PERDIDA'));
    err.append(el('p', '', reason || 'no pude conectarme a Lanyard.'));
    const code = el('code', '', 'discord-widget.js → const DISCORD_ID');
    err.appendChild(code);
    const btn = el('button', 'btn btn-ink', '↻ REINTENTAR');
    btn.type = 'button';
    btn.addEventListener('click', () => fetchNow());
    err.appendChild(btn);
    root.append(err);
  }

  function renderLoading() {
    const root = $('discord-widget');
    root.innerHTML = '';
    const l = el('p', 'dw-loading', '▚ ESTABLECIENDO CONEXIÓN…');
    root.append(l);
  }

  /* ---------- fetch real de Lanyard ---------- */
  async function fetchData(id) {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 9000);
    try {
      const res = await fetch('https://api.lanyard.rest/v1/users/' + encodeURIComponent(id), {
        signal: ctrl.signal,
        cache: 'no-store'
      });
      clearTimeout(to);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      if (!json || json.success !== true || !json.data) {
        throw new Error('respuesta de Lanyard inválida');
      }
      return json.data;
    } catch (e) {
      clearTimeout(to);
      throw e;
    }
  }

  /* ---------- bucle de polling ---------- */
  async function fetchNow() {
    if (!isValidId(DISCORD_ID)) {
      renderError('configura tu ID de Discord (placeholder en discord-widget.js).');
      return;
    }
    renderLoading();
    try {
      const data = await fetchData(DISCORD_ID);
      renderLive(data);
      if (timer) clearInterval(timer);
      timer = setInterval(() => fetchNow(), POLL_MS);
    } catch (e) {
      renderError('hubo un problema con la API: ' + e.message);
    }
  }

  /* ---------- arranque ---------- */
  const mount = document.getElementById('discord-widget');
  if (mount) {
    fetchNow();
    window.addEventListener('online', () => fetchNow());
  }
})();