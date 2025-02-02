import { NextResponse } from 'next/server';

export function errorHandler(error: Error) {
  console.error('PDF Generation Error:', error);
  
  if (error.message.includes('ENOENT')) {
    return NextResponse.json(
      { error: "Font configuration error - please contact support" },
      { status: 500 }
    );
  }
  
  if (error.message.includes('params')) {
    return NextResponse.json(
      { error: "Invalid request parameters" },
      { status: 400 }
    );
  }
  
  return NextResponse.json(
    { error: "Failed to generate PDF document" },
    { status: 500 }
  );
} 