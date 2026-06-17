import { useState, useRef, type ReactNode } from 'react';
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

export default function FileFolder({
  title,
  expedientNumber,
  status,
  refinementCount,
  children,
  onOpen,
  className = '',
}: FileFolderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const folderRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
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
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleToggle()}
      aria-expanded={isOpen}
    >
      {/* Folder Tab */}
      <div
        className="texture-folder relative rounded-t-paper px-4 py-1"
        style={{
          width: '40%',
          marginLeft: '10%',
        }}
      >
        <span className="font-stamp text-caption text-[var(--color-archive-ink)]">
          EXP. {expedientNumber}
        </span>
      </div>

      {/* Folder Body */}
      <div className="texture-folder relative overflow-hidden rounded-b-paper rounded-tr-paper border border-[var(--color-archive-kraft)]/30 shadow-paper transition-shadow hover:shadow-paper-hover">
        {/* Flap (top part that opens) */}
        <div
          className="folder-flap relative px-5 py-4"
          style={{ transformOrigin: 'top center', transformStyle: 'preserve-3d' }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-display-sm text-[var(--color-text-primary)]">
                {title}
              </h3>
              <p className="mt-1 text-body-sm text-[var(--color-text-secondary)]">
                {refinementCount} refinamientos
              </p>
            </div>
            <Stamp
              label={STATUS_LABEL[status]}
              variant={STATUS_VARIANT[status]}
              size="sm"
              animate={false}
            />
          </div>
        </div>

        {/* Content (hidden until opened) */}
        <div
          className="folder-content border-t border-[var(--color-archive-kraft)]/20 px-5 py-4"
          style={{ opacity: isOpen ? 1 : 0, transform: isOpen ? 'none' : 'translateY(10px)' }}
        >
          {children ?? (
            <p className="text-body-md text-[var(--color-text-secondary)]">
              Haz clic para abrir el expediente...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
