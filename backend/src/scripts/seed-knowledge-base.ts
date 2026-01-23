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

interface ChunkData {
  content: string;
  contextBefore?: string;
  contextAfter?: string;
}

async function chunkText(text: string, maxChunkSize: number = 1000, overlap: number = 150): Promise<ChunkData[]> {
  const chunks: ChunkData[] = [];
  
  const normalizedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const sections = splitIntoSections(normalizedText);
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    const prevSection = i > 0 ? sections[i - 1].trim() : null;
    const nextSection = i < sections.length - 1 ? sections[i + 1].trim() : null;
    
    if (section.length <= maxChunkSize) {
      if (section.length >= 150) {
        chunks.push({
          content: section,
          contextBefore: prevSection ? truncateContext(prevSection, 200) : undefined,
          contextAfter: nextSection ? truncateContext(nextSection, 200) : undefined,
        });
      }
      continue;
    }

    const sectionChunks = splitSectionIntoChunks(section, maxChunkSize, overlap);
    for (let j = 0; j < sectionChunks.length; j++) {
      const chunk = sectionChunks[j].trim();
      if (chunk.length < 150) continue;
      
      const prevChunk = j > 0 ? sectionChunks[j - 1].trim() : null;
      const nextChunk = j < sectionChunks.length - 1 ? sectionChunks[j + 1].trim() : null;
      
      chunks.push({
        content: chunk,
        contextBefore: prevChunk ? truncateContext(prevChunk, 200) : undefined,
        contextAfter: nextChunk ? truncateContext(nextChunk, 200) : undefined,
      });
    }
  }

  return chunks;
}

function truncateContext(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  const sentences = splitIntoSentences(text);
  let snippet = '';
  
  for (const sentence of sentences) {
    if (snippet.length + sentence.length + 1 > maxLength) {
      break;
    }
    snippet += (snippet ? ' ' : '') + sentence;
  }
  
  if (!snippet && sentences.length > 0) {
    snippet = sentences[0].substring(0, maxLength);
  }
  
  return snippet.trim();
}

function splitIntoSections(text: string): string[] {
  const sections: string[] = [];
  const sectionMarkers = [
    /^#{1,3}\s+.+$/gm,
    /^##\s+.+$/gm,
    /^###\s+.+$/gm,
  ];

  let lastIndex = 0;
  const matches: Array<{ index: number; text: string }> = [];

  for (const marker of sectionMarkers) {
    let match;
    while ((match = marker.exec(text)) !== null) {
      matches.push({ index: match.index, text: match[0] });
    }
  }

  matches.sort((a, b) => a.index - b.index);

  for (const match of matches) {
    if (match.index > lastIndex) {
      const section = text.substring(lastIndex, match.index).trim();
      if (section.length > 0) {
        sections.push(section);
      }
      lastIndex = match.index;
    }
  }

  if (lastIndex < text.length) {
    const section = text.substring(lastIndex).trim();
    if (section.length > 0) {
      sections.push(section);
    }
  }

  return sections.length > 0 ? sections : [text];
}

function splitSectionIntoChunks(section: string, maxChunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  
  const paragraphs = section.split(/\n\n+/).filter(p => p.trim().length > 0);
  let currentChunk = '';
  
  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i].trim();
    
    if ((currentChunk + '\n\n' + para).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      
      const overlapText = getOverlapText(currentChunk, overlap);
      currentChunk = overlapText + '\n\n' + para;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

function getOverlapText(text: string, overlapSize: number): string {
  if (text.length <= overlapSize) {
    return text;
  }
  
  const overlapText = text.slice(-overlapSize);
  const lastParaIndex = overlapText.lastIndexOf('\n\n');
  
  if (lastParaIndex > overlapSize * 0.3) {
    return overlapText.substring(lastParaIndex + 2).trim();
  }
  
  const sentences = splitIntoSentences(overlapText);
  return sentences.slice(-2).join(' ').trim();
}

function splitIntoSentences(text: string): string[] {
  const sentenceEndings = /([.!?]+\s+|\.\n+)/g;
  const sentences: string[] = [];
  let lastIndex = 0;
  let match;

  while ((match = sentenceEndings.exec(text)) !== null) {
    const sentence = text.substring(lastIndex, match.index + match[0].length).trim();
    if (sentence.length > 10) {
      sentences.push(sentence);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    const sentence = text.substring(lastIndex).trim();
    if (sentence.length > 10) {
      sentences.push(sentence);
    }
  }

  return sentences.length > 0 ? sentences : [text];
}

function getOverlapSentences(text: string, overlapSize: number): string {
  if (text.length <= overlapSize) {
    return text;
  }

  const overlapText = text.slice(-overlapSize);
  const lastSentenceIndex = overlapText.lastIndexOf('.');
  
  if (lastSentenceIndex > overlapSize * 0.3) {
    return overlapText.substring(lastSentenceIndex + 1).trim();
  }

  const words = overlapText.split(/\s+/);
  return words.slice(-Math.floor(overlapSize / 10)).join(' ');
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
    const chunkData = await chunkText(content);
    console.log(`  - Created ${chunkData.length} chunks`);

    console.log(`  - Generating embeddings (content only, no context)...`);
    const contentOnly = chunkData.map(chunk => chunk.content);
    const embeddings = await createEmbeddings(contentOnly);

    console.log(`  - Saving chunks to database...`);

    for (let i = 0; i < chunkData.length; i++) {
      const embeddingStr = `[${embeddings[i].join(',')}]`;
      const metadata: any = {
        chunkIndex: i,
        fileName,
      };
      
      if (chunkData[i].contextBefore) {
        metadata.contextBefore = chunkData[i].contextBefore;
      }
      if (chunkData[i].contextAfter) {
        metadata.contextAfter = chunkData[i].contextAfter;
      }

      await prisma.$executeRawUnsafe(
        `
        INSERT INTO "Chunk" (id, "documentId", content, embedding, metadata, "createdAt")
        VALUES (gen_random_uuid(), $1, $2, $3::vector, $4, NOW())
        `,
        document.id,
        chunkData[i].content,
        embeddingStr,
        JSON.stringify(metadata),
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
