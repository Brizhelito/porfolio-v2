import es from './es.json';
import en from './en.json';

export type Lang = 'es' | 'en';

export const DEFAULT_LANG: Lang = 'es';
export const LANGS: Lang[] = ['es', 'en'];

const translations: Record<Lang, typeof es> = { es, en };

/**
 * Get the current language from the URL pathname.
 * In Phase 1 (Spanish-only), always returns 'es'.
 * In Phase 2, will parse /en/... prefixes from the URL.
 */
export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang && LANGS.includes(lang as Lang)) return lang as Lang;
  return DEFAULT_LANG;
}

/**
 * Returns a translation function for the given language.
 * Usage:
 *   const t = useTranslations('es');
 *   t('nav.home') // → "Inicio"
 *   t('home.expedients_open', { count: 5 }) // → "5 expedientes abiertos"
 */
export function useTranslations(lang: Lang) {
  return function t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let value: unknown = translations[lang];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in (value as Record<string, unknown>)) {
        value = (value as Record<string, unknown>)[k];
      } else {
        // Fallback to Spanish if key not found in target lang
        value = (translations[DEFAULT_LANG] as Record<string, unknown>)[k];
        if (value && typeof value === 'object') continue;
        return key; // Return key as last resort
      }
    }

    if (typeof value !== 'string') return key;

    // Interpolate params: "{count} expedientes" → "5 expedientes"
    if (params) {
      return value.replace(/\{(\w+)\}/g, (_, paramKey: string) =>
        params[paramKey] !== undefined ? String(params[paramKey]) : `{${paramKey}}`
      );
    }

    return value;
  };
}

/**
 * Get the alternate language URL for a given path.
 * Useful for hreflang links and language switcher.
 */
export function getAlternateUrl(currentUrl: URL, targetLang: Lang): string {
  const path = currentUrl.pathname;
  const currentLang = getLangFromUrl(currentUrl);

  if (currentLang === DEFAULT_LANG && targetLang !== DEFAULT_LANG) {
    return `/${targetLang}${path}`;
  }
  if (currentLang !== DEFAULT_LANG && targetLang === DEFAULT_LANG) {
    return path.replace(`/${currentLang}`, '') || '/';
  }
  return path.replace(`/${currentLang}`, `/${targetLang}`);
}
