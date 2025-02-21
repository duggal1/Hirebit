import { NextRequest } from 'next/server';
import { prisma } from '@/src/utils/db';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const jobSeekerId = (await context.params).id;
    console.log('GET Verification - JobSeeker ID:', jobSeekerId);

    if (!jobSeekerId) {
      console.log('GET Verification - Missing JobSeeker ID');
      return new Response(
        JSON.stringify({ error: 'JobSeeker ID is required' }),
        { status: 400 }
      );
    }

    // Get optional companyId from the query parameters
    const companyId = request.nextUrl.searchParams.get('companyId');
    console.log('GET Verification - Company ID from query:', companyId);

    // First check if the JobSeeker exists
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { id: jobSeekerId },
      include: {
        Verification: {
          where: { jobSeekerId },
          include: {
            company: {
              select: {
                id: true,
                name: true,
                JobPost: true
              }
            }
          }
        }
      }
    });

    console.log('GET Verification - Found JobSeeker:', {
      id: jobSeeker?.id,
      email: jobSeeker?.email,
      verificationCount: jobSeeker?.Verification?.length
    });

    if (!jobSeeker) {
      console.log('GET Verification - JobSeeker not found');
      return new Response(
        JSON.stringify({ error: "JobSeeker not found" }),
        { status: 404 }
      );
    }

    // Get verification record specifically for this jobSeeker
    let verification = await prisma.verification.findUnique({
      where: { jobSeekerId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            JobPost: true
          }
        }
      }
    });

    console.log('GET Verification - Existing verification:', {
      exists: !!verification,
      id: verification?.id,
      status: verification?.status
    });

    if (!verification) {
      console.log('GET Verification - Creating new verification record');
      verification = await prisma.verification.create({
        data: {
          jobSeekerId,
          status: 'pending',
          urls: {
            github: jobSeeker.github || '',
            linkedin: jobSeeker.linkedin || '',
            portfolio: jobSeeker.portfolio || ''
          },
          companyId // Added companyId here; it will be null if not provided
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              JobPost: true
            }
          }
        }
      });
      console.log('GET Verification - Created new verification:', {
        id: verification.id,
        status: verification.status,
        urls: verification.urls
      });
    }

    const response = {
      ...verification,
      jobSeeker: {
        id: jobSeeker.id,
        name: jobSeeker.name,
        email: jobSeeker.email,
        github: jobSeeker.github,
        linkedin: jobSeeker.linkedin,
        portfolio: jobSeeker.portfolio,
        currentJobTitle: jobSeeker.currentJobTitle,
        industry: jobSeeker.industry,
        yearsOfExperience: jobSeeker.yearsOfExperience,
        location: jobSeeker.location
      }
    };

    console.log('GET Verification - Sending response:', {
      verificationId: response.id,
      jobSeekerId: response.jobSeeker.id,
      status: verification.status
    });

    return new Response(JSON.stringify(response));
  } catch (error) {
    console.error('GET Verification - Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process verification request' }),
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const jobSeekerId = (await context.params).id;
    const body = await request.json();
    const { urls, companyId } = body;

    if (!jobSeekerId) {
      return new Response(
        JSON.stringify({ error: 'JobSeeker ID is required' }),
        { status: 400 }
      );
    }

    // Check if JobSeeker exists
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { id: jobSeekerId }
    });

    if (!jobSeeker) {
      return new Response(
        JSON.stringify({ error: "JobSeeker not found" }),
        { status: 404 }
      );
    }

    // Update or create verification record
    const verification = await prisma.verification.upsert({
      where: { 
        jobSeekerId 
      },
      create: {
        jobSeekerId,
        urls,
        status: 'pending',
        companyId
      },
      update: {
        urls,
        status: 'pending',
        companyId,
        updatedAt: new Date()
      },
      include: {
        company: true
      }
    });

    // Also update JobSeeker's profile links if provided
    if (urls) {
      await prisma.jobSeeker.update({
        where: { id: jobSeekerId },
        data: {
          github: urls.github || jobSeeker.github,
          linkedin: urls.linkedin || jobSeeker.linkedin,
          portfolio: urls.portfolio || jobSeeker.portfolio
        }
      });
    }

    return new Response(JSON.stringify(verification));
  } catch (error) {
    console.error('PUT Verification - Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update verification' }),
      { status: 500 }
    );
  }
}
