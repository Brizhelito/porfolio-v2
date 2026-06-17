import { useEffect, useRef, useState, useCallback } from 'react';

interface CursorPosition {
  x: number;
  y: number;
}

interface TrailParticle {
  element: HTMLDivElement;
  x: number;
  y: number;
  createdAt: number;
}

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const miniSealRef = useRef<HTMLDivElement>(null);
  const trailContainerRef = useRef<HTMLDivElement>(null);

  const mousePos = useRef<CursorPosition>({ x: 0, y: 0 });
  const targetPos = useRef<CursorPosition>({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [context, setContext] = useState<'normal' | 'link' | 'expediente' | 'reading'>('normal');

  const animationFrameRef = useRef<number>();
  const trailParticles = useRef<TrailParticle[]>([]);
  const lastTrailTime = useRef(0);
  const scrollSpeedRef = useRef(0);
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());

  const EASING = 0.15;
  const TRAIL_INTERVAL = 120;
  const TRAIL_MAX_PARTICLES = 15;
  const READING_SCROLL_THRESHOLD = 50;

  const createTrailParticle = useCallback((x: number, y: number) => {
    if (!trailContainerRef.current) return;

    const particle = document.createElement('div');
    particle.className = 'cursor-trail';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    trailContainerRef.current.appendChild(particle);

    trailParticles.current.push({
      element: particle,
      x,
      y,
      createdAt: Date.now(),
    });

    requestAnimationFrame(() => {
      particle.classList.add('fade');
    });

    if (trailParticles.current.length > TRAIL_MAX_PARTICLES) {
      const old = trailParticles.current.shift();
      if (old) old.element.remove();
    }
  }, []);

  const cleanupTrails = useCallback(() => {
    trailParticles.current.forEach((p) => p.element.remove());
    trailParticles.current = [];
  }, []);

  const updateCursorPosition = useCallback(() => {
    if (!dotRef.current || !ringRef.current) return;

    mousePos.current.x += (targetPos.current.x - mousePos.current.x) * EASING;
    mousePos.current.y += (targetPos.current.y - mousePos.current.y) * EASING;

    const x = mousePos.current.x;
    const y = mousePos.current.y;

    dotRef.current.style.transform = `translate(${x - 4}px, ${y - 4}px)`;
    ringRef.current.style.transform = `translate(${x - 20}px, ${y - 20}px)`;
    if (miniSealRef.current) {
      miniSealRef.current.style.transform = `translate(${x - 16}px, ${y - 16}px)`;
    }

    animationFrameRef.current = requestAnimationFrame(updateCursorPosition);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    targetPos.current = { x: e.clientX, y: e.clientY };

    if (!isVisible) setIsVisible(true);

    const now = Date.now();
    if (now - lastTrailTime.current > TRAIL_INTERVAL) {
      createTrailParticle(e.clientX, e.clientY);
      lastTrailTime.current = now;
    }
  }, [createTrailParticle]);

  const handleMouseLeave = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleScroll = useCallback(() => {
    const now = Date.now();
    const scrollY = window.scrollY;
    const deltaTime = now - lastScrollTime.current;
    const deltaY = Math.abs(scrollY - lastScrollY.current);

    if (deltaTime > 0) {
      scrollSpeedRef.current = deltaY / deltaTime;
    }

    lastScrollY.current = scrollY;
    lastScrollTime.current = now;

    const isReading = scrollSpeedRef.current < READING_SCROLL_THRESHOLD && deltaY > 0;
    if (isReading && context !== 'reading') {
      setContext('reading');
    } else if (!isReading && context === 'reading') {
      setContext('normal');
    }
  }, [context]);

  const handleMouseOver = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    const isLink = target.matches('a, button, [role="button"], .clickable, input[type="button"], input[type="submit"]');
    const isExpediente = target.closest('[data-expediente-card], .expediente-card, article[data-expediente]');

    if (isExpediente) {
      setContext('expediente');
    } else if (isLink) {
      setContext('link');
    } else if (context !== 'reading') {
      setContext('normal');
    }
  }, [context]);

  const handleMouseOut = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    const isLink = target.matches('a, button, [role="button"], .clickable, input[type="button"], input[type="submit"]');
    const isExpediente = target.closest('[data-expediente-card], .expediente-card, article[data-expediente]');

    if (isLink || isExpediente) {
      if (context !== 'reading') {
        setContext('normal');
      }
    }
  }, [context]);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    setIsTouchDevice(isTouch);
    if (isTouch) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    animationFrameRef.current = requestAnimationFrame(updateCursorPosition);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(animationFrameRef.current);
      cleanupTrails();
    };
  }, [
    handleMouseMove,
    handleMouseLeave,
    handleScroll,
    handleMouseOver,
    handleMouseOut,
    updateCursorPosition,
    cleanupTrails,
  ]);

  useEffect(() => {
    if (!dotRef.current || !ringRef.current || !miniSealRef.current) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const miniSeal = miniSealRef.current;

    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    miniSeal.className = 'cursor-mini-seal';
    ring.querySelector('.cursor-ring-label')?.classList.remove('visible');

    switch (context) {
      case 'link':
        dot.classList.add('link-hover');
        ring.classList.add('link-hover', 'has-label');
        break;
      case 'expediente':
        miniSeal.classList.add('expediente-hover', 'visible');
        ring.style.opacity = '0';
        dot.style.opacity = '0.5';
        break;
      case 'reading':
        dot.classList.add('reading');
        ring.classList.add('reading');
        break;
      default:
        ring.style.opacity = '0.6';
        dot.style.opacity = '1';
    }
  }, [context]);

  if (isTouchDevice) return null;

  return (
    <>
      <div className="custom-cursor" aria-hidden="true">
        <div ref={trailContainerRef} className="fixed inset-0 pointer-events-none" />

        <div
          ref={ringRef}
          className="cursor-ring"
          style={{ willChange: 'transform, width, height, opacity' }}
        >
          <span className="cursor-ring-label">ABRIR</span>
        </div>

        <div
          ref={miniSealRef}
          className="cursor-mini-seal"
          style={{ willChange: 'transform, opacity' }}
        >
          <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon
              points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30"
              fill="none"
              stroke="var(--color-accent-gold, #C9A961)"
              strokeWidth="2"
            />
            <circle cx="50" cy="50" r="35" fill="none" stroke="var(--color-accent-gold, #C9A961)" strokeWidth="1" opacity="0.6" />
            <text x="50" y="58" textAnchor="middle" fontFamily="serif" fontSize="14" fontWeight="700" fill="var(--color-accent-gold, #C9A961)">
              RM
            </text>
          </svg>
        </div>

        <div
          ref={dotRef}
          className="cursor-dot"
          style={{ willChange: 'transform, width, height' }}
        />
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media (pointer: fine) and (min-width: 768px) {
          body { cursor: none !important; }
          a, button, [role="button"], input, textarea, select, .clickable { cursor: none !important; }
        }
      `}} />
    </>
  );
}