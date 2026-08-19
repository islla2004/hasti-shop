import SmartLink from '../SmartLink';

function EyebrowDot() {
  return (
    <svg width="6" height="6" style={{ display: 'inline-block', margin: '0 8px' }}>
      <circle cx="3" cy="3" r="2.5" fill="currentColor" />
    </svg>
  );
}

export default function BeautyBanner() {
  return (
    <section className="beauty-banner" id="about">
      <div className="container">
        <div className="fade-up">
          <span className="eyebrow">
            <EyebrowDot />
            <EyebrowDot />
            <EyebrowDot />
            امضای اصالت
            <EyebrowDot />
            <EyebrowDot />
            <EyebrowDot />
          </span>
          <h2 className="beauty-banner__title">لوکس، ماندگار، متفاوت</h2>
          <SmartLink href="/#collections" className="btn btn--solid-light">
            مشاهده کالکشن ها
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }}
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </SmartLink>
        </div>
      </div>
    </section>
  );
}
