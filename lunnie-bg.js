/* ============================================================
   LUNNIE ♡ — lunnie-bg.js
   Fondo vivo por capas: parallax suave sobre .fx-layer y un
   campo de partículas flotantes en canvas (ligero).
   - respeta prefers-reduced-motion
   - en táctil / móvil reduce o apaga partículas
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

  /* ---------- 2) CAMPO DE PARTÍCULAS (canvas) ---------- */
  const cv = document.getElementById('field-canvas');
  if (!cv || prefersReduced) return;
  const ctx = cv.getContext('2d');
  let w = 0;
  let h = 0;
  const props = coarsePointer ? { n: 22, drift: 0.08 } : { n: 46, drift: 0.18 };

  let particles = [];
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    cv.width = w * dpr;
    cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    spawn();
  };
  const rand = (a, b) => a + Math.random() * (b - a);
  function spawn() {
    particles = Array.from({ length: props.n }, () => ({
      x: rand(0, w),
      y: rand(0, h),
      r: rand(0.6, 2.1),
      vx: rand(-props.drift, props.drift),
      vy: rand(-props.drift * 0.5, props.drift * 0.5),
      tw: rand(0, Math.PI * 2),
      tws: rand(0.008, 0.03),
      amber: Math.random() < 0.22,
    }));
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.tw += p.tws;
      if (p.x < -4) p.x = w + 4;
      if (p.x > w + 4) p.x = -4;
      if (p.y < -4) p.y = h + 4;
      if (p.y > h + 4) p.y = -4;
      const a = 0.25 + (Math.sin(p.tw) + 1) * 0.35;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.amber
        ? `rgba(255, 209, 102, ${a})`
        : `rgba(234, 218, 255, ${a})`;
      ctx.fill();
      // brillo tenue
      if (p.r > 1.5) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = p.amber
          ? 'rgba(255, 209, 102, 0.04)'
          : 'rgba(157, 78, 221, 0.045)';
        ctx.fill();
      }
    }
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