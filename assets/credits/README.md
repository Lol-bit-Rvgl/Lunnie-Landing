# LUNNIE ASSET KIT — créditos, estructura y licencias

> Fase 2 del proyecto Lunnie-Landing. Este kit es el inventario gráfico **propio**
> del sector: SVG originales dibujados para Lunnie con la paleta del sitio
> (luna + estrella + HUD retro-sideral). Nada de esto fue descargado de terceros.

Jerarquía de uso (obligatoria, del brief):

1. **Arte de Lunnie** (los `assets/img/*` legacy que ya vivían en el sitio).
2. **SVG propios de este kit** (`assets/**` documentados aquí).
3. Librerías/archivos libres externos (solo si hay licencia clara).
4. Stock (evitar).

**Regla de oro:** si la licencia es dudosa → NO USARLO. Se crea un SVG propio,
se resuelve con CSS o se prescinde. (60 assets excelentes > 500 genéricos.)

---

## 1. Resumen

- **180 assets SVG** generados por `tools/build-asset-kit.js` + **52 assets legacy**
  de `assets/img/**` inventariados = **232 registros**, todos **originales**
  (autor: Lunnie / este repositorio).
- Manifest máquina-lectible: [`asset-manifest.json`](asset-manifest.json)
  (232 registros; `source` = `"original"`, `license` original del repositorio).
  El identity de cada registro es `localPath` (los `name` pueden repetirse entre
  el grupo legacy `assets/img/retro/*` y el kit — p. ej. `sticker-star`).
- El script usa helpers propios (`grain`, `lin`, `rad`, `renderer-info="lunnie-kit"`)
  y produce SVG puros sin dependencias.

## 2. Estructura de carpetas

| Carpeta | Contenido | Integración |
| --- | --- | --- |
| `backgrounds/space/` | base cósmica, estrellas (dos tamaños), polvo | capa fondo `.space-bg` |
| `backgrounds/nebula/` | nebulosas primaria/secundaria | capas 2 y 3 de `.space-bg` |
| `backgrounds/textures/` | grano, escanlines, rejilla HUD | `body::before`, `.fm-crt` |
| `decorations/planets/` | planetas de parallax | `.fx-layer.is-near/.is-mid` |
| `decorations/moons/` | lunas (nueva, menguante…) | capas parallax / kit |
| `decorations/stars/` | estrellas y sparkles (1–8 puntas) | parallax, star-tap |
| `decorations/symbols/` | luna, estrella, corazón, onda, chip… | chips HUD |
| `decorations/stickers/` | stickers (stk-*) | colección badges / kit |
| `ui/frames/` | marcos de galería standard/corner/double | `.g-item[data-frame]` |
| `ui/borders/` | bordes y divisores | kit |
| `ui/icons/` | iconos funcionales (música, copiar…) | cabeceras de panel |
| `ui/indicators/` | estado online/idle/error | chips |
| `ui/badges/` | badges 88×31 (color y mono) | `#sec-badges`, barra 88x31 |
| `ui/cursors/` | cursores pixel (link/art/secret) | `@media (hover:hover)` |
| `ui/orbits/` | órbitas UI | `.fm-orbit`, `.hero-orbit` |
| `ui/hud/` | radar, coordenadas, barras de señal | LUNNIE SYSTEM / GRAVE FM |
| `effects/glitch/` | glitch estáticos | easter egg Konami |
| `hero/` | estrellas, rejilla, destellos, decor l/r, señal, órbita | hero de index |
| `guestbook/` | notas, pins, cinta, stickers de muro | `.gb-wall` |
| `radio/` | dial, perilla, altavoz, señal, onda | GRAVE FM |
| `transmissions/` | icono, señal, terminal, timestamp | sección TX |
| `scroll/` | flechas/órbitas de scroll | reserva |
| `loading/` | spinner de carga | línea `fm-boot` |
| `error/` | página/410 estáticos | reserva |
| `secret/` | estrella secreta, orbe | easter eggs |
| `characters/nebula/` | Nebula feliz, saludando | estados de `.nebula-friend` |
| `characters/lunnie/` | monograma, glow, glitch | identidad de perfil |
| `favicon/` | marca luna (mark) | footer, marcas de agua |

## 3. Originales

TODO lo del kit es `source: "original"`. Los **52 assets legacy** de `assets/img/**`
(art1–art10, avatares, banner, botones, Nebula, retro, favicon…) también son
propios del sitio, pero **no se movieron** para no romper rutas ya referenciadas.
Se registran en el manifest con `type` y su `localPath` real (`assets/img/…`).

## 4. Licencias

- **Kit (180):** `CC BY-NC 4.0` — originales del repositorio.
- **Legacy de la web:** propiedad del sitio, mismas reglas.
- **Externos:** ninguno incorporado en el kit. La web solo usa librerías libres
  (Giscus, Discord widget) que no aportan gráficos al kit.

## 5. Cómo reemplazar / añadir un asset

1. Edita `tools/build-asset-kit.js`: añade `reg('ruta/tipo-nombre.svg', 'tipo', 'uso', svg)`
   con un SVG construido por los helpers (paleta de `--panel-core`, `--ember`, `--grave-rose`, …).
2. Ejecuta `node tools/build-asset-kit.js` → regenera el SVG y reescribe el manifest.
3. Si es para integrar: enlaza la ruta en `index.html`/CSS y registra el `usage`
   en la entrada del manifest.

## 6. Integración actual (dónde vive cada grupo)

| Grupo | Dónde está integrado |
| --- | --- |
| fondo + texturas + parallax | sección 28.1 de `space-system.css` |
| hero kit | 28.2 (`.hero-deco*`, `.hero-orbit`) |
| identidad Lunnie | 28.3 (`.profile-fig::after`, `.hero-rule::after`) |
| estados RIP | 28.4 + `lunnie-fx.js` (STATES 5–6) |
| GRAVE FM | 28.5 (órbita, radar, perilla, dial, CRT, boot) |
| LUNNIE SYSTEM / HUD | 28.6 (chip-ico, hud-status-line) |
| transmisiones | 28.7 (`.tx-tab::before`, `.tx-actions::after`, timestamp) |
| guestbook muro | 28.8 (`.gb-wall`) |
| cursores | 28.11 (solo puntero fino) |
| marcos de galería | 28.12 (`.g-frame` por `data-frame`) |
| badges, footer, kit responsive | 28.10 + secciones en `index.html` |

Manifest completo con `name`, `type`, `source`, `author`, `license`, `localPath` y
`usage` por asset en [`asset-manifest.json`](asset-manifest.json).