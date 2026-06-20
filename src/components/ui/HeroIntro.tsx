import { useEffect, useRef, type ReactNode } from 'react';
import { gsap, prefersReducedMotion } from '@lib/animations';

interface HeroIntroProps {
  children: ReactNode;
}

/**
 * Splits an element's text into per-character <span>s for typewriter effect.
 * Preserves <br> elements as-is.
 */
function splitIntoChars(el: HTMLElement): HTMLSpanElement[] {
  const spans: HTMLSpanElement[] = [];
  const fragment = document.createDocumentFragment();

  // Walk child nodes to preserve <br> elements
  const children = Array.from(el.childNodes);
  for (const child of children) {
    if (child.nodeType === Node.ELEMENT_NODE && (child as HTMLElement).tagName === 'BR') {
      fragment.appendChild(document.createElement('br'));
    } else {
      const text = child.textContent ?? '';
      for (const ch of text) {
        const span = document.createElement('span');
        span.textContent = ch;
        span.className = 'hero-char';
        // Preserve spaces as non-breaking so inline-block doesn't collapse them
        if (ch === ' ') span.innerHTML = '&nbsp;';
        spans.push(span);
        fragment.appendChild(span);
      }
    }
  }

  el.innerHTML = '';
  el.appendChild(fragment);
  return spans;
}

