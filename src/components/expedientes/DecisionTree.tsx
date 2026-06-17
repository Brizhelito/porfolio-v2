import { useState } from 'react';

export interface DecisionOption {
  label: string;
  path: string;
  chosen?: boolean;
  description?: string;
}

export interface DecisionTreeProps {
  question: string;
  options: DecisionOption[];
  className?: string;
}

export default function DecisionTree({
  question,
  options,
  className = '',
}: DecisionTreeProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section className={`decision-tree ${className}`}>
      <h2 className="font-display text-display-md text-[var(--color-text-primary)] mb-4">
        Árbol de Decisiones
      </h2>

      {/* Question */}
      <div className="texture-aged-paper rounded-paper border border-[var(--color-archive-kraft)]/20 p-4 mb-4">
        <p className="font-display text-body-lg font-semibold text-[var(--color-text-primary)]">
          {question}
        </p>
      </div>

      {/* Options as branching paths */}
      <div className="relative pl-8">
        {/* Vertical line */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-[var(--color-archive-kraft)]/30" />

        {options.map((opt, idx) => (
          <div
            key={idx}
            className="decision-option relative mb-4 last:mb-0"
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {/* Branch dot */}
            <div
              className={`absolute -left-[22px] top-3 h-3 w-3 rounded-full border-2 transition-colors ${
                opt.chosen
                  ? 'border-[var(--color-accent-gold)] bg-[var(--color-accent-gold)]'
                  : hoveredIdx === idx
                    ? 'border-[var(--color-accent-gold)] bg-transparent'
                    : 'border-[var(--color-archive-kraft)] bg-[var(--color-bg-primary)]'
              }`}
            />

            {/* Branch line */}
            <div
              className={`absolute -left-[17px] top-[18px] h-px w-4 transition-colors ${
                opt.chosen
                  ? 'bg-[var(--color-accent-gold)]'
                  : 'bg-[var(--color-archive-kraft)]/30'
              }`}
            />

            {/* Option card */}
            <div
              className={`rounded-paper border p-3 transition-all ${
                opt.chosen
                  ? 'border-[var(--color-accent-gold)]/40 shadow-stamp bg-[var(--color-accent-gold)]/5'
                  : 'border-[var(--color-archive-kraft)]/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`font-display text-body-md font-semibold ${
                  opt.chosen ? 'text-[var(--color-accent-gold)]' : 'text-[var(--color-text-primary)]'
                }`}>
                  {opt.label}
                </span>
                {opt.chosen && (
                  <span className="font-stamp text-[9px] text-[var(--color-accent-gold)] border border-[var(--color-accent-gold)]/30 rounded px-1">
                    ELEGIDO
                  </span>
                )}
              </div>
              {opt.description && (
                <p className="mt-1 text-body-sm text-[var(--color-text-secondary)]">
                  {opt.description}
                </p>
              )}
              <span className="mt-1 inline-block font-mono text-caption text-[var(--color-text-secondary)]">
                → {opt.path}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
