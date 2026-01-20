import { Star } from 'lucide-react';
import { Testimonial } from '../model/types';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="bg-ivory p-8 rounded-xl shadow-soft">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < testimonial.rating ? 'fill-terracotta text-terracotta' : 'text-soft-beige'}
          />
        ))}
      </div>
      
      <p className="text-graphite mb-6 italic">"{testimonial.content}"</p>
      
      <div className="flex items-center justify-between">
        <span className="font-semibold text-graphite">{testimonial.guestName}</span>
        <span className="text-sm text-warm-gray">
          {new Date(testimonial.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
}
