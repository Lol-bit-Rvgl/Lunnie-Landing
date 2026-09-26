/* ============================================================
   LUNNIE ♡ — tools/build-artwork.js
   Generador offline de assets de muestra para el sector.
   ------------------------------------------------------------
   Cada pieza tiene composición propia: gradientes, ruido
   (feTurbulence) y formas orgánicas. NO son obra final — son
   placeholders con dirección de arte, listos para sustituir
   por el arte real del artista.

   Uso:  node tools/build-artwork.js
   Salida: assets/img/{art1..art6,art5b,art8,art9,art10,
            avatar, assistant, banner, btn-1..3, btn-friend}.svg
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets', 'img');

/* ---------- paleta ---------- */
const P = {
  space: '#07060f', indigo: '#240046', deep: '#3a0ca3',
  violet: '#7209b7', purple: '#9d4edd', off: '#eadaff',
  white: '#ffffff', pink: '#ff5d8f', danger: '#ff2d55',
  grey: '#8a86a8', paper: '#ece4f5', ink: '#140f24',
};

/* ---------- helpers ---------- */
const wrap = (vb, body) =>
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + vb + '" renderer-info="lunnie-artwork">' +
  body + '</svg>\n';

const grain = (id, base) =>
  '<filter id="' + id + '" x="0" y="0" width="100%" height="100%">' +
  '<feTurbulence type="fractalNoise" baseFrequency="' + base +
  '" numOctaves="2" stitchTiles="stitch"/>' +
  '<feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.12 0"/>' +
  '</filter>';

const lin = (id, stops) =>
  '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
  stops.map((s) => '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"/>').join('') +
  '</linearGradient>';

const radial = (id, stops, fx, fy) =>
  '<radialGradient id="' + id + '" cx="0.5" cy="0.5" r="0.6" fx="' + fx + '" fy="' + fy + '">' +
  stops.map((s) => '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"/>').join('') +
  '</radialGradient>';

const stars = (seed, n, w, h, color) => {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = 14 + ((seed * 97 + i * 233) % (w - 28));
    const y = 14 + ((seed * 53 + i * 411) % (h - 28));
    const r = 0.8 + ((seed + i) % 3) * 0.5;
    const op = 0.25 + ((seed + i * 7) % 5) * 0.14;
    s += '<circle cx="' + x + '" cy="' + y + '" r="' + r.toFixed(1) +
      '" fill="' + color + '" opacity="' + op.toFixed(2) + '"/>';
  }
  return s;
};

const spark = (x, y, c) =>
  '<path d="M' + x + ' ' + (y - 9) + ' L' + (x + 3) + ' ' + (y - 3) + ' L' + (x + 9) + ' ' + y +
  ' L' + (x + 3) + ' ' + (y + 3) + ' L' + x + ' ' + (y + 9) +
  ' L' + (x - 3) + ' ' + (y + 3) + ' L' + (x - 9) + ' ' + y +
  ' L' + (x - 3) + ' ' + (y - 3) + ' Z" fill="' + c + '"/>';

const poly = (pts, fill, opts) =>
  '<path d="M' + pts.join(' L') + ' Z" fill="' + fill + '"' + (opts || '') + '/>';

/* ============================================================
   1. ART1 — PLANETA ANILLADO
   ============================================================ */
