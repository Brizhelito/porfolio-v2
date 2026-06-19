import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@lib/animations';

export interface CrossRefItem {
  href: string;
  label: string;
  description: string;
  /** Stamp variant color */
  variant?: 'red' | 'blue' | 'green';
  /** Reference number for the document */
  refNumber?: string;
}

interface CrossReferencesProps {
  items: CrossRefItem[];
}

const VARIANT_STYLES = {
  red: {
    text: 'text-[var(--color-stamp-red)]',
    border: 'border-[var(--color-stamp-red)]/20',
    fold: 'from-[var(--color-stamp-red)]/10',
  },
  blue: {
    text: 'text-[var(--color-stamp-blue)]',
    border: 'border-[var(--color-stamp-blue)]/20',
    fold: 'from-[var(--color-stamp-blue)]/10',
  },
  green: {
    text: 'text-[var(--color-stamp-green)]',
    border: 'border-[var(--color-stamp-green)]/20',
    fold: 'from-[var(--color-stamp-green)]/10',
  },
};

const STAMP_LABELS: Record<string, string> = {
  green: 'COL',
  blue: 'INS',
  red: 'REF',
};

export default function CrossReferences({ items }: CrossReferencesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Gold axis lines draw in
      gsap.fromTo(
        '.gold-axis-line',
        { scaleY: 0, transformOrigin: 'top' },
        { scaleY: 1, duration: 0.8, ease: 'power2.out', stagger: 0.2 },
      );

      // Gold connectors extend
      gsap.fromTo(
        '.gold-connector',
        { scaleX: 0, transformOrigin: 'left' },
        { scaleX: 1, duration: 0.5, ease: 'power2.out', delay: 0.3, stagger: 0.3 },
      );

      // Cards slide in
      gsap.fromTo(
        '.cross-ref-card',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out', delay: 0.5, stagger: 0.3 },
      );

      // Stamps impact
      gsap.fromTo(
        '.card-stamp',
        { scale: 1.4, rotate: -15, opacity: 0 },
        { scale: 1, rotate: -12, opacity: 0.7, duration: 0.4, ease: 'back.out(1.7)', delay: 0.9, stagger: 0.3 },
      );

      // Gold nodes pulse
      gsap.fromTo(
        '.gold-node',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)', delay: 0.1, stagger: 0.5 },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full max-w-2xl mx-auto">
      {items.map((item, index) => {
        const v = VARIANT_STYLES[item.variant ?? 'red'];
        const isLast = index === items.length - 1;

        return (
          <div key={item.href} className="cross-ref-row flex items-stretch relative">
            {/* Gold vertical axis */}
            <div className="flex flex-col items-center w-10 sm:w-14 shrink-0">
              {/* Top node */}
              <div className="gold-node w-2.5 h-2.5 rotate-45 bg-[var(--color-accent-gold)] shadow-[0_0_8px_rgba(201,169,97,0.4)]" />

              {/* Vertical line */}
              <div className="gold-axis-line flex-1 w-px bg-gradient-to-b from-[var(--color-accent-gold)] via-[var(--color-accent-gold)]/60 to-transparent" />
            </div>

            {/* Horizontal connector + card */}
            <div className="flex-1 flex items-start py-4 relative">
              {/* Horizontal connector line */}
              <div className="gold-connector absolute top-8 left-0 w-4 sm:w-6 h-px bg-[var(--color-accent-gold)]/50" />

              {/* Card documento */}
              <a
                href={item.href}
                className={`cross-ref-card group relative flex-1 ml-4 sm:ml-6 p-5 sm:p-7 texture-aged-paper border ${v.border} rounded-paper overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-paper-hover)] hover:-translate-y-0.5`}
                data-seal-react
              >
                {/* Fold corner */}
                <div className="absolute top-0 right-0 w-0 h-0" style={{
                  borderStyle: 'solid',
                  borderWidth: '0 28px 28px 0',
                  borderColor: `transparent var(--color-bg-secondary) transparent transparent`,
                  opacity: 0.5,
                }} />

                {/* Stamp rotated */}
                <div className={`card-stamp absolute top-3 right-3 sm:top-4 sm:right-4`}>
                  <div
                    className="font-stamp text-[7px] sm:text-[8px] tracking-widest px-2 py-1 border border-current rounded-sm"
                    style={{
                      color: item.variant === 'green' ? 'var(--color-stamp-green)' :
                             item.variant === 'blue' ? 'var(--color-stamp-blue)' : 'var(--color-stamp-red)',
                      borderColor: 'currentColor',
                      opacity: 0.7,
                    }}
                  >
                    {STAMP_LABELS[item.variant ?? 'red']}
                  </div>
                </div>

                {/* Reference number */}
                <span className="block font-mono text-[10px] sm:text-xs text-[var(--color-text-secondary)] mb-3 tracking-wider">
                  {item.refNumber ?? `REF-${String(index + 1).padStart(3, '0')}`}
                </span>

                {/* Title */}
                <h3 className={`font-stamp text-sm sm:text-base ${v.text} mb-2 transition-colors`}>
                  {item.label}
                </h3>

                {/* Description */}
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-5 pr-8 sm:pr-12">
                  {item.description}
                </p>

                {/* CTA link */}
                <div className={`flex items-center gap-2 ${v.text} font-stamp text-[10px] sm:text-xs tracking-widest`}>
                  <span>explorar archivo</span>
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </div>
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
