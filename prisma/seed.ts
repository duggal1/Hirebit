import { PrismaClient, JobPostStatus, UserType } from '@prisma/client';
import pkg from 'bcryptjs';
const { hash } = pkg;

const prisma = new PrismaClient();

async function main() {
  try {
    // First create a user for the company
    const companyUser = await prisma.user.create({
      data: {
        email: 'tech@microsoft.com',
        name: 'Microsoft HR',
        hashedPassword: await hash('password123', 12),
        userType: UserType.COMPANY,
        onboardingCompleted: true,
      },
    });

    // Create the company
    const company = await prisma.company.create({
      data: {
        name: 'Microsoft',
        location: 'Redmond, WA',
        logo: 'https://logo.clearbit.com/microsoft.com',
        website: 'https://microsoft.com',
        xAccount: '@microsoft',
        about: 'Microsoft Corporation is a technology company that develops and supports software, services, devices, and solutions worldwide.',
        industry: 'Technology',
        userId: companyUser.id,
      },
    });

    // Create job posts
    const jobPosts = [
      {
        jobTitle: 'Senior Frontend Engineer',
        employmentType: 'Full-time',
        location: 'Remote',
        salaryFrom: 120000,
        salaryTo: 180000,
        jobDescription: 'Looking for a Senior Frontend Engineer with React expertise...',
        listingDuration: 30,
        benefits: ['Health Insurance', 'Remote Work', '401k'],
        status: JobPostStatus.ACTIVE,
        companyId: company.id
      },
      {
        jobTitle: 'Backend Developer',
        employmentType: 'Full-time',
        location: 'Hybrid',
        salaryFrom: 130000,
        salaryTo: 190000,
        jobDescription: 'Seeking a Backend Developer with Node.js experience...',
        listingDuration: 30,
        benefits: ['Health Insurance', 'Flexible Hours', 'Stock Options'],
        status: JobPostStatus.ACTIVE,
        companyId: company.id
      }
    ];

    // Create all job posts
    for (const jobPost of jobPosts) {
      await prisma.jobPost.create({
        data: jobPost
      });
    }

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});