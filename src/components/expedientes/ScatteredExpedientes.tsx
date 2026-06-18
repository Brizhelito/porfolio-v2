import { useState, useRef } from 'react';
import { animations, prefersReducedMotion } from '@lib/animations';
import Stamp from '@components/ui/Stamp';

export interface Expediente {
  id: string;
  title: string;
  expedientNumber: string;
  status: 'active' | 'archived' | 'featured';
  refinementCount: number;
}

interface ScatteredExpedientesProps {
  expedientes: Expediente[];
  strings?: { refinements?: string; openExpedient?: string };
  /** Base path for links, e.g. '/expedientes' or '/en/expedientes' */
  basePath?: string;
}

// Deterministic scatter values per index (rotation, offsetX, offsetY)
const SCATTER_CONFIGS = [
  { rot: -7, x: -12, y: 8, z: 2 },
  { rot: 5, x: 18, y: -4, z: 1 },
  { rot: -3, x: -5, y: 14, z: 3 },
  { rot: 8, x: 10, y: -10, z: 1 },
  { rot: -5, x: -16, y: 2, z: 2 },
];

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

export default function ScatteredExpedientes({
  expedientes,
  strings,
  basePath = '/expedientes',
}: ScatteredExpedientesProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const folderRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
    const el = folderRefs.current[index];
    if (el && !prefersReducedMotion) {
      animations.openFolder(el);
    }
  };

  const handleMouseLeave = (index: number) => {
    setHoveredIndex(null);
    const el = folderRefs.current[index];
    if (el && !prefersReducedMotion) {
      animations.closeFolder(el);
    }
  };

  return (
    <div className="scattered-desk relative w-full" style={{ perspective: '1200px' }}>
      <div className="flex flex-col items-center gap-0 py-8">
        {expedientes.map((exp, i) => {
          const scatter = SCATTER_CONFIGS[i % SCATTER_CONFIGS.length];
          const isHovered = hoveredIndex === i;
          const isOtherHovered = hoveredIndex !== null && hoveredIndex !== i;

          return (
            <a
              key={exp.id}
              href={`${basePath}/${exp.id}`}
              className="scattered-item block w-full max-w-md"
              style={{
                zIndex: isHovered ? 50 : scatter.z,
                transition: prefersReducedMotion
                  ? 'none'
                  : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease, margin 0.4s ease',
                transform: isHovered
                  ? 'rotate(0deg) translateX(0) translateY(0) scale(1.03)'
                  : isOtherHovered
                    ? `rotate(${scatter.rot * 0.3}deg) translateX(${scatter.x * 0.3}px) scale(0.97) translateY(0)`
                    : `rotate(${scatter.rot}deg) translate(${scatter.x}px, ${scatter.y}px) scale(1)`,
                opacity: isOtherHovered ? 0.6 : 1,
                marginTop: i === 0 ? 0 : isHovered ? '12px' : '-8px',
                marginBottom: i === expedientes.length - 1 ? 0 : isHovered ? '12px' : '-8px',
              }}
              onMouseEnter={() => handleMouseEnter(i)}
              onMouseLeave={() => handleMouseLeave(i)}
              data-seal-react
            >
              <div
                ref={(el) => { folderRefs.current[i] = el; }}
                className="scattered-folder relative cursor-pointer"
                style={{ perspective: '800px' }}
                role="button"
                tabIndex={0}
                aria-expanded={isHovered}
              >
                {/* Folder Tab */}
                <div
                  className="texture-folder relative rounded-t-paper px-4 py-1"
                  style={{ width: '40%', marginLeft: '10%' }}
                >
                  <span className="font-stamp text-caption text-[var(--color-archive-ink)]">
                    EXP. {exp.expedientNumber}
                  </span>
                </div>

                {/* Folder Body */}
                <div
                  className="texture-folder relative overflow-hidden rounded-b-paper rounded-tr-paper border border-[var(--color-archive-kraft)]/30 transition-shadow duration-300"
                  style={{
                    boxShadow: isHovered
                      ? '0 12px 24px rgba(26, 24, 20, 0.2), 0 4px 8px rgba(26, 24, 20, 0.1)'
                      : 'var(--shadow-paper)',
                  }}
                >
                  {/* Flap */}
                  <div
                    className="folder-flap relative px-5 py-4"
                    style={{
                      transformOrigin: 'top center',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-display text-display-sm text-[var(--color-text-primary)]">
                          {exp.title}
                        </h3>
                        <p className="mt-1 text-body-sm text-[var(--color-text-secondary)]">
                          {exp.refinementCount} {strings?.refinements ?? 'refinamientos'}
                        </p>
                      </div>
                      <Stamp
                        label={STATUS_LABEL[exp.status]}
                        variant={STATUS_VARIANT[exp.status]}
                        size="sm"
                        animate={false}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div
                    className="folder-content border-t border-[var(--color-archive-kraft)]/20 px-5 py-4"
                    style={{
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered ? 'none' : 'translateY(10px)',
                      transition: prefersReducedMotion
                        ? 'none'
                        : 'opacity 0.3s ease 0.15s, transform 0.3s ease 0.15s',
                    }}
                  >
                    <p className="text-body-sm text-[var(--color-text-secondary)]">
                      {strings?.openExpedient ?? 'Haz clic para abrir el expediente...'}
                    </p>
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
