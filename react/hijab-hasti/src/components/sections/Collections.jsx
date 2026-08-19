import { COLLECTION_CARDS } from '../../data/siteData';
import SmartLink from '../SmartLink';

export default function Collections() {
  return (
    <section className="collections" id="collections">
      <div className="container">
        <div className="section-heading fade-up">
          <h2 className="section-heading__title">دسته بندی محصولات</h2>
        </div>
        <div className="collections__grid stagger">
          {COLLECTION_CARDS.map((card, index) => (
            <article key={card.label} className="collection-card fade-up" style={{ '--i': index }}>
              <SmartLink href={card.href} className="collection-card__frame" tabIndex={0} aria-label={card.label}>
                <img className="collection-card__img" src={card.image} alt={card.alt} loading="lazy" />
              </SmartLink>
              <SmartLink href={card.href} className="collection-card__link">{card.label}</SmartLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
