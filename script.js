/* ============================================================
   LUNNIE ♡ — script.js (core común del sitio)
   Vanilla JavaScript modular, sin frameworks.
   ------------------------------------------------------------
   Módulos:
     1. Copiar código del botón 88x31
     2. Música ambiental (Web Audio API, sin mp3 externos)
     3. Asistente flotante con consejos aleatorios
     4. Webring randomizable
     5. Animaciones de aparición al hacer scroll
      6. Inyección de Giscus (sólo si está configurado)
      7. Año automático en el footer
      8. Daily Transmissions (muro de notas + reacciones)
      9. Dock de contacto (copiar tag de Discord, genérico [data-copy])
      9b. Reacciones de posts (.react[data-key] → localStorage)
      10. Easter egg de cumpleaños (confeti 🌙)
   ============================================================ */

/* ============================================================
   CONFIG DEL SECTOR — lo que editas a mano, en un solo lugar.
   ------------------------------------------------------------
   • SOCIAL_LINKS: claves = data-social de los enlaces (social-list
     y dock). Deja null mientras no tengas el enlace real → la UI
     lo muestra como "pendiente".
   • WEBRING: una entrada por amistad (nombre, URL, botón 88x31).
   • UPDATE_LOG: se renderiza en el timeline del home (#changelog).
   • COMM_STATUS: estado por tarjeta (clave = data-comm de cada
     tarjeta en encargos.html): 'open' | 'closed'.
   ============================================================ */
const CONFIG = {
  SOCIAL_LINKS: {
    twitter: null,  // 'https://twitter.com/lunnieart'
    tumblr: null,   // 'https://lunnie.tumblr.com'
    artfol: null,   // 'https://artfol.me/lunnie'
  },
  WEBRING: [
    /* Añade amistades así (btn: tu botón 88x31 o btn-friend):
    { name: 'amigo 1', url: 'https://friend.neocities.org', btn: 'assets/img/btn-friend.svg' },
    */
  ],
  UPDATE_LOG: [
    { d: '2026-09-24', h: 'Rebrand espacial.', x: 'El sector pasa a negro abisal + neón. Nuevo layout P5/GG, música ambiente web y huellas del guestbook.' },
    { d: '2026-09-20', h: 'Encargos renovados.', x: '6 categorías con TERMS por tarjeta y estado OPEN/CLOSED por slot.' },
    { d: '2026-09-12', h: 'Galería con filtros.', x: 'original, fanart, cómics y animación, con lightbox para tomarse su tiempo.' },
    { d: '2026-09-05', h: 'Estreno del pad espacial.', x: 'Música ambiente sintetizada directo en tu navegador, sin archivos.' },
    { d: '2026-09-01', h: 'Fundación del sector.', x: 'Primer bootstrap de «Lunnie\'s Corner» en Neocities.' },
  ],
  COMM_STATUS: {
    c1: 'open',
    c2: 'open',
    c3: 'open',
    c4: 'open',
    c5: 'open',
    c6: 'closed',
  },
  // Destino de los botones "pedir esta ✎" / "lista de espera" por tarjeta
  // (clave = data-comm). null = se muestra como enlace pendiente.
  COMMISSION_ORDER: {
    c1: 'mailto:lunnie.commissions@gmail.com?subject=Encargo — cuerpo completo / lineart',
    c2: 'mailto:lunnie.commissions@gmail.com?subject=Encargo — página de cómic',
    c3: 'mailto:lunnie.commissions@gmail.com?subject=Encargo — full illustration',
    c4: 'mailto:lunnie.commissions@gmail.com?subject=Encargo — chibi',
    c5: 'mailto:lunnie.commissions@gmail.com?subject=Encargo — pack de stickers',
    c6: 'mailto:lunnie.commissions@gmail.com?subject=Lista de espera — animación rough',
  },
  GUESTBOOK_MAX: 12,
};

/* ============================================================
   1. COPIAR CÓDIGO DEL BOTÓN 88x31
   ============================================================ */
(function initCopyButton() {
  const copyBtn = document.getElementById('copy-btn');
  const copySrc = document.getElementById('button-code');
  const feedback = document.getElementById('copy-feedback');
  if (!copyBtn || !copySrc) return;

  copyBtn.addEventListener('click', async () => {
    const text = copySrc.value;
    let copiado = false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        copiado = true;
      }
    } catch (e) { /* seguimos al fallback */ }

    if (!copiado) {
      copySrc.focus();
      copySrc.select();
      copySrc.setSelectionRange(0, text.length);
      copiado = document.execCommand('copy');
    }

    if (copiado && feedback) {
      feedback.hidden = false;
      setTimeout(() => { feedback.hidden = true; }, 2600);
    } else {
      alert('No pude copiar automáticamente :( selecciona el texto y copia a mano ♡');
    }
  });
})();

