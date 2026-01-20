import { Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-graphite text-ivory">
      <div className="container-wide py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-h4 mb-4">Villa Limone</h3>
            <p className="text-warm-gray font-sans">
              Boutique Italian hotel on the beautiful Ligurian coast
            </p>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-warm-gray">
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>+39 0185 123 456</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>info@villalimone.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Via Limone 12, Liguria, Italy</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-warm-gray hover:text-terracotta transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-warm-gray hover:text-terracotta transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-warm-gray/20 text-center text-warm-gray text-sm">
          <p>&copy; {new Date().getFullYear()} Villa Limone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
