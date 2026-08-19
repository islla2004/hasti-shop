import { useState } from 'react';
import { FOOTER_CATEGORIES, FOOTER_QUICK_LINKS, SOCIAL_LINKS } from '../../data/siteData';
import { SocialIcon } from '../icons/SocialIcons';
import SmartLink from '../SmartLink';

export default function Footer() {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('ثبت شد — از همراهی شما سپاسگزاریم.');
    e.currentTarget.reset();
  };

  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__col">
            <div className="footer__logo">
              <img src="/assets/logo.png" alt="هستی" className="footer__logo-img" />
            </div>
            <p className="footer__about-desc">ما را در شبکه های اجتماعی دنبال کنید.</p>
            <div className="footer__social">
              {SOCIAL_LINKS.map((link) => (
                <a key={link.id} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label}>
                  <SocialIcon type={link.id} />
                </a>
              ))}
            </div>
          </div>

          <div className="footer__col">
            <h3 className="footer__heading">دسترسی سریع</h3>
            <ul className="footer__links">
              {FOOTER_QUICK_LINKS.map((link) => (
                <li key={link.label}><SmartLink href={link.href}>{link.label}</SmartLink></li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h3 className="footer__heading">دسته‌بندی‌ها</h3>
            <ul className="footer__links">
              {FOOTER_CATEGORIES.map((link) => (
                <li key={link.label}><SmartLink href={link.href}>{link.label}</SmartLink></li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h3 className="footer__heading">اطلاع از جدیدترین اخبار و محصولات هستی</h3>
            <form className="footer__form" id="newsletterForm" onSubmit={handleSubmit}>
              <label htmlFor="newsletterEmail" className="visually-hidden">آدرس ایمیل</label>
              <input
                type="email"
                id="newsletterEmail"
                className="footer__input"
                placeholder="ایمیل خود را وارد کنید"
                required
              />
              <button type="submit" className="footer__submit" aria-label="ثبت ایمیل">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            </form>
            <p className="footer__form-msg" id="newsletterMsg" role="status">{message}</p>
            <div style={{ marginTop: 20 }}>
              <img src="/assets/e-namad.jpg" alt="نماد اعتماد الکترونیکی" style={{ maxWidth: 120, height: 'auto' }} />
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} حجاب هستی. تمامی حقوق محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
}
