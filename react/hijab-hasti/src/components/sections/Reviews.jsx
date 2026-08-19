import { useRef } from 'react';
import { REVIEWS } from '../../data/siteData';

function EyebrowDot() {
  return (
    <svg width="6" height="6" style={{ display: 'inline-block', margin: '0 8px' }}>
      <circle cx="3" cy="3" r="2.5" fill="currentColor" />
    </svg>
  );
}

export default function Reviews() {
  const trackRef = useRef(null);

  const scrollReviews = (direction) => {
    const track = trackRef.current;
    if (!track) return;

    const card = track.querySelector('.review-card');
    const step = card ? card.getBoundingClientRect().width + 22 : 320;
    track.scrollBy({ left: direction * -step, behavior: 'smooth' });
  };

  return (
    <section className="reviews" id="reviews">
      <svg className="reviews__quote-deco" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M9.5 4C6.5 4 4 6.5 4 9.5v10h9.5v-9.5H8.2c.1-2.5 1.9-4.5 4.3-5V4H9.5zm10 0c-3 0-5.5 2.5-5.5 5.5v10H23v-9.5h-5.3c.1-2.5 1.9-4.5 4.3-5V4h-2.5z" />
      </svg>

      <div className="container">
        <div className="section-heading fade-up">
          <span className="eyebrow eyebrow--dark">
            <EyebrowDot />
            صدای مشتریان هستی
            <EyebrowDot />
          </span>
          <h2 className="section-heading__title section-heading__title--dark">تجربه‌ای که به اشتراک گذاشته می‌شود</h2>
          <p className="section-heading__desc section-heading__desc--dark">
            اعتماد بانوانی که هستی را انتخاب کرده‌اند، بزرگ‌ترین دارایی ماست
          </p>
        </div>

        <div className="reviews__summary fade-up">
          <div className="reviews__summary-score">
            <span className="reviews__summary-num"> ۵/</span>
            <span className="reviews__summary-max">۴.۹</span>
          </div>
          <div className="reviews__summary-divider" aria-hidden="true" />
          <div className="reviews__summary-details">
            <div className="reviews__stars" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, index) => (
                <svg key={index} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 6.9L12 17l-6.3 3.8 1.7-6.9L2 8.2l7.1-.6z" />
                </svg>
              ))}
            </div>
            <p className="reviews__count">بر اساس بیش از <strong>۳۲۰</strong> نظر ثبت‌شده مشتریان</p>
          </div>
        </div>

        <div className="reviews__carousel">
          <div
            className="reviews__track stagger"
            id="reviewsTrack"
            ref={trackRef}
            tabIndex={0}
            role="region"
            aria-label="نظرات مشتریان"
          >
            {REVIEWS.map((review, index) => (
              <article key={review.name} className="review-card fade-up" style={{ '--i': index }}>
                <span className="review-card__quote" aria-hidden="true">”</span>
                <div className="review-card__stars" aria-hidden="true">★★★★★</div>
                <p className="review-card__text">{review.text}</p>
                <div className="review-card__author">
                  <span className="review-card__avatar">{review.initials}</span>
                  <div className="review-card__author-info">
                    <h4>{review.name}</h4>
                    <p>{review.city}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="reviews__nav-group">
            <button className="reviews__nav" id="reviewsPrev" aria-label="نظر قبلی" onClick={() => scrollReviews(-1)} type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
            <button className="reviews__nav" id="reviewsNext" aria-label="نظر بعدی" onClick={() => scrollReviews(1)} type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
