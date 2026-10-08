/* ============================================================
   LUNNIE ♡ — tools/fetch-assets.js
   Genera el paquete gráfico RETRO (Web Revival 2000s / Neocities /
   P5 x Guilty Gear) en assets/img/retro/.
   Sin red: 100% SVG generado localmente → rutas relativas seguras.
   Re-ejecutable (idempotente). Uso: node tools/fetch-assets.js
   ------------------------------------------------------------
   Paquetes:
     A. Patrones de trama  (halftone / rejilla píxel / puntos)
     B. Divisores de interfaz (cinta peligro, puntos, estrellas)
     C. Iconografía pixel 16-bit (nav + decoración)
     D. Marcos / ventanas HUD (esquinas, frame, tab)
     E. Stickers y sellos (luna, estrella, WARNING, HOH, 88x31)
   ============================================================ */

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'assets', 'img', 'retro');
fs.mkdirSync(DIR, { recursive: true });

const written = [];

/* ---------- paleta retro ---------- */
const P = {
  P: '#b3001b', // neon purple
  V: '#8b0000', // deep violet
  I: '#3a0008', // indigo
  W: '#ffffff', // white
  O: '#f0eaea', // offwhite
  K: '#141416', // panel near-black
  B: '#05040c', // outer dark
  G: '#2b2840', // grid line
  A: '#ffbf00', // amber (danger tape)
  R: '#ff9aa5', // pink accent
  D: '#ff2d55', // danger red
};

/* ---------- helpers ---------- */
function svg(body, { w = 16, h = 16, vb = `0 0 ${w} ${h}`, extra = '' } = {}) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vb}" renderer-info="lunnie-retro"${extra}>\n` +
    body +
    `\n</svg>\n`;
}

