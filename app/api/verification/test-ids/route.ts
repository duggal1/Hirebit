import { prisma } from '@/app/utils/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const verifications = await prisma.verification.findMany({
      take: 5, // Limit to 5 most recent verifications
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true
      }
    });

    return NextResponse.json(verifications);
  } catch (error) {
    console.error('Failed to fetch verification IDs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification IDs' },
      { status: 500 }
    );
  }
}