import { useEffect } from 'react';
import type Lenis from 'lenis';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const hasFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

let lenis: Lenis | null = null;
export const setLenis = (instance: Lenis | null) => { lenis = instance; };
export const getLenis = () => lenis;

// Reference-counted so nested overlays (menu + modal) unlock correctly.
let locks = 0;
const lock = () => {
  if (locks++ > 0) return;
  document.documentElement.classList.add('rc-scroll-locked');
  lenis?.stop();
};
const unlock = () => {
  if (locks === 0 || --locks > 0) return;
  document.documentElement.classList.remove('rc-scroll-locked');
  lenis?.start();
};

export const useScrollLock = (locked: boolean) => {
  useEffect(() => {
    if (!locked) return;
    lock();
    return unlock;
  }, [locked]);
};

export const scrollToTop = () => {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
};

export const scrollToElement = (el: Element | null, offset = -140) => {
  if (!el) return;
  if (lenis) lenis.scrollTo(el as HTMLElement, { offset });
  else el.scrollIntoView({ behavior: 'smooth', block: 'center' });
};
