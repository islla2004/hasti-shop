import { useRef } from 'react';
import { useMapTilt } from '../../hooks/useMapTilt';

function EyebrowDot() {
  return (
    <svg width="6" height="6" style={{ display: 'inline-block', margin: '0 8px' }}>
      <circle cx="3" cy="3" r="2.5" fill="currentColor" />
    </svg>
  );
}

export default function MapSection() {
  const mapFrameRef = useRef(null);
  useMapTilt(mapFrameRef);

  return (
    <section className="map-section" id="location">
      <div className="map-section__glow map-section__glow--a" aria-hidden="true" />
      <div className="map-section__glow map-section__glow--b" aria-hidden="true" />

      <div className="container">
        <div className="section-heading fade-up">
          <span className="eyebrow">
            <EyebrowDot />
            موقعیت فروشگاه
            <EyebrowDot />
          </span>
          <h2 className="section-heading__title">ما را پیدا کنید</h2>
          <p className="section-heading__desc">برای مشاهده موقعیت دقیق فروشگاه و شروع مسیریابی، روی نقشه کلیک کنید</p>
        </div>

        <div className="map-wrapper">
          <div className="map-frame fade-up" id="mapFrame" ref={mapFrameRef}>
            <span className="map-frame__corner map-frame__corner--tl" aria-hidden="true" />
            <span className="map-frame__corner map-frame__corner--tr" aria-hidden="true" />
            <span className="map-frame__corner map-frame__corner--bl" aria-hidden="true" />
            <span className="map-frame__corner map-frame__corner--br" aria-hidden="true" />

            <a
              href="https://www.google.com/maps/search/?api=1&query=مشهد+بلوار+جانباز+مجتمع+اداری+پاژ"
              target="_blank"
              rel="noopener noreferrer"
              className="map-link"
              aria-label="مشاهده موقعیت در گوگل مپ"
            >
              <div className="map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3262.345!2d59.616!3d36.297!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDE3JzQ5LjIiTiA1OcKwMzYnNTcuNiJF!5e0!3m2!1sen!2s!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="موقعیت فروشگاه هستی"
                />

                <div className="map-pin" aria-hidden="true">
                  <span className="map-pin__ring" />
                  <span className="map-pin__ring map-pin__ring--delay" />
                  <span className="map-pin__dot" />
                </div>

                <div className="map-overlay">
                  <div className="map-overlay__content">
                    <span className="map-overlay__icon">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </span>
                    <p>کلیک کنید برای مسیریابی</p>
                    <svg className="map-overlay__arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </a>
          </div>

          <div className="map-info stagger">
            <div className="map-info__item fade-up" style={{ '--i': 0 }}>
              <span className="map-info__index" />
              <span className="map-info__icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <div className="map-info__text">
                <h4>آدرس فروشگاه</h4>
                <p>مشهد، بلوار جانباز، مجتمع اداری پاژ شماره ۲، طبقه سوم، واحد ۳۰۸</p>
              </div>
            </div>

            <div className="map-info__item fade-up" style={{ '--i': 1 }}>
              <span className="map-info__index" />
              <span className="map-info__icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              <div className="map-info__text">
                <h4>تماس با ما</h4>
                <p>۰۹۱۵-۲۵۰۰۵۵۳</p>
              </div>
            </div>

            <div className="map-info__item fade-up" style={{ '--i': 2 }}>
              <span className="map-info__index" />
              <span className="map-info__icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </span>
              <div className="map-info__text">
                <h4>ساعات کاری</h4>
                <p>شنبه تا پنجشنبه : ۱۰/۳۰ الی ۱۳/۳۰ ، ۱۷ الی ۲۱</p>
                <p className="map-info__sub">جمعه : تایم عصر (متغیر در مناسبت ها)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
