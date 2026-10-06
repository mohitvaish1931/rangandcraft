import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/motion';

const COLORS = ['#1f4645', '#b07d45', '#ead7bb', '#a2412c', '#ffffff', '#2d6a4f'];

/** One celebratory burst, drawn on a canvas and removed after ~3s. */
const Confetti = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const W = window.innerWidth;
    const pieces = Array.from({ length: 160 }, (_, i) => {
      const fromLeft = i % 2 === 0;
      return {
        x: fromLeft ? -10 : W + 10,
        y: window.innerHeight * 0.65,
        vx: (fromLeft ? 1 : -1) * (6 + Math.random() * 9),
        vy: -(10 + Math.random() * 12),
        size: 5 + Math.random() * 7,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: COLORS[i % COLORS.length],
        shape: i % 3,
      };
    });

    let frame = 0;
    const start = performance.now();
    const draw = (t: number) => {
      const elapsed = t - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = Math.max(0, 1 - Math.max(0, elapsed - 2200) / 800);
      pieces.forEach((p) => {
        p.vy += 0.32;
        p.vx *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === 0) ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        else if (p.shape === 1) { ctx.beginPath(); ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2); ctx.fill(); }
        else { ctx.beginPath(); ctx.moveTo(0, -p.size / 2); ctx.lineTo(p.size / 2, p.size / 2); ctx.lineTo(-p.size / 2, p.size / 2); ctx.fill(); }
        ctx.restore();
      });
      if (elapsed < 3000) frame = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    frame = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={ref} className="rc-confetti" aria-hidden />;
};

export default Confetti;
