// ══════════════════════════════════════════════════════════════════════════════
// ESTATEMAKERS UNIFIED MIDDLEWARE
// Version: 1.0
// Updated: January 7, 2025
// ══════════════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// ══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'estatemakers-default-secret-change-in-production'
);

const COOKIE_NAME = 'auth-token';

// Rate limiting storage (in production, use Redis)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

// ══════════════════════════════════════════════════════════════════════════════
// ROUTE DEFINITIONS
// ══════════════════════════════════════════════════════════════════════════════

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/refund',
  '/institutes',
  '/certificate',        // Public verification
  '/rera-exam',          // Exam landing page
];

const AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
];

const EXAM_USER_ROUTES = [
  '/rera-exam/dashboard',
  '/rera-exam/mock-test',
  '/rera-exam/revision',
  '/rera-exam/payment',
  '/rera-exam/syllabus',
  '/dashboard',          // Legacy support
  '/mock-test',          // Legacy support
  '/revision',           // Legacy support
  '/payment',            // Legacy support
];

const INSTITUTE_ROUTES = [
  '/institute',
];

const ADMIN_ROUTES = [
  '/admin',
];

// ══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════

interface JWTPayload {
  userId: string;
  email?: string;
  phone?: string;
  role: string;
  fullName?: string;
  exp?: number;
}

async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    'anonymous'
  );
}

function isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const current = rateLimit.get(key);

  if (!current || now > current.resetTime) {
    rateLimit.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (current.count >= maxRequests) {
    return true;
  }

  current.count++;
  return false;
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Cache-Control', 'no-store, must-revalidate');
  return response;
}

function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

function getDashboardByRole(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return '/admin';
    case 'INSTITUTE_OWNER':
    case 'INSTITUTE_STAFF':
      return '/institute/dashboard';
    case 'AGENT':
      return '/agent/dashboard';  // Future CRM
    default:
      return '/rera-exam/dashboard';
  }
}

function isAdminRole(role: string): boolean {
  return ['SUPER_ADMIN', 'ADMIN'].includes(role);
}

function isInstituteRole(role: string): boolean {
  return ['INSTITUTE_OWNER', 'INSTITUTE_STAFF'].includes(role);
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN MIDDLEWARE
// ══════════════════════════════════════════════════════════════════════════════

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const clientIP = getClientIP(req);

  // ──────────────────────────────────────────────────────────────────────────
  // 1. RATE LIMITING FOR API ROUTES
  // ──────────────────────────────────────────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    const isAuthRoute = pathname.startsWith('/api/auth/');
    const maxRequests = isAuthRoute ? 10 : 100;  // Stricter for auth
    const windowMs = 60 * 1000;  // 1 minute

    if (isRateLimited(clientIP, maxRequests, windowMs)) {
      return new NextResponse('Rate limit exceeded. Please try again later.', { 
        status: 429,
        headers: { 'Retry-After': '60' }
      });
    }

    // Allow API routes to proceed (they handle their own auth)
    return NextResponse.next();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. STATIC FILES - Skip middleware
  // ──────────────────────────────────────────────────────────────────────────
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') // Files with extensions
  ) {
    return NextResponse.next();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. GET USER SESSION
  // ──────────────────────────────────────────────────────────────────────────
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  // ──────────────────────────────────────────────────────────────────────────
  // 4. PUBLIC ROUTES - Allow everyone
  // ──────────────────────────────────────────────────────────────────────────
  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    return addSecurityHeaders(NextResponse.next());
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5. AUTH ROUTES - Redirect logged-in users to their dashboard
  // ──────────────────────────────────────────────────────────────────────────
  if (matchesRoute(pathname, AUTH_ROUTES)) {
    if (user) {
      const dashboard = getDashboardByRole(user.role);
      return NextResponse.redirect(new URL(dashboard, req.url));
    }
    return addSecurityHeaders(NextResponse.next());
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 6. ADMIN ROUTES - Require admin role
  // ──────────────────────────────────────────────────────────────────────────
  if (matchesRoute(pathname, ADMIN_ROUTES)) {
    if (!user) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!isAdminRole(user.role)) {
      console.log(`Non-admin user ${user.userId} tried to access admin route`);
      return NextResponse.redirect(new URL('/rera-exam/dashboard', req.url));
    }

    return addSecurityHeaders(NextResponse.next());
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 7. INSTITUTE ROUTES - Require institute role
  // ──────────────────────────────────────────────────────────────────────────
  if (matchesRoute(pathname, INSTITUTE_ROUTES)) {
    if (!user) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admins can also access institute routes (for support)
    if (!isInstituteRole(user.role) && !isAdminRole(user.role)) {
      console.log(`User ${user.userId} without institute role tried to access institute route`);
      return NextResponse.redirect(new URL('/rera-exam/dashboard', req.url));
    }

    return addSecurityHeaders(NextResponse.next());
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 8. EXAM USER ROUTES - Require authentication
  // ──────────────────────────────────────────────────────────────────────────
  if (matchesRoute(pathname, EXAM_USER_ROUTES)) {
    if (!user) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect admins to admin panel
    if (isAdminRole(user.role)) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }

    // Redirect institute users to institute panel
    if (isInstituteRole(user.role)) {
      return NextResponse.redirect(new URL('/institute/dashboard', req.url));
    }

    return addSecurityHeaders(NextResponse.next());
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 9. DEFAULT - Allow with security headers
  // ──────────────────────────────────────────────────────────────────────────
  return addSecurityHeaders(NextResponse.next());
}

// ══════════════════════════════════════════════════════════════════════════════
// MATCHER CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};