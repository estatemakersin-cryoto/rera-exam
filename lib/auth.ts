import { cookies } from "next/headers";
import { SignJWT, jwtVerify, JWTPayload } from "jose";
import bcrypt from "bcryptjs";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// ============================================
// AUTH PAYLOAD (stored inside JWT)
// ============================================

export interface AuthPayload extends JWTPayload {
  id: string;
  userId: string; // ✅ Add this alias
  fullName: string;
  mobile: string | null;
  isAdmin: boolean;
  packagePurchased: boolean;
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
  return new SignJWT(payload as JWTPayload) // 👈 Cast to JWTPayload
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as AuthPayload; // 👈 Safe double-cast
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
