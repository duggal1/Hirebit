import { NextResponse } from 'next/server';
import { validateLinkedInProfile } from '@/services/linkdln';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'LinkedIn URL is required' },
        { status: 400 }
      );
    }

    console.log('Validating LinkedIn URL:', url);
    const validation = await validateLinkedInProfile(url);

    return NextResponse.json({
      isVerified: validation.profileExists,
      validationDetails: validation,
      name: undefined,
      location: undefined,
      activity: {
        lastActive: 'Unknown',
        connectionCount: 'Hidden',
        postFrequency: 'Unknown'
      }
    });
    
  } catch (error) {
    console.error('LinkedIn validation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to validate LinkedIn profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}