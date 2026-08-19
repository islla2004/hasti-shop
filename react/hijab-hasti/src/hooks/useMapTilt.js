import { useEffect } from 'react';

export function useMapTilt(mapFrameRef) {
  useEffect(() => {
    const mapFrame = mapFrameRef.current;
    if (!mapFrame) return undefined;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = window.matchMedia('(hover: none)').matches;

    if (prefersReducedMotion || isTouchDevice) return undefined;

    let rafId = null;
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const animateTilt = () => {
      currentRotX += (targetRotX - currentRotX) * 0.12;
      currentRotY += (targetRotY - currentRotY) * 0.12;
      mapFrame.style.transform = `rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;

      if (Math.abs(targetRotX - currentRotX) > 0.01 || Math.abs(targetRotY - currentRotY) > 0.01) {
        rafId = requestAnimationFrame(animateTilt);
      } else {
        rafId = null;
      }
    };

    const startAnimation = () => {
      if (!rafId) rafId = requestAnimationFrame(animateTilt);
    };

    const onMouseMove = (e) => {
      const rect = mapFrame.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const maxTilt = 5;
      targetRotY = (px - 0.5) * maxTilt * 2;
      targetRotX = -(py - 0.5) * maxTilt * 2;
      startAnimation();
    };

    const onMouseLeave = () => {
      targetRotX = 0;
      targetRotY = 0;
      startAnimation();
    };

    mapFrame.addEventListener('mousemove', onMouseMove);
    mapFrame.addEventListener('mouseleave', onMouseLeave);

    return () => {
      mapFrame.removeEventListener('mousemove', onMouseMove);
      mapFrame.removeEventListener('mouseleave', onMouseLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [mapFrameRef]);
}
