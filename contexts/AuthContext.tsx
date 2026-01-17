"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// ============================================
// TYPES
// ============================================

export type UserRole = 
  | "USER" 
  | "ADMIN" 
  | "SUPER_ADMIN" 
  | "INSTITUTE_OWNER" 
  | "INSTITUTE_STAFF"
  | "AGENT";

export interface AuthUser {
  userId: string;
  fullName: string;
  email?: string | null;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isInstitute: boolean;
  dashboardUrl: string;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// HELPERS
// ============================================

function parseJwtPayload(token: string): AuthUser | null {
  try {
    // JWT format: header.payload.signature
    const base64Payload = token.split('.')[1];
    if (!base64Payload) return null;
    
    // Decode base64 (handle URL-safe base64)
    const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    
    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }
    
    return {
      userId: payload.userId,
      fullName: payload.fullName || '',
      email: payload.email,
      role: payload.role || 'USER',
    };
  } catch {
    return null;
  }
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function getDashboardByRole(role?: UserRole | string): string {
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

// ============================================
// PROVIDER
// ============================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = async () => {
    const token = getCookie('auth-token');
    if (token) {
      const parsed = parseJwtPayload(token);
      setUser(parsed);
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const logout = () => {
    deleteCookie('auth-token');
    setUser(null);
    window.location.href = '/';
  };

  const isLoggedIn = !!user;
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isInstitute = user?.role === 'INSTITUTE_OWNER' || user?.role === 'INSTITUTE_STAFF';
  const dashboardUrl = getDashboardByRole(user?.role);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isLoggedIn,
      isAdmin,
      isInstitute,
      dashboardUrl,
      logout,
      refreshAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}