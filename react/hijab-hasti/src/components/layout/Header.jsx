import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { COLLECTIONS, PRODUCT_CATEGORIES } from '../../data/siteData';
import { useScrollHeader } from '../../hooks/useScrollHeader';
import { useStoreBadges } from '../../hooks/useStoreBadges';
import { toPersianNumber } from '../../utils/priceUtils';
import SmartLink from '../SmartLink';

export default function Header({ onOpenSearch, onOpenDrawer, drawerOpen }) {
  const headerRef = useRef(null);
  const [megaOpen, setMegaOpen] = useState(false);
  const { cart, wish } = useStoreBadges();
  const location = useLocation();
  const onProfile = location.pathname === '/profile';
  const onWishlist = location.pathname === '/wishlist';
  const alwaysScrolled = location.pathname !== '/';
  useScrollHeader(headerRef, alwaysScrolled);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!e.target.closest('.nav__item--mega')) {
        setMegaOpen(false);
      }
    };

    const onEscape = (e) => {
      if (e.key === 'Escape') setMegaOpen(false);
    };

    document.addEventListener('click', onClickOutside);
    document.addEventListener('keydown', onEscape);

    return () => {
      document.removeEventListener('click', onClickOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, []);

  const toggleMega = (e) => {
    e.preventDefault();
    setMegaOpen((open) => !open);
  };

  return (
    <header className="header" id="siteHeader" ref={headerRef}>
      <div className="header__inner">
        <button
          className="header__hamburger"
          id="hamburgerBtn"
          aria-label="Open menu"
          aria-expanded={drawerOpen ? 'true' : 'false'}
          aria-controls="navDrawer"
          onClick={onOpenDrawer}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>

        <nav className="nav" aria-label="Primary">
          <ul className="nav__list">
            <li className="nav__item">
              <SmartLink href="/" className="nav__link">خانه</SmartLink>
            </li>
            <li className={`nav__item nav__item--mega${megaOpen ? ' nav__item--open' : ''}`}>
              <a
                href="/#products"
                className="nav__link"
                aria-haspopup="true"
                aria-expanded={megaOpen}
                onClick={toggleMega}
              >
                محصولات
                <svg className="nav__caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </a>
              <div className="mega">
                <div className="mega__col">
                  <h4>دسته بندی </h4>
                  {PRODUCT_CATEGORIES.map((item) => (
                    <SmartLink key={item.label} href={item.href} onClick={() => setMegaOpen(false)}>{item.label}</SmartLink>
                  ))}
                </div>
                <div className="mega__col">
                  <h4>کالکشن ها</h4>
                  {COLLECTIONS.map((item) => (
                    <SmartLink key={item.label} href={item.href} onClick={() => setMegaOpen(false)}>{item.label}</SmartLink>
                  ))}
                </div>
              </div>
            </li>
            <li className="nav__item">
              <SmartLink href="/#about" className="nav__link">درباره هستی</SmartLink>
            </li>
            <li className="nav__item">
              <SmartLink href="/#contact" className="nav__link">تماس با ما</SmartLink>
            </li>
          </ul>
        </nav>

        <div className="header__logo">
          <SmartLink href="/">
            <span className="header__logo-sub">
              <img src="/assets/logo2.png" alt="logo" className="header__logo-img" />
            </span>
          </SmartLink>
        </div>

        <div className="header__actions">
          <button
            className="icon-btn"
            id="searchOpenBtn"
            aria-label="Search"
            aria-haspopup="dialog"
            onClick={onOpenSearch}
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </button>
          <SmartLink
            href="/profile"
            className={`icon-btn${onProfile ? ' icon-btn--current' : ''}`}
            aria-label="Account"
            aria-current={onProfile ? 'page' : undefined}
            style={onProfile ? { color: 'var(--c-tan)' } : undefined}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c1.6-4 5-6 8-6s6.4 2 8 6" />
            </svg>
          </SmartLink>
          <SmartLink
            href="/wishlist"
            className={`icon-btn${onWishlist ? ' icon-btn--current' : ''}`}
            aria-label="Wishlist"
            id="headerWishlistLink"
            aria-current={onWishlist ? 'page' : undefined}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
            </svg>
            <span className="icon-btn__badge" id="wishlistBadge">{toPersianNumber(wish)}</span>
          </SmartLink>
          <button
            type="button"
            className="icon-btn"
            aria-label="سبد خرید به‌زودی فعال می‌شود"
            title="سبد خرید به‌زودی فعال می‌شود"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8h12l-1 12H7L6 8Z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            <span className="icon-btn__badge" id="cartBadge">{toPersianNumber(cart)}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
