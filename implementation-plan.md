# Implementation Plan: El Archivo del Kintsugi — Gap Closure

## Context

The portfolio was built from a detailed plan/brief but has accumulated gaps: broken props, incomplete i18n, missing interactive behaviors, and unused CSS. The user has confirmed: no dark mode, OGL for gold shaders, full English MDX translations with Astro native i18n routing, and a cursor toggle. This plan closes all gaps in priority order.

---

## Task 1: Critical Fixes (P0)

**Remove duplicate CustomCursor + Seal from index.astro**
- `src/pages/index.astro`: Delete `CustomCursor` import + usage (L5, L17-18), delete `Seal` import + usage (L3, L25)
- BaseLayout already renders both globally

**Fix GoldThread crash in [slug].astro**
- `src/pages/expedientes/[slug].astro`: Remove `GoldThread` import (L5), replace `<GoldThread client:visible />` (L88) with a static gold separator: `<div class="mt-12 h-px bg-gradient-to-r from-transparent via-[var(--color-accent-gold)] to-transparent opacity-30" />`

**Enhance Seal with personality**
- `src/components/ui/Seal.tsx`:
  - Add `size` prop (`sm=36, md=60, lg=96`) and `className` prop
  - Add cursor proximity tilt: on mousemove within 150px, tilt SVG toward cursor (max 8deg, RAF-throttled)
  - Add English path support in `PATH_STATE` (strip `/en` prefix in `stateForPath`)
  - Debounce stamp animation with `isStampAnimating` ref

---

## Task 2: Build-Time i18n Utility

**Create `src/lib/i18n.ts`**
```ts
import es from '../i18n/es.json';
import en from '../i18n/en.json';

const dicts = { es, en } as const;

export function t(locale: 'es' | 'en', key: string): string {
  const keys = key.split('.');
  let v: any = dicts[locale];
  for (const k of keys) v = v?.[k];
  return typeof v === 'string' ? v : key;
}

// URL path translations (Spanish slug → English slug)
export const PATH_MAP: Record<string, { es: string; en: string }> = {
  about:          { es: 'about',          en: 'about' },
  tools:          { es: 'tools',          en: 'tools' },
  expedientes:    { es: 'expedientes',    en: 'expedientes' },
  colaboraciones: { es: 'colaboraciones', en: 'collaborations' },
  contacto:       { es: 'contacto',       en: 'contact' },
  inspiraciones:  { es: 'inspiraciones',  en: 'inspirations' },
};

export function getLocalizedHref(href: string, locale: 'es' | 'en'): string {
  if (locale === 'es') return href;
  // Map /colaboraciones → /en/collaborations etc.
  for (const [, map] of Object.entries(PATH_MAP)) {
    if (href.startsWith(`/${map.es}`)) return href.replace(`/${map.es}`, `/en/${map.en}`);
  }
  return `/en${href}`;
}
```

**Update `src/lib/constants.ts`**
- Add `SITE_I18N` with per-locale title/description
- Remove `i18n` field from `NAV_LINKS` (no longer needed)

---

## Task 3: Migrate Spanish Pages to Build-Time Translations

For ALL Spanish pages (`index.astro`, `about.astro`, `tools.astro`, `expedientes/index.astro`, `expedientes/[slug].astro`, `contacto.astro`, `colaboraciones.astro`, `inspiraciones.astro`, `404.astro`):

- Add to frontmatter: `import { t } from '@lib/i18n';`
- Replace every `data-i18n="key"` attribute with `{t('es', 'key')}` in templates
- Remove `data-i18n` from component props (Stamp's `dataI18n`, TechnicalCard's `titleI18n`/`classificationI18n`, etc.)
- Hardcoded arrays (contact channels, tool categories, collaboration data) → move text to `es.json`/`en.json` or use inline translations

