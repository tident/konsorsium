// src/app/(dashboard)/layout.tsx
"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Area Konten Utama (Kanan) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Main Content & Footer */}
        <main className="flex-1 flex flex-col">
          {/* Wadah Konten */}
          <div className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
          
          {/* Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
}