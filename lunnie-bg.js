/* ============================================================
   LUNNIE ♡ — lunnie-bg.js
   Fondo vivo por capas, con foco en rendimiento:

   1) Parallax de las decoraciones del kit (.fx-layer) — transform.
   2) Campo de brasas procedural con brasas/ceniza REALES de 4 puntas.
      Para no repintar a pantalla completa cada frame, las bandas
      se agrupan así:
        - lejana  → sprite cacheado (background de .px-stars-far)
        - media   → sprite cacheado (background de .px-stars-mid)
        - cercana → solo ~14 brasas vivas en #field-canvas,
                    redibujadas con dirty-rects (no clearRect total)
   3) Parallax al scroll por profundidad (transform, GPU):
        brasa 0.06 · lejana 0.10 · media 0.16 · cercana 0.24
      Nunca se animan top/left/width/height/background-position.

   - respeta prefers-reduced-motion: sin loop y sin scroll (capas
     quietas; se dibuja un fotograma estático).
   - en táctil / móvil reduce el número de brasas.
   ============================================================ */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---------- 1) PARALLAX DE CAPAS DEL KIT ---------- */
  const layers = Array.prototype.slice.call(document.querySelectorAll('.fx-layer'));
  if (layers.length && !prefersReduced && !coarsePointer) {
    let ticking = false;
    const depth = { 'is-far': 0.5, 'is-mid': 0.9, 'is-near': 1.4 };
    const update = () => {
      const y = window.scrollY;
      layers.forEach((layer) => {
        const factor = ['is-far', 'is-mid', 'is-near'].find((c) => layer.className.includes(c));
        const d = factor ? depth[factor] : 0.8;
        layer.style.transform = `translate3d(0, ${y * d * 0.06}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
  }

  /* ---------- 2) CAMPO DE BRASAS ---------- */
  const cv = document.getElementById('field-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const elFar = document.querySelector('.px-stars-far');
  const elMid = document.querySelector('.px-stars-mid');
  const nebula = document.querySelector('.px-nebula');

  const counts = coarsePointer
    ? { far: 46, mid: 20, near: 7 }
    : { far: 96, mid: 44, near: 14 };

  const PARALLAX = { nebula: 0.06, far: 0.1, mid: 0.16, near: 0.24 };
  const wrap = (v, p) => ((v % p) + p) % p;

  // tintes carmesí: ceniza hueso + brasas + destellos ember/rosa
  function pick() {
    const r = Math.random();
    if (r < 0.4) return r < 0.16 ? '#f0eaea' : r < 0.34 ? '#ffffff' : '#e8e8e8';
    if (r < 0.78) return Math.random() < 0.5 ? '#e63946' : '#f2d9dc';
    if (r < 0.92) return '#ff4557';
    return '#ff9aa5';
  }

  // brasa de 4 puntas (tipo ✦), cóncava
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
  let near = [];

  // sprite de banda cacheado -> dataURL para usar como background
  function tileURL(count, minR, maxR, maxDots) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const t = document.createElement('canvas');
    t.width = Math.round(w * dpr);
    t.height = Math.round(h * dpr);
    const c = t.getContext('2d');
    c.scale(dpr, dpr);
    let dots = maxDots;
    for (let i = 0; i < count; i++) {
      const x = rand(4, w - 4);
      const y = rand(10, h - 10);
      const r = rand(minR, maxR);
      const color = pick();
      if (dots > 0 && r <= maxR * 0.55 && Math.random() < 0.42) {
        dots--;
        drawStar(c, x, y, rand(0.6, 1.2), color, rand(0.3, 0.75)); // puntos lejanos
      } else {
        drawStar(c, x, y, r, color, rand(0.45, 0.95));
      }
    }
    return { url: t.toDataURL('image/png'), css: `${w}px ${h}px` };
  }

  function makeNear(count) {
    const list = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    for (let i = 0; i < count; i++) {
      const r = rand(3.2, 6.5);
      const color = pick();
      const box = Math.ceil(r * 8);
      // sprite pre-renderizado: en el loop solo se hace un drawImage con
      // globalAlpha (sin crear gradientes ni rutas por frame)
      const cvs = document.createElement('canvas');
      cvs.width = cvs.height = Math.round(box * dpr);
      const c2 = cvs.getContext('2d');
      c2.scale(dpr, dpr);
      drawStar(c2, box / 2, box / 2, r, color, 1);
      list.push({
        x: rand(50, w - 50),
        y: rand(70, h - 70),
        r: r,
        box: box,
        spr: cvs,
        color: color,
        tw: rand(0, Math.PI * 2),
        tws: rand(0.012, 0.03),
        p: null,
      });
    }
    return list;
  }

  const resize = () => {
    w = window.innerWidth;
    h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    if (elFar) {
      const far = tileURL(counts.far, 0.9, 2.2, 6);
      elFar.style.backgroundImage = `url("${far.url}")`;
      elFar.style.backgroundSize = far.css;
    }
    if (elMid) {
      const mid = tileURL(counts.mid, 1.6, 3.4, 0);
      elMid.style.backgroundImage = `url("${mid.url}")`;
      elMid.style.backgroundSize = mid.css;
    }
    near = makeNear(counts.near);
    window.__starCounts = { far: counts.far, mid: counts.mid, near: counts.near };
  };

  // solo la banda cercana se redibuja: limpia rects viejos y blitea sprites
  function nearFrame() {
    for (const s of near) {
      if (s.p) ctx.clearRect(s.p.x - s.box / 2, s.p.y - s.box / 2, s.box, s.box);
    }
    for (const s of near) {
      s.tw += s.tws;
      const y = wrap(s.y + scrollY * PARALLAX.near, h);
      ctx.globalAlpha = prefersReduced ? 0.7 : 0.5 + (Math.sin(s.tw) + 1) * 0.28;
      ctx.drawImage(s.spr, s.x - s.box / 2, y - s.box / 2, s.box, s.box);
      s.p = { x: s.x, y: y, r: s.r };
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- 3) PARALLAX AL SCROLL ---------- */
  let scrollY = 0;
  let scrollTicking = false;
  const cap = () => h * 0.38; // el sprite sobresale 40%: sin huecos
  const sync = () => {
    scrollY = window.scrollY;
    const shift = Math.min(scrollY, cap());
    if (elFar) elFar.style.transform = `translate3d(0, ${shift * PARALLAX.far}px, 0)`;
    if (elMid) elMid.style.transform = `translate3d(0, ${shift * PARALLAX.mid}px, 0)`;
    if (nebula) nebula.style.transform = `translate3d(0, ${Math.min(scrollY, h * 0.26) * PARALLAX.nebula}px, 0)`;
    scrollTicking = false;
  };
  if (!prefersReduced) {
    window.addEventListener('scroll', () => {
      if (!scrollTicking) { scrollTicking = true; requestAnimationFrame(sync); }
    }, { passive: true });
  }

  /* ---------- arranque ---------- */
  if (prefersReduced) {
    resize();
    nearFrame(); // un fotograma estático
    return;
  }

  let running = true;
  const loop = () => {
    if (!running) return;
    nearFrame();
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