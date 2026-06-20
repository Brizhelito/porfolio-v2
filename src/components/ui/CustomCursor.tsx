import { useEffect, useRef, useState } from 'react';
import { cursorColorForPath } from '@lib/page-config';

const TRAIL_INTERVAL = 80;
const MAX_TRAIL = 20;
const RING_FOLLOW = 0.18;

type CursorMode = 'default' | 'hovering' | 'nav' | 'reading' | 'expediente' | 'input';

function setRingClass(ring: HTMLElement, mode: CursorMode) {
  ring.className = 'cursor-ring' +
    (mode === 'hovering' ? ' is-hovering' : '') +
    (mode === 'nav' ? ' is-nav' : '') +
    (mode === 'reading' ? ' is-reading' : '') +
    (mode === 'expediente' ? ' is-expediente' : '') +
    (mode === 'input' ? ' is-input' : '');
}

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const trailTimer = useRef<number>(0);
  const trailPool = useRef<HTMLDivElement[]>([]);
  const trailNextIdx = useRef(0);
  const rafId = useRef(0);
  const lastScrollY = useRef(0);
  const scrollTimer = useRef<number>(0);
  const [mode, setMode] = useState<'custom' | 'native'>('custom');

  useEffect(() => {
    const saved = localStorage.getItem('cursor') as 'custom' | 'native' | null;
    if (saved) setMode(saved);

    const onCursorChange = (e: CustomEvent) => setMode(e.detail);
    window.addEventListener('cursorchange', onCursorChange as EventListener);
    return () => window.removeEventListener('cursorchange', onCursorChange as EventListener);
  }, []);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (mode === 'native') return;

    const dot = dotRef.current;
    const ringEl = ringRef.current;
    if (!dot || !ringEl) return;

    // P1-02: build the particle pool ONCE. Each particle starts hidden and
    // is repositioned on spawn; opacity fades via CSS transition. After the
    // transition completes the particle is hidden again, ready for reuse.
    const poolParent = document.body;
    for (let i = 0; i < MAX_TRAIL; i++) {
      const p = document.createElement('div');
      p.className = 'cursor-trail-particle';
      p.style.opacity = '0';
      p.style.left = '-100px';
      p.style.top = '-100px';
      poolParent.appendChild(p);
      trailPool.current.push(p);
    }

    // Section color detection — P1-12: via page-config
    const applySectionColor = () => {
      const color = cursorColorForPath(window.location.pathname);
      ringEl.style.setProperty('--cursor-ring-color', color);
    };
    applySectionColor();

    // Trail spawner — recycles pool particles instead of allocating
    const spawnTrail = (x: number, y: number) => {
      const p = trailPool.current[trailNextIdx.current];
      trailNextIdx.current = (trailNextIdx.current + 1) % MAX_TRAIL;
      if (!p) return;
      // Reset transition by toggling display, then set new position + opacity
      p.style.transition = 'none';
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.opacity = '0.45';
      // Force reflow so the next opacity change animates
      void p.offsetWidth;
      p.style.transition = 'opacity 0.4s ease';
      p.style.opacity = '0';
    };

    // Element-type detection
    const onMouseOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const closest = (sel: string) => t.closest(sel) as HTMLElement | null;

      const link = closest('a');
      if (link) {
        if (link.closest('nav, header') || link.classList.contains('nav-link')) {
          setRingClass(ringEl, 'nav');
          return;
        }
        if (link.closest('[data-expediente]')) {
          setRingClass(ringEl, 'expediente');
          return;
        }
        setRingClass(ringEl, 'hovering');
        return;
      }

      if (closest('button, [role="button"]')) {
        setRingClass(ringEl, 'hovering');
        return;
      }

      if (closest('[data-expediente]')) {
        setRingClass(ringEl, 'expediente');
        return;
      }

      if (closest('input, textarea, select')) {
        setRingClass(ringEl, 'input');
        return;
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('a, button, [role="button"], [data-expediente], input, textarea, select, nav, header')) {
        setRingClass(ringEl, 'default');
      }
    };

    // Reading mode via scroll velocity
    const onScroll = () => {
      const delta = Math.abs(window.scrollY - lastScrollY.current);
      lastScrollY.current = window.scrollY;

      if (scrollTimer.current) clearTimeout(scrollTimer.current);
      if (delta < 3) {
        setRingClass(ringEl, 'reading');
        scrollTimer.current = window.setTimeout(() => {
          setRingClass(ringEl, 'default');
        }, 2000);
      } else {
        setRingClass(ringEl, 'default');
      }
    };

    // Mouse move → dot + trail
    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      dot.style.left = e.clientX + 'px';
      dot.style.top = e.clientY + 'px';

      const now = Date.now();
      if (now - trailTimer.current > TRAIL_INTERVAL) {
        spawnTrail(e.clientX, e.clientY);
        trailTimer.current = now;
      }
    };

    // Smooth ring follower
    const tick = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * RING_FOLLOW;
      ring.current.y += (mouse.current.y - ring.current.y) * RING_FOLLOW;
      ringEl.style.left = ring.current.x + 'px';
      ringEl.style.top = ring.current.y + 'px';
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId.current);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      window.removeEventListener('scroll', onScroll);
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
      // P1-02: remove pooled particles on unmount
      trailPool.current.forEach((p) => p.remove());
      trailPool.current = [];
    };
  }, [mode]);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}
