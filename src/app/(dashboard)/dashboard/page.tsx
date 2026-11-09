// src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";

export default function DashboardHomePage() {
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const session = Cookies.get("user_session");
    if (session) {
      try {
        const user = JSON.parse(session);
        setUserName(user.full_name); 
      } catch (e) {}
    }
  }, []);

  // Data Mockup untuk What's On
  const whatsOnUpdates = [
    {
      id: 1,
      type: "Fitur Baru",
      title: "Peta Sebaran Interaktif di Halaman RIKUB",
      desc: "Sekarang Anda dapat melihat persebaran pendanaan RIKUB per provinsi melalui peta interaktif.",
      date: "Kemarin",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      )
    },
    {
      id: 2,
      type: "Penyempurnaan",
      title: "Optimasi Tampilan Tabel Data Center",
      desc: "Tabel Data Center RIKUB kini dilengkapi fitur hapus massal dan pewarnaan status pelaksanaan.",
      date: "4 hari lalu",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      )
    },
    {
      id: 3,
      type: "Keamanan",
      title: "Peningkatan Keamanan Sesi Login",
      desc: "Sistem kini menggunakan HTTPS dan Cookie terenkripsi untuk menjaga keamanan akun Anda.",
      date: "10 hari lalu",
      color: "bg-purple-50 text-purple-700 border-purple-200",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
      )
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* Header Sapaan Compact */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          Halo, {userName}!
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Berikut adalah ringkasan aktivitas dan informasi terbaru aplikasi Anda hari ini.
        </p>
      </div>

      {/* Grid What's On */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* Kiri: Highlight Utama */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
            What's On
          </h2>
          
          {/* Kartu Pengumuman Ukuran Semula (P-6) */}
          <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            {/* Dekorasi Background */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-10 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10">
              <span className="inline-block bg-orange-500 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                Pengumuman
              </span>
              <h3 className="text-xl font-bold mb-2 leading-tight">
                Selamat Datang di Portal Baru Tim Konsorsium!
              </h3>
              <p className="text-indigo-100 text-sm mb-5 leading-relaxed max-w-lg">
                Kami telah memperbarui antarmuka untuk memberikan pengalaman yang lebih baik. Jelajahi fitur-fitur baru dan pastikan profil Anda sudah diperbarui.
              </p>
              <Link 
                href="/dashboard/profile"
                className="inline-block bg-white text-indigo-900 hover:bg-indigo-50 px-5 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
              >
                Perbarui Profil
              </Link>
            </div>
          </div>

          {/* Kartu Info Tambahan */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Buku Panduan RIKUB Tahun 2026</h3>
              <p className="text-xs text-slate-500 mb-1">Dashboard RIKUB</p>
              <Link href="/rikub" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                Lihat Panduan
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Kanan: List Update Terkini */}
        <div className="lg:col-span-1">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Update Terbaru
          </h2>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              
              {whatsOnUpdates.map((update, idx) => (
                <div key={idx} className="relative flex items-start gap-3">
                  {/* Ikon dengan warna spesifik */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-sm ${update.color.split(' ')[0]} ${update.color.split(' ')[1]}`}>
                    {update.icon}
                  </div>
                  
                  {/* Konten Update */}
                  <div className="pt-0.5">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${update.color}`}>
                        {update.type}
                      </span>
                      <span className="text-[11px] text-slate-400">{update.date}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight mb-0.5">{update.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-normal">{update.desc}</p>
                  </div>
                </div>
              ))}
              
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}