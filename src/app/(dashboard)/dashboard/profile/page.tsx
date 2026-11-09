// src/app/(dashboard)/dashboard/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { callApi } from "../../../components/api";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error", message: string } | null>(null);

  // State Form
  const [userData, setUserData] = useState({
    user_id: "",
    full_name: "",
    username: "",
    role: "",
    password: "",
  });

  useEffect(() => {
    const session = Cookies.get("user_session");
    if (session) {
      try {
        const user = JSON.parse(session);
        setUserData({
          user_id: user.user_id,
          full_name: user.full_name,
          username: user.username,
          role: user.role,
          password: "",
        });
      } catch (e) {}
    }
    setLoading(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const res = await callApi("updateProfile", userData);

    if (res.success) {
      Cookies.set("user_session", JSON.stringify(res.user), { expires: 1 });
      setUserData(prev => ({ ...prev, password: "" }));
      showNotification("success", res.message);
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      showNotification("error", res.message || "Gagal memperbarui profil.");
    }

    setIsSaving(false);
  };

  if (loading) return <div className="p-6 text-center text-slate-500 text-sm">Memuat profil...</div>;

  // Ambil inisial untuk Avatar
  const initial = userData.full_name ? userData.full_name.charAt(0).toUpperCase() : "U";

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-300">
      
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Profil Saya</h1>
        <p className="text-xs text-slate-500 mt-0.5">Perbarui informasi akun dan kata sandi Anda.</p>
      </div>

      {/* Main Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Banner Ringkas */}
        <div className="h-16 bg-gradient-to-r from-indigo-900 via-indigo-700 to-blue-500 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        </div>

        <div className="px-6 pb-6">
          
          {/* Header & Avatar Compact */}
          <div className="flex items-end gap-4 -mt-7 mb-4 relative z-10">
            <div className="w-14 h-14 rounded-full bg-white p-0.5 shadow-md shrink-0">
              <div className="w-full h-full rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-black border border-indigo-200">
                {initial}
              </div>
            </div>
            <div className="pt-8">
              <h2 className="text-lg font-bold text-slate-800 leading-tight">{userData.full_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  {userData.role}
                </span>
                <span className="text-slate-400 text-xs">@{userData.username}</span>
              </div>
            </div>
          </div>

          {/* Form Edit Grid Compact */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Read-Only Info */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">
                  Username
                </label>
                <input 
                  type="text" 
                  value={userData.username} 
                  disabled
                  className="w-full px-2 py-1 bg-transparent text-slate-600 cursor-not-allowed outline-none font-medium text-xs border-b border-slate-200" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">
                  Hak Akses
                </label>
                <input 
                  type="text" 
                  value={userData.role.toUpperCase()} 
                  disabled
                  className="w-full px-2 py-1 bg-transparent text-slate-600 cursor-not-allowed outline-none font-bold text-xs border-b border-slate-200" 
                />
              </div>
            </div>

            {/* Editable Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <input 
                    type="text" 
                    name="full_name" 
                    value={userData.full_name} 
                    onChange={handleInputChange} 
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium text-slate-800 transition-all" 
                  />
                </div>
              </div>

              {/* Password Baru */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password Baru <span className="text-slate-400 font-normal">(opsional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input 
                    type="password" 
                    name="password" 
                    value={userData.password} 
                    onChange={handleInputChange}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium text-slate-800 transition-all" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button 
                type="submit" 
                disabled={isSaving}
                className="px-5 py-2 bg-indigo-600 text-white text-xs rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 disabled:bg-indigo-400 flex items-center gap-1.5 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* Pop-up Notifikasi */}
      {notification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all">
          <div className={`flex flex-col items-center justify-center p-6 rounded-2xl shadow-2xl border bg-white animate-in zoom-in-95 duration-200 max-w-xs w-full ${
            notification.type === 'success' ? 'border-green-200' : 'border-red-200'
          }`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
              notification.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {notification.type === 'success' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              )}
            </div>
            <h3 className={`text-base font-bold mb-1 ${notification.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
              {notification.type === 'success' ? 'Berhasil!' : 'Gagal!'}
            </h3>
            <p className="text-slate-600 text-center text-xs mb-4">{notification.message}</p>
            <button onClick={() => setNotification(null)} className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium text-xs transition-colors cursor-pointer">
              Tutup
            </button>
          </div>
        </div>
      )}

    </div>
  );
}