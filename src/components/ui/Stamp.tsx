import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@lib/animations';

export interface StampProps {
  label: string;
  variant?: 'red' | 'blue' | 'green';
  shape?: 'circle' | 'rectangle';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  className?: string;
}

const VARIANT_COLORS = {
  red: { border: '#B23A28', text: '#B23A28', bg: 'rgba(178, 58, 40, 0.08)' },
  blue: { border: '#2D4A5C', text: '#2D4A5C', bg: 'rgba(45, 74, 92, 0.08)' },
  green: { border: '#5C7156', text: '#5C7156', bg: 'rgba(92, 113, 86, 0.08)' },
};

const SIZE_MAP = { sm: 72, md: 110, lg: 156 };

const FONT_SIZES = { sm: 11, md: 14, lg: 18 };

// Shrink font when label is long relative to circle diameter
function effectiveFontSize(shape: string, size: keyof typeof FONT_SIZES, labelLen: number): number {
  const base = FONT_SIZES[size];
  if (shape !== 'circle') return base;
  const maxCharsPerLine = { sm: 5, md: 8, lg: 10 }[size];
  if (labelLen <= maxCharsPerLine) return base;
  // Scale down proportionally, floor at 60% of base
  const ratio = maxCharsPerLine / Math.min(labelLen, maxCharsPerLine * 2.5);
  return Math.max(Math.round(base * Math.max(ratio, 0.6)), 7);
}

export default function Stamp({
  label,
  variant = 'red',
  shape = 'circle',
  size = 'md',
  animate = true,
  className = '',
}: StampProps) {
  const ref = useRef<HTMLDivElement>(null);
  const colors = VARIANT_COLORS[variant];
  const px = SIZE_MAP[size];
  const fontSize = effectiveFontSize(shape, size, label.length);

  useEffect(() => {
    // P2-08: if reducedMotion is requested, skip the GSAP tween entirely
    // AND ensure the element is visible (opacity 1). Previously, the inline
    // `opacity: animate ? 0 : 1` left the stamp invisible when reducedMotion
    // was true because the tween never ran to bring it to opacity 1.
    if (!ref.current || !animate) return;
    if (prefersReducedMotion) {
      gsap.set(ref.current, { opacity: 1, scale: 1, rotate: 0 });
      return;
    }

    gsap.fromTo(
      ref.current,
      { scale: 1.5, rotate: -5, opacity: 0 },
      {
        duration: 0.5,
        scale: 1,
        rotate: 0,
        opacity: 1,
        ease: 'back.out(1.7)',
      },
    );
  }, [animate]);

  const borderRadius = shape === 'circle' ? '50%' : '4px';

  return (
    <div
      ref={ref}
      className={`stamp inline-flex items-center justify-center font-stamp ${className}`}
      style={{
        width: px,
        height: shape === 'rectangle' ? px * 0.45 : px,
        flexShrink: 0,
        borderRadius,
        border: `3px solid ${colors.border}`,
        boxShadow: `inset 0 0 0 1px ${colors.border}40, 0 1px 3px rgba(0,0,0,0.08)`,
        color: colors.text,
        backgroundColor: colors.bg,
        fontSize,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        textAlign: 'center',
        padding: size === 'sm' ? '6px' : '8px',
        lineHeight: 1.15,
        fontWeight: 700,
        overflow: 'hidden',
        // P2-08: only start invisible when we actually plan to animate in.
        opacity: (animate && !prefersReducedMotion) ? 0 : 1,
      }}
    >
      <span style={{
        maxWidth: shape === 'circle' ? '70%' : '100%',
        overflowWrap: 'break-word',
        display: 'block',
      }}>
        {label}
      </span>
    </div>
  );
}
