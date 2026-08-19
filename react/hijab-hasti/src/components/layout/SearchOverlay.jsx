import { useEffect, useMemo, useRef, useState } from 'react';
import { ALL_PRODUCTS } from '../../data/catalog';
import SmartLink from '../SmartLink';

export default function SearchOverlay({ isOpen, onClose }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      return undefined;
    }

    const timer = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return ALL_PRODUCTS.filter((product) =>
      [product.name, product.category, product.fabric, product.code]
        .filter(Boolean)
        .some((value) => value.includes(q)),
    ).slice(0, 8);
  }, [query]);

  return (
    <div
      className={`search-overlay${isOpen ? ' search-overlay--open' : ''}`}
      id="searchOverlay"
      role="dialog"
      aria-modal="true"
      aria-label="جستجو"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="search-overlay__box">
        <div className="search-overlay__row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            className="search-overlay__input"
            placeholder="عبا، چادر، شال…"
            id="searchInput"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          <button className="search-overlay__close" id="searchCloseBtn" aria-label="بستن جستجو" onClick={onClose} type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!query.trim() ? (
          <p className="search-overlay__hint">نام محصول، دسته یا جنس پارچه را جستجو کنید</p>
        ) : results.length ? (
          <ul className="search-overlay__results">
            {results.map((product) => (
              <li key={product.id}>
                <SmartLink href={`/product/${product.id}`} className="search-overlay__result" onClick={onClose}>
                  <img src={product.images[0]} alt="" />
                  <span>
                    <strong>{product.name}</strong>
                    <small>{product.category}</small>
                  </span>
                </SmartLink>
              </li>
            ))}
          </ul>
        ) : (
          <p className="search-overlay__hint">محصولی با این عبارت پیدا نشد</p>
        )}
      </div>
    </div>
  );
}
