// src/app/page.tsx
"use client"; // Wajib ditambahkan karena kita menggunakan state untuk slider

import { useState, useEffect } from "react";
import Link from "next/link";
import PublicNavbar from "./components/PublicNavbar";
import PublicFooter from "./components/PublicFooter"

export default function LandingPage() {
  // State untuk Slider
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { src: "/kegiatanlandingpage/kegiatan1.png", caption: "Monev RIKUB Tahun Anggaran 2026" },
    { src: "/kegiatanlandingpage/kegiatan2.png", caption: "Monev RIKUB Tahun Anggaran 2026" },
    { src: "/kegiatanlandingpage/kegiatan3.png", caption: "Monev RIKUB Tahun Anggaran 2026" },
    { src: "/kegiatanlandingpage/kegiatan4.png", caption: "Monev RIKUB Tahun Anggaran 2026" },
    { src: "/kegiatanlandingpage/kegiatan5.png", caption: "Monev RIKUB Tahun Anggaran 2026" },
    { src: "/kegiatanlandingpage/kegiatan6.png", caption: "Monev RIKUB Tahun Anggaran 2026" },
    { src: "/kegiatanlandingpage/kegiatan7.png", caption: "Monev RIKUB Tahun Anggaran 2026" },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

    // Logika Auto-Play Slider (5 Detik)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 3000); // 3000 ms = 3 detik

    // Bersihkan interval jika komponen di-unmount
    return () => clearInterval(interval);
  }, [slides.length, currentSlide]); // Dependensi currentSlide agar timer reset saat user klik manual  

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* ================= NAVBAR ================= */}
      <PublicNavbar />

      {/* ================= MAIN CONTENT ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* Hero Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
          
          {/* Teks Kiri */}
          <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-indigo-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">Tim Kerja Konsorsium</span>
              <span className="bg-indigo-50 text-indigo-900 text-xs font-medium px-3 py-1 rounded-full">Monev onsite untuk pendanaan diatas 1M</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4 text-slate-900">
              Dokumentasi <span className="text-indigo-700">Kegiatan</span> Monev RIKUB TA 2026
            </h1>
            <p className="text-slate-500 mb-8 text-lg">
              Rangkaian monev onsite telah selesai dilaksanakan, dengan total 8 penerima pendanaan diatas 1M yang telah dikunjungi. Berikut adalah dokumentasi kegiatan monev onsite tersebut.
            </p>
            
            {/* Tombol Explore Projects (Mengarah ke RIKUB) */}
            <div>
              <Link 
                href="/rikub" 
                className="bg-indigo-900 hover:bg-indigo-800 text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-md inline-block cursor-pointer"
              >
                Explore Projects
              </Link>
            </div>
          </div>

          {/* Slider Kanan (Menggantikan Gambar Statis) */}
          <div className="md:w-1/2 relative bg-slate-100 min-h-[300px] md:min-h-[400px] group overflow-hidden">
            
            {/* Gambar Aktif */}
            <img 
              src={slides[currentSlide].src} 
              alt={`Kegiatan ${currentSlide + 1}`} 
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300" 
            />

            {/* Caption Bawah */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-10 pt-16 z-10">
              <p className="text-white text-sm md:text-base font-medium leading-snug">{slides[currentSlide].caption}</p>
            </div>

            {/* Tombol Navigasi Kiri (Prev) */}
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-slate-800 rounded-full flex items-center justify-center shadow-md cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>

            {/* Tombol Navigasi Kanan (Next) */}
            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-slate-800 rounded-full flex items-center justify-center shadow-md cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>

            {/* Indikator Titik (Dots) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    currentSlide === index ? "bg-white w-6" : "bg-white/50 hover:bg-white/80 w-2.5"
                  }`}
                />
              ))}
            </div>

            {/* Dekorasi Kotak-kotak (Opsional) */}
            {/* <div className="absolute bottom-0 right-0 flex z-10 pointer-events-none">
              <div className="w-16 h-16 bg-indigo-700"></div>
              <div className="w-16 h-16 bg-orange-500"></div>
            </div> */}
          </div>
        </div>

        {/* Statistik Section */}
        {/* Statistik Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          
          {/* Kartu 2025 - Penerima */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between min-h-[160px]">
            <div className="inline-block bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg w-fit mb-4">
              TA 2025
            </div>
            <div>
              <h3 className="text-4xl font-black text-indigo-950 mb-1">82</h3>
              <p className="text-sm text-slate-500 font-medium">Penerima Pendanaan</p>
            </div>
          </div>

          {/* Kartu 2025 - Anggaran */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between min-h-[160px]">
            <div className="inline-block bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg w-fit mb-4">
              TA 2025
            </div>
            <div>
              <h3 className="text-4xl font-black text-indigo-950 mb-1">Rp45,41 M</h3>
              <p className="text-sm text-slate-500 font-medium">Total Anggaran</p>
            </div>
          </div>

          {/* Kartu 2026 - Penerima */}
          <div className="bg-indigo-900 p-6 rounded-2xl shadow-md flex flex-col justify-between min-h-[160px] relative overflow-hidden">
             {/* Dekorasi Background */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg w-fit mb-4 relative z-10">
              TA 2026
            </div>
            <div className="relative z-10">
              <h3 className="text-4xl font-black text-white mb-1">102</h3>
              <p className="text-sm text-indigo-200 font-medium">Penerima Pendanaan</p>
            </div>
          </div>

          {/* Kartu 2026 - Anggaran */}
          <div className="bg-indigo-900 p-6 rounded-2xl shadow-md flex flex-col justify-between min-h-[160px] relative overflow-hidden">
             {/* Dekorasi Background */}
             <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg w-fit mb-4 relative z-10">
              TA 2026
            </div>
            <div className="relative z-10">
              <h3 className="text-4xl font-black text-white mb-1">Rp62,49 M</h3>
              <p className="text-sm text-indigo-200 font-medium">Total Anggaran</p>
            </div>
          </div>

        </div>

        {/* About Section */}
        <div className="flex flex-col md:flex-row gap-12 mt-20 mb-12">
          {/* Kiri: Judul & Logo */}
          <div className="md:w-1/3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-0.5 bg-orange-500"></div>
              <span className="text-sm font-bold text-slate-400 tracking-widest uppercase">About</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-8">
              Welcome to<br /><span className="text-indigo-900">Tim Konsorsium</span>
            </h2>
            {/* Logo Kementerian (Placeholder) */}
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-20 h-20 flex items-center justify-center overflow-hidden">
                   <img src={`/logo${i}.png`} alt="Logo" className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Kanan: Teks Deskripsi */}
          <div className="md:w-2/3 text-slate-600 space-y-4 text-lg leading-relaxed">
            <p className="font-semibold text-slate-800">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets.
            </p>
            <p>
             It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.
            </p>
          </div>
        </div>

      </main>
      {/* Tambahkan Footer di sini */}
      <PublicFooter />
    </div>
  );
}