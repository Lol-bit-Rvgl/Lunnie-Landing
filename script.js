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
   CONFIG DEL PANTEÓN — lo que editas a mano, en un solo lugar.
   ------------------------------------------------------------
   • SOCIAL_LINKS: claves = data-social de los enlaces (social-list
     y dock). Deja null mientras no tengas el enlace real → la UI
     lo muestra como "pendiente".
   • WEBRING: una entrada por amistad (nombre, URL, botón 88x31).
   • UPDATE_LOG: se renderiza en el timeline del home (#changelog).
• COMM_STATUS: estado por tarjeta (clave = data-comm de cada
      tarjeta en encargos.html): 'open' | 'closed'.
    • WORKS / OCS: FUENTES DE VERDAD de los contadores de perfil
      ("n obras" / "n OCs"). Una entrada por obra real de la galería
      y por OC real del archivo de OCs. Los `<b data-stat>` del
      perfil (index.html y sobre-mi.html) se rellenan con estas
      longitudes al cargar; si el conteo del DOM no coincide, un
      aviso en consola te dice exactamente qué falta actualizar.
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
  // Mensaje de estado que el asistente muestra al abrir su popup
  // (vacío = sin mensaje). Lo edita el panel admin (admin/index.html).
  ASSISTANT_STATUS: '',

  // FUENTE DE VERDAD — contador de obras.
  // Uno por <figure class="g-item"> de galeria.html (id = data-coord STAR-xx).
  // Al añadir/quitar una obra, actualiza ESTA lista (y el checker te avisa
  // si se desincroniza con el grid real). Los <b data-stat="works"> del
  // perfil se calculan de aquí: CONFIG.WORKS.length.
  WORKS: [
    'STAR-16', // torii al atardecer (featured)
    'STAR-17', // Kasane Teto — fullbody
    'STAR-18', // Toph Beifong — combate
    'STAR-19', // Toph Beifong — retrato
    'STAR-20', // DEMONKOPIA
    'STAR-21', // Withered Bonnie
    'STAR-22', // edificios urbanos
    'STAR-23', // sonrisa creepy — WIP
    'STAR-24', // Jax — chibi
    'STAR-11', // LUNNIE — collar de púas
    'STAR-12', // LUNNIE — ojos otoñales
    'STAR-13', // LUNNIE — boceto oscuro
    'STAR-14', // LUNNIE — lineart limpio
    'STAR-15', // LUNNIE — sticker enojado
    'STAR-01', // planeta anillado
    'STAR-02', // gatita astronauta
    'STAR-03', // gearrunner mecha
    'STAR-04', // lune sonriente
    'STAR-05', // página de cómic 01
    'STAR-06', // tira x3 paneles
    'STAR-07', // rough walk loop
    'STAR-08', // mecha flicker
    'STAR-09', // chibi nebulosa
    'STAR-10', // página de sketchbook
  ],

  // FUENTE DE VERDAD — contador de OCs.
  // Uno por <article class="oc-card"> de ocs.html (id = .oc-id).
  // Al añadir/quitar un OC, actualiza ESTA lista. Los <b data-stat="ocs">
  // del perfil se calculan de aquí: CONFIG.OCS.length.
  OCS: [
    'OC_01 // LUNNIE // GOTH BUNNY',
  ],
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

  // ── TRANSMISIONES (muro de notas del home) ──────────────────
  // Cada entrada: { id, t: texto, d: fecha, base: {emoji: n} }
  // El panel admin (pestaña 04) gestiona esta lista.
  TRANSMISSIONS: [
    {
      id: 'tx-001',
      t: 'bienvenid@ a mi panteón — un rincón de internet hecho a mano, sin algoritmo. subo bocetos, proceso y lo que salga ✦',
      d: '2026-10-01',
      base: { '❤️': 5, '🔥': 2, '🌙': 3, '✨': 4 },
    },
    {
      id: 'tx-002',
      t: 'estoy trabajando en stickers góticos del conejo — si quieres que te avise cuando estén listos, escríbeme por discord ✦',
      d: '2026-10-10',
      base: { '❤️': 3, '🔥': 1, '🌙': 2, '✨': 2 },
    },
  ],

  // ── PROYECTOS EN CURSO (WORKING ON RN…) ────────────────────
  // status: 'ACTIVE' | 'BUILDING' | 'NEXT' | 'DONE'
  // El panel admin (pestaña 05) gestiona esta lista.
  WIP_TASKS: [
    { title: 'stickers góticos del conejo', status: 'ACTIVE' },
    { title: 'ilustración de Toph Beifong', status: 'ACTIVE' },
    { title: 'nueva página de encargos', status: 'BUILDING' },
    { title: 'playlist para el blog', status: 'NEXT' },
  ],

  // ── PERFIL (bio, intereses, herramientas) ──────────────────
  // El panel admin (pestaña 06) gestiona este objeto.
  PROFILE: {
    bioHome: '17 y/o digital artist from Mexico. Obsessed with fighting games, gothic vibes & high-contrast illustrations. Welcome to my grave.',
    bioAbout: [
      'Hola, soy Lunnie: tengo 17, vivo en México y dibujo casi todos los días desde que aprendí a sostener un lápiz sin romperlo. Me muevo entre el ilustrado digital y el boceto sucio — lo que más busco en un dibujo no es que sea bonito, sino que tenga actitud: diagonales, contraste, un personaje que parezca que acaba de entrar en pantalla.',
      'Hace un año quería volver a tener casa en internet, de las de antes: una web hecha a mano, con botones 88x31, muro de notas y sin un algoritmo decidiendo qué ves. Por eso existe este panteón — lo escribí yo, línea por línea, y cada rincón tiene algo de mí: mis OCs, mi diario, mis encargos.',
      'En la vida "real" soy estudiante, llevo un portafolio que intento alimentar entre tareas y turno de sueño irregular. Si me ves a las 2 a.m. probablemente esté planchando líneas en Clip Studio o perdiendo el mismo matchup en ranked. Ambas actividades son perfectamente válidas como investigación artística.',
    ],
    interests: [
      'Guilty Gear Strive (y todo lo que rompe en ranked)',
      'Persona 5 — menús, diagonal y actitud',
      'música: lo-fi, city pop, OSTs de fighting games',
      'estética de cripta: humo, CRT, widgets',
      'web revival: neocities, foros, clip-art',
      'café a las 2 a.m. y bocetos a mano alzada',
      'mis OCs (obviamente)',
    ],
    tools: ['Clip Studio Paint', 'ibis Paint', 'MediBang', 'Figma (botones 88x31)'],
    location: 'México',
    role: 'digital artist & illustrator',
  },
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
  const fms = document.getElementById('fm-signal');
  if (!toggle) return;

  const engine = (() => {
    let ctx = null;
    let master = null;
    let voices = [];
    const NOTES = [110.0, 164.81, 220.0, 329.63];  // A2 · E3 · A3 · E4 (pad del panteón)

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
    if (fms) {
      fms.textContent = playing ? '▚▚▚ TRANSMISIÓN ACTIVA' : '▚▚▚ DISPONIBLE';
      fms.classList.toggle('on', playing);
    }
    if (playing) {
      window.dispatchEvent(new CustomEvent('lunnie:event', { detail: { text: 'transmisión de grave fm recibida' } }));
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
    'Hola ♡ Soy tu asistente de este panteón. La nav te mueve de cripta.',
    '¿Buscas arte? La galería tiene filtros: original, fanart, cómics, animación…',
    'Encargos abiertos: 6 categorías en la página de comisiones, cada una con sus términos.',
    'El widget de Discord (columna del home) muestra si estoy online en directo.',
    'Deja tu huella en el guestbook del home — se guarda en tu navegador y existe igual ♡',
    'Prueba el botón “emitir ambiente”: un pad del panteón generado en tu navegador 🎧',
    'Tip de dibujo: si el boceto no te hace sonreír al desbloquear la capa, bórralo sin culpa.',
  ];

  let i = 0;
  const showTip = () => {
    body.innerHTML = '';
    const estado = (CONFIG.ASSISTANT_STATUS || '').trim();
    if (estado) {
      const aviso = document.createElement('p');
      aviso.className = 'as-status';
      aviso.textContent = estado;
      body.appendChild(aviso);
    }
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
   ------------------------------------------------------------
   La sección (#sec-webring) nace `hidden` en el HTML para no mostrar
   huecos "reservado" vacíos. Este módulo:
     • sin amistades en CONFIG.WEBRING → la mantiene oculta;
     • con amistades → la desoculta, pinta los botones reales y (si
       existe el botón) enlaza el shuffle aleatorio.
   Al añadir tu 1er amigo solo necesitas tocar CONFIG.WEBRING.
   ============================================================ */
(function initWebring() {
  const section = document.getElementById('sec-webring');
  const list = document.getElementById('friend-links');
  const btn = document.getElementById('webring-girar');
  if (!section && !list && !btn) return;

  const entries = CONFIG.WEBRING || [];
  if (!entries.length) {
    if (section) section.hidden = true;
    return;
  }

  if (section) section.hidden = false;
  if (!list) return;
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

  if (btn) {
    btn.addEventListener('click', () => {
      const items = Array.from(list.children);
      for (let k = items.length - 1; k > 0; k--) {
        const j = Math.floor(Math.random() * (k + 1));
        list.appendChild(items[j]);
      }
    });
  }
})();

/* ============================================================
   5. REVEAL ON SCROLL (data-reveal, con retardo opcional)
   ============================================================ */
(function initReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;
  // Sin movimiento (o sin observer) nada se queda oculto.
  const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still || !('IntersectionObserver' in window)) {
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
  }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
  targets.forEach((t) => { t.classList.add('pre-reveal'); io.observe(t); });
  // Red de seguridad: lo que ya está en pantalla se revela aunque el
  // observer falle (p. ej. por recortes o por un scroll programático).
  window.addEventListener('load', () => {
    targets.forEach((t) => {
      const r = t.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) t.classList.add('revealed');
    });
  });
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
        '▧ el hilo de comentarios real aún no está conectado — mientras, tus huellas de arriba son bienvenidas ♡';
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

  // Transmisiones oficiales vienen de CONFIG.TRANSMISSIONS (gestionables desde admin).
  const SEED = CONFIG.TRANSMISSIONS || [];

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
    const all = mine.concat(SEED);
    if (!all.length) {
      const empty = document.createElement('p');
      empty.className = 'tx-empty';
      empty.textContent = '✦ no hay transmisiones aún — sé la primera en dejar una ✦';
      wall.appendChild(empty);
      return;
    }
    all.forEach((n) => wall.appendChild(buildNote(n)));
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

  const COLORS = ['#ffffff', '#f0eaea', '#e63946', '#b3001b', '#8b0000'];
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
  // Chips globales [data-live="commissions"] (p.ej. el hero del home):
  // abiertas si al menos una categoría está open.
  const algunaAbierta = Object.values(status).some((v) => v === 'open');
  document.querySelectorAll('[data-live="commissions"]').forEach((chip) => {
    chip.className = 'chip ' + (algunaAbierta ? 'chip-open' : 'chip-closed');
    chip.textContent = 'commissions: ' + (algunaAbierta ? 'open' : 'closed');
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

/* ============================================================
   16. CONTADORES DE PERFIL — obras y OCs desde CONFIG.WORKS/OCS
   ------------------------------------------------------------
   • Las páginas declaran un lugar por número:
       <b data-stat="works">10</b><span>obras</span>
       <b data-stat="ocs">03</b><span>OCs</span>
   • Este módulo rellena cada <b data-stat> con la longitud de la
     fuente de verdad (CONFIG.WORKS / CONFIG.OCS), en el mismo
     formato de 2 dígitos.
   • En galeria.html / ocs.html compara el registro contra el DOM
     real (#gal-grid .g-item / #sec-ocs .oc-card) y avisa en consola
     si se desincronizan: ahí queda documentado dónde corregir.
   ============================================================ */
(function initSiteStats() {
  const pad = (n) => String(n).padStart(2, '0');

  const stats = {
    works: (CONFIG.WORKS || []).length,
    ocs: (CONFIG.OCS || []).length,
  };

  document.querySelectorAll('[data-stat]').forEach((b) => {
    const key = b.dataset.stat;
    if (key in stats) b.textContent = pad(stats[key]);
  });

  const verify = (selector, list, label, page) => {
    const n = document.querySelectorAll(selector).length;
    if (n !== (list || []).length) {
      console.warn(
        '[stats] ' + label + ' desincronizado: ' + page + ' tiene ' + n +
        ' y CONFIG.' + label.toUpperCase() + ' registra ' + (list || []).length +
        ' → actualiza CONFIG.' + label.toUpperCase() + ' en script.js'
      );
    }
  };

  if (document.getElementById('gal-grid')) verify('#gal-grid .g-item', CONFIG.WORKS, 'works', 'galeria.html');
  if (document.getElementById('sec-ocs')) verify('#sec-ocs .oc-card', CONFIG.OCS, 'ocs', 'ocs.html');
})();

/* ============================================================
   17. WORKING ON — proyectos en curso desde CONFIG.WIP_TASKS
   ------------------------------------------------------------
   Renderiza las filas del panel "working on rn…" en index.html.
   Cada tarea: { title, status } con status ACTIVE/BUILDING/NEXT/DONE.
   ============================================================ */
(function initWorkingOn() {
  const container = document.querySelector('[data-sec="WIP"] .working-list');
  if (!container) return;

  const tasks = CONFIG.WIP_TASKS || [];
  const statusClass = {
    ACTIVE: 'is-on',
    BUILDING: '',
    NEXT: '',
    DONE: 'is-done',
  };

  container.textContent = '';
  if (!tasks.length) {
    const empty = document.createElement('p');
    empty.className = 'tiny';
    empty.textContent = '✦ sin proyectos activos por ahora ✦';
    container.appendChild(empty);
    return;
  }

  tasks.forEach((task) => {
    const row = document.createElement('div');
    row.className = 'working-row';

    const dot = document.createElement('span');
    dot.className = 'dot';

    const p = document.createElement('p');
    p.textContent = task.title;

    const chip = document.createElement('span');
    chip.className = 'chip chip-state' + (statusClass[task.status] ? ' ' + statusClass[task.status] : '');
    chip.textContent = task.status;

    row.append(dot, p, chip);
    container.appendChild(row);
  });
})();

/* ============================================================
   18. PROFILE — bio e intereses desde CONFIG.PROFILE
   ------------------------------------------------------------
   Inyecta la bio y datos del perfil en index.html y sobre-mi.html
   usando selectores data-attr para que el admin pueda gestionarlos.
   ============================================================ */
(function initProfile() {
  const P = CONFIG.PROFILE;
  if (!P) return;

  // Bio corta en home (si existe el elemento)
  const homeBio = document.querySelector('[data-profile="bio-home"]');
  if (homeBio && P.bioHome) homeBio.textContent = P.bioHome;

  // Bio extendida en sobre-mi.html
  const aboutBio = document.querySelector('[data-profile="bio-about"]');
  if (aboutBio && Array.isArray(P.bioAbout)) {
    aboutBio.textContent = '';
    P.bioAbout.forEach((para) => {
      const p = document.createElement('p');
      p.textContent = para;
      aboutBio.appendChild(p);
    });
  }

  // Intereses
  const interests = document.querySelector('[data-profile="interests"]');
  if (interests && Array.isArray(P.interests)) {
    interests.textContent = '';
    P.interests.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      interests.appendChild(li);
    });
  }

  // Herramientas (stat-card del home/sobre-mí)
  const tools = document.querySelector('[data-profile="tools"]');
  if (tools && Array.isArray(P.tools) && P.tools.length) {
    tools.textContent = P.tools.join(' / ');
  }

  // Ubicación y rol
  const loc = document.querySelector('[data-profile="location"]');
  if (loc && P.location) loc.textContent = P.location;

  const role = document.querySelector('[data-profile="role"]');
  if (role && P.role) role.textContent = P.role;
})();