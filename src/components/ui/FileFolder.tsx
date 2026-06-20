import { useState, useRef, useEffect, type ReactNode } from 'react';
import { animations, prefersReducedMotion } from '@lib/animations';
import Stamp from './Stamp';

export interface FileFolderProps {
  title: string;
  expedientNumber: string;
  status: 'active' | 'archived' | 'featured';
  refinementCount: number;
  children?: ReactNode;
  onOpen?: () => void;
  className?: string;
  strings?: { refinements?: string; clickToOpen?: string; active?: string; archived?: string; featured?: string; open?: string };
  /** Hero variant: shows classification, stack highlights, and metrics */
  variant?: 'default' | 'hero';
  classification?: string;
  stack?: string[];
  metrics?: Record<string, number>;
}

const STATUS_VARIANT = {
  active: 'green' as const,
  archived: 'blue' as const,
  featured: 'red' as const,
};

const STATUS_LABEL_DEFAULT = { active: 'ACTIVE', archived: 'ARCHIVED', featured: 'FEATURED' };

export default function FileFolder({
  title,
  expedientNumber,
  status,
  refinementCount,
  children,
  onOpen,
  className = '',
  strings,
  variant = 'default',
  classification,
  stack,
  metrics,
}: FileFolderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const folderRef = useRef<HTMLDivElement>(null);
  const isHero = variant === 'hero';
  // P1-05 / P2-07: track touch + hover to drive the "Abrir" hint visibility
  // and to decide whether tapping the hero should toggle (desktop) or
  // navigate (touch — handled by the parent <a>).
  const [isTouch, setIsTouch] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  useEffect(() => {
    setIsTouch(
      window.matchMedia('(hover: none)').matches ||
      window.matchMedia('(pointer: coarse)').matches
    );
  }, []);

  const handleToggle = () => {
    // P1-05: on touch, the hero variant's tap should NOT toggle the flap
    // (the parent <a> navigates). Let the click bubble to <a> on touch.
    if (isHero && isTouch) return;
    if (!folderRef.current) return;

    if (isOpen) {
      if (!prefersReducedMotion) {
        animations.closeFolder(folderRef.current);
      }
      setIsOpen(false);
    } else {
      if (!prefersReducedMotion) {
        animations.openFolder(folderRef.current);
      }
      setIsOpen(true);
      onOpen?.();
    }
  };

  return (
    <div
      ref={folderRef}
      className={`file-folder relative cursor-pointer ${className}`}
      style={{ perspective: '800px' }}
      onClick={handleToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleToggle()}
      aria-expanded={isOpen}
    >
      {/* Folder Tab */}
      <div
        className="texture-folder relative rounded-t-paper px-4 py-1"
        style={{
          width: isHero ? '35%' : '40%',
          marginLeft: '10%',
        }}
      >
        <span className={`font-stamp text-[var(--color-archive-ink)] ${isHero ? 'text-caption' : 'text-caption'}`}>
          EXP. {expedientNumber}
        </span>
      </div>

      {/* Folder Body */}
      <div className={`texture-folder relative overflow-hidden rounded-b-paper rounded-tr-paper border border-[var(--color-archive-kraft)]/30 shadow-paper transition-shadow hover:shadow-paper-hover ${isHero ? 'px-6 py-5' : ''}`}>
        {/* Flap (top part that opens) */}
        <div
          className="folder-flap relative px-5 py-4"
          style={{ transformOrigin: 'top center', transformStyle: 'preserve-3d' }}
        >
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className={`font-display text-[var(--color-text-primary)] ${isHero ? 'text-display-md' : 'text-display-sm'}`}>
                {title}
              </h3>
              {isHero && classification && (
                <p className="mt-1.5 text-body-sm text-[var(--color-text-secondary)] leading-snug">
                  {classification}
                </p>
              )}
              <p className={`text-[var(--color-text-secondary)] ${isHero ? 'mt-2 text-body-sm' : 'mt-1 text-body-sm'}`}>
                {refinementCount}                 {strings?.refinements ?? 'refinements'}
              </p>
            </div>
            <Stamp
              label={strings?.[status] ?? STATUS_LABEL_DEFAULT[status]}
              variant={STATUS_VARIANT[status]}
              size={isHero ? 'md' : 'sm'}
              animate={false}
            />
          </div>

          {/* Hero-only: stack chips */}
          {isHero && stack && stack.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {stack.slice(0, 6).map((tech) => (
                <span
                  key={tech}
                  className="inline-block rounded-[2px] border border-[var(--color-archive-kraft)]/40 bg-[var(--color-archive-white)]/60 px-2 py-0.5 font-mono text-[10px] text-[var(--color-text-secondary)]"
                >
                  {tech}
                </span>
              ))}
              {stack.length > 6 && (
                <span className="inline-block px-1 font-mono text-[10px] text-[var(--color-text-secondary)]/60">
                  +{stack.length - 6}
                </span>
              )}
            </div>
          )}

          {/* Hero-only: metrics row */}
          {isHero && metrics && Object.keys(metrics).length > 0 && (
            <div className="mt-3 flex items-center gap-3 text-caption font-mono text-[var(--color-text-secondary)]/70">
              {Object.entries(metrics).slice(0, 3).map(([key, val]) => (
                <span key={key} className="flex items-center gap-1">
                  <span className="text-[var(--color-accent-gold)]">{val}</span>
                  <span className="uppercase tracking-wider text-[9px]">{key}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content (hidden until opened) */}
        <div
          className="folder-content border-t border-[var(--color-archive-kraft)]/20 px-5 py-4"
          style={{ opacity: isOpen ? 1 : 0, transform: isOpen ? 'none' : 'translateY(10px)' }}
        >
          {children ?? (
            <p className="text-body-md text-[var(--color-text-secondary)]">
              {strings?.clickToOpen ?? 'Click to open the expedient...'}
            </p>
          )}
        </div>

        {/* Hero-only: open hint — P2-07: only show when hovered on
            desktop. On touch, the parent <a> navigates so the hint would
            be misleading; hide it entirely. */}
        {isHero && !isOpen && !isTouch && isHovered && (
          <div className="absolute bottom-2 right-3 flex items-center gap-1 text-[10px] font-mono text-[var(--color-accent-gold)]/50 uppercase tracking-widest">
            <span>{strings?.open ?? 'Open'}</span>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
