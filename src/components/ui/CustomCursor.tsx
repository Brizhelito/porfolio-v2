import { useEffect, useRef, useCallback, useState } from 'react';
import { gsap, prefersReducedMotion } from '@lib/animations';

type CursorContext = 'normal' | 'link' | 'expediente' | 'reading';

const TRAIL_INTERVAL = 120;
const TRAIL_LIFETIME = 300;
const EASE_SPEED = 0.15;
const RING_EASE_SPEED = 0.08;

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const dotPos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const rafId = useRef<number>(0);
  const lastTrail = useRef(0);
  const [mounted, setMounted] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [context, setContext] = useState<CursorContext>('normal');
  const contextLabel = useRef('');
  const lastScrollY = useRef(0);

  // --- Mount + detect pointer type ---
  useEffect(() => {
    setMounted(true);
    const fine = window.matchMedia('(pointer: fine)').matches;
    const wide = window.innerWidth >= 768;
    setIsFinePointer(fine && wide);
  }, []);

  // --- Context detection ---
  const detectContext = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target || target === document.body) {
      setContext('normal');
      return;
    }

    const interactive = target.closest('a, button, [role="button"], input, textarea, select, label');
    if (interactive) {
      setContext('link');
      contextLabel.current = interactive.getAttribute('data-cursor-label')
        || (interactive as HTMLElement).innerText?.slice(0, 12)?.toUpperCase()
        || 'ABRIR';
      return;
    }

    const expediente = target.closest('[data-cursor="expediente"]');
    if (expediente) {
      setContext('expediente');
      return;
    }

    setContext('normal');
  }, []);

  // --- Scroll speed for reading context ---
  useEffect(() => {
    if (!isFinePointer) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const speed = Math.abs(y - lastScrollY.current);
        lastScrollY.current = y;
        if (speed > 3 && context !== 'link' && context !== 'expediente') {
          setContext('reading');
        } else if (context === 'reading') {
          setContext('normal');
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [context, isFinePointer]);

  // --- Main animation loop ---
  useEffect(() => {
    if (!isFinePointer || prefersReducedMotion) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let hidden = true;

    const onMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (hidden) {
        hidden = false;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
        // Snap to initial position to avoid jump
        dotPos.current = { x: e.clientX, y: e.clientY };
        ringPos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onLeave = () => {
      hidden = true;
      dot.style.opacity = '0';
      ring.style.opacity = '0';
      if (labelRef.current) labelRef.current.style.opacity = '0';
      if (sealRef.current) sealRef.current.style.opacity = '0';
    };

    const animate = () => {
      if (!hidden) {
        dotPos.current.x += (mousePos.current.x - dotPos.current.x) * EASE_SPEED;
        dotPos.current.y += (mousePos.current.y - dotPos.current.y) * EASE_SPEED;
        dot.style.transform = `translate(${dotPos.current.x - 4}px, ${dotPos.current.y - 4}px)`;

        ringPos.current.x += (mousePos.current.x - ringPos.current.x) * RING_EASE_SPEED;
        ringPos.current.y += (mousePos.current.y - ringPos.current.y) * RING_EASE_SPEED;
        ring.style.transform = `translate(${ringPos.current.x - 16}px, ${ringPos.current.y - 16}px)`;
      }

      if (labelRef.current) {
        labelRef.current.style.transform = `translate(${mousePos.current.x + 20}px, ${mousePos.current.y - 8}px)`;
      }
      if (sealRef.current) {
        sealRef.current.style.transform = `translate(${mousePos.current.x + 16}px, ${mousePos.current.y - 20}px)`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    const createTrail = () => {
      if (hidden) return;
      const now = Date.now();
      if (now - lastTrail.current < TRAIL_INTERVAL) return;
      lastTrail.current = now;

      const particle = document.createElement('div');
      particle.className = 'cursor-trail';
      particle.style.left = `${mousePos.current.x - 1.5}px`;
      particle.style.top = `${mousePos.current.y - 1.5}px`;
      particle.style.opacity = '0.35';
      particle.style.transform = 'scale(1)';
      document.body.appendChild(particle);

      gsap.to(particle, {
        opacity: 0,
        scale: 0.2,
        duration: TRAIL_LIFETIME / 1000,
        ease: 'power2.out',
        onComplete: () => particle.remove(),
      });
    };

    const trailInterval = setInterval(createTrail, TRAIL_INTERVAL);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    rafId.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(rafId.current);
      clearInterval(trailInterval);
    };
  }, [isFinePointer]);

  // --- Context-specific style updates ---
  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    dot.setAttribute('data-context', context);
    ring.setAttribute('data-context', context);

    if (labelRef.current) {
      labelRef.current.setAttribute('data-visible', context === 'link' ? 'true' : 'false');
      labelRef.current.textContent = contextLabel.current;
    }
    if (sealRef.current) {
      sealRef.current.setAttribute('data-visible', context === 'expediente' ? 'true' : 'false');
    }
  }, [context]);

  // Also listen for context globally
  useEffect(() => {
    if (!isFinePointer) return;
    document.addEventListener('mouseover', detectContext);
    return () => document.removeEventListener('mouseover', detectContext);
  }, [isFinePointer, detectContext]);

  if (!mounted || !isFinePointer) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
      <div ref={labelRef} className="cursor-label" data-visible="false" />
      <div ref={sealRef} className="cursor-seal-mini" data-visible="false">
        <svg width="28" height="28" viewBox="0 0 100 100">
          <polygon
            points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30"
            fill="none"
            stroke="var(--color-accent-gold)"
            strokeWidth="3"
          />
          <text
            x="50" y="58"
            textAnchor="middle"
            fontFamily="'IBM Plex Serif', serif"
            fontSize="26"
            fontWeight="700"
            fill="var(--color-accent-gold)"
          >
            RM
          </text>
        </svg>
      </div>
    </>
  );
}