function art1() {
  const defs =
    '<defs>' +
    lin('bg1', [[0, P.deep], [0.55, P.indigo], [1, P.space]]) +
    radial('planet1', [[0, P.purple], [0.5, P.violet], [0.82, P.deep], [1, P.space]], 0.3, 0.3) +
    lin('ring1', [[0, P.off], [0.4, P.purple], [1, 'transparent']]) +
    grain('g1', 0.7) + '</defs>';
  return wrap('480 480',
    defs +
    '<rect width="480" height="480" fill="url(#bg1)"/>' +
    stars(3, 70, 480, 480, P.white) +
    spark(96, 92, P.pink) + spark(392, 68, P.off) + spark(410, 300, P.purple) +
    '<circle cx="240" cy="250" r="118" fill="url(#planet1)"/>' +
    '<ellipse cx="240" cy="250" rx="212" ry="58" fill="none" stroke="url(#ring1)" stroke-width="24"' +
    ' transform="rotate(-16 240 250)" opacity="0.9"/>' +
    '<ellipse cx="240" cy="250" rx="186" ry="50" fill="none" stroke="' + P.deep + '" stroke-width="4"' +
    ' transform="rotate(-16 240 250)"/>' +
    '<ellipse cx="240" cy="250" rx="236" ry="64" fill="none" stroke="' + P.off + '" stroke-width="2"' +
    ' transform="rotate(-16 240 250)" opacity="0.5" stroke-dasharray="2 8"/>' +
    '<path d="M176 190 A110 110 0 0 1 300 164" fill="none" stroke="' + P.white +
    '" stroke-width="6" opacity="0.55" stroke-linecap="round"/>' +
    '<rect width="480" height="480" fill="#fff" filter="url(#g1)"/>');
}

/* ============================================================
   2. ART2 — GATITA ASTRONAUTA
   ============================================================ */
function art2() {
  const defs =
    '<defs>' +
    radial('bg2', [[0, P.deep], [0.6, P.indigo], [1, P.space]], 0.5, 0.2) +
    radial('visor2', [[0, P.off], [0.55, P.purple], [1, P.violet]], 0.35, 0.3) +
    lin('glass2', [[0, P.off], [1, P.white]]) +
    grain('g2', 1.1) + '</defs>';
  return wrap('480 480',
    defs +
    '<rect width="480" height="480" fill="url(#bg2)"/>' +
    stars(9, 55, 480, 480, P.white) +
    spark(364, 120, P.pink) + spark(116, 352, P.off) +
    '<circle cx="240" cy="246" r="168" fill="' + P.deep + '" stroke="' + P.purple + '" stroke-width="10"/>' +
    '<circle cx="240" cy="246" r="128" fill="url(#visor2)"/>' +
    poly([186, 168, 196, 128, 216, 158], P.space) +
    poly([264, 158, 284, 128, 294, 168], P.space) +
    '<path d="M196 248 Q216 222 238 248 Q216 260 196 248 Z" fill="' + P.ink + '"/>' +
    '<path d="M242 248 Q264 222 284 248 Q264 260 242 248 Z" fill="' + P.ink + '"/>' +
    '<circle cx="219" cy="243" r="5" fill="' + P.white + '"/>' +
    '<circle cx="265" cy="243" r="5" fill="' + P.white + '"/>' +
    poly([233, 268, 247, 268, 240, 278], P.pink) +
    '<path d="M214 268 H182 M180 272 H158 M214 280 H186" stroke="' + P.off + '" stroke-width="3"' +
    ' stroke-linecap="round" opacity="0.8"/>' +
    '<path d="M266 268 H298 M300 272 H322 M266 280 H294" stroke="' + P.off + '" stroke-width="3"' +
    ' stroke-linecap="round" opacity="0.8"/>' +
    '<path d="M180 176 Q240 140 300 176 Q248 150 196 172 Z" fill="url(#glass2)" opacity="0.28"/>' +
    '<rect width="480" height="480" fill="#fff" filter="url(#g2)"/>');
}

/* ============================================================
   3. ART3 — GEARRUNNER MECHA
   ============================================================ */
