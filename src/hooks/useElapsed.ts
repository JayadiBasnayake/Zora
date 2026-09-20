import { useEffect, useRef, useState } from 'react';

const prefersReduced = () =>
typeof window !== 'undefined' &&
window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Seconds elapsed since mount, sampled at a fixed rate so map animation stays
 * cheap. Returns a static value when the user prefers reduced motion.
 */
export function useElapsed(fps = 24): number {
  const [seconds, setSeconds] = useState(0);
  const start = useRef<number>(0);

  useEffect(() => {
    if (prefersReduced()) return;
    let raf = 0;
    let last = 0;
    const interval = 1000 / fps;
    start.current = performance.now();

    const loop = (now: number) => {
      if (document.hidden) {
        raf = requestAnimationFrame(loop);
        return;
      }
      if (now - last >= interval) {
        last = now;
        setSeconds((now - start.current) / 1000);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [fps]);

  return seconds;
}