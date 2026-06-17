import { useState, useRef, useEffect } from 'react';
import { gsap, prefersReducedMotion } from '@lib/animations';

interface LanguageSwitchProps {
  currentLang?: 'es' | 'en';
  className?: string;
}

export default function LanguageSwitch({ currentLang = 'es', className = '' }: LanguageSwitchProps) {
  const [activeLang, setActiveLang] = useState(currentLang);
  const [isAnimating, setIsAnimating] = useState(false);
  const stampRef = useRef<HTMLDivElement>(null);
  const inkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveLang(currentLang);
  }, [currentLang]);

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
        }
      );
    }

    // Ink reveal effect
    if (inkRef.current && !prefersReducedMotion) {
      gsap.fromTo(inkRef.current,
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1,
          opacity: 1,
          duration: 0.3,
          delay: 0.15,
          ease: 'power2.out',
          onComplete: () => {
            // Navigate after animation
            const currentPath = window.location.pathname;
            let newPath: string;

            if (lang === 'en') {
              newPath = `/en${currentPath}`;
            } else {
              newPath = currentPath.replace(/^\/en/, '') || '/';
            }

            window.location.href = newPath;
          }
        }
      );
    } else {
      // No animation, direct navigation
      const currentPath = window.location.pathname;
      let newPath: string;

      if (lang === 'en') {
        newPath = `/en${currentPath}`;
      } else {
        newPath = currentPath.replace(/^\/en/, '') || '/';
      }

      window.location.href = newPath;
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Stamp overlay for animation */}
      <div
        ref={stampRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 z-10"
      >
        <div className="w-12 h-12 rounded-full border-2 border-[var(--color-accent-gold)] flex items-center justify-center bg-[var(--color-bg-primary)]">
          <span className="font-stamp text-[10px] tracking-wider text-[var(--color-accent-gold)]">
            {activeLang.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Ink reveal overlay */}
      <div
        ref={inkRef}
        className="absolute inset-0 bg-[var(--color-accent-gold)] pointer-events-none opacity-0 z-5"
        style={{ transformOrigin: 'left center' }}
      />

      {/* Language buttons */}
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
