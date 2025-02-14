// fetchjobseeker.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Fetch all job seekers from the database
  const jobSeekers = await prisma.jobApplication.findMany();
  
  // Print the results to the terminal with full depth
  console.dir(jobSeekers, { depth: null });
}

main()
  .catch((e) => {
    console.error('Error fetching JobSeekers:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
