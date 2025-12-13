import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

async function getAuthFromRequest(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as any;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // 🔒 Protect /admin routes (admin-only)
  if (pathname.startsWith("/admin")) {
    const session = await getAuthFromRequest(req);

    if (!session) {
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!session.isAdmin) {
      // User trying to access admin - redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", origin));
    }
  }

  // 🔒 Protect /dashboard routes (regular users)
  if (pathname.startsWith("/dashboard")) {
    const session = await getAuthFromRequest(req);

    if (!session) {
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.isAdmin) {
      // Admin trying to access user dashboard - redirect to admin
      return NextResponse.redirect(new URL("/admin", origin));
    }
  }

  const res = NextResponse.next();
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};