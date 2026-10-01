/* ============================================================
   LUNNIE ♡ — lunnie-bg.js
   Fondo vivo por capas:
   1) Parallax suave sobre .fx-layer (decoraciones del kit).
   2) Campo estelar en canvas con estrellas REALES de 4 puntas
      (generadas proceduralmente, sin imágenes por estrella):
      - banda lejana  (puntos + estrellas tiny)  → tile cacheado
      - banda media   (estrellas medianas)        → tile cacheado
      - banda cercana (estrellas grandes vivas)   → dibujadas por frame
   - respeta prefers-reduced-motion (dibuja un frame estático, sin loop)
   - en táctil / móvil reduce el número de estrellas
   ============================================================ */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

  /* ---------- 1) PARALLAX DE CAPAS ---------- */
  const layers = Array.prototype.slice.call(document.querySelectorAll('.fx-layer'));
  if (layers.length && !prefersReduced && !coarsePointer) {
    let ticking = false;
    const depth = {
      'is-far': 0.5,
      'is-mid': 0.9,
      'is-near': 1.4,
    };
    const update = () => {
      const y = window.scrollY;
      layers.forEach((layer) => {
        const cls = layer.className;
        const factor = ['is-far', 'is-mid', 'is-near'].find((c) => cls.includes(c));
        const d = factor ? depth[factor] : 0.8;
        layer.style.transform = `translate3d(0, ${y * d * 0.06}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
  }

  /* ---------- 2) CAMPO ESTELAR (canvas) ---------- */
  const cv = document.getElementById('field-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');

  const rand = (a, b) => a + Math.random() * (b - a);

  const counts = coarsePointer
    ? { far: 42, mid: 20, near: 7 }
    : { far: 90, mid: 42, near: 14 };

  // tintes de la paleta: blancas de lavanda + toques violeta/ámbar/rosa
  function pick() {
    const r = Math.random();
    if (r < 0.58) return r < 0.2 ? '#efe9ff' : r < 0.42 ? '#ffffff' : '#eadaff';
    if (r < 0.82) return Math.random() < 0.5 ? '#9d4edd' : '#c8b6ff';
    if (r < 0.92) return '#ffd166';
    return '#ffb3c6';
  }

  // estrella de 4 puntas (tipo ✦), cóncava, de frente
  function star4(c, x, y, r) {
    const k = 0.24;
    c.beginPath();
    c.moveTo(x, y - r);
    c.quadraticCurveTo(x + r * k, y - r * k, x + r, y);
    c.quadraticCurveTo(x + r * k, y + r * k, x, y + r);
    c.quadraticCurveTo(x - r * k, y + r * k, x - r, y);
    c.quadraticCurveTo(x - r * k, y - r * k, x, y - r);
    c.closePath();
  }

  function glow(c, x, y, r, color, a) {
    const g = c.createRadialGradient(x, y, 0, x, y, r * 4);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.globalAlpha = a;
    c.fillRect(x - r * 4, y - r * 4, r * 8, r * 8);
  }

  function drawStar(c, x, y, r, color, alpha) {
    c.globalAlpha = alpha;
    if (r < 1.5) {
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fillStyle = color;
      c.fill();
      return;
    }
    if (r >= 2.6) {
      const col = c.createLinearGradient(x - r, y - r, x + r, y + r);
      col.addColorStop(0, color);
      col.addColorStop(1, 'rgba(255,255,255,0.85)');
      c.fillStyle = col;
    } else {
      c.fillStyle = color;
    }
    glow(c, x, y, r, color, 0.06 + (r - 2.6) * 0.02);
    star4(c, x, y, r);
    c.fill();
  }

  let w = 0;
  let h = 0;
  let period = 0;
  let farTile = null;
  let midTile = null;
  let near = [];

  // genera un tile periódico (banda cacheada): puntos + estrellas de la banda
  function makeTile(count, minR, maxR, maxDots) {
    const t = document.createElement('canvas');
    t.width = w;
    t.height = period;
    const c = t.getContext('2d');
    let dots = maxDots;
    for (let i = 0; i < count; i++) {
      const x = rand(2, w - 2);
      const y = rand(2, period - 2);
      const r = rand(minR, maxR);
      const color = pick();
      if (dots > 0 && r <= maxR * 0.5 && Math.random() < 0.42) {
        dots--;
        drawStar(c, x, y, rand(0.6, 1.2), color, rand(0.3, 0.75)); // puntos lejanos
      } else {
        drawStar(c, x, y, r, color, rand(0.45, 0.95));
      }
    }
    return t;
  }

  function makeNear(count) {
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push({
        x: rand(60, w - 60),
        y: rand(80, period - 80),
        r: rand(3.2, 6.5),
        color: pick(),
        tw: rand(0, Math.PI * 2),
        tws: rand(0.012, 0.03),
      });
    }
    return list;
  }

  const resize = () => {
    w = window.innerWidth;
    h = window.innerHeight;
    period = Math.max(h, 700);
    cv.width = w * Math.min(window.devicePixelRatio || 1, 2);
    cv.height = h * Math.min(window.devicePixelRatio || 1, 2);
    ctx.setTransform(Math.min(window.devicePixelRatio || 1, 2), 0, 0, Math.min(window.devicePixelRatio || 1, 2), 0, 0);
    farTile = makeTile(counts.far, 0.9, 2.2, 6);
    midTile = makeTile(counts.mid, 1.6, 3.4, 0);
    near = makeNear(counts.near);
    window.__starCounts = { far: counts.far, mid: counts.mid, near: counts.near };
  };

  let t = 0;
  function frame() {
    ctx.clearRect(0, 0, w, h);

    // lejanas: respiran como grupo (agrupación en un blit, sin nodos por estrella)
    const fa = prefersReduced ? 0.85 : 0.8 + Math.sin(t * 0.62) * 0.14;
    ctx.globalAlpha = fa;
    ctx.drawImage(farTile, 0, 0, w, period);
    ctx.globalAlpha = 1;

    // medias: latido más tenue
    if (!prefersReduced) {
      ctx.globalAlpha = 0.9 + Math.sin(t * 0.92 + 1.7) * 0.08;
    }
    ctx.drawImage(midTile, 0, 0, w, period);
    ctx.globalAlpha = 1;

    // cercanas: estrellas grandes con parpadeo individual (solo ~14)
    for (const s of near) {
      s.tw += s.tws;
      const a = prefersReduced ? 0.7 : 0.5 + (Math.sin(s.tw) + 1) * 0.28;
      drawStar(ctx, s.x, s.y, s.r, s.color, a);
    }

    t += 1;
  }

  if (prefersReduced) {
    resize();
    frame(); // un fotograma estático: estrellas visibles sin movimiento
    return;
  }

  let running = true;
  const loop = () => {
    if (!running) return;
    frame();
    requestAnimationFrame(loop);
  };

  resize();
  loop();
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    running = document.visibilityState === 'visible';
    if (running) loop();
  });
})();