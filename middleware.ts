// ══════════════════════════════════════════════════════════════════════════════
// ESTATEMAKERS MIDDLEWARE (Simplified)
// ══════════════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'estatemakers-default-secret-change-in-production'
);
const COOKIE_NAME = 'auth-token';

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

interface UserPayload {
  userId: string;
  email?: string;
  role: string;
  fullName?: string;
}

async function getUser(req: NextRequest): Promise<UserPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
}

function isAdmin(role?: string): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

function isInstitute(role?: string): boolean {
  return role === 'INSTITUTE_OWNER' || role === 'INSTITUTE_STAFF';
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

function redirectToLogin(req: NextRequest, redirectPath?: string): NextResponse {
  const loginUrl = new URL('/login', req.url);
  if (redirectPath) {
    loginUrl.searchParams.set('redirect', redirectPath);
  }
  return NextResponse.redirect(loginUrl);
}

// ══════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE
// ══════════════════════════════════════════════════════════════════════════════

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ────────────────────────────────────────────────────────────────────────────
  // 1. SKIP - Static files, API routes, assets
  // ────────────────────────────────────────────────────────────────────────────
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Get user session
  const user = await getUser(req);

  // ────────────────────────────────────────────────────────────────────────────
  // 2. PUBLIC ROUTES - Anyone can access
  // ────────────────────────────────────────────────────────────────────────────
  if (
    pathname === '/' ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/refund') ||
    pathname.startsWith('/agent-guide') ||
    pathname.startsWith('/institutes') ||
    pathname.startsWith('/certificate') ||
    pathname === '/rera-exam'
  ) {
    return addSecurityHeaders(NextResponse.next());
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 3. AUTH PAGES - Allow everyone (no redirect for logged-in users)
  // ────────────────────────────────────────────────────────────────────────────
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password')
  ) {
    return addSecurityHeaders(NextResponse.next());
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 4. ADMIN ROUTES - Require admin role
  // ────────────────────────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return redirectToLogin(req, pathname);
    }
    if (!isAdmin(user.role)) {
      // Non-admin trying to access admin area → send to exam dashboard
      return NextResponse.redirect(new URL('/rera-exam/dashboard', req.url));
    }
    return addSecurityHeaders(NextResponse.next());
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 5. INSTITUTE ROUTES - Require institute or admin role
  // ────────────────────────────────────────────────────────────────────────────
  if (pathname.startsWith('/institute')) {
    if (!user) {
      return redirectToLogin(req, pathname);
    }
    if (!isInstitute(user.role) && !isAdmin(user.role)) {
      // Regular user trying to access institute area → send to exam dashboard
      return NextResponse.redirect(new URL('/rera-exam/dashboard', req.url));
    }
    return addSecurityHeaders(NextResponse.next());
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 6. EXAM ROUTES - Require any logged-in user
  // ────────────────────────────────────────────────────────────────────────────
  if (
    pathname.startsWith('/rera-exam') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/mock-test') ||
    pathname.startsWith('/revision') ||
    pathname.startsWith('/payment')
  ) {
    if (!user) {
      return redirectToLogin(req, pathname);
    }
    return addSecurityHeaders(NextResponse.next());
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 7. DEFAULT - Allow with security headers
  // ────────────────────────────────────────────────────────────────────────────
  return addSecurityHeaders(NextResponse.next());
}

// ══════════════════════════════════════════════════════════════════════════════
// MATCHER
// ══════════════════════════════════════════════════════════════════════════════

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};