/* ============================================================
   2. MÚSICA AMBIENTAL — pad sintetizado con Web Audio API
   ============================================================ */
(function initMusic() {
  const toggle = document.getElementById('music-toggle');
  const eq = document.getElementById('eq');
  const status = document.getElementById('music-status');
  if (!toggle) return;

  const engine = (() => {
    let ctx = null;
    let master = null;
    let voices = [];
    const NOTES = [110.0, 164.81, 220.0, 329.63];  // A2 · E3 · A3 · E4 (pad espacial)

    function build() {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 640;
      filter.Q.value = 0.3;
      filter.connect(master);

      // LFO que hace "respirar" el filtro
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 260;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      NOTES.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = i % 2 === 0 ? 'triangle' : 'sine';
        osc.frequency.value = freq;

        const vib = ctx.createOscillator();          // vibrato sutil
        vib.frequency.value = 0.06 + i * 0.035;
        const vibGain = ctx.createGain();
        vibGain.gain.value = 0.5;
        vib.connect(vibGain);
        vibGain.connect(osc.frequency);
        vib.start();

        const voice = ctx.createGain();
        voice.gain.value = i === 0 ? 0.055 : 0.02;
        osc.connect(voice);
        voice.connect(filter);
        osc.start();

        voices.push({ osc, vib });
      });

      master.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.4);
    }

    function destroy() {
      voices.forEach(({ osc, vib }) => {
        try { osc.stop(); } catch (e) {}
        try { vib.stop(); } catch (e) {}
      });
      voices = [];
      try { ctx.close(); } catch (e) {}
      ctx = null;
      master = null;
    }

    return {
      get isOn() { return ctx !== null; },
      on() {
        if (ctx) return;
        build();
        if (ctx.state === 'suspended') ctx.resume();
      },
      off() {
        if (!ctx || !master) return;
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
        master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
        setTimeout(destroy, 550);
      }
    };
  })();

  const setPlaying = (playing) => {
    toggle.textContent = playing ? '⏸ APAGAR SEÑAL' : '▶ EMITIR AMBIENTE';
    toggle.setAttribute('aria-pressed', String(playing));
    if (eq) eq.classList.toggle('playing', playing);
    if (status) {
      status.textContent = playing ? 'SONANDO… calibra tu alma' : 'SILENCIO CÓSMICO';
      status.classList.toggle('pos', playing);
    }
  };

  toggle.addEventListener('click', () => {
    engine.isOn ? (engine.off(), setPlaying(false)) : (engine.on(), setPlaying(true));
  });
})();

/* ============================================================
   3. ASISTENTE FLOTANTE / POPUP
   ============================================================ */
(function initAssistant() {
  const bubble = document.getElementById('assistant-bubble');
  const popup = document.getElementById('assistant-popup');
  const closeBtn = document.getElementById('assistant-close');
  const body = document.getElementById('assistant-body');
  const otroBtn = document.getElementById('assistant-otro');
  if (!bubble || !popup) return;

  const TIPS = [
    'Hola ♡ Soy tu asistente de este rincón del espacio. La nav te mueve de sector.',
    '¿Buscas arte? La galería tiene filtros: original, fanart, cómics, animación…',
    'Encargos abiertos: 6 categorías en la página de comisiones, cada una con sus términos.',
    'El widget de Discord (columna del home) muestra si estoy online en directo.',
    'Deja tu huella en el guestbook del home — se guarda en tu navegador y existe igual ♡',
    'Prueba el botón “emitir ambiente”: un pad espacial generado en tu navegador 🎧',
    'Tip de dibujo: si el boceto no te hace sonreír al desbloquear la capa, bórralo sin culpa.',
  ];

  let i = 0;
  const showTip = () => {
    body.innerHTML = '';
    const p = document.createElement('p');
    p.textContent = TIPS[i % TIPS.length];
    body.appendChild(p);
    i += 1;
  };

  bubble.addEventListener('click', () => {
    const isOpen = !popup.hidden;
    popup.hidden = isOpen;
    if (!isOpen) showTip();
  });
  closeBtn.addEventListener('click', () => { popup.hidden = true; });
  otroBtn.addEventListener('click', showTip);

  setTimeout(() => {
    if (popup.hidden) { popup.hidden = false; showTip(); }
  }, 1600);
})();

