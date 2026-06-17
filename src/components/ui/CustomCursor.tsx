import { useEffect, useRef } from 'react';

const TRAIL_INTERVAL = 80;
const MAX_TRAIL = 20;
const RING_FOLLOW = 0.12;

type CursorMode = 'default' | 'linking' | 'expediente' | 'input' | 'navbar' | 'reading';

const SECTION_COLORS: Record<string, string> = {
  '/': '#C9A961',
  '/about': '#2D4A5C',
  '/tools': '#4A4640',
  '/expedientes': '#5C7156',
  '/colaboraciones': '#5C7156',
  '/contacto': '#B23A28',
  '/inspiraciones': '#4A4640',
};

function sectionColor(path: string): string {
  const key = Object.keys(SECTION_COLORS).find((p) => path === p || path.startsWith(p + '/'));
  return key ? SECTION_COLORS[key] : '#C9A961';
}

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const trailTimer = useRef<number>(0);
  const trailCount = useRef(0);
  const rafId = useRef(0);
  const modeRef = useRef<CursorMode>('default');
  const lastScrollY = useRef(0);
  const scrollTimer = useRef<number>(0);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Section color on mount
    ring.style.setProperty('--ring-color', sectionColor(window.location.pathname));

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

    const setMode = (mode: CursorMode) => {
      if (mode === modeRef.current) return;
      modeRef.current = mode;
      ring.className = 'cursor-ring' +
        (mode === 'linking' ? ' is-linking' : '') +
        (mode === 'expediente' ? ' is-expediente' : '') +
        (mode === 'input' ? ' is-input' : '') +
        (mode === 'navbar' ? ' is-navbar' : '') +
        (mode === 'reading' ? ' is-reading' : '');
    };

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

    const onMouseOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;

      // Order matters: most specific first
      if (t.closest('[data-expediente]')) {
        setMode('expediente');
      } else if (t.closest('input, textarea, [contenteditable]')) {
        setMode('input');
      } else if (t.closest('nav a, .nav-link')) {
        setMode('navbar');
      } else if (t.closest('a, button, [role="button"]')) {
        setMode('linking');
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('a, button, [role="button"], input, textarea, [contenteditable], [data-expediente]')) {
        setMode('default');
      }
    };

    // Reading mode: slow scroll → ring contracts
    const onScroll = () => {
      const delta = Math.abs(window.scrollY - lastScrollY.current);
      lastScrollY.current = window.scrollY;

      if (scrollTimer.current) clearTimeout(scrollTimer.current);
      if (delta < 3 && modeRef.current === 'default') {
        setMode('reading');
        scrollTimer.current = window.setTimeout(() => {
          setMode('default');
        }, 2000);
      } else if (delta >= 3 && modeRef.current === 'reading') {
        setMode('default');
      }
    };

    // Smooth ring follower
    const tick = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * RING_FOLLOW;
      ring.current.y += (mouse.current.y - ring.current.y) * RING_FOLLOW;
      ring.style.left = ring.current.x + 'px';
      ring.style.top = ring.current.y + 'px';
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
