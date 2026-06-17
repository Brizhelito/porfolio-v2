import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@lib/animations';

export interface StampProps {
  label: string;
  variant?: 'red' | 'blue' | 'green';
  shape?: 'circle' | 'rectangle';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  className?: string;
  'data-i18n'?: string;
}

const VARIANT_COLORS = {
  red: { border: '#B23A28', text: '#B23A28', bg: 'rgba(178, 58, 40, 0.05)' },
  blue: { border: '#2D4A5C', text: '#2D4A5C', bg: 'rgba(45, 74, 92, 0.05)' },
  green: { border: '#5C7156', text: '#5C7156', bg: 'rgba(92, 113, 86, 0.05)' },
};

const SIZE_MAP = { sm: 60, md: 90, lg: 130 };

export default function Stamp({
  label,
  variant = 'red',
  shape = 'circle',
  size = 'md',
  animate = true,
  className = '',
  'data-i18n': dataI18n,
}: StampProps) {
  const ref = useRef<HTMLDivElement>(null);
  const colors = VARIANT_COLORS[variant];
  const px = SIZE_MAP[size];

  useEffect(() => {
    if (!ref.current || !animate || prefersReducedMotion) return;

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
      data-i18n={dataI18n}
      style={{
        width: px,
        height: shape === 'rectangle' ? px * 0.5 : px,
        borderRadius,
        border: `2px solid ${colors.border}`,
        color: colors.text,
        backgroundColor: colors.bg,
        fontSize: size === 'sm' ? 8 : size === 'md' ? 10 : 14,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        textAlign: 'center',
        padding: '4px',
        lineHeight: 1.2,
        opacity: animate ? 0 : 1,
      }}
    >
      {label}
    </div>
  );
}
