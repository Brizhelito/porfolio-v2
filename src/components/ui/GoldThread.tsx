import { useEffect, useRef } from 'react';
import { animations, prefersReducedMotion } from '@lib/animations';

export interface GoldThreadProps {
  /** SVG path data (d attribute) */
  pathData: string;
  /** Width of the SVG viewport */
  width?: number;
  /** Height of the SVG viewport */
  height?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Whether to animate on scroll */
  animateOnScroll?: boolean;
  className?: string;
}

export default function GoldThread({
  pathData,
  width = 200,
  height = 100,
  strokeWidth = 2,
  animateOnScroll = true,
  className = '',
}: GoldThreadProps) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!pathRef.current || !animateOnScroll || prefersReducedMotion) return;

    animations.drawGoldThread(pathRef.current);
  }, [animateOnScroll]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      className={`gold-thread ${className}`}
      fill="none"
    >
      <defs>
        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C9A961" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#C9A961" />
        </linearGradient>
      </defs>
      <path
        ref={pathRef}
        d={pathData}
        stroke="url(#gold-gradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Predefined thread paths for common layouts
 */
export const THREAD_PATHS = {
  /** Simple horizontal line */
  horizontal: (width: number, y: number) => `M 0 ${y} L ${width} ${y}`,
  /** Curved connector */
  curve: (x1: number, y1: number, x2: number, y2: number) => {
    const midX = (x1 + x2) / 2;
    return `M ${x1} ${y1} Q ${midX} ${y1} ${midX} ${(y1 + y2) / 2} Q ${midX} ${y2} ${x2} ${y2}`;
  },
  /** Vertical line with slight wave */
  vertical: (x: number, height: number) => {
    const q1 = height * 0.25;
    const q2 = height * 0.75;
    return `M ${x} 0 Q ${x + 10} ${q1} ${x} ${height / 2} Q ${x - 10} ${q2} ${x} ${height}`;
  },
};
