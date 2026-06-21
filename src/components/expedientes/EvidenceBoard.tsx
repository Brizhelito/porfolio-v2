import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import PinCard from './PinCard';
import type { PinCardItem } from './PinCard';
import Stamp from '@components/ui/Stamp';

export interface EvidenceItem {
  id: string;
  title: string;
  expedientNumber: string;
  status: 'active' | 'archived' | 'featured';
  refinementCount: number;
  description?: string;
  stack?: string[];
  metrics?: Record<string, number>;
}

interface EvidenceBoardProps {
  items: EvidenceItem[];
  basePath?: string;
  variant?: 'grid' | 'corkboard';
  strings?: {
    refinements?: string;
    clickToOpen?: string;
    active?: string;
    archived?: string;
    featured?: string;
    archivedPlural?: string;
  };
}

// Deterministic rotations per index
const FEATURED_ROTATIONS = [-1.5, 1.2];
const ACTIVE_ROTATIONS = [-2.5, 1.8, -1.2, 2.5, -0.8, 1.5, -0.5, 2.0];
const GRID_ROTATIONS = [-2.5, 1.8, -1.2, 2.5, -0.8, 1.5];

const STATUS_VARIANT = {
  active: 'green' as const,
  archived: 'blue' as const,
  featured: 'red' as const,
};

const STATUS_LABEL = { active: 'ACTIVE', archived: 'ARCHIVED', featured: 'FEATURED' };

interface Connection {
  from: string;
  to: string;
  shared: string[];
}

function computeConnections(items: EvidenceItem[]): Connection[] {
  const connections: Connection[] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const stackA = items[i].stack ?? [];
      const stackB = items[j].stack ?? [];
      const shared = stackA.filter((t) => stackB.includes(t));
      if (shared.length > 0) {
        connections.push({ from: items[i].id, to: items[j].id, shared });
      }
    }
  }
  return connections;
}

/* ============================================
   Grid variant — original homepage look
   ============================================ */
function GridVariant({
  items,
  basePath,
  strings,
}: {
  items: EvidenceItem[];
  basePath: string;
  strings?: EvidenceBoardProps['strings'];
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const statusLabel = (s: keyof typeof STATUS_LABEL) => strings?.[s] ?? STATUS_LABEL[s];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => {
          const rot = GRID_ROTATIONS[i % GRID_ROTATIONS.length];
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
                  <p className="font-stamp text-stamp-label text-[var(--color-archive-ink)]/60 mb-2">
                    EXP. {item.expedientNumber}
                  </p>

                  <h3 className="font-display text-display-sm text-[var(--color-text-primary)] mb-1">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-body-sm text-[var(--color-text-secondary)] line-clamp-2 mb-3">
                      {item.description}
                    </p>
                  )}

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

                  <div className="flex items-center justify-between">
                    <p className="font-mono text-body-sm text-[var(--color-accent-gold)]">
                      {item.refinementCount}{' '}
                      {strings?.refinements ?? 'refinements'}
                    </p>
                    <Stamp
                      label={statusLabel(item.status)}
                      variant={STATUS_VARIANT[item.status]}
                      size="sm"
                      animate={false}
                    />
                  </div>

                  {/* Click-to-open hint — touch-hint makes it visible on touch */}
                  <div
                    className="touch-hint mt-3 pt-3 border-t border-dashed border-[var(--color-archive-kraft)]/25 flex items-center gap-1.5"
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
                      {strings?.clickToOpen ?? 'Click to open the expedient...'}
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

/* ============================================
   Corkboard variant — listing page
   ============================================ */
function CorkboardVariant({
  items,
  basePath,
  strings,
}: {
  items: EvidenceItem[];
  basePath: string;
  strings?: EvidenceBoardProps['strings'];
}) {
  const boardRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const featured = useMemo(
    () => items.filter((e) => e.status === 'featured'),
    [items]
  );
  const active = useMemo(
    () => items.filter((e) => e.status === 'active'),
    [items]
  );
  const archived = useMemo(
    () => items.filter((e) => e.status === 'archived'),
    [items]
  );

  const connections = useMemo(() => computeConnections(items), [items]);

  const setCardRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) {
      cardRefs.current.set(id, el);
    } else {
      cardRefs.current.delete(id);
    }
  }, []);

  const connectedIds = useMemo(() => {
    if (!hoveredId) return new Set<string>();
    const ids = new Set<string>();
    ids.add(hoveredId);
    for (const conn of connections) {
      if (conn.from === hoveredId) ids.add(conn.to);
      if (conn.to === hoveredId) ids.add(conn.from);
    }
    return ids;
  }, [hoveredId, connections]);

  const [lines, setLines] = useState<{ from: { x: number; y: number }; to: { x: number; y: number }; shared: string[]; key: string }[]>([]);

  // Shared line recomputation — used on mount, resize, and scroll.
  const recomputeLines = useCallback(() => {
    const board = boardRef.current;
    if (!board || connections.length === 0) return;

    const boardRect = board.getBoundingClientRect();
    const newLines: { from: { x: number; y: number }; to: { x: number; y: number }; shared: string[]; key: string }[] = [];

    for (const conn of connections) {
      const elFrom = cardRefs.current.get(conn.from);
      const elTo = cardRefs.current.get(conn.to);
      if (!elFrom || !elTo) continue;

      const fromRect = elFrom.getBoundingClientRect();
      const toRect = elTo.getBoundingClientRect();

      newLines.push({
        key: `${conn.from}-${conn.to}`,
        from: {
          x: fromRect.left + fromRect.width / 2 - boardRect.left,
          y: fromRect.top + fromRect.height / 2 - boardRect.top,
        },
        to: {
          x: toRect.left + toRect.width / 2 - boardRect.left,
          y: toRect.top + toRect.height / 2 - boardRect.top,
        },
        shared: conn.shared,
      });
    }

    setLines(newLines);
  }, [connections]);

  // Initial computation + delayed recompute (waits for layout settle)
  useEffect(() => {
    recomputeLines();
    const timer = setTimeout(recomputeLines, 100);
    return () => clearTimeout(timer);
  }, [recomputeLines]);

  // Recompute on resize and scroll (rAF-throttled for scroll performance)
  useEffect(() => {
    let ticking = false;
    const onScrollResize = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        recomputeLines();
      });
    };
    window.addEventListener('resize', onScrollResize);
    window.addEventListener('scroll', onScrollResize, { passive: true });
    return () => {
      window.removeEventListener('resize', onScrollResize);
      window.removeEventListener('scroll', onScrollResize);
    };
  }, [recomputeLines]);

  const isAnyHovered = hoveredId !== null;

  return (
    <div ref={boardRef} className="corkboard relative w-full p-6 sm:p-8 lg:p-10">
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      >
        {lines.map((line) => {
          const isActive =
            hoveredId !== null &&
            connectedIds.has(line.key.split('-')[0]) &&
            connectedIds.has(line.key.split('-')[1]);
          const mx = (line.from.x + line.to.x) / 2;
          const my = (line.from.y + line.to.y) / 2 - 20;
          return (
            <g key={line.key}>
              <path
                d={`M ${line.from.x} ${line.from.y} Q ${mx} ${my} ${line.to.x} ${line.to.y}`}
                className={`evidence-string ${isActive ? 'active' : ''}`}
                style={{
                  transition: 'opacity 0.3s ease, stroke-width 0.3s ease',
                }}
              />
              {line.shared.length <= 2 && (
                <text
                  x={mx}
                  y={my - 6}
                  className="fill-[var(--color-stamp-red)] opacity-60"
                  fontSize="9"
                  fontFamily="var(--font-family-mono)"
                  textAnchor="middle"
                >
                  {line.shared.join(' · ')}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="relative z-10">
        {featured.length > 0 && (
          <div className="mb-10">
            <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
              {featured.map((item, i) => (
                <div
                  key={item.id}
                  ref={(el) => setCardRef(item.id, el)}
                  style={{ opacity: isAnyHovered && !connectedIds.has(item.id) && hoveredId !== item.id ? 0.5 : 1, transition: 'opacity 0.3s ease' }}
                >
                  <PinCard
                    item={item}
                    basePath={basePath}
                    size="spotlight"
                    rotation={FEATURED_ROTATIONS[i % FEATURED_ROTATIONS.length]}
                    strings={strings}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {active.length > 0 && (
          <div className="mb-10">
            <div className="grid gap-6 sm:gap-8 sm:grid-cols-2">
              {active.map((item, i) => (
                <div
                  key={item.id}
                  ref={(el) => setCardRef(item.id, el)}
                  style={{ opacity: isAnyHovered && !connectedIds.has(item.id) && hoveredId !== item.id ? 0.5 : 1, transition: 'opacity 0.3s ease' }}
                >
                  <PinCard
                    item={item}
                    basePath={basePath}
                    size="default"
                    rotation={ACTIVE_ROTATIONS[i % ACTIVE_ROTATIONS.length]}
                    strings={strings}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {archived.length > 0 && (
          <div>
            <h3 className="font-stamp text-sm text-[var(--color-text-secondary)]/60 mb-4">
              {strings?.archivedPlural ?? 'ARCHIVADOS'}
            </h3>
            <div className="archived-pile flex flex-col max-w-md">
              {archived.map((item) => (
                <div
                  key={item.id}
                  ref={(el) => setCardRef(item.id, el)}
                  style={{
                    opacity: isAnyHovered && !connectedIds.has(item.id) && hoveredId !== item.id ? 0.4 : 1,
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  <PinCard
                    item={item}
                    basePath={basePath}
                    size="compact"
                    strings={strings}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================
   Main component
   ============================================ */
export default function EvidenceBoard({
  items,
  basePath = '/expedientes',
  variant = 'corkboard',
  strings,
}: EvidenceBoardProps) {
  if (variant === 'grid') {
    return <GridVariant items={items} basePath={basePath} strings={strings} />;
  }
  return <CorkboardVariant items={items} basePath={basePath} strings={strings} />;
}