/* ============================================================
   4. WEBRING RANDOMIZABLE
   ============================================================ */
(function initWebring() {
  const list = document.getElementById('friend-links');
  const btn = document.getElementById('webring-girar');
  if (!list || !btn) return;

  // Si hay amistades en CONFIG, reemplazan los placeholders "pendiente"
  const entries = CONFIG.WEBRING || [];
  if (entries.length) {
    list.textContent = '';
    entries.forEach((f) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = f.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.title = f.name;
      const img = document.createElement('img');
      img.src = f.btn || 'assets/img/btn-friend.svg';
      img.alt = f.name;
      img.loading = 'lazy';
      img.decoding = 'async';
      a.appendChild(img);
      li.appendChild(a);
      list.appendChild(li);
    });
  } else {
    list.querySelectorAll('a[data-pending]').forEach((a) => {
      a.classList.add('is-pending');
      a.title = 'webring — pendiente de configurar';
    });
  }

  btn.addEventListener('click', () => {
    const items = Array.from(list.children);
    for (let k = items.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      list.appendChild(items[j]);
    }
  });
})();

/* ============================================================
   5. REVEAL ON SCROLL (data-reveal, con retardo opcional)
   ============================================================ */
(function initReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;
  if (!('IntersectionObserver' in window)) {
    targets.forEach((t) => t.classList.add('revealed'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  targets.forEach((t) => { t.classList.add('pre-reveal'); io.observe(t); });
})();

/* ============================================================
   6. INYECCIÓN DE GISCUS (comentarios estáticos)
   ------------------------------------------------------------
   El HTML declara un elemento:
       <div id="giscus-config" data-repo="TU_USUARIO/TU_REPO"
            data-repo-id="" data-category="" data-category-id=""></div>

   Llena esos datos en tu repo (Settings → Discussions).
   Si no están configurados, mostramos un aviso elegante.
   ============================================================ */
(function initGiscus() {
  const cfg = document.getElementById('giscus-config');
  const thread = document.getElementById('giscus-thread');
  const fallback = document.getElementById('giscus-fallback');
  if (!cfg || !thread) return;

  const repo = cfg.dataset.repo || '';
  const looksConfigured = /\/.+/.test(repo) && !/^TU_/i.test(repo);

  if (!looksConfigured) {
    if (fallback) {
      fallback.textContent =
        '▧ SISTEMA DE COMENTARIOS SIN CONFIGURAR ▧\n' +
        'Llena cliente: giscus#giscus-config (data-repo / repo-id / category) ' +
        'en index.html y los comentarios aparecerán aquí.';
    }
    return;
  }

  const s = document.createElement('script');
  s.src = 'https://giscus.app/client.js';
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.dataset.repo = repo;
  s.dataset.repoId = cfg.dataset.repoId || '';
  s.dataset.category = cfg.dataset.category || '';
  s.dataset.categoryId = cfg.dataset.categoryId || '';
  s.dataset.mapping = cfg.dataset.mapping || 'pathname';
  s.dataset.strict = '0';
  s.dataset.reactionsEnabled = '1';
  s.dataset.emitMetadata = '0';
  s.dataset.inputPosition = 'top';
  s.dataset.theme = 'transparent_dark';
  s.dataset.lang = 'es';
  if (fallback) fallback.remove();
  thread.appendChild(s);
})();

/* ============================================================
   7. AÑO AUTOMÁTICO EN EL FOOTER
   ============================================================ */
(function initYear() {
  document.querySelectorAll('[data-year]').forEach((n) => {
    n.textContent = String(new Date().getFullYear());
  });
})();

/* ============================================================
   HELPER — copiar texto al portapapeles (clipboard + fallback)
   ============================================================ */
async function copyPlain(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) { /* seguimos al fallback */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch (e) { return false; }
}

/* ============================================================
   8. DAILY TRANSMISIONES — muro de notas con localStorage
   ------------------------------------------------------------
   - Notas semilla siempre visibles.
   - Notas del usuario guardadas en `lunnie-tx` (nuevas arriba).
   - Reacciones ❤️🔥🌙✨ con delta en `lunnie-tx-reacts`
     (clave `{id}|{emoji}` → 1/0), contando base + delta.
   ============================================================ */
(function initTransmissions() {
  const input = document.getElementById('tx-input');
  const post = document.getElementById('tx-post');
  const wall = document.getElementById('tx-wall');
  if (!input || !post || !wall) return;

  const STORE = 'lunnie-tx';
  const REACTS = 'lunnie-tx-reacts';
  const REACTS_UI = ['❤️', '🔥', '🌙', '✨'];

  const SEED = [
    {
      id: 'seed-1',
      t: 'boceto del día: gato astronauta en su primera órbita 🛸 ¿alguien lo quiere como sticker?',
      d: 'hace 1 h',
      base: { '❤️': 12, '🔥': 8, '🌙': 4, '✨': 9 },
    },
    {
      id: 'seed-2',
      t: 'midnight practicing guilty gear… wrongdoing all night. ¿alguien para el próximo set? ♡',
      d: 'ayer',
      base: { '❤️': 6, '🔥': 11, '🌙': 2, '✨': 5 },
    },
    {
      id: 'seed-3',
      t: "1 semana de este sector y ya siento que es mi casa :')",
      d: 'hace 3 días',
      base: { '❤️': 19, '🔥': 3, '🌙': 7, '✨': 12 },
    },
  ];

  const loadNotes = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE) || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch (e) { return []; }
  };
  const saveNotes = (list) => {
    try { localStorage.setItem(STORE, JSON.stringify(list)); } catch (e) {}
  };
  const getDelta = (id, rea) => {
    try {
      const store = JSON.parse(localStorage.getItem(REACTS) || '{}');
      return store[id + '|' + rea] ? 1 : 0;
    } catch (e) { return 0; }
  };
  const setDelta = (id, rea, on) => {
    try {
      const store = JSON.parse(localStorage.getItem(REACTS) || '{}');
      store[id + '|' + rea] = on ? 1 : 0;
      localStorage.setItem(REACTS, JSON.stringify(store));
    } catch (e) {}
  };

  function buildNote(note) {
    const art = document.createElement('article');
    art.className = 'tx-note';
    art.dataset.id = note.id;

    const head = document.createElement('div');
    head.className = 'tx-head';
    const who = document.createElement('strong');
    who.textContent = 'LUNNIE';
    const when = document.createElement('time');
    when.textContent = note.d || '';
    head.append(who, when);
    art.appendChild(head);

    const p = document.createElement('p');
    p.textContent = note.t;
    art.appendChild(p);

    const reacts = document.createElement('div');
    reacts.className = 'tx-reacts';
    const base = note.base || {};
    REACTS_UI.forEach((rea) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'react';
      b.dataset.rea = rea;
      b.setAttribute('aria-label', 'reaccionar ' + rea);
      const on = getDelta(note.id, rea) === 1;
      if (on) b.classList.add('on');
      const emoji = document.createElement('span');
      emoji.textContent = rea;
      const cnt = document.createElement('span');
      cnt.className = 'n';
      cnt.textContent = String((base[rea] || 0) + (on ? 1 : 0));
      b.append(emoji, cnt);
      b.addEventListener('click', () => {
        const next = !b.classList.contains('on');
        b.classList.toggle('on', next);
        setDelta(note.id, rea, next);
        cnt.textContent = String((base[rea] || 0) + (next ? 1 : 0));
      });
      reacts.appendChild(b);
    });
    art.appendChild(reacts);
    return art;
  }

  function renderWall() {
    wall.textContent = '';
    const mine = loadNotes().map((n) => ({ ...n, isMine: true }));
    mine.concat(SEED).forEach((n) => wall.appendChild(buildNote(n)));
  }

  post.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) {
      input.focus();
      return;
    }
    const list = loadNotes();
    list.unshift({
      t: text,
      d: new Date().toLocaleString('es-MX', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }),
      id: 'u' + Date.now(),
    });
    saveNotes(list);
    input.value = '';
    renderWall();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      post.click();
    }
  });

  renderWall();
})();

