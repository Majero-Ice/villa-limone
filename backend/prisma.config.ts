import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  datasource: {
    // url: used by Prisma Client for queries (can be pooler)
    url: process.env.DATABASE_URL || "",
    // directUrl: used by Prisma Migrate (MUST be direct connection, not pooler)
    directUrl: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
});
