import { NextResponse } from 'next/server';
import { prisma } from '@/app/utils/db';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id: jobSeekerId } = context.params;
    
    if (!jobSeekerId) {
      return NextResponse.json(
        { error: 'JobSeeker ID is required' },
        { status: 400 }
      );
    }

    // First check if the JobSeeker exists
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { id: jobSeekerId },
      include: {
        Verification: {
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

    if (!jobSeeker) {
      return NextResponse.json(
        { error: "JobSeeker not found" },
        { status: 404 }
      );
    }

    // Get or create verification record
    let verification = jobSeeker.Verification[0];

    if (!verification) {
      // Create a new verification record if none exists
      verification = await prisma.verification.create({
        data: {
          jobSeekerId,
          status: 'pending',
          urls: {
            github: jobSeeker.github || '',
            linkedin: jobSeeker.linkedin || '',
            portfolio: jobSeeker.portfolio || ''
          }
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
    }

    return NextResponse.json({
      ...verification,
      jobSeeker: {
        id: jobSeeker.id,
        name: jobSeeker.name,
        email: jobSeeker.email
      }
    });

  } catch (error) {
    console.error('GET Verification - Error:', error);
    return NextResponse.json(
      { error: "Failed to fetch verification" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id: jobSeekerId } = context.params;
    const body = await request.json();
    const { urls, companyId } = body;

    if (!jobSeekerId) {
      return NextResponse.json(
        { error: 'JobSeeker ID is required' },
        { status: 400 }
      );
    }

    // Check if JobSeeker exists
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { id: jobSeekerId }
    });

    if (!jobSeeker) {
      return NextResponse.json(
        { error: "JobSeeker not found" },
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

    return NextResponse.json(verification);
  } catch (error) {
    console.error('PUT Verification - Error:', error);
    return NextResponse.json(
      { error: 'Failed to update verification' },
      { status: 500 }
    );
  }
}