function art3() {
  const defs =
    '<defs>' +
    lin('bg3', [[0, P.space], [1, P.deep]]) +
    lin('visor3', [[0, P.white], [0.6, P.purple], [1, P.violet]]) +
    grain('g3', 0.8) + '</defs>';
  const vents =
    '<g fill="' + P.purple + '">' +
    '<rect x="208" y="258" width="4" height="26" fill="' + P.pink + '"/>' +
    '<rect x="222" y="260" width="4" height="24"/>' +
    '<rect x="236" y="258" width="4" height="26"/>' +
    '<rect x="252" y="260" width="4" height="24"/>' +
    '<rect x="266" y="258" width="4" height="26"/>' +
    '</g>';
  return wrap('480 480',
    defs +
    '<rect width="480" height="480" fill="url(#bg3)"/>' +
    '<g stroke="' + P.purple + '" opacity="0.35">' +
    '<path d="M-20 60 L500 200" stroke-width="3"/>' +
    '<path d="M-20 120 L500 260" stroke-width="6"/>' +
    '<path d="M-20 180 L500 320" stroke-width="2"/>' +
    '<path d="M-20 260 L500 400" stroke-width="4"/>' +
    '</g>' +
    poly([240, 120, 330, 168, 322, 330, 240, 372, 158, 330, 150, 168], P.ink,
      ' stroke="' + P.white + '" stroke-width="8"') +
    poly([240, 168, 300, 198, 294, 250, 240, 286, 186, 250, 180, 198], P.deep,
      ' stroke="' + P.violet + '" stroke-width="4"') +
    poly([204, 214, 276, 214, 262, 240, 218, 240], P.space) +
    poly([214, 218, 270, 218, 260, 236, 224, 236], 'url(#visor3)') +
    vents +
    '<rect width="480" height="480" fill="#fff" filter="url(#g3)"/>');
}

/* ============================================================
   4. ART4 — LUNE SONRIENTE (media luna con actitud)
   ============================================================ */
function art4() {
  const defs =
    '<defs>' +
    radial('bg4', [[0, P.indigo], [1, P.space]], 0.6, 0.7) +
    radial('moon4', [[0, P.off], [0.6, '#b78ae6'], [1, P.purple]], 0.35, 0.3) +
    grain('g4', 1.0) + '</defs>';
  const eyes =
    '<path d="M296 196 Q306 184 322 196" fill="none" stroke="' + P.deep +
    '" stroke-width="8" stroke-linecap="round"/>' +
    '<path d="M196 232 Q186 220 170 232" fill="none" stroke="' + P.deep +
    '" stroke-width="8" stroke-linecap="round"/>';
  const smirk =
    '<path d="M248 264 Q286 250 312 254 Q300 296 244 302 Q224 302 208 292 Q240 288 248 264 Z"' +
    ' fill="' + P.deep + '"/>';
  return wrap('480 480',
    defs +
    '<rect width="480" height="480" fill="url(#bg4)"/>' +
    stars(6, 60, 480, 480, P.white) +
    spark(120, 140, P.pink) + spark(410, 150, P.off) +
    /* grueso de la luna */
    '<circle cx="290" cy="250" r="140" fill="' + P.violet + '"/>' +
    '<circle cx="392" cy="212" r="150" fill="url(#bg4)"/>' +
    '<path d="M340 138 A150 150 0 0 1 378 356 A150 150 0 0 0 290 250 Z" fill="' + P.deep + '"/>' +
    '<circle cx="268" cy="236" r="120" fill="url(#moon4)"/>' +
    eyes + smirk +
    '<circle cx="216" cy="252" r="7" fill="' + P.pink + '" opacity="0.85"/>' +
    '<rect width="480" height="480" fill="#fff" filter="url(#g4)"/>');
}

/* ============================================================
   5. ART5 — PÁGINA DE CÓMIC 01 (bocadillos + tinta)
   ============================================================ */
