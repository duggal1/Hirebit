import { prisma } from '@/src/utils/db';
import { NextResponse } from 'next/server';


export async function GET(
  request: Request,
  { params }: { params: { testId: string } }
) {
  try {
    const violations = await prisma.testViolation.findMany({
      where: {
        testId: params.testId
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    return NextResponse.json(violations);
  } catch (error) {
    console.error('Error fetching test violations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test violations' },
      { status: 500 }
    );
  }
}