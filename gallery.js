/* ============================================================
   LUNNIE ♡ — gallery.js
   Galería: filtros por categoría + lightbox temático
   "TAKE YOUR TIME / HEAVEN OR HELL".
   Funciona en galeria.html y se auto-desactiva si no hay grid.
   ============================================================ */
(function () {
  'use strict';

  const grid = document.getElementById('gal-grid');
  if (!grid) return;

  const items = Array.from(grid.querySelectorAll('.g-item'));
  const filters = Array.from(document.querySelectorAll('.filter'));
  const empty = document.getElementById('gal-empty');
  const lightbox = document.getElementById('lightbox');

  /* ----------------------------------------------------------
     1. FILTROS
     ---------------------------------------------------------- */
  const visibleItems = () => items.filter((it) => !it.classList.contains('is-hidden'));

  function applyFilter(cat) {
    let anyVisible = false;
    items.forEach((it) => {
      const cats = (it.dataset.cat || '').split(' ');
      const show = cat === 'all' || cats.includes(cat);
      it.classList.toggle('is-hidden', !show);
      if (show) anyVisible = true;
    });
    if (empty) empty.classList.toggle('visible', !anyVisible);
  }

  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.forEach((b) => b.classList.toggle('active', b === btn));
      applyFilter(btn.dataset.filter || 'all');
    });
  });

  /* ----------------------------------------------------------
     2. LIGHTBOX (con estado de reproducción de la lista filtrada)
     ---------------------------------------------------------- */
  if (lightbox) {
    const lbImg = document.getElementById('lb-img');
    const lbTitle = document.getElementById('lb-title');
    const lbCat = document.getElementById('lb-cat');
    const closeBtn = lightbox.querySelector('.lb-close');
    const prevBtn = lightbox.querySelector('.lb-nav.prev');
    const nextBtn = lightbox.querySelector('.lb-nav.next');

    let currentList = [];
    let currentIndex = 0;

    function show(index) {
      const it = currentList[index];
      if (!it) return;
      currentIndex = index;

      const img = it.querySelector('.g-img');
      lbImg.src = img.getAttribute('src');
      lbImg.alt = img.getAttribute('alt') || 'obra de Lunnie';
      lbTitle.textContent = it.dataset.title || 'obra sin título';
      lbCat.textContent = it.dataset.catLabel || '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
    }

    function close() {
      lightbox.hidden = true;
      document.body.style.overflow = '';
    }

    function step(dir) {
      if (!currentList.length) return;
      show((currentIndex + dir + currentList.length) % currentList.length);
    }

    items.forEach((it) => {
      it.addEventListener('click', () => {
        currentList = visibleItems();           // navega por lo filtrado
        show(currentList.indexOf(it));
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (prevBtn) prevBtn.addEventListener('click', () => step(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => step(1));

    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });

    document.addEventListener('keydown', (e) => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }
})();