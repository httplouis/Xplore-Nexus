import { config } from 'dotenv';
config({ path: '.env.local' });
import { defineConfig } from 'prisma/config';

// Prefer DIRECT_URL, fall back to DATABASE_URL. In CI (Vercel) the
// environment variable must be provided in Project Settings — see note below.
const connectionUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Prisma 7 CLI (migrations/push) uses the url defined here
    url: connectionUrl,
  },
  migrations: {
    seed: 'ts-node --skip-project prisma/seed.ts',
  },
});
