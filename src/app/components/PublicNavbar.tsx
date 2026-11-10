// src/app/components/PublicNavbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PublicNavbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fungsi bantuan untuk mengecek apakah menu sedang aktif
  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer z-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-8 h-8 bg-indigo-900 text-white rounded-lg flex items-center justify-center font-bold">Tim</div>
          <span className="text-xl font-bold text-indigo-900">Konsorsium</span>
        </Link>

        {/* Menu Desktop (Tengah) */}
        <nav className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600">
          <Link href="/" className={`px-4 py-2 rounded-full transition-colors ${isActive("/") ? "text-indigo-900 bg-indigo-50 font-semibold" : "hover:text-indigo-900"}`}>
            Home
          </Link>
          <Link href="/rikub" className={`px-4 py-2 rounded-full transition-colors ${isActive("/rikub") ? "text-indigo-900 bg-indigo-50 font-semibold" : "hover:text-indigo-900"}`}>
            RIKUB
          </Link>
          <Link href="/kirrana" className={`px-4 py-2 rounded-full transition-colors ${isActive("/kirrana") ? "text-indigo-900 bg-indigo-50 font-semibold" : "hover:text-indigo-900"}`}>
            KIRRANA
          </Link>
        </nav>

        {/* Tombol Login & Hamburger (Kanan) */}
        <div className="flex items-center gap-4 z-50">
          <Link href="/login" className="hidden md:block bg-indigo-900 hover:bg-indigo-800 text-white px-6 py-2.5 rounded-full font-medium transition-colors shadow-sm cursor-pointer">
            Login
          </Link>
          
          {/* Tombol Hamburger Mobile */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-indigo-900 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Dropdown Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col px-4 py-4 space-y-2">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive("/") ? "text-indigo-900 bg-indigo-50 font-semibold" : "text-slate-600 hover:bg-slate-50"}`}>
              Home
            </Link>
            <Link href="/rikub" onClick={() => setIsMobileMenuOpen(false)} className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive("/rikub") ? "text-indigo-900 bg-indigo-50 font-semibold" : "text-slate-600 hover:bg-slate-50"}`}>
              RIKUB
            </Link>
            <Link href="/kirrana" onClick={() => setIsMobileMenuOpen(false)} className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive("/kirrana") ? "text-indigo-900 bg-indigo-50 font-semibold" : "text-slate-600 hover:bg-slate-50"}`}>
              KIRRANA
            </Link>
            <div className="pt-2 mt-2 border-t border-slate-100">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center bg-indigo-900 hover:bg-indigo-800 text-white px-6 py-3 rounded-xl font-medium transition-colors cursor-pointer">
                Login
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}