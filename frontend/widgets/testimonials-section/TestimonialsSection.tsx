'use client';

import { useEffect, useState } from 'react';
import { TestimonialCard, Testimonial, testimonialApi } from '@/entities/testimonial';

function TestimonialCardSkeleton() {
  return (
    <div className="card-base p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-soft-beige rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-soft-beige rounded w-1/3" />
          <div className="h-4 bg-soft-beige rounded w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-soft-beige rounded w-full" />
        <div className="h-4 bg-soft-beige rounded w-5/6" />
        <div className="h-4 bg-soft-beige rounded w-4/6" />
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setIsLoading(true);
        const data = await testimonialApi.getAll();
        setTestimonials(data);
      } catch (err) {
        setError('Failed to load testimonials. Please try again later.');
        console.error('Error fetching testimonials:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <section id="testimonials" className="section bg-sand">
      <div className="container-wide">
        <div className="text-center mb-12">
          <h2 className="text-h2 mb-4">Guest Experiences</h2>
          <p className="text-warm-gray max-w-2xl mx-auto">
            Read what our guests have to say about their stay at Villa Limone.
          </p>
        </div>

        {error && (
          <div className="text-center py-8">
            <p className="text-danger">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <TestimonialCardSkeleton key={index} />
              ))
            : testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
        </div>
      </div>
    </section>
  );
}
