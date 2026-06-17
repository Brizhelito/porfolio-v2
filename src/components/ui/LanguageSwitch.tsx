import { useState, useRef, useEffect } from 'react';
import { gsap, prefersReducedMotion } from '@lib/animations';
import { registerDictionary, translateDocument } from '../../i18n/translate';
import esDict from '../../i18n/es.json';
import enDict from '../../i18n/en.json';

// Register dictionaries once
registerDictionary('es', esDict);
registerDictionary('en', enDict);

interface LanguageSwitchProps {
  className?: string;
}

export default function LanguageSwitch({ className = '' }: LanguageSwitchProps) {
  const [activeLang, setActiveLang] = useState<'es' | 'en'>(() => {
    if (typeof document !== 'undefined') {
      return (document.documentElement.getAttribute('data-lang') as 'es' | 'en') || 'es';
    }
    return 'es';
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const stampRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lang') as 'es' | 'en' | null;
    if (saved && saved !== 'es') {
      setActiveLang(saved);
      translateDocument(saved);
      // Remove pending class to reveal translated text
      document.documentElement.classList.remove('lang-pending');
    } else {
      // ES is default, no pending state needed
      document.documentElement.classList.remove('lang-pending');
    }
  }, []);

  const switchLanguage = (lang: 'es' | 'en') => {
    if (lang === activeLang || isAnimating) return;
    setIsAnimating(true);

    // Stamp animation
    if (stampRef.current && !prefersReducedMotion) {
      gsap.fromTo(stampRef.current,
        { scale: 2, opacity: 0, rotate: -10 },
        {
          scale: 1,
          opacity: 1,
          rotate: 0,
          duration: 0.4,
          ease: 'back.out(1.7)',
          onComplete: () => {
            gsap.to(stampRef.current, {
              opacity: 0,
              duration: 0.3,
              delay: 0.5,
            });
          }
        }
      );
    }

    // Apply translations
    setTimeout(() => {
      translateDocument(lang);
      setActiveLang(lang);
      localStorage.setItem('lang', lang);
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.classList.remove('lang-pending');
      setIsAnimating(false);
    }, 200);
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div
        ref={stampRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 z-10"
      >
        <div className="w-12 h-12 rounded-full border-2 border-[var(--color-accent-gold)] flex items-center justify-center bg-[var(--color-bg-primary)] shadow-stamp">
          <span className="font-stamp text-[10px] tracking-wider text-[var(--color-accent-gold)]">
            {activeLang.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="flex items-center bg-[var(--color-bg-secondary)]/50 rounded-[3px] p-0.5">
        <button
          onClick={() => switchLanguage('es')}
          className={`px-2.5 py-1 text-[11px] font-stamp tracking-wider rounded-[2px] transition-all duration-200 ${
            activeLang === 'es'
              ? 'bg-[var(--color-accent-gold)] text-[var(--color-archive-white)]'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
          aria-label="Cambiar a español"
        >
          ES
        </button>
        <button
          onClick={() => switchLanguage('en')}
          className={`px-2.5 py-1 text-[11px] font-stamp tracking-wider rounded-[2px] transition-all duration-200 ${
            activeLang === 'en'
              ? 'bg-[var(--color-accent-gold)] text-[var(--color-archive-white)]'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
          aria-label="Switch to English"
        >
          EN
        </button>
      </div>
    </div>
  );
}
