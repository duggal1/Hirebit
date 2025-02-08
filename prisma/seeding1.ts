import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create test verification records
  const testVerifications = await Promise.all([
    prisma.verification.create({
      data: {
        urls: {
          github: 'https://github.com/duggal1',
          portfolio: 'https://kaizra.dev/'
        },
        status: 'completed'
      }
    }),
    prisma.verification.create({
      data: {
        urls: {
   github: 'https://github.com/duggal1',
          portfolio: 'https://kaizra.dev/'
        },
        status: 'completed'
      }
    }),
    prisma.verification.create({
      data: {
        urls: {
   github: 'https://github.com/duggal1',
          portfolio: 'https://kaizra.dev/' },
        status: 'completed'
      }
    })
  ]);

  console.log('Created test verification records:', testVerifications);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });