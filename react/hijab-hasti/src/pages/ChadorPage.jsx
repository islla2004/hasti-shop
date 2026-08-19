import { useEffect, useMemo, useState } from 'react';
import { CHADOR_PRODUCTS, FABRIC_OPTIONS, LENGTH_OPTIONS, currentPrice } from '../data/catalog';
import { getWishlist, toggleWishlist } from '../utils/storage';
import { formatPrice, toPersianNumber } from '../utils/priceUtils';
import SmartLink from '../components/SmartLink';
import '../styles/chador-shop.css';

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
    </svg>
  );
}

function ViewIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function SortNewestIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v13M12 15l4-4M12 15l-4-4" />
      <path d="M5 20h14" />
    </svg>
  );
}

function SortCheapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v13M12 15l-4-4M12 15l4-4" />
      <path d="M5 20h14" />
    </svg>
  );
}

function SortExpensiveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v13M12 15l4-4M12 15l-4-4" />
      <path d="M5 20h14" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

function LengthIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20V10M12 10L6 4M12 10l6-6" />
    </svg>
  );
}

function FabricIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V4Z" />
      <path d="M8 12v8M16 12v8" />
    </svg>
  );
}

function SearchEmptyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

const SORT_OPTIONS = [
  { id: 'newest', label: 'جدیدترین', Icon: SortNewestIcon },
  { id: 'cheapest', label: 'ارزان‌ترین', Icon: SortCheapIcon },
  { id: 'expensive', label: 'گران‌ترین', Icon: SortExpensiveIcon },
  { id: 'popular', label: 'پربازدیدترین', Icon: ViewIcon },
];

