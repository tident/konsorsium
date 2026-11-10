// src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import { callApi } from "../../components/api";

type WhatsOnData = {
  id: string;
  type: string;
  title: string;
  desc: string;
  date: string;
  color: string;
  link: string;
  is_highlight: string;
};

export default function DashboardHomePage() {
  const [userName, setUserName] = useState("User");
  const [whatsOnUpdates, setWhatsOnUpdates] = useState<WhatsOnData[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(true);
  
  // State untuk Slider Pengumuman Utama
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    const session = Cookies.get("user_session");
    if (session) {
      try {
        const user = JSON.parse(session);
        setUserName(user.full_name); 
      } catch (e) {}
    }

    const fetchUpdates = async () => {
      const res = await callApi("getWhatsOn");
      if (res.success) {
        setWhatsOnUpdates(res.data);
      }
      setLoadingUpdates(false);
    };
    fetchUpdates();
  }, []);

  // Pisahkan data berdasarkan tipenya
  const highlightData = whatsOnUpdates.filter(item => String(item.is_highlight).toLowerCase() === "true");
  const panduanData = whatsOnUpdates.find(item => String(item.type).toLowerCase() === "panduan");
  const listUpdates = whatsOnUpdates.filter(item => 
    String(item.is_highlight).toLowerCase() !== "true" && 
    String(item.type).toLowerCase() !== "panduan"
  );

  // Fungsi Ikon untuk List Update
  const getIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("fitur")) return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
    if (t.includes("penyempurnaan") || t.includes("optimasi")) return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    if (t.includes("keamanan")) return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  };

  // Fungsi untuk memetakan warna badge (Light Background)
  const getBadgeColor = (colorName: string) => {
    switch (String(colorName).toLowerCase()) {
      case "hijau": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "ungu": return "bg-purple-50 text-purple-700 border-purple-200";
      case "oranye": return "bg-orange-50 text-orange-700 border-orange-200";
      case "indigo": return "bg-indigo-600 text-white border-indigo-700";
      case "biru":
      default: return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  // Fungsi untuk gradasi warna kartu Highlight
  const getHighlightGradient = (colorName: string) => {
    switch (String(colorName).toLowerCase()) {
      case "hijau": return "from-emerald-900 to-emerald-700";
      case "ungu": return "from-purple-900 to-purple-700";
      case "oranye": return "from-orange-900 to-orange-600";
      case "indigo": return "from-indigo-900 to-indigo-700";
      case "biru":
      default: return "from-blue-900 to-blue-700";
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* Header Sapaan */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Halo, {userName}!</h1>
          <p className="text-xs text-slate-500 mt-0.5">Berikut adalah ringkasan aktivitas dan informasi terbaru aplikasi Anda hari ini.</p>
        </div>
        
        <Link href="/" className="group flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 cursor-pointer shrink-0">
          <svg className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Halaman Utama
        </Link>
      </div>

      {loadingUpdates ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          
          {/* Kiri: Highlight & Panduan */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
              What's On
            </h2>
            
            {/* Kartu Highlight Dinamis (Carousel) */}
            {highlightData.length > 0 ? (
              <div className="relative group w-full overflow-hidden rounded-2xl shadow-md">
                {/* Wadah Slider */}
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${highlightIndex * 100}%)` }}
                >
                  {highlightData.map((item) => (
                    <div key={item.id} className={`min-w-full shrink-0 bg-gradient-to-r ${getHighlightGradient(item.color)} p-6 text-white relative overflow-hidden`}>
                      {/* Dekorasi Background */}
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                      <div className="absolute bottom-0 right-10 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl pointer-events-none"></div>

                      <div className="relative z-10">
                        <span className="inline-block bg-orange-500 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                          {item.date}
                        </span>
                        <h3 className="text-xl font-bold mb-2 leading-tight">{item.title}</h3>
                        <p className="text-indigo-100 text-sm mb-5 leading-relaxed max-w-lg line-clamp-3">{item.desc}</p>
                        {item.link && (
                          <Link href={item.link} className="inline-block bg-white text-indigo-900 hover:bg-indigo-50 px-5 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer">
                            Selengkapnya
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigasi Panah (Hanya muncul jika data > 1) */}
                {highlightData.length > 1 && (
                  <>
                    <button 
                      onClick={() => setHighlightIndex(prev => prev === 0 ? highlightData.length - 1 : prev - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-20"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button 
                      onClick={() => setHighlightIndex(prev => prev === highlightData.length - 1 ? 0 : prev + 1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-20"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>

                    {/* Indikator Titik (Dots) */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-20">
                      {highlightData.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setHighlightIndex(idx)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            highlightIndex === idx ? "bg-white w-4" : "bg-white/40 hover:bg-white/70 w-1.5"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 text-center text-slate-500">
                Belum ada Pengumuman Utama.
              </div>
            )}

            {/* Kartu Panduan Dinamis */}
            {panduanData && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{panduanData.title}</h3>
                  <p className="text-xs text-slate-500 mb-1">{panduanData.desc}</p>
                  {panduanData.link && (
                    <Link href={panduanData.link} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                      Buka Panduan
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Kanan: List Update Terkini */}
          <div className="lg:col-span-1">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Update Terbaru
            </h2>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm min-h-[200px]">
              {listUpdates.length === 0 ? (
                <div className="text-center text-slate-400 text-sm py-10">Belum ada update terbaru.</div>
              ) : (
                <div className="space-y-4 relative before:absolute before:inset-0 before:left-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  
                  {listUpdates.map((update, idx) => (
                    <div key={idx} className="relative flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-sm ${getBadgeColor(update.color).split(' ')[0]} ${getBadgeColor(update.color).split(' ')[1]}`}>
                        {getIcon(update.type)}
                      </div>
                      <div className="pt-0.5">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${getBadgeColor(update.color)}`}>{update.type}</span>
                          <span className="text-[11px] text-slate-400">{update.date}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 leading-tight mb-0.5">{update.title}</h4>
                        <p className="text-[11px] text-slate-500 leading-normal">{update.desc}</p>
                      </div>
                    </div>
                  ))}
                  
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}