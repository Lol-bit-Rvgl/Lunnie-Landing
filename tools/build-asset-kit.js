/* ============================================================
   LUNNIE ♡ — tools/build-asset-kit.js
   Generador offline del LUNNIE VISUAL ASSET KIT (2ª fase).
   ------------------------------------------------------------
   Todo es arte SVG propio, construido con una sola paleta y un
   solo lenguaje visual: luna + cruce + HUD retro-tumular.
   NO usa imágenes externas. Reorganiza/crea la estructura
   /assets/{backgrounds,decorations,ui,effects,hero,guestbook,
   radio,transmissions,scroll,loading,error,secret,characters,
   favicon,credits}.

   Además escribe /assets/credits/asset-manifest.json con el
   registro de cada asset (nombre, tipo, fuente, autor, licencia,
   ruta y uso) para cumplir el brief fases 4 y 43.

   Uso:  node tools/build-asset-kit.js
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'assets');

/* ---------- paleta KIT (extraída de la UI y el arte actual) ---------- */
const P = {
  space:   '#0a0a0c',
  deep:    '#0a0a0c',
  panel:   '#0f0b22',
  panel2:  '#141416',
  ink:     '#140f24',
  indigo:  '#3a0008',
  violet:  '#8b0000',
  purple:  '#b3001b',
  amber:   '#ff4557',
  amberD:  '#b8862e',
  rose:    '#ff9aa5',
  roseL:   '#ffb3c6',
  txt:     '#efe9ff',
  off:     '#f0eaea',
  dim:     '#b0b0b8',
  line:    '#2e2a4a',
  hex:     '#4a3a7a',
  white:   '#ffffff',
  online:  '#00ff9f',
  idle:    '#ffbf00',
  dnd:     '#c0236b',
  offoff:  '#41434f',
};

/* ---------- helpers SVG ---------- */
const W = (body, vb = '0 0 100 100') =>
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" renderer-info="lunnie-kit">' + body + '</svg>\n';

const grain = (id, base = 1.5, alpha = 0.12) =>
  '<filter id="' + id + '" x="0" y="0" width="100%" height="100%">' +
  '<feTurbulence type="fractalNoise" baseFrequency="' + base + '" numOctaves="2" stitchTiles="stitch"/>' +
  '<feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 ' + alpha + ' 0"/>' +
  '</filter>';

const lin = (id, stops, x2 = 1) =>
  '<linearGradient id="' + id + '" x1="0" y1="0" x2="' + x2 + '" y2="1">' +
  stops.map((s) => '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"/>').join('') + '</linearGradient>';

const rad = (id, stops, fx = 0.5, fy = 0.45) =>
  '<radialGradient id="' + id + '" cx="0.5" cy="0.5" r="0.62" fx="' + fx + '" fy="' + fy + '">' +
  stops.map((s) => '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"/>').join('') + '</radialGradient>';

const dk = (cx, cy, r, fill, opts) =>
  '<path d="M' + cx + ' ' + (cy - r) +
  ' L' + (cx + r * 0.31) + ' ' + (cy - r * 0.31) +
  ' L' + (cx + r) + ' ' + cy +
  ' L' + (cx + r * 0.31) + ' ' + (cy + r * 0.31) +
  ' L' + cx + ' ' + (cy + r) +
  ' L' + (cx - r * 0.31) + ' ' + (cy + r * 0.31) +
  ' L' + (cx - r) + ' ' + cy +
  ' L' + (cx - r * 0.31) + ' ' + (cy - r * 0.31) + ' Z"' +
  ' fill="' + fill + '"' + (opts || '') + '/>';

const blob = (cx, cy, rx, ry, fill, opts) =>
  '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '"' + (opts || '') + '/>';

const cir = (cx, cy, r, fill, opts) =>
  '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '"' + (opts || '') + '/>';

const ring = (cx, cy, r, stroke, w, opts) =>
  '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + stroke + '" stroke-width="' + w + '"' + (opts || '') + '/>';

const rect = (x, y, w, h, fill, opts) =>
  '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '"' + (opts || '') + '/>';

const txt = (x, y, str, size, fill, extra) =>
  '<text x="' + x + '" y="' + y + '" font-family="Tahoma, Arial, sans-serif"' +
  (size ? ' font-size="' + size + '"' : '') + ' fill="' + fill + '"' +
  (extra ? ' ' + extra : '') + '>' + str + '</text>';

/* ---------- registro ---------- */
const assets = [];
function reg(rel, type, usage, svg) {
  assets.push({ file: rel, type, usage, svg });
}

/* ============================================================
   1. BACKGROUNDS — sistema de fondo compuesto (fase §7)
   ============================================================ */
reg('backgrounds/space/space-base.svg', 'background', 'bg-layer-main',
  W(
    '<defs>' +
    rad('sBg', [[0, '#241848'], [0.35, '#140f2e'], [0.7, '#141416'], [1, P.space]], 0.5, 0.3) + '</defs>' +
    '<rect width="1000" height="640" fill="url(#sBg)"/>' +
    '<path d="M0 0 H1000 V640 H0 Z" fill="none" stroke="' + P.hex + '" stroke-opacity="0.06" stroke-width="1"/>',
    '0 0 1000 640'
  ));

reg('backgrounds/space/stars-small.svg', 'background', 'bg-layer-stars-small',
  W(
    (function () {
      let s = '';
      for (let i = 0; i < 90; i++) {
        s += cir((i * 137) % 600, (i * 419) % 360, 1 + ((i * 7) % 3) * 0.4,
          '#ffffff', ' opacity="' + (0.12 + ((i * 13) % 6) * 0.1).toFixed(2) + '"');
      }
      return s;
    })(),
    '0 0 600 360'
  ));

reg('backgrounds/space/stars-large.svg', 'background', 'bg-layer-stars-large',
  W(
    (function () {
      let s = '';
      const c = ['#ffffff', P.amber, P.purple, P.roseL];
      for (let i = 0; i < 22; i++) {
        const x = (i * 173) % 600 + 18;
        const y = (i * 251) % 360 + 14;
        const r = 2 + ((i * 3) % 3);
        s += dk(x, y, r, c[i % 4], ' opacity="' + (0.5 + ((i * 5) % 4) * 0.12).toFixed(2) + '"');
      }
      return s;
    })(),
    '0 0 600 360'
  ));

reg('backgrounds/space/dust.svg', 'background', 'bg-layer-dust',
  W(
    (function () {
      let s = '';
      for (let i = 0; i < 140; i++) {
        s += cir((i * 233) % 648, (i * 331) % 392, 0.6 + ((i * 3) % 4) * 0.5,
          P.off, ' opacity="' + (0.05 + ((i * 11) % 4) * 0.045).toFixed(3) + '"');
      }
      return s;
    })(),
    '0 0 648 392'
  ));

reg('backgrounds/nebula/nebula-primary.svg', 'background', 'bg-layer-nebula-a',
  W(
    '<g opacity="0.55">' +
    '<defs><filter id="nP"><feGaussianBlur stdDeviation="40"/></filter></defs>' +
    blob(190, 180, 210, 150, '#3a0008', ' filter="url(#nP)"') +
    blob(470, 120, 150, 190, '#8b0000', ' filter="url(#nP)" opacity="0.7"') +
    blob(520, 420, 200, 130, '#14040a', ' filter="url(#nP)" opacity="0.8"') +
    blob(120, 420, 160, 120, '#3a0008', ' filter="url(#nP)" opacity="0.6"') +
    '</g>',
    '0 0 640 520'
  ));

reg('backgrounds/nebula/nebula-secondary.svg', 'background', 'bg-layer-nebula-b',
  W(
    '<g opacity="0.5">' +
    '<defs><filter id="nS"><feGaussianBlur stdDeviation="46"/></filter></defs>' +
    blob(460, 150, 190, 170, '#ff9aa5', ' filter="url(#nS)" opacity="0.5"') +
    blob(600, 380, 200, 150, '#b3001b', ' filter="url(#nS)" opacity="0.55"') +
    blob(150, 60, 140, 120, '#8b0000', ' filter="url(#nS)" opacity="0.6"') +
    '</g>',
    '0 0 640 520'
  ));

reg('backgrounds/abstract/bg-dream.svg', 'background', 'bg-alt-dream',
  W(
    '<defs>' +
    rad('d1', [[0, '#3a0008'], [0.55, '#14040a'], [1, P.space]], 0.35, 0.3) +
    '<filter id="dG"><feGaussianBlur stdDeviation="38"/></filter></defs>' +
    '<rect width="640" height="420" fill="url(#d1)"/>' +
    blob(210, 110, 120, 90, '#ffb3c6', ' filter="url(#dG)" opacity="0.35"') +
    dk(430, 90, 10, P.amber, '') + dk(120, 300, 8, P.white, '') + dk(500, 260, 6, P.roseL, ''),
    '0 0 640 420'
  ));

reg('backgrounds/abstract/bg-void.svg', 'background', 'bg-alt-void',
  W(
    '<rect width="640" height="420" fill="#0a0a0c"/>' +
    '<defs><filter id="vG"><feGaussianBlur stdDeviation="30"/></filter></defs>' +
    blob(320, 210, 160, 120, '#141416', ' filter="url(#vG)"') +
    (function () {
      let s = '';
      for (let i = 0; i < 30; i++) {
        s += cir((i * 157) % 640, (i * 293) % 420, 1.2, '#ffffff', ' opacity="' + (0.18 + ((i * 9) % 3) * 0.12).toFixed(2) + '"');
      }
      return s;
    })(),
    '0 0 640 420'
  ));

reg('backgrounds/textures/noise.svg', 'texture', 'texture-grain',
  W(
    '<rect width="300" height="300" fill="#ffffff" filter="' + grain('gN') + '"/>',
    '0 0 300 300'
  ));

