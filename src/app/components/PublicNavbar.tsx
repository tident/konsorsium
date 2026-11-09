// src/app/components/PublicNavbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PublicNavbar() {
  const pathname = usePathname();

  // Fungsi bantuan untuk mengecek apakah menu sedang aktif
  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-indigo-900 text-white rounded-lg flex items-center justify-center font-bold">Tim</div>
          <span className="text-xl font-bold text-indigo-900">Konsorsium</span>
        </Link>

        {/* Menu Tengah */}
        <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-600">
          <Link 
            href="/" 
            className={`px-4 py-2 rounded-full transition-colors ${
              isActive("/") ? "text-indigo-900 bg-indigo-50 font-semibold" : "hover:text-indigo-900"
            }`}
          >
            Home
          </Link>
          <Link 
            href="/rikub" 
            className={`px-4 py-2 rounded-full transition-colors ${
              isActive("/rikub") ? "text-indigo-900 bg-indigo-50 font-semibold" : "hover:text-indigo-900"
            }`}
          >
            RIKUB
          </Link>
        </nav>

        {/* Tombol Login */}
        <div>
          <Link href="/login" className="bg-indigo-900 hover:bg-indigo-800 text-white px-6 py-2.5 rounded-full font-medium transition-colors shadow-sm cursor-pointer">
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}