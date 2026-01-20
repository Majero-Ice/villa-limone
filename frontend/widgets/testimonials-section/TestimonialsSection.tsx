import { TestimonialCard, Testimonial } from '@/entities/testimonial';

const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    guestName: 'Maria S.',
    content: 'The most beautiful views of the Ligurian coast. Every morning we woke up to the sound of waves and the smell of lemon blossoms. Villa Limone is a true hidden gem.',
    rating: 5,
    date: '2024-06-15',
  },
  {
    id: '2',
    guestName: 'James & Linda',
    content: 'The staff made us feel like part of their family. The personalized recommendations for local restaurants and hidden beaches made our trip unforgettable.',
    rating: 5,
    date: '2024-05-20',
  },
  {
    id: '3',
    guestName: 'Thomas K.',
    content: 'Perfect location for exploring Cinque Terre and Portofino. The hotel itself is charming and authentic, with attention to every detail.',
    rating: 4,
    date: '2024-07-10',
  },
  {
    id: '4',
    guestName: 'Sophie M.',
    content: 'The homemade breakfast was incredible. Fresh pastries, local fruits, and the best cappuccino I have ever had. Cannot wait to return!',
    rating: 5,
    date: '2024-08-05',
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="section bg-sand">
      <div className="container-wide">
        <div className="text-center mb-12">
          <h2 className="text-h2 mb-4">Guest Experiences</h2>
          <p className="text-warm-gray max-w-2xl mx-auto">
            Read what our guests have to say about their stay at Villa Limone.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {MOCK_TESTIMONIALS.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