/* ============================================================
   9. DOCK DE CONTACTO — copiar tag de Discord
   ------------------------------------------------------------
   Bindea todos los botones con [data-copy] (dock y quick links).
   El aviso se busca dentro del contenedor más cercano (.dock / .panel).
   ============================================================ */
(function initDock() {
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const ok = await copyPlain(btn.dataset.copy || '');
      if (!ok) return;
      const scope = btn.closest('.dock, .panel') || document;
      const fb = scope.querySelector('.dock-feedback');
      if (fb) {
        fb.hidden = false;
        setTimeout(() => { fb.hidden = true; }, 2600);
      }
    });
  });
})();

/* ============================================================
   9b. REACCIONES DE POSTS (.react[data-key] → localStorage)
   ------------------------------------------------------------
   data-base = conteo inicial visible; el estado on/off por tecla
   se guarda en `lunnie-blog-reacts` (clave = data-key).
   ============================================================ */
(function initPostReacts() {
  const KEY = 'lunnie-blog-reacts';
  const buttons = document.querySelectorAll('.react[data-key]');
  if (!buttons.length) return;

  const load = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
      return raw && typeof raw === 'object' ? raw : {};
    } catch (e) { return {}; }
  };
  const store = load();

  buttons.forEach((b) => {
    const k = b.dataset.key;
    const base = parseInt(b.dataset.base, 10) || 0;
    const cnt = b.querySelector('.n');
    const on = !!store[k];
    b.classList.toggle('on', on);
    if (cnt) cnt.textContent = String(base + (on ? 1 : 0));

    b.addEventListener('click', () => {
      const next = !b.classList.contains('on');
      b.classList.toggle('on', next);
      store[k] = next ? 1 : 0;
      try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}
      if (cnt) cnt.textContent = String(base + (next ? 1 : 0));
    });
  });
})();

