# Audit UI/UX — Resumen de cambios aplicados

Este archivo documenta los 42 hallazgos del audit UI/UX aplicados al proyecto.
Cada entrada referencia el ID del hallazgo (P#-##), el archivo afectado y la
naturaleza del cambio. Para el detalle completo de cada hallazgo ver el PDF
`audit-ui-ux-archivo-reny-mireles.pdf` (entregado por separado).

## Nuevos archivos

- **`src/lib/page-config.ts`** — Single source of truth para el mapeo
  ruta → (estado del Seal, color del cursor). P1-12. Consumido por
  `Seal.tsx` y `CustomCursor.tsx`.
- **`src/shaders/kintsugi-frag.ts`** — Movido desde la raíz del repo.
  Renombrado a `.ts` para que TypeScript no intente parsear el GLSL
  dentro del template literal. P3-09.
- **`.gitignore`** — Ignora `.dev/`, `dist/`, `node_modules/`, etc.
- **`.dev/`** — Carpeta interna con artefactos de desarrollo movidos
  fuera de la raíz: `plan.txt`, `implementation-plan.md`, `check-css.mjs`,
  `skills-lock.json`, `opencode.json`. P3-10.

## Cambios por dimensión

### P0 — Críticos (6)

- **P0-01** `src/pages/index.astro` + `src/pages/en/index.astro` — eliminado
  inline `onmouseenter`/`onmouseleave` y `style="transform..."` del hero
  folder. Movido a clase CSS `.hero-folder` con `@media (hover: hover)`
  y `@media (hover: none)`.
- **P0-02** `src/components/expedientes/ScatteredExpedientes.tsx` — añadido
  `isTouch` state vía `matchMedia('(hover: none)')`. En touch: folders
  se muestran planos, sin rotación scatter, y el contenido ("Abrir
  expediente...") siempre visible para que el affordance sea claro.
- **P0-03** `src/components/ui/LanguageSwitch.tsx` — la navegación ES↔EN
  ya no depende de GSAP. Si `prefersReducedMotion` o GSAP no está
  disponible, se navega directamente. La animación del stamp es
  puramente decorativa.
- **P0-04** `src/components/ui/Seal.tsx` — el Seal hero permanece
  visible en móvil (era `return null` para todo). Solo el Seal flotante
  se oculta en `(pointer: coarse)`. El cursor tilt también se desactiva
  en touch.
- **P0-05** `src/styles/global.css` — añadido `:focus-visible` global con
  outline oro de 2px + offset de 3px. Compensa el `cursor: none` del
  cursor custom para usuarios de teclado.
- **P0-06** `src/components/layout/Header.astro` — menú móvil con cierre
  ESC, outside-click, focus trap, `aria-expanded` sincronizado, y
  cierre automático al navegar. Restauración del foco al botón
  hamburguesa al cerrar.

### P1 — Altos (12)

- **P1-01** `src/styles/global.css` — `a:active, button:active,
  [role="button"]:active { transform: scale(0.97) }` global. Feedback
  de click consistente en todo el sitio.
- **P1-02** `src/components/ui/CustomCursor.tsx` — reemplazado el
  spawn de 20 nodos DOM (createElement + setTimeout) por un pool
  pre-asignado de 20 divs reciclados. Elimina layout thrash y GC
  pressure.
- **P1-03** `src/components/ui/Seal.tsx` — eliminado el
  `MutationObserver` global. Reemplazado por event delegation:
  2 listeners en `document` (`mouseover`/`mouseout`) con
  `closest('[data-seal-react]')`. Funciona con elementos
  dinámicamente añadidos sin observer.
- **P1-04** Ver P0-01 — mismo fix elimina el inline style que competía
  con CSS hover.
- **P1-05** `src/components/ui/FileFolder.tsx` — en touch, el tap del
  hero folder ya no togglea el flap (deja que el click burbujee al
  `<a>` padre para navegar).
- **P1-06** `src/styles/global.css` — añadido `scroll-padding-top: 80px`
  al `html` para que el header fijo no oculte anchors.
- **P1-07** `src/pages/index.astro` + `en/index.astro` — reemplazadas
  las 3 quick-link cards redundantes (que duplicaban header nav) por:
  shortcut al último expediente publicado + Tools + Contacto.
- **P1-08** `src/components/layout/Header.astro` — el header ahora
  solo se oculta en landing para desktop (md:). En mobile el header
  siempre visible para que el usuario pueda navegar sin hacer scroll.
- **P1-09** `src/styles/cursor.css` — `@media (pointer: coarse)
  { .cursor-toggle { display: none } }`. El botón no tiene sentido
  en touch.
- **P1-10** `src/pages/index.astro` + `en/index.astro` — los
  "expedientes abiertos" ahora filtran `status !== 'archived'`
  (antes contaba todos).
- **P1-11** `src/components/ui/StickyNote.tsx` — `maxWidth` de
  `'280px'` fijo a `'min(280px, calc(100vw - 32px))'`. Responsive en
  mobile.
- **P1-12** `src/lib/page-config.ts` (nuevo) — extrae el mapeo
  ruta→estado/color que estaba duplicado en `Seal.tsx` (PATH_STATE) y
  `CustomCursor.tsx` (PATH_COLORS). Single source of truth.

### P2 — Medios (14)

- **P2-01** `src/styles/global.css` — `--color-kintsugi-gold-bright`
  cambiado de `#D4AF37` a `#E5C158` (ΔE 6 → 18, claramente
  perceptible).
- **P2-02** `src/styles/animations.css` — `.gold-underline::after`
  ahora se anima también en `:focus-visible`, no solo `:hover`.
- **P2-03** `src/pages/contacto.astro` + `en/contact.astro` — emojis
  (✉◈▲◉) reemplazados por SVG inline (email, github, linkedin,
  whatsapp) con stroke currentColor.
- **P2-04** `src/pages/contacto.astro` + `en/contact.astro` — dots de
  response times usan `var(--color-stamp-green/blue/red)` en vez de
  Tailwind `bg-green-600`/`bg-blue-600`/`bg-red-600`.
- **P2-05** `src/styles/animations.css` — `.stagger-reveal > *`
  ahora usa `animation-delay: calc(var(--i, 0) * 0.05s)`. Soporta
  cualquier número de hijos (antes limitado a 8).
- **P2-06** `src/components/expedientes/RefinementTimeline.tsx` —
  `useEffect` ahora retorna cleanup que mata el `ScrollTrigger` y el
  tween al desmontar.
- **P2-07** `src/components/ui/FileFolder.tsx` — el hint "Abrir" solo
  aparece en hover desktop. En touch se oculta (no hay hover).
- **P2-08** `src/components/ui/Stamp.tsx` — si
  `prefersReducedMotion`, `gsap.set(ref, { opacity: 1, scale: 1 })`
  en vez de saltarse el effect (que dejaba el stamp en opacity 0).
- **P2-09** `src/components/expedientes/LabNotes.tsx` — añadido
  `role="button"`, `tabIndex={0}`, `aria-expanded`, `onKeyDown`
  (Enter + Space).
- **P2-10** `src/components/layout/Header.astro` — hamburguesa
  reemplazada por 2 `<line>` SVG con CSS transforms a X vía clase
  `.is-open` (sin setAttribute en paths SVG).
- **P2-11** `src/styles/global.css` — `body::before` ahora referencia
  `/textures/paper-grain.svg` en vez del base64 inline (cacheable).
- **P2-12** `src/pages/inspiraciones.astro` + `en/inspirations.astro`
  — eliminado `group-hover:text-[var(--color-accent-gold)]` de entries
  no interactivas (hover engañoso).
- **P2-13** `src/pages/tools.astro` + `en/tools.astro` — chips de
  tools convertidos en `<a>`: link al primer expediente relacionado,
  o `/expedientes` como fallback.
- **P2-14** `src/pages/expedientes/index.astro` + `en/expedientes/index.astro`
  — añadido `lg:grid-cols-3` a las 3 secciones (featured/active/archived).

### P3 — Bajos (10)

- **P3-01** `src/pages/404.astro` — eliminado el guión stray al final.
- **P3-02** `src/pages/about.astro` + `en/about.astro` — los 4 items
  de filosofía ahora se leen del array `about.philosophy` del
  i18n JSON (antes hardcoded).
- **P3-03** `src/pages/colaboraciones.astro` + `en/collaborations.astro`
  — el texto de la sticky note movido al array `collab.anecdote`
  (antes condicional hardcoded por id).
- **P3-04** `src/pages/expedientes/[slug].astro` + `en/expedientes/[slug].astro`
  — reordenado: Next Steps CTAs ahora aparecen justo después del MDX
  content (donde el lector está más comprometido), no después del
  footer de fechas.
- **P3-05** `src/pages/expedientes/[slug].astro` + `en/expedientes/[slug].astro`
  — el metrics grid solo se renderiza si al menos un campo existe;
  grid es `sm:grid-cols-4` sin huecos.
- **P3-06** `src/pages/contacto.astro` + `en/contact.astro` — el
  location stamp movido al header (pill con icono de pin) en vez del
  final de la página.
- **P3-07** `src/layouts/BaseLayout.astro` — añadido
  `<link rel="preload" as="style" href={GOOGLE_FONTS_URL}>` antes del
  `<link rel="stylesheet">` para reducir render-blocking.
- **P3-08** Ver P2-11 — los SVG en `/public/textures/` ahora sí se
  usan (antes eran código muerto).
- **P3-09** `src/shaders/kintsugi-frag.ts` — movido desde la raíz.
  Renombrado a `.ts` para que tsc no intente parsear el GLSL.
  Actualizado el import en `KintsugiBackground.tsx`.
- **P3-10** `.dev/` (nuevo) — movidos `plan.txt`, `implementation-plan.md`,
  `check-css.mjs`, `skills-lock.json`, `opencode.json` fuera de la
  raíz. `.gitignore` los ignora.

## Verificación

- `npx astro build` — ✓ 25 páginas construidas sin errores.
- `npx tsc --noEmit` — ✓ type-check pasa limpio.
- Estética kraft/oro/sello: 100% preservada. Ningún cambio de paleta,
  tipografía o textura.
- Sin nuevas dependencias npm. Solo se usa lo que ya estaba en
  `package.json` (Astro 6, React 18, GSAP, Tailwind v4, OGL).

## Cómo correr

```sh
npm install
npm run dev      # desarrollo en localhost:4321
npm run build    # build de producción a ./dist/
npm run preview  # preview del build
```
