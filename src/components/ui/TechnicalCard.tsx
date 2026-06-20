import type { ReactNode } from 'react';
import Stamp from './Stamp';

export interface TechnicalCardProps {
  title: string;
  expedientNumber?: string;
  classification?: string;
  fields: Array<{ label: string; value: string | ReactNode }>;
  stampLabel?: string;
  stampVariant?: 'red' | 'blue' | 'green';
  className?: string;
  expPrefix?: string;
}

export default function TechnicalCard({
  title,
  expedientNumber,
  classification,
  fields,
  stampLabel,
  stampVariant = 'blue',
  className = '',
  expPrefix = 'EXP. N°',
}: TechnicalCardProps) {
  return (
    <div
      className={`technical-card texture-aged-paper texture-worn-edges relative rounded-paper border border-[var(--color-archive-kraft)]/30 p-6 shadow-paper ${className}`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          {expedientNumber && (
            <span className="font-stamp text-stamp-label text-[var(--color-text-secondary)]">
              {expPrefix} {expedientNumber}
            </span>
          )}
          <h3 className="font-display text-display-sm text-[var(--color-text-primary)]">
            {title}
          </h3>
          {classification && (
            <p className="mt-1 text-body-sm text-[var(--color-text-secondary)]">
              {classification}
            </p>
          )}
        </div>
        {stampLabel && (
          <Stamp label={stampLabel} variant={stampVariant} size="sm" animate={false} />
        )}
      </div>

      {/* Divider */}
      <div className="mb-4 border-t border-dashed border-[var(--color-archive-kraft)]/40" />

      {/* Fields */}
      <dl className="space-y-3">
        {fields.map(({ label, value }, i) => (
          <div key={i} className="flex flex-col gap-1 sm:flex-row sm:gap-3">
            <dt className="font-stamp text-stamp-label text-[var(--color-text-secondary)] min-w-[120px]">
              {label}
            </dt>
            <dd className="text-body-md text-[var(--color-text-primary)]">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Corner decoration */}
      <div className="absolute right-2 top-2 h-4 w-4 border-r border-t border-[var(--color-archive-kraft)]/30" />
      <div className="absolute bottom-2 left-2 h-4 w-4 border-b border-l border-[var(--color-archive-kraft)]/30" />
    </div>
  );
}