reg('backgrounds/textures/scanlines.svg', 'texture', 'texture-scanlines',
  W(
    '<defs><pattern id="sc" width="300" height="3" patternUnits="userSpaceOnUse">' +
    '<rect width="300" height="3" fill="#000000"/>' +
    '<rect width="300" height="1" fill="#ffffff" opacity="0.05"/>' +
    '</pattern></defs>' +
    '<rect width="300" height="300" fill="url(#sc)"/>',
    '0 0 300 300'
  ));

/* ============================================================
   2. DECORATIONS / STARS — sistema de estrellas (fase §9)
   ============================================================ */
const STAR4 = (fill, opts) => W(dk(50, 50, 30, fill, opts));
reg('decorations/stars/star-01.svg', 'decoration', 'star-tap, hero', STAR4(P.amber));
reg('decorations/stars/star-02.svg', 'decoration', 'kit', STAR4(P.purple));
reg('decorations/stars/star-07-bright.svg', 'decoration', 'hero, eggs', W(
  dk(50, 50, 34, P.amber, '') + dk(50, 50, 17, P.amber, ' opacity="0.55"') +
  ring(50, 50, 42, P.amber, 2, ' opacity="0.5"')));

reg('decorations/stars/star-08-glitch.svg', 'decoration', 'glitch', W(
  '<g>' + dk(50, 50, 30, P.purple, '') + dk(58, 56, 30, P.amber, ' opacity="0.85" transform="translate(0 40)"') + dk(50, 50, 30, P.rose, ' opacity="0.6" transform="translate(40 0)"') + '</g>'));

reg('decorations/stars/star-03.svg', 'decoration', 'kit', W(
  '<g transform="translate(50 50) rotate(22)">' + dk(0, 0, 26, '#ffffff', ' opacity="0.9"') + dk(0, 0, 13, P.off, '') + '</g>'));

reg('decorations/stars/star-04.svg', 'decoration', 'kit', W(
  (function () {
    let p = '';
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8;
      const r = i % 2 ? 14 : 30;
      p += (i ? ' L' : 'M') + (50 + r * Math.cos(a)) + ' ' + (50 + r * Math.sin(a));
    }
    return '<path d="' + p + ' Z" fill="' + P.roseL + '" opacity="0.85"/>';
  })()));

reg('decorations/stars/star-05-dot.svg', 'decoration', 'kit', W(cir(50, 50, 6, '#ffffff', '')));
reg('decorations/stars/star-06-dim.svg', 'decoration', 'kit', W(dk(50, 50, 16, P.dim, ' opacity="0.6"')));

reg('decorations/stars/sparkle-01.svg', 'decoration', 'hero, eggs', W(
  dk(50, 50, 34, P.amber, '') +
  '<path d="M50 6 V18 M50 82 V94 M6 50 H18 M82 50 H94" stroke="' + P.amber + '" stroke-width="3" stroke-linecap="round"/>'));

reg('decorations/stars/sparkle-02.svg', 'decoration', 'star-tap', W(
  dk(50, 50, 22, P.white, '') + dk(38, 44, 10, P.purple, ' opacity="0.9"')));

reg('decorations/stars/cross-star.svg', 'decoration', 'kit', W(
  '<path d="M50 8 V92 M8 50 H92" stroke="' + P.purple + '" stroke-width="7" stroke-linecap="round"/>' +
  dk(50, 50, 14, P.amber, '')));

reg('decorations/stars/diamond-star.svg', 'decoration', 'kit', W(
  '<rect x="26" y="26" width="48" height="48" transform="rotate(45 50 50)" fill="none" stroke="' + P.hex + '" stroke-width="3"/>' +
  cir(50, 50, 10, P.white, '')));

reg('decorations/stars/tiny-star.svg', 'decoration', 'kit', W(
  dk(50, 50, 20, '#ffffff', ' opacity="0.75"') + cir(50, 50, 4, P.amber, '')));

reg('decorations/stars/four-point.svg', 'decoration', 'kit', W(
  '<g>' + dk(50, 50, 30, P.purple, '') + dk(50, 50, 15, P.off, ' opacity="0.9"') + '</g>'));

/* ============================================================
   3. DECORATIONS / PLANETS (fase §10)
   ============================================================ */
function planetBody(body, shade, accent, opts) {
  return W(
    '<defs>' + rad('pC', [[0, shade], [0.7, body], [1, P.deep]], 0.35, 0.35) + '</defs>' +
    blob(50, 50, 34, 34, 'url(#pC)', ' stroke="' + accent + '" stroke-width="2.5"') +
    (opts || ''),
    '0 0 100 100'
  );
}
reg('decorations/planets/planet-blue.svg', 'decoration', 'kit', planetBody('#241848', P.indigo, P.purple,
  cir(40, 40, 6, P.off, ' opacity="0.4"') + cir(64, 34, 4, P.off, ' opacity="0.5"') + cir(56, 60, 8, P.off, ' opacity="0.2"')));
reg('decorations/planets/planet-pink.svg', 'decoration', 'kit', planetBody('#3a0008', P.rose, P.roseL,
  dk(60, 38, 7, P.roseL, ' opacity="0.9"') + cir(42, 62, 5, P.roseL, ' opacity="0.5"')));
reg('decorations/planets/planet-purple.svg', 'decoration', 'kit', planetBody(P.violet, P.purple, P.off,
  blob(35, 42, 12, 6, P.deep, ' opacity="0.3"') + blob(62, 58, 9, 5, P.deep, ' opacity="0.3"')));
reg('decorations/planets/planet-ring.svg', 'decoration', 'kit', W(
  '<g transform="translate(50 50) rotate(-18)">' +
  '<ellipse cx="0" cy="-4" rx="40" ry="14" fill="none" stroke="' + P.amber + '" stroke-width="4" opacity="0.85"/>' +
  '<ellipse cx="0" cy="-4" rx="33" ry="12" fill="none" stroke="' + P.hex + '" stroke-width="2" opacity="0.9"/>' +
  '<circle cx="0" cy="0" r="20" fill="' + P.purple + '" stroke="' + P.off + '" stroke-width="2"/>' +
  '</g>'));
reg('decorations/planets/planet-moon.svg', 'decoration', 'kit', W(
  '<defs>' + rad('pm', [[0, '#f0eaea'], [0.75, '#b0b0b8'], [1, P.hex]], 0.4, 0.4) + '</defs>' +
  cir(50, 50, 30, 'url(#pm)', '') +
  cir(40, 38, 7, P.hex, ' opacity="0.35"') + cir(60, 60, 5, P.hex, ' opacity="0.3"') + cir(56, 36, 4, P.hex, ' opacity="0.25"')));
reg('decorations/planets/planet-strange.svg', 'decoration', 'kit', W(
  '<g transform="translate(50 50) rotate(12)">' +
  '<circle cx="0" cy="0" r="26" fill="' + P.rose + '" opacity="0.85"/>' +
  '<circle cx="0" cy="0" r="26" fill="none" stroke="' + P.deep + '" stroke-width="2"/>' +
  '<ellipse cx="7" cy="-2" rx="14" ry="6" transform="rotate(28)" fill="' + P.deep + '" opacity="0.5"/>' +
  '<path d="M-16 -14 Q0 -26 16 -12" fill="none" stroke="' + P.amber + '" stroke-width="3" stroke-linecap="round"/>' +
  '</g>'));

/* ============================================================
   4. DECORATIONS / MOONS (fase §11)
   ============================================================ */
const moonCrescent = (fill, opts) => 
  '<path d="M34 8 a34 34 0 1 0 0 84 a26 26 0 1 1 0 -84 z" fill="' + fill + '"' + (opts || '') + '/>';
reg('decorations/moons/moon-crescent.svg', 'decoration', 'logo, favicon-adjacent', W(
  '<g>'
  + moonCrescent(P.amber, '') + dk(68, 30, 6, P.white, '') + '</g>'));
reg('decorations/moons/moon-half.svg', 'decoration', 'kit', W(
  '<path d="M12 50 a38 38 0 1 0 76 0 z" fill="' + P.off + '" stroke="' + P.hex + '" stroke-width="2.5"/>' +
  cir(60, 40, 5, P.purple, ' opacity="0.6"') + cir(72, 56, 4, P.purple, ' opacity="0.5"')));
reg('decorations/moons/moon-full.svg', 'decoration', 'kit', W(
  '<circle cx="50" cy="50" r="36" fill="' + P.off + '" stroke="' + P.hex + '" stroke-width="2.5"/>' +
  cir(38, 38, 8, '#b0b0b8', ' opacity="0.3"') + cir(62, 60, 6, '#b0b0b8', ' opacity="0.3"') + cir(56, 34, 5, '#b0b0b8', ' opacity="0.25"')));
reg('decorations/moons/moon-glitch.svg', 'decoration', 'glitch', W(
  '<g>' +
  '<path d="M34 8 a34 34 0 1 0 0 84 a26 26 0 1 1 0 -84 z" fill="' + P.purple + '"/>' +
  '<path d="M40 18 a28 28 0 1 0 0 70 a18 18 0 1 1 0 -70 z" fill="' + P.rose + '" opacity="0.85" transform="translate(4 30)"/>' +
  '<path d="M40 18 a28 28 0 1 0 0 70 a18 18 0 1 1 0 -70 z" fill="' + P.amber + '" opacity="0.8" transform="translate(30 0)"/>' +
  '</g>'));
reg('decorations/moons/moon-small.svg', 'decoration', 'kit', W(moonCrescent(P.roseL, '') + cir(70, 26, 4, P.amber, '')));

/* ============================================================
   5. DECORATIONS / SYMBOLS — 16 símbolos propios (fase §12)
   ============================================================ */
