import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap, prefersReducedMotion } from '@lib/animations';

export type SealState = 'curiosity' | 'concentration' | 'satisfaction' | 'alert' | 'resting';
export type SealColor = 'gold' | 'blue' | 'green' | 'red' | 'graphite';

const STATE_COLORS: Record<SealState, string> = {
  curiosity: '#C9A961',
  concentration: '#2D4A5C',
  satisfaction: '#5C7156',
  alert: '#B23A28',
  resting: '#4A4640',
};

const STATE_LABELS: Record<SealState, string> = {
  curiosity: 'CURIOSIDAD',
  concentration: 'CONCENTRACIÓN',
  satisfaction: 'SATISFACCIÓN',
  alert: 'ALERTA',
  resting: 'DESCANSO',
};

const SIZE = 56;
const VIEWBOX = 100;

export default function Seal() {
  const containerRef = useRef<HTMLButtonElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const labelRef = useRef<SVGGElement>(null);
  const [state, setState] = useState<SealState>('curiosity');
  const [isExpanded, setIsExpanded] = useState(false);
  const wanderTimerRef = useRef<number | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const lastInteraction = useRef(Date.now());

  const color = STATE_COLORS[state];

  // --- Section detection via IntersectionObserver ---
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-seal-state]');
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const newState = (entry.target as HTMLElement).dataset.sealState as SealState;
            if (newState && newState !== state) {
              setState(newState);
            }
          }
        }
      },
      { threshold: 0.3 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [state]);

  // --- Stamp animation on state change ---
  useEffect(() => {
    if (prefersReducedMotion || !svgRef.current) return;

    // Mini stamp: scale up + rotate, then settle
    gsap.fromTo(
      svgRef.current,
      { scale: 1.3, rotate: -8, opacity: 0.6 },
      {
        scale: 1,
        rotate: 0,
        opacity: 1,
        duration: 0.4,
        ease: 'back.out(1.7)',
      },
    );

    // Label fade
    if (labelRef.current) {
      gsap.fromTo(
        labelRef.current,
        { opacity: 0, y: 5 },
        { opacity: 1, y: 0, duration: 0.3, delay: 0.2, ease: 'power2.out' },
      );
    }
  }, [state]);

  // --- Breathing animation ---
  useEffect(() => {
    if (prefersReducedMotion || !svgRef.current) return;

    const tween = gsap.to(svgRef.current, {
      scale: 1.03,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    return () => { tween.kill(); };
  }, []);

  // --- Idle wander: move seal position every 30s ---
  const startWander = useCallback(() => {
    if (wanderTimerRef.current) clearInterval(wanderTimerRef.current);
    wanderTimerRef.current = window.setInterval(() => {
      if (!containerRef.current || prefersReducedMotion) return;
      const now = Date.now();
      if (now - lastInteraction.current < 25000) return; // don't wander if recently active

      // Random offset within viewport margins
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const margin = 32;
      const maxX = vw - SIZE - margin;
      const maxY = vh - SIZE - margin;
      const newX = margin + Math.random() * (maxX - margin);
      const newY = margin + Math.random() * (maxY - margin);

      gsap.to(containerRef.current, {
        left: newX,
        top: newY,
        duration: 1.5,
        ease: 'power2.inOut',
        onComplete: () => {
          setState('resting');
        },
      });
    }, 30000);
  }, []);

  useEffect(() => {
    startWander();
    return () => {
      if (wanderTimerRef.current) clearInterval(wanderTimerRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [startWander]);

  // --- User activity tracking ---
  useEffect(() => {
    const track = () => {
      lastInteraction.current = Date.now();
      // Reset to curiosity if user is active
      if (state === 'resting' || state === 'concentration') {
        setState('curiosity');
      }
      // Bring seal back to fixed position on interaction
      if (containerRef.current && isExpanded === false) {
        gsap.to(containerRef.current, {
          left: window.innerWidth - SIZE - 24,
          top: window.innerHeight - SIZE - 24,
          duration: 0.8,
          ease: 'power2.out',
        });
      }
    };

    window.addEventListener('mousemove', track);
    window.addEventListener('scroll', track);
    window.addEventListener('touchstart', track);
    return () => {
      window.removeEventListener('mousemove', track);
      window.removeEventListener('scroll', track);
      window.removeEventListener('touchstart', track);
    };
  }, [state, isExpanded]);

  // --- Click: scroll to top ---
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (svgRef.current && !prefersReducedMotion) {
      gsap.fromTo(
        svgRef.current,
        { rotate: -15, scale: 1.2 },
        { rotate: 0, scale: 1, duration: 0.5, ease: 'back.out(1.7)' },
      );
    }
  };

  // --- Hover expand ---
  const handleMouseEnter = () => {
    setIsExpanded(true);
    if (containerRef.current && !prefersReducedMotion) {
      gsap.to(containerRef.current, { scale: 1.15, duration: 0.3, ease: 'power2.out' });
    }
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
    if (containerRef.current && !prefersReducedMotion) {
      gsap.to(containerRef.current, { scale: 1, duration: 0.3, ease: 'power2.out' });
    }
  };

  return (
    <button
      ref={containerRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="fixed bottom-6 right-6 z-[var(--z-cursor)] flex items-center justify-center group outline-none"
      style={{
        width: SIZE,
        height: SIZE,
        perspective: '200px',
        willChange: 'left, top',
      }}
      aria-label={`Sello RM — ${STATE_LABELS[state]}. Click para volver arriba.`}
      title="Volver arriba"
    >
      <svg
        ref={svgRef}
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Outer octagon */}
        <polygon
          points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30"
          fill="var(--color-bg-primary)"
          stroke={color}
          strokeWidth="2.5"
          className="transition-colors duration-500"
        />
        {/* Inner circle */}
        <circle
          cx="50"
          cy="50"
          r="32"
          fill="none"
          stroke={color}
          strokeWidth="1.2"
          opacity="0.5"
          className="transition-colors duration-500"
        />
        {/* RM monogram */}
        <text
          x="50"
          y="58"
          textAnchor="middle"
          fontFamily="'IBM Plex Serif', serif"
          fontSize="26"
          fontWeight="700"
          fill={color}
          className="transition-colors duration-500"
        >
          RM
        </text>
        {/* State label below seal */}
        <g ref={labelRef} opacity="0.8">
          <text
            x="50"
            y="82"
            textAnchor="middle"
            fontFamily="'Special Elite', cursive"
            fontSize="7"
            letterSpacing="1.5"
            fill={color}
            className="transition-colors duration-500"
          >
            {STATE_LABELS[state]}
          </text>
        </g>
      </svg>

      {/* Expanded label tooltip */}
      {isExpanded && (
        <span
          className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-stamp text-[9px] tracking-wider px-2 py-0.5 rounded-sm"
          style={{
            color: 'var(--color-accent-gold)',
            background: 'var(--color-bg-primary)',
            border: `1px solid ${color}40`,
          }}
        >
          VOLVER ARRIBA
        </span>
      )}
    </button>
  );
}
