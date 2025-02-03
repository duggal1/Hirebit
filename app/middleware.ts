import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Protect test routes
  if (path.startsWith('/coding-test/')) {
    const testId = path.split('/')[2];
    const res = await fetch(`${request.nextUrl.origin}/api/test/${testId}/status`);
    
    if (!res.ok) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    const { valid } = await res.json();
    if (!valid) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
} 