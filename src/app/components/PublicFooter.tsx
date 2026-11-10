// src/app/components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Grid Utama Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Kolom 1: Logo & Deskripsi */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold">K</div>
              <span className="text-xl font-bold text-white tracking-wide">Konsorsium</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Platform terintegrasi untuk mengelola ekosistem penelitian, pendanaan, dan hilirisasi inovasi dari perguruan tinggi, industri, dan pemerintah.
            </p>
            {/* Logo Mitra (Opsional) */}
            <div className="flex gap-3 pt-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden p-1">
                   <img src={`/logo${i}.png`} alt="Logo" className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
          </div>

          {/* Kolom 2: Tautan Cepat */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Tautan Cepat</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="hover:text-indigo-400 transition-colors flex items-center gap-2">
                  <span className="text-indigo-500">›</span> Home
                </Link>
              </li>
              <li>
                <Link href="/rikub" className="hover:text-indigo-400 transition-colors flex items-center gap-2">
                  <span className="text-indigo-500">›</span> Program RIKUB
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-indigo-400 transition-colors flex items-center gap-2">
                  <span className="text-indigo-500">›</span> Login Pengguna
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Kontak & Info */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Hubungi Kami</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>Gedung D. Jl. Raya Jend Sudirman Pintu I, Senayan, Kebayoran Baru, RT.1/RW.3, Gelora, Kecamatan Tanah Abang, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 10270</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span>konsorsium.risbang@kemdiktisaintek.go.id</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span>0822-8999-7515</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Garis Pembatas & Copyright */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            &copy; 2026 Tim Konsorsium. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-slate-500">
            <Link href="#" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
            <Link href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}