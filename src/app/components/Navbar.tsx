// src/app/components/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

// Tambahkan props toggleSidebar
export default function Navbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const router = useRouter();
  const [fullName, setFullName] = useState<string>("");
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const session = Cookies.get("user_session");
    if (session) {
      try {
        const user = JSON.parse(session);
        setFullName(user.full_name);
        setRole(user.role);
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("user_session");
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Tombol Garis 3 (Hamburger Menu) */}
        <button 
          onClick={toggleSidebar} 
          className="text-slate-500 hover:text-slate-700 p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          title="Toggle Sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-slate-800 hidden sm:block">Overview</h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-800 leading-tight">{fullName || "User"}</p>
          <p className="text-xs text-slate-500 capitalize">{role || "Role"}</p>
        </div>
        
        {/* Avatar Placeholder */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold border border-blue-200">
          {fullName ? fullName.charAt(0).toUpperCase() : "U"}
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1"></div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 p-2 sm:px-3 sm:py-2 rounded-lg font-medium transition-colors cursor-pointer"
          title="Logout"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
    </header>
  );
}