**Update React components for locale awareness** (add `strings` prop object):
- `FileFolder.tsx`: "Haz clic para abrir..." and "refinamientos"
- `RefinementTimeline.tsx`: "Refinamientos", "CLAVE"
- `DecisionTree.tsx`: "Árbol de Decisiones", "ELEGIDO"
- `ExpedientCover.tsx`: "refinamientos", status labels
- `LabNotes.tsx`: "Notas de Laboratorio"

---

## Task 4: Update Layouts, Header, Footer for Locale

**`src/layouts/BaseLayout.astro`**
- Add `locale?: 'es' | 'en'` prop (default `'es'`)
- `<html lang={locale}>` instead of hardcoded `SITE.lang`
- Dynamic hreflang tags for both locales using `getLocalizedHref`
- Remove `lang-pending` inline script (no longer needed)
- Pass `locale` to `<Header>`

**`src/components/layout/Header.astro`**
- Accept `locale` prop, use `t(locale, ...)` for all text
- Nav hrefs use `getLocalizedHref(href, locale)`
- Logo link uses `getLocalizedHref('/', locale)`

**`src/components/layout/Footer.astro`**
- Accept `locale` prop, replace all `data-i18n` with `t(locale, ...)`

---

## Task 5: Create English Pages + MDX

**Create 8 English pages** under `src/pages/en/`:
- `index.astro`, `about.astro`, `tools.astro`, `contact.astro`, `collaborations.astro`, `inspirations.astro`
- `expedientes/index.astro`, `expedientes/[slug].astro`

Each English page:
- Imports `t` from `@lib/i18n`, calls `t('en', key)` instead of `t('es', key)`
- Uses same components with English `strings` props
- Passes `locale="en"` to BaseLayout

**Update `src/content.config.ts`**: Add `expedientes_en` collection pointing to `./src/content/expedientes/en/`

**Create 5 English MDX files** in `src/content/expedientes/en/`:
- `kumoriya.mdx`, `finwise.mdx`, `matrixezz.mdx`, `mybooktrace.mdx`, `pos-system.mdx`
- Same frontmatter schema, translated string values + body content

---

## Task 6: Rewrite LanguageSwitch as Locale Navigation Link

**`src/components/ui/LanguageSwitch.tsx`**
- Accept `currentPath: string`, `locale: string` props
- Render two links: ES → Spanish URL, EN → English URL (using `getLocalizedHref`)
- Active locale styled gold, inactive is clickable
- Keep stamp animation on click (page transition feel)
- Remove all `translate.ts`/`localStorage` logic

**Delete**: `src/i18n/translate.ts`, `src/i18n/index.ts` (no longer used)

**`src/styles/global.css`**: Remove `html.lang-pending [data-i18n]` rule (L96-99)

---

## Task 7: Hero Redesign ("Portada del Archivo")

**`src/pages/index.astro`** (and `src/pages/en/index.astro`):
- Restructure hero: top-down archive view with perspective
- Right-side folder stack: add `perspective: 1200px`, `transform-style: preserve-3d`, each folder gets random `rotateZ(-3deg to +3deg)` seeded by index
- Inline `<Seal client:visible size="lg" />` in hero with stamp animation on load
- Gold separator stays

**`src/styles/animations.css`**: Add `@keyframes stack-settle` for folder entrance

---

## Task 8: Cursor Toggle Switch

**Create `src/components/ui/CursorToggle.tsx`**
- Stamp-style toggle: "CUSTOM" / "NATIVE"
- Reads/writes `localStorage.getItem('cursor')` (default: `'custom'`)
- Sets `document.documentElement.dataset.cursor` to `'custom'` or `'native'`
- Stamp animation on toggle

**`src/components/layout/Header.astro`**: Add `<CursorToggle client:load />` next to LanguageSwitch

**`src/components/ui/CustomCursor.tsx`**: Check `localStorage` on mount, skip if `'native'`

