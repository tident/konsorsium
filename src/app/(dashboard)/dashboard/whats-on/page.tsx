// src/app/(dashboard)/dashboard/whats-on/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { callApi } from "../../../components/api";

type WhatsOnData = {
  id: string;
  type: string;
  title: string;
  desc: string;
  date: string;
  color: string;
  link: string;
  is_highlight: string; // "TRUE" atau "FALSE"
};

export default function WhatsOnPage() {
  const router = useRouter();
  const [data, setData] = useState<WhatsOnData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "Fitur Baru",
    title: "",
    desc: "",
    date: "Hari ini",
    color: "biru", // Nilai default nama warna
    link: "",
    is_highlight: "FALSE"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State Edit & Hapus
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State Notifikasi
  const [notification, setNotification] = useState<{ type: "success" | "error", message: string } | null>(null);

  // Opsi Warna (Menggunakan nama warna yang mudah dibaca)
  const colorOptions = [
    { label: "Biru (Fitur Baru)", value: "biru" },
    { label: "Hijau (Penyempurnaan)", value: "hijau" },
    { label: "Ungu (Keamanan)", value: "ungu" },
    { label: "Oranye (Peringatan/Panduan)", value: "oranye" },
    { label: "Indigo (Kartu Highlight)", value: "indigo" },
  ];

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

  useEffect(() => {
    const session = Cookies.get("user_session");
    if (session) {
      const user = JSON.parse(session);
      if (user.role !== "admin") {
        router.push("/dashboard");
        return;
      }
    } else {
      router.push("/login");
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    const res = await callApi("getWhatsOn");
    if (res.success) setData(res.data);
    setLoading(false);
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHighlightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, is_highlight: e.target.checked ? "TRUE" : "FALSE" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let res;
    if (isEditMode) {
      res = await callApi("updateWhatsOn", { ...formData, id: editId });
    } else {
      res = await callApi("addWhatsOn", formData);
    }

    if (res.success) {
      setIsModalOpen(false);
      showNotification("success", res.message);
      await fetchData();
    } else {
      showNotification("error", res.message || "Terjadi kesalahan.");
    }
    setIsSubmitting(false);
  };

  const handleOpenEdit = (item: WhatsOnData) => {
    setIsEditMode(true);
    setEditId(item.id);
    setFormData({
      type: item.type,
      title: item.title,
      desc: item.desc,
      date: item.date,
      color: item.color,
      link: item.link || "",
      is_highlight: item.is_highlight || "FALSE"
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteTarget({ id, name: title });
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    
    const res = await callApi("deleteWhatsOn", { id: deleteTarget.id });
    if (res.success) {
      await fetchData();
      showNotification("success", res.message);
      setDeleteTarget(null);
    } else {
      showNotification("error", "Gagal menghapus data.");
    }
    setIsDeleting(false);
  };

    if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-500 font-medium">Memuat data pengumuman...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen What's On</h1>
          <p className="text-slate-500 mt-1">Kelola informasi update, pengumuman utama, dan panduan di Dashboard.</p>
        </div>
        <button 
          onClick={() => {
            setIsEditMode(false);
            setFormData({ type: "Fitur Baru", title: "", desc: "", date: "Hari ini", color: "biru", link: "", is_highlight: "FALSE" });
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer shadow-md"
        >
          + Tambah Data
        </button>
      </div>

      {/* Tabel Data */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="px-6 py-4 font-medium">Tipe / Label</th>
                <th className="px-6 py-4 font-medium">Judul</th>
                <th className="px-6 py-4 font-medium">Status Highlight</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Belum ada data.</td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getBadgeColor(item.color)}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-500 truncate max-w-md">{item.desc}</p>
                      {item.link && <p className="text-[10px] text-blue-500 mt-1">Link: {item.link}</p>}
                    </td>
                    <td className="px-6 py-4">
                      {item.is_highlight === "TRUE" ? (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">Aktif (Highlight)</span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenEdit(item)} title="Edit" className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDeleteClick(item.id, item.title)} title="Hapus" className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL TAMBAH / EDIT ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">{isEditMode ? "Edit Data" : "Tambah Data Baru"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Update</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer">
                    <option value="Fitur Baru">Fitur Baru</option>
                    <option value="Penyempurnaan">Penyempurnaan</option>
                    <option value="Keamanan">Keamanan</option>
                    <option value="Highlight">Kartu Pengumuman Utama</option>
                    <option value="Panduan">Kartu Panduan (Putih)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal / Waktu</label>
                  <input type="text" name="date" value={formData.date} onChange={handleInputChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Misal: Hari ini, Kemarin, 01 Nov 2026" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul Utama</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Judul tebal..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea name="desc" value={formData.desc} onChange={handleInputChange} required rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Penjelasan singkat..."></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Warna Label / Badge</label>
                  <select name="color" value={formData.color} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer">
                    {colorOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Link Tujuan (Opsional)</label>
                  <input type="text" name="link" value={formData.link} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="/dashboard/profile atau /rikub" />
                </div>
              </div>

              {/* Checkbox Highlight */}
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="is_highlight"
                  checked={formData.is_highlight === "TRUE"}
                  onChange={handleHighlightChange}
                  className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div>
                  <label htmlFor="is_highlight" className="font-bold text-indigo-900 cursor-pointer text-sm">Jadikan Kartu Pengumuman Utama</label>
                  <p className="text-[11px] text-indigo-600">Jika dicentang, data ini akan menggantikan kartu biru besar di Dashboard.</p>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 cursor-pointer">
                  {isSubmitting ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL KONFIRMASI HAPUS ================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Data?</h3>
            <p className="text-slate-500 mb-6 text-sm">Apakah Anda yakin ingin menghapus <strong className="text-slate-800">"{deleteTarget.name}"</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors cursor-pointer disabled:opacity-50">Batal</button>
              <button onClick={executeDelete} disabled={isDeleting} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors cursor-pointer disabled:bg-red-300 disabled:cursor-not-allowed">
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= NOTIFIKASI ================= */}
      {notification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all">
          <div className={`flex flex-col items-center justify-center p-8 rounded-2xl shadow-2xl border bg-white animate-in zoom-in-95 duration-200 ${notification.type === 'success' ? 'border-green-200' : 'border-red-200'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${notification.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {notification.type === 'success' ? (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              )}
            </div>
            <h3 className={`text-xl font-bold mb-2 ${notification.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>{notification.type === 'success' ? 'Berhasil!' : 'Gagal!'}</h3>
            <p className="text-slate-600 text-center mb-6 max-w-xs text-sm">{notification.message}</p>
            <button onClick={() => setNotification(null)} className="w-full px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium transition-colors cursor-pointer">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}