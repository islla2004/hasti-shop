import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { currentPrice, getProductById, getRelatedProducts } from '../data/catalog';
import { addToCart, isWishlisted, toggleWishlist } from '../utils/storage';
import { formatPrice, toPersianNumber } from '../utils/priceUtils';
import SmartLink from '../components/SmartLink';
import NotFoundPage from './NotFoundPage';

const SEED_REVIEWS = {
  'abaya-janan': [{ name: 'زهرا.ر', rating: 5, comment: 'کیفیت پارچه فوق‌العاده بود، دقیقاً مثل عکس.', date: '۱۴۰۳/۰۶/۱۲' }],
  'abaya-aurora': [{ name: 'مریم.س', rating: 4, comment: 'رنگش خیلی خاصه، فقط ارسال کمی طول کشید.', date: '۱۴۰۳/۰۵/۲۰' }],
  'chador-negin-baran': [{ name: 'فاطمه.ک', rating: 5, comment: 'کارشده‌ها خیلی ظریف و شیک هستن.', date: '۱۴۰۳/۰۴/۰۲' }],
};

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3 6 6 .9-4.5 4.3 1 6.3-5.5-3-5.5 3 1-6.3L3 8.9 9 8z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
    </svg>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const product = getProductById(id);
  if (!product) return <NotFoundPage />;
  return <ProductDetails key={product.id} product={product} />;
}

