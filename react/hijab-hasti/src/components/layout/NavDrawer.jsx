import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { COLLECTIONS, PRODUCT_CATEGORIES, SOCIAL_LINKS } from '../../data/siteData';
import { SocialIcon } from '../icons/SocialIcons';
import SmartLink from '../SmartLink';

function DrawerSubmenu({ title, items, id, onClose }) {
  const [open, setOpen] = useState(false);

  return (
    <li className={`nav-drawer__item${open ? ' nav-drawer__item--open' : ''}`} id={id}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {title}
        <svg className="nav__caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div className="nav-drawer__sub">
        {items.map((item) => (
          <SmartLink key={item.label} href={item.href} onClick={onClose}>{item.label}</SmartLink>
        ))}
      </div>
    </li>
  );
}

export default function NavDrawer({ isOpen, onClose }) {
  const onProfile = useLocation().pathname === '/profile';

  return (
    <div className={`nav-drawer${isOpen ? ' nav-drawer--open' : ''}`} id="navDrawer">
      <div className="nav-drawer__overlay" id="navDrawerOverlay" onClick={onClose} />
      <div className="nav-drawer__panel" role="dialog" aria-modal="true" aria-label="Menu">
        <button className="nav-drawer__close" id="navDrawerClose" aria-label="Close menu" onClick={onClose} type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <ul className="nav-drawer__list">
          <li><SmartLink href="/" onClick={onClose}>خانه</SmartLink></li>
          <DrawerSubmenu title="محصولات" items={PRODUCT_CATEGORIES} id="drawerShopItem" onClose={onClose} />
          <DrawerSubmenu title="کالکشن ها" items={COLLECTIONS} id="drawerCollectionsItem" onClose={onClose} />
          <li><SmartLink href="/#about" onClick={onClose}>درباره هستی</SmartLink></li>
          <li><SmartLink href="/#contact" onClick={onClose}>تماس با ما</SmartLink></li>
          <li><SmartLink href="/wishlist" onClick={onClose}>علاقه‌مندی‌ها</SmartLink></li>
          <li>
            <SmartLink
              href="/profile"
              onClick={onClose}
              style={onProfile ? { color: 'var(--c-tan)' } : undefined}
            >
              حساب کاربری
            </SmartLink>
          </li>
        </ul>

        <div className="nav-drawer__social">
          {SOCIAL_LINKS.map((link) => (
            <a key={link.id} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label}>
              <SocialIcon type={link.id} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
