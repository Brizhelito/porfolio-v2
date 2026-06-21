import { useEffect, useRef, useState, useCallback, type CSSProperties } from 'react';
import { gsap, prefersReducedMotion } from '@lib/animations';
import { sealStateForPath, type SealState } from '@lib/page-config';
import { t, type Locale } from '@lib/i18n';

// P1-12: STATE_META stays here (it's Seal-specific display metadata).
// The path→state mapping was extracted to @lib/page-config.ts so
// CustomCursor and Seal share a single source of truth.
const STATE_COLORS: Record<SealState, string> = {
  curiosity: '#C9A961',
  concentration: '#2D4A5C',
  satisfaction: '#5C7156',
  alert: '#B23A28',
  resting: '#4A4640',
};

const STATE_LABELS: Record<string, Record<SealState, string>> = {
  es: { curiosity: 'CURIOSO', concentration: 'CONCENTRADO', satisfaction: 'SATISFECHO', alert: 'ALERTA', resting: 'REPOSO' },
  en: { curiosity: 'CURIOUS', concentration: 'CONCENTRATED', satisfaction: 'SATISFIED', alert: 'ALERT', resting: 'RESTING' },
};

const SIZE_PX: Record<string, number> = { sm: 36, md: 60, lg: 96, xl: 180 };
const TILT_RADIUS = 200;
const TILT_MAX_DEG = 10;
const HERO_TILT_MAX_DEG = 20;
const HERO_TRANSLATE_PX = 8;

interface SealProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** 'floating' = fixed bottom-right corner; 'hero' = inline, larger, scroll-fades */
  variant?: 'floating' | 'hero';
  locale?: 'es' | 'en';
}

