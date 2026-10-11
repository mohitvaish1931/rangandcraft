import { useEffect, useSyncExternalStore } from 'react';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const hasFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Reference-counted so nested overlays (menu + modal) unlock correctly.
let locks = 0;
const lock = () => {
  if (locks++ > 0) return;
  document.documentElement.classList.add('rc-scroll-locked');
};
const unlock = () => {
  if (locks === 0 || --locks > 0) return;
  document.documentElement.classList.remove('rc-scroll-locked');
};

export const useScrollLock = (locked: boolean) => {
  useEffect(() => {
    if (!locked) return;
    lock();
    return unlock;
  }, [locked]);
};

export const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });

export const scrollToElement = (el: Element | null) => {
  el?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
};

/** Live media-query match (e.g. render the desktop gallery only on desktop). */
export const useMediaQuery = (query: string) =>
  useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
