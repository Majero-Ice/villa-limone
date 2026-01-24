import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  // await prisma.message.deleteMany();
  // await prisma.conversation.deleteMany();
  // await prisma.reservation.deleteMany();
  // await prisma.roomAvailability.deleteMany();
  // await prisma.chunk.deleteMany();
  // await prisma.document.deleteMany();
  // await prisma.testimonial.deleteMany();
  // await prisma.amenity.deleteMany();
  // await prisma.room.deleteMany();
  // await prisma.quickReply.deleteMany();
  // await prisma.crawlLog.deleteMany();
  // await prisma.crawlSchedule.deleteMany();
  // await prisma.botSettings.deleteMany();
  // await prisma.admin.deleteMany();

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@villalimone.com' },
    update: {},
    create: {
      email: 'admin@villalimone.com',
      passwordHash: adminPassword,
    },
  });
  console.log('Created admin:', admin.email);

  // Create Rooms
  const rooms = [
    {
      slug: 'camera-mare',
      name: 'Camera Mare',
      description: 'Beautiful sea view room with balcony overlooking the Ligurian coast. Features a king-size bed, air conditioning, and mini bar.',
      capacity: 2,
      pricePerNight: 18000, // €180 in cents
      imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2080',
      features: ['Sea view', 'Balcony', 'King bed', 'AC', 'Mini bar'],
      sortOrder: 1,
    },
    {
      slug: 'camera-limone',
      name: 'Camera Limone',
      description: 'Charming room with garden view and private terrace. Perfect for a romantic getaway.',
      capacity: 2,
      pricePerNight: 15000, // €150 in cents
      imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2080',
      features: ['Garden view', 'Queen bed', 'Terrace', 'AC'],
      sortOrder: 2,
    },
    {
      slug: 'suite-portofino',
      name: 'Suite Portofino',
      description: 'Spacious suite with panoramic views, living area, two bedrooms, and luxurious jacuzzi.',
      capacity: 4,
      pricePerNight: 28000, // €280 in cents
      imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2080',
      features: ['Panoramic view', 'Living area', '2BR', 'Jacuzzi'],
      sortOrder: 3,
    },
    {
      slug: 'camera-giardino',
      name: 'Camera Giardino',
      description: 'Quiet courtyard-facing room ideal for work or relaxation. Features a queen bed and dedicated workspace.',
      capacity: 2,
      pricePerNight: 13000, // €130 in cents
      imageUrl: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?q=80&w=2080',
      features: ['Courtyard view', 'Queen bed', 'Quiet', 'Desk'],
      sortOrder: 4,
    },
  ];

  for (const roomData of rooms) {
    const room = await prisma.room.upsert({
      where: { slug: roomData.slug },
      update: {},
      create: roomData,
    });
    console.log(`Created room: ${room.name}`);
  }

  // Create Amenities
  const amenities = [
    // General
    { name: 'Free WiFi', description: 'High-speed internet throughout the property', icon: 'wifi', category: 'general', sortOrder: 1 },
    { name: 'AC', description: 'Air conditioning in all rooms', icon: 'wind', category: 'general', sortOrder: 2 },
    { name: 'Daily housekeeping', description: 'Professional daily cleaning service', icon: 'sparkles', category: 'general', sortOrder: 3 },
    { name: 'Concierge', description: '24/7 concierge service', icon: 'bell', category: 'general', sortOrder: 4 },
    { name: 'Luggage storage', description: 'Secure luggage storage available', icon: 'briefcase', category: 'general', sortOrder: 5 },
    
    // Wellness
    { name: 'Garden terrace', description: 'Beautiful garden terrace for relaxation', icon: 'flower', category: 'wellness', sortOrder: 1 },
    { name: 'Beach access', description: 'Private beach access just 2 minutes away', icon: 'waves', category: 'wellness', sortOrder: 2 },
    { name: 'Yoga mats', description: 'Yoga mats available upon request', icon: 'heart', category: 'wellness', sortOrder: 3 },
    { name: 'Sun loungers', description: 'Comfortable sun loungers by the pool', icon: 'sun', category: 'wellness', sortOrder: 4 },
    
    // Dining
    { name: 'Breakfast included', description: 'Delicious homemade breakfast served daily', icon: 'coffee', category: 'dining', sortOrder: 1 },
    { name: 'Restaurant', description: 'On-site restaurant with local specialties', icon: 'utensils', category: 'dining', sortOrder: 2 },
    { name: 'Room service', description: '24/7 room service available', icon: 'tray', category: 'dining', sortOrder: 3 },
    { name: 'Wine cellar', description: 'Curated selection of Italian wines', icon: 'wine', category: 'dining', sortOrder: 4 },
    
    // Services
    { name: 'Airport transfer', description: 'Airport transfer service available', icon: 'car', category: 'services', sortOrder: 1 },
    { name: 'Free parking', description: 'Complimentary on-site parking', icon: 'parking-circle', category: 'services', sortOrder: 2 },
    { name: 'Laundry', description: 'Laundry service available', icon: 'shirt', category: 'services', sortOrder: 3 },
    { name: 'Tour booking', description: 'Help with booking local tours and activities', icon: 'map', category: 'services', sortOrder: 4 },
  ];

  for (const amenityData of amenities) {
    const amenityId = amenityData.name.toLowerCase().replace(/\s+/g, '-');
    const amenity = await prisma.amenity.upsert({
      where: { id: amenityId },
      update: {},
      create: {
        id: amenityId,
        ...amenityData,
      },
    });
    console.log(`Created amenity: ${amenity.name}`);
  }

  // Create Testimonials
  const testimonials = [
    {
      guestName: 'Maria S.',
      content: 'Most beautiful views we\'ve ever seen. The staff made our stay unforgettable. We can\'t wait to return!',
      rating: 5,
      date: new Date('2024-01-15'),
    },
    {
      guestName: 'James & Linda',
      content: 'Staff made us feel like family from the moment we arrived. The breakfast was incredible and the location is perfect.',
      rating: 5,
      date: new Date('2024-02-20'),
    },
    {
      guestName: 'Thomas K.',
      content: 'Perfect location for exploring the Ligurian coast. Clean, comfortable rooms and excellent service.',
      rating: 4,
      date: new Date('2024-03-10'),
    },
    {
      guestName: 'Sophie M.',
      content: 'Homemade breakfast incredible every morning. The garden terrace is a peaceful oasis. Highly recommend!',
      rating: 5,
      date: new Date('2024-04-05'),
    },
  ];

  for (const testimonialData of testimonials) {
    const testimonial = await prisma.testimonial.create({
      data: testimonialData,
    });
    console.log(`Created testimonial from ${testimonial.guestName}`);
  }

  // Create Bot Settings
  const botSettings = await prisma.botSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      systemPrompt: `You are the AI concierge for Villa Limone, a boutique hotel on the Ligurian coast.
Be warm and helpful, reflecting Italian hospitality. Keep responses concise.

You can:
- Answer questions about hotel, rooms, amenities, policies
- Check room availability (ask for dates and guests)
- Help make reservations (collect: name, email, dates, room, guest count)
- Recommend local restaurants and activities

Hotel info:
- Check-in: 3 PM, Check-out: 11 AM
- Breakfast: 7:30-10:30 AM
- Parking: Free, on-site
- Pets: Small pets welcome, €20/night
- Nearby: Cinque Terre (20 min), Portofino (15 min), Genoa (45 min)
- Beach: Private, 2 min walk

If unsure, offer to have front desk follow up.`,
      enableBooking: true,
      enableRecommendations: true,
      enableAvailability: true,
    },
  });
  console.log('Created bot settings');

  // Create Crawl Schedule
  const crawlSchedule = await prisma.crawlSchedule.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      enabled: false,
      frequency: 'daily',
      sourceUrl: '',
    },
  });
  console.log('Created crawl schedule');

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
