import { useState } from 'react';
import Stamp from '@components/ui/Stamp';

export interface PinCardItem {
  id: string;
  title: string;
  expedientNumber: string;
  status: 'active' | 'archived' | 'featured';
  refinementCount: number;
  description?: string;
  stack?: string[];
  metrics?: Record<string, number>;
}

interface PinCardProps {
  item: PinCardItem;
  basePath?: string;
  size?: 'compact' | 'default' | 'spotlight';
  rotation?: number;
  strings?: {
    refinements?: string;
    clickToOpen?: string;
    active?: string;
    archived?: string;
    featured?: string;
  };
}

const STATUS_VARIANT = {
  active: 'green' as const,
  archived: 'blue' as const,
  featured: 'red' as const,
};

const STATUS_LABEL = { active: 'ACTIVE', archived: 'ARCHIVED', featured: 'FEATURED' };

export default function PinCard({
  item,
  basePath = '/expedientes',
  size = 'default',
  rotation = 0,
  strings,
}: PinCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const statusLabel = strings?.[item.status] ?? STATUS_LABEL[item.status];

  const isCompact = size === 'compact';
  const isSpotlight = size === 'spotlight';

  return (
    <a
      href={`${basePath}/${item.id}`}
      className="block outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-gold)] focus-visible:ring-offset-2"
      style={{
        transform: isHovered
          ? 'rotate(0deg) translateY(-8px) scale(1.03)'
          : `rotate(${rotation}deg)`,
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease',
        filter: isHovered ? 'none' : undefined,
        zIndex: isHovered ? 50 : 1,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-seal-react
    >
      <article
        className={`
          relative overflow-hidden rounded-[2px]
          bg-[var(--color-bg-primary)]
          border border-[var(--color-archive-kraft)]/30
          shadow-paper
          transition-shadow duration-300
          ${isHovered ? 'shadow-[0_12px_24px_rgba(26,24,20,0.15),0_4px_8px_rgba(26,24,20,0.1)]' : ''}
          ${isSpotlight ? 'px-6 py-5' : isCompact ? 'px-4 py-3' : 'px-5 py-4'}
        `}
      >
        {/* Push pin */}
        <div className="push-pin" />

        {/* Tape decoration on spotlight cards */}
        {isSpotlight && (
          <>
            <div className="tape-strip tape-strip--tl" />
            <div className="tape-strip tape-strip--tr" />
          </>
        )}

        {/* Expedient number */}
        <p className="font-stamp text-[10px] text-[var(--color-archive-ink)]/50 mb-2 mt-1">
          EXP. {item.expedientNumber}
        </p>

        {/* Title */}
        <h3
          className={`font-display text-[var(--color-text-primary)] mb-1 ${
            isSpotlight ? 'text-xl' : isCompact ? 'text-sm' : 'text-base'
          }`}
        >
          {item.title}
        </h3>

        {/* Description */}
        {!isCompact && item.description && (
          <p className={`text-[var(--color-text-secondary)] mb-2 line-clamp-2 ${
            isSpotlight ? 'text-sm' : 'text-xs'
          }`}>
            {item.description.slice(0, isSpotlight ? 160 : 100)}
            {item.description.length > (isSpotlight ? 160 : 100) ? '...' : ''}
          </p>
        )}

        {/* Stack chips (spotlight only) */}
        {isSpotlight && item.stack && item.stack.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.stack.slice(0, 6).map((tech) => (
              <span
                key={tech}
                className="inline-block rounded-[2px] border border-[var(--color-archive-kraft)]/40 bg-[var(--color-archive-white)]/60 px-2 py-0.5 font-mono text-[10px] text-[var(--color-text-secondary)]"
              >
                {tech}
              </span>
            ))}
            {item.stack.length > 6 && (
              <span className="inline-block px-1 font-mono text-[10px] text-[var(--color-text-secondary)]/60">
                +{item.stack.length - 6}
              </span>
            )}
          </div>
        )}

        {/* Metrics row (spotlight only) */}
        {isSpotlight && item.metrics && Object.keys(item.metrics).length > 0 && (
          <div className="flex items-center gap-3 mb-3 text-[11px] font-mono text-[var(--color-text-secondary)]/70">
            {Object.entries(item.metrics).slice(0, 3).map(([key, val]) => (
              <span key={key} className="flex items-center gap-1">
                <span className="text-[var(--color-accent-gold)]">{val}</span>
                <span className="uppercase tracking-wider text-[9px]">{key}</span>
              </span>
            ))}
          </div>
        )}

        {/* Bottom row: refinements + stamp */}
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-[var(--color-accent-gold)]">
            {item.refinementCount}{' '}
            {strings?.refinements ?? 'refinements'}
          </p>
          <Stamp
            label={statusLabel}
            variant={STATUS_VARIANT[item.status]}
            size="sm"
            animate={false}
          />
        </div>

        {/* Hover hint */}
        <div
          className="mt-2 pt-2 border-t border-dashed border-[var(--color-archive-kraft)]/25 flex items-center gap-1.5"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(4px)',
            transition: 'opacity 0.25s ease 0.1s, transform 0.25s ease 0.1s',
          }}
        >
          <svg className="w-3 h-3 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
          </svg>
          <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">
            {strings?.clickToOpen ?? 'Click to open the expedient...'}
          </span>
        </div>

        {/* Corner fold */}
        <div className="absolute bottom-0 right-0 w-5 h-5 overflow-hidden">
          <div
            className="absolute bottom-0 right-0 w-0 h-0"
            style={{
              borderLeft: '20px solid transparent',
              borderBottom: '20px solid var(--color-bg-secondary)',
            }}
          />
        </div>
      </article>
    </a>
  );
}
