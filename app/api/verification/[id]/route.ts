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
      where: { id: jobSeekerId }
    });

    if (!jobSeeker) {
      return NextResponse.json(
        { error: "JobSeeker not found" },
        { status: 404 }
      );
    }

    // Get or create verification record for this JobSeeker
    let verification = await prisma.verification.findUnique({
      where: { jobSeekerId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          }
        },
      },
    });

    if (!verification) {
      // Create a new verification record if none exists
      verification = await prisma.verification.create({
        data: {
          jobSeekerId,
          status: 'pending'
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            }
          },
        },
      });
    }

    return NextResponse.json(verification);
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
    const { urls } = body;

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
      where: { jobSeekerId },
      create: {
        jobSeekerId,
        urls,
        status: 'pending'
      },
      update: {
        urls,
        status: 'pending',
        updatedAt: new Date()
      },
      include: {
        company: true
      }
    });

    return NextResponse.json(verification);
  } catch (error) {
    console.error('PUT Verification - Error:', error);
    return NextResponse.json(
      { error: 'Failed to update verification' },
      { status: 500 }
    );
  }
}

