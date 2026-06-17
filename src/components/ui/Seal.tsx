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

const SECTION_STATE_MAP: Record<string, SealState> = {
  hero: 'curiosity',
  about: 'concentration',
  tools: 'concentration',
  expedientes: 'satisfaction',
  expediente: 'satisfaction',
  contacto: 'alert',
  colaboraciones: 'resting',
  inspiraciones: 'resting',
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
  const wanderRef = useRef<gsap.core.Tween | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [internalState, setInternalState] = useState<SealState>('curiosity');
  const [currentSection, setCurrentSection] = useState<string>('hero');
  const lastMouseMove = useRef(Date.now());
  const lastStateChange = useRef<SealState>('curiosity');

  const state = controlledState ?? internalState;
  const color = STATE_COLORS[state];
  const px = SIZE_MAP[size];

  // Stamp animation on state change
  useEffect(() => {
    if (state === lastStateChange.current || prefersReducedMotion) return;
    if (!svgRef.current) return;

    const stampEl = svgRef.current.querySelector('.seal-stamp');
    if (stampEl) {
      gsap.fromTo(stampEl,
        { scale: 0.5, opacity: 0, rotation: -15 },
        {
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: 0.4,
          ease: 'back.out(1.7)',
          onComplete: () => {
            gsap.to(stampEl, {
              opacity: 0,
              scale: 1.5,
              duration: 0.3,
              delay: 0.5,
              ease: 'power2.in',
            });
          }
        }
      );
    }
    lastStateChange.current = state;
  }, [state]);

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

  // Idle wander - moves around viewport every 30s
  useEffect(() => {
    if (!interactive || controlledState || prefersReducedMotion) return;

    const startWander = () => {
      if (!containerRef.current) return;
      wanderRef.current = gsap.to(containerRef.current, {
        x: gsap.utils.random(-15, 15),
        y: gsap.utils.random(-15, 15),
        rotation: gsap.utils.random(-5, 5),
        duration: gsap.utils.random(8, 12),
        ease: 'sine.inOut',
        onComplete: startWander,
      });
    };

    const idleTimer = setTimeout(startWander, 30000);

    return () => {
      clearTimeout(idleTimer);
      wanderRef.current?.kill();
    };
  }, [interactive, controlledState]);

  // Section detection via IntersectionObserver
  useEffect(() => {
    if (!interactive || controlledState) return;

    const sections = document.querySelectorAll('section[id], main > section[id]');
    if (sections.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            const sectionId = entry.target.getAttribute('id');
            if (sectionId) {
              setCurrentSection(sectionId);
              const mappedState = SECTION_STATE_MAP[sectionId];
              if (mappedState && mappedState !== internalState) {
                setInternalState(mappedState);
              }
            }
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: [0.3, 0.5, 0.7],
      }
    );

    sections.forEach((section) => observerRef.current?.observe(section));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [interactive, controlledState, internalState]);

  // Auto-detect state based on user activity (fallback)
  useEffect(() => {
    if (!interactive || controlledState) return;

    window.addEventListener('mousemove', handleMouseMove);

    const interval = setInterval(() => {
      const timeSinceMove = Date.now() - lastMouseMove.current;

      if (timeSinceMove > 10000) {
        setInternalState('resting');
      } else if (timeSinceMove > 3000) {
        setInternalState('concentration');
      } else if (state !== 'curiosity' && state !== 'resting') {
        setInternalState('curiosity');
      }
    }, 2000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, [interactive, controlledState, handleMouseMove, state]);

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
      case 'concentration':
        gsap.to(svgRef.current, {
          scale: 1.05,
          duration: 0.4,
          yoyo: true,
          repeat: 1,
          ease: 'power2.inOut',
        });
        break;
    }
  }, [state]);

  const handleClick = () => {
    if (!interactive) return;
    gsap.to(window, { scrollTo: 0, duration: 0.8, ease: 'power2.inOut' });
  };

  return (
    <div
      ref={containerRef}
      className="seal-container fixed bottom-6 right-6 z-[var(--z-cursor)] transition-transform duration-300"
      style={{ width: px, height: px, perspective: '200px', cursor: interactive ? 'pointer' : 'default' }}
      onClick={handleClick}
      aria-label="Volver arriba"
      role="button"
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
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
        {/* Stamp element for state change animation */}
        <g className="seal-stamp" style={{ transformOrigin: '50% 50%' }}>
          <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="2" strokeDasharray="4 4" opacity="0" />
          <text
            x="50"
            y="58"
            textAnchor="middle"
            fontFamily="'Special Elite', cursive"
            fontSize="10"
            fill={color}
            opacity="0"
          >
            {state.toUpperCase()}
          </text>
        </g>
      </svg>
    </div>
  );
}