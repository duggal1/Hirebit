// app/api/applications/by-verification/[verificationId]/route.ts
import { fetchJobApplicationsByVerification } from '@/app/(main)/apply/actions';
import { NextResponse } from 'next/server';
//import { fetchJobApplicationsByVerification } from '@/app/server-actions/fetchJobApplicationsByVerification';

export async function GET(
  request: Request,
  { params }: { params: { verificationId: string } }
) {
  console.log('API: Fetching applications using verificationId:', params.verificationId);
  try {
    const applications = await fetchJobApplicationsByVerification(params.verificationId);
    return NextResponse.json({ applications });
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