function ProductDetails({ product }) {
  const related = useMemo(() => getRelatedProducts(product), [product]);

  const price = currentPrice(product);
  const [imgIndex, setImgIndex] = useState(0);
  const [size, setSize] = useState(product.sizes?.length === 1 ? product.sizes[0] : null);
  const [length, setLength] = useState(null);
  const [qty, setQty] = useState(1);
  const [hint, setHint] = useState('');
  const [toast, setToast] = useState('');
  const [wished, setWished] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [lbZoomed, setLbZoomed] = useState(false);
  const [lbPos, setLbPos] = useState({ x: 0, y: 0 });
  const [notifyMsg, setNotifyMsg] = useState({ text: '', ok: false });
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [zooming, setZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState('50% 50%');
  const toastTimer = useRef(null);
  const lbDrag = useRef(null);

  useEffect(() => {
    document.title = `${product.name} | هستی`;
    setImgIndex(0);
    setSize(product.sizes?.length === 1 ? product.sizes[0] : null);
    setLength(null);
    setQty(1);
    setHint('');
    setWished(isWishlisted(product.id));
    const key = `hasti_reviews_${product.id}`;
    let stored = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '[]');
      stored = Array.isArray(parsed) ? parsed : [];
    } catch {
      stored = [];
    }
    setReviews([...(SEED_REVIEWS[product.id] || []), ...stored]);
  }, [product]);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2600);
  };

  const onWish = () => {
    const added = toggleWishlist(product.id);
    setWished(added);
    showToast(added ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها حذف شد');
  };

  const onAddCart = () => {
    if (!size) { setHint('لطفاً ابتدا سایز را انتخاب کنید.'); return; }
    if (!length) { setHint('لطفاً ابتدا اندازه قد را انتخاب کنید.'); return; }
    setHint('');
    addToCart(qty);
    showToast('محصول به سبد خرید اضافه شد');
  };

  const onShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: product.name, text: `${product.name} - فروشگاه هستی`, url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => showToast('لینک محصول کپی شد'));
    }
  };

  const onNotify = (e) => {
    e.preventDefault();
    const email = e.target.pdpNotifyEmail.value.trim();
    const phone = e.target.pdpNotifyPhone.value.trim();
    if (!email && !phone) {
      setNotifyMsg({ text: 'لطفاً ایمیل یا شماره موبایل را وارد کنید.', ok: false });
      return;
    }
    const key = `hasti_notify_${product.id}`;
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.push({ email, phone, date: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(list));
    setNotifyMsg({ text: 'ثبت شد! به محض موجود شدن این محصول به شما اطلاع می‌دهیم.', ok: true });
    e.target.reset();
  };

  const onReview = (e) => {
    e.preventDefault();
    const name = e.target.pdpReviewName.value.trim();
    const text = e.target.pdpReviewText.value.trim();
    if (!name || !text || !rating) {
      showToast('لطفاً امتیاز، نام و نظر خود را کامل کنید');
      return;
    }
    const key = `hasti_reviews_${product.id}`;
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    const item = { name, rating, comment: text, date: new Intl.DateTimeFormat('fa-IR').format(new Date()) };
    stored.push(item);
    localStorage.setItem(key, JSON.stringify(stored));
    setReviews((prev) => [...prev, item]);
    showToast('سپاس از ثبت نظر شما');
    e.target.reset();
    setRating(0);
  };

  const ZOOM_SCALE = 2.4;
  const applyPan = (pos, stage) => {
    const maxX = (stage.clientWidth * (ZOOM_SCALE - 1)) / 2;
    const maxY = (stage.clientHeight * (ZOOM_SCALE - 1)) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, pos.x)),
      y: Math.max(-maxY, Math.min(maxY, pos.y)),
    };
  };

  return (
    <>
      <main id="main">
        <div className="pdp-topbar">
          <div className="container">
            <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: 0, justifyContent: 'flex-start' }}>
              <SmartLink href="/">خانه</SmartLink>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 6l-6 6 6 6" /></svg>
              <SmartLink href="/#products">محصولات</SmartLink>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 6l-6 6 6 6" /></svg>
              <span className="breadcrumb__current">{product.category}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 6l-6 6 6 6" /></svg>
              <span className="breadcrumb__current">{product.name}</span>
            </nav>
          </div>
        </div>

        <section className="pdp-main">
          <div className="container">
            <div className="pdp-grid">
              <div className="pdp-gallery fade-up">
                <div
                  className={`pdp-gallery__main${zooming ? ' pdp-gallery__main--zooming' : ''}`}
                  onMouseEnter={() => setZooming(true)}
                  onMouseLeave={() => setZooming(false)}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    setZoomPos(`${x}% ${y}%`);
                  }}
                  onClick={(e) => {
                    if (e.target.closest('.pdp-gallery__wish') || e.target.closest('.pdp-zoom-hint')) return;
                    setLightbox(true);
                    setLbZoomed(false);
                    setLbPos({ x: 0, y: 0 });
                  }}
                >
                  <span className="pdp-gallery__badge">{toPersianNumber(product.discount)}٪ تخفیف</span>
                  <button
                    className={`pdp-gallery__wish${wished ? ' pdp-gallery__wish--active' : ''}`}
                    aria-label="افزودن به علاقه‌مندی‌ها"
                    aria-pressed={wished}
                    type="button"
                    onClick={onWish}
                  >
                    <HeartIcon />
                  </button>
                  <img src={product.images[imgIndex]} alt={product.name} />
                  <div className="pdp-zoom-pane" style={{ backgroundImage: `url(${product.images[imgIndex]})`, backgroundPosition: zoomPos }} aria-hidden="true" />
                  <button className="pdp-zoom-hint" type="button" aria-label="بزرگ‌نمایی تصویر محصول" onClick={() => setLightbox(true)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="7" />
                      <path d="M11 8v6M8 11h6" />
                      <path d="M21 21l-4.3-4.3" />
                    </svg>
                    <span>بزرگ‌نمایی</span>
                  </button>
                </div>
                <div className="pdp-gallery__thumbs">
                  {product.images.map((src, i) => (
                    <button
                      key={src + i}
                      type="button"
                      className={`pdp-gallery__thumb${i === imgIndex ? ' pdp-gallery__thumb--active' : ''}`}
                      onClick={() => setImgIndex(i)}
                    >
                      <img src={src} alt={`${product.name} ${i + 1}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pdp-info fade-up">
                <span className="pdp-category">{product.category}</span>
                <h1 className="pdp-title">{product.name}</h1>
                <span className="pdp-code">کد کالا: {product.code}</span>
                <div className="pdp-price-row">
                  <span className="pdp-price-old">{toPersianNumber(formatPrice(product.oldPrice))} تومان</span>
                  <span className="pdp-price-current">{toPersianNumber(formatPrice(price))} تومان</span>
                  {product.inStock ? <span className="pdp-discount-badge">{toPersianNumber(product.discount)}٪ تخفیف</span> : null}
                </div>
                <div className="pdp-fabric">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V4Z" />
                    <path d="M8 12v8M16 12v8" />
                  </svg>
                  جنس پارچه: <strong>{product.fabric}</strong>
                </div>
                <p className="pdp-desc">{product.desc}</p>

                {product.inStock ? (
                  <div>
                    <div className="pdp-option-group">
                      <div className="pdp-option-label">
                        <span>سایز</span>
                        <span className="pdp-option-selected">{size || 'انتخاب کنید'}</span>
                      </div>
                      <div className="pdp-option-values">
                        {product.sizes.map((s) => (
                          <button key={s} type="button" className={`pdp-chip${size === s ? ' pdp-chip--active' : ''}`} onClick={() => { setSize(s); setHint(''); }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="pdp-option-group">
                      <div className="pdp-option-label">
                        <span>اندازه قد (سانتی‌متر)</span>
                        <span className="pdp-option-selected">{length ? `${toPersianNumber(length)} سانتی‌متر` : 'انتخاب کنید'}</span>
                      </div>
                      <div className="pdp-option-values">
                        {product.lengths.map((len) => (
                          <button key={len} type="button" className={`pdp-chip${length === len ? ' pdp-chip--active' : ''}`} onClick={() => { setLength(len); setHint(''); }}>
                            {toPersianNumber(len)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="pdp-option-group">
                      <div className="pdp-option-label"><span>تعداد</span></div>
                      <div className="pdp-qty">
                        <button className="pdp-qty__btn" type="button" aria-label="کاهش تعداد" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                        <span className="pdp-qty__value">{toPersianNumber(qty)}</span>
                        <button className="pdp-qty__btn" type="button" aria-label="افزایش تعداد" onClick={() => setQty((q) => Math.min(10, q + 1))}>+</button>
                      </div>
                    </div>
                    <p className="pdp-hint" role="alert">{hint}</p>
                    <div className="pdp-actions">
                      <button className="pdp-add-cart" type="button" onClick={onAddCart}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 8h12l-1 12H7L6 8Z" />
                          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                        </svg>
                        افزودن به سبد خرید
                      </button>
                      <div className="pdp-secondary-actions">
                        <button className={`pdp-secondary-btn${wished ? ' pdp-secondary-btn--active' : ''}`} type="button" aria-pressed={wished} onClick={onWish}>
                          <HeartIcon />
                          <span>{wished ? 'در علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی'}</span>
                        </button>
                        <button className="pdp-secondary-btn" type="button" onClick={onShare}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
                          </svg>
                          اشتراک‌گذاری
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pdp-outofstock">
                    <p className="pdp-outofstock__title">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 8v5M12 16h.01" />
                      </svg>
                      این محصول در حال حاضر ناموجود است
                    </p>
                    <p className="pdp-outofstock__text">
                      نگران نباشید! ایمیل یا شماره موبایل خود را وارد کنید تا به محض موجود شدن این محصول، از طریق پیامک یا ایمیل به شما اطلاع‌رسانی کنیم.
                    </p>
                    <form className="pdp-notify-form" onSubmit={onNotify}>
                      <div className="pdp-notify-row">
                        <input type="email" className="pdp-notify-input" name="pdpNotifyEmail" placeholder="ایمیل شما" />
                        <input type="tel" className="pdp-notify-input" name="pdpNotifyPhone" placeholder="شماره موبایل" />
                      </div>
                      <button type="submit" className="pdp-notify-submit">اطلاع بده وقتی موجود شد</button>
                      <p className="pdp-notify-msg" role="status" style={{ color: notifyMsg.ok ? '#2f7a4f' : '#a8503f' }}>{notifyMsg.text}</p>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="pdp-details">
          <div className="container">
            <div className="pdp-details-grid">
              <div className="pdp-panel fade-up">
                <h3 className="pdp-panel__title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V4Z" />
                    <path d="M8 12v8M16 12v8" />
                  </svg>
                  نحوه شست‌وشو و نگهداری
                </h3>
                <ul className="pdp-list">
                  {product.care.map((item) => (
                    <li key={item}><CheckIcon /><span>{item}</span></li>
                  ))}
                </ul>
              </div>
              <div className="pdp-panel fade-up">
                <h3 className="pdp-panel__title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                  ویژگی‌های محصول
                </h3>
                <ul className="pdp-list">
                  {product.features.map((item) => (
                    <li key={item}><CheckIcon /><span>{item}</span></li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pdp-reviews">
              <div className="pdp-reviews__head fade-up">
                <h2 className="pdp-reviews__title">نظرات مشتریان</h2>
                <p className="section-heading__desc" style={{ margin: '0 auto' }}>تجربه خرید خود از این محصول را با دیگران به اشتراک بگذارید</p>
              </div>
              <div className="pdp-reviews__grid">
                <form className="pdp-review-form fade-up" onSubmit={onReview}>
                  <h3>ثبت نظر شما</h3>
                  <div className="pdp-stars" role="radiogroup" aria-label="امتیاز">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button key={value} type="button" data-value={value} aria-label={`${value} ستاره`} className={value <= rating ? 'pdp-star--active' : ''} onClick={() => setRating(value)}>
                        <StarIcon />
                      </button>
                    ))}
                  </div>
                  <label htmlFor="pdpReviewName" className="visually-hidden">نام شما</label>
                  <input type="text" id="pdpReviewName" name="pdpReviewName" placeholder="نام شما" required />
                  <label htmlFor="pdpReviewText" className="visually-hidden">نظر شما</label>
                  <textarea id="pdpReviewText" name="pdpReviewText" placeholder="نظر خود را درباره این محصول بنویسید…" required />
                  <button type="submit" className="pdp-review-submit">ثبت نظر</button>
                </form>
                <div className="pdp-review-list">
                  {!reviews.length ? (
                    <p className="pdp-review-empty">هنوز نظری برای این محصول ثبت نشده. اولین نفر باشید!</p>
                  ) : (
                    [...reviews].reverse().map((r, i) => (
                      <div className="pdp-review-item" key={`${r.name}-${i}`}>
                        <div className="pdp-review-item__top">
                          <span className="pdp-review-item__name">{r.name}</span>
                          <span className="pdp-review-item__date">{r.date}</span>
                        </div>
                        <div className="pdp-review-item__stars">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <span key={s} style={{ opacity: s < r.rating ? 1 : 0.25 }}><StarIcon /></span>
                          ))}
                        </div>
                        <p className="pdp-review-item__text">{r.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pdp-related">
          <div className="container">
            <div className="section-heading fade-up">
              <span className="eyebrow" style={{ color: 'var(--c-brown)' }}>همین دسته‌بندی</span>
              <h2 className="section-heading__title" style={{ color: 'var(--c-jet)' }}>محصولات مرتبط با {product.category}</h2>
            </div>
            <div className="pdp-related__grid stagger">
              {related.map((p, i) => (
                <Link key={p.id} to={`/product/${p.id}`} className="pdp-product-card fade-up" style={{ '--i': i }}>
                  <img className="pdp-product-card__img" src={p.images[0]} alt={p.name} loading="lazy" />
                  <div className="pdp-product-card__body">
                    <p className="pdp-product-card__name">{p.name}</p>
                    <div className="pdp-product-card__prices">
                      <span className="pdp-product-card__price-old">{toPersianNumber(formatPrice(p.oldPrice))}</span>
                      <span className="pdp-product-card__price-current">{toPersianNumber(formatPrice(currentPrice(p)))} تومان</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <div className={`pdp-toast${toast ? ' pdp-toast--show' : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
        <span>{toast}</span>
      </div>

      <div className={`pdp-lightbox${lightbox ? ' pdp-lightbox--open' : ''}`} role="dialog" aria-modal="true" aria-label="بزرگ‌نمایی تصویر محصول" onClick={(e) => { if (e.target === e.currentTarget) setLightbox(false); }}>
        <button className="pdp-lightbox__close" type="button" aria-label="بستن" onClick={() => setLightbox(false)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
        <button className="pdp-lightbox__nav pdp-lightbox__nav--prev" type="button" aria-label="تصویر قبلی" onClick={() => setImgIndex((i) => (i - 1 + product.images.length) % product.images.length)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <button className="pdp-lightbox__nav pdp-lightbox__nav--next" type="button" aria-label="تصویر بعدی" onClick={() => setImgIndex((i) => (i + 1) % product.images.length)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
        </button>
        <div
          className={`pdp-lightbox__stage${lbZoomed ? ' pdp-lightbox__stage--zoomed' : ''}${lbDrag.current ? ' pdp-lightbox__stage--dragging' : ''}`}
          onMouseDown={(e) => {
            if (!lbZoomed) return;
            e.preventDefault();
            lbDrag.current = { startX: e.clientX, startY: e.clientY, baseX: lbPos.x, baseY: lbPos.y, moved: false };
          }}
          onMouseMove={(e) => {
            if (!lbDrag.current) return;
            const dx = e.clientX - lbDrag.current.startX;
            const dy = e.clientY - lbDrag.current.startY;
            if (Math.abs(dx) > 4 || Math.abs(dy) > 4) lbDrag.current.moved = true;
            setLbPos(applyPan({ x: lbDrag.current.baseX + dx, y: lbDrag.current.baseY + dy }, e.currentTarget));
          }}
          onMouseUp={() => { setTimeout(() => { lbDrag.current = null; }, 0); }}
        >
          <img
            src={product.images[imgIndex]}
            alt={product.name}
            draggable="false"
            style={{ transform: `translate(calc(-50% + ${lbPos.x}px), calc(-50% + ${lbPos.y}px)) scale(${lbZoomed ? ZOOM_SCALE : 1})` }}
            onClick={(e) => {
              if (lbDrag.current?.moved) return;
              if (!lbZoomed) {
                const rect = e.currentTarget.getBoundingClientRect();
                const offsetX = (e.clientX - (rect.left + rect.width / 2)) * -1 * (ZOOM_SCALE - 1);
                const offsetY = (e.clientY - (rect.top + rect.height / 2)) * -1 * (ZOOM_SCALE - 1);
                setLbZoomed(true);
                setLbPos(applyPan({ x: offsetX, y: offsetY }, e.currentTarget.parentElement));
              } else {
                setLbZoomed(false);
                setLbPos({ x: 0, y: 0 });
              }
            }}
          />
        </div>
        <p className="pdp-lightbox__hint">{lbZoomed ? 'برای بازگشت دوباره کلیک کنید' : 'برای بزرگ‌نمایی کلیک کنید — با انگشت جابه‌جا کنید'}</p>
      </div>
    </>
  );
}
