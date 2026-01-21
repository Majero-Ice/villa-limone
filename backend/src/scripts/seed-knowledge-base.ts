import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function chunkText(text: string, maxChunkSize: number = 1000): Promise<string[]> {
  const paragraphs = text.split('\n\n');
  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length + 2 > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter((chunk) => chunk.length > 50);
}

async function createEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
  });

  return response.data.map((item) => item.embedding);
}

async function seedKnowledgeBase() {
  console.log('Starting knowledge base seeding...\n');

  const knowledgeDir = path.join(__dirname, '../../knowledge');
  const files = fs.readdirSync(knowledgeDir).filter((file) => file.endsWith('.md'));

  console.log(`Found ${files.length} markdown files to process\n`);

  for (const file of files) {
    const filePath = path.join(knowledgeDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(file, '.md');

    console.log(`Processing: ${fileName}`);

    const existingDoc = await prisma.document.findFirst({
      where: { name: fileName },
    });

    let document;
    if (existingDoc) {
      console.log(`  - Document exists, deleting old chunks...`);
      await prisma.chunk.deleteMany({
        where: { documentId: existingDoc.id },
      });

      document = await prisma.document.update({
        where: { id: existingDoc.id },
        data: {
          content,
          type: 'md',
          updatedAt: new Date(),
        },
      });
    } else {
      console.log(`  - Creating new document...`);
      document = await prisma.document.create({
        data: {
          name: fileName,
          type: 'md',
          content,
        },
      });
    }

    console.log(`  - Chunking text...`);
    const chunks = await chunkText(content);
    console.log(`  - Created ${chunks.length} chunks`);

    console.log(`  - Generating embeddings...`);
    const embeddings = await createEmbeddings(chunks);

    console.log(`  - Saving chunks to database...`);

    for (let i = 0; i < chunks.length; i++) {
      const embeddingStr = `[${embeddings[i].join(',')}]`;

      await prisma.$executeRawUnsafe(
        `
        INSERT INTO "Chunk" (id, "documentId", content, embedding, metadata, "createdAt")
        VALUES (gen_random_uuid(), $1, $2, $3::vector, $4, NOW())
        `,
        document.id,
        chunks[i],
        embeddingStr,
        JSON.stringify({ chunkIndex: i, fileName }),
      );
    }

    console.log(`  ✓ Completed ${fileName}\n`);
  }

  await prisma.$disconnect();
  console.log('Knowledge base seeding completed successfully!');
}

async function seedBotSettings() {
  const defaultSystemPrompt = `You are the AI concierge for Villa Limone, a boutique hotel on the Ligurian coast.
Be warm and helpful, reflecting Italian hospitality. Keep responses concise.

IMPORTANT: Always respond in the same language as the guest's message. If they write in Italian, respond in Italian. If they write in English, respond in English. If they write in German, respond in German, etc.

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

Format your responses using Markdown for better readability:
- Use **bold** for important information
- Use bullet points for lists
- Use ### for section headings when appropriate

If unsure, offer to have front desk follow up.`;

  const existing = await prisma.botSettings.findUnique({
    where: { id: 'default' },
  });

  if (!existing) {
    await prisma.botSettings.create({
      data: {
        id: 'default',
        systemPrompt: defaultSystemPrompt,
        enableBooking: true,
        enableRecommendations: true,
        enableAvailability: true,
      },
    });
    console.log('Bot settings seeded successfully!');
  } else {
    await prisma.botSettings.update({
      where: { id: 'default' },
      data: {
        systemPrompt: defaultSystemPrompt,
      },
    });
    console.log('Bot settings updated with new system prompt!');
  }
}

async function main() {
  try {
    await seedBotSettings();
    await seedKnowledgeBase();
  } catch (error) {
    console.error('Error seeding knowledge base:', error);
    process.exit(1);
  }
}

main();
