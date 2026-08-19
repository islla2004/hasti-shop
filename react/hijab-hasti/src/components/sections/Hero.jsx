import { useCallback, useEffect, useRef, useState } from 'react';
import { HERO_SLIDES } from '../../data/siteData';

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const startAutoplay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
  }, []);

  const resetAutoplay = useCallback((getNextIndex) => {
    setCurrent((prev) => (getNextIndex(prev) + HERO_SLIDES.length) % HERO_SLIDES.length);
    startAutoplay();
  }, [startAutoplay]);

  useEffect(() => {
    startAutoplay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startAutoplay]);

  return (
    <section className="hero" id="heroSection" aria-label="Seasonal sale">
      {HERO_SLIDES.map((slide, index) => (
        <div
          key={slide.desktop}
          className={`hero__slide${index === current ? ' hero__slide--active' : ''}`}
          style={{
            '--hero-img-mobile': `url('${slide.mobile}')`,
            '--hero-img-desktop': `url('${slide.desktop}')`,
            '--hero-img-scale': slide.scale,
            ...(slide.position ? { '--hero-img-position': slide.position } : {}),
          }}
        />
      ))}

      <div className="hero__overlay" />

      <button
        className="hero__nav hero__nav--prev"
        aria-label="Previous slide"
        onClick={() => resetAutoplay((prev) => prev - 1)}
        type="button"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M15 6l-6 6 6 6" />
        </svg>
      </button>

      <button
        className="hero__nav hero__nav--next"
        aria-label="Next slide"
        onClick={() => resetAutoplay((prev) => prev + 1)}
        type="button"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>

      <div className="hero__dots" id="heroDots" role="tablist" aria-label="Slides">
        {HERO_SLIDES.map((slide, index) => (
          <button
            key={slide.desktop}
            className={`hero__dot${index === current ? ' hero__dot--active' : ''}`}
            role="tab"
            aria-selected={index === current}
            aria-label={`Slide ${index + 1}`}
            onClick={() => resetAutoplay(() => index)}
            type="button"
          />
        ))}
      </div>
    </section>
  );
}
