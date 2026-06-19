import { useEffect, useRef } from 'react';
import { animations, prefersReducedMotion } from '@lib/animations';

export interface Refinement {
  id: number;
  title: string;
  description: string;
  isKey?: boolean;
}

export interface RefinementTimelineProps {
  refinements: Refinement[];
  className?: string;
  strings?: { title?: string; key?: string };
}

export default function RefinementTimeline({
  refinements,
  className = '',
  strings,
}: RefinementTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion) return;

    const items = containerRef.current.querySelectorAll('.refinement-item');
    const tween = animations.staggerReveal(
      Array.from(items) as HTMLElement[],
      { stagger: 0.1 },
    );

    // P2-06: kill the ScrollTrigger created by staggerReveal when the
    // component unmounts. Without this, navigating between expedientes
    // accumulates stale triggers in the global ScrollTrigger registry.
    return () => {
      if (tween) {
        tween.scrollTrigger?.kill();
        tween.kill();
      }
    };
  }, []);

  return (
    <section className={`refinement-timeline ${className}`}>
      <h2 className="font-display text-display-md text-[var(--color-text-primary)] mb-6">
        {strings?.title ?? 'Refinamientos'}
      </h2>
      <div ref={containerRef} className="relative pl-6 border-l-2 border-[var(--color-archive-kraft)]/30">
        {refinements.map((r) => (
          <div
            key={r.id}
            className="refinement-item relative mb-6 last:mb-0"
          >
            {/* Timeline dot */}
            <div
              className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 ${
                r.isKey
                  ? 'border-[var(--color-accent-gold)] bg-[var(--color-accent-gold)] shadow-stamp'
                  : 'border-[var(--color-archive-kraft)] bg-[var(--color-bg-primary)]'
              }`}
            />

            {/* Content */}
            <div className="ml-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-caption text-[var(--color-text-secondary)]">
                  #{r.id}
                </span>
                <h3 className={`font-display text-body-md font-semibold ${
                  r.isKey ? 'text-[var(--color-accent-gold)]' : 'text-[var(--color-text-primary)]'
                }`}>
                  {r.title}
                </h3>
                {r.isKey && (
                  <span className="font-stamp text-[9px] text-[var(--color-accent-gold)] border border-[var(--color-accent-gold)]/30 rounded px-1">
                    {strings?.key ?? 'CLAVE'}
                  </span>
                )}
              </div>
              <p className="mt-1 text-body-sm text-[var(--color-text-secondary)]">
                {r.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