function art5() {
  const defs =
    '<defs>' +
    radial('bg5', [[0, P.indigo], [1, P.space]], 0.5, 0.6) +
    grain('g5', 0.9) + '</defs>';
  const panel = (x, y, w, h) =>
    '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
    '" fill="' + P.paper + '" stroke="' + P.ink + '" stroke-width="6"/>';
  /* bocadillo */
  const bubble = (x, y, t) =>
    '<g><ellipse cx="' + x + '" cy="' + y + '" rx="40" ry="26" fill="#fff" stroke="' + P.ink + '" stroke-width="4"/>' +
    '<path d="M' + (x - 6) + ' ' + (y + 24) + ' L' + (x + 6) + ' ' + (y + 24) + ' L' + (x + 14) + ' ' + (y + 46) + ' Z" fill="#fff" stroke="' + P.ink + '" stroke-width="4"/></g>';
  return wrap('480 480',
    defs +
    '<rect width="480" height="480" fill="url(#bg5)"/>' +
    panel(30, 30, 420, 230) +
    panel(30, 288, 200, 162) +
    panel(250, 288, 200, 162) +
    /* viñeta superior: planeta + trazos */
    '<circle cx="150" cy="130" r="52" fill="none" stroke="' + P.ink + '" stroke-width="3"/>' +
    '<path d="M60 120 Q150 40 260 118 M70 210 Q150 120 250 206" fill="none" stroke="' + P.ink + '" stroke-width="3"/>' +
    '<path d="M300 80 Q330 60 360 90 M340 70 Q370 96 380 120" stroke="' + P.ink + '" stroke-width="2" fill="none"/>' +
    bubble(384, 102, '') +
    /* viñeta inferior izquierda: gato */
    '<circle cx="128" cy="388" r="40" fill="none" stroke="' + P.ink + '" stroke-width="3"/>' +
    poly([96, 356, 100, 330, 118, 350], P.ink) +
    poly([160, 356, 156, 330, 138, 350], P.ink) +
    '<path d="M118 396 Q128 404 138 396" fill="none" stroke="' + P.ink + '" stroke-width="3"/>' +
    '<path d="M70 430 L186 430 M70 432 L186 432" stroke="' + P.ink + '" stroke-width="2" opacity="0.5"/>' +
    bubble(210, 330, '') +
    /* viñeta inferior derecha: cabezal */
    poly([320, 300, 376, 330, 368, 420, 320, 444, 272, 420, 264, 330], P.ink) +
    '<path d="M302 366 L338 366 L332 384 L308 384 Z" fill="#fff" stroke="' + P.ink + '" stroke-width="3"/>' +
    '<path d="M330 400 L330 410" stroke="' + P.ink + '" stroke-width="4"/>' +
    '<rect width="480" height="480" fill="#fff" filter="url(#g5)"/>');
}

/* ============================================================
   6. ART5B — TIRA X3 PANELES
   ============================================================ */
function art5b() {
  const defs = '<defs>' + grain('g5b', 1.0) + '</defs>';
  const row = (y, h) =>
    '<rect x="20" y="' + y + '" width="440" height="' + h + '" fill="' + P.paper +
    '" stroke="' + P.ink + '" stroke-width="5"/>';
  return wrap('480 480',
    defs +
    '<rect width="480" height="480" fill="' + P.space + '"/>' +
    row(16, 132) + row(172, 132) + row(328, 132) +
    /* panel 1: luna sonriendo */
    '<path d="M150 82 A60 60 0 1 0 160 96 A60 60 0 0 0 150 82" fill="' + P.deep + '"/>' +
    '<path d="M112 92 Q120 86 132 92 M150 100 Q158 94 170 100" stroke="' + P.ink + '" stroke-width="3" fill="none"/>' +
    '<path d="M262 238 A55 55 0 0 1 172 238" fill="' + P.deep + '"/>' +
    '<circle cx="196" cy="222" r="4" fill="' + P.ink + '"/><circle cx="236" cy="222" r="4" fill="' + P.ink + '"/>' +
    '<path d="M206 244 Q216 252 226 244" fill="none" stroke="' + P.ink + '" stroke-width="3"/>' +
    /* panel 2: cabezal mecha */
    poly([240, 190, 312, 218, 306, 292, 240, 312, 174, 292, 168, 218], P.ink) +
    '<path d="M218 246 L262 246 L258 266 L222 266 Z" fill="#fff" stroke="' + P.ink + '" stroke-width="3"/>' +
    '<path d="M240 330 L240 340 M234 348 L246 348" stroke="' + P.ink + '" stroke-width="4"/>' +
    /* panel 3: planeta con anillo */
    '<circle cx="240" cy="394" r="42" fill="' + P.deep + '"/>' +
    '<ellipse cx="240" cy="394" rx="84" ry="22" fill="none" stroke="' + P.ink + '" stroke-width="6"' +
    ' transform="rotate(-14 240 394)"/>' +
    '<rect width="480" height="480" fill="#fff" filter="url(#g5b)"/>');
}

