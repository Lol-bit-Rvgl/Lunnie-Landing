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
   ============================================================ */

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
    'Hola ♡ Yo soy tu asistente de este rincón del espacio. Usa la nav para moverse.',
    '¿Buscas arte? La galería tiene filtros: original, fanart, cómics, animación…',
    'Encargos abiertos: 7 categorías en la página de comisiones, con TERMS incluidos.',
    'El widget de Discord (columna izquierda) muestra si estoy online en directo.',
    'Deja tu huella en el guestbook vía GitHub — comentarios sin backend, todo en una discussions.',
    'Prueba el botón “emitir ambiente”: hay un pad espacial generado en tu navegador 🎧',
    'Este sitio corre sin frameworks. Cero build step, puro HTML+CSS+JS de las viejas.',
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