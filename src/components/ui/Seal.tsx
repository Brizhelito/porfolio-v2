import { useEffect, useRef, useState, useCallback, type CSSProperties } from 'react';
import { gsap, prefersReducedMotion } from '@lib/animations';

export type SealState = 'curiosity' | 'concentration' | 'satisfaction' | 'alert' | 'resting';

const STATE_META: Record<SealState, { color: string; label: string }> = {
  curiosity: { color: '#C9A961', label: 'curioso' },
  concentration: { color: '#2D4A5C', label: 'concentrado' },
  satisfaction: { color: '#5C7156', label: 'satisfecho' },
  alert: { color: '#B23A28', label: 'alerta' },
  resting: { color: '#4A4640', label: 'reposo' },
};

const PATH_STATE: Record<string, SealState> = {
  '/': 'curiosity',
  '/about': 'concentration',
  '/tools': 'concentration',
  '/expedientes': 'satisfaction',
  '/colaboraciones': 'satisfaction',
  '/contacto': 'alert',
  '/inspiraciones': 'resting',
};

const SIZE_PX: Record<string, number> = { sm: 36, md: 60, lg: 96 };
const TILT_RADIUS = 150;
const TILT_MAX_DEG = 8;

function stateForPath(path: string): SealState {
  // Strip /en prefix for English routes
  const normalized = path.startsWith('/en') ? path.replace('/en', '') || '/' : path;
  const key = Object.keys(PATH_STATE).find((p) => normalized === p || normalized.startsWith(p + '/'));
  return key ? PATH_STATE[key] : 'curiosity';
}

