// src/app/(dashboard)/dashboard/accounts/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { callApi } from "../../../components/api";

// Tipe data untuk TypeScript
type User = {
  user_id: string;
  full_name: string;
  username: string;
  role: string;
  status: string;
  created_at: string;
};

// Komponen Loading Spinner
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center p-10 min-h-[400px]">
    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    <p className="mt-4 text-slate-500 font-medium">Memuat data akun...</p>
  </div>
);

export default function AccountsPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Pencarian & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default 10

  // State Checkbox (Pilih Banyak)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // State Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "", username: "", password: "", role: "operator", status: "active",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editUserId, setEditUserId] = useState("");

  // State Konfirmasi Hapus
  const [deleteTarget, setDeleteTarget] = useState<{ ids: string[], name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State Notifikasi
  const [notification, setNotification] = useState<{ type: "success" | "error", message: string } | null>(null);

  // Menyimpan info user yang sedang login (agar tidak bisa dihapus)
  const [currentUserId, setCurrentUserId] = useState("");

  // 1. Satpam & Ambil Data
  useEffect(() => {
    const session = Cookies.get("user_session");
    if (session) {
      const user = JSON.parse(session);
      setCurrentUserId(user.user_id); // Simpan ID user yang login
      if (user.role !== "admin") {
        router.push("/dashboard");
        return;
      }
    } else {
      router.push("/login");
      return;
    }
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    const res = await callApi("getUsers");
    if (res.success) {
      setUsers(res.data);
    }
    setLoading(false);
  };

  // Handler Form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let res;
    if (isEditMode) {
      res = await callApi("updateUser", { ...formData, user_id: editUserId });
    } else {
      res = await callApi("addUser", formData);
    }

    if (res.success) {
      setIsModalOpen(false);
      setFormData({ full_name: "", username: "", password: "", role: "operator", status: "active" });
      
      // 1. Tampilkan notifikasi SEGERA setelah simpan sukses
      showNotification("success", res.message);
      
      // 2. Refresh tabel di latar belakang (Hapus kata 'await')
      fetchUsers(); 
      
    } else {
      showNotification("error", res.message || "Terjadi kesalahan.");
    }
    setIsSubmitting(false);
  };

  const handleOpenEdit = (user: User) => {
    setIsEditMode(true);
    setEditUserId(user.user_id);
    setFormData({
      full_name: user.full_name,
      username: user.username, // Username sekarang bisa diedit
      password: "", 
      role: user.role,
      status: user.status,
    });
    setIsModalOpen(true);
  };

  // --- LOGIKA HAPUS ---
  // Hapus Tunggal
  const handleDeleteClick = (user_id: string, full_name: string) => {
    setDeleteTarget({ ids: [user_id], name: full_name });
  };

  // Hapus Banyak (Bulk Delete)
  const handleBulkDeleteClick = () => {
    if (selectedUsers.length === 0) return;
    setDeleteTarget({ ids: selectedUsers, name: `${selectedUsers.length} akun terpilih` });
  };

    const executeDelete = async () => {
    if (!deleteTarget) return;
    
    // 1. Simpan data lama untuk berjaga-jaga
    const previousUsers = [...users];
    const idsToDelete = deleteTarget.ids;
    const count = idsToDelete.length;

    // 2. TUTUP MODAL & UPDATE TABEL SEGERA (0 detik)
    setDeleteTarget(null);
    setSelectedUsers([]);
    setUsers(prev => prev.filter(u => !idsToDelete.includes(u.user_id)));
    
    // 3. TAMPILKAN POP-UP SEGERA (0 detik)
    showNotification("success", `${count} akun berhasil dihapus`);

    // 4. Kirim ke Google di latar belakang (TANPA AWAIT di depan callApi)
    try {
      if (idsToDelete.length === 1) {
        callApi("deleteUser", { user_id: idsToDelete[0] }).then(res => {
          if (!res.success) {
            setUsers(previousUsers); // Rollback jika gagal
            showNotification("error", res.message || "Gagal menghapus akun.");
          } else {
            fetchUsers(); // Sinkronisasi data
          }
        });
      } else {
        callApi("deleteMultipleUsers", { user_ids: JSON.stringify(idsToDelete) }).then(res => {
          if (!res.success) {
            setUsers(previousUsers); // Rollback jika gagal
            showNotification("error", res.message || "Gagal menghapus akun.");
          } else {
            fetchUsers(); // Sinkronisasi data
          }
        });
      }
    } catch (err) {
      setUsers(previousUsers);
      showNotification("error", "Gagal terhubung ke server.");
    }
  };

  // --- LOGIKA CHECKBOX & PAGINATION ---
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // Pilih semua yang ada di halaman ini (kecuali diri sendiri)
      const idsOnPage = currentItems.filter(u => u.user_id !== currentUserId).map(u => u.user_id);
      setSelectedUsers(idsOnPage);
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (user_id: string) => {
    if (user_id === currentUserId) return; // Jangan izinkan pilih diri sendiri
    setSelectedUsers(prev => 
      prev.includes(user_id) ? prev.filter(id => id !== user_id) : [...prev, user_id]
    );
  };

  // 2. Filter & Pagination Calculation
  const filteredUsers = users.filter((user) => {
    const fullName = String(user.full_name || "").toLowerCase();
    const username = String(user.username || "").toLowerCase();
    const search = String(searchTerm || "").toLowerCase();

    const matchesSearch = fullName.includes(search) || username.includes(search);
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header & Tombol Tambah/Hapus */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Akun</h1>
          <p className="text-slate-500 mt-1">Kelola akses dan hak pengguna aplikasi.</p>
        </div>
        <div className="flex gap-3">
          {selectedUsers.length > 0 && (
            <button 
              onClick={handleBulkDeleteClick}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Hapus Terpilih ({selectedUsers.length})
            </button>
          )}
          <button 
            onClick={() => {
              setIsEditMode(false);
              setFormData({ full_name: "", username: "", password: "", role: "operator", status: "active" });
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
          >
            + Tambah Akun
          </button>
        </div>
      </div>

      {/* Card Tabel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Header Card: Show entries, Search, Filter */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Show</span>
            <select 
              value={itemsPerPage} 
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="border border-slate-300 rounded-md px-2 py-1 outline-none cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={1000}>Semua</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select
              value={filterRole}
              onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
            >
              <option value="all">Semua Role</option>
              <option value="admin">Admin</option>
              <option value="operator">Operator</option>
              <option value="user">User</option>
            </select>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="px-6 py-3 w-10">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={currentItems.length > 0 && currentItems.filter(u => u.user_id !== currentUserId).every(u => selectedUsers.includes(u.user_id))}
                    className="w-4 h-4 cursor-pointer rounded border-slate-300"
                  />
                </th>
                <th className="px-6 py-3 font-medium">Nama Lengkap</th>
                <th className="px-6 py-3 font-medium">Username</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Tidak ada pengguna yang cocok.
                  </td>
                </tr>
              ) : (
                currentItems.map((user) => {
                  const isSelf = user.user_id === currentUserId; // Cek apakah ini diri sendiri
                  return (
                    <tr key={user.user_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          checked={selectedUsers.includes(user.user_id)}
                          onChange={() => handleSelectUser(user.user_id)}
                          disabled={isSelf} // Tidak bisa centang diri sendiri
                          className={`w-4 h-4 rounded border-slate-300 ${isSelf ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">{user.full_name} {isSelf && <span className="text-xs text-blue-500 ml-1">(Anda)</span>}</td>
                      <td className="px-6 py-4 text-slate-600">{user.username}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                        user.role === 'operator' ? 'bg-blue-100 text-blue-700' : 
                        'bg-slate-100 text-slate-700' // Warna untuk role User
                      }`}>
                        {String(user.role).toUpperCase()}
                      </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {user.status === 'active' ? 'Aktif' : 'Non-Aktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleOpenEdit(user)} title="Edit" className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(user.user_id, user.full_name)} 
                            disabled={isSelf} // Tidak bisa hapus diri sendiri
                            title="Hapus" 
                            className={`p-2 rounded-lg transition-colors ${isSelf ? "opacity-30 cursor-not-allowed text-slate-400 bg-slate-50" : "text-red-600 bg-red-50 hover:bg-red-100 cursor-pointer"}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-600">
          <div>
            Menampilkan {filteredUsers.length > 0 ? indexOfFirstItem + 1 : 0} sampai {Math.min(indexOfLastItem, filteredUsers.length)} dari {filteredUsers.length} data
          </div>
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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

      {/* ================= MODAL TAMBAH / EDIT AKUN ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">{isEditMode ? "Edit Akun" : "Tambah Akun Baru"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleInputChange} required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password {isEditMode && <span className="text-slate-400 font-normal">(Kosongkan jika tidak diubah)</span>}
                </label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required={!isEditMode}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select name="role" value={formData.role} onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer">
                    <option value="user">User</option>
                    <option value="operator">Operator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer">
                    <option value="active">Aktif</option>
                    <option value="inactive">Non-Aktif</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 cursor-pointer">
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL KONFIRMASI HAPUS ================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Akun?</h3>
            <p className="text-slate-500 mb-6">
              Apakah Anda yakin ingin menghapus <strong className="text-slate-800">{deleteTarget.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors cursor-pointer disabled:opacity-50">Batal</button>
              <button onClick={executeDelete} disabled={isDeleting} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors cursor-pointer disabled:bg-red-300 disabled:cursor-not-allowed">
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= NOTIFIKASI POP-UP ================= */}
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
            <p className="text-slate-600 text-center mb-6 max-w-xs">{notification.message}</p>
            <button onClick={() => setNotification(null)} className="w-full px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium transition-colors cursor-pointer">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}