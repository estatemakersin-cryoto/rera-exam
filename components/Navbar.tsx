"use client";
import Link from "next/link";

export default function Navbar() {
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
        </div>
      </div>
    </nav>
  );
}
