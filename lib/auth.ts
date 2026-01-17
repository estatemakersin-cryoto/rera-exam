import { cookies } from "next/headers";
import { SignJWT, jwtVerify, JWTPayload } from "jose";
import bcrypt from "bcryptjs";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// ============================================
// USER ROLES (must match Prisma enum)
// ============================================

export type UserRole = 
  | "USER" 
  | "ADMIN" 
  | "SUPER_ADMIN" 
  | "INSTITUTE_OWNER" 
  | "INSTITUTE_STAFF"
  | "AGENT";

// ============================================
// AUTH PAYLOAD (stored inside JWT)
// ============================================

export interface AuthPayload {
  userId: string;
  fullName: string;
  mobile?: string | null;
  email?: string | null;
  isAdmin: boolean;
  role?: UserRole;
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
// ROLE HELPERS (Phase 2)
// ============================================

export function isAdminRole(role?: UserRole | string): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function isInstituteRole(role?: UserRole | string): boolean {
  return role === "INSTITUTE_OWNER" || role === "INSTITUTE_STAFF";
}

export async function requireInstitute() {
  const session = await getSession();
  if (!session || !isInstituteRole(session.role)) {
    throw new Error("Institute access required");
  }
  return session;
}

export function getDashboardByRole(role?: UserRole | string): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "/admin";
    case "INSTITUTE_OWNER":
    case "INSTITUTE_STAFF":
      return "/institute/dashboard";
    case "AGENT":
      return "/agent/dashboard";
    default:
      return "/rera-exam/dashboard";
  }
}