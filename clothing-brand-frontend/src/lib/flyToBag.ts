import { prefersReducedMotion } from './motion';

/** Animates a thumbnail from `from` into the header bag icon, then bumps the icon. */
export const flyToBag = (imageSrc: string, from: Element | null) => {
  const target = document.querySelector<HTMLElement>('[data-bag-target]');
  if (!target || !from || prefersReducedMotion()) return Promise.resolve();

  const start = from.getBoundingClientRect();
  const end = target.getBoundingClientRect();
  const size = Math.min(start.width, 220);

  const ghost = document.createElement('img');
  ghost.src = imageSrc;
  ghost.alt = '';
  ghost.className = 'rc-fly';
  Object.assign(ghost.style, {
    left: `${start.left + start.width / 2 - size / 2}px`,
    top: `${start.top + start.height / 2 - (size * 1.25) / 2}px`,
    width: `${size}px`,
    height: `${size * 1.25}px`,
  });
  document.body.appendChild(ghost);

  const dx = end.left + end.width / 2 - (start.left + start.width / 2);
  const dy = end.top + end.height / 2 - (start.top + start.height / 2);

  const flight = ghost.animate(
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 1, borderRadius: '12px' },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 80}px) scale(0.55)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.08)`, opacity: 0.3, borderRadius: '50%' },
    ],
    { duration: 850, easing: 'cubic-bezier(0.5, 0, 0.2, 1)' }
  );

  return flight.finished.then(() => {
    ghost.remove();
    target.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(0.9)' }, { transform: 'scale(1)' }],
      { duration: 450, easing: 'ease-out' }
    );
  }).catch(() => ghost.remove());
};
