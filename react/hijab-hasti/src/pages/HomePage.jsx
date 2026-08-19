import CursorGlow from '../components/CursorGlow';
import BeautyBanner from '../components/sections/BeautyBanner';
import CollectionBanner from '../components/sections/CollectionBanner';
import Collections from '../components/sections/Collections';
import Hero from '../components/sections/Hero';
import MapSection from '../components/sections/MapSection';
import ProductGrid from '../components/sections/ProductGrid';
import Reviews from '../components/sections/Reviews';
import Ticker from '../components/sections/Ticker';

export default function HomePage() {
  return (
    <>
      <CursorGlow />
      <main id="main">
        <Hero />
        <Ticker />
        <Collections />
        <ProductGrid />
        <BeautyBanner />
        <Reviews />
        <CollectionBanner />
        <MapSection />
      </main>
    </>
  );
}
