// src/app/(dashboard)/dashboard/rikub/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import Cookies from "js-cookie";
import { callApi } from "../../../components/api";

// Komponen Loading Spinner
const TableSpinner = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    <p className="mt-3 text-sm text-slate-500 font-medium">Memuat data tabel...</p>
  </div>
);

type RikubData = {
  proposal_kegiatan_id: string;
  judul_proposal: string;
  nama: string;
  tahun_pendanaan: string;
  pendanaan: number | string;
  nama_institusi_ketua_konsorsium: string;
  status_tahun_pelaksanaan: string;
  lama_konsorsium: string;
  [key: string]: any;
};

export default function RikubDashboardPage() {
  // State Role User
  const [role, setRole] = useState<string>("");

  // State Data & Loading
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingTable, setLoadingTable] = useState(true);
  const [data, setData] = useState<RikubData[]>([]);
  const [notification, setNotification] = useState<{ type: "success" | "error", message: string } | null>(null);

  // State Filter, Pencarian, & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("all");
  const [filterPendanaan, setFilterPendanaan] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // State Checkbox (Pilih Banyak)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // State Modal Konfirmasi Hapus
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Ambil Role User & Data Awal
  useEffect(() => {
    const session = Cookies.get("user_session");
    if (session) {
      const user = JSON.parse(session);
      setRole(user.role);
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingTable(true);
    const res = await callApi("getRikubData");
    if (res.success) {
      setData(res.data);
      setSelectedIds([]);
    }
    setLoadingTable(false);
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // 2. Fungsi Tarik Data
  const handleLoadData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return showNotification("error", "URL sumber data tidak boleh kosong.");

    setLoading(true);
    try {
      const response = await fetch(url);
      const jsonRes = await response.json();
      if (!jsonRes.success) throw new Error(jsonRes.message || "Gagal mengambil data.");

      const saveRes = await callApi("saveRikubData", {
        url: url,
        json_data: JSON.stringify(jsonRes.data)
      });

      if (saveRes.success) {
        showNotification("success", saveRes.message);
        await fetchData();
      } else {
        showNotification("error", saveRes.message || "Gagal menyimpan data.");
      }
    } catch (error: any) {
      showNotification("error", "Gagal menarik data. Pastikan URL valid dan dapat diakses publik.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Fungsi Hapus Data Terpilih
  const executeDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    
    // Optimistic UI: Langsung hapus dari layar
    const prevData = [...data];
    setData(prev => prev.filter(item => !selectedIds.includes(item.proposal_kegiatan_id)));
    setIsDeleteModalOpen(false);

    // Kirim ke backend
    const res = await callApi("deleteSelectedRikubData", { ids: JSON.stringify(selectedIds) });

    if (res.success) {
      showNotification("success", res.message);
      setSelectedIds([]);
    } else {
      setData(prevData); // Rollback jika gagal
      showNotification("error", "Gagal menghapus data.");
    }
    setIsDeleting(false);
  };

  // 4. Filter & Pencarian
  const uniqueYears = useMemo(() => {
    const years = data.map(item => item.tahun_pendanaan).filter(Boolean);
    return Array.from(new Set(years)).sort().reverse();
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const searchString = searchTerm.toLowerCase();
      const matchesSearch = Object.values(row).some(
        val => val && val.toString().toLowerCase().includes(searchString)
      );
      const matchesYear = filterYear === "all" || row.tahun_pendanaan?.toString() === filterYear;
      const pendanaanNum = Number(row.pendanaan?.toString().replace(/[^0-9.-]+/g, "")) || 0;
      const matchesPendanaan = !filterPendanaan || pendanaanNum > 1000000000;

      return matchesSearch && matchesYear && matchesPendanaan;
    });
  }, [data, searchTerm, filterYear, filterPendanaan]);

  // 5. Pagination (Maksimal 4 Tombol)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  let startPage = Math.max(1, currentPage - 1);
  let endPage = Math.min(totalPages, startPage + 3);
  if (endPage - startPage < 3) startPage = Math.max(1, endPage - 3);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterYear, filterPendanaan, itemsPerPage]);

  // 6. Logika Checkbox
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const idsOnPage = currentItems.map(item => item.proposal_kegiatan_id);
      setSelectedIds(idsOnPage);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Data Center RIKUB</h1>
        <p className="text-slate-500 mt-1">Tarik dan kelola data dari URL sumber secara sementara.</p>
      </div>

      {/* Form Input URL (Hanya Admin) */}
      {role === "admin" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <form onSubmit={handleLoadData}>
            <label className="block text-sm font-medium text-slate-700 mb-2">URL Sumber Data (JSON)</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:bg-blue-400 cursor-pointer whitespace-nowrap"
              >
                {loading ? "Menarik Data..." : "Load / Refresh"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabel & Kontrol */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Area Kontrol */}
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select 
                value={itemsPerPage} 
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="border border-slate-300 rounded-md px-2 py-1.5 outline-none cursor-pointer bg-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={10000}>Semua</option>
              </select>
              <span>entries</span>
            </div>

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="border border-slate-300 rounded-md px-3 py-1.5 outline-none bg-white cursor-pointer"
            >
              <option value="all">Semua Tahun</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-100 transition-colors">
              <input 
                type="checkbox" 
                checked={filterPendanaan}
                onChange={(e) => setFilterPendanaan(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="font-medium text-slate-700">Pendanaan &gt; 1 M</span>
            </label>

            {/* Tombol Hapus (Hanya Admin & Jika Ada yang Dipilih) */}
            {role === "admin" && selectedIds.length > 0 && (
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-1.5 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ml-auto lg:ml-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Hapus {selectedIds.length} Data Terpilih
              </button>
            )}
          </div>

          <div className="relative w-full lg:w-64">
            <input
              type="text"
              placeholder="Cari data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Tabel Utama */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="px-4 py-3 w-10">
                  {role === "admin" ? (
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={currentItems.length > 0 && currentItems.every(item => selectedIds.includes(item.proposal_kegiatan_id))}
                      className="w-4 h-4 cursor-pointer rounded border-slate-300"
                    />
                  ) : (
                    <span className="sr-only">Aksi</span>
                  )}
                </th>
                <th className="px-4 py-3 font-medium text-center w-12">No</th>
                <th className="px-4 py-3 font-medium w-[30%] min-w-[250px]">Judul Proposal</th>
                <th className="px-4 py-3 font-medium w-[15%] min-w-[120px]">Nama Ketua</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Tahun</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Pendanaan</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Status Pelaksanaan</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Lama Konsorsium</th>
                <th className="px-4 py-3 font-medium w-[20%] min-w-[150px]">Institusi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {loadingTable ? (
                <tr>
                  <td colSpan={9}>
                    <TableSpinner />
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    Tidak ada data yang cocok dengan filter/pencarian Anda.
                  </td>
                </tr>
              ) : (
                currentItems.map((row, index) => {
                  const isSelected = selectedIds.includes(row.proposal_kegiatan_id);
                  
                  // Logika Warna Status Pelaksanaan (Light)
                  const statusStr = String(row.status_tahun_pelaksanaan || "").toLowerCase();
                  let statusClass = "bg-slate-100 text-slate-600 border border-slate-200";
                  if (statusStr.includes("kedua")) statusClass = "bg-blue-50 text-blue-600 border border-blue-200";
                  if (statusStr.includes("ketiga")) statusClass = "bg-purple-50 text-purple-600 border border-purple-200";

                  // Logika Warna Lama Konsorsium (Solid)
                  const lama = String(row.lama_konsorsium || "").trim();
                  let lamaClass = "bg-slate-500 text-white";
                  if (lama === "2") lamaClass = "bg-blue-500 text-white";
                  if (lama === "3") lamaClass = "bg-purple-600 text-white";

                  return (
                    <tr key={index} className={`transition-colors ${isSelected ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                      <td className="px-4 py-3">
                        {role === "admin" && (
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => handleSelectRow(row.proposal_kegiatan_id)}
                            className="w-4 h-4 cursor-pointer rounded border-slate-300"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-center">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 py-3 font-medium text-slate-800 break-words">
                        {row.judul_proposal}
                      </td>
                      <td className="px-4 py-3 text-slate-600 break-words">{row.nama}</td>
                      
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                          String(row.tahun_pendanaan) === "2025" 
                            ? "bg-slate-100 text-slate-600 border border-slate-200" 
                            : "bg-blue-50 text-blue-600 border border-blue-200"
                        }`}>
                          {row.tahun_pendanaan}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-bold">
                          Rp {Number(row.pendanaan).toLocaleString('id-ID')}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${statusClass}`}>
                          {row.status_tahun_pelaksanaan || "-"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${lamaClass}`}>
                          {lama || "-"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-600 break-words">
                        {row.nama_institusi_ketua_konsorsium}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-600">
          <div>
            Menampilkan {filteredData.length > 0 ? indexOfFirstItem + 1 : 0} sampai {Math.min(indexOfLastItem, filteredData.length)} dari {filteredData.length} data
          </div>
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
            >
              &lt;
            </button>
            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded-md cursor-pointer ${currentPage === page ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 hover:bg-slate-50'}`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODAL KONFIRMASI HAPUS ================= */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Data?</h3>
            <p className="text-slate-500 mb-6">
              Apakah Anda yakin ingin menghapus <strong>{selectedIds.length} data terpilih</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                disabled={isDeleting} 
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button 
                onClick={executeDelete} 
                disabled={isDeleting} 
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors cursor-pointer disabled:bg-red-300 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifikasi Pop-up */}
      {notification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all">
          <div className={`flex flex-col items-center justify-center p-8 rounded-2xl shadow-2xl border bg-white animate-in zoom-in-95 duration-200 ${
            notification.type === 'success' ? 'border-green-200' : 'border-red-200'
          }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              notification.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {notification.type === 'success' ? (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              )}
            </div>
            <h3 className={`text-xl font-bold mb-2 ${notification.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
              {notification.type === 'success' ? 'Berhasil!' : 'Gagal!'}
            </h3>
            <p className="text-slate-600 text-center mb-6 max-w-xs">{notification.message}</p>
            <button onClick={() => setNotification(null)} className="w-full px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium transition-colors cursor-pointer">
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}