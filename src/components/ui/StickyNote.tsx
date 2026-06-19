import type { ReactNode } from 'react';

export interface StickyNoteProps {
  children: ReactNode;
  rotation?: number;
  color?: 'yellow' | 'blue' | 'pink';
  className?: string;
}

const NOTE_COLORS = {
  yellow: { bg: '#FEF3C7', shadow: 'rgba(180, 160, 80, 0.15)' },
  blue: { bg: '#DBEAFE', shadow: 'rgba(80, 120, 180, 0.15)' },
  pink: { bg: '#FCE7F3', shadow: 'rgba(180, 100, 140, 0.15)' },
};

export default function StickyNote({
  children,
  rotation = -2,
  color = 'yellow',
  className = '',
}: StickyNoteProps) {
  const colors = NOTE_COLORS[color];

  return (
    <div
      className={`sticky-note relative p-4 ${className}`}
      style={{
        backgroundColor: colors.bg,
        transform: `rotate(${rotation}deg)`,
        boxShadow: `2px 3px 8px ${colors.shadow}`,
        fontFamily: 'var(--font-family-handwritten)',
        fontSize: '18px',
        lineHeight: 1.4,
        // P1-11: responsive maxWidth. On mobile (320-375px viewport) the
        // previous fixed `maxWidth: '280px'` left almost no margin; using
        // min() the note shrinks to fit narrow viewports while staying
        // capped at 280px on wide ones.
        maxWidth: 'min(280px, calc(100vw - 32px))',
      }}
    >
      {/* Tape effect */}
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2"
        style={{
          width: '40px',
          height: '12px',
          backgroundColor: 'rgba(200, 200, 180, 0.5)',
          borderRadius: '1px',
        }}
      />
      {children}
    </div>
  );
}