export default function HeroIntro({ children }: HeroIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    // Safety net: if anything fails, reveal content after 4s to prevent
    // permanent blank hero (worse than a flash).
    const safetyTimer = setTimeout(() => {
      if (root.style.visibility === 'hidden') {
        root.style.visibility = 'visible';
        root.style.opacity = '1';
        root.querySelectorAll<HTMLElement>('[data-hero-seal],[data-hero-name],[data-hero-subtitle],[data-hero-stats],[data-hero-status],[data-hero-ctas],[data-hero-featured-label],[data-hero-folder]').forEach(el => {
          el.style.visibility = 'visible';
          el.style.opacity = '1';
        });
      }
    }, 4000);

    try {
    // Query all animatable targets
    const seal = root.querySelector<HTMLElement>('[data-hero-seal]');
    const name = root.querySelector<HTMLElement>('[data-hero-name]');
    const subtitle = root.querySelector<HTMLElement>('[data-hero-subtitle]');
    const stats = root.querySelector<HTMLElement>('[data-hero-stats]');
    const status = root.querySelector<HTMLElement>('[data-hero-status]');
    const ctas = root.querySelector<HTMLElement>('[data-hero-ctas]');
    const featuredLabel = root.querySelector<HTMLElement>('[data-hero-featured-label]');
    const folder = root.querySelector<HTMLElement>('[data-hero-folder]');

    // Reduced motion: show everything immediately
    if (prefersReducedMotion) {
      clearTimeout(safetyTimer);
      const all = [seal, name, subtitle, stats, status, ctas, featuredLabel, folder].filter(Boolean);
      gsap.set(all, { opacity: 1, visibility: 'visible', scale: 1, rotate: 0 });
      root.style.visibility = 'visible';
      root.style.opacity = '1';
      return;
    }

    // --- Apply ALL initial hidden states BEFORE revealing container ---
    if (seal) gsap.set(seal, { opacity: 0, scale: 1.8, rotate: -8 });
    if (stats) gsap.set(stats, { opacity: 0, y: 8 });
    if (status) gsap.set(status, { opacity: 0, y: 8 });
    if (featuredLabel) gsap.set(featuredLabel, { opacity: 0, y: -10 });
    if (folder) {
      folder.setAttribute('data-animating', '');
      // Cap initial throw so the folder stays within the viewport during
      // the entrance — y:-300 used to push it visibly above the fold and
      // make it look like it "landed off-screen".
      gsap.set(folder, { opacity: 0, y: -120, x: 40, rotate: -10, scale: 0.95 });
    }
    if (ctas) {
      const ctaChildren = Array.from(ctas.children) as HTMLElement[];
      gsap.set(ctaChildren, { opacity: 0, scale: 1.3, rotate: -3 });
    }

    // --- Split typewriter text BEFORE revealing (DOM replacement invisible while container hidden) ---
    const nameChars = name ? splitIntoChars(name) : [];
    const subtitleChars = subtitle ? splitIntoChars(subtitle) : [];
    if (nameChars.length) gsap.set(nameChars, { opacity: 0, visibility: 'hidden' });
    if (subtitleChars.length) gsap.set(subtitleChars, { opacity: 0, visibility: 'hidden' });

    // --- Reveal container (all elements already at opacity: 0) ---
    root.style.visibility = 'visible';
    root.style.opacity = '1';

    // Override CSS-level visibility:hidden on individual hero elements.
    // Elements remain invisible via opacity:0 (set above) — this just
    // clears the defense-in-depth visibility rule so GSAP .to() works.
    [seal, name, subtitle, stats, status, ctas, featuredLabel, folder]
      .filter(Boolean)
      .forEach(el => { (el as HTMLElement).style.visibility = 'visible'; });

    // --- Wait for Seal SVG, then start timeline animation ---
    let attempts = 0;
    const maxAttempts = 30;

    function waitForSealAndStart() {
      const svgReady = seal?.querySelector('svg');
      if (!svgReady && attempts < maxAttempts) {
        attempts++;
        requestAnimationFrame(waitForSealAndStart);
        return;
      }
      startTimeline();
    }

    function startTimeline() {
      const tl = gsap.timeline();

      // --- 0.0s: Seal stamp ---
      if (seal) {
        tl.to(seal, {
          opacity: 1,
          scale: 1,
          rotate: 0,
          duration: 0.5,
          ease: 'back.out(2)',
        });
      }

      // --- 0.35s: Name typewriter ---
      if (nameChars.length) {
        tl.to(nameChars, {
          opacity: 1,
          visibility: 'visible',
          duration: 0.02,
          stagger: 0.025,
          ease: 'none',
        }, 0.35);
      }

      // --- 0.5s: Subtitle typewriter ---
      if (subtitleChars.length) {
        tl.to(subtitleChars, {
          opacity: 1,
          visibility: 'visible',
          duration: 0.02,
          stagger: 0.018,
          ease: 'none',
        }, 0.5);
      }

      // --- 1.0s: Stats + status fade up ---
      const metaEls = [stats, status].filter(Boolean) as HTMLElement[];
      if (metaEls.length) {
        tl.to(metaEls, {
          opacity: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.1,
          ease: 'power2.out',
        }, 1.0);
      }

      // --- 1.2s: CTA buttons stamp ---
      if (ctas) {
        const ctaChildren = Array.from(ctas.children) as HTMLElement[];
        tl.to(ctaChildren, {
          opacity: 1,
          scale: 1,
          rotate: 0,
          duration: 0.35,
          stagger: 0.12,
          ease: 'back.out(1.5)',
        }, 1.2);
      }

      // --- 1.5s: Featured label ---
      if (featuredLabel) {
        tl.to(featuredLabel, {
          opacity: 1,
          y: 0,
          duration: 0.25,
          ease: 'power2.out',
        }, 1.5);
      }

      // --- 1.6s: Folder throw ---
      if (folder) {
        tl.to(folder, { opacity: 1, duration: 0.01 }, 1.59);
        tl.to(folder, {
          keyframes: [
            { y: 10, x: -5, rotate: -2, scale: 1.01, duration: 0.4, ease: 'power2.in' },
            { y: -8, x: 0, rotate: -4, duration: 0.15, ease: 'power1.out' },
            { y: 0, x: 0, rotate: -3, scale: 1, duration: 0.2, ease: 'power2.out' },
          ],
          onComplete() {
            gsap.set(folder, { clearProps: 'all' });
            folder.style.visibility = 'visible';
            folder.removeAttribute('data-animating');
          },
        }, 1.6);
      }
    }

    waitForSealAndStart();
    } catch {
      // Animation setup failed — reveal everything immediately
      clearTimeout(safetyTimer);
      root.style.visibility = 'visible';
      root.style.opacity = '1';
      root.querySelectorAll<HTMLElement>('[data-hero-seal],[data-hero-name],[data-hero-subtitle],[data-hero-stats],[data-hero-status],[data-hero-ctas],[data-hero-featured-label],[data-hero-folder]').forEach(el => {
        el.style.visibility = 'visible';
        el.style.opacity = '1';
      });
    }
  }, []);

  return (
    <div ref={containerRef} data-hero-orchestrator className="flex flex-1 flex-col">
      {children}
    </div>
  );
}
