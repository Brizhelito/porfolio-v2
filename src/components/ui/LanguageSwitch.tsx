import { useRef, useCallback } from 'react';
import { gsap, prefersReducedMotion } from '@lib/animations';
import { getLocalizedHref, getSpanishHref } from '@lib/i18n';

interface LanguageSwitchProps {
  currentPath: string;
  locale: string;
  className?: string;
}

export default function LanguageSwitch({ currentPath, locale, className = '' }: LanguageSwitchProps) {
  const stampRef = useRef<HTMLDivElement>(null);

  const handleSwitch = useCallback((e: React.MouseEvent, targetLang: 'es' | 'en') => {
    if (targetLang === locale) {
      e.preventDefault();
      return;
    }

    // Stamp animation on click
    if (stampRef.current && !prefersReducedMotion) {
      e.preventDefault();
      gsap.fromTo(stampRef.current,
        { scale: 2, opacity: 0, rotate: -10 },
        {
          scale: 1,
          opacity: 1,
          rotate: 0,
          duration: 0.4,
          ease: 'back.out(1.7)',
          onComplete: () => {
            const href = targetLang === 'en'
              ? getLocalizedHref(currentPath, 'en')
              : getSpanishHref(currentPath);
            window.location.href = href;
          },
        },
      );
    }
  }, [currentPath, locale]);

  const esHref = locale === 'es' ? currentPath : getSpanishHref(currentPath);
  const enHref = locale === 'en' ? currentPath : getLocalizedHref(currentPath, 'en');

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Stamp overlay animation */}
      <div
        ref={stampRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 z-10"
      >
        <div className="w-12 h-12 rounded-full border-2 border-[var(--color-accent-gold)] flex items-center justify-center bg-[var(--color-bg-primary)] shadow-stamp">
          <span className="font-stamp text-[10px] tracking-wider text-[var(--color-accent-gold)]">
            {locale.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="flex items-center bg-[var(--color-bg-secondary)]/50 rounded-[3px] p-0.5">
        <a
          href={esHref}
          onClick={(e) => handleSwitch(e, 'es')}
          className={`px-2.5 py-1 text-[11px] font-stamp tracking-wider rounded-[2px] transition-all duration-200 no-underline ${
            locale === 'es'
              ? 'bg-[var(--color-accent-gold)] text-[var(--color-archive-white)]'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
          aria-label="Cambiar a español"
        >
          ES
        </a>
        <a
          href={enHref}
          onClick={(e) => handleSwitch(e, 'en')}
          className={`px-2.5 py-1 text-[11px] font-stamp tracking-wider rounded-[2px] transition-all duration-200 no-underline ${
            locale === 'en'
              ? 'bg-[var(--color-accent-gold)] text-[var(--color-archive-white)]'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
          aria-label="Switch to English"
        >
          EN
        </a>
      </div>
    </div>
  );
}