const rect = (x, y, w, h, c) => `    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;

function pxArt(rects) {
  return rects.map(r => rect(r[0], r[1], r[2], r[3], r[4])).join('\n');
}

function write(name, content) {
  fs.writeFileSync(path.join(DIR, name), content, 'utf8');
  written.push(name);
}

/* escalar una lista de rects manteniendo el interlote */
function scale(rects, k, offX = 0, offY = 0, colorMap = {}) {
  return rects.map(([x, y, w, h, c]) =>
    [offX + x * k, offY + y * k, w * k, h * k, colorMap[c] || c]
  );
}

/* estrella pixel de 4 puntas: centro (cx,cy) */
function starPix(cx, cy, col = P.P, core = P.W) {
  return [
    [cx, cy - 4, 2, 9, col],
    [cx - 3, cy - 2, 8, 4, col],
    [cx, cy - 2, 2, 4, col],
    [cx, cy - 2, 2, 2, core],
  ];
}

/* ============================================================
   A. PATRONES DE TRAMA
   ============================================================ */
// a1. halftone: puntos finos tipo prensa sobre el fondo oscuro
write('pat-halftone.svg', svg(
  `  <defs>
    <pattern id="h" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="5"  cy="5"  r="1.6" fill="#ffffff" opacity="0.07"/>
      <circle cx="15" cy="15" r="2.6" fill="#ffffff" opacity="0.05"/>
      <circle cx="5"  cy="15" r="1.0" fill="#b3001b" opacity="0.10"/>
      <circle cx="15" cy="5"  r="1.0" fill="#b3001b" opacity="0.10"/>
    </pattern>
  </defs>
  <rect width="80" height="80" fill="url(#h)"/>`,
  { w: 80, h: 80 }
));

// a2. rejilla pixelada técnica (GG)
write('pat-pixelgrid.svg', svg(
  `  <path d="M6 0V24M12 0V24M18 0V24M0 6H24M0 12H24M0 18H24"
    stroke="#2b2840" stroke-width="1" fill="none" opacity="0.35"/>`,
  { w: 24, h: 24 }
));

// a3. textura punteada sutil (dither)
write('pat-dots.svg', svg(
  `  <defs>
    <pattern id="d" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="1" height="1" fill="#ffffff" opacity="0.05"/>
      <rect x="3" y="3" width="1" height="1" fill="#b3001b" opacity="0.10"/>
    </pattern>
  </defs>
  <rect width="18" height="18" fill="url(#d)"/>`,
  { w: 18, h: 18 }
));

/* ============================================================
   B. DIVISORES DE INTERFAZ
   ============================================================ */
// b1. cinta de peligro (ámbar / negro) — repeat-x
write('div-danger.svg', svg(
  `  <defs>
    <pattern id="haz" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="10" height="10" fill="#05040c"/>
      <rect width="5" height="10" fill="#ffbf00"/>
    </pattern>
  </defs>
  <rect width="48" height="16" fill="url(#haz)"/>
  <rect width="48" height="16" fill="none" stroke="#f0eaea" stroke-width="0.6" opacity="0.55"/>`,
  { w: 48, h: 16 }
));

// b2. cinta de peligro magenta (acento GG)
write('div-danger-pink.svg', svg(
  `  <defs>
    <pattern id="haz" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="10" height="10" fill="#05040c"/>
      <rect width="5" height="10" fill="#ff9aa5"/>
    </pattern>
  </defs>
  <rect width="48" height="16" fill="url(#haz)"/>
  <rect width="48" height="16" fill="none" stroke="#f0eaea" stroke-width="0.6" opacity="0.55"/>`,
  { w: 48, h: 16 }
));

// b3. línea punteada neón
write('div-dotted.svg', svg(
  `  <circle cx="8"  cy="4" r="2" fill="#b3001b"/>
  <circle cx="24" cy="4" r="2" fill="#8b0000"/>
  <circle cx="40" cy="4" r="2" fill="#b3001b"/>`,
  { w: 48, h: 8 }
));

// b4. divisor ornamental de estrellas pixel (repeat-x)
{
  const s1 = starPix(18, 9);
  const s2 = starPix(120, 9);
  const s3 = starPix(222, 9);
  const dots = [
    [44, 4, 1, 1, P.O],
    [56, 13, 1, 1, P.P],
    [78, 6, 1, 1, P.P],
    [96, 12, 1, 1, P.O],
    [150, 12, 1, 1, P.P],
    [168, 16, 1, 1, P.O],
    [180, 5, 1, 1, P.O],
    [200, 13, 1, 1, P.P],
    [236, 14, 1, 1, P.P],
    [238, 4, 1, 1, P.O],
  ];
  write('div-stars.svg', svg(
    pxArt(s1.concat(s2, s3, dots)),
    { w: 240, h: 20 }
  ));
}

/* ============================================================
   C. ICONOGRAFÍA PIXEL 16-BIT (16×16)
   ============================================================ */
const ICONS = {
  // casa con antena
  'i-home.svg': [
    [8, 1, 1, 3, P.P],
    [6, 3, 4, 1, P.P], [5, 4, 6, 1, P.P], [4, 5, 8, 1, P.P], [3, 6, 10, 1, P.P],
    [4, 7, 1, 8, P.P], [11, 7, 1, 8, P.P], [4, 7, 8, 1, P.P], [4, 14, 8, 1, P.P],
    [5, 8, 6, 2, P.W],
    [7, 10, 2, 5, P.B],
    [5, 10, 1, 2, P.O], [10, 10, 1, 2, P.O],
  ],
  // marco con montañas y sol
  'i-gallery.svg': [
    [2, 2, 12, 12, P.P], [3, 3, 10, 10, P.V], [4, 4, 8, 8, P.K],
    [9, 4, 2, 2, P.W],
    [8, 7, 1, 1, P.W],
    [7, 8, 3, 1, P.W],
    [6, 9, 4, 1, P.W],
    [5, 10, 6, 1, P.W],
    [4, 11, 8, 1, P.W],
  ],
  // pincel (encargos/tools)
  'i-tools.svg': [
    [7, 1, 2, 6, P.V],
    [6, 7, 4, 2, P.W],
    [6, 9, 4, 4, P.P],
    [6, 13, 4, 1, P.O],
    [10, 3, 1, 1, P.O],
  ],
  // máscara V (OCs)
  'i-mask.svg': [
    [3, 6, 10, 5, P.W],
    [3, 6, 10, 1, P.V], [3, 6, 1, 5, P.V], [12, 6, 1, 5, P.V], [3, 10, 10, 1, P.V],
    [5, 8, 2, 2, P.B], [9, 8, 2, 2, P.B],
    [6, 11, 4, 1, P.P], [7, 12, 2, 1, P.P],
  ],
  // terminal / bitácora (blog)
  'i-blog.svg': [
    [2, 2, 12, 12, P.V],
    [4, 4, 8, 8, P.K],
    [5, 5, 6, 1, P.O],
    [5, 7, 4, 1, P.P],
    [5, 9, 5, 1, P.O],
    [5, 11, 1, 1, P.W],
  ],
  // astronauta (sobre mí)
  'i-user.svg': [
    [8, 2, 1, 2, P.V], [8, 1, 1, 1, P.W],
    [5, 4, 6, 5, P.V],
    [7, 5, 2, 2, P.W],
    [4, 9, 8, 3, P.V],
    [2, 12, 12, 2, P.V],
  ],
  // estrella 4 puntas
  'i-star.svg': [
    [7, 3, 2, 10, P.P],
    [3, 7, 10, 2, P.P],
    [7, 7, 2, 2, P.W],
    [7, 2, 2, 2, P.P], [7, 12, 2, 2, P.P], [2, 7, 2, 2, P.P], [12, 7, 2, 2, P.P],
  ],
  // luna creciente pixel
  'i-moon.svg': [
    [6, 3, 4, 1, P.W],
    [5, 4, 6, 1, P.W],
    [4, 5, 8, 6, P.W],
    [5, 10, 6, 1, P.W],
    [6, 11, 4, 1, P.W],
    [6, 6, 2, 1, P.O], [9, 8, 1, 1, P.O], [5, 9, 1, 1, P.O],
    [12, 3, 1, 1, P.P], [13, 8, 1, 1, P.P],
  ],
  // planeta con anillo (los anillos se añaden tras el bucle, ver abajo)
  'i-planet-rects.svg': [
    [6, 2, 4, 1, P.P],
    [5, 3, 6, 1, P.P],
    [4, 4, 8, 5, P.P],
    [5, 9, 6, 1, P.P],
    [6, 10, 4, 1, P.P],
    [7, 5, 2, 2, P.O], [10, 7, 1, 1, P.O],
  ],
};

// planeta con anillo: cuerpo pixel + anillo vector inclinado
write('i-planet.svg', svg(
  pxArt(ICONS['i-planet-rects.svg']) + '\n' +
    `    <g transform="rotate(-16 8 8)"><rect x="-0.5" y="7.4" width="17" height="1" fill="#f0eaea"/></g>\n` +
    `    <g transform="rotate(-16 8 8)"><rect x="-0.5" y="9.2" width="17" height="1" fill="#8b0000" opacity="0.7"/></g>`,
  { w: 16, h: 16 }
));

for (const [name, list] of Object.entries(ICONS)) {
  if (name.endsWith('-rects.svg')) continue;
  write(name, svg(pxArt(list), { w: 16, h: 16 }));
}

/* ============================================================
   D. MARCOS / VENTANAS HUD
   ============================================================ */
// d1. esquina de mira táctica superior-izquierda
write('hud-corner.svg', svg(
  `  <path d="M2 27 V8 A6 6 0 0 1 8 2 H27" stroke="#b3001b" stroke-width="2.5" fill="none"/>
  <path d="M6 27 V10 A4 4 0 0 1 10 6 H27" stroke="#ffffff" stroke-width="1" opacity="0.35" fill="none"/>
  <g stroke="#f0eaea" stroke-width="1.6" stroke-linecap="square">
    <path d="M7 4 H15 M11 0 V8"/>
  </g>`,
  { w: 28, h: 28 }
));

// d2. esquina de mira táctica inferior-derecha (espejo)
write('hud-corner-br.svg', svg(
  `  <path d="M26 1 V20 A6 6 0 0 1 20 26 H1" stroke="#b3001b" stroke-width="2.5" fill="none"/>
  <path d="M22 1 V18 A4 4 0 0 1 18 22 H1" stroke="#ffffff" stroke-width="1" opacity="0.35" fill="none"/>
  <g stroke="#f0eaea" stroke-width="1.6" stroke-linecap="square">
    <path d="M13 24 H21 M17 20 V28"/>
  </g>`,
  { w: 28, h: 28 }
));

// d3. frame HUD completo (para banner)
write('frame-hud.svg', svg(
  `  <rect x="1.5" y="1.5" width="237" height="87" fill="none" stroke="#b3001b" stroke-width="2.5" rx="6"/>
  <rect x="6" y="6" width="228" height="78" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.3" rx="3"/>
  <g stroke="#ffffff" stroke-width="1.4" stroke-linecap="square" opacity="0.85">
    <path d="M4 20 H12 M8 16 V24"/>
    <path d="M228 20 H236 M232 16 V24"/>
    <path d="M4 70 H12 M8 66 V74"/>
    <path d="M228 70 H236 M232 66 V74"/>
  </g>
  <g>
    <rect x="88" y="0" width="64" height="16" fill="#141416" stroke="#b3001b" stroke-width="1.5"/>
    <rect x="90" y="2" width="60" height="12" fill="none" stroke="#ffffff" opacity="0.3"/>
    <text x="120" y="11.5" text-anchor="middle" font-family="'Courier New',monospace" font-size="8" letter-spacing="2" fill="#f0eaea">CRYPT</text>
  </g>
  <text x="232" y="86" text-anchor="end" font-family="'Courier New',monospace" font-size="7" letter-spacing="1" fill="#ff9aa5">LUNNIE // ONLINE</text>
  <rect x="8" y="82" width="8" height="4" fill="#00ff9f" opacity="0.9"/>
  <rect x="18" y="82" width="4" height="4" fill="#ffbf00" opacity="0.7"/>`,
  { w: 240, h: 90 }
));

// d4. tab de ventana de sistema clásico
write('window-tab.svg', svg(
  `  <defs>
    <pattern id="wd" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="1" height="1" fill="#ffffff" opacity="0.10"/>
    </pattern>
  </defs>
  <rect width="200" height="28" fill="#0a0816"/>
  <rect x="1" y="1" width="198" height="26" fill="none" stroke="#3a2a63"/>
  <rect x="3" y="3" width="194" height="13" fill="#120e26"/>
  <text x="8" y="12.5" font-family="'Courier New',monospace" font-size="8" letter-spacing="2" fill="#b3001b">◆ TRANSMISSION ▸ CRYPT 17</text>
  <rect y="17" width="200" height="10" fill="url(#wd)"/>
  <rect x="176" y="4" width="6" height="6" fill="#ff9aa5"/>
  <rect x="184" y="4" width="6" height="6" fill="#ffbf00"/>
  <rect x="192" y="4" width="6" height="6" fill="#00ff9f"/>`,
  { w: 200, h: 28 }
));

/* ============================================================
   E. STICKERS Y SELLOS
   ============================================================ */
// comunidad de rects reutilizables
const MOON_RECTS = [
  [6, 3, 4, 1, P.W], [5, 4, 6, 1, P.W], [4, 5, 8, 6, P.W],
  [5, 10, 6, 1, P.W], [6, 11, 4, 1, P.W],
  [6, 6, 2, 1, P.O], [9, 8, 1, 1, P.O], [5, 9, 1, 1, P.O],
  [12, 3, 1, 1, P.P], [13, 8, 1, 1, P.P],
];

const PLANET_RECTS = [
  [6, 2, 4, 1, P.P], [5, 3, 6, 1, P.P], [4, 4, 8, 5, P.P],
  [5, 9, 6, 1, P.P], [6, 10, 4, 1, P.P],
  [7, 5, 2, 2, P.O], [10, 7, 1, 1, P.O],
];

const STAR_RECTS = [
  [7, 3, 2, 10, P.P], [3, 7, 10, 2, P.P], [7, 7, 2, 2, P.W],
  [7, 2, 2, 2, P.P], [7, 12, 2, 2, P.P], [2, 7, 2, 2, P.P], [12, 7, 2, 2, P.P],
];

// e1. luna pixel sticker (64px con halo + sombra)
write('sticker-moon.svg', svg(
  `  <ellipse cx="36" cy="36" rx="30" ry="30" fill="#8b0000" opacity="0.22"/>
  <g transform="translate(2,2)" opacity="0.55">\n${pxArt(scale(MOON_RECTS, 4, 8, 12))}
  </g>
