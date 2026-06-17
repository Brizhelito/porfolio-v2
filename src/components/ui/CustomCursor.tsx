import { useEffect, useRef } from 'react';
import { gsap } from '@lib/animations';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -200, y: -200 });
  const dpos = useRef({ x: -200, y: -200 });
  const rpos = useRef({ x: -200, y: -200 });
  const raf = useRef(0);
  const lastTrail = useRef(0);
  const labelText = useRef('');

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
    if (isTouch) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let visible = false;
    let cursorCtx = 'normal';

    const move = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (!visible) {
        visible = true;
        dpos.current = { x: e.clientX - 4, y: e.clientY - 4 };
        rpos.current = { x: e.clientX - 16, y: e.clientY - 16 };
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      }
      const t = e.target as HTMLElement;
      const link = t.closest('a, button, [role="button"]');
      if (link) {
        cursorCtx = 'link';
        labelText.current = link.getAttribute('aria-label') || link.textContent?.slice(0, 10).toUpperCase() || 'ABRIR';
      } else if (t.closest('[data-cursor="expediente"]')) {
        cursorCtx = 'expediente';
      } else {
        cursorCtx = 'normal';
      }
      dot.setAttribute('data-ctx', cursorCtx);
      ring.setAttribute('data-ctx', cursorCtx);
      if (labelRef.current) {
        labelRef.current.setAttribute('data-vis', cursorCtx === 'link' ? '1' : '0');
        labelRef.current.textContent = labelText.current;
      }
      if (sealRef.current) {
        sealRef.current.setAttribute('data-vis', cursorCtx === 'expediente' ? '1' : '0');
      }
    };

    const leave = () => {
      visible = false;
      dot.style.opacity = '0';
      ring.style.opacity = '0';
      if (labelRef.current) labelRef.current.style.opacity = '0';
      if (sealRef.current) sealRef.current.style.opacity = '0';
    };

    const loop = () => {
      dpos.current.x += (mouse.current.x - 4 - dpos.current.x) * 0.18;
      dpos.current.y += (mouse.current.y - 4 - dpos.current.y) * 0.18;
      dot.style.transform = `translate(${dpos.current.x}px, ${dpos.current.y}px)`;

      rpos.current.x += (mouse.current.x - 16 - rpos.current.x) * 0.09;
      rpos.current.y += (mouse.current.y - 16 - rpos.current.y) * 0.09;
      ring.style.transform = `translate(${rpos.current.x}px, ${rpos.current.y}px)`;

      if (labelRef.current) {
        labelRef.current.style.transform = `translate(${mouse.current.x + 20}px, ${mouse.current.y - 8}px)`;
      }
      if (sealRef.current) {
        sealRef.current.style.transform = `translate(${mouse.current.x - 14}px, ${mouse.current.y - 14}px)`;
      }
      raf.current = requestAnimationFrame(loop);
    };

    const trail = setInterval(() => {
      if (!visible) return;
      const now = Date.now();
      if (now - lastTrail.current < 150) return;
      lastTrail.current = now;
      const p = document.createElement('div');
      Object.assign(p.style, {
        position: 'fixed', left: `${mouse.current.x - 1.5}px`, top: `${mouse.current.y - 1.5}px`,
        width: '3px', height: '3px', borderRadius: '50%', background: '#C9A961',
        pointerEvents: 'none', zIndex: '9997', opacity: '0.4',
      });
      document.body.appendChild(p);
      gsap.to(p, { opacity: 0, scale: 0.2, duration: 0.3, ease: 'power2.out', onComplete: () => p.remove() });
    }, 150);

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseleave', leave);
    raf.current = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseleave', leave);
      cancelAnimationFrame(raf.current);
      clearInterval(trail);
    };
  }, []);

  return (
    <>
      <style>{`
        .cd{position:fixed;top:0;left:0;width:8px;height:8px;border-radius:50%;background:#C9A961;pointer-events:none;z-index:9999;opacity:0;will-change:transform;transition:width .25s,height .25s,opacity .15s}
        .cd[data-ctx="link"]{width:6px;height:6px}
        .cd[data-ctx="expediente"]{width:4px;height:4px}
        .cr{position:fixed;top:0;left:0;width:32px;height:32px;border-radius:50%;border:1.5px solid #C9A961;pointer-events:none;z-index:9998;opacity:0;will-change:transform;transition:width .35s,height .35s,border-color .3s,opacity .15s}
        .cr[data-ctx="link"]{width:48px;height:48px;border-color:#D4AF37}
        .cr[data-ctx="expediente"]{width:40px;height:40px}
        .cl{position:fixed;pointer-events:none;z-index:10000;font-family:'Special Elite',cursive;font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:#C9A961;opacity:0;transition:opacity .2s;white-space:nowrap}
        .cl[data-vis="1"]{opacity:1}
        .cs{position:fixed;pointer-events:none;z-index:10000;opacity:0;transition:opacity .25s}
        .cs[data-vis="1"]{opacity:1}
        @media(pointer:coarse){.cd,.cr,.cl,.cs{display:none!important}}
        @media(pointer:fine) and (min-width:768px){body,a,button,[role="button"]{cursor:none!important}}
      `}</style>
      <div ref={dotRef} className="cd" />
      <div ref={ringRef} className="cr" />
      <div ref={labelRef} className="cl" data-vis="0" />
      <div ref={sealRef} className="cs" data-vis="0">
        <svg width="28" height="28" viewBox="0 0 100 100">
          <polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill="none" stroke="#C9A961" strokeWidth="3" />
          <text x="50" y="58" textAnchor="middle" fontFamily="'IBM Plex Serif',serif" fontSize="26" fontWeight="700" fill="#C9A961">RM</text>
        </svg>
      </div>
    </>
  );
}
