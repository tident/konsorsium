// src/app/(dashboard)/dashboard/pair/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { callApi } from "../../../components/api";

type PairData = {
  pair_code: string;
  final_budget: number | string;
  result: string;
  unhas_coordinator: string;
  aus_co_lead: string;
  aus_university: string;
  team_members_institution: string;
  project_location: string;
  project_topic_code: string;
  project_sub_topic_code: string;
  main_topic: string;
  project_sub_topic_description: string;
  project_output: string;
  impact_partner: string;
  proposal_title: string;
  budget_request_dfat: string;
  au_In_kind_contribution_aud: string;
  year: string;
  [key: string]: any;
};

export default function PairDashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<string>("");
  const [data, setData] = useState<PairData[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error", message: string } | null>(null);

  // Filter, Search, Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOutput, setFilterOutput] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Checkbox & Hapus
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{ ids: string[], name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const session = Cookies.get("user_session");
    if (session) {
      const user = JSON.parse(session);
      setRole(user.role);
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const res = await callApi("getPairData");
    if (res.success) setData(res.data);
    setLoading(false);
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLoadData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return showNotification("error", "URL sumber data tidak boleh kosong.");

    setIsSubmitting(true);
    try {
      const response = await fetch(url);
      const jsonRes = await response.json();
      if (!jsonRes.success) throw new Error(jsonRes.message || "Gagal mengambil data.");

      const saveRes = await callApi("savePairData", {
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
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (pair_code: string) => {
    setDeleteTarget({ ids: [pair_code], name: `PAIR Code: ${pair_code}` });
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    
    const res = await callApi("deletePairData", { pair_codes: JSON.stringify(deleteTarget.ids) });
    
    if (res.success) {
      await fetchData();
      showNotification("success", res.message);
      setDeleteTarget(null);
      setSelectedIds([]);
    } else {
      showNotification("error", "Gagal menghapus data.");
    }
    setIsDeleting(false);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(currentItems.map(item => item.pair_code));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const uniqueOutputs = useMemo(() => {
    const items = data.map(item => String(item.project_output || "").trim()).filter(Boolean);
    return Array.from(new Set(items)).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const matchOutput = filterOutput === "all" || String(row.project_output).trim() === filterOutput;
      const q = searchTerm.toLowerCase().trim();
      const matchSearch = !q || 
        String(row.pair_code || "").toLowerCase().includes(q) ||
        String(row.unhas_coordinator || "").toLowerCase().includes(q) ||
        String(row.proposal_title || "").toLowerCase().includes(q);
      return matchOutput && matchSearch;
    });
  }, [data, searchTerm, filterOutput]);

    // Hitung Total Anggaran Terpilih
  const totalSelectedBudget = useMemo(() => {
    if (selectedIds.length === 0) return 0;
    return data
      .filter(item => selectedIds.includes(item.pair_code))
      .reduce((sum, item) => sum + (Number(item.final_budget) || 0), 0);
  }, [selectedIds, data]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  let startPage = Math.max(1, currentPage - 1);
  let endPage = Math.min(totalPages, startPage + 3);
  if (endPage - startPage < 3) startPage = Math.max(1, endPage - 3);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterOutput, itemsPerPage]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-500 font-medium">Memuat data PAIR...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Data Center PAIR</h1>
        <p className="text-slate-500 mt-1">Tarik dan kelola data program PAIR secara sementara.</p>
      </div>

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
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:bg-indigo-400 cursor-pointer whitespace-nowrap"
              >
                {isSubmitting ? "Menarik Data..." : "Load / Refresh"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="border border-slate-300 rounded-md px-2 py-1.5 outline-none cursor-pointer bg-white">
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={10000}>Semua</option>
              </select>
              <span>entries</span>
            </div>

            <select value={filterOutput} onChange={(e) => setFilterOutput(e.target.value)} className="border border-slate-300 rounded-md px-3 py-1.5 outline-none bg-white cursor-pointer">
              <option value="all">Semua Project Output</option>
              {uniqueOutputs.map(out => (
                <option key={out} value={out}>{out}</option>
              ))}
            </select>

            {role === "admin" && selectedIds.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 ml-auto lg:ml-0">
                {/* Kotak Total Anggaran */}
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md">
                  <span className="text-xs font-semibold text-emerald-800">Total Anggaran Terpilih:</span>
                  <span className="text-sm font-bold text-emerald-600">
                    Rp {totalSelectedBudget.toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Tombol Hapus Terpilih */}
                <button 
                  onClick={() => setDeleteTarget({ ids: selectedIds, name: `${selectedIds.length} Data PAIR` })}
                  className="flex items-center gap-1.5 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Hapus Terpilih ({selectedIds.length})
                </button>
              </div>
            )}
          </div>

          <div className="relative w-full lg:w-64">
            <input type="text" placeholder="Cari data..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-sm min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="px-4 py-3 w-10 font-medium">
                  {role === "admin" && (
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={currentItems.length > 0 && currentItems.every(item => selectedIds.includes(item.pair_code))}
                      className="w-4 h-4 cursor-pointer rounded border-slate-300"
                    />
                  )}
                </th>
                <th className="px-4 py-3 w-10 font-medium text-center">No</th>
                <th className="px-4 py-3 font-medium">Pair Code</th>
                <th className="px-4 py-3 font-medium">Unhas Coordinator</th>
                <th className="px-4 py-3 font-medium">Proposal Title</th>
                <th className="px-4 py-3 font-medium">Main Topic</th>
                <th className="px-4 py-3 font-medium">Project Output</th>
                <th className="px-4 py-3 font-medium text-right">Final Budget</th>
                {role === "admin" && <th className="px-4 py-3 font-medium text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={role === "admin" ? 9 : 8} className="px-4 py-8 text-center text-slate-400">Tidak ada data.</td>
                </tr>
              ) : (
                currentItems.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-center">
                      {role === "admin" && (
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(row.pair_code)}
                          onChange={() => handleSelectRow(row.pair_code)}
                          className="w-4 h-4 cursor-pointer rounded border-slate-300"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-center">{indexOfFirstItem + index + 1}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{row.pair_code}</td>
                    <td className="px-4 py-3 text-slate-600">{row.unhas_coordinator}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[300px] whitespace-pre-line">{row.proposal_title}</td>
                    <td className="px-4 py-3 text-slate-600">{row.main_topic}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        row.project_output === "Technology Focus" 
                          ? "bg-blue-50 text-blue-700" 
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {row.project_output}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">
                      Rp {Number(row.final_budget).toLocaleString('id-ID')}
                    </td>
                    {role === "admin" && (
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDeleteClick(row.pair_code)} title="Hapus" className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-600">
          <div>Menampilkan {filteredData.length > 0 ? indexOfFirstItem + 1 : 0} sampai {Math.min(indexOfLastItem, filteredData.length)} dari {filteredData.length} data</div>
          <div className="flex gap-1">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed">&lt;</button>
            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 border rounded-md cursor-pointer ${currentPage === page ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 hover:bg-slate-50'}`}>{page}</button>
            ))}
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed">&gt;</button>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Data?</h3>
            <p className="text-slate-500 mb-6 text-sm">Apakah Anda yakin ingin menghapus <strong>{deleteTarget.name}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors cursor-pointer disabled:opacity-50">Batal</button>
              <button onClick={executeDelete} disabled={isDeleting} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors cursor-pointer disabled:bg-red-300 disabled:cursor-not-allowed">
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

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