${pxArt(scale(MOON_RECTS, 4, 8, 12, { '#f0eaea': '#ffb3c6', '#b3001b': '#8b0000' }))}
  <circle cx="57" cy="14" r="2.5" fill="#ffffff"/>
  <circle cx="62" cy="48" r="1.6" fill="#ffbf00"/>`,
  { w: 64, h: 64 }
));

// e2. estrella pixel sticker
write('sticker-star.svg', svg(
  `  <ellipse cx="32" cy="32" rx="26" ry="26" fill="#3a0008" opacity="0.25"/>
  <g transform="translate(2,2)" opacity="0.55">\n${pxArt(scale(STAR_RECTS, 3, 8, 12))}
  </g>
${pxArt(scale(STAR_RECTS, 3, 8, 12))}
  <circle cx="14" cy="50" r="2" fill="#b3001b"/>
  <circle cx="52" cy="10" r="2" fill="#f0eaea"/>
  <circle cx="58" cy="26" r="1.4" fill="#ff9aa5"/>`,
  { w: 64, h: 64 }
));

// e3. planeta con anillo
write('sticker-planet.svg', svg(
  `  <ellipse cx="34" cy="34" rx="28" ry="28" fill="#3a0008" opacity="0.22"/>
  <g transform="translate(2,2)" opacity="0.55">\n${pxArt(scale(PLANET_RECTS, 3, 8, 16))}
  </g>
