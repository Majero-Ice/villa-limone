import { Button } from '@/shared/ui';
import { ChevronDown } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2080')",
        }}
        role="img"
        aria-label="Villa Limone hotel exterior with Mediterranean view"
      >
        <div className="absolute inset-0 bg-graphite/80"></div>
      </div>

      <div className="relative z-10 text-center text-ivory px-4">
        <h1 className="text-h1 text-balance mb-6 animate-fade-in">
          Welcome to Villa Limone
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-balance animate-slide-up">
          Experience authentic Italian hospitality on the breathtaking Ligurian coast
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
          <Button variant="primary">
            <a href="#rooms">Explore Rooms</a>
          </Button>
          <Button variant="outline">
            <a href="#about">Learn More</a>
          </Button>
        </div>
      </div>

      <a
        href="#about"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ivory animate-bounce"
        aria-label="Scroll to content"
      >
        <ChevronDown size={32} />
      </a>
    </section>
  );
}
