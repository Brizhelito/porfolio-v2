import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Check for reduced motion preference
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Check for low-end device
const isLowEndDevice =
  typeof navigator !== 'undefined' &&
  (navigator.hardwareConcurrency ?? 4) <= 2;

// Disable animations if preferred
if (prefersReducedMotion) {
  gsap.globalTimeline.timeScale(0);
}

export const animations = {
  /**
   * Folder open animation sequence
   * 1. Lift folder (translateY: -5px)
   * 2. Open flap (rotateX: -120deg)
   * 3. Reveal content (fade + slide)
   */
  openFolder(element: HTMLElement) {
    const tl = gsap.timeline();
    const flap = element.querySelector('.folder-flap') as HTMLElement;
    const content = element.querySelector('.folder-content') as HTMLElement;

    tl.to(element, {
      duration: 0.3,
      y: -5,
      ease: 'power2.out',
    });

    if (flap) {
      tl.to(
        flap,
        {
          duration: 0.5,
          rotateX: -120,
          ease: 'power2.inOut',
        },
        '-=0.1',
      );
    }

    if (content) {
      tl.to(
        content,
        {
          duration: 0.3,
          opacity: 1,
          y: 0,
          ease: 'power2.out',
        },
        '-=0.2',
      );
    }

    return tl;
  },

  /**
   * Close folder (reverse of open)
   */
  closeFolder(element: HTMLElement) {
    const tl = gsap.timeline();
    const flap = element.querySelector('.folder-flap') as HTMLElement;
    const content = element.querySelector('.folder-content') as HTMLElement;

    if (content) {
      tl.to(content, {
        duration: 0.2,
        opacity: 0,
        y: 10,
        ease: 'power2.in',
      });
    }

    if (flap) {
      tl.to(
        flap,
        {
          duration: 0.4,
          rotateX: 0,
          ease: 'power2.inOut',
        },
        '-=0.1',
      );
    }

    tl.to(
      element,
      {
        duration: 0.3,
        y: 0,
        ease: 'power2.in',
      },
      '-=0.2',
    );

    return tl;
  },

  /**
   * Stamp seal animation (thump effect)
   */
  stampSeal(element: HTMLElement) {
    return gsap.fromTo(
      element,
      { scale: 1.5, rotate: -5, opacity: 0 },
      {
        duration: 0.5,
        scale: 1,
        rotate: 0,
        opacity: 1,
        ease: 'back.out(1.7)',
      },
    );
  },

  /**
   * Draw gold thread SVG path (scroll-triggered)
   */
  drawGoldThread(path: SVGPathElement) {
    const length = path.getTotalLength();

    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    return gsap.to(path, {
      strokeDashoffset: 0,
      duration: 1,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: path,
        start: 'top 80%',
      },
    });
  },

  /**
   * Seal breathing animation (infinite loop)
   */
  breatheSeal(element: HTMLElement) {
    return gsap.to(element, {
      scale: 1.02,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  },

  /**
   * Reveal element on scroll
   */
  revealOnScroll(element: HTMLElement, options?: { delay?: number; y?: number }) {
    const { delay = 0, y = 20 } = options ?? {};

    return gsap.from(element, {
      opacity: 0,
      y,
      duration: 0.5,
      delay,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
      },
    });
  },

  /**
   * Staggered reveal for multiple elements
   */
  staggerReveal(elements: HTMLElement[], options?: { stagger?: number; y?: number }) {
    const { stagger = 0.08, y = 20 } = options ?? {};

    return gsap.from(elements, {
      opacity: 0,
      y,
      duration: 0.4,
      stagger,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: elements[0],
        start: 'top 85%',
      },
    });
  },
};

/**
 * Cleanup helper for React components using ScrollTrigger
 */
export function cleanupScrollTriggers() {
  ScrollTrigger.getAll().forEach((st) => st.kill());
}

export { gsap, ScrollTrigger, prefersReducedMotion, isLowEndDevice };
