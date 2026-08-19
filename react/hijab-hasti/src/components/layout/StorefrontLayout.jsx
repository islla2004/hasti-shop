import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AnnouncementBar from './AnnouncementBar';
import Footer from './Footer';
import Header from './Header';
import NavDrawer from './NavDrawer';
import SearchOverlay from './SearchOverlay';
import { useFadeUpObserver } from '../../hooks/useFadeUpObserver';

export default function StorefrontLayout() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useFadeUpObserver(location.pathname + location.hash);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  useEffect(() => {
    setDrawerOpen(false);
    setSearchOpen(false);
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (drawerOpen) setDrawerOpen(false);
        if (searchOpen) setSearchOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen, searchOpen]);

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <AnnouncementBar />
      <Header
        onOpenSearch={() => setSearchOpen(true)}
        onOpenDrawer={() => setDrawerOpen(true)}
        drawerOpen={drawerOpen}
      />
      <NavDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <Outlet />
      <Footer />
    </>
  );
}