**`src/styles/cursor.css`**: Add rules:
```css
html[data-cursor="native"] .cursor-dot,
html[data-cursor="native"] .cursor-ring,
html[data-cursor="native"] .cursor-trail-particle { display: none !important; }
html[data-cursor="native"], html[data-cursor="native"] a, html[data-cursor="native"] button { cursor: auto !important; }
```

---

## Task 9: Gold Shimmer with OGL

**Install**: `npm install ogl`

**Create `src/components/shaders/GoldShimmer.tsx`**
- OGL canvas with gold shimmer fragment shader (u_time uniform, specular highlight sweep)
- Props: `width`, `height`, `intensity`, `className`
- IntersectionObserver: pause render loop when off-screen
- Guards: `prefersReducedMotion`, `isLowEndDevice`, no WebGL → render nothing
- CSS fallback: `.texture-gold-shimmer` class on underlying element

**Apply to**:
- `RefinementTimeline.tsx`: Overlay on `isKey` dots
- `Stamp.tsx`: Optional `shimmer?: boolean` prop

---

## Task 10: Gold Thread Auto-Path Integration

**`src/components/ui/GoldThread.tsx`**:
- Add `auto?: boolean` + `containerRef` props
- When `auto=true`: query `[data-thread-point]` elements, compute bezier path connecting them
- ResizeObserver for recalculation

**`RefinementTimeline.tsx`**: Add `data-thread-point` to key dots, render `<GoldThread auto />`
**`DecisionTree.tsx`**: Gold path from question to chosen option

---

## Task 11: Animation & Interaction Polish

- **FileFolder listings**: `preserve-3d` wrapper, random `rotateZ` per folder, `@media (hover: none)` to disable hover effects on touch
- **Stamp**: Optional `sound?: boolean` prop with Web Audio thump (80Hz oscillator, 100ms decay)
- **RefinementTimeline**: Add ScrollTrigger cleanup on unmount
- **StickyNote**: Replace inline `fontFamily` with `font-handwritten` CSS class
- **Mobile**: Add `@media (hover: none)` block in `global.css` for hover-dependent effects

**Create `src/components/ui/MarginNote.tsx`**: Handwritten margin annotations (Caveat font, absolute-positioned on desktop, inline on mobile)

---

## Task 12: SEO & Analytics

- **Plausible**: Add `<script defer data-domain="renymireles.dev" src="https://plausible.io/js/script.js" />` in BaseLayout `<head>`
- **JSON-LD per expedient**: Generate `SoftwareSourceCode` schema in `[slug].astro`, pass to ExpedientLayout
- **OG images**: Generate static SVG-based OG images per expedient in `public/images/og/`
- **Hreflang audit**: Verify all pages have correct `hreflang` tags for both locales

---

## Task 13: Performance & Reduced Motion Audit

- `npm run build` → verify <200KB total JS bundle
- Lighthouse → target 90+ all categories
- Set `prefers-reduced-motion: reduce` in DevTools → verify all motion stops
- Add `shimmer` keyframe to reduced-motion rules in `textures.css`
- Verify OGL canvas respects reduced motion + low-end device guards

---

## Execution Order

```
Task 1 (critical fixes) → Task 2 (i18n util) → Task 3 (migrate ES pages) 
→ Task 4 (layouts/header/footer) → Task 5 (EN pages + MDX) → Task 6 (LanguageSwitch)
→ Task 7 (hero) → Task 8 (cursor toggle) → Task 9 (OGL gold) 
→ Task 10 (gold thread) → Task 11 (polish) → Task 12 (SEO) → Task 13 (audit)
```

Tasks 7-11 can be done in any order after Task 6.

## Verification

After each phase:
1. `npm run dev` → navigate all pages in both `/es` and `/en`
2. `npm run build` → no errors
3. Check Lighthouse score
4. Test on mobile viewport (Chrome DevTools)
5. Test with `prefers-reduced-motion: reduce`
6. Grep for `data-i18n` → should be zero after Task 6
