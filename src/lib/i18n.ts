import es from '../i18n/es.json';
import en from '../i18n/en.json';

export type Locale = 'es' | 'en';

const dicts: Record<Locale, Record<string, unknown>> = { es, en };

/**
 * Resolve a dot-notation key from the dictionary for the given locale.
 * Example: t('en', 'hero.title') → "Archive"
 */
export function t(locale: Locale, key: string): string {
  const parts = key.split('.');
  let v: unknown = dicts[locale];
  for (const p of parts) {
    if (v && typeof v === 'object' && p in (v as Record<string, unknown>)) {
      v = (v as Record<string, unknown>)[p];
    } else {
      return key;
    }
  }
  return typeof v === 'string' ? v : key;
}

/**
 * URL path translations map.
 * Spanish slug → English slug (or same if identical).
 */
export const PATH_MAP: Record<string, { es: string; en: string }> = {
  about:          { es: 'about',          en: 'about' },
  tools:          { es: 'tools',          en: 'tools' },
  expedientes:    { es: 'expedientes',    en: 'expedientes' },
  colaboraciones: { es: 'colaboraciones', en: 'collaborations' },
  contacto:       { es: 'contacto',       en: 'contact' },
  inspiraciones:  { es: 'inspiraciones',  en: 'inspirations' },
};

/**
 * Convert a Spanish-root href to the equivalent locale-prefixed href.
 * e.g. getLocalizedHref('/colaboraciones', 'en') → '/en/collaborations'
 *      getLocalizedHref('/about', 'es') → '/about'
 */
export function getLocalizedHref(href: string, locale: Locale): string {
  if (locale === 'es') return href;

  // Handle root
  if (href === '/') return '/en';

  // Match against PATH_MAP entries
  for (const [, map] of Object.entries(PATH_MAP)) {
    const prefix = `/${map.es}`;
    if (href === prefix || href.startsWith(prefix + '/')) {
      return href.replace(prefix, `/en/${map.en}`);
    }
  }

  // Fallback: just prefix with /en
  return `/en${href}`;
}

/**
 * Get the reverse mapping: given an English path, return the Spanish equivalent.
 * Used by LanguageSwitch to navigate back to Spanish.
 */
export function getSpanishHref(href: string): string {
  if (!href.startsWith('/en')) return href;
  if (href === '/en') return '/';

  const rest = href.slice(3); // e.g. "/collaborations"
  for (const [, map] of Object.entries(PATH_MAP)) {
    const prefix = `/${map.en}`;
    if (rest === prefix || rest.startsWith(prefix + '/')) {
      return rest.replace(prefix, `/${map.es}`);
    }
  }

  return rest || '/';
}
