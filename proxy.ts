import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const coordSession = request.cookies.get('coord_session');
    const coordType = request.cookies.get('coord_type');
    const path = request.nextUrl.pathname;

    // Redirect root to login
    if (path === '/') {
        if (coordSession) {
            // Redirect based on coordinator type
            if (coordType?.value === 'main') {
                return NextResponse.redirect(new URL('/coordinator/overview', request.url));
            }
            return NextResponse.redirect(new URL('/coordinator', request.url));
        }
        return NextResponse.redirect(new URL('/coordinator/login', request.url));
    }

    // Allow access to login pages without clearing cookies (users can switch)
    if (path === '/coordinator/login' || path === '/coordinator/main-login') {
        return NextResponse.next();
    }

    // Protect coordinator routes
    if (path.startsWith('/coordinator')) {
        if (!coordSession) {
            const response = NextResponse.redirect(new URL('/coordinator/login', request.url));
            response.cookies.delete('coord_session');
            response.cookies.delete('coord_event');
            response.cookies.delete('coord_type');
            return response;
        }
    }

    // Main coordinator can only access overview
    if (coordType?.value === 'main' && path === '/coordinator' && coordSession) {
        return NextResponse.redirect(new URL('/coordinator/overview', request.url));
    }

    // Event coordinator cannot access overview
    if (coordType?.value !== 'main' && path === '/coordinator/overview' && coordSession) {
        return NextResponse.redirect(new URL('/coordinator', request.url));
    }

    // Main coordinator accessing /coordinator should go to overview
    if (path === '/coordinator' && coordSession && coordType?.value === 'main') {
        return NextResponse.redirect(new URL('/coordinator/overview', request.url));
    }

    // Redirect to appropriate dashboard if already logged in and visiting login pages
    if (path === '/coordinator/login' && coordSession) {
        if (coordType?.value === 'main') {
            return NextResponse.redirect(new URL('/coordinator/overview', request.url));
        }
        return NextResponse.redirect(new URL('/coordinator', request.url));
    }

    if (path === '/coordinator/main-login' && coordSession) {
        if (coordType?.value === 'main') {
            return NextResponse.redirect(new URL('/coordinator/overview', request.url));
        }
        return NextResponse.redirect(new URL('/coordinator', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/coordinator/:path*'],
};
