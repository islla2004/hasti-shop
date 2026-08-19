import { useEffect } from 'react';

export function useScrollHeader(headerRef, alwaysScrolled = false) {
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return undefined;

    const onScroll = () => {
      if (alwaysScrolled || window.scrollY > 40) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, [headerRef, alwaysScrolled]);
}
