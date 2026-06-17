import { useState } from 'react';

const LANGUAGES = {
  es: 'ES',
  en: 'EN',
};

export default function LanguageSwitch() {
  const [current, setCurrent] = useState<keyof typeof LANGUAGES>('es');

  const switchLang = (lang: keyof typeof LANGUAGES) => {
    if (lang === current) return;
    setCurrent(lang);
    // For now, just toggle state. Full i18n routing will be wired in Task 11.
    document.documentElement.setAttribute('lang', lang);
  };

  return (
    <div className="flex items-center gap-1">
      {Object.entries(LANGUAGES).map(([code, label]) => (
        <button
          key={code}
          onClick={() => switchLang(code as keyof typeof LANGUAGES)}
          className={`rounded-paper px-2 py-1 text-caption font-stamp transition-colors ${
            current === code
              ? 'bg-[var(--color-bg-secondary)] text-[var(--color-accent-gold)]'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
          aria-label={`Cambiar idioma a ${label}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
