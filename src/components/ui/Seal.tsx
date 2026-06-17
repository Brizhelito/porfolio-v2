import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap, prefersReducedMotion } from '@lib/animations';

export type SealState = 'curiosity' | 'concentration' | 'satisfaction' | 'alert' | 'resting';
export type SealColor = 'gold' | 'blue' | 'green' | 'red' | 'graphite';
export type SealSize = 'sm' | 'md' | 'lg';

export interface SealProps {
  state?: SealState;
  color?: SealColor;
  size?: SealSize;
  interactive?: boolean;
}

const STATE_COLORS: Record<SealState, string> = {
  curiosity: '#C9A961',
  concentration: '#2D4A5C',
  satisfaction: '#5C7156',
  alert: '#B23A28',
  resting: '#4A4640',
};

const SIZE_MAP: Record<SealSize, number> = {
  sm: 48,
  md: 80,
  lg: 120,
};

export default function Seal({
  state: controlledState,
  size = 'md',
  interactive = true,
}: SealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const breatheRef = useRef<gsap.core.Tween | null>(null);
  const [internalState, setInternalState] = useState<SealState>('curiosity');
  const lastMouseMove = useRef(Date.now());

  const state = controlledState ?? internalState;
  const color = STATE_COLORS[state];
  const px = SIZE_MAP[size];

  // Breathing animation
  useEffect(() => {
    if (prefersReducedMotion || !svgRef.current) return;

    breatheRef.current = gsap.to(svgRef.current, {
      scale: 1.02,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    return () => {
      breatheRef.current?.kill();
    };
  }, []);

  // Cursor following (curiosity state)
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!interactive || !containerRef.current || state !== 'curiosity') return;
      if (prefersReducedMotion) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.min(Math.sqrt(dx * dx + dy * dy), 300);
      const intensity = distance / 300;

      const tiltX = Math.cos(angle) * intensity * 8;
      const tiltY = Math.sin(angle) * intensity * 8;

      gsap.to(svgRef.current, {
        rotateX: -tiltY,
        rotateY: tiltX,
        duration: 0.4,
        ease: 'power2.out',
      });

      lastMouseMove.current = Date.now();
    },
    [interactive, state],
  );

  // Auto-detect state based on user activity
  useEffect(() => {
    if (!interactive || controlledState) return;

    window.addEventListener('mousemove', handleMouseMove);

    const interval = setInterval(() => {
      const timeSinceMove = Date.now() - lastMouseMove.current;

      if (timeSinceMove > 10000) {
        setInternalState('resting');
      } else if (timeSinceMove > 3000) {
        setInternalState('concentration');
      } else {
        setInternalState('curiosity');
      }
    }, 2000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, [interactive, controlledState, handleMouseMove]);

  // State-based animations
  useEffect(() => {
    if (!svgRef.current || prefersReducedMotion) return;

    switch (state) {
      case 'alert':
        gsap.to(svgRef.current, {
          keyframes: [
            { x: -2, duration: 0.05 },
            { x: 2, duration: 0.05 },
            { x: -2, duration: 0.05 },
            { x: 2, duration: 0.05 },
            { x: 0, duration: 0.05 },
          ],
        });
        break;
      case 'satisfaction':
        gsap.to(svgRef.current, {
          y: -5,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out',
        });
        break;
    }
  }, [state]);

  return (
    <div
      ref={containerRef}
      className="seal-container inline-block"
      style={{ width: px, height: px, perspective: '200px' }}
    >
      <svg
        ref={svgRef}
        width={px}
        height={px}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="seal-svg transition-colors duration-500"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Outer octagon border */}
        <polygon
          points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30"
          fill="none"
          stroke={color}
          strokeWidth="2"
          className="transition-all duration-500"
        />
        {/* Inner circle */}
        <circle
          cx="50"
          cy="50"
          r="35"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          opacity="0.6"
          className="transition-all duration-500"
        />
        {/* RM Monogram */}
        <text
          x="50"
          y="58"
          textAnchor="middle"
          fontFamily="serif"
          fontSize="28"
          fontWeight="700"
          fill={color}
          className="transition-all duration-500"
        >
          RM
        </text>
        {/* ARCHIVIST text */}
        <text
          x="50"
          y="80"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="7"
          letterSpacing="2"
          fill={color}
          opacity="0.7"
          className="transition-all duration-500"
        >
          ARCHIVIST
        </text>
      </svg>
    </div>
  );
}
