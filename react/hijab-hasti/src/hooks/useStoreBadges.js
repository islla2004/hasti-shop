import { useEffect, useState } from 'react';
import { getCartCount, getWishlist, subscribeStore } from '../utils/storage';

export function useStoreBadges() {
  const [cart, setCart] = useState(0);
  const [wish, setWish] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setCart(getCartCount());
      setWish(getWishlist().length);
    };
    refresh();
    return subscribeStore(refresh);
  }, []);

  return { cart, wish };
}
