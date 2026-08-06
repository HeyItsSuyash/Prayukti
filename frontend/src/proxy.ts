import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Get hostname (e.g. mmmut.prayukti.org or localhost:3000)
  const hostname = request.headers.get('host') || '';
  
  // Extract subdomain if it exists
  const subdomain = hostname.split('.')[0];
  
  // Exclude localhost/www and default routes
  const isLocalhost = hostname.includes('localhost');
  const isWww = subdomain === 'www';
  
  // Attach tenant-id to headers for server components
  if (subdomain && !isWww && (!isLocalhost || subdomain !== 'localhost')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-id', subdomain);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