export default function ChadorPage() {
  const [sort, setSort] = useState('newest');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [lengths, setLengths] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [wishTick, setWishTick] = useState(0);
  const [toast, setToast] = useState('');

  useEffect(() => {
    document.title = 'چادر | فروشگاه هستی';
    document.documentElement.classList.add('page-chador');
    document.body.classList.add('page-chador');
    return () => {
      document.documentElement.classList.remove('page-chador');
      document.body.classList.remove('page-chador');
    };
  }, []);

  const toggleArr = (arr, val) => (arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const list = useMemo(() => {
    const filtered = CHADOR_PRODUCTS.filter((p) => {
      if (availableOnly && !p.inStock) return false;
      if (lengths.length && !lengths.includes(p.length)) return false;
      if (fabrics.length && !fabrics.includes(p.fabric)) return false;
      return true;
    }).map((p) => ({ ...p, currentPrice: currentPrice(p) }));

    filtered.sort((a, b) => {
      if (sort === 'cheapest') return a.currentPrice - b.currentPrice;
      if (sort === 'expensive') return b.currentPrice - a.currentPrice;
      if (sort === 'popular') return b.views - a.views;
      return b.dateIndex - a.dateIndex;
    });
    return filtered;
  }, [sort, availableOnly, lengths, fabrics]);

  const filterCount = lengths.length + fabrics.length + (availableOnly ? 1 : 0);
  const wishlist = getWishlist();

  const resetFilters = () => {
    setLengths([]);
    setFabrics([]);
    setAvailableOnly(false);
  };

  const onWish = (id) => {
    const added = toggleWishlist(id);
    setWishTick((n) => n + 1);
    setToast(added ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها حذف شد');
    setTimeout(() => setToast(''), 2400);
  };

  useEffect(() => {
    void wishTick;
  }, [wishTick]);

  const countFor = (predicate) => CHADOR_PRODUCTS.filter(predicate).length;

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
              <span className="breadcrumb__current">چادر</span>
            </nav>
          </div>
        </div>

        <section className="shop-section">
          <div className="container">
            <div className="shop-toolbar fade-up">
              <div className="shop-toolbar__sorts" role="group" aria-label="مرتب‌سازی محصولات">
                {SORT_OPTIONS.map((item) => (
                  <button
                    key={item.id}
                    className={`shop-sort-chip${sort === item.id ? ' shop-sort-chip--active' : ''}`}
                    type="button"
                    onClick={() => setSort(item.id)}
                  >
                    <item.Icon />
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="shop-toolbar__meta">
                <p className="shop-count"><strong>{toPersianNumber(list.length)}</strong> محصول</p>
                <div className="shop-toolbar__right">
                  <label className="shop-switch">
                    <input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} />
                    <span className="shop-switch__track" aria-hidden="true" />
                    فقط کالاهای موجود
                  </label>
                  <button className="shop-filter-btn" type="button" aria-haspopup="dialog" onClick={() => setFilterOpen(true)}>
                    <FilterIcon />
                    فیلترها
                    <span className="shop-filter-btn__count" hidden={filterCount === 0}>{toPersianNumber(filterCount)}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="shop-active-filters" hidden={filterCount === 0}>
              {lengths.map((len) => (
                <span className="shop-chip" key={`l-${len}`}>
                  قد {toPersianNumber(len)} سانتی‌متر
                  <button type="button" aria-label="حذف فیلتر" onClick={() => setLengths((a) => a.filter((x) => x !== len))}>×</button>
                </span>
              ))}
              {fabrics.map((fabric) => (
                <span className="shop-chip" key={fabric}>
                  {fabric}
                  <button type="button" aria-label="حذف فیلتر" onClick={() => setFabrics((a) => a.filter((x) => x !== fabric))}>×</button>
                </span>
              ))}
              {availableOnly ? (
                <span className="shop-chip">
                  فقط کالاهای موجود
                  <button type="button" aria-label="حذف فیلتر" onClick={() => setAvailableOnly(false)}>×</button>
                </span>
              ) : null}
              {filterCount > 0 ? (
                <button type="button" className="shop-clear-all" onClick={resetFilters}>پاک کردن همه فیلترها</button>
              ) : null}
            </div>

            <div className="shop-layout">
              <aside className={`shop-sidebar${filterOpen ? ' shop-sidebar--open' : ''}`} aria-label="فیلترها">
                <div className="shop-sidebar__head">
                  <h3>فیلترها</h3>
                  <button className="shop-sidebar__close" type="button" aria-label="بستن فیلترها" onClick={() => setFilterOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="shop-sidebar__body">
                  <div className="shop-filter-group">
                    <h4 className="shop-filter-group__title">
                      <LengthIcon />
                      قد چادر (سانتی‌متر)
                    </h4>
                    <div className="shop-length-grid">
                      {LENGTH_OPTIONS.map((len) => (
                        <button
                          key={len}
                          type="button"
                          className={`shop-length-chip${lengths.includes(len) ? ' shop-length-chip--active' : ''}`}
                          onClick={() => setLengths((a) => toggleArr(a, len))}
                        >
                          {toPersianNumber(len)} <span className="count">({toPersianNumber(countFor((p) => p.length === len))})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="shop-filter-group">
                    <h4 className="shop-filter-group__title">
                      <FabricIcon />
                      جنس پارچه
                    </h4>
                    <div className="shop-check-list">
                      {FABRIC_OPTIONS.map((fabric) => (
                        <label className="shop-check" key={fabric}>
                          <input type="checkbox" checked={fabrics.includes(fabric)} onChange={() => setFabrics((a) => toggleArr(a, fabric))} />
                          <span className="shop-check__label">{fabric}</span>
                          <span className="shop-check__count">{toPersianNumber(countFor((p) => p.fabric === fabric))}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="shop-sidebar__foot">
                  <button className="shop-btn-reset" type="button" onClick={resetFilters}>پاک کردن</button>
                  <button className="shop-btn-apply" type="button" onClick={() => setFilterOpen(false)}>نمایش نتایج</button>
                </div>
              </aside>
              {filterOpen ? <div className="shop-sidebar-overlay shop-sidebar-overlay--open" onClick={() => setFilterOpen(false)} /> : null}

              <div className="shop-content">
                <div className="shop-grid stagger">
                  {list.map((p, i) => {
                    const wished = wishlist.includes(p.id);
                    const filterCss = p.hue ? { filter: `hue-rotate(${p.hue}deg) saturate(1.05)` } : undefined;
                    return (
                      <article key={p.id} className={`product-card fade-up${p.inStock ? '' : ' product-card--oos'}`} style={{ '--i': i % 6 }}>
                        <div className="product-card__image-wrap">
                          {p.discount ? <span className="product-card__badge">{toPersianNumber(p.discount)}٪ تخفیف</span> : null}
                          {!p.inStock ? <span className="product-card__ribbon">ناموجود</span> : null}
                          <button
                            className={`product-card__wish${wished ? ' product-card__wish--active' : ''}`}
                            type="button"
                            aria-pressed={wished}
                            onClick={() => onWish(p.id)}
                          >
                            <HeartIcon />
                          </button>
                          <img className="product-card__img product-card__img--primary" style={filterCss} src={p.images[0]} alt={p.name} loading="lazy" />
                          <img className="product-card__img product-card__img--secondary" style={filterCss} src={p.images[1]} alt={p.name} loading="lazy" />
                        </div>
                        <div className="product-card__body">
                          <p className="product-card__name">{p.name}</p>
                          <span className="visually-hidden product-card__fabric">{p.fabric} · قد {toPersianNumber(p.length)} سانتی‌متر</span>
                          <div className="product-card__meta-row">
                            <span className="product-card__views"><ViewIcon />{toPersianNumber(p.views)} بازدید</span>
                          </div>
                          <div className="product-card__prices">
                            {p.discount ? <span className="product-card__price--old">{toPersianNumber(formatPrice(p.oldPrice))} تومان</span> : null}
                            <span className="product-card__price--current">{toPersianNumber(formatPrice(currentPrice(p)))} تومان</span>
                          </div>
                          <SmartLink href={`/product/${p.id}`} className="btn btn--outline-dark quick-add">
                            {p.inStock ? 'مشاهده محصول' : 'اطلاع از موجود شدن'}
                          </SmartLink>
                        </div>
                      </article>
                    );
                  })}
                </div>
                <div className={`shop-empty${list.length ? '' : ' shop-empty--show'}`}>
                  <SearchEmptyIcon />
                  <h3>محصولی با این فیلترها پیدا نشد</h3>
                  <p>می‌توانید فیلتر «جنس پارچه» یا «قد چادر» را تغییر دهید یا همه فیلترها را پاک کنید.</p>
                  <button type="button" onClick={resetFilters}>پاک کردن فیلترها</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <div className={`pdp-toast${toast ? ' pdp-toast--show' : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
        <span>{toast}</span>
      </div>
    </>
  );
}
