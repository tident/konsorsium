// src/app/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const IconDashboard = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const IconProfile = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconUsers = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const IconDataCenter = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4zm0 5c0 2.21 3.582 4 8 4s8-1.79 8-4" />
  </svg>
);

const IconChevronDown = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const pathname = usePathname();
  const [role, setRole] = useState<string>("");
  const [isDataCenterOpen, setIsDataCenterOpen] = useState(false);

  useEffect(() => {
    const session = Cookies.get("user_session");
    if (session) {
      try {
        const user = JSON.parse(session);
        setRole(user.role);
      } catch (e) {}
    }
  }, []);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <IconDashboard /> },
    { name: "Profil Saya", path: "/dashboard/profile", icon: <IconProfile /> },
  ];

  if (role === "admin") {
    menuItems.push({ name: "Manajemen Akun", path: "/dashboard/accounts", icon: <IconUsers /> });
  }

  return (
    <>
      {/* Overlay Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Utama */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col min-h-screen shadow-xl transition-all duration-300 ease-in-out
        md:static md:shadow-none
        ${isOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 w-64 md:w-20"}
      `}>
        
        {/* Area Logo */}
        <div className={`h-16 flex items-center border-b border-slate-100 transition-all duration-300 ${isOpen ? "px-6" : "justify-center"}`}>
          <span className="text-xl font-extrabold text-blue-600 tracking-wider flex items-center gap-2">
            <div className="w-8 h-8 shrink-0 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-lg">K</div>
            {/* Sembunyikan teks MyApp saat tertutup */}
            <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"}`}>
              Konsorsium
            </span>
          </span>
        </div>
        
                {/* Area Menu */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
          <p className={`px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 hidden"}`}>
            Menu Utama
          </p>

          {/* Render Menu Biasa */}
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => { if(window.innerWidth < 768) setIsOpen(false) }}
                className={`flex items-center rounded-xl transition-all duration-200 group
                  ${isOpen ? "px-3 py-2.5 gap-3" : "justify-center p-3"}
                  ${isActive ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"}
                `}
                title={item.name}
              >
                <div className={`shrink-0 ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                  {item.icon}
                </div>
                <span className={`text-sm whitespace-nowrap transition-all duration-300 overflow-hidden ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* --- MENU DATA CENTER (Dropdown) --- */}
          <div className="w-full">
            <button
              onClick={() => setIsDataCenterOpen(!isDataCenterOpen)}
              className={`w-full flex items-center rounded-xl transition-all duration-200 group cursor-pointer
                ${isOpen ? "px-3 py-2.5 justify-between" : "justify-center p-3"}
                ${pathname.includes("/dashboard/rikub") ? "text-blue-700 font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"}
              `}
              title="Data Center"
            >
              {/* Ikon & Teks */}
              <div className={`flex items-center ${isOpen ? "gap-3" : "justify-center w-full"}`}>
                <div className={`shrink-0 ${pathname.includes("/dashboard/rikub") ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                  <IconDataCenter />
                </div>
                <span className={`text-sm whitespace-nowrap transition-all duration-300 overflow-hidden ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"}`}>
                  Data Center
                </span>
              </div>
              
              {/* Ikon Panah */}
              <div className={`transition-transform duration-300 ${isDataCenterOpen ? "rotate-180" : ""} ${isOpen ? "block" : "hidden"}`}>
                <IconChevronDown />
              </div>
            </button>
            
            {/* Submenu */}
            {isDataCenterOpen && isOpen && (
              <div className="mt-1 ml-4 pl-4 border-l-2 border-slate-100 space-y-1">
                <Link
                  href="/dashboard/rikub"
                  onClick={() => { if(window.innerWidth < 768) setIsOpen(false) }}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                    pathname === "/dashboard/rikub" ? "text-blue-700 font-semibold bg-blue-50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium"
                  }`}
                >
                  RIKUB
                </Link>
              </div>
            )}
          </div>
        </nav>
        
        {/* Area Footer */}
        <div className={`p-4 border-t border-slate-100 transition-all duration-300 ${isOpen ? "" : "flex justify-center"}`}>
          <div className={`bg-slate-50 rounded-xl text-center overflow-hidden ${isOpen ? "p-4 w-full" : "p-2 w-10 h-10 flex items-center justify-center"}`}>
             <p className={`text-xs text-slate-500 whitespace-nowrap ${isOpen ? "block" : "hidden"}`}>Versi 1.0.0</p>
             {!isOpen && <span className="text-slate-400 font-bold text-xs">v1</span>}
          </div>
        </div>
      </aside>
    </>
  );
}