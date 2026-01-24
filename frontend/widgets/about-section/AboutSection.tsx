import Image from 'next/image';

export function AboutSection() {
  return (
    <section id="about" className="section bg-sand">
      <div className="container-wide">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-h2 mb-6">Our Story</h2>
            <div className="space-y-4 text-warm-gray">
              <p>
                Nestled on the sun-drenched Ligurian coast, Villa Limone has been welcoming guests
                since 1952. Originally a private family estate, our villa has been lovingly
                transformed into an intimate boutique hotel.
              </p>
              <p>
                Each room tells a story of Italian craftsmanship and attention to detail. From the
                hand-painted tiles to the century-old lemon trees in our garden, every element has
                been carefully preserved to maintain the authentic character of this special place.
              </p>
              <p>
                We believe in the Italian art of hospitality — making every guest feel like part of
                our family. Whether you're seeking a romantic getaway or a base to explore the
                stunning Cinque Terre, Villa Limone offers the perfect blend of comfort, charm, and
                Mediterranean beauty.
              </p>
            </div>
          </div>

          <div className="relative h-96 md:h-[500px] rounded-xl overflow-hidden shadow-lifted">
            <Image
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2080"
              alt="Villa Limone exterior"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
