import { useEffect, useRef, useCallback, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<HTMLDivElement[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const createTrailParticle = useCallback((x: number, y: number) => {
    const particle = document.createElement('div');
    particle.className = 'cursor-trail-particle';
    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 4px;
      height: 4px;
      background: var(--color-accent-gold, #C9A961);
      border-radius: 50%;
      pointer-events: none;
      z-index: var(--z-cursor, 9999);
      opacity: 0.5;
      transition: opacity 0.3s ease-out, transform 0.3s ease-out;
      transform: scale(1);
    `;
    document.body.appendChild(particle);

    requestAnimationFrame(() => {
      particle.style.opacity = '0';
      particle.style.transform = 'scale(0.2)';
    });

    setTimeout(() => particle.remove(), 350);
  }, []);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    setIsTouchDevice(isTouch);
    if (isTouch) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    let lastTrailTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      cursor.style.transform = `translate(${e.clientX - 12}px, ${e.clientY - 12}px)`;

      if (cursor.style.opacity !== '1') {
        cursor.style.opacity = '1';
      }

      const now = Date.now();
      if (now - lastTrailTime > 50) {
        createTrailParticle(e.clientX, e.clientY);
        lastTrailTime = now;
      }
    };

    const handleMouseLeave = () => {
      cursor.style.opacity = '0';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [createTrailParticle]);

  // Don't render on touch devices
  if (isTouchDevice) return null;

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-[var(--z-cursor)] opacity-0 hidden md:block"
        style={{ willChange: 'transform' }}
      >
        {/* RM seal cursor */}
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="none" stroke="var(--color-accent-gold, #C9A961)" strokeWidth="1" opacity="0.8" />
          <text x="12" y="15" textAnchor="middle" fontFamily="serif" fontSize="8" fontWeight="700" fill="var(--color-accent-gold, #C9A961)">
            RM
          </text>
        </svg>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        @media (pointer: fine) and (min-width: 768px) {
          body { cursor: none !important; }
          a, button, [role="button"] { cursor: none !important; }
        }
      `}} />
    </>
  );
}
