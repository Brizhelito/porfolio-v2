import { useEffect, useRef } from 'react';

const TRAIL_INTERVAL = 80;
const MAX_TRAIL = 20;
const RING_FOLLOW = 0.12;

type CursorMode = 'default' | 'hovering' | 'nav' | 'reading' | 'expediente' | 'input';

const PATH_COLORS: Record<string, string> = {
  '/': '#C9A961',
  '/about': '#2D4A5C',
  '/tools': '#4A4640',
  '/expedientes': '#5C7156',
  '/colaboraciones': '#5C7156',
  '/contacto': '#B23A28',
  '/inspiraciones': '#4A4640',
};

function sectionColor(path: string): string {
  const key = Object.keys(PATH_COLORS).find((p) => path === p || path.startsWith(p + '/'));
  return key ? PATH_COLORS[key] : '#C9A961';
}

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
  const trailCount = useRef(0);
  const rafId = useRef(0);
  const lastScrollY = useRef(0);
  const scrollTimer = useRef<number>(0);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot = dotRef.current;
    const ringEl = ringRef.current;
    if (!dot || !ringEl) return;

    // Section color detection
    const applySectionColor = () => {
      const color = sectionColor(window.location.pathname);
      ringEl.style.setProperty('--cursor-ring-color', color);
    };
    applySectionColor();

    // Trail spawner
    const spawnTrail = (x: number, y: number) => {
      if (trailCount.current >= MAX_TRAIL) return;
      const p = document.createElement('div');
      p.className = 'cursor-trail-particle';
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      document.body.appendChild(p);
      trailCount.current++;

      requestAnimationFrame(() => { p.style.opacity = '0'; });
      setTimeout(() => { p.remove(); trailCount.current--; }, 350);
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
      document.querySelectorAll('.cursor-trail-particle').forEach((p) => p.remove());
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}
