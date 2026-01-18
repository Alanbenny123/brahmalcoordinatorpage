import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const coordSession = request.cookies.get('coord_session');
    const path = request.nextUrl.pathname;

    // Protect coordinator routes (except login)
    if (path.startsWith('/coordinator') && path !== '/coordinator/login') {
        if (!coordSession) {
            const response = NextResponse.redirect(new URL('/coordinator/login', request.url));
            response.cookies.delete('coord_session');
            response.cookies.delete('coord_event');
            return response;
        }
    }

    // Redirect to coordinator dashboard if already logged in and visiting coordinator login
    if (path === '/coordinator/login' && coordSession) {
        return NextResponse.redirect(new URL('/coordinator', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/coordinator/:path*'],
};