/* ============================================================
   10. EASTER EGG DE CUMPLEAÑOS — 🌙 → confeti + banner
   ============================================================ */
(function initEgg() {
  const trigger = document.getElementById('egg-trigger');
  const banner = document.getElementById('egg-banner');
  const closeBtn = document.getElementById('egg-close');
  const layer = document.getElementById('confetti-layer');
  if (!trigger || !banner) return;

  const COLORS = ['#ffffff', '#eadaff', '#9d4edd', '#7209b7', '#3a0ca3'];
  let hideT = null;

  function spawnConfetti() {
    if (!layer) return;
    layer.textContent = '';
    layer.hidden = false;
    for (let i = 0; i < 80; i++) {
      const c = document.createElement('span');
      c.className = 'confetti';
      c.style.left = (Math.random() * 100) + '%';
      c.style.width = (5 + Math.random() * 6) + 'px';
      c.style.height = (8 + Math.random() * 8) + 'px';
      c.style.backgroundColor = COLORS[i % COLORS.length];
      c.style.animationDuration = (2.4 + Math.random() * 2.2) + 's';
      c.style.animationDelay = (Math.random() * 0.9) + 's';
      c.style.opacity = String(0.7 + Math.random() * 0.3);
      layer.appendChild(c);
    }
  }

  function clearConfetti() {
    if (!layer) return;
    layer.textContent = '';
    layer.hidden = true;
  }

  function open() {
    banner.hidden = false;
    spawnConfetti();
    if (hideT) clearTimeout(hideT);
    hideT = setTimeout(close, 6800);
  }

  function close() {
    banner.hidden = true;
    clearConfetti();
    if (hideT) { clearTimeout(hideT); hideT = null; }
  }

  trigger.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  banner.addEventListener('click', (e) => { if (e.target === banner) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();

/* ============================================================
   11. SOCIAL LINKS — resuelve los enlaces pendientes del dock y
       de la columna de contactos.
   ------------------------------------------------------------
   Un <a data-social="clave"> amanece como "pendiente". Si la clave
   existe en CONFIG.SOCIAL_LINKS, se activa el enlace real y se
   limpia la etiqueta <em>.
   ============================================================ */
(function initSocial() {
  const links = CONFIG.SOCIAL_LINKS || {};
  document.querySelectorAll('[data-social]').forEach((el) => {
    const url = links[el.dataset.social];
    if (!url) {
      el.classList.add('is-pending');
      return;
    }
    if (el.tagName === 'A') el.href = url;
    el.classList.remove('is-pending');
    const em = el.querySelector('em');
    if (em && /pendiente/i.test(em.textContent)) em.textContent = '';
  });
})();

/* ============================================================
   12. CHANGELOG — timeline del home desde UPDATE_LOG
   ============================================================ */
(function initChangelog() {
  const ol = document.getElementById('changelog');
  if (!ol) return;
  (CONFIG.UPDATE_LOG || []).forEach((e) => {
    const li = document.createElement('li');
    const time = document.createElement('time');
    time.dateTime = e.d;
    time.textContent = e.d.split('-').reverse().join('/');
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = e.h;
    p.appendChild(strong);
    if (e.x) p.appendChild(document.createTextNode(' ' + e.x));
    li.append(time, p);
    ol.appendChild(li);
  });
})();

/* ============================================================
   13. ESTADO DE ENCARGOS — chips sincronizados con COMM_STATUS
   ------------------------------------------------------------
   Cada tarjeta declara su clave con data-comm (encargos.html).
   Este módulo pinta el chip "status: open/closed" y la clase
   .closed de la tarjeta desde el objeto CONFIG, una sola fuente.
   ============================================================ */
(function initCommStatus() {
  const status = CONFIG.COMM_STATUS || {};
  document.querySelectorAll('.comm-card[data-comm]').forEach((card) => {
    const isOpen = status[card.dataset.comm] === 'open';
    card.classList.toggle('closed', !isOpen);
    const chip = Array.from(card.querySelectorAll('.comm-tags .chip'))
      .find((c) => /^status:/i.test(c.textContent));
    if (chip) {
      chip.className = 'chip ' + (isOpen ? 'chip-open' : 'chip-closed');
      chip.textContent = 'status: ' + (isOpen ? 'open' : 'closed');
    }
  });
})();

/* ============================================================
   14. GUESTBOOK — huellas locales (fallback del hilo real)
   ------------------------------------------------------------
   Guarda mensajes en localStorage (`lunnie-gb`), máx. GUESTBOOK_MAX.
   Cuando conectes un backend real (giscus / GitHub Discussions),
   sustituye solo el cuerpo de load()/save() por tu fetch y la UI
   no cambia.
   ============================================================ */
(function initGuestbook() {
  const text = document.getElementById('gb-text');
  const post = document.getElementById('gb-post');
  const list = document.getElementById('gb-list');
  if (!text || !post || !list) return;

  const STORE = 'lunnie-gb';
  const MAX = CONFIG.GUESTBOOK_MAX || 12;

  const load = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE) || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch (e) { return []; }
  };
  const save = (arr) => {
    try { localStorage.setItem(STORE, JSON.stringify(arr)); } catch (e) {}
  };

  function render() {
    list.textContent = '';
    const items = load();
    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'gb-empty';
      empty.textContent = 'aún no hay huellas… sé la primera ♡';
      list.appendChild(empty);
      return;
    }
    items.forEach((m) => {
      const item = document.createElement('div');
      item.className = 'gb-item';
      const head = document.createElement('div');
      head.className = 'gb-head';
      const name = document.createElement('strong');
      name.textContent = m.name;
      const d = document.createElement('time');
      d.textContent = m.d;
      head.append(name, d);
      const p = document.createElement('p');
      p.textContent = m.t;
      item.append(head, p);
      list.appendChild(item);
    });
  }

  post.addEventListener('click', () => {
    const t = text.value.trim();
    if (!t) { text.focus(); return; }
    const items = load();
    items.unshift({
      name: 'visitante ♡',
      t: t.slice(0, 280),
      d: new Date().toLocaleString('es-MX', {
        day: '2-digit', month: '2-digit',
        hour: '2-digit', minute: '2-digit',
      }),
    });
    save(items.slice(0, MAX));
    text.value = '';
    render();
  });

  text.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      post.click();
    }
  });

  render();
})();

/* ============================================================
   15. ÓRDENES DE ENCARGOS — botones "pedir esta ✎"
   ------------------------------------------------------------
   Los CTAs (.btn de cada .comm-card[data-comm]) apuntan a
   CONFIG.COMMISSION_ORDER; si la clave falta quedan marcados
   como pendientes (nunca un enlace muerto #).
   ============================================================ */
(function initCommOrders() {
  const orders = CONFIG.COMMISSION_ORDER || {};
  document.querySelectorAll('.comm-card[data-comm]').forEach((card) => {
    const url = orders[card.dataset.comm];
    card.querySelectorAll(':scope > .btn').forEach((btn) => {
      if (!url) {
        btn.classList.add('is-pending');
        btn.setAttribute('aria-disabled', 'true');
        btn.removeAttribute('target');
        return;
      }
      btn.href = url;
      if (/^mailto:/i.test(url)) {
        btn.removeAttribute('target');
        btn.removeAttribute('rel');
      } else {
        btn.target = '_blank';
        btn.rel = 'noopener';
      }
      btn.classList.remove('is-pending');
      btn.removeAttribute('aria-disabled');
    });
  });
})();