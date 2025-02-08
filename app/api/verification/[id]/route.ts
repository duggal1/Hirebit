import { NextResponse } from 'next/server';
import { prisma } from '@/app/utils/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params?.id;
  
  if (!id) {
    return NextResponse.json(
      { error: 'Verification ID is required' },
      { status: 400 }
    );
  }

  try {
    const verification = await prisma.verification.findUnique({
      where: { id }
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(verification);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch verification' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params?.id;

  if (!id) {
    return NextResponse.json(
      { error: 'Verification ID is required' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { urls } = body;

    const updatedVerification = await prisma.verification.update({
      where: { id },
      data: {
        urls,
        status: 'completed',
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedVerification);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update verification' },
      { status: 500 }
    );
  }
}