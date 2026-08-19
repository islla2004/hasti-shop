import { FEATURED_PRODUCTS, currentPrice } from '../../data/catalog';
import { formatPrice, toPersianNumber } from '../../utils/priceUtils';
import SmartLink from '../SmartLink';

function EyebrowDot() {
  return (
    <svg width="6" height="6" style={{ display: 'inline-block', margin: '0 8px' }}>
      <circle cx="3" cy="3" r="2.5" fill="currentColor" />
    </svg>
  );
}

export default function ProductGrid() {
  return (
    <>
      <section className="featured" id="products">
        <div className="container">
          <div className="section-heading fade-up">
            <span className="eyebrow">
              <EyebrowDot />
              هر روز، انتخابی متفاوت برای شما
              <EyebrowDot />
            </span>
            <h2 className="section-heading__title">جدید ترین های برند هستی</h2>
            <p className="section-heading__desc">
              هستی، همراه شما در انتخاب‌های آگاهانه. مجموعه‌ای از بهترین پارچه‌ها، دوخت
              دست‌ساز و طراحی‌های منحصربه‌فرد که هویت شما را در عین رعایت حجاب، به نمایش می‌گذارد
            </p>
          </div>
        </div>
      </section>

      <section className="product-grid">
        <div className="container">
          <div className="product-grid__list stagger">
            {FEATURED_PRODUCTS.map((product, index) => (
              <article key={product.id} className="product-card fade-up" style={{ '--i': index }}>
                <div className="product-card__image-wrap">
                  {product.discount ? <span className="product-card__badge">{toPersianNumber(product.discount)}٪ تخفیف</span> : null}
                  <img
                    className="product-card__img product-card__img--primary"
                    src={product.images[0]}
                    alt={product.name}
                    loading="lazy"
                  />
                  <img
                    className="product-card__img product-card__img--secondary"
                    src={product.images[1] || product.images[0]}
                    alt={product.name}
                    loading="lazy"
                  />
                </div>
                <div className="product-card__body">
                  <p className="product-card__name">{product.name}</p>
                  <div className="product-card__prices">
                    <span className="product-card__price--old">{toPersianNumber(formatPrice(product.oldPrice))} تومان</span>
                    <span className="product-card__price--current">
                      {toPersianNumber(formatPrice(currentPrice(product)))} تومان
                    </span>
                  </div>
                  <SmartLink href={`/product/${product.id}`} className="btn btn--outline-dark quick-add">مشاهده محصول</SmartLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
