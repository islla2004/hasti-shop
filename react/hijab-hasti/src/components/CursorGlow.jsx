import { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const touchOnly = window.matchMedia('(hover: none)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!el || touchOnly || reduceMotion) return undefined;

    const onMove = (e) => {
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
      document.body.classList.add('has-cursor-glow');
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.body.classList.remove('has-cursor-glow');
    };
  }, []);

  return <div className="cursor-glow" ref={ref} aria-hidden="true" />;
}
