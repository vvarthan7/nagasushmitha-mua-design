import { useScrolled } from "./hooks/useScrolled";
import Nav from "./components/Nav";
import HeroReel from "./components/HeroReel";
import Services from "./components/Services";
import BookingSteps from "./components/BookingSteps";
import GalleryStrip from "./components/GalleryStrip";
import BeforeAfter from "./components/BeforeAfter";
import Testimonials from "./components/Testimonials";
import Faq from "./components/Faq";
import InstagramFeed from "./components/InstagramFeed";
import Enquire from "./components/Enquire";
import WhatsAppFab from "./components/WhatsAppFab";
import type { GalleryCategory } from "./types";
import Marquee from "./components/Marquee";
import AboutSection from "./components/AboutSection";

/** The bar and the banner: everything above the prerendered block. */
export function App() {
  const scrolled = useScrolled(40);
  const defaultCategory: GalleryCategory = "Bridal";
  return (
    <>
      <Nav scrolled={scrolled} />
      <HeroReel />
      <Marquee />
      <AboutSection />
      <Services />
      <BookingSteps />
      <GalleryStrip defaultCategory={defaultCategory} />
      {/* <BeforeAfter /> */}
      <Testimonials />
      <Faq />
      <InstagramFeed />
      <Enquire />
      <WhatsAppFab visible={scrolled} />
    </>
  );
}
