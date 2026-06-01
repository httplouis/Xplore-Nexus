import { config } from 'dotenv';
config({ path: '.env.local' });
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Prisma 7 CLI (migrations/push) uses the url defined here
    url: env('DIRECT_URL'),
  },
  migrations: {
    seed: 'ts-node --skip-project prisma/seed.ts',
  },
});
