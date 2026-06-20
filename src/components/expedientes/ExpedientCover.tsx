import Stamp from '@components/ui/Stamp';

export interface ExpedientCoverProps {
  title: string;
  expedientNumber: string;
  classification: string;
  status: 'active' | 'archived' | 'featured';
  refinementCount: number;
  className?: string;
  strings?: { refinements?: string; active?: string; archived?: string; featured?: string; archiveHeader?: string };
}

const STATUS_VARIANT = { active: 'green' as const, archived: 'blue' as const, featured: 'red' as const };
const STATUS_LABEL_DEFAULT = { active: 'ACTIVE', archived: 'ARCHIVED', featured: 'FEATURED' };

export default function ExpedientCover({
  title,
  expedientNumber,
  classification,
  status,
  refinementCount,
  className = '',
  strings,
}: ExpedientCoverProps) {
  const variant = STATUS_VARIANT[status];
  const label = strings?.[status] ?? STATUS_LABEL_DEFAULT[status];

  return (
    <header className={`expedient-cover mb-8 ${className}`}>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-stamp text-stamp-label text-[var(--color-text-secondary)]">
          {strings?.archiveHeader ?? 'RENY MIRELES ARCHIVE — EXPEDIENT N°'} {expedientNumber}
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
        <span className="font-mono">{refinementCount} {strings?.refinements ?? 'refinements'}</span>
        <span className="text-[var(--color-archive-kraft)]">·</span>
        <span className="font-stamp text-stamp-label">{label}</span>
      </div>

      {/* Gold separator */}
      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[var(--color-accent-gold)] to-transparent opacity-50" />
    </header>
  );
}