/* ============================================================
   7. ART6 — ROUGH WALK LOOP (capas de cebolla)
   ============================================================ */
function art6() {
  const defs =
    '<defs>' +
    lin('bg6', [[0, P.space], [1, P.deep]]) +
    lin('ghost6', [[0, P.off], [1, P.purple]]) +
    grain('g6', 1.2) + '</defs>';
  const fig = (x, op, rot) =>
    '<g transform="translate(' + x + ' 250) rotate(' + rot + ' 0 0)" opacity="' + op + '">' +
    '<ellipse cx="0" cy="16" rx="26" ry="34" fill="url(#ghost6)"/>' +
    '<circle cx="0" cy="-24" r="22" fill="url(#ghost6)"/>' +
    '<path d="M-8 -16 Q0 -28 8 -16" fill="none" stroke="' + P.deep + '" stroke-width="2"/>' +
    '<path d="M-34 44 L-16 38 M34 44 L16 38" stroke="' + P.deep + '" stroke-width="6" stroke-linecap="round"/>' +
    '</g>';
  return wrap('480 480',
    defs +
    '<rect width="480" height="480" fill="url(#bg6)"/>' +
    stars(2, 45, 480, 480, P.white) +
    '<path d="M40 330 H440" stroke="' + P.purple + '" stroke-width="3" opacity="0.6"/>' +
    '<path d="M40 330 L40 318 M120 330 L120 322 M200 330 L200 318 M280 330 L280 322 M360 330 L360 318 M440 330 L440 322"' +
    ' stroke="' + P.purple + '" stroke-width="2" opacity="0.6"/>' +
    fig(100, 0.22, -10) + fig(190, 0.4, -6) + fig(280, 0.62, -2) + fig(370, 1, 0) +
    '<rect width="480" height="480" fill="#fff" filter="url(#g6)"/>');
}

/* ============================================================
   8. ART8 — CHIBI NEBULOSA (sticker)
   ============================================================ */
function art8() {
  const defs =
    '<defs>' +
    radial('bg8', [[0, P.deep], [1, P.space]], 0.5, 0.3) +
    radial('face8', [[0, P.off], [1, '#c9a8f0']], 0.4, 0.35) +
    grain('g8', 1.1) + '</defs>';
  return wrap('480 480',
    defs +
    '<rect width="480" height="480" fill="url(#bg8)"/>' +
    stars(11, 50, 480, 480, P.white) +
    spark(120, 120, P.pink) + spark(380, 180, P.off) +
    '<rect x="200" y="330" width="80" height="120" rx="26" fill="' + P.violet + '"/>' +
    '<circle cx="240" cy="200" r="128" fill="url(#face8)" stroke="' + P.ink + '" stroke-width="8"/>' +
    /* cabello-estrella */
    '<path d="M240 60 L252 96 L286 108 L252 120 L240 160 L228 120 L194 108 L228 96 Z" fill="' + P.violet + '"/>' +
    /* ojos felices */
    '<path d="M196 204 Q206 190 220 204" fill="none" stroke="' + P.ink + '" stroke-width="7" stroke-linecap="round"/>' +
    '<path d="M260 204 Q274 190 284 204" fill="none" stroke="' + P.ink + '" stroke-width="7" stroke-linecap="round"/>' +
    /* boca */
    '<path d="M222 244 Q240 258 258 244" fill="none" stroke="' + P.ink + '" stroke-width="5" stroke-linecap="round"/>' +
    '<circle cx="206" cy="228" r="7" fill="' + P.pink + '" opacity="0.9"/>' +
    '<circle cx="274" cy="228" r="7" fill="' + P.pink + '" opacity="0.9"/>' +
    '<rect width="480" height="480" fill="#fff" filter="url(#g8)"/>');
}

/* ============================================================
   9. ART9 — PÁGINA DE SKETCHBOOK (con anotaciones)
   ============================================================ */
