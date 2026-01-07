import { cookies } from "next/headers";
import { SignJWT, jwtVerify, JWTPayload } from "jose";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// ============================================
// AUTH PAYLOAD (stored inside JWT)
// ============================================

export interface AuthPayload {
  userId: string;
  fullName: string;
  mobile?: string | null;
  email?: string | null;
  isAdmin: boolean;
  role?: UserRole;  // NEW: User role for new auth system
  packagePurchased?: boolean | null;
}

// ============================================
// PASSWORD HELPERS
// ============================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================
// JWT HELPERS (JOSE)
// ============================================

export async function signToken(payload: AuthPayload) {
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as AuthPayload;
  } catch {
    return null;
  }
}

// ============================================
// SESSION HELPERS
// ============================================

export async function getSession(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;

  return verifyToken(token);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    throw new Error("Admin access required");
  }
  return session;
}

export async function requireUser() {
  const session = await getSession();
  if (!session) {
    throw new Error("User not logged in");
  }
  return session;
}

// ============================================
// ROLE HELPERS (NEW)
// ============================================

export function isAdminRole(role?: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN';
}

export function isInstituteRole(role?: UserRole): boolean {
  return role === 'INSTITUTE_OWNER' || role === 'INSTITUTE_STAFF';
}

export function canAccessAdmin(session: AuthPayload | null): boolean {
  if (!session) return false;
  return session.isAdmin || isAdminRole(session.role);
}