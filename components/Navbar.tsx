"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { user, isLoading, isLoggedIn, dashboardUrl, logout } = useAuth();

  return (
    <nav className="w-full bg-white shadow-sm py-3">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        
        {/* LEFT SIDE — BRAND TITLE */}
        <Link
          href="/"
          className="text-lg font-bold text-blue-900 whitespace-nowrap"
        >
          MahaRERA Training & Compliance Platform
        </Link>

        {/* RIGHT SIDE BUTTONS */}
        <div className="flex items-center space-x-6">
          <Link href="/about" className="text-gray-700 hover:text-blue-600 text-sm">
            About
          </Link>

          <Link href="/contact" className="text-gray-700 hover:text-blue-600 text-sm">
            Contact
          </Link>

          {/* Auth-aware buttons with loading state to prevent flicker */}
          {isLoading ? (
            // Skeleton buttons while loading - prevents layout shift
            <>
              <div className="w-16 h-8 bg-gray-200 rounded-md animate-pulse" />
              <div className="w-20 h-8 bg-gray-200 rounded-md animate-pulse" />
            </>
          ) : isLoggedIn ? (
            // LOGGED IN: Show user info, dashboard, logout
            <>
              <span className="text-sm text-gray-600 hidden sm:inline">
                Hi, {user?.fullName?.split(' ')[0] || 'User'}
              </span>
              
              <Link
                href={dashboardUrl}
                className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                Dashboard
              </Link>
              
              <button
                onClick={logout}
                className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
              >
                Logout
              </button>
            </>
          ) : (
            // NOT LOGGED IN: Show login/register
            <>
              <Link
                href="/login"
                className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}