function art9() {
  const defs = '<defs>' + grain('g9', 0.9) + '</defs>';
  return wrap('480 480',
    defs +
    '<rect width="480" height="480" fill="' + P.paper + '"/>' +
    '<g fill="none" stroke="' + P.deep + '" stroke-width="3" stroke-linecap="round">' +
    '<circle cx="150" cy="160" r="76"/>' +
    '<path d="M150 84 Q130 40 186 48 M150 236 L170 300 M150 120 L186 64"/>' +
    '<path d="M96 130 Q80 96 110 90"/>' +
    '<path d="M60 40 L180 40 M60 44 L180 44" opacity="0.4"/>' +
    '</g>' +
    '<g fill="none" stroke="' + P.pink + '" stroke-width="4" stroke-linecap="round">' +
    '<path d="M280 90 L420 90 M280 130 L420 130 M330 90 L330 130"/>' +
    '<path d="M330 250 C430 240 400 380 340 360"/>' +
    '</g>' +
    '<path d="M60 300 L120 258 L78 340 Z" fill="none" stroke="' + P.violet + '" stroke-width="3"/>' +
    '<text x="120" y="300" font-family="Courier New, monospace" font-size="22" fill="' + P.violet + '">?</text>' +
    '<path d="M120 320 L214 320 M214 320 Q208 296 232 288" stroke="' + P.grey + '" stroke-width="4" fill="none" stroke-linecap="round"/>' +
    '<circle cx="330" cy="400" r="42" fill="none" stroke="' + P.grey + '" stroke-width="5"/>' +
    '<circle cx="330" cy="400" r="34" fill="none" stroke="' + P.grey + '" stroke-width="4" opacity="0.6"/>' +
    '<rect width="480" height="480" fill="#fff" filter="url(#g9)"/>');
}

/* ============================================================
   10. ART10 — MECHA FLICKER (doble exposición + scanlines)
   ============================================================ */
function art10() {
  const defs =
    '<defs>' +
    lin('bg10', [[0, P.ink], [1, P.space]]) +
    lin('visor10', [[0, P.pink], [1, P.purple]]) +
    grain('g10', 1.2) + '</defs>';
  return wrap('480 480',
    defs +
    '<rect width="480" height="480" fill="url(#bg10)"/>' +
    /* fantasma offset */
    poly([240, 118, 322, 162, 314, 300, 240, 334, 166, 300, 158, 162], 'none',
      ' stroke="' + P.purple + '" stroke-width="4" opacity="0.5" transform="translate(-14 10)"') +
    poly([240, 118, 322, 162, 314, 300, 240, 334, 166, 300, 158, 162], P.deep,
      ' stroke="' + P.white + '" stroke-width="6"') +
    poly([240, 160, 292, 188, 286, 240, 240, 268, 194, 240, 188, 188], P.space) +
    poly([208, 210, 272, 210, 262, 232, 218, 232], 'none',
      ' stroke="' + P.pink + '" stroke-width="3"') +
    poly([214, 214, 266, 214, 258, 228, 222, 228], 'url(#visor10)') +
    /* glitch bars */
    '<rect x="40" y="120" width="14" height="44" fill="' + P.pink + '" opacity="0.8"/>' +
    '<rect x="430" y="290" width="10" height="60" fill="' + P.purple + '" opacity="0.8"/>' +
    '<rect x="70" y="300" width="8" height="30" fill="' + P.off + '" opacity="0.5"/>' +
    '<g stroke="' + P.deep + '" stroke-width="2" opacity="0.5">' +
    '<path d="M0 40 H480 M0 96 H480 M0 160 H480 M0 216 H480 M0 272 H480 M0 328 H480 M0 384 H480 M0 440 H480"/>' +
    '</g>' +
    '<rect width="480" height="480" fill="#fff" filter="url(#g10)"/>');
}

/* ============================================================
   11. AVATAR — mascota de perfil
   ============================================================ */
