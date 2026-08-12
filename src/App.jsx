import { useScrolled } from "./hooks/useScrolled.js";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import Marquee from "./components/Marquee.jsx";
import BookingSteps from "./components/BookingSteps.jsx";
import Services from "./components/Services.jsx";
import Gallery from "./components/Gallery.jsx";
import BeforeAfter from "./components/BeforeAfter.jsx";
import Academy from "./components/Academy.jsx";
import Testimonials from "./components/Testimonials.jsx";
import Faq from "./components/Faq.jsx";
import InstagramFeed from "./components/InstagramFeed.jsx";
import Enquire from "./components/Enquire.jsx";
import WhatsAppFab from "./components/WhatsAppFab.jsx";
import HeroReel from "./components/HeroReel.jsx";
import AboutSection from "./components/AboutSection.jsx";
import GalleryCoverflow from "./components/GalleryCoverflow.jsx";

export default function App({
  showAcademy = true,
  showInstagram = true,
  defaultFilter = "Bridal",
}) {
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
      <GalleryCoverflow defaultCategory={defaultFilter} />
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
