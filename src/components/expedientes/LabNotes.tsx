import { useState, type ReactNode } from 'react';

export interface LabNoteProps {
  date: string;
  topic: string;
  children: ReactNode;
}

function LabNote({ date, topic, children }: LabNoteProps) {
  const [expanded, setExpanded] = useState(false);

  // P2-09: full keyboard accessibility. Previously this was a div with
  // onClick only — no role, no tabIndex, no key handler, no aria-expanded.
  // Keyboard users couldn't expand lab notes at all.
  return (
    <div
      className="lab-note texture-aged-paper rounded-paper border border-[var(--color-archive-kraft)]/20 p-4 cursor-pointer transition-shadow hover:shadow-paper"
      onClick={() => setExpanded(!expanded)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setExpanded(!expanded);
        }
      }}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="font-mono text-caption text-[var(--color-accent-gold)]">
            {date}
          </span>
          <span className="font-display text-body-md font-semibold text-[var(--color-text-primary)]">
            {topic}
          </span>
        </div>
        <svg
          className={`h-4 w-4 text-[var(--color-text-secondary)] transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {expanded && (
        <div className="prose-expedient mt-3 border-t border-dashed border-[var(--color-archive-kraft)]/30 pt-3">
          {children}
        </div>
      )}
    </div>
  );
}

export interface LabNotesProps {
  children: ReactNode;
  className?: string;
  strings?: { title?: string };
}

function LabNotesContainer({ children, className = '', strings }: LabNotesProps) {
  return (
    <section className={`lab-notes ${className}`}>
      <h2 className="font-display text-display-md text-[var(--color-text-primary)] mb-4">
        {strings?.title ?? 'Notas de Laboratorio'}
      </h2>
      <div className="space-y-3">
        {children}
      </div>
    </section>
  );
}

/**
 * Compound component: LabNotes + LabNotes.Note
 */
export const LabNotes = Object.assign(LabNotesContainer, { Note: LabNote });
export default LabNotes;