${pxArt(scale(PLANET_RECTS, 3, 8, 16, { '#f0eaea': '#ffb3c6' }))}
  <g transform="rotate(-18 34 34)">
    <rect x="6" y="30.5" width="56" height="3" fill="#f0eaea" opacity="0.9"/>
    <rect x="6" y="36.5" width="56" height="2" fill="#8b0000" opacity="0.6"/>
  </g>
  <circle cx="56" cy="14" r="2.5" fill="#ffffff"/>`,
  { w: 64, h: 64 }
));

// e4. sello WARNING
write('stamp-warning.svg', svg(
  `  <rect x="1.5" y="1.5" width="137" height="41" rx="7" fill="#141416" opacity="0.88" stroke="#ff2d55" stroke-width="2" stroke-dasharray="7 4"/>
  <path d="M30 13 L48 31 H12 Z" fill="#ffbf00"/>
  <text x="30" y="27" text-anchor="middle" font-family="'Courier New',monospace" font-weight="bold" font-size="17" fill="#05040c">!</text>
  <text x="60" y="27" font-family="'Courier New',monospace" font-weight="bold" font-size="19" letter-spacing="5" fill="#ff9aa5">WARNING</text>`,
  { w: 140, h: 44 }
));

// e5. sello HEAVEN OR HELL (GG)
write('stamp-heaven-hell.svg', svg(
  `  <rect x="1.5" y="1.5" width="237" height="47" rx="5" fill="#141416" opacity="0.9" stroke="#b3001b" stroke-width="2" stroke-dasharray="9 4"/>
  <rect x="5" y="5" width="230" height="40" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.3"/>
  <text x="120" y="22" text-anchor="middle" font-family="'Arial Black','Courier New',monospace" font-weight="bold" font-size="14" letter-spacing="3" fill="#ffffff" stroke="#8b0000" stroke-width="0.5">HEAVEN OR HELL</text>
  <text x="120" y="38" text-anchor="middle" font-family="'Courier New',monospace" font-size="9" letter-spacing="5" fill="#ffbf00">LET'S ROCK!</text>
  <path d="M14 10 L18 8 L16 13 L20 13 L13 20 L15 14 L11 14 Z" fill="#ff9aa5"/>
  <path d="M218 32 L226 22 L222 30 L230 30 L224 40 L228 32 Z" fill="#8b0000"/>`,
  { w: 240, h: 50 }
));

// e6. sello / botón 88x31
write('stamp-88x31.svg', svg(
  `  <defs>
    <pattern id="px" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="4" fill="#14040a"/>
      <rect width="2" height="2" fill="#3a0008"/>
    </pattern>
  </defs>
  <rect width="88" height="31" fill="url(#px)"/>
  <rect x="0.5" y="0.5" width="87" height="30" fill="none" stroke="#b3001b" stroke-width="2"/>
  <rect x="2.5" y="2.5" width="83" height="26" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.5"/>
  <text x="44" y="13" text-anchor="middle" font-family="'Arial Black','Courier New',monospace" font-weight="bold" font-size="10" fill="#ffffff">LUNNIE</text>
  <text x="44" y="24" text-anchor="middle" font-family="'Courier New',monospace" font-size="6" letter-spacing="2" fill="#f0eaea">★ p5 × gg ★</text>`,
  { w: 88, h: 31 }
));

/* ---------- reporte ---------- */
console.log(`retro assets generados: ${written.length}`);
written.forEach((n, i) => console.log(`  ${String(i + 1).padStart(2, ' ')}. ${n}`));
console.log(`→ ${DIR}`);