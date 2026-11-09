// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { callApi } from "../components/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // State untuk fitur baru
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const res = await callApi("login", { username, password });

    if (res.success) {
      const cookieOptions = rememberMe ? { expires: 7 } : undefined;
      Cookies.set("user_session", JSON.stringify(res.user), cookieOptions);
      router.push("/dashboard");
    } else {
      setErrorMsg(res.message || "Terjadi kesalahan saat login");
    }
    
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-white">
            {/* BAGIAN KIRI: Desain/Gambar (Split-Screen) */}
      <div 
        className="hidden lg:flex lg:w-1/2 text-white flex-col justify-between p-12 relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/background.png')" }} 
      >
        {/* Overlay gelap agar teks tetap terbaca di atas gambar */}
        {/* <div className="absolute inset-0 bg-black/30 z-0"></div> */}
        <div className="absolute inset-0 z-0"></div>
        
        {/* (Hapus dua div lingkaran biru yang lama) */}
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-wider"></h1>
          <p className="mt-4 text-slate-300"></p>
        </div>

        <div className="relative z-10">
          <blockquote className="text-lg italic text-slate-200">
            
          </blockquote>
        </div>
      </div>

      {/* BAGIAN KANAN: Form Login */}
      <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:px-20 xl:px-24">
        <div className="w-full max-w-lg mx-auto">
          
          {/* --- AREA LOGO (Rata Kiri) --- */}
           <div className="flex flex-wrap gap-2 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-20 flex items-center justify-center overflow-hidden">
                <img 
                  src={`/logo${i}.png`} 
                  alt={`Logo ${i}`} 
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>

          {/* --- AREA TEKS SAMBUTAN (Rata Kiri) --- */}
          <div className="mb-10 text-left">
            <h2 className="text-3xl font-extrabold text-[#4b2c88] tracking-tight">
              Tim Kerja Konsorsium 
            </h2>
            <p className="mt-4 text-base text-slate-700 leading-relaxed">
              Direktorat Penelitian dan Pengabdian pada Masyarakat (DPPM)
              Direktorat Jenderal Riset dan Pengembangan.
            </p>
          </div>

          {/* --- AREA FORM LOGIN --- */}
          {errorMsg && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Input Username */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4b2c88] focus:border-[#4b2c88] outline-none transition-all text-slate-900"
                placeholder="Masukkan username"
                required
              />
            </div>

            {/* Input Password dengan Show/Hide */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4b2c88] focus:border-[#4b2c88] outline-none transition-all text-slate-900 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#4b2c88] bg-gray-100 border-gray-300 rounded focus:ring-[#4b2c88] cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 text-sm text-slate-700 cursor-pointer">
                Remember me
              </label>
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4b2c88] hover:bg-[#381f69] text-white font-bold py-3 rounded-lg transition-all disabled:opacity-70 flex justify-center items-center cursor-pointer mt-2"
            >
              {loading ? "Authenticating..." : "Log in"}
            </button>
          </form>

          <p className="mt-8 text-left text-sm text-slate-500">
            Belum punya akun? Hubungi Administrator.
          </p>
        </div>
      </div>
    </div>
  );
}