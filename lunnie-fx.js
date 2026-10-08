/* ============================================================
   LUNNIE ♡ — lunnie-fx.js
   La capa "viva" del panteón: cursor personalizado, mascota
   RIP con estados, LUNNIE SYSTEM (valores estéticos que
   fluctúan), scroll index, descubrimientos y secretos.

   Todo es estética y mecánica de juego — no datos reales ni
   servidor. Respeta prefers-reduced-motion y pointer:coarse.
   ============================================================ */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const finePointer = !coarsePointer && window.matchMedia('(pointer: fine)').matches;

  // gestos recientes → permitir micro-sonidos bajo el umbral de interacción
  let lastGesture = 0;
  const markGesture = () => { lastGesture = Date.now(); };
  document.addEventListener('pointerdown', markGesture, { passive: true });
  document.addEventListener('keydown', markGesture, { passive: true });

  // bus de eventos del panteón (LAST EVENT del system diagnostics)
  let sysEvent = () => {};
  const reportNebula = (name) => {
    const el = document.querySelector('[data-key="nebula"]');
    if (el) el.textContent = name;
  };

  /* ============================================================
     1. CURSOR PERSONALIZADO (solo puntero fino, sin reduced-motion)
     ============================================================ */
  function initCursor() {
    if (!finePointer || prefersReduced) return;
    if (!document.body.classList.contains('lunnie-cursor')) {
      document.body.classList.add('lunnie-cursor');
    }
    const dot = document.createElement('div');
    dot.className = 'cur-dot';
    const ring = document.createElement('div');
    ring.className = 'cur-ring';
    dot.setAttribute('aria-hidden', 'true');
    ring.setAttribute('aria-hidden', 'true');
    document.body.append(dot, ring);

    let mx = -100, my = -100;
    let rx = -100, ry = -100;
    const follow = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(follow);
    };
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
    }, { passive: true });

    // clases contextuales sobre elementos interactivos
    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest('a, button, [data-cursor], input, textarea, .g-item, [role="button"]');
      const art = e.target.closest('.g-img img, .featured-art, .gal-strip img, .banner-wrap');
      document.body.classList.toggle('cur-hover', !!t && !art);
      document.body.classList.toggle('cur-view', !!art);
    }, { passive: true });

    requestAnimationFrame(follow);
  }
  initCursor();

  /* ============================================================
     2. SISTEMA DE DESCUBRIMIENTOS (localStorage)
     ============================================================ */
  const DISC_KEY = 'lunnie-discoveries';
  const DISC_TOTAL = 10;

  function getDiscovered() {
    try {
      const raw = JSON.parse(localStorage.getItem(DISC_KEY));
      if (Array.isArray(raw)) return raw;
    } catch (e) {}
    return [];
  }
  function discover(id, text) {
    const list = getDiscovered();
    if (list.includes(id)) return;
    list.push(id);
    try { localStorage.setItem(DISC_KEY, JSON.stringify(list)); } catch (e) {}
    showToast(text);
    updateCount();
    sysEvent('anomalía registrada · ' + id);
  }
  function updateCount() {
    const el = document.querySelector('.discovery-count b');
    if (el) el.textContent = String(getDiscovered().length) + '/' + String(DISC_TOTAL);
  }
  function showToast(text) {
    let toast = document.querySelector('.discovery-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'discovery-toast';
      toast.innerHTML = '<small>✦ DISCOVERY UNLOCKED</small><span></span><em>+1 anomalía registrada</em>';
      document.body.appendChild(toast);
    }
    toast.querySelector('span').textContent = '"' + text + '"';
    toast.classList.add('is-on');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('is-on'), 3400);
    if (!prefersReduced && Date.now() - lastGesture < 2500) blip();
  }
  function blip() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const g = ctx.createGain();
      g.gain.value = 0.035;
      g.connect(ctx.destination);
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(660, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.07);
      o.connect(g);
      o.start();
      o.stop(ctx.currentTime + 0.09);
      setTimeout(() => { try { ctx.close(); } catch (e) {} }, 300);
    } catch (e) {}
  }

  /* ============================================================
     3. RIP — mascota con estados
     ============================================================ */
  function initNebula() {
    const friend = document.querySelector('.nebula-friend');
    if (!friend) return;
    const img = friend.querySelector('img');
    const tag = friend.querySelector('.neb-tag');

    const STATES = [
      { name: 'AWAKE',        img: 'assets/img/nebula/nebgula-idle.svg',    cls: 'is-awake' },
      { name: 'CURIOUS',      img: 'assets/img/nebula/nebgula-curious.svg', cls: 'is-curious' },
      { name: 'SLEEPING',     img: 'assets/img/nebula/nebgula-sleepy.svg',  cls: 'is-sleepy' },
      { name: 'EXCITED',      img: 'assets/img/nebula/nebgula-excited.svg', cls: 'is-excited' },
      { name: 'HAPPY',        img: 'assets/characters/nebula/nebula-happy.svg',    cls: 'is-happy' },
      { name: 'WAVE',         img: 'assets/characters/nebula/nebula-wave.svg',     cls: 'is-wave' },
    ];
    let stateIdx = 0;
    let clicks = 0;
    let trail = [];

    function say(text, kicker) {
      let bubble = document.querySelector('.nebula-bubble');
      if (bubble) bubble.remove();
      bubble = document.createElement('div');
      bubble.className = 'nebula-bubble';
      bubble.setAttribute('role', 'status');
      bubble.innerHTML = '<span>' + (kicker || 'rip') + ' //</span>' + text;
      document.body.appendChild(bubble);
      setTimeout(() => bubble.remove(), 4200);
    }
    function setState(idx, silent) {
      stateIdx = idx;
      const s = STATES[idx];
      img.src = s.img;
      img.alt = 'RIP, la mascota del panteón — ' + s.name.toLowerCase();
      tag.textContent = 'RIP STATUS ● ' + s.name;
      tag.className = 'neb-tag ' + s.cls;
      reportNebula(s.name);
      if (friend.classList) {
        friend.classList.remove('is-sleepy', 'is-happy', 'is-wave');
        friend.classList.add(s.cls);
      }
      if (!silent && !prefersReduced) {
        img.animate(
          [
            { transform: 'scale(0.86)' },
            { transform: 'scale(1.1)' },
            { transform: 'scale(1)' },
          ],
          { duration: 340, easing: 'cubic-bezier(.16,1,.3,1)' }
        );
      }
    }
    // estados aleatorios sin molestar
    setInterval(() => {
      if (document.hidden) return;
      const n = Math.random();
      const next = n < 0.45 ? 0 : n < 0.65 ? 1 : n < 0.8 ? 2 : n < 0.9 ? 3 : n < 0.96 ? 4 : 5;
      if (next === stateIdx) return;
      setState(next, true);
      const msgs = [
        '*RIP mira el panteón*',
        '*RIP huele algo raro en el arte*',
        '*zzz*',
        '*RIP gira la cola de emoción*',
        '*RIP sonríe entre las velas*',
        '*RIP saluda al visitante*',
      ];
      if (Math.random() < 0.12) say(msgs[next], 'rip');
    }, 8000);

    // clics: acumulan cariño
    img.addEventListener('click', () => {
      clicks++;
      setState(0);
      reportNebula(STATES[0].name);
      sysEvent('rip respondió a tu llamada');
      const pet = ['*suave*', '*RIP cierra los ojos*', '*ronroneo tumular*', '*te da la cabeza*'];
      say(pet[Math.min(clicks - 1, pet.length - 1)], 'rip');
      if (clicks === 1) removeTrail();
      trail.push(Date.now());
      if (trail.length >= 5) {
        if (trail[trail.length - 1] - trail[trail.length - 5] < 7000) {
          setState(3);
          say('¡WOW! ¡Encontraste algo juntos!', 'rip');
          discover('nebula-5', 'RIP encontró algo. +1 secreto.');
          clicks = 0;
          trail = [];
        } else {
          trail.shift();
        }
      }
    });
    function removeTrail() {}

    // primera visita: se presenta
    setTimeout(() => {
      if (getDiscovered().includes('nebula-first')) return;
      say('Hola, soy RIP. Cuida este rinconcito ♡', 'rip');
      discover('nebula-first', 'Conociste a RIP.');
    }, 2200);
  }
  initNebula();

  /* ============================================================
     4. LUNNIE SYSTEM — estado que respira (mecánica estética)
     ============================================================ */
  function initSysStatus() {
    const wrap = document.getElementById('sys-status');
    if (!wrap) return;

    const FUN = {
      mood: ['cafeinada', 'en modo dibujo', 'ignorando el sueño', 'hiperfocus pixel', 'modo pelea', 'de brasa en brasa'],
      energy: ['73%', 'baja pero funcional', 'recargando', 'jugo al 90%', 'a media luz'],
      signal: ['fuerte', 'con estática', 'intermitente', 'cristalina'],
    };
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const SECTORS = ['STABLE', 'STABLE', 'CALIBRATING', 'SYNCING'];
    const labels = wrap.querySelectorAll('[data-key]');
    const bars = wrap.querySelectorAll('[data-bar]');
    const eventEl = document.querySelector('[data-key="event"]');

    let currentMood = pick(FUN.mood);

    // Lectura decorativa del panteón: las energías "en palabras" mueven la
    // barra con un valor ambiente al azar; las que llevan % usan ese número.
    const barValue = (txt) => {
      const n = parseFloat(txt);
      return /%$/.test(txt) ? n : Math.round(40 + Math.random() * 52);
    };

    sysEvent = (text) => {
      if (!eventEl) return;
      eventEl.textContent = '› ' + text;
      eventEl.classList.remove('flash');
      requestAnimationFrame(() => eventEl.classList.add('flash'));
    };
    window.addEventListener('lunnie:event', (e) => {
      sysEvent((e && e.detail && e.detail.text) || 'evento puntual del panteón');
    });

    const setRow = (key, val) => {
      labels.forEach((el) => {
        if (el.dataset.key === key) {
          el.textContent = val;
          el.classList.remove('flash');
          requestAnimationFrame(() => el.classList.add('flash'));
        }
      });
    };
    const setBar = (el, v, text) => {
      if (!el) return;
      el.querySelector('i').style.transform = 'scaleX(' + v / 100 + ')';
      const valEl = el.parentElement.querySelector('.val');
      if (valEl) valEl.textContent = text;
    };

    const tick = () => {
      if (document.hidden) return;
      if (Math.random() < 0.3) currentMood = pick(FUN.mood);
      if (Math.random() < 0.15) setRow('sector', SECTORS[Math.floor(Math.random() * SECTORS.length)]);
      setRow('mood', currentMood);

      // Cada respiración elige un estado gracioso nuevo: la lectura jamás
      // se siente rota ni estática, y cambia en cada recarga de la página.
      const eTxt = pick(FUN.energy);
      const sTxt = pick(FUN.signal);
      setRow('energy', eTxt);
      setRow('signal', sTxt);
      if (bars[0]) setBar(bars[0], barValue(eTxt), eTxt);
      if (bars[1]) setBar(bars[1], barValue(sTxt), sTxt);
    };
    tick();
    setInterval(tick, 5600);
  }
  initSysStatus();

  /* ============================================================
     5. SCROLL INDEX (indicador de sección)
     ============================================================ */
  function initScrollIndex() {
    const nav = document.querySelector('.scroll-index');
    const links = nav ? Array.prototype.slice.call(nav.querySelectorAll('a')) : [];
    const sections = [];
    links.forEach((a) => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) sections.push({ a, el });
    });
    if (!sections.length) return;

    if (!('IntersectionObserver' in window)) {
      links.forEach((a) => {
        a.addEventListener('click', () => {});
      });
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          sections.forEach(({ a }) => a.classList.remove('active'));
          const hit = sections.find(({ el }) => el === en.target);
          if (hit) hit.a.classList.add('active');
        });
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
    sections.forEach(({ el }) => io.observe(el));
  }
  initScrollIndex();

  /* ============================================================
     6. PROGRESS HUD (barra superior)
     ============================================================ */
  function initProgress() {
    const bar = document.getElementById('progress-hud');
    if (!bar) return;
    const upd = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = 'scaleX(' + p + ')';
    };
    window.addEventListener('scroll', upd, { passive: true });
    upd();
  }
  initProgress();

  /* ============================================================
     7. SECRETOS / EASTER EGGS
     ============================================================ */

  // 7.1 Konami Code
  (function initKonami() {
    const CODE = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a',
    ];
    let pos = 0;
    document.addEventListener('keydown', (e) => {
      pos = e.key === CODE[pos] ? pos + 1 : e.key === CODE[0] ? 1 : 0;
      if (pos === CODE.length) {
        pos = 0;
        document.body.classList.toggle('konami-mode');
        discover('konami', 'Konami Code: modo alternativo activado.');
        showSysNote('MODO KONAMI // ' + (document.body.classList.contains('konami-mode') ? 'ON' : 'OFF'));
      }
    });
  })();

  // 7.2 Triple click en el logo
  (function initLogo() {
    const title = document.querySelector('.hero-title');
    if (!title) return;
    let c = 0;
    title.addEventListener('click', () => {
      c++;
      if (c >= 3) {
        c = 0;
        document.body.classList.toggle('debug-mode');
        discover('logo-3', 'LUNNIE // DEBUG MODE');
        showSysNote(document.body.classList.contains('debug-mode') ? 'DEBUG MODE ON' : 'DEBUG MODE OFF');
      } else {
        setTimeout(() => { c = 0; }, 1600);
      }
    });
  })();

  // 7.3 Tecla L → destello de pequeña nota
  (function initKeyL() {
    document.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      if (e.key.toLowerCase() === 'l') {
        discover('key-l', 'Presionaste L. Como en Lumière.');
        const t = document.createElement('div');
        t.className = 'nebula-bubble';
        t.innerHTML = '<span>heartbeat //</span>el panteón late ♡';
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 3600);
      }
    });
  })();

  // 7.4 Scroll rápido → glitch
  (function initFastScroll() {
    if (prefersReduced) return;
    let last = window.scrollY;
    let fired = false;
    const flash = document.querySelector('.glitch-flash');
    window.addEventListener(
      'scroll',
      () => {
        const now = window.scrollY;
        const speed = Math.abs(now - last);
        last = now;
        if (speed > 620 && !fired && flash) {
          fired = true;
          flash.classList.add('is-on');
          discover('fast-scroll', 'Interferencia detectada.');
          setTimeout(() => {
            flash.classList.remove('is-on');
            fired = false;
          }, 650);
        }
      },
      { passive: true }
    );
  })();

  // 7.5 Clic en brasa decorativa
  (function initStarTap() {
    document.querySelectorAll('.star-tap').forEach((star) => {
      star.addEventListener('click', () => {
        discover('star-click', 'Tocaste una brasa del panteón.');
        showSysNote('SYS // ESTRELLA " +1 ORO" RECOGIDA ✦');
      });
    });
  })();

  // 7.6 Radio: primer toque con el audio
  (function initRadioDiscover() {
    const toggle = document.getElementById('music-toggle');
    if (!toggle) return;
    const once = () => {
      if (!getDiscovered().includes('radio')) {
        discover('radio', 'GRAVE FM sintonizada.');
      }
    };
    toggle.addEventListener('click', once, { once: true });
  })();

  // 7.7 El enigma de la luna (egg) — décimo y último descubrimiento
  (function initEnigmaDiscover() {
    const trigger = document.getElementById('egg-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', () => {
      discover('egg', 'El enigma de la luna despertó. 🌙');
    });
  })();

  // 7.7 Descubrimiento por llegar al final (footer)
  (function initEndDiscover() {
    const footer = document.querySelector('.site-footer');
    if (!footer || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            discover('footer', 'Fin de la transmisión. Hasta pronto.');
            io.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );
    io.observe(footer);
  })();

  function showSysNote(text) {
    const out = document.createElement('div');
    out.className = 'nebula-bubble';
    out.style.left = '50%';
    out.style.bottom = 'auto';
    out.style.top = '18%';
    out.innerHTML = '<span>crypt core //</span>' + text;
    document.body.appendChild(out);
    setTimeout(() => out.remove(), 3400);
  }

  // 8. Hero-sticker: el avatar flota y se inclina con el cursor
  (function initStickerTilt() {
    const sticker = document.getElementById('hero-sticker');
    if (!sticker || !finePointer || prefersReduced) return;
    const grab = (e) => {
      const r = sticker.getBoundingClientRect();
      const px = (e.clientX - r.left) / Math.max(r.width, 1) - 0.5;
      const py = (e.clientY - r.top) / Math.max(r.height, 1) - 0.5;
      sticker.style.transform =
        'rotate(0deg) rotateY(' + (px * 10).toFixed(2) + 'deg) rotateX(' + (-py * 8).toFixed(2) + 'deg)';
    };
    sticker.addEventListener('mousemove', grab, { passive: true });
    sticker.addEventListener('mouseleave', () => {
      sticker.style.transform = '';
    });
  })();

  // 9. Revelar índice lateral y mascota tras el primer scroll
  //    (el primer viewport pertenece a LUNNIE: índices = secreto)
  (function initRevealGate() {
    const nav = document.querySelector('.scroll-index');
    const gate = () => {
      const past = window.scrollY > Math.min(window.innerHeight * 0.4, 420);
      if (nav) nav.classList.toggle('is-past', past);
      document.body.classList.toggle('is-scrolled', past);
    };
    gate();
    window.addEventListener('scroll', gate, { passive: true });
  })();

  /* init: pintar contador */
  updateCount();
  try {
    if (typeof Object.defineProperty === 'function') {}
  } catch (e) {}
})();