import SmartLink from '../SmartLink';

export default function CollectionBanner() {
  return (
    <section className="collection-banner" id="gallery">
      <div className="collection-banner__inner">
        <div className="collection-banner__media fade-up">
          <span className="collection-banner__accent collection-banner__accent--top" aria-hidden="true" />
          <span className="collection-banner__accent collection-banner__accent--bottom" aria-hidden="true" />

          <div className="collection-banner__frame">
            <span className="collection-banner__corner collection-banner__corner--tl" aria-hidden="true" />
            <span className="collection-banner__corner collection-banner__corner--tr" aria-hidden="true" />
            <span className="collection-banner__corner collection-banner__corner--bl" aria-hidden="true" />
            <span className="collection-banner__corner collection-banner__corner--br" aria-hidden="true" />

            <div className="collection-banner__frame-inner">
              <img src="/assets/mazon.webp" alt="کالکشن هستی" loading="lazy" />
            </div>

            <span className="collection-banner__tag">کالکشن ۱۴۰۰</span>
          </div>
        </div>

        <div className="collection-banner__content fade-up">
          <h2 className="collection-banner__title"> برند هستی | 1400</h2>
          <p className="collection-banner__desc">
            سفر ما با عشق به زیبایی و احترام به حجاب آغاز شد.
            امروز با افتخار می‌توانیم بگوییم که هزاران بانو در سراسر
            ایران و جهان، هستی را انتخاب کرده‌اند.

            ما باور داریم که هر بانویی شایسته بهترین‌هاست.
            به همین دلیل، هر محصول را با دقت، عشق و تعهد به کیفیت تولید می‌کنیم.
          </p>

          <div className="finance-promo fade-up">
            <div className="finance-promo__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2.5" y="5.5" width="19" height="14" rx="2.5" />
                <path d="M2.5 10h19" />
                <path d="M6 15h4" />
              </svg>
            </div>
            <div className="finance-promo__body">
              <span className="finance-promo__badge">امکان جدید</span>
              <h3 className="finance-promo__title">خرید قسطی و دو مرحله‌ای</h3>
              <p className="finance-promo__text">
                همین حالا محصول مورد علاقه‌تان را انتخاب کنید و بدون فشار مالی، هزینه آن را در دو مرحله
                یا به‌صورت قسطی، ساده و مطمئن پرداخت نمایید.
              </p>
              <SmartLink href="/installment-terms" className="finance-promo__cta">
                <span>مشاهده شرایط و نحوه خرید</span>
                <svg className="finance-promo__cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </SmartLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