interface SealProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Seal({ size = 'md', className = '' }: SealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const breatheTween = useRef<gsap.core.Tween | null>(null);
  const wanderTween = useRef<gsap.core.Tween | null>(null);
  const lastActive = useRef(Date.now());
  const isStampAnimating = useRef(false);
  const prevState = useRef<SealState>('curiosity');
  const rafId = useRef(0);
  const [state, setState] = useState<SealState>('curiosity');
  const [mounted, setMounted] = useState(false);
  const [hoverBoost, setHoverBoost] = useState(false);

  const meta = STATE_META[state];
  const px = SIZE_PX[size];

  const goToState = useCallback((next: SealState) => {
    setState((prev) => {
      if (next === prev) return prev;
      prevState.current = prev;
      lastActive.current = Date.now();
      return next;
    });
  }, []);

  // URL-based initial state
  useEffect(() => {
    setMounted(true);
    goToState(stateForPath(window.location.pathname));
  }, [goToState]);

  // Stamp animation on state change (debounced)
  useEffect(() => {
    if (!mounted || prefersReducedMotion || !svgRef.current || isStampAnimating.current) return;
    isStampAnimating.current = true;
    gsap.fromTo(svgRef.current,
      { scale: 1.3, rotate: -4, opacity: 0.6 },
      {
        scale: 1, rotate: 0, opacity: 1, duration: 0.45, ease: 'back.out(1.7)',
        onComplete: () => { isStampAnimating.current = false; },
      },
    );
  }, [state, mounted]);

  // IntersectionObserver override for [data-section] elements
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-section]');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) {
          const id = visible[0].target.getAttribute('data-section') || '';
          goToState(PATH_STATE[id] || 'curiosity');
        }
      },
      { threshold: 0.3 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [goToState]);

  // Element hover reactions — [data-seal-react] elements
  useEffect(() => {
    const onHoverIn = () => setHoverBoost(true);
    const onHoverOut = () => setHoverBoost(false);

    const attach = (el: Element) => {
      el.addEventListener('mouseenter', onHoverIn);
      el.addEventListener('mouseleave', onHoverOut);
    };
    const detach = (el: Element) => {
      el.removeEventListener('mouseenter', onHoverIn);
      el.removeEventListener('mouseleave', onHoverOut);
    };

    const elements = document.querySelectorAll('[data-seal-react]');
    elements.forEach(attach);

    // Observe DOM for dynamically added elements
    const mutObs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((n) => {
          if (n instanceof HTMLElement) {
            if (n.hasAttribute?.('data-seal-react')) attach(n);
            n.querySelectorAll?.('[data-seal-react]').forEach(attach);
          }
        });
        m.removedNodes.forEach((n) => {
          if (n instanceof HTMLElement) {
            if (n.hasAttribute?.('data-seal-react')) detach(n);
            n.querySelectorAll?.('[data-seal-react]').forEach(detach);
          }
        });
      }
    });
    mutObs.observe(document.body, { childList: true, subtree: true });

    return () => {
      elements.forEach(detach);
      mutObs.disconnect();
    };
  }, []);

  // Hover boost: subtle bounce + gold flash when hovering data-seal-react elements
  useEffect(() => {
    if (!svgRef.current || prefersReducedMotion) return;
    if (hoverBoost) {
      gsap.to(svgRef.current, { scale: 1.12, duration: 0.25, ease: 'back.out(2)' });
    } else {
      gsap.to(svgRef.current, { scale: 1, duration: 0.3, ease: 'power2.out' });
    }
  }, [hoverBoost]);

  // Cursor proximity tilt (RAF-throttled)
  useEffect(() => {
    if (prefersReducedMotion || !svgRef.current) return;

    let ticking = false;
    const onMouseMove = (e: MouseEvent) => {
      if (ticking) return;
      ticking = true;
      rafId.current = requestAnimationFrame(() => {
        ticking = false;
        if (!containerRef.current || !svgRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < TILT_RADIUS) {
          const factor = 1 - dist / TILT_RADIUS;
          const tiltX = (dy / TILT_RADIUS) * TILT_MAX_DEG * factor;
          const tiltY = -(dx / TILT_RADIUS) * TILT_MAX_DEG * factor;
          gsap.to(svgRef.current, {
            rotateX: tiltX,
            rotateY: tiltY,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        } else {
          gsap.to(svgRef.current, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.5,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  // Idle → resting after 15s inactivity
  useEffect(() => {
    const onActivity = () => { lastActive.current = Date.now(); };
    window.addEventListener('mousemove', onActivity);
    window.addEventListener('scroll', onActivity, { passive: true });

    const interval = setInterval(() => {
      if (Date.now() - lastActive.current > 15_000) {
        goToState('resting');
      }
    }, 3000);

    return () => {
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('scroll', onActivity);
      clearInterval(interval);
    };
  }, [goToState]);

  // Re-awaken on activity
  useEffect(() => {
    if (state !== 'resting') return;
    const onMove = () => {
      if (Date.now() - lastActive.current < 1000) {
        goToState(stateForPath(window.location.pathname));
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [state, goToState]);

  // Breathe loop
  useEffect(() => {
    if (prefersReducedMotion || !svgRef.current) return;
    breatheTween.current?.kill();
    breatheTween.current = gsap.to(svgRef.current, {
      scale: 1.04, duration: 2.5, repeat: -1, yoyo: true, ease: 'sine.inOut',
    });
    return () => { breatheTween.current?.kill(); };
  }, []);

  // Idle wander — random shift every 30s
  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return;

    const wander = () => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 12 + Math.random() * 18;
      wanderTween.current?.kill();
      wanderTween.current = gsap.to(containerRef.current, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        duration: 1.2,
        ease: 'power2.inOut',
        onComplete: () => {
          wanderTween.current = gsap.to(containerRef.current, {
            x: 0, y: 0, duration: 1.8, ease: 'power1.inOut',
          });
        },
      });
    };

    const interval = setInterval(wander, 30_000);
    return () => { clearInterval(interval); wanderTween.current?.kill(); };
  }, []);

  // Click → scroll to top
  const handleClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (prefersReducedMotion || !svgRef.current) return;
    gsap.fromTo(svgRef.current,
      { scale: 0.8, rotate: 0 },
      { scale: 1, rotate: 0, duration: 0.3, ease: 'back.out(2)' },
    );
  }, []);

  const isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  if (!mounted || isMobile) return null;

  // When hovering a react element, use gold color override
  const displayColor = hoverBoost ? '#C9A961' : meta.color;

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Volver arriba"
      className={`fixed bottom-6 right-6 z-[var(--z-modal)] cursor-pointer select-none ${className}`}
      style={{ perspective: '400px' } as CSSProperties}
    >
      <svg
        ref={svgRef}
        width={px}
        height={px}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <polygon
          points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30"
          fill="none"
          stroke={displayColor}
          strokeWidth="2.5"
          className="transition-[stroke] duration-500"
        />
        <circle
          cx="50" cy="50" r="32"
          fill="none"
          stroke={displayColor}
          strokeWidth="1.2"
          opacity="0.45"
          className="transition-all duration-500"
        />
        <text
          x="50" y="55"
          textAnchor="middle"
          fontFamily="'IBM Plex Serif', serif"
          fontSize="28"
          fontWeight="700"
          fill={displayColor}
          className="transition-[fill] duration-500"
        >
          RM
        </text>
        <text
          x="50" y="78"
          textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="6.5"
          letterSpacing="2"
          fill={displayColor}
          opacity="0.6"
          className="transition-all duration-500"
        >
          {meta.label.toUpperCase()}
        </text>
      </svg>
    </div>
  );
}
