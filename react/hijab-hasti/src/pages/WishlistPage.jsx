import { useEffect, useMemo, useRef, useState } from 'react';
import { ALL_PRODUCTS, currentPrice } from '../data/catalog';
import { ensureWishlistSeed, getWishlist, setWishlist } from '../utils/storage';
import { formatPrice, toPersianNumber } from '../utils/priceUtils';
import { useWishlistConstellation } from '../hooks/useWishlistConstellation';
import SmartLink from '../components/SmartLink';
import '../styles/wishlist.css';

function DropIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function liftBranch(id, on) {
  const node = document.querySelector(`.node[data-id="${id}"]`);
  const path = document.querySelector(`.link[data-for="${id}"]`);
  node?.classList.toggle('is-hot', on);
  path?.classList.toggle('is-lit', on);
}

export default function WishlistPage() {
  const [ids, setIds] = useState(() => {
    ensureWishlistSeed();
    return getWishlist();
  });
  const [leaving, setLeaving] = useState('');
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);
  const touchOnly = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

  const items = useMemo(
    () => ids.map((id) => ALL_PRODUCTS.find((p) => p.id === id)).filter(Boolean),
    [ids],
  );

  const {
    stageRef,
    hubRef,
    nodesRef,
    linksSvgRef,
    linkLayerRef,
    dustRef,
    spotRef,
  } = useWishlistConstellation(items);

  useEffect(() => {
    document.title = 'علاقه‌مندی‌ها | هستی';
    document.documentElement.classList.add('page-wish');
    document.body.classList.add('page-wish');
    return () => {
      document.documentElement.classList.remove('page-wish');
      document.body.classList.remove('page-wish', 'has-spot');
    };
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2600);
  };

  const drop = (product) => {
    setLeaving(product.id);
    showToast(`شاخه «${product.name}» حذف شد`);
    window.setTimeout(() => {
      const next = getWishlist().filter((x) => x !== product.id);
      setWishlist(next);
      setIds(next);
      setLeaving('');
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 420);
  };

  return (
    <>
      <div className="scene__spot" ref={spotRef} id="sceneSpot" aria-hidden="true" />
      <main id="main">
        <section className="scene" aria-labelledby="wishTitle">
          <canvas className="scene__dust" ref={dustRef} id="sceneDust" aria-hidden="true" />
          <div className="scene__haze scene__haze--gold" aria-hidden="true" />
          <div className="scene__haze scene__haze--linen" aria-hidden="true" />
          <div className="scene__grain" aria-hidden="true" />

          <div className="scene__title">
            <p className="scene__kicker">Atelier Privé</p>
            <h1 className="scene__h1" id="wishTitle">شاخه‌های علاقه‌مندی شما</h1>
          </div>

          <div className={`stage${items.length ? '' : ' is-empty'}`} id="stage" ref={stageRef}>
            <svg className="stage__links" id="stageLinks" ref={linksSvgRef} aria-hidden="true">
              <defs>
                <marker id="wishArrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="5.4" markerHeight="5.4" orient="auto" markerUnits="strokeWidth">
                  <path d="M0 1.2 L9.4 5 L0 8.8 Z" fill="#e8d5a8" />
                </marker>
              </defs>
              <g id="linkLayer" ref={linkLayerRef} />
            </svg>

            <div className="hub" id="hub" ref={hubRef}>
              <span className="hub__orbit" aria-hidden="true" />
              <span className="hub__ring" aria-hidden="true" />
              <span className="hub__ring hub__ring--2" aria-hidden="true" />
              <svg className="hub__heart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
              </svg>
              <span className="hub__count" id="hubCount" aria-hidden="true">{toPersianNumber(items.length)}</span>
            </div>

            <div className="stage__nodes" id="stageNodes" ref={nodesRef} aria-live="polite">
              {items.map((p, i) => (
                <div
                  key={p.id}
                  className={`node${leaving === p.id ? ' node--leaving' : ' node--settled'}`}
                  data-id={p.id}
                  style={{ '--i': i, '--delay': '0ms' }}
                  onMouseEnter={() => liftBranch(p.id, true)}
                  onMouseLeave={() => liftBranch(p.id, false)}
                >
                  <div className="node__float">
                    <SmartLink
                      className="node__orb"
                      href={`/product/${p.id}`}
                      aria-label={p.name}
                      onFocus={() => liftBranch(p.id, true)}
                      onBlur={() => liftBranch(p.id, false)}
                    >
                      <img
                        className="node__img"
                        src={p.images[0]}
                        alt={p.name}
                        width="480"
                        height="480"
                        loading={i < 4 ? 'eager' : 'lazy'}
                      />
                      <span className="node__sheen" aria-hidden="true" />
                      {!p.inStock ? <span className="node__oos">ناموجود</span> : null}
                    </SmartLink>
                  </div>
                  <div className="node__label">
                    <span className="node__name">{p.name}</span>
                    <span className="node__meta">
                      {p.discount ? <span className="node__old">{toPersianNumber(formatPrice(p.oldPrice))}</span> : null}
                      <span className="node__price">{toPersianNumber(formatPrice(currentPrice(p)))} تومان</span>
                    </span>
                    <button
                      className="node__drop"
                      type="button"
                      aria-label={`حذف ${p.name} از علاقه‌مندی‌ها`}
                      onClick={() => drop(p)}
                    >
                      <DropIcon />
                      حذف شاخه
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="stage__empty" id="stageEmpty">
              <p>هنوز شاخه‌ای نروییده. با زدن قلب روی هر محصول، شاخه‌ای تازه به این نقشه اضافه می‌شود.</p>
              <SmartLink href="/#products">
                کشف کالکشن هستی
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
              </SmartLink>
            </div>
          </div>

          <p className="scene__hint" id="sceneHint">
            {items.length
              ? (touchOnly
                ? 'روی هر دایره بزنید تا نام و قیمت آن قطعه دیده شود'
                : 'نشانگر را روی هر دایره ببرید تا نام و قیمت آن قطعه دیده شود')
              : ''}
          </p>
        </section>
      </main>
      <div className={`pdp-toast${toast ? ' pdp-toast--show' : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
        <span>{toast}</span>
      </div>
    </>
  );
}
