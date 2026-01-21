import { Header } from '@/widgets/header';
import { Footer } from '@/widgets/footer';
import { HeroSection } from '@/widgets/hero-section';
import { AboutSection } from '@/widgets/about-section';
import { RoomsSection } from '@/widgets/rooms-section';
import { AmenitiesSection } from '@/widgets/amenities-section';
import { LocationSection } from '@/widgets/location-section';
import { TestimonialsSection } from '@/widgets/testimonials-section';
import { ChatWidget } from '@/widgets/chat-widget';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <RoomsSection />
        <AmenitiesSection />
        <LocationSection />
        <TestimonialsSection />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
