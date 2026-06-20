import { useState, useCallback, useEffect } from 'react';
import { t, type Locale } from '@lib/i18n';

interface CursorToggleProps {
  className?: string;
  locale?: Locale;
}

export default function CursorToggle({ className = '', locale = 'es' }: CursorToggleProps) {
  const [mode, setMode] = useState<'custom' | 'native'>('custom');
  const T = (key: string) => t(locale, key);

  useEffect(() => {
    const saved = localStorage.getItem('cursor') as 'custom' | 'native' | null;
    if (saved) {
      setMode(saved);
      document.documentElement.dataset.cursor = saved;
    }
  }, []);

  const toggle = useCallback(() => {
    const next = mode === 'custom' ? 'native' : 'custom';
    setMode(next);
    localStorage.setItem('cursor', next);
    document.documentElement.dataset.cursor = next;
    window.dispatchEvent(new CustomEvent('cursorchange', { detail: next }));
  }, [mode]);

  return (
    <button
      onClick={toggle}
      className={`cursor-toggle flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-stamp tracking-wider rounded-[2px] transition-all duration-200 ${
        mode === 'custom'
          ? 'bg-[var(--color-accent-gold)]/15 text-[var(--color-accent-gold)]'
          : 'bg-[var(--color-bg-secondary)]/50 text-[var(--color-text-secondary)]'
      } ${className}`}
      aria-label={mode === 'custom' ? T('cursor.ariaCustom') : T('cursor.ariaNative')}
      title={mode === 'custom' ? T('cursor.ariaCustom') : T('cursor.ariaNative')}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {mode === 'custom' ? (
          <>
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
          </>
        ) : (
          <path d="M5 3l14 9-7 2-4 7z" />
        )}
      </svg>
      {mode === 'custom' ? T('cursor.custom') : T('cursor.native')}
    </button>
  );
}
