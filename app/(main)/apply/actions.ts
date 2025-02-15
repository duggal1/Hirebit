// app/server-actions/fetchJobApplicationsByVerification.ts
'use server';

import { prisma } from '@/app/utils/db';

export async function fetchJobApplicationsByVerification(verificationId: string) {
  if (!verificationId) {
    throw new Error('Verification ID is required');
  }

  // Look up the verification record including the related JobSeeker
  const verification = await prisma.verification.findUnique({
    where: { id: verificationId },
    include: { jobSeeker: true },
  });

  if (!verification || !verification.jobSeeker) {
    throw new Error('Verification or JobSeeker not found');
  }

  const jobSeekerId = verification.jobSeeker.id;
  console.log('Found JobSeeker id:', jobSeekerId);

  // Fetch all job applications for this JobSeeker, most recent first
  const applications = await prisma.jobApplication.findMany({
    where: { jobSeekerId },
    orderBy: { createdAt: 'desc' },
    include: {
      job: {
        include: {
          company: { select: { name: true, location: true } },
        },
      },
    },
  });

  return applications;
}