export default function Seal({ size = 'md', className = '', variant = 'floating', locale = 'es' }: SealProps) {
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
  const [visible, setVisible] = useState(variant === 'hero'); // hero starts visible, floating hidden on landing

  const isHero = variant === 'hero';
  const sealColor = STATE_COLORS[state];
  const sealLabel = STATE_LABELS[locale]?.[state] ?? STATE_LABELS.es[state];
  const px = SIZE_PX[size];
  const tiltMax = isHero ? HERO_TILT_MAX_DEG : TILT_MAX_DEG;

  const goToState = useCallback((next: SealState) => {
    setState((prev) => {
      if (next === prev) return prev;
      prevState.current = prev;
      lastActive.current = Date.now();
      return next;
    });
  }, []);

  // URL-based initial state — P1-12: delegate to @lib/page-config
  useEffect(() => {
    setMounted(true);
    goToState(sealStateForPath(window.location.pathname));
  }, [goToState]);

  // Floating seal: hide on landing until scroll past hero, show on other pages
  useEffect(() => {
    if (isHero || !mounted) return;
    const header = document.getElementById('archive-header');
    const isLanding = header?.dataset.landing === 'true';
    if (!isLanding) {
      setVisible(true);
      return;
    }
    const container = document.querySelector('.landing-scroll');
    const target = container || window;
    const getScrollY = () => (target === window ? window.scrollY : (container as HTMLElement).scrollTop);
    // On landing: show floating seal only after scrolling past 80px
    const onScroll = () => setVisible(getScrollY() > 80);
    onScroll(); // check initial scroll
    target.addEventListener('scroll', onScroll, { passive: true });
    return () => target.removeEventListener('scroll', onScroll);
  }, [isHero, mounted]);

  // Hero seal: fade out when scrolling past hero section
  useEffect(() => {
    if (!isHero || !mounted) return;
    const header = document.getElementById('archive-header');
    const isLanding = header?.dataset.landing === 'true';
    const container = isLanding ? document.querySelector('.landing-scroll') : null;
    const target = container || window;
    const getScrollY = () => (target === window ? window.scrollY : (container as HTMLElement).scrollTop);
    const onScroll = () => setVisible(getScrollY() < window.innerHeight * 0.6);
    onScroll();
    target.addEventListener('scroll', onScroll, { passive: true });
    return () => target.removeEventListener('scroll', onScroll);
  }, [isHero, mounted]);

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
          // P1-12: look up state via page-config instead of local PATH_STATE
          const meta = sealStateForPath(`/${id}`);
          goToState(meta);
        }
      },
      { threshold: 0.3 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [goToState]);

  // P1-03: replaced per-element MutationObserver + mouseenter/mouseleave
  // attachment with EVENT DELEGATION. Two listeners on document instead of
  // N listeners on N [data-seal-react] elements. No MutationObserver needed
  // — dynamically added elements are caught automatically by the closest()
  // check inside the delegated handler.
  // Skip on touch — mouseover/mouseout fire on tap but are janky and the
  // hoverBoost GSAP tween fights with touch scroll.
  useEffect(() => {
    if (!mounted) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest?.('[data-seal-react]')) setHoverBoost(true);
    };
    const onOut = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const related = e.relatedTarget as HTMLElement | null;
      // Only clear hoverBoost if we're actually leaving a seal-react element
      // (not just moving between its children).
      if (t.closest?.('[data-seal-react]') &&
          !(related?.closest?.('[data-seal-react]'))) {
        setHoverBoost(false);
      }
    };

    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    return () => {
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
    };
  }, [mounted]);

  // Hover boost: subtle bounce + gold flash when hovering data-seal-react elements
  useEffect(() => {
    if (!svgRef.current || prefersReducedMotion) return;
    if (hoverBoost) {
      gsap.to(svgRef.current, { scale: 1.12, duration: 0.25, ease: 'back.out(2)' });
    } else {
      gsap.to(svgRef.current, { scale: 1, duration: 0.3, ease: 'power2.out' });
    }
  }, [hoverBoost]);

  // Cursor proximity tilt + translation (RAF-throttled) — "watching" effect
  useEffect(() => {
    if (prefersReducedMotion || !svgRef.current) return;

    // P0-04: skip cursor tilt on touch devices (no mousemove anyway, but
    // this also prevents the elastic-return tween from fighting with touch
    // scroll on hybrid devices).
    if (typeof window !== 'undefined' &&
        window.matchMedia('(pointer: coarse)').matches) return;

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
        const radius = isHero ? TILT_RADIUS * 2.5 : TILT_RADIUS;

        if (dist < radius) {
          const factor = 1 - dist / radius;
          const smoothFactor = factor * factor; // quadratic easing for more natural feel
          const tiltX = (dy / radius) * tiltMax * smoothFactor;
          const tiltY = -(dx / radius) * tiltMax * smoothFactor;

          // Translation toward cursor (hero only) — makes it feel like it's leaning in
          const translateX = isHero ? (dx / radius) * HERO_TRANSLATE_PX * smoothFactor : 0;
          const translateY = isHero ? (dy / radius) * HERO_TRANSLATE_PX * smoothFactor : 0;

          gsap.to(svgRef.current, {
            rotateX: tiltX,
            rotateY: tiltY,
            x: translateX,
            y: translateY,
            duration: 0.2,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        } else {
          gsap.to(svgRef.current, {
            rotateX: 0,
            rotateY: 0,
            x: 0,
            y: 0,
            duration: 0.6,
            ease: 'elastic.out(1, 0.5)',
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
  }, [isHero, tiltMax, mounted]);

  // Idle → resting after 15s inactivity (floating only).
  // Listen to mouse, keyboard, touch, and scroll so the seal stays awake
  // for keyboard-only navigators and touch users too.
  useEffect(() => {
    if (isHero) return;
    const onActivity = () => { lastActive.current = Date.now(); };
    window.addEventListener('mousemove', onActivity);
    window.addEventListener('keydown', onActivity);
    window.addEventListener('touchstart', onActivity, { passive: true });
    window.addEventListener('scroll', onActivity, { passive: true });

    const interval = setInterval(() => {
      if (Date.now() - lastActive.current > 15_000) {
        goToState('resting');
      }
    }, 3000);

    return () => {
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('touchstart', onActivity);
      window.removeEventListener('scroll', onActivity);
      clearInterval(interval);
    };
  }, [goToState, isHero]);

  // Re-awaken on activity (mouse, keyboard, or touch)
  useEffect(() => {
    if (state !== 'resting') return;
    const onActivity = () => {
      if (Date.now() - lastActive.current < 1000) {
        goToState(sealStateForPath(window.location.pathname));
      }
    };
    window.addEventListener('mousemove', onActivity);
    window.addEventListener('keydown', onActivity);
    window.addEventListener('touchstart', onActivity, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('touchstart', onActivity);
    };
  }, [state, goToState]);

  // Breathe loop — skip on touch (decorative animation wastes battery
  // and the subtle scale is barely visible on small screens)
  useEffect(() => {
    if (prefersReducedMotion || !svgRef.current) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    breatheTween.current?.kill();
    breatheTween.current = gsap.to(svgRef.current, {
      scale: 1.04, duration: 2.5, repeat: -1, yoyo: true, ease: 'sine.inOut',
    });
    return () => { breatheTween.current?.kill(); };
  }, [mounted]);

  // Idle wander — random shift every 30s (floating only, desktop only)
  useEffect(() => {
    if (isHero || prefersReducedMotion || !containerRef.current) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

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
  }, [isHero]);

  // Click: floating → scroll to top; hero → bounce + cycle state
  const handleClick = useCallback(() => {
    if (isHero) {
      // Cycle through states on click
      const states: SealState[] = ['curiosity', 'concentration', 'satisfaction', 'alert'];
      const idx = states.indexOf(state);
      goToState(states[(idx + 1) % states.length]);
      if (!prefersReducedMotion && svgRef.current) {
        gsap.fromTo(svgRef.current,
          { scale: 0.8, rotate: -8 },
          { scale: 1, rotate: 0, duration: 0.4, ease: 'back.out(2.5)' },
        );
      }
    } else {
      const container = document.querySelector('.landing-scroll');
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      if (prefersReducedMotion || !svgRef.current) return;
      gsap.fromTo(svgRef.current,
        { scale: 0.8, rotate: 0 },
        { scale: 1, rotate: 0, duration: 0.3, ease: 'back.out(2)' },
      );
    }
  }, [isHero, state, goToState]);

  // The floating seal now renders on ALL devices. On touch it acts as a
  // static "back to top" button — no tilt, breathe, wander, or hover boost
  // (all guarded by pointer: coarse checks in their effects above). The
  // click handler already does scrollTo({ top: 0 }).
  if (!mounted) return null;

  // When hovering a react element, use gold color override
  const displayColor = hoverBoost ? '#C9A961' : sealColor;

  if (isHero) {
    return (
      <div
        ref={containerRef}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={t(locale, 'seal.ariaInteractive')}
        className={`cursor-pointer select-none transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${className}`}
        style={{ perspective: '600px' } as CSSProperties}
      >
        <svg
          ref={svgRef}
          width={px}
          height={px}
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_4px_20px_rgba(201,169,97,0.25)]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Outer octagon */}
          <polygon
            points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30"
            fill="none"
            stroke={displayColor}
            strokeWidth="2"
            className="transition-[stroke] duration-500"
          />
          {/* Inner circle */}
          <circle
            cx="50" cy="50" r="32"
            fill="none"
            stroke={displayColor}
            strokeWidth="1"
            opacity="0.45"
            className="transition-all duration-500"
          />
          {/* Decorative dots */}
          <circle cx="50" cy="15" r="2" fill={displayColor} opacity="0.4" className="transition-all duration-500" />
          <circle cx="50" cy="85" r="2" fill={displayColor} opacity="0.4" className="transition-all duration-500" />
          <circle cx="15" cy="50" r="2" fill={displayColor} opacity="0.4" className="transition-all duration-500" />
          <circle cx="85" cy="50" r="2" fill={displayColor} opacity="0.4" className="transition-all duration-500" />
          {/* RM text */}
          <text
            x="50" y="55"
            textAnchor="middle"
            fontFamily="'IBM Plex Serif', serif"
            fontSize="26"
            fontWeight="700"
            fill={displayColor}
            className="transition-[fill] duration-500"
          >
            RM
          </text>
          {/* State label */}
          <text
            x="50" y="76"
            textAnchor="middle"
            fontFamily="'JetBrains Mono', monospace"
            fontSize="7"
            letterSpacing="1.5"
            fill={displayColor}
            opacity="0.75"
            className="transition-all duration-500"
          >
            {sealLabel}
          </text>
        </svg>
      </div>
    );
  }

  // Floating variant
  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={t(locale, 'seal.ariaBackToTop')}
      className={`seal-floating-btn fixed bottom-6 right-6 z-[var(--z-modal)] cursor-pointer select-none transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${className}`}
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
        <polyline
          points="30,52 50,25 70,52"
          fill="none"
          stroke={displayColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-[stroke] duration-500"
        />
        <text
          x="50" y="78"
          textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="8"
          letterSpacing="2"
          fill={displayColor}
          opacity="0.7"
          className="transition-all duration-500"
        >
          {sealLabel}
        </text>
      </svg>
    </div>
  );
}