function avatar() {
  const defs =
    '<defs>' +
    radial('bgA', [[0, P.deep], [1, P.space]], 0.5, 0.4) +
    lin('hairA', [[0, P.pink], [1, P.violet]]) +
    radial('faceA', [[0, P.off], [1, '#c9a8f0']], 0.4, 0.35) +
    grain('gA', 1.3) + '</defs>';
  return wrap('240 240',
    defs +
    '<circle cx="120" cy="120" r="116" fill="url(#bgA)" stroke="' + P.purple + '" stroke-width="6"/>' +
    stars(5, 22, 240, 240, P.white) +
    '<circle cx="120" cy="134" r="58" fill="url(#faceA)" stroke="' + P.ink + '" stroke-width="6"/>' +
    '<path d="M62 108 L52 74 L92 96 L120 44 L148 96 L188 74 L178 108" fill="url(#hairA)" opacity="0.92"/>' +
    '<circle cx="120" cy="52" r="8" fill="' + P.pink + '"/>' +
    '<path d="M100 122 Q110 112 122 122 M136 122 Q146 112 156 122" fill="none" stroke="' + P.ink +
    '" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M104 150 Q120 164 136 150" fill="none" stroke="' + P.ink + '" stroke-width="4" stroke-linecap="round"/>' +
    '<circle cx="88" cy="140" r="4" fill="' + P.pink + '" opacity="0.85"/>' +
    '<circle cx="152" cy="140" r="4" fill="' + P.pink + '" opacity="0.85"/>' +
    '<rect width="240" height="240" fill="#fff" filter="url(#gA)"/>');
}

/* ============================================================
   12. ASSISTANT — orbita flotante
   ============================================================ */
function assistant() {
  const defs =
    '<defs>' +
    radial('bgS', [[0, P.violet], [1, P.space]], 0.4, 0.3) +
    grain('gS', 1.4) + '</defs>';
  return wrap('160 160',
    defs +
    '<circle cx="80" cy="80" r="76" fill="url(#bgS)"/>' +
    stars(8, 12, 160, 160, P.white) +
    '<circle cx="80" cy="84" r="34" fill="' + P.off + '" stroke="' + P.ink + '" stroke-width="5"/>' +
    '<path d="M52 74 Q62 66 72 74 M88 74 Q98 66 108 74" fill="none" stroke="' + P.ink +
    '" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M66 98 Q80 108 94 98" fill="none" stroke="' + P.ink + '" stroke-width="3" stroke-linecap="round"/>' +
    '<circle cx="50" cy="42" r="6" fill="' + P.pink + '"/>' +
    '<circle cx="112" cy="40" r="5" fill="' + P.off + '"/>' +
    '<rect width="160" height="160" fill="#fff" filter="url(#gS)"/>');
}

/* ============================================================
   13. BANNER — cabecera de sector
   ============================================================ */
function banner() {
  const defs =
    '<defs>' +
    lin('bgB', [[0, P.deep], [0.5, P.indigo], [1, P.space]]) +
    radial('sunB', [[0, P.purple], [0.6, P.violet], [1, 'transparent']], 0.5, 0.55) +
    grain('gB', 0.7) + '</defs>';
  return wrap('800 262',
    defs +
    '<rect width="800" height="262" fill="url(#bgB)"/>' +
    '<circle cx="640" cy="150" r="190" fill="url(#sunB)" opacity="0.85"/>' +
    stars(4, 90, 800, 262, P.white) +
    spark(150, 60, P.pink) + spark(700, 50, P.off) + spark(520, 220, P.off) +
    '<ellipse cx="640" cy="150" rx="230" ry="52" fill="none" stroke="' + P.off + '" stroke-width="10"' +
    ' transform="rotate(-14 640 150)" opacity="0.85"/>' +
    '<circle cx="150" cy="200" r="34" fill="none" stroke="' + P.purple + '" stroke-width="2" opacity="0.9"/>' +
    '<circle cx="150" cy="200" r="44" fill="none" stroke="' + P.purple + '" stroke-width="1" opacity="0.5" stroke-dasharray="3 7"/>' +
    '<circle cx="330" cy="90" r="3" fill="' + P.pink + '" opacity="0.9"/>' +
    '<circle cx="430" cy="70" r="2" fill="' + P.off + '"/>' +
    '<path d="M0 262 L0 236 L160 196 L340 236 L520 192 L700 238 L800 210 L800 262 Z" fill="' + P.space + '" opacity="0.55"/>' +
    '<path d="M0 256 L200 230 L420 258 L660 228 L800 252" fill="none" stroke="' + P.violet + '" stroke-width="2" opacity="0.8"/>' +
    '<rect width="800" height="262" fill="#fff" filter="url(#gB)"/>');
}

