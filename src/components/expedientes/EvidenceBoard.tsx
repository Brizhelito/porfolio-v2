import { useState } from 'react';
import Stamp from '@components/ui/Stamp';

export interface EvidenceItem {
  id: string;
  title: string;
  expedientNumber: string;
  status: 'active' | 'archived' | 'featured';
  refinementCount: number;
  description?: string;
  stack?: string[];
}

interface EvidenceBoardProps {
  items: EvidenceItem[];
  basePath?: string;
  strings?: { refinements?: string; clickToOpen?: string };
}

const STATUS_VARIANT = {
  active: 'green' as const,
  archived: 'blue' as const,
  featured: 'red' as const,
};

const STATUS_LABEL = {
  active: 'ACTIVO',
  archived: 'ARCHIVADO',
  featured: 'DESTACADO',
};

// Deterministic scatter for visual variety
const ROTATIONS = [-2.5, 1.8, -1.2, 2.5, -0.8, 1.5];

export default function EvidenceBoard({
  items,
  basePath = '/expedientes',
  strings,
}: EvidenceBoardProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => {
          const rot = ROTATIONS[i % ROTATIONS.length];
          const isHovered = hoveredId === item.id;

          return (
            <a
              key={item.id}
              href={`${basePath}/${item.id}`}
              className="block outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-gold)] focus-visible:ring-offset-2"
              style={{
                transform: isHovered
                  ? 'rotate(0deg) translateY(-6px) scale(1.02)'
                  : `rotate(${rot}deg)`,
                transition:
                  'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease',
                filter:
                  hoveredId && !isHovered ? 'opacity(0.7)' : 'opacity(1)',
              }}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              data-seal-react
            >
              <article className="relative rounded-paper bg-[var(--color-bg-primary)] border border-[var(--color-archive-kraft)]/30 shadow-paper hover:shadow-paper-hover transition-shadow overflow-hidden">
                {/* Push pin */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                  <div
                    className="w-5 h-5 rounded-full border-2 shadow-md"
                    style={{
                      background:
                        'radial-gradient(circle at 35% 35%, #E5C158, #A68847)',
                      borderColor: '#8B7340',
                    }}
                  />
                </div>

                {/* Card content */}
                <div className="pt-6 px-5 pb-5">
                  {/* Expedient number */}
                  <p className="font-stamp text-stamp-label text-[var(--color-archive-ink)]/60 mb-2">
                    EXP. {item.expedientNumber}
                  </p>

                  {/* Title */}
                  <h3 className="font-display text-display-sm text-[var(--color-text-primary)] mb-1">
                    {item.title}
                  </h3>

                  {/* Description (truncated) */}
                  {item.description && (
                    <p className="text-body-sm text-[var(--color-text-secondary)] line-clamp-2 mb-3">
                      {item.description}
                    </p>
                  )}

                  {/* Stack preview */}
                  {item.stack && item.stack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.stack.slice(0, 4).map((tool) => (
                        <span
                          key={tool}
                          className="font-mono text-[11px] text-[var(--color-text-secondary)]/70 border border-[var(--color-archive-kraft)]/20 rounded px-1.5 py-0.5"
                        >
                          {tool}
                        </span>
                      ))}
                      {item.stack.length > 4 && (
                        <span className="font-mono text-[11px] text-[var(--color-archive-kraft)]">
                          +{item.stack.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bottom row: refinements + stamp */}
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-body-sm text-[var(--color-accent-gold)]">
                      {item.refinementCount}{' '}
                      {strings?.refinements ?? 'refinamientos'}
                    </p>
                    <Stamp
                      label={STATUS_LABEL[item.status]}
                      variant={STATUS_VARIANT[item.status]}
                      size="sm"
                      animate={false}
                    />
                  </div>

                  {/* Click-to-open hint */}
                  <div
                    className="mt-3 pt-3 border-t border-dashed border-[var(--color-archive-kraft)]/25 flex items-center gap-1.5"
                    style={{
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered ? 'translateY(0)' : 'translateY(4px)',
                      transition: 'opacity 0.25s ease 0.1s, transform 0.25s ease 0.1s',
                    }}
                  >
                    <svg className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                    </svg>
                    <span className="font-mono text-[11px] text-[var(--color-text-secondary)]">
                      {strings?.clickToOpen ?? 'Haz clic para abrir...'}
                    </span>
                  </div>
                </div>

                {/* Corner fold decoration */}
                <div className="absolute bottom-0 right-0 w-6 h-6 overflow-hidden">
                  <div
                    className="absolute bottom-0 right-0 w-0 h-0"
                    style={{
                      borderLeft: '24px solid transparent',
                      borderBottom:
                        '24px solid var(--color-bg-secondary)',
                    }}
                  />
                </div>
              </article>
            </a>
          );
        })}
      </div>
    </div>
  );
}
