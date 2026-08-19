import { useScrolled } from "./hooks/useScrolled";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import BookingSteps from "./components/BookingSteps";
import Services from "./components/Services";
import BeforeAfter from "./components/BeforeAfter";
import Academy from "./components/Academy";
import Testimonials from "./components/Testimonials";
import Faq from "./components/Faq";
import InstagramFeed from "./components/InstagramFeed";
import Enquire from "./components/Enquire";
import WhatsAppFab from "./components/WhatsAppFab";
import HeroReel from "./components/HeroReel";
import AboutSection from "./components/AboutSection";
import GalleryStrip from "./components/GalleryStrip";
import type { GalleryCategory } from "./types";

interface AppProps {
  showAcademy?: boolean;
  showInstagram?: boolean;
  /** Which set the gallery opens on. */
  defaultFilter?: GalleryCategory;
}

export default function App({
  showAcademy = true,
  showInstagram = true,
  defaultFilter = "Bridal",
}: AppProps) {
  const scrolled = useScrolled(40);

  return (
    <>
      <Nav scrolled={scrolled} />
      <HeroReel />
      <Marquee />
      <AboutSection />
      {/* <Hero /> */}
      <Services />
      <BookingSteps />
      <GalleryStrip defaultCategory={defaultFilter} />
      <BeforeAfter />
      {/* {showAcademy && <Academy />} */}
      <Testimonials />
      <Faq />
      {showInstagram && <InstagramFeed />}
      <Enquire />
      <WhatsAppFab visible={scrolled} />
    </>
  );
}