/* ============================================================
   14. BOTONES 88x31 (3 variantes distintas)
   ============================================================ */
function btnBase(bg, sub) {
  const defs = '<defs>' + grain('gBtn', 1.6) + '</defs>';
  return defs +
    bg +
    '<rect x="0" y="0" width="88" height="31" fill="none" stroke="' + P.white + '" stroke-width="1" opacity="0.85"/>' +
    '<rect width="88" height="31" fill="#fff" filter="url(#gBtn)"/>' +
    '<text x="44" y="24" font-family="Tahoma, Arial, sans-serif" font-weight="bold" font-size="9" fill="' +
    P.white + '" text-anchor="middle">LUNNIE</text>' +
    '<text x="44" y="6" font-family="Tahoma, Arial, sans-serif" font-size="5" fill="' + P.off +
    '" text-anchor="middle">' + sub + '</text>';
}
function btn1() {
  return wrap('88 31',
    btnBase('<rect width="88" height="31" fill="' + P.violet + '"/>' +
      '<path d="M0 0 H88 V31 H0 Z M44 0 L66 15 L44 31 L22 15 Z" fill="' + P.purple + '" opacity="0.5"/>',
      'EST. 2026 ♡'));
}
function btn2() {
  return wrap('88 31',
    btnBase('<rect width="88" height="31" fill="#0c0a18"/>' +
      '<path d="M0 0 H88 M0 8 H88 M0 16 H88 M0 24 H88 M0 31 H88 M0 0 V31 M8 0 V31 M16 0 V31 M24 0 V31 M32 0 V31 M40 0 V31 M48 0 V31 M56 0 V31 M64 0 V31 M72 0 V31 M80 0 V31" stroke="' + P.deep + '" stroke-width="1"/>' +
      '<polygon points="34,8 44,15 34,22" fill="' + P.white + '"/>',
      'NEOCITIES'));
}
function btn3() {
  return wrap('88 31',
    btnBase('<rect width="88" height="31" fill="' + P.indigo + '"/>' +
      '<path d="M0 0 H22 V16 H44 V0 H66 V16 H88 M0 31 H22 V16 H0 M44 31 H66 V16 H44 M88 16 H66 M22 31 H44 V16 H22" fill="' + P.purple + '" opacity="0.7"/>',
      'EL RINCÓN DEL ESPACIO'));
}
function btnFriend() {
  return wrap('88 31',
    '<rect width="88" height="31" fill="#161226"/>' +
    '<rect x="0" y="0" width="88" height="31" fill="none" stroke="' + P.purple + '" stroke-width="1" stroke-dasharray="4 3"/>' +
    '<text x="44" y="14" font-family="Courier New, monospace" font-weight="bold" font-size="9" fill="' +
    P.grey + '" text-anchor="middle">? ? ?</text>' +
    '<text x="44" y="25" font-family="Tahoma, Arial, sans-serif" font-size="5" fill="' + P.grey +
    '" text-anchor="middle">pendiente</text>');
}

/* ---------- escritura ---------- */
const FILES = {
  'art1.svg': art1(), 'art2.svg': art2(), 'art3.svg': art3(), 'art4.svg': art4(),
  'art5.svg': art5(), 'art5b.svg': art5b(), 'art6.svg': art6(),
  'art8.svg': art8(), 'art9.svg': art9(), 'art10.svg': art10(),
  'avatar.svg': avatar(), 'assistant.svg': assistant(), 'banner.svg': banner(),
  'btn-1.svg': btn1(), 'btn-2.svg': btn2(), 'btn-3.svg': btn3(),
  'btn-friend.svg': btnFriend(),
};

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

let n = 0;
Object.keys(FILES).forEach((name) => {
  fs.writeFileSync(path.join(OUT, name), FILES[name]);
  n += 1;
});
console.log('artwork generado: ' + n);