reg('decorations/symbols/symbol-plus.svg', 'decoration', 'kit', W('<path d="M50 14 V86 M14 50 H86" stroke="' + P.purple + '" stroke-width="7" stroke-linecap="round"/>'));
reg('decorations/symbols/symbol-cross.svg', 'decoration', 'kit', W('<path d="M25 25 L75 75 M75 25 L25 75" stroke="' + P.rose + '" stroke-width="8" stroke-linecap="round"/>'));
reg('decorations/symbols/symbol-circle.svg', 'decoration', 'kit', W(ring(50, 50, 34, P.purple, 5, '') + cir(50, 50, 8, P.amber, '')));
reg('decorations/symbols/symbol-circle-out.svg', 'decoration', 'kit', W(ring(50, 50, 36, P.hex, 3, '')));
reg('decorations/symbols/symbol-diamond.svg', 'decoration', 'kit', W(rect(26, 26, 48, 48, P.amber, ' transform="rotate(45 50 50)"')));
reg('decorations/symbols/symbol-diamond-out.svg', 'decoration', 'kit', W(rect(26, 26, 48, 48, 'none', ' transform="rotate(45 50 50)" stroke="' + P.purple + '" stroke-width="3"')));
reg('decorations/symbols/symbol-triangle.svg', 'decoration', 'kit', W('<path d="M50 12 L86 80 H14 Z" fill="' + P.violet + '" stroke="' + P.off + '" stroke-width="2" stroke-linejoin="round"/>'));
reg('decorations/symbols/symbol-square.svg', 'decoration', 'kit', W(rect(24, 24, 52, 52, 'none', ' stroke="' + P.roseL + '" stroke-width="5"')));
reg('decorations/symbols/symbol-moon.svg', 'decoration', 'kit-moon', W(moonCrescent(P.purple, ' opacity="0.95"')));
reg('decorations/symbols/symbol-star.svg', 'decoration', 'kit-star', W(dk(50, 50, 30, P.amber, '')));
reg('decorations/symbols/symbol-star-out.svg', 'decoration', 'kit', W(dk(50, 50, 28, 'none', ' stroke="' + P.amber + '" stroke-width="3"')));
reg('decorations/symbols/symbol-dot.svg', 'decoration', 'kit', W(cir(50, 50, 12, P.white, ' opacity="0.9"')));
reg('decorations/symbols/symbol-sparkle.svg', 'decoration', 'kit', W(dk(50, 50, 22, P.purple, '') + dk(30, 30, 9, P.amber, '')));
reg('decorations/symbols/symbol-arrow-r.svg', 'decoration', 'kit', W('<path d="M14 50 H78 M58 26 L80 50 L58 74" fill="none" stroke="' + P.off + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'));
reg('decorations/symbols/symbol-hash.svg', 'decoration', 'kit', W('<g stroke="' + P.roseL + '" stroke-width="6" stroke-linecap="round"><path d="M34 18 V82 M66 18 V82 M18 34 H82 M18 66 H82"/></g>'));
reg('decorations/symbols/symbol-asterisk.svg', 'decoration', 'kit', W(
  '<g stroke="' + P.purple + '" stroke-width="6" stroke-linecap="round">' +
  '<path d="M50 8 V92"/><path d="M18 29 L82 71"/><path d="M82 29 L18 71"/></g>'));
reg('decorations/symbols/symbol-wave.svg', 'decoration', 'radio, tx', W(
  '<g fill="none" stroke="' + P.amber + '" stroke-width="6" stroke-linecap="round">' +
  '<path d="M16 44 Q34 28 52 44 T88 44"/><path d="M16 62 Q34 46 52 62 T88 62" opacity="0.7"/></g>'));
reg('decorations/symbols/symbol-eye-out.svg', 'decoration', 'secret', W(
  '<path d="M6 50 Q30 22 50 50 Q70 78 94 50" fill="none" stroke="' + P.off + '" stroke-width="4"/>' +
  cir(50, 50, 12, 'none', ' stroke="' + P.amber + '" stroke-width="3"') + cir(50, 50, 4, P.amber, '')));

/* ============================================================
   6. DECORATIONS / STICKERS — 15 (fase §13)
   ============================================================ */
const stk = (body, fill, rot) =>
  '<g transform="rotate(' + rot + ' 50 50)">' +
  '<rect x="6" y="8" width="88" height="42" rx="12" fill="' + fill + '" stroke="' + P.ink + '" stroke-width="3"/>' +
  body + '</g>';
const stkT = (str, size, fill, y) => txt(50, typeof y === 'number' ? y : 37, str, size || 15, fill, ' text-anchor="middle" font-weight="bold"');
reg('decorations/stickers/stk-hello.svg', 'decoration', 'guestbook, hero',
  W(stk(stkT('HELLO ♡', 20, P.ink) + '<circle cx="82" cy="26" r="6" fill="' + P.rose + '"/>', P.amber, -4)));
reg('decorations/stickers/stk-online.svg', 'decoration', 'status',
  W(stk(stkT('ONLINE', 20, P.ink) + cir(22, 26, 5, P.online, ''), P.off, 3)));
reg('decorations/stickers/stk-cool.svg', 'decoration', 'guestbook',
  W(stk(stkT('★ COOL', 20, P.ink), P.purple, -7)));
reg('decorations/stickers/stk-signal.svg', 'decoration', 'radio, tx',
  W(stk(stkT('SIGNAL', 18, P.ink) + '<path d="M62 20 q8 6 0 12 M70 14 q14 12 0 24" fill="none" stroke="' + P.ink + '" stroke-width="2.5"/>', P.roseL, 5)));
reg('decorations/stickers/stk-new.svg', 'decoration', 'kit',
  W(stk(stkT('NEW', 22, P.ink), P.rose, -5)));
reg('decorations/stickers/stk-live.svg', 'decoration', 'status, radio',
  W(stk(stkT('LIVE', 20, P.ink) + cir(22, 26, 7, P.dnd, ''), P.amber, 2)));
reg('decorations/stickers/stk-error.svg', 'decoration', 'error-ficticio',
  W(stk(stkT('ERROR?', 19, '#ffffff'), P.dnd, -8)));
reg('decorations/stickers/stk-zzz.svg', 'decoration', 'nexos, kit',
  W(stk(
    '<text x="40" y="30" font-family="Tahoma, Arial, sans-serif" font-size="11" font-weight="bold" fill="' + P.ink + '">Z</text>' +
    '<text x="52" y="38" font-family="Tahoma, Arial, sans-serif" font-size="9" font-weight="bold" fill="' + P.ink + '">z</text>' +
    '<text x="60" y="26" font-family="Tahoma, Arial, sans-serif" font-size="7" font-weight="bold" fill="' + P.ink + '">z</text>' +
    cir(76, 40, 5, P.txt, ' opacity="0.85"')
    , P.violet, 4)));
reg('decorations/stickers/stk-lookhere.svg', 'decoration', 'gitbook',
  W('<g>' + stk(stkT('LOOK HERE', 16, P.ink), P.amber, -3) +
  '<path d="M20 14 L8 8" stroke="' + P.rose + '" stroke-width="6" stroke-linecap="round"/></g>'));
reg('decorations/stickers/stk-secret.svg', 'decoration', 'easter-egg',
  W(stk(stkT('SECRET', 18, '#ffffff') + dk(78, 26, 8, P.amber, ''), P.ink, 7)));
reg('decorations/stickers/stk-wow.svg', 'decoration', 'guestbook',
  W(stk(stkT('WOW', 20, P.ink) + dk(22, 24, 7, P.ink, ''), P.roseL, -6)));
reg('decorations/stickers/stk-cosmic.svg', 'decoration', 'kit',
  W(stk(stkT('COSMIC', 18, P.ink, 40) + '<circle cx="78" cy="30" r="7" fill="none" stroke="' + P.ink + '" stroke-width="2"/>', P.purple, 4)));
reg('decorations/stickers/stk-loading.svg', 'decoration', 'loading',
  W('<g transform="rotate(-2 50 50)"><rect x="6" y="18" width="88" height="24" rx="12" fill="' + P.panel + '" stroke="' + P.amber + '" stroke-width="2.5"/>' +
  '<circle cx="50" cy="30" r="6" fill="none" stroke="' + P.amber + '" stroke-width="3" stroke-dasharray="18 12"/></g>'));
reg('decorations/stickers/stk-commission.svg', 'decoration', 'encargos',
  W(stk(stkT('OPEN', 18, P.ink, 34) + stkT('COMMISSION', 13, P.ink, 46), P.amber, -5)));
reg('decorations/stickers/stk-thanks.svg', 'decoration', 'guestbook, footer',
  W(stk(stkT('THX ♡', 18, P.ink, 38) + stkT('TAKE CARE', 12, P.ink, 48), P.rose, 6)));

/* ============================================================
   7. UI / FRAMES + BORDES (fase §15-16)
   ============================================================ */
const corner = (color, w, extra) =>
  '<path d="M8 34 V8 H34 M92 34 V8 H66 M8 66 V92 H34 M92 66 V92 H66" fill="none" stroke="' + color + '" stroke-width="' + w + '" stroke-linecap="square"' + (extra || '') + '/>';
reg('ui/frames/frame-standard.svg', 'frame', 'gallery, panels',
  W('<path d="M8 92 V8 H92 M8 92 V8 H92" fill="none" stroke="' + P.purple + '" stroke-width="3" opacity="0.9"/>' +
  '<path d="M8 92 V40 M40 8 H8 M92 8 H60 M8 92 H40 M60 92 H92" fill="none" stroke="' + P.amber + '" stroke-width="2" opacity="0.8"/>'));
reg('ui/frames/frame-corner.svg', 'frame', 'gallery-corner',
  W(corner(P.amber, 5, ' opacity="0.85"')));
reg('ui/frames/frame-double.svg', 'frame', 'gallery',
  W('<rect x="8" y="8" width="84" height="84" fill="none" stroke="' + P.off + '" stroke-width="2"/>' +
  '<rect x="14" y="14" width="72" height="72" fill="none" stroke="' + P.purple + '" stroke-width="2" opacity="0.8"/>'));
reg('ui/frames/frame-glitch.svg', 'frame', 'glitch, eggs',
  W('<rect x="8" y="10" width="84" height="84" fill="none" stroke="' + P.rose + '" stroke-width="3"/>' +
  '<rect x="16" y="6" width="84" height="84" fill="none" stroke="' + P.amber + '" stroke-width="3" opacity="0.7" transform="translate(3 0)"/>' +
  '<rect x="12" y="14" width="80" height="72" fill="none" stroke="' + P.purple + '" stroke-width="3" opacity="0.8" transform="translate(-2 0)"/>'));
reg('ui/frames/frame-diagonal.svg', 'frame', 'gallery',
  W('<path d="M-10 110 L110 -10 M-10 90 L90 -10 M10 110 L110 10 M-10 70 L70 -10 M30 110 L110 30" fill="none" stroke="' + P.hex + '" stroke-width="2" opacity="0.9"/>'));
reg('ui/frames/frame-soft.svg', 'frame', 'profiles, soft',
  W('<rect x="10" y="10" width="80" height="80" rx="26" fill="none" stroke="' + P.roseL + '" stroke-width="3" opacity="0.7"/>' +
  '<rect x="16" y="16" width="68" height="68" rx="20" fill="none" stroke="' + P.purple + '" stroke-width="2" opacity="0.5"/>'));

const BR = (body) => {
  const b = 'stroke="' + P.amber + '" stroke-width="6" stroke-linecap="square"';
  return body;
};
reg('ui/panels/border-terminal.svg', 'border', 'terminal-frame',
  W('<path d="M10 40 V10 H90 M10 90 H90 M90 90 V60" fill="none" stroke="' + P.online + '" stroke-width="4" opacity="0.8"/>' +
  '<rect x="16" y="16" width="30" height="16" fill="' + P.ink + '" opacity="0.7"/>'));
reg('ui/panels/border-retro.svg', 'border', 'retro-frame',
  W(BR() + '<rect x="14" y="14" width="72" height="72" fill="none" stroke="' + P.hex + '" stroke-width="3"/>' +
  '<rect x="22" y="22" width="56" height="56" fill="' + P.amber + '" opacity="0.18"/>'));
reg('ui/panels/border-scifi.svg', 'border', 'scifi-frame',
  W('<path d="M8 44 L92 44 L92 30 M8 56 L92 56 M8 30 L8 44" fill="none" stroke="' + P.purple + '" stroke-width="4"/>' +
  '<path d="M10 24 L12 18 L14 24 M86 24 L88 18 L90 24" fill="' + P.amber + '"/>'));
reg('ui/panels/border-decor.svg', 'border', 'decor-frame',
  W('<g fill="' + P.roseL + '"><circle cx="14" cy="14" r="4"/><circle cx="86" cy="14" r="4"/><circle cx="14" cy="86" r="4"/><circle cx="86" cy="86" r="4"/></g>' +
  '<path d="M14 50 L22 42 L30 50 L38 42 L46 50 L54 42 L62 50 L70 42 L78 50 L86 42" fill="none" stroke="' + P.rose + '" stroke-width="3"/>'));
reg('ui/panels/border-glitch.svg', 'border', 'glitch-frame',
  W('<rect x="8" y="8" width="84" height="84" fill="none" stroke="' + P.amber + '" stroke-width="4" transform="translate(2 0)"/>' +
  '<rect x="14" y="4" width="84" height="84" fill="none" stroke="' + P.rose + '" stroke-width="4" transform="translate(-2 0)"/>'));

/* ============================================================
   8. UI / ICONS — pixel-retro 16×16 (fase §17)
   ============================================================ */
const IX = (blocks) => {
  const b = blocks.map((q) => {
    const p = q.split(' ');
    if (p[0] === 'r') return rect(p[1], p[2], p[3], p[4], p[5]);
    if (p[0] === 'd') return rect(p[1], p[2], '4', '4', p[3]);
    return '';
  }).join('');
  return W(b, '0 0 16 16');
};
const Ic = {};
Ic.profile = ['r 3 3 10 10 #b3001b', 'd 5 5 #f0eaea'];
Ic.art = ['r 3 3 10 10 #b3001b', 'd 5 5 #ff9aa5', 'r 5 4 6 6 #ff4557'];
Ic.radio = ['r 3 5 10 9 #b3001b', 'r 6 2 4 2 #f0eaea', 'd 6 8 #ff4557', 'r 8 8 4 4 #0a0a0c'];
Ic.transmission = ['r 3 3 10 10 #b3001b', 'r 5 5 6 1 #ff4557', 'r 5 7 6 2 #f0eaea'];
Ic.guestbook = ['r 3 6 10 7 #b3001b', 'r 5 3 6 3 #f0eaea', 'd 12 5 #ff9aa5'];
Ic.contact = ['r 3 2 10 8 #b3001b', 'd 8 4 #f0eaea', 'r 5 8 6 6 #b3001b', 'd 8 11 #ff4557'];
Ic.settings = ['d 8 8 #ff4557', 'd 8 2 #b3001b', 'd 2 8 #b3001b', 'd 14 8 #b3001b', 'd 8 14 #b3001b'];
Ic.signal = ['d 8 3 #b3001b', 'd 8 13 #b3001b', 'r 3 8 10 1 #ff4557', 'd 5 5 #f0eaea'];
Ic.online = ['d 8 8 #00ff9f', 'r 5 3 1 1 #00ff9f', 'r 11 3 1 1 #00ff9f', 'r 8 2 1 1 #00ff9f'];
Ic.offline = ['d 8 8 #41434f', 'r 4 8 8 1 #b0b0b8', 'r 8 4 1 8 #b0b0b8'];
Ic.music = ['r 5 2 2 10 #b3001b', 'r 12 3 2 8 #ff4557', 'd 10 5 #f0eaea'];
Ic.star = ['d 8 3 #ff4557', 'd 8 13 #ff4557', 'd 3 8 #ff4557', 'd 13 8 #ff4557'];
Ic.moon = ['d 8 5 #f0eaea', 'd 6 5 #f0eaea', 'd 9 12 #b3001b'];
Ic.secret = ['d 8 5 #ff9aa5', 'r 5 10 6 3 #b3001b', 'd 8 6 #0a0a0c'];
Ic.lock = ['r 5 6 6 7 #f0eaea', 'r 6 4 4 3 #ff4557', 'd 8 9 #b3001b'];
Ic.unlock = ['r 5 6 6 7 #f0eaea', 'r 4 4 5 3 #ff4557', 'd 8 9 #b3001b'];
Ic.link = ['d 6 4 #b3001b', 'd 10 12 #b3001b', 'r 5 5 6 6 #ff4557'];
Ic.arrow = ['d 8 3 #f0eaea', 'd 8 13 #f0eaea', 'r 3 8 12 1 #f0eaea', 'd 10 8 #ff4557'];
Object.keys(Ic).forEach((k) => {
  reg('ui/icons/icon-' + k + '.svg', 'icon', 'ui, nav, status', IX(Ic[k]));
});

/* ============================================================
   9. UI / INDICATORS de estado (fase §18)
   ============================================================ */
reg('ui/indicators/status-online.svg', 'status', 'status-online', W(cir(50, 50, 34, P.online, ' opacity="0.16"') + cir(50, 50, 12, P.online, '')));
reg('ui/indicators/status-offline.svg', 'status', 'status-offline', W(cir(50, 50, 12, P.offoff, '') + '<path d="M34 34 L66 66 M66 34 L34 66" stroke="' + P.off + '" stroke-width="4"/>'));
reg('ui/indicators/status-idle.svg', 'status', 'status-idle', W(cir(50, 50, 12, P.idle, ' opacity="0.7"') + '<path d="M50 34 V50 L64 60" fill="none" stroke="' + P.dim + '" stroke-width="4" stroke-linecap="round"/>'));
reg('ui/indicators/status-signal.svg', 'status', 'status-signal',
  W('<g fill="' + P.amber + '"><rect x="14" y="40" width="12" height="20"/><rect x="30" y="28" width="12" height="32"/><rect x="46" y="16" width="12" height="44"/><rect x="62" y="30" width="12" height="30" opacity="0.5"/><rect x="78" y="42" width="12" height="18" opacity="0.3"/></g>'));
reg('ui/indicators/status-warning.svg', 'status', 'status-warning',
  W('<path d="M50 12 L86 82 H14 Z" fill="none" stroke="' + P.idle + '" stroke-width="5" stroke-linejoin="round"/>' +
  '<rect x="46" y="38" width="8" height="24" fill="' + P.idle + '"/><rect x="46" y="68" width="8" height="8" fill="' + P.idle + '"/>'));
reg('ui/indicators/status-error.svg', 'status', 'status-error',
  W('<circle cx="50" cy="50" r="34" fill="none" stroke="' + P.dnd + '" stroke-width="5"/>' +
  '<path d="M38 38 L62 62 M62 38 L38 62" stroke="' + P.dnd + '" stroke-width="6" stroke-linecap="round"/>'));
reg('ui/indicators/status-loading.svg', 'status', 'loading',
  W('<circle cx="50" cy="50" r="26" fill="none" stroke="' + P.purple + '" stroke-width="6" opacity="0.4"/>' +
  '<circle cx="50" cy="50" r="26" fill="none" stroke="' + P.amber + '" stroke-width="6" stroke-dasharray="40 122" stroke-linecap="round"/>'));

/* ============================================================
   10. UI / BADGES 88×31 (fase §14)
   ============================================================ */
const badge = (text, sub, bg, fg, mono) => {
  const border = mono ? P.dim : P.off;
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 31" renderer-info="lunnie-kit">' +
    (mono ? '' : '<defs>' + grain('gB', 1.7, 0.1) + '</defs>') +
    '<rect width="88" height="31" fill="' + bg + '"/>' +
    '<path d="M44 0 H88 V31 H44 Z" fill="' + (mono ? 'transparent' : P.indigo) + '" opacity="' + (mono ? 0 : 0.55) + '"/>' +
    '<path d="M44 0 L66 16 L44 31 L22 16 Z" fill="' + (mono ? 'transparent' : P.violet) + '" opacity="' + (mono ? 0 : 0.35) + '"/>' +
    '<rect width="88" height="31" fill="none" stroke="' + border + '" stroke-width="1" opacity="0.85"/>' +
    (mono ? '' : '<rect width="88" height="31" fill="#fff" filter="url(#gB)"/>') +
    txt(44, 20, text, 9, fg, ' font-weight="bold" text-anchor="middle"') +
    (sub ? txt(44, 6, sub, 5, mono ? P.dim : P.off, ' text-anchor="middle"') : '') +
    '</svg>\n';
};
reg('ui/badges/badge-exe.svg', 'badge', 'status, footer',
  badge('LUNNIE.EXE', 'COSMIC SYSTEM · V1.5', '#14040a', '#ffffff', false));
reg('ui/badges/badge-night.svg', 'badge', 'footer, kit',
  badge('BEST VIEWED', 'AT NIGHT ♡', '#141416', '#f0eaea', false));
reg('ui/badges/badge-cosmic.svg', 'badge', 'footer, kit',
  badge('COSMIC WEB', 'NEOCITIES CRYPT 17', '#3a0008', '#ff4557', false));
reg('ui/badges/badge-signal.svg', 'badge', 'status, kit',
  badge('SIGNAL ONLINE', '●●● TRANSMITTING', '#0f0b22', '#00ff9f', false));
reg('ui/badges/badge-love.svg', 'badge', 'footer, kit',
  badge('MADE WITH ♥', 'LUNNIE · MX', '#c0236b', '#ffffff', false));
reg('ui/badges/badge-fm.svg', 'badge', 'radio, kit',
  badge('GRAVE FM', '★ RADIO DEL PANTEÓN', '#14040a', '#ff4557', false));
reg('ui/badges/badge-space.svg', 'badge', 'kit',
  badge('I ♥ RIP', 'EST. 2026', '#141416', '#b3001b', false));
reg('ui/badges/badge-artist.svg', 'badge', 'kit',
  badge('DIGITAL ARTIST', 'GG / P5 ADDICT', '#8b0000', '#ffffff', false));
reg('ui/badges/badge-exe-mono.svg', 'badge', 'kit-mono',
  badge('LUNNIE.EXE', 'V1.5', '#0a0a0c', '#b0b0b8', true));
reg('ui/badges/badge-fm-mono.svg', 'badge', 'kit-mono',
  badge('GRAVE FM', '87.9', '#0a0a0c', '#b0b0b8', true));
reg('ui/badges/badge-space-mono.svg', 'badge', 'kit-mono',
  badge('I ♥ RIP', 'MX', '#0a0a0c', '#b0b0b8', true));

/* ============================================================
   11. UI / CURSORS (fase §19)
   ============================================================ */
reg('ui/cursors/cursor-default.svg', 'cursor', 'cursor-default',
  W('<circle cx="8" cy="8" r="6" fill="' + P.amber + '" fill-opacity="0.55" stroke="' + P.ink + '" stroke-width="2"/>', '0 0 32 32'));
reg('ui/cursors/cursor-link.svg', 'cursor', 'cursor-link',
  W('<circle cx="8" cy="8" r="7" fill="' + P.purple + '" fill-opacity="0.6"/><path d="M3 8 L6 8 L8 5 L10 8 L13 8" stroke="' + P.ink + '" stroke-width="2" fill="none"/>', '0 0 32 32'));
reg('ui/cursors/cursor-art.svg', 'cursor', 'cursor-art',
  W(dk(8, 8, 7, P.rose, ' opacity="0.9"') + dk(8, 8, 4, P.off, ''), '0 0 32 32'));
reg('ui/cursors/cursor-secret.svg', 'cursor', 'cursor-secret',
  W(moonCrescent(P.amber, ' transform="scale(0.5) translate(12 8)"') + cir(20, 12, 3, P.ink, ''), '0 0 32 32'));
reg('ui/cursors/cursor-drag.svg', 'cursor', 'cursor-drag',
  W('<path d="M8 4 V20 M4 8 H20 M8 4 L4 8 L8 8 L8 4 M8 20 L12 16 L8 16 Z" fill="none" stroke="' + P.off + '" stroke-width="2"/>', '0 0 32 32'));

/* ============================================================
   12. UI / ORBITS (fase §23)
   ============================================================ */
reg('ui/orbits/orbit-small.svg', 'orbit', 'radio, fm', W(
  '<g fill="none" stroke="' + P.hex + '" stroke-width="2">' +
  '<ellipse cx="50" cy="50" rx="44" ry="16"/><circle cx="92" cy="42" r="3" fill="' + P.amber + '" stroke="none"/></g>'));
reg('ui/orbits/orbit-medium.svg', 'orbit', 'hero, art', W(
  '<g fill="none">' +
  '<ellipse cx="50" cy="50" rx="46" ry="20" stroke="' + P.purple + '" stroke-width="2" opacity="0.8"/>' +
  '<ellipse cx="50" cy="50" rx="46" ry="20" stroke="' + P.amber + '" stroke-width="2" stroke-dasharray="4 8" transform="rotate(60 50 50)" opacity="0.7"/>' +
  '<circle cx="6" cy="46" r="3" fill="' + P.rose + '" stroke="none"/></g>'));
reg('ui/orbits/orbit-large.svg', 'orbit', 'hero, art', W(
  '<g fill="none">' +
  '<ellipse cx="50" cy="50" rx="48" ry="34" stroke="' + P.violet + '" stroke-width="2" opacity="0.6"/>' +
  '<ellipse cx="50" cy="50" rx="48" ry="34" stroke="' + P.off + '" stroke-width="1" opacity="0.5" transform="rotate(-40 50 50)"/>' +
  '<circle cx="4" cy="58" r="2.5" fill="' + P.amber + '" stroke="none"/></g>'));
reg('ui/orbits/orbit-broken.svg', 'orbit', 'glitch, error', W(
  '<g fill="none" stroke="' + P.rose + '" stroke-width="2" opacity="0.8">' +
  '<path d="M50 50 M12 50 A38 38 0 0 1 62 34 M62 34 L60 30 M60 34 L64 34" stroke-linecap="round"/></g>' +
  '<path d="M50 16 L40 46 L56 40 Z" fill="' + P.amber + '" opacity="0.8"/>'));

/* ============================================================
   13. UI / HUD (fase §24)
   ============================================================ */
reg('ui/hud/hud-coordinates.svg', 'hud', 'hero-coords',
  W('<rect x="4" y="30" width="20" height="40" fill="' + P.panel + '" stroke="' + P.hex + '" stroke-width="2"/>' +
  '<text x="14" y="22" font-family="monospace" font-size="9" fill="' + P.amber + '" text-anchor="middle">17</text>' +
  '<path d="M34 20 H78 M34 80 H78 M42 24 V76 M70 24 V76" stroke="' + P.hex + '" stroke-width="2" opacity="0.8"/>' +
  '<rect x="44" y="42" width="6" height="16" fill="' + P.amber + '"/><rect x="52" y="34" width="6" height="24" fill="' + P.purple + '"/><rect x="60" y="48" width="6" height="10" fill="' + P.amber + '" opacity="0.8"/>'));
reg('ui/hud/hud-crosshair.svg', 'hud', 'kit', W(
  '<g stroke="' + P.amber + '" stroke-width="2" fill="none">' +
  '<circle cx="50" cy="50" r="18"/><circle cx="50" cy="50" r="30" opacity="0.4"/>' +
  '<path d="M50 6 V26 M50 74 V94 M6 50 H26 M74 50 H94"/><circle cx="50" cy="50" r="3" fill="' + P.amber + '" stroke="none"/></g>'));
reg('ui/hud/hud-scan-target.svg', 'hud', 'kit', W(
  '<g stroke="' + P.online + '" stroke-width="2" fill="none">' +
  '<path d="M34 8 H8 V34 M92 34 H66 M8 66 V92 H34 M66 92 H92"/>' + '</g>' +
  '<circle cx="50" cy="50" r="20" fill="none" stroke="' + P.hex + '" stroke-width="2" stroke-dasharray="4 6"/>' +
  '<path d="M50 30 Q72 42 50 50 Q28 58 50 70" fill="' + P.online + '" opacity="0.15"/>'));
reg('ui/hud/hud-signal-bars.svg', 'hud', 'status-signal', W(
  '<g stroke="' + P.amber + '" stroke-width="5" stroke-linecap="round" fill="none">' +
  '<path d="M14 70 L42 42 M26 70 L42 55 M38 70 L42 66 M42 42 L42 70"/>' + '</g>' +
  '<path d="M48 42 L66 58 M48 52 L66 66 M48 62 L66 70" stroke="' + P.hex + '" stroke-width="3" stroke-linecap="round" fill="none"/>'));
reg('ui/hud/hud-radar.svg', 'hud', 'radio-fm', W(
  '<g stroke="' + P.purple + '" stroke-width="1.5" fill="none" opacity="0.9">' +
  '<circle cx="50" cy="50" r="40"/><circle cx="50" cy="50" r="27"/><circle cx="50" cy="50" r="14"/>' +
  '<path d="M50 10 V90 M10 50 H90"/></g>' +
  '<path d="M50 50 L82 34 A32 32 0 0 1 88 50 Z" fill="' + P.amber + '" opacity="0.35"/>' +
  dk(72, 28, 6, P.amber, '') + dk(34, 66, 4, P.roseL, ' opacity="0.9"')));
reg('ui/hud/hud-status-line.svg', 'hud', 'status, progress', W(
  '<g stroke="' + P.hex + '" stroke-width="2">' +
  '<path d="M0 12 H70 M84 12 H200 M0 20 H40 M54 20 H120 M140 20 H200" opacity="0.9"/>' +
  '<rect x="72" y="8" width="10" height="16" fill="' + P.amber + '"/><rect x="122" y="8" width="6" height="16" fill="' + P.purple + '"/></g>', '0 0 200 28'));

/* ============================================================
   14. EFFECTS / GLITCH (fase §25)
   ============================================================ */
reg('effects/glitch/glitch-horizontal.svg', 'effect', 'glitch-flash', W(
  '<g fill="' + P.rose + '" opacity="0.8"><rect x="0" y="6" width="100" height="3"/><rect x="0" y="34" width="100" height="2"/><rect x="0" y="58" width="100" height="4"/><rect x="0" y="84" width="100" height="2"/></g>' +
  '<g fill="' + P.amber + '" opacity="0.7"><rect x="0" y="16" width="100" height="2"/><rect x="0" y="46" width="100" height="3"/><rect x="0" y="70" width="100" height="2"/></g>'));
reg('effects/glitch/glitch-block.svg', 'effect', 'glitch-eggs', W(
  '<g>' + rect(10, 20, 40, 18, P.purple, '') + rect(50, 26, 34, 12, P.rose, ' opacity="0.8" transform="translate(6 0)"') +
  rect(18, 52, 52, 14, P.amber, ' opacity="0.8" transform="translate(-4 0)"') + '</g>'));
reg('effects/glitch/glitch-lines.svg', 'effect', 'glitch-lines', W(
  '<g stroke="' + P.purple + '" stroke-width="2" opacity="0.9">' +
  '<path d="M0 20 H30 L36 8 L44 34 L52 20 H100"/><path d="M0 64 H22 L30 52 L40 76 L52 64 H80"/></g>' +
  '<g stroke="' + P.amber + '" stroke-width="2" opacity="0.6" transform="translate(3 0)">' +
  '<path d="M0 20 H30 L36 8 L44 34 L52 20 H100"/></g>'));
reg('effects/glitch/glitch-noise.svg', 'effect', 'glitch-noise', W(
  '<rect width="100" height="100" filter="' + grain('gF', 20, 0.35) + '"/>' +
  '<rect width="100" height="100" filter="' + grain('gG', 5, 0.25) + '" opacity="0.7"/>'));

/* ============================================================
   15. HERO kit (fase §22)
   ============================================================ */
reg('hero/hero-stars.svg', 'hero', 'hero-bg', W(
  (function () {
    let s = '';
    for (let i = 0; i < 46; i++) {
      s += cir((i * 137 + 40) % 600, (i * 419 + 30) % 300, 1 + ((i * 7) % 3) * 0.5, '#ffffff', ' opacity="' + (0.15 + ((i * 13) % 5) * 0.1).toFixed(2) + '"');
    }
    for (let i = 0; i < 8; i++) {
      s += dk((i * 271 + 30) % 580, (i * 173 + 24) % 280, 3 + (i % 3), [P.amber, P.purple, P.roseL][i % 3], ' opacity="0.8"');
    }
    return s;
  })(), '0 0 600 300'));
reg('hero/hero-orbit.svg', 'hero', 'hero-orbit', W(
  '<g fill="none">' +
  '<ellipse cx="50" cy="50" rx="46" ry="18" stroke="' + P.purple + '" stroke-width="2" opacity="0.75"/>' +
  '<ellipse cx="50" cy="50" rx="46" ry="18" stroke="' + P.amber + '" stroke-width="2" stroke-dasharray="5 9" transform="rotate(55 50 50)" opacity="0.65"/>' +
  '<circle cx="96" cy="44" r="2.5" fill="' + P.rose + '" stroke="none"/></g>'
));
reg('hero/hero-grid.svg', 'hero', 'hero-grid', W(
  '<defs><pattern id="hg" width="24" height="24" patternUnits="userSpaceOnUse">' +
  '<path d="M24 0 H0 V24" fill="none" stroke="' + P.hex + '" stroke-width="1" opacity="0.55"/></pattern></defs>' +
  '<rect width="240" height="200" fill="url(#hg)"/>' +
  '<circle cx="24" cy="24" r="2" fill="' + P.amber + '" opacity="0.8"/>' +
  '<circle cx="144" cy="120" r="2" fill="' + P.purple + '" opacity="0.8"/>', '0 0 240 200'));
reg('hero/hero-sparkles.svg', 'hero', 'hero-sparkles', W(
  (function () {
    let s = '';
    for (let i = 0; i < 12; i++) {
      s += dk((i * 97 + 20) % 480, (i * 149 + 18) % 240, 3 + (i % 3), ['#ffffff', P.amber, P.roseL][i % 3], ' opacity="' + (0.5 + (i % 3) * 0.15).toFixed(2) + '"');
    }
    return s;
  })(), '0 0 480 240'));
reg('hero/hero-decor-left.svg', 'hero', 'hero-decor', W(
  '<g>' + moonCrescent(P.purple, ' opacity="0.9" transform="scale(0.8) translate(8 10)"') +
  dk(84, 30, 7, P.amber, '') + dk(30, 78, 5, P.roseL, '') + dk(66, 84, 4, P.off, ' opacity="0.8"') + '</g>'));
reg('hero/hero-decor-right.svg', 'hero', 'hero-decor', W(
  '<g>' + ring(26, 30, 18, P.violet, 2, ' opacity="0.8" stroke-dasharray="4 6"') +
  dk(70, 22, 6, P.amber, '') + dk(78, 66, 5, P.purple, '') + dk(38, 74, 4, P.roseL, '') + '</g>'));
reg('hero/hero-signal.svg', 'hero', 'hero-signal', W(
  '<g fill="none" stroke="' + P.amber + '" stroke-width="4" stroke-linecap="round">' +
  '<path d="M16 40 Q32 26 48 40 T80 40" opacity="0.9"/>' +
  '<path d="M16 56 Q32 42 48 56 T80 56" opacity="0.6"/>' +
  '<path d="M16 72 Q32 58 48 72 T80 72" opacity="0.35"/></g>'));

/* ============================================================
   16. GUESTBOOK notes & misc (fase §30)
   ============================================================ */
const note = (color, shade, text) =>
  '<g transform="rotate(3 50 50)">' +
  '<rect x="6" y="8" width="88" height="86" rx="6" fill="' + color + '" stroke="' + P.ink + '" stroke-width="2.5"/>' +
  '<path d="M14 24 H86 M14 44 H86 M14 64 H86" stroke="' + shade + '" stroke-width="2" opacity="0.6"/>' +
  '</g>';
reg('guestbook/note-pink.svg', 'note', 'guestbook', W(note('#ffb3c6', '#ff9aa5', '')));
reg('guestbook/note-blue.svg', 'note', 'guestbook', W(note('#e8e8e8', '#b0b0b8', '')));
reg('guestbook/note-yellow.svg', 'note', 'guestbook', W(note('#ffe08a', '#e0a800', '')));
reg('guestbook/note-purple.svg', 'note', 'guestbook', W(note('#f5ccd2', '#b3001b', '')));
reg('guestbook/sticker-star.svg', 'guestbook', 'guestbook, decor', W(dk(50, 50, 34, P.amber, ' stroke="' + P.ink + '" stroke-width="2"')));
reg('guestbook/sticker-heart.svg', 'guestbook', 'guestbook, footer', W(
  '<path d="M50 82 C38 70 16 60 16 42 C16 30 26 20 38 22 C38 30 44 26 50 22 C56 26 62 30 62 22 C74 20 84 30 84 42 C84 60 62 70 50 82 Z" fill="' + P.rose + '" stroke="' + P.ink + '" stroke-width="2"/>'));
reg('guestbook/sticker-moon.svg', 'guestbook', 'guestbook, kit', W(moonCrescent(P.purple, ' stroke="' + P.ink + '" stroke-width="2"')));
reg('guestbook/tape.svg', 'guestbook', 'guestbook, notes', W(
  '<rect x="14" y="4" width="72" height="26" rx="4" fill="' + P.off + '" opacity="0.82"/>' +
  '<path d="M20 8 L30 28 M34 8 L44 28 M48 8 L58 28 M62 8 L72 28 M76 8 L84 26" stroke="' + P.dim + '" stroke-width="1.5" opacity="0.7"/>', '0 0 100 36'));
reg('guestbook/pin.svg', 'guestbook', 'guestbook, notes', W(
  '<circle cx="50" cy="22" r="18" fill="' + P.rose + '" stroke="' + P.ink + '" stroke-width="3"/>' +
  '<circle cx="50" cy="22" r="7" fill="' + P.off + '"/>' +
  '<path d="M50 40 L50 92" stroke="' + P.ink + '" stroke-width="4" stroke-linecap="round"/>' +
  '<path d="M38 92 H62" stroke="' + P.ink + '" stroke-width="4" stroke-linecap="round"/>'));

/* ============================================================
   17. RADIO (fase §31)
   ============================================================ */
reg('radio/radio-dial.svg', 'radio', 'radio-dial', W(
  '<g>' + ring(50, 50, 40, P.purple, 5, '') +
  '<path d="M50 10 A40 40 0 0 1 85 26 L58 48" fill="' + P.amber + '" stroke="' + P.ink + '" stroke-width="2"/>' +
  (function () {
    let s = '';
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      s += '<path d="M' + (50 + 33 * Math.cos(a)) + ' ' + (50 + 33 * Math.sin(a)) +
        ' L' + (50 + 38 * Math.cos(a)) + ' ' + (50 + 38 * Math.sin(a)) +
        '" stroke="' + P.off + '" stroke-width="2" opacity="0.7"/>';
    }
    return s;
  })() + '</g>'));
reg('radio/radio-wave.svg', 'radio', 'radio-signal', W(
  '<g fill="none" stroke="' + P.amber + '" stroke-width="5" stroke-linecap="round">' +
  '<path d="M50 6 V38 M30 16 L50 32 M70 16 L50 32"/></g>' + dk(50, 74, 12, P.amber, '')));
reg('radio/radio-speaker.svg', 'radio', 'radio-ui', W(
  '<g>' + '<path d="M14 38 H36 L58 18 V82 L36 62 H14 Z" fill="' + P.purple + '"/>' +
  '<path d="M66 36 Q78 48 66 62 M72 28 Q90 46 72 68" fill="none" stroke="' + P.off + '" stroke-width="4" stroke-linecap="round"/></g>'));
reg('radio/radio-signal.svg', 'radio', 'radio-ui', W(
  '<g fill="none" stroke="' + P.off + '" stroke-width="5" stroke-linecap="round">' +
  '<path d="M16 44 Q34 28 52 44 T88 44" opacity="0.9"/>' +
  '<path d="M16 62 Q34 46 52 62 T88 62" opacity="0.55"/></g>'));
reg('radio/radio-knob.svg', 'radio', 'radio-toggle', W(
  '<g>' + ring(50, 50, 32, P.purple, 6, '') +
  '<circle cx="50" cy="50" r="20" fill="url(#kG)"/>' +
  '<defs>' + radialish('kG', [[0, P.purple], [1, P.deep]]) + '</defs>' +
  '<rect x="48" y="30" width="4" height="14" fill="' + P.amber + '"/><circle cx="50" cy="50" r="5" fill="' + P.ink + '"/></g>'));

function radialish(id, stops) {
  return '<radialGradient id="' + id + '" cx="0.5" cy="0.5" r="0.6"><stop offset="' + stops[0][0] + '" stop-color="' + stops[0][1] + '"/><stop offset="' + stops[1][0] + '" stop-color="' + stops[1][1] + '"/></radialGradient>';
}

/* ============================================================
   18. TRANSMISSIONS (fase §32)
   ============================================================ */
reg('transmissions/terminal-frame.svg', 'tx', 'terminal-frame', W(
  '<g>' +
  '<rect x="4" y="4" width="92" height="92" fill="' + P.panel + '" opacity="0.9" stroke="' + P.hex + '" stroke-width="2"/>' +
  '<path d="M10 12 H90 M10 88 H90 M12 10 V90 M88 10 V90" stroke="' + P.online + '" stroke-width="2" opacity="0.6"/>' +
  '<rect x="16" y="20" width="8" height="8" fill="' + P.dnd + '"/><text x="30" y="28" font-family="monospace" font-size="8" fill="' + P.off + '">RIP//TX</text></g>'));
reg('transmissions/transmission-icon.svg', 'tx', 'tx-icon', W(
  '<rect x="10" y="14" width="56" height="72" fill="' + P.purple + '" stroke="' + P.off + '" stroke-width="2"/>' +
  '<path d="M66 26 L88 16 L84 40 L80 44 L92 60 L70 64 Z" fill="' + P.amber + '" opacity="0.9"/>' +
  '<rect x="18" y="26" width="40" height="4" fill="' + P.off + '"/>' +
  '<rect x="18" y="34" width="40" height="4" fill="' + P.off + '" opacity="0.7"/>' +
  '<rect x="18" y="42" width="24" height="4" fill="' + P.dim + '"/>'));
reg('transmissions/signal-wave.svg', 'tx', 'tx-wave', W(
  '<g stroke="' + P.online + '" stroke-width="3" fill="none" stroke-linecap="round">' +
  '<path d="M18 46 Q32 32 46 46 T74 46" opacity="0.9"/>' +
  '<path d="M18 58 Q32 44 46 58 T74 58" opacity="0.6"/>' +
  '<path d="M18 70 Q32 56 46 70 T74 70" opacity="0.3"/></g>'));
reg('transmissions/timestamp-icon.svg', 'tx', 'tx-timestamp', W(
  '<circle cx="50" cy="50" r="36" fill="none" stroke="' + P.amber + '" stroke-width="4"/>' +
  '<path d="M50 26 V50 L66 62" fill="none" stroke="' + P.amber + '" stroke-width="4" stroke-linecap="round"/>' +
  '<circle cx="50" cy="50" r="4" fill="' + P.amber + '"/>'));
reg('transmissions/message-marker.svg', 'tx', 'tx-marker', W(
  '<rect x="10" y="8" width="80" height="58" rx="8" fill="' + P.panel + '" stroke="' + P.purple + '" stroke-width="3"/>' +
  '<path d="M22 66 L18 82 L40 66 Z" fill="' + P.purple + '"/>' +
  '<rect x="22" y="24" width="56" height="4" fill="' + P.off + '"/>' +
  '<rect x="22" y="34" width="40" height="4" fill="' + P.dim + '"/>' +
  '<rect x="22" y="44" width="30" height="4" fill="' + P.hex + '"/>'));

/* ============================================================
   19. SCROLL (fase §29)
   ============================================================ */
reg('scroll/scroll-star.svg', 'scroll', 'scroll-decor', W(dk(50, 50, 30, P.amber, '') + dk(36, 40, 12, P.off, '')));
reg('scroll/scroll-arrow.svg', 'scroll', 'scroll-decor', W(
  '<path d="M50 90 V10 M50 30 L20 60 M50 30 L80 60" fill="none" stroke="' + P.off + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'));
reg('scroll/scroll-orbit.svg', 'scroll', 'scroll-decor', W(
  '<g fill="none">' + ring(50, 50, 40, P.purple, 3, '') + '<ellipse cx="50" cy="50" rx="40" ry="16" stroke="' + P.hex + '" stroke-width="2" opacity="0.9"/>' +
  dk(50, 50, 14, P.purple, '') + '<circle cx="90" cy="38" r="3" fill="' + P.amber + '" stroke="none"/></g>'));
reg('scroll/scroll-signal.svg', 'scroll', 'scroll-decor', W(
  '<g fill="none" stroke="' + P.amber + '" stroke-width="5" stroke-linecap="round">' +
  '<path d="M20 40 Q38 24 56 40 T92 40"/><path d="M20 56 Q38 40 56 56 T92 56" opacity="0.6"/>' +
  '<path d="M20 72 Q38 56 56 72 T92 72" opacity="0.3"/></g>'));

/* ============================================================
   20. LOADING (fase §33)
   ============================================================ */
reg('loading/loading.svg', 'loading', 'loading-connecting', W(
  '<g>' + ring(50, 50, 24, P.hex, 4, '') + ring(50, 50, 24, P.amber, 4, ' stroke-dasharray="36 114" stroke-linecap="round"') +
  (function () {
    let s = '';
    for (let i = 0; i < 3; i++) {
      s += cir(38 + i * 12, 84, 4.5, [P.purple, P.purple, P.amber][i], ' opacity="' + (0.5 + i * 0.2) + '"');
    }
    return s;
  })() + '</g>'));

/* ============================================================
   21. ERROR ficticio (fase §34)
   ============================================================ */
reg('error/error-frame.svg', 'error', 'error-shell', W(
  '<g fill="none" stroke="' + P.dnd + '" stroke-width="2">' +
  '<rect x="6" y="6" width="88" height="88" rx="4"/>' +
  '<path d="M6 20 H94 M6 68 H94"/></g>' +
  dk(50, 40, 14, P.dnd, ' opacity="0.9"') +
  '<rect x="30" y="78" width="40" height="10" fill="' + P.panel + '" stroke="' + P.dnd + '" stroke-width="2"/>'));
reg('error/error-reconnect.svg', 'error', 'error-btn', W(
  '<g fill="none" stroke="' + P.amber + '" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M40 30 A22 22 0 1 0 66 50"/><path d="M40 30 H58 M40 30 V48"/></g>' +
  '<path d="M16 56 H84" stroke="' + P.hex + '" stroke-width="3" stroke-linecap="round"/>' +
  '<text x="50" y="88" font-family="Tahoma, Arial, sans-serif" font-size="10" fill="' + P.off + '" text-anchor="middle">RECONNECT</text>'));

/* ============================================================
   22. SECRET / easter eggs (fase §35)
   ============================================================ */
reg('secret/secret-star.svg', 'secret', 'easter-egg', W(
  dk(50, 50, 34, P.amber, ' stroke="' + P.ink + '" stroke-width="2"') + cir(50, 50, 4, P.ink, ' transform="scale(0.4)"')));
reg('secret/secret-door.svg', 'secret', 'easter-egg', W(
  '<rect x="16" y="10" width="68" height="80" fill="' + P.violet + '" stroke="' + P.off + '" stroke-width="3"/>' +
  '<path d="M36 90 V60 Q50 52 64 60 V90 Z" fill="' + P.deep + '"/>' +
  '<circle cx="64" cy="62" r="3" fill="' + P.amber + '"/>' +
  '<text x="50" y="30" font-family="Tahoma, Arial, sans-serif" font-size="8" fill="' + P.amber + '" text-anchor="middle">??</text>'));
reg('secret/secret-eye.svg', 'secret', 'easter-egg', W(
  '<path d="M8 50 Q30 24 50 50 Q70 76 92 50" fill="none" stroke="' + P.purple + '" stroke-width="5"/>' +
  cir(50, 50, 16, P.amber, ' opacity="0.25"') + cir(50, 50, 7, P.amber, '') + cir(50, 50, 2.5, P.ink, '')));
reg('secret/secret-terminal.svg', 'secret', 'easter-egg', W(
  '<rect x="8" y="16" width="84" height="68" fill="' + P.panel + '" stroke="' + P.online + '" stroke-width="3"/>' +
  '<rect x="14" y="22" width="6" height="6" fill="' + P.dnd + '"/><rect x="24" y="22" width="6" height="6" fill="' + P.idle + '"/><rect x="34" y="22" width="6" height="6" fill="' + P.online + '"/>' +
  '<path d="M14 38 H86 M14 46 H60 M14 54 H74 M14 62 H40" stroke="' + P.off + '" stroke-width="3" opacity="0.85"/>'));
reg('secret/secret-message.svg', 'secret', 'easter-egg', W(
  '<rect x="10" y="10" width="80" height="56" rx="10" fill="' + P.amber + '" stroke="' + P.ink + '" stroke-width="3"/>' +
  '<path d="M24 66 L20 84 L44 66 Z" fill="' + P.amber + '"/>' +
  '<path d="M24 30 H70 M24 42 H54" stroke="' + P.ink + '" stroke-width="4" stroke-linecap="round"/>' +
  dk(78, 22, 8, P.rose, '')));

/* ============================================================
   23. CHARACTERS / NEBULA — variaciones (fase §20)
   ============================================================ */
const nebulaBase = (opts) => {
  const o = opts || {};
  const body = o.body || P.indigo;
  const grad = o.grad || ['#3a0008', '#14040a'];
  const eyes = o.eyes || ['#ff4557'];
  const ear = o.ear || P.violet;
  const defs = '<linearGradient id="nD" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="' + grad[0] + '"/><stop offset="1" stop-color="' + grad[1] + '"/></linearGradient>';
  let core =
    '<ellipse cx="100" cy="168" rx="46" ry="9" fill="#141416" opacity=".6"/>' +
    (o.tail ? '<path d="M170 108 q16 -12 8 -26 q4 18 -8 26z" fill="' + P.purple + '"/>' : '') +
    '<path d="M78 52 L88 26 L104 48z" fill="' + ear + '" stroke="' + P.purple + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M122 52 L112 26 L96 48z" fill="' + ear + '" stroke="' + P.purple + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<circle cx="100" cy="104" r="54" fill="url(#nD)" stroke="' + P.purple + '" stroke-width="3.5"/>' +
    (o.ellipse ? '<ellipse cx="100" cy="118" rx="26" ry="16" fill="#0b0a18" opacity=".55"/>' : '');
  const final = o.body || body;
  let extra = '';
  if (o.face === 'happy') {
    extra = '<circle cx="82" cy="96" r="6" fill="' + eyes[0] + '"/><circle cx="118" cy="96" r="6" fill="' + eyes[0] + '"/>' +
      '<circle cx="82" cy="96" r="2.4" fill="#0b0a18"/><circle cx="118" cy="96" r="2.4" fill="#0b0a18"/>' +
      '<path d="M88 114 Q100 126 112 114" fill="none" stroke="#0b0a18" stroke-width="3.2" stroke-linecap="round"/>' +
      '<circle cx="82" cy="80" r="3" fill="' + P.roseL + '" opacity=".8"/><circle cx="118" cy="80" r="3" fill="' + P.roseL + '" opacity=".8"/>';
  } else if (o.face === 'wave') {
    extra = '<circle cx="82" cy="96" r="6" fill="' + eyes[0] + '"/><circle cx="118" cy="96" r="6" fill="' + eyes[0] + '"/>' +
      '<circle cx="82" cy="96" r="2.4" fill="#0b0a18"/><circle cx="118" cy="96" r="2.4" fill="#0b0a18"/>' +
      '<path d="M94 108 Q100 112 106 108" fill="none" stroke="#0b0a18" stroke-width="3.2" stroke-linecap="round"/>' +
      '<path d="M164 64 L176 56 M164 72 L180 78" stroke="' + P.amber + '" stroke-width="4" stroke-linecap="round"/>';
  } else if (o.face === 'glitch') {
    extra = '<circle cx="86" cy="98" r="6" fill="' + P.amber + '" transform="translate(4 2)"/><circle cx="114" cy="94" r="6" fill="' + P.rose + '" transform="translate(-2 0)"/>' +
      '<circle cx="86" cy="96" r="2.4" fill="#0b0a18"/><circle cx="114" cy="94" r="2.4" fill="#0b0a18"/>' +
      '<path d="M90 116 Q100 120 112 112" fill="none" stroke="#0b0a18" stroke-width="3.2" stroke-linecap="round"/>' +
      '<rect x="30" y="120" width="40" height="4" fill="' + P.rose + '" opacity=".6"/><rect x="120" y="100" width="34" height="4" fill="' + P.amber + '" opacity=".6"/>';
  }
  return '<defs>' + defs + '</defs>' + core + extra + '</svg>\n';
};
reg('characters/nebula/nebula-happy.svg', 'character', 'nebula-happy',
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" renderer-info="lunnie-kit">' + nebulaBase({ face: 'happy' }));
reg('characters/nebula/nebula-wave.svg', 'character', 'nebula-wave',
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" renderer-info="lunnie-kit">' + nebulaBase({ face: 'wave' }));
reg('characters/nebula/nebula-glitch.svg', 'character', 'nebula-glitch',
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" renderer-info="lunnie-kit">' + nebulaBase({ face: 'glitch', grad: ['#3a0008', '#14040a'] }));

/* ============================================================
   24. CHARACTERS / LUNNIE — variaciones (fase §21)
   ============================================================ */
reg('characters/lunnie/lunnie-silhouette.svg', 'character', 'lunnie-silhouette', W(
  '<g fill="' + P.off + '">' +
  '<circle cx="50" cy="42" r="16"/><path d="M14 88 Q14 52 50 52 Q86 52 86 88 Z"/></g>'));
reg('characters/lunnie/lunnie-mono.svg', 'character', 'lunnie-mono', W(
  '<g opacity="0.9">' +
  '<circle cx="50" cy="42" r="16" fill="none" stroke="' + P.off + '" stroke-width="3"/>' +
  '<path d="M14 88 Q14 52 50 52 Q86 52 86 88 Z" fill="none" stroke="' + P.off + '" stroke-width="3"/>' +
  '<circle cx="44" cy="40" r="2" fill="' + P.off + '"/><circle cx="56" cy="40" r="2" fill="' + P.off + '"/></g>'));
reg('characters/lunnie/lunnie-glow.svg', 'character', 'lunnie-glow', W(
  '<defs><radialGradient id="lG" cx="0.5" cy="0.5" r="0.62"><stop offset="0" stop-color="' + P.purple + '" stop-opacity="0.9"/><stop offset="1" stop-color="' + P.purple + '" stop-opacity="0"/></radialGradient></defs>' +
  '<circle cx="50" cy="54" r="34" fill="url(#lG)" opacity="0.7"/>'));
reg('characters/lunnie/lunnie-glitch.svg', 'character', 'lunnie-glitch', W(
  '<g>' +
  '<circle cx="50" cy="42" r="16" fill="none" stroke="' + P.rose + '" stroke-width="3" transform="translate(2 0)"/>' +
  '<circle cx="50" cy="42" r="16" fill="none" stroke="' + P.amber + '" stroke-width="3" transform="translate(-2 0)"/>' +
  '<path d="M14 88 Q14 52 50 52 Q86 52 86 88 Z" fill="none" stroke="' + P.purple + '" stroke-width="3"/>' +
  '<rect x="20" y="60" width="60" height="3" fill="' + P.rose + '" opacity="0.7"/>' +
  '<rect x="26" y="70" width="48" height="3" fill="' + P.amber + '" opacity="0.7"/></g>'));

/* ============================================================
   25. FAVICON mark (fase §49) — emblema sin fondo, reutilizable
   ============================================================ */
reg('favicon/moon-mark.svg', 'favicon', 'favicon-mark, logo', W(
  '<g>' + moonCrescent(P.amber, '') +
  '<path d="M62 28 Q76 42 60 52 Q50 62 52 74" fill="none" stroke="' + P.off + '" stroke-width="3" stroke-linecap="round" opacity="0.7" transform="translate(-6 0)"/>' +
  dk(66, 30, 9, P.white, '') + '</g>'));

/* ============================================================
   ESCRITURA
   ============================================================ */
function indexLegacy() {
  const img = path.join(ROOT, 'img');
  const out = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { walk(full); continue; }
      if (!/\.svg$/i.test(e.name)) continue;
      const rel = path.relative(ROOT, full).replace(/\\/g, '/');
      out.push({
        name: e.name.replace(/\.svg$/i, ''),
        type: /^art\d/i.test(e.name) ? 'artwork'
          : /decor/.test(rel) ? 'decoration'
          : /retro/.test(rel) ? 'retro'
          : /nebula|nebgula/i.test(e.name) ? 'character'
          : /^btn/i.test(e.name) ? 'badge'
          : 'original',
        source: 'original',
        author: 'Lunnie ♡',
        license: 'original — Libre de usar en proyectos de Lunnie; preguntar para uso externo',
        sourceUrl: 'local — legacy del sitio (assets/img/**)',
        localPath: 'assets/' + rel,
        usage: 'legacy — ya integrado en la web',
      });
    }
  })(img);
  return out;
}

function writeAll() {
  const seen = new Set();
  for (const a of assets) {
    if (seen.has(a.file)) { console.error('DUPLICADO:', a.file); process.exit(1); }
    seen.add(a.file);
    const out = path.join(ROOT, a.file);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, a.svg);
  }

  const manifest = {
    generated: new Date().toISOString().slice(0, 10),
    palette: 'goticos: oxblood-deep #3a0008, oxblood #8b0000, blood #b3001b, carmine #e63946, ember #ff4557, off #f0eaea, deep #0a0a0c',
    notes: indexLegacy().length + ' assets legacy (assets/img/**) + ' + assets.length + ' del kit (lunnie-kit) = ' + (indexLegacy().length + assets.length) + ' registros',
    assets: [
      ...indexLegacy(),
      ...assets.map((a) => ({
        name: path.basename(a.file, '.svg'),
        type: a.type,
        source: 'original',
        author: 'Lunnie ♡',
        license: 'original — Libre de usar en proyectos de Lunnie; preguntar para uso externo',
        sourceUrl: 'local — generado con tools/build-asset-kit.js',
        localPath: 'assets/' + a.file,
        usage: a.usage,
      })),
    ],
  };
  const mdir = path.join(ROOT, 'credits');
  fs.mkdirSync(mdir, { recursive: true });
  fs.writeFileSync(path.join(mdir, 'asset-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log('assets creados:', assets.length);
  console.log('manifest: assets/credits/asset-manifest.json');
}

writeAll();