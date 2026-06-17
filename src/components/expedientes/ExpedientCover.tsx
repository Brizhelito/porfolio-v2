import Stamp from '@components/ui/Stamp';

export interface ExpedientCoverProps {
  title: string;
  expedientNumber: string;
  classification: string;
  status: 'active' | 'archived' | 'featured';
  refinementCount: number;
  className?: string;
}

const STATUS_MAP = {
  active: { label: 'ACTIVO', variant: 'green' as const },
  archived: { label: 'ARCHIVADO', variant: 'blue' as const },
  featured: { label: 'DESTACADO', variant: 'red' as const },
};

export default function ExpedientCover({
  title,
  expedientNumber,
  classification,
  status,
  refinementCount,
  className = '',
}: ExpedientCoverProps) {
  const { label, variant } = STATUS_MAP[status];

  return (
    <header className={`expedient-cover mb-8 ${className}`}>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-stamp text-stamp-label text-[var(--color-text-secondary)]" data-i18n="common.expedient">
          ARCHIVO RENY MIRELES — EXPEDIENTE N° {expedientNumber}
        </span>
        <Stamp label={label} variant={variant} size="sm" />
      </div>

      {/* Title */}
      <h1 className="font-display text-display-lg text-[var(--color-text-primary)] mb-2">
        {title}
      </h1>

      {/* Classification */}
      <p className="text-body-lg text-[var(--color-text-secondary)] mb-4">
        {classification}
      </p>

      {/* Metadata line */}
      <div className="flex flex-wrap items-center gap-4 text-body-sm text-[var(--color-text-secondary)]">
        <span className="font-mono">{refinementCount} refinamientos</span>
        <span className="text-[var(--color-archive-kraft)]">·</span>
        <span className="font-stamp text-stamp-label">{label}</span>
      </div>

      {/* Gold separator */}
      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[var(--color-accent-gold)] to-transparent opacity-50" />
    </header>
  );
}
