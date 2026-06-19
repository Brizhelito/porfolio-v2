// ─────────────────────────────────────────────────────────────
// page-config.ts — Single source of truth for per-page metadata
// Consumed by Seal.tsx (emotional state) and CustomCursor.tsx (color).
// P1-12 fix: eliminates duplicated PATH_STATE / PATH_COLORS maps.
// ─────────────────────────────────────────────────────────────

export type SealState =
  | 'curiosity'
  | 'concentration'
  | 'satisfaction'
  | 'alert'
  | 'resting';

export interface PageMeta {
  /** Seal emotional state when this page is active */
  seal: SealState;
  /** Cursor ring color (CSS hex) */
  cursor: string;
}

export const PAGE_CONFIG: Record<string, PageMeta> = {
  '/':               { seal: 'curiosity',     cursor: '#C9A961' },
  '/about':          { seal: 'concentration', cursor: '#2D4A5C' },
  '/tools':          { seal: 'concentration', cursor: '#2D4A5C' },
  '/expedientes':    { seal: 'satisfaction',  cursor: '#5C7156' },
  '/colaboraciones': { seal: 'satisfaction',  cursor: '#5C7156' },
  '/contacto':       { seal: 'alert',         cursor: '#B23A28' },
  '/inspiraciones':  { seal: 'resting',       cursor: '#4A4640' },
};

const DEFAULT_META: PageMeta = { seal: 'curiosity', cursor: '#C9A961' };

/**
 * Normalize an English-prefixed path back to its canonical key.
 * `/en/about` → `/about`, `/en` → `/`, `/en/` → `/`
 */
function normalizePath(path: string): string {
  if (path === '/en' || path === '/en/') return '/';
  if (path.startsWith('/en/')) return path.slice(3);
  if (path.startsWith('/en')) return path.slice(3) || '/';
  return path;
}

/**
 * Look up page metadata by pathname. Falls back to default for unknown paths.
 * Matches longest prefix (e.g. `/expedientes/kumoriya` matches `/expedientes`).
 */
export function configForPath(path: string): PageMeta {
  const normalized = normalizePath(path);
  // Try exact match first
  if (PAGE_CONFIG[normalized]) return PAGE_CONFIG[normalized];
  // Try prefix match (longest first)
  const keys = Object.keys(PAGE_CONFIG).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (normalized === key || normalized.startsWith(key + '/')) {
      return PAGE_CONFIG[key];
    }
  }
  return DEFAULT_META;
}

/** Convenience: just the seal state */
export function sealStateForPath(path: string): SealState {
  return configForPath(path).seal;
}

/** Convenience: just the cursor color */
export function cursorColorForPath(path: string): string {
  return configForPath(path).cursor;
}
