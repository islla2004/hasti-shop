const CART_KEY = 'hasti_cart_count';
const WISH_KEY = 'hasti_wishlist';
const EVENT = 'hasti-store';
const DEFAULT_WISHLIST = [
  'abaya-janan',
  'chador-negin-baran',
  'abaya-aurora',
  'kiff-shabnam',
  'shall-noor',
  'chador-shab-yalda',
];

function emit() {
  window.dispatchEvent(new Event(EVENT));
}

export function getCartCount() {
  return parseInt(localStorage.getItem(CART_KEY) || '0', 10);
}

export function setCartCount(n) {
  localStorage.setItem(CART_KEY, String(n));
  emit();
}

export function addToCart(qty = 1) {
  setCartCount(getCartCount() + qty);
}

export function ensureWishlistSeed() {
  if (localStorage.getItem(WISH_KEY) === null) {
    localStorage.setItem(WISH_KEY, JSON.stringify(DEFAULT_WISHLIST));
    emit();
  }
}

export function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISH_KEY) || '[]');
  } catch {
    return [];
  }
}

export function setWishlist(list) {
  localStorage.setItem(WISH_KEY, JSON.stringify(list));
  emit();
}

export function isWishlisted(id) {
  return getWishlist().includes(id);
}

export function toggleWishlist(id) {
  const list = getWishlist();
  const idx = list.indexOf(id);
  if (idx === -1) list.push(id);
  else list.splice(idx, 1);
  setWishlist(list);
  return idx === -1;
}

export function subscribeStore(callback) {
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}
