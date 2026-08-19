import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import SmartLink from '../components/SmartLink';

export default function InstallmentTermsPage() {
  const [open, setOpen] = useState(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    document.title = 'شرایط خرید قسطی و دو مرحله‌ای | هستی';
  }, []);

  useLayoutEffect(() => {
    itemRefs.current.forEach((item, i) => {
      if (!item) return;
      const answer = item.querySelector('.faq__a');
      if (!answer) return;
      answer.style.maxHeight = open === i ? `${answer.scrollHeight}px` : null;
    });
  }, [open]);

  return (
    <main id="main">
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <SmartLink href="/">خانه</SmartLink>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
            <span className="breadcrumb__current">شرایط خرید قسطی و دو مرحله‌ای</span>
          </nav>
          <span className="page-hero__eyebrow fade-up">پرداخت آسان هستی</span>
          <h1 className="page-hero__title fade-up">شرایط و نحوه خرید قسطی و دو مرحله‌ای</h1>
          <p className="page-hero__desc fade-up">
            خرید محصولات موردعلاقه‌تان را ساده‌تر کرده‌ایم. در این صفحه، همه‌چیز درباره نحوه فعال‌سازی،
            شرایط و مراحل پرداخت دو مرحله‌ای و قسطی را شفاف و کامل توضیح داده‌ایم.
          </p>
        </div>
      </section>

      <section className="terms-section" id="overview">
        <div className="container">
          <div className="section-heading fade-up">
            <span className="eyebrow">آشنایی کلی</span>
            <h2 className="section-heading__title">چرا خرید قسطی هستی؟</h2>
          </div>
          <p className="terms-intro__text fade-up">
            فروشگاه هستی با هدف تسهیل خرید بانوان عزیز، امکان پرداخت هزینه سفارش را در دو مرحله یا به‌صورت
            قسطی فراهم کرده است. این خدمت بدون نیاز به ضامن، بدون کارمزد پنهان و با فرآیندی ساده و شفاف
            در اختیار مشتریان قرار می‌گیرد تا خرید از هستی، تجربه‌ای راحت‌تر و بدون دغدغه باشد.
          </p>

          <div className="highlight-strip stagger">
            <div className="highlight-chip fade-up" style={{ '--i': 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="9" />
              </svg>
              بدون نیاز به ضامن
            </div>
            <div className="highlight-chip fade-up" style={{ '--i': 1 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
              پردازش سریع درخواست
            </div>
            <div className="highlight-chip fade-up" style={{ '--i': 2 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3 6 6 .9-4.5 4.3 1 6.3-5.5-3-5.5 3 1-6.3L3 8.9 9 8z" />
              </svg>
              بدون کارمزد پنهان
            </div>
            <div className="highlight-chip fade-up" style={{ '--i': 3 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <path d="M7 11V8a5 5 0 0 1 10 0v3" />
              </svg>
              پرداخت امن و مطمئن
            </div>
          </div>
        </div>
      </section>

      <section className="terms-section terms-section--alt" id="methods">
        <div className="container">
          <div className="section-heading fade-up">
            <span className="eyebrow">دو مسیر پرداخت</span>
            <h2 className="section-heading__title">روش پرداخت خود را انتخاب کنید</h2>
            <p className="section-heading__desc">
              متناسب با نیاز خود، یکی از دو روش زیر را در مرحله تسویه‌حساب انتخاب کنید.
            </p>
          </div>

          <div className="method-grid stagger">
            <article className="method-card fade-up" style={{ '--i': 0 }}>
              <div className="method-card__top">
                <div className="method-card__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12h16M4 12l4-4M4 12l4 4M20 12l-4-4M20 12l-4 4" />
                  </svg>
                </div>
                <h3 className="method-card__title">پرداخت دو مرحله‌ای</h3>
              </div>
              <p className="method-card__desc">
                مناسب برای خریدهایی که می‌خواهید هزینه آن را در دو نوبت نزدیک به هم تسویه کنید؛
                بدون فرآیند اعتبارسنجی طولانی.
              </p>
              <ul className="method-card__list">
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  پرداخت ۵۰٪ مبلغ سفارش در زمان ثبت خرید
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  تسویه ۵۰٪ باقی‌مانده حداکثر تا ۱۵ روز پس از تحویل
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  بدون کارمزد یا افزایش قیمت نسبت به خرید نقدی
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  امکان پرداخت مرحله دوم از طریق لینک واتساپ یا درگاه آنلاین
                </li>
              </ul>
            </article>

            <article className="method-card method-card--featured fade-up" style={{ '--i': 1 }}>
              <div className="method-card__top">
                <div className="method-card__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2.5" y="5.5" width="19" height="14" rx="2.5" />
                    <path d="M2.5 10h19" />
                    <path d="M6 15h4" />
                  </svg>
                </div>
                <h3 className="method-card__title">خرید قسطی</h3>
              </div>
              <p className="method-card__desc">
                گزینه مناسب برای خریدهای با مبلغ بالاتر؛ هزینه سفارش را در چند قسط ماهانه و بدون
                فشار مالی پرداخت کنید.
              </p>
              <ul className="method-card__list">
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  امکان تقسیط در ۲ تا ۴ قسط ماهانه
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  پیش‌پرداخت اولیه از ۳۰٪ مبلغ سفارش
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  تعیین تاریخ اقساط با هماهنگی پشتیبانی هستی
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  ارسال یادآوری قبل از سررسید هر قسط
                </li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="terms-section" id="steps">
        <div className="container">
          <div className="section-heading fade-up">
            <span className="eyebrow">مسیر خرید</span>
            <h2 className="section-heading__title">خرید قسطی در ۴ گام ساده</h2>
          </div>

          <div className="steps stagger">
            <div className="step fade-up" style={{ '--i': 0 }}>
              <span className="step__num">۱</span>
              <div>
                <h3 className="step__title">انتخاب محصول</h3>
                <p className="step__text">محصول موردنظر خود را از کالکشن‌های هستی انتخاب و به سبد خرید اضافه کنید.</p>
              </div>
            </div>
            <div className="step fade-up" style={{ '--i': 1 }}>
              <span className="step__num">۲</span>
              <div>
                <h3 className="step__title">انتخاب روش پرداخت</h3>
                <p className="step__text">در مرحله تسویه‌حساب، گزینه «پرداخت دو مرحله‌ای» یا «خرید قسطی» را انتخاب کنید.</p>
              </div>
            </div>
            <div className="step fade-up" style={{ '--i': 2 }}>
              <span className="step__num">۳</span>
              <div>
                <h3 className="step__title">هماهنگی با پشتیبانی</h3>
                <p className="step__text">همکاران ما از طریق تماس یا واتساپ، جزئیات و زمان‌بندی پرداخت را با شما هماهنگ می‌کنند.</p>
              </div>
            </div>
            <div className="step fade-up" style={{ '--i': 3 }}>
              <span className="step__num">۴</span>
              <div>
                <h3 className="step__title">تحویل و تسویه نهایی</h3>
                <p className="step__text">پس از پرداخت پیش‌پرداخت، سفارش شما ارسال شده و مابقی طبق زمان‌بندی تسویه می‌شود.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="terms-section terms-section--alt" id="requirements">
        <div className="container">
          <div className="section-heading fade-up">
            <span className="eyebrow">شرایط لازم</span>
            <h2 className="section-heading__title">مدارک و شرایط استفاده</h2>
          </div>

          <div className="req-grid stagger">
            <div className="req-card fade-up" style={{ '--i': 0 }}>
              <div className="req-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <circle cx="9" cy="10" r="2" />
                  <path d="M6 16c.5-2 2-3 3-3s2.5 1 3 3" />
                  <path d="M14 9h4M14 13h4" />
                </svg>
              </div>
              <h3 className="req-card__title">مدرک شناسایی معتبر</h3>
              <p className="req-card__text">کارت ملی یا شناسنامه برای تایید هویت خریدار</p>
            </div>
            <div className="req-card fade-up" style={{ '--i': 1 }}>
              <div className="req-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" />
                  <path d="M9 18h6" />
                </svg>
              </div>
              <h3 className="req-card__title">شماره تماس فعال</h3>
              <p className="req-card__text">جهت هماهنگی زمان‌بندی و ارسال یادآوری اقساط</p>
            </div>
            <div className="req-card fade-up" style={{ '--i': 2 }}>
              <div className="req-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2.5" y="5.5" width="19" height="14" rx="2.5" />
                  <path d="M2.5 10h19" />
                </svg>
              </div>
              <h3 className="req-card__title">حداقل مبلغ سفارش</h3>
              <p className="req-card__text">سفارش‌های بالای ۳ میلیون تومان مشمول این خدمت هستند</p>
            </div>
            <div className="req-card fade-up" style={{ '--i': 3 }}>
              <div className="req-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4Z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <h3 className="req-card__title">تعهد بازپرداخت</h3>
              <p className="req-card__text">پایبندی به زمان‌بندی توافق‌شده برای پرداخت اقساط</p>
            </div>
          </div>
        </div>
      </section>

      <section className="terms-section" id="faq">
        <div className="container">
          <div className="section-heading fade-up">
            <span className="eyebrow">سوالات متداول</span>
            <h2 className="section-heading__title">پاسخ به پرسش‌های شما</h2>
          </div>

          <div className="faq">
            <div
              className={`faq__item${open === 0 ? ' faq__item--open' : ''}`}
              ref={(el) => { itemRefs.current[0] = el; }}
            >
              <button
                className="faq__q"
                aria-expanded={open === 0}
                type="button"
                onClick={() => setOpen((current) => (current === 0 ? null : 0))}
              >
                <span>آیا خرید قسطی شامل کارمزد یا افزایش قیمت می‌شود؟</span>
                <svg className="faq__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
              <div className="faq__a">
                <p className="faq__a-inner">
                  خیر. قیمت محصولات در روش پرداخت دو مرحله‌ای و قسطی دقیقاً برابر با قیمت خرید نقدی است
                  و هیچ کارمزد پنهانی از مشتریان دریافت نمی‌شود.
                </p>
              </div>
            </div>
            <div
              className={`faq__item${open === 1 ? ' faq__item--open' : ''}`}
              ref={(el) => { itemRefs.current[1] = el; }}
            >
              <button
                className="faq__q"
                aria-expanded={open === 1}
                type="button"
                onClick={() => setOpen((current) => (current === 1 ? null : 1))}
              >
                <span>محصول را چه زمانی دریافت می‌کنم؟</span>
                <svg className="faq__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
              <div className="faq__a">
                <p className="faq__a-inner">
                  پس از پرداخت پیش‌پرداخت (مرحله اول یا اولین قسط)، سفارش شما طبق زمان ارسال معمول
                  فروشگاه هستی بسته‌بندی و ارسال می‌شود.
                </p>
              </div>
            </div>
            <div
              className={`faq__item${open === 2 ? ' faq__item--open' : ''}`}
              ref={(el) => { itemRefs.current[2] = el; }}
            >
              <button
                className="faq__q"
                aria-expanded={open === 2}
                type="button"
                onClick={() => setOpen((current) => (current === 2 ? null : 2))}
              >
                <span>در صورت تاخیر در پرداخت قسط چه اتفاقی می‌افتد؟</span>
                <svg className="faq__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
              <div className="faq__a">
                <p className="faq__a-inner">
                  در صورت بروز تاخیر، کافی است پیش از موعد با پشتیبانی هستی از طریق واتساپ یا تماس تلفنی
                  هماهنگ کنید تا زمان‌بندی جدیدی برای شما در نظر گرفته شود.
                </p>
              </div>
            </div>
            <div
              className={`faq__item${open === 3 ? ' faq__item--open' : ''}`}
              ref={(el) => { itemRefs.current[3] = el; }}
            >
              <button
                className="faq__q"
                aria-expanded={open === 3}
                type="button"
                onClick={() => setOpen((current) => (current === 3 ? null : 3))}
              >
                <span>چگونه می‌توانم خرید قسطی را فعال کنم؟</span>
                <svg className="faq__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
              <div className="faq__a">
                <p className="faq__a-inner">
                  کافی است هنگام ثبت سفارش یا از طریق تماس/واتساپ با پشتیبانی هستی، درخواست خود را
                  اعلام کنید تا همکاران ما مراحل بعدی را برایتان انجام دهند.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="container">
          <span className="cta-banner__eyebrow">همراه شما در هر قدم</span>
          <h2 className="cta-banner__title">سوالی دارید یا می‌خواهید خرید قسطی را فعال کنید؟</h2>
          <p className="cta-banner__desc">
            همکاران ما در فروشگاه هستی آماده پاسخگویی و راهنمایی شما برای فعال‌سازی خرید قسطی
            و دو مرحله‌ای هستند.
          </p>
          <div className="cta-banner__actions">
            <a href="https://wa.me/989152500553" target="_blank" rel="noreferrer" className="btn btn--dark-solid">
              گفتگو در واتساپ
            </a>
            <SmartLink href="/" className="btn btn--dark-outline">
              بازگشت به فروشگاه
            </SmartLink>
          </div>
          <p className="cta-banner__phone" style={{ marginTop: 22, justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
            </svg>
            09152500553
          </p>
        </div>
      </section>
    </main>
  );
}
