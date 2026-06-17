const dictionaries: Record<string, Record<string, any>> = {};

export function registerDictionary(lang: string, dict: Record<string, any>) {
  dictionaries[lang] = dict;
}

function resolveKey(obj: Record<string, any>, key: string): string | null {
  const keys = key.split('.');
  let value: any = obj;
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return null;
    }
  }
  return typeof value === 'string' ? value : null;
}

export function translateDocument(lang: string) {
  const dict = dictionaries[lang];
  if (!dict) return;

  const elements = document.querySelectorAll<HTMLElement>('[data-i18n]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    const translation = resolveKey(dict, key);
    if (translation) {
      el.textContent = translation;
    }
  });
}
