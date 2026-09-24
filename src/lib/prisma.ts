import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  let dbUrl = process.env.DATABASE_URL;

  // On Vercel / AWS Lambda serverless environment:
  if (process.env.VERCEL) {
    const tmpDbPath = '/tmp/dev.db';

    // Find the bundled dev.db
    const possiblePaths = [
      path.join(process.cwd(), 'prisma', 'dev.db'),
      path.join(process.cwd(), '.next', 'server', 'prisma', 'dev.db'),
      path.resolve(__dirname, '..', '..', '..', 'prisma', 'dev.db'),
      path.resolve(__dirname, '..', '..', 'prisma', 'dev.db'),
      path.resolve(__dirname, '..', 'prisma', 'dev.db'),
    ];

    let sourceFound = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        sourceFound = p;
        break;
      }
    }

    if (sourceFound && !fs.existsSync(tmpDbPath)) {
      try {
        fs.copyFileSync(sourceFound, tmpDbPath);
        console.log(`[Vercel SQLite] Copied database from ${sourceFound} to ${tmpDbPath}`);
      } catch (err) {
        console.error('[Vercel SQLite] Failed to copy database to /tmp:', err);
      }
    }

    if (fs.existsSync(tmpDbPath)) {
      dbUrl = `file:${tmpDbPath}`;
    } else if (sourceFound) {
      dbUrl = `file:${sourceFound}`;
    }
  }

  return new PrismaClient({
    datasources: dbUrl
      ? {
          db: {
            url: dbUrl,
          },
        }
      : undefined,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
