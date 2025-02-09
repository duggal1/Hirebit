import { NextResponse } from 'next/server';
import { prisma } from '@/app/utils/db';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    console.log('GET Verification - ID:', id);
    
    if (!id) {
      console.log('GET Verification - Missing ID');
      return NextResponse.json(
        { error: 'Verification ID is required' },
        { status: 400 }
      );
    }

    const verification = await prisma.verification.findUnique({
      where: { id: id }, 
      include: {
        company: {
          select: {
            id: true,
            name: true,
          }
        },
      },
    });

    console.log('GET Verification - Result:', verification);

    if (!verification) {
      console.log('GET Verification - Not Found');
      return NextResponse.json(
        { error: "Verification not found" },
        { status: 404 }
      );
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
    const { id } = context.params;
    console.log('PUT Verification - ID:', id);

    if (!id) {
      console.log('PUT Verification - Missing ID');
      return NextResponse.json(
        { error: 'Verification ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log('PUT Verification - Request Body:', body);
    const { urls } = body;

    // First check if verification exists with company data
    const existingVerification = await prisma.verification.findUnique({
      where: { id },
      include: {
        company: true
      }
    });

    console.log('PUT Verification - Existing:', existingVerification);

    // If no company is associated, try to find one
    if (!existingVerification?.company) {
      // Find any company that might need verification
      const company = await prisma.company.findFirst({
        where: {
          verifications: {
            none: {}
          }
        }
      });

      if (company) {
        // Update verification with company
        const updatedVerification = await prisma.verification.update({
          where: { id },
          data: {
            urls,
            status: 'completed',
            updatedAt: new Date(),
            companyId: company.id
          },
          include: {
            company: true
          }
        });
        
        console.log('PUT Verification - Updated with company:', updatedVerification);
        return NextResponse.json(updatedVerification);
      }
    }

    // Update existing verification
    const updatedVerification = await prisma.verification.update({
      where: { id },
      data: {
        urls,
        status: 'completed',
        updatedAt: new Date()
      },
      include: {
        company: true
      }
    });

    console.log('PUT Verification - Updated:', updatedVerification);
    return NextResponse.json(updatedVerification);
  } catch (error) {
    console.error('PUT Verification - Error:', error);
    return NextResponse.json(
      { error: 'Failed to update verification' },
      { status: 500 }
    );
  }
}