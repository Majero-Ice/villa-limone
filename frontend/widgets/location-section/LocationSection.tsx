import { MapPin, Clock } from 'lucide-react';

export function LocationSection() {
  const nearbyAttractions = [
    { name: 'Cinque Terre', distance: '20 min drive' },
    { name: 'Portofino', distance: '15 min drive' },
    { name: 'Genoa', distance: '45 min drive' },
    { name: 'Private Beach', distance: '2 min walk' },
  ];

  return (
    <section id="location" className="section bg-ivory">
      <div className="container-wide">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-h2 mb-6">Perfect Location</h2>
            <div className="space-y-4 text-warm-gray mb-8">
              <p>
                Villa Limone is perfectly positioned on the stunning Ligurian coast, offering easy
                access to some of Italy's most beautiful destinations while maintaining the
                peaceful atmosphere of a hidden gem.
              </p>
              <p>
                Our location provides the ideal base for exploring the famous Cinque Terre villages,
                the glamorous harbor of Portofino, and the historic city of Genoa, all while being
                just steps from your own private beach access.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-serif font-semibold mb-3">Nearby Attractions</h4>
              {nearbyAttractions.map((attraction) => (
                <div key={attraction.name} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-olive/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-olive" size={16} />
                  </div>
                  <div className="flex-1 flex justify-between">
                    <span className="font-medium">{attraction.name}</span>
                    <span className="text-warm-gray text-sm flex items-center gap-1">
                      <Clock size={14} />
                      {attraction.distance}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-96 md:h-[500px] rounded-xl overflow-hidden shadow-lifted">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d92384.89826154205!2d9.166788!3d44.308612!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12d4fdf6c9266d6f%3A0xe65e91e687b2e72f!2sCinque%20Terre!5e0!3m2!1sen!2sus!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Villa Limone location map"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
