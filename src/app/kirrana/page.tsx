// src/app/rikub/page.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import PublicNavbar from "../components/PublicNavbar";
import { callApi } from "../components/api";
import PublicFooter from "../components/PublicFooter";

type RikubData = {
  proposal_kegiatan_id: string;
  judul_proposal: string;
  nama: string;
  tahun_pendanaan: string;
  pendanaan: number | string;
  nama_institusi_ketua_konsorsium: string;
  bidang_fokus: string;
  tipe_institusi_ketua_konsorsium: string;
  provinsi_instansi_ketua_konsorsium: string;
  [key: string]: any;
};

// Koordinat Presisi dengan Offset Jitter untuk Mencegah Cluster Bertumpuk
const PROVINSI_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "ACEH": { lat: 4.695135, lng: 96.749399 },
  "SUMATERA UTARA": { lat: 2.1153547, lng: 99.5450974 },
  "SUMATERA BARAT": { lat: -0.7399397, lng: 100.8000051 },
  "RIAU": { lat: 0.2933469, lng: 101.7068294 },
  "JAMBI": { lat: -1.4851831, lng: 103.6169941 },
  "SUMATERA SELATAN": { lat: -3.3194374, lng: 104.9146743 },
  "BENGKULU": { lat: -3.5778471, lng: 102.3463875 },
  "LAMPUNG": { lat: -4.5585849, lng: 105.4068079 },
  "KEPULAUAN BANGKA BELITUNG": { lat: -2.7410513, lng: 106.4405872 },
  "KEPULAUAN RIAU": { lat: 3.9456514, lng: 108.1428669 },
  "BANTEN": { lat: -6.4058172, lng: 105.8040179 },
  "DKI JAKARTA": { lat: -6.0087634, lng: 106.845599 },
  "JAKARTA": { lat: -6.0087634, lng: 106.845599 },
  "JAWA BARAT": { lat: -6.9174639, lng: 107.8591228 },
  "JAWA TENGAH": { lat: -7.150975, lng: 110.1402594 },
  "DI YOGYAKARTA": { lat: -8.0955798, lng: 110.3694896 },
  "D.I. YOGYAKARTA": { lat: -8.0955798, lng: 110.3694896 },
  "YOGYAKARTA": { lat: -8.0955798, lng: 110.3694896 },
  "JAWA TIMUR": { lat: -7.5360639, lng: 112.4384017 },
  "BALI": { lat: -8.4095178, lng: 115.188916 },
  "NUSA TENGGARA BARAT": { lat: -8.6529334, lng: 117.3616476 },
  "NUSA TENGGARA TIMUR": { lat: -8.6573819, lng: 121.0793705 },
  "KALIMANTAN BARAT": { lat: -0.2787808, lng: 111.4752851 },
  "KALIMANTAN TENGAH": { lat: -1.6814878, lng: 113.3823545 },
  "KALIMANTAN SELATAN": { lat: -3.0926415, lng: 115.2837585 },
  "KALIMANTAN TIMUR": { lat: 0.5386586, lng: 116.419389 },
  "KALIMANTAN UTARA": { lat: 3.0730929, lng: 116.04139 },
  "SULAWESI UTARA": { lat: 0.6246932, lng: 123.9750018 },
  "SULAWESI TENGAH": { lat: -1.4300254, lng: 121.4456179 },
  "SULAWESI SELATAN": { lat: -3.6687994, lng: 119.9740534 },
  "SULAWESI TENGGARA": { lat: -4.14491, lng: 122.174605 },
  "GORONTALO": { lat: 0.6999372, lng: 122.4467238 },
  "SULAWESI BARAT": { lat: -2.8441371, lng: 119.2320784 },
  "MALUKU": { lat: -3.2384616, lng: 130.1452734 },
  "MALUKU UTARA": { lat: 1.5709993, lng: 127.8087693 },
  "PAPUA BARAT": { lat: -1.3361154, lng: 133.1747162 },
  "PAPUA": { lat: -4.269928, lng: 138.0803529 },
  "PAPUA SELATAN": { lat: -6.900000, lng: 139.500000 },
  "PAPUA TENGAH": { lat: -3.700000, lng: 136.500000 },
  "PAPUA PEGUNUNGAN": { lat: -4.100000, lng: 139.000000 },
  "PAPUA BARAT DAYA": { lat: -1.150000, lng: 131.300000 }
};

const normalizeProvName = (str: string) => {
  if (!str) return "";
  return str.toUpperCase().replace(/PROVINSI\s+/g, "").trim();
};

export default function RikubPage() {
  // --- STATE DASHBOARD DATA ---
  const [data, setData] = useState<RikubData[]>([]);
  const [loading, setLoading] = useState(true);

  // State Filter
  const [filterTahun, setFilterTahun] = useState("Semua");
  const [filterBidang, setFilterBidang] = useState("Semua");
  const [filterTipe, setFilterTipe] = useState("Semua");
  const [filterProvinsi, setFilterProvinsi] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // State Tab & Mode Chart
  const [activeTab, setActiveTab] = useState("ringkasan");
  const [chartFokusMode, setChartFokusMode] = useState<"dana" | "judul">("dana");
  const [chartProvinsiMode, setChartProvinsiMode] = useState<"dana" | "judul">("dana");
  const [mapMetric, setMapMetric] = useState<"judul" | "dana">("judul");
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Ref untuk Menyimpan Instance Peta dan Layer Group Marker
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await callApi("");
      if (res.success) setData(res.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  // --- LOGIKA FILTER & STATISTIK ---
  const uniqueTahun = useMemo(() => {
    const years = data.map(item => String(item.tahun_pendanaan || "").trim()).filter(Boolean);
    return Array.from(new Set(years)).sort().reverse();
  }, [data]);

  const uniqueBidang = useMemo(() => {
    const items = data.map(item => String(item.bidang_fokus || "").trim()).filter(Boolean);
    return Array.from(new Set(items)).sort();
  }, [data]);

  const uniqueTipe = useMemo(() => {
    const items = data.map(item => String(item.tipe_institusi_ketua_konsorsium || "").trim()).filter(Boolean);
    return Array.from(new Set(items)).sort();
  }, [data]);

  const uniqueProvinsi = useMemo(() => {
    const items = data.map(item => String(item.provinsi_instansi_ketua_konsorsium || "").trim()).filter(Boolean);
    return Array.from(new Set(items)).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const rowTahun = String(row.tahun_pendanaan || "").trim();
      const rowBidang = String(row.bidang_fokus || "").trim();
      const rowTipe = String(row.tipe_institusi_ketua_konsorsium || "").trim();
      const rowProvinsi = String(row.provinsi_instansi_ketua_konsorsium || "").trim();

      const matchTahun = filterTahun === "Semua" || rowTahun === filterTahun.trim();
      const matchBidang = filterBidang === "Semua" || rowBidang === filterBidang.trim();
      const matchTipe = filterTipe === "Semua" || rowTipe === filterTipe.trim();
      const matchProvinsi = filterProvinsi === "Semua" || rowProvinsi === filterProvinsi.trim();

      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        String(row.judul_proposal || "").toLowerCase().includes(q) ||
        String(row.nama || "").toLowerCase().includes(q) ||
        String(row.nama_institusi_ketua_konsorsium || "").toLowerCase().includes(q);

      return matchTahun && matchBidang && matchTipe && matchProvinsi && matchSearch;
    });
  }, [data, filterTahun, filterBidang, filterTipe, filterProvinsi, searchQuery]);

  // Hitung Statistik
  const totalAnggaran = filteredData.reduce((sum, row) => sum + (Number(row.pendanaan) || 0), 0);
  const totalJudul = filteredData.length;
  const uniqueInstitusi = new Set(filteredData.map(row => row.nama_institusi_ketua_konsorsium).filter(Boolean)).size;
  const rataRata = totalJudul > 0 ? totalAnggaran / totalJudul : 0;

  // --- LOGIKA CHART & TOP 10 ---
  const fokusRisetMap: Record<string, { dana: number; judul: number }> = {};
  filteredData.forEach(row => {
    const bidang = row.bidang_fokus || "Lainnya";
    if (!fokusRisetMap[bidang]) fokusRisetMap[bidang] = { dana: 0, judul: 0 };
    fokusRisetMap[bidang].dana += (Number(row.pendanaan) || 0);
    fokusRisetMap[bidang].judul += 1;
  });

  const topFokusRiset = Object.entries(fokusRisetMap)
    .sort((a, b) => chartFokusMode === "dana" ? b[1].dana - a[1].dana : b[1].judul - a[1].judul)
    .slice(0, 6);

  const maxFokusValue = Math.max(...topFokusRiset.map(item => chartFokusMode === "dana" ? item[1].dana : item[1].judul), 1);

  const statusInstitusiMap: Record<string, { dana: number; judul: number }> = {};
  filteredData.forEach(row => {
    const tipe = (row.tipe_institusi_ketua_konsorsium || "Lainnya").toUpperCase();
    if (!statusInstitusiMap[tipe]) statusInstitusiMap[tipe] = { dana: 0, judul: 0 };
    statusInstitusiMap[tipe].dana += (Number(row.pendanaan) || 0);
    statusInstitusiMap[tipe].judul += 1;
  });
  const totalJudulInstitusi = filteredData.length || 1;

  const pieColors = ["#4f46e5", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];
  const pieGradientStops = Object.entries(statusInstitusiMap).map(([tipe, val], idx) => {
    const percentage = (val.judul / totalJudulInstitusi) * 100;
    const previousPercentages = Object.entries(statusInstitusiMap)
      .slice(0, idx)
      .reduce((sum, [, v]) => sum + (v.judul / totalJudulInstitusi) * 100, 0);
    return `${pieColors[idx % pieColors.length]} ${previousPercentages}% ${previousPercentages + percentage}%`;
  }).join(', ');

  const provinsiMap: Record<string, { dana: number; judul: number }> = {};
  filteredData.forEach(row => {
    const prov = row.provinsi_instansi_ketua_konsorsium || "Lainnya";
    if (!provinsiMap[prov]) provinsiMap[prov] = { dana: 0, judul: 0 };
    provinsiMap[prov].dana += (Number(row.pendanaan) || 0);
    provinsiMap[prov].judul += 1;
  });

  const topProvinsi = Object.entries(provinsiMap)
    .sort((a, b) => chartProvinsiMode === "dana" ? b[1].dana - a[1].dana : b[1].judul - a[1].judul)
    .slice(0, 5);

  const maxProvinsiValue = Math.max(...topProvinsi.map(item => chartProvinsiMode === "dana" ? item[1].dana : item[1].judul), 1);

  // --- LOGIKA PETA CLUSTER / BUBBLE PER PROVINSI ---
  const petaClusterData = useMemo(() => {
    const map: Record<string, { rawName: string; dana: number; judul: number; institusi: Set<string>; lat: number; lng: number }> = {};

    filteredData.forEach(row => {
      const rawProv = String(row.provinsi_instansi_ketua_konsorsium || "").trim();
      const normKey = normalizeProvName(rawProv);
      if (!normKey) return;

      const coords = PROVINSI_COORDINATES[normKey];
      if (!coords) return;

      if (!map[normKey]) {
        map[normKey] = { rawName: rawProv, dana: 0, judul: 0, institusi: new Set(), lat: coords.lat, lng: coords.lng };
      }

      map[normKey].dana += (Number(row.pendanaan) || 0);
      map[normKey].judul += 1;
      if (row.nama_institusi_ketua_konsorsium) {
        map[normKey].institusi.add(row.nama_institusi_ketua_konsorsium);
      }
    });

    return Object.values(map);
  }, [filteredData]);

  const top10Riset = [...filteredData].sort((a, b) => (Number(b.pendanaan) || 0) - (Number(a.pendanaan) || 0)).slice(0, 10);

  // Dynamic Leaflet Loader
  useEffect(() => {
    if (activeTab === "peta" && typeof window !== "undefined") {
      const linkId = "leaflet-css";
      if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const scriptId = "leaflet-js";
      if (!(window as any).L) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        script.onload = () => {
          setupLeafletMap();
        };
        document.body.appendChild(script);
      } else {
        setupLeafletMap();
      }
    }

    return () => {
      if (activeTab !== "peta" && mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "peta" && mapInstanceRef.current) {
      updateMarkers();
    }
  }, [petaClusterData, mapMetric, activeTab]);

  const setupLeafletMap = () => {
    const L = (window as any).L;
    if (!L) return;
    const mapContainer = document.getElementById("leaflet-map-container");
    if (!mapContainer) return;

    if (!mapInstanceRef.current) {
      const map = L.map("leaflet-map-container", {
        center: [-2.548926, 118.0148634],
        zoom: 5,
        zoomControl: true,
        attributionControl: false
      });

      const primaryLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", { maxZoom: 18 });
      const fallbackLayer = L.tileLayer("https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", { maxZoom: 19 });

      primaryLayer.addTo(map);
      primaryLayer.on("tileerror", () => {
        if (map.hasLayer(primaryLayer)) {
          map.removeLayer(primaryLayer);
          fallbackLayer.addTo(map);
        }
      });

      const markersLayer = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      markersLayerRef.current = markersLayer;

      setTimeout(() => { map.invalidateSize(); }, 200);
    }
    updateMarkers();
  };

  const updateMarkers = () => {
    const L = (window as any).L;
    if (!L || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    petaClusterData.forEach((item) => {
      const displayVal = mapMetric === "judul" ? item.judul : Math.round(item.dana / 1000000000);
      const labelText = mapMetric === "judul" ? `${item.judul}` : `${displayVal}M`;
      let size = 40;
      if (item.judul > 20) size = 50;
      if (item.judul > 100) size = 62;

      const customIcon = L.divIcon({
        className: "custom-cluster-icon",
        html: `
          <div style="width: ${size}px; height: ${size}px; background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.45); display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 800; font-size: ${size > 50 ? "13px" : "11px"}; cursor: pointer;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
            ${labelText}
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });

      const popupContent = `
        <div style="font-family: sans-serif; padding: 4px; min-width: 170px;">
          <h4 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #1e293b;">${item.rawName}</h4>
          <div style="font-size: 12px; color: #475569; line-height: 1.6;">
            <div><b>Total Judul:</b> ${item.judul} Judul</div>
            <div><b>Total Dana:</b> <span style="color: #059669; font-weight: 700;">Rp ${(item.dana / 1000000000).toFixed(2)} M</span></div>
            <div><b>Institusi:</b> ${item.institusi.size} PT</div>
          </div>
        </div>
      `;

      L.marker([item.lat, item.lng], { icon: customIcon })
        .addTo(markersLayerRef.current)
        .bindPopup(popupContent);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* 1. PublicNavbar tetap terbuka bebas di luar overlay */}
      <PublicNavbar />

      {/* 2. Wrapper relatif mengunci area di bawah Navbar */}
      <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        
        {/* ================= OVERLAY UNDER MAINTENANCE (ABSOLUTE) ================= */}
        <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/90 border border-slate-800 text-white rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-2xl space-y-6 relative overflow-hidden">
            {/* Akses Cahaya Oranye/Indigo Background */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* Ikon Maintenance */}
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
            </div>

            {/* Teks Informasi */}
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-bold uppercase tracking-wider rounded-full">
                Pemeliharaan Sistem
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                Halaman Sedang Dalam Perbaikan
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Mohon maaf atas ketidaknyamanannya. Halaman portal KIRRANA saat ini sedang mengalami pembaruan sistem dan penyesuaian data. Silakan kembali lagi nanti.
              </p>
            </div>

            {/* Tombol Kembali / Action */}
            <div className="pt-2">
              <a 
                href="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali ke Beranda
              </a>
            </div>
          </div>
        </div>

        {/* Konten Utama Halaman (Terkerunci di bawah overlay) */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          
          {/* ================= 1. HERO SECTION ================= */}
          <section className="flex flex-col-reverse md:flex-row-reverse gap-8 md:gap-12 items-center">
            
            {/* SISI KIRI: Gambar Statis Mockup (Bisa Diklik) */}
            <div className="w-full md:w-1/2 relative flex justify-center items-center">
              <div 
                className="relative w-full group cursor-pointer"
                onClick={() => setIsPdfModalOpen(true)}
              >
                <img 
                  src="/bookkirrana.png" 
                  alt="Book KIRRANA" 
                  className="w-full h-auto max-h-[650px] object-contain transition-all duration-300 hover:scale-105" 
                />
              </div>
            </div>

             {/* SISI KANAN: Teks Penjelasan */}
            <div className="w-full md:w-1/2 space-y-4">
              
              {/* Header Teks & Logo */}
              <div className="flex justify-between items-start w-full">
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-8 h-1 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-bold text-slate-400 tracking-widest uppercase">Tentang Program</span>
                </div>
                
                <img 
                  src="/logokirrana.png" 
                  alt="Logo KIRRANA" 
                  className="h-12 md:h-17 w-auto object-contain -mt-2 md:-mt-4" 
                />
              </div>

              {/* Judul & Paragraf */}
              <div className="-mt-2 md:-mt-6">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                  KIRRANA <span className="block text-indigo-700">Konsorsium Inovasi untuk Rekonstruksi dan Rehabilitasi Bencana</span>
                </h1>
                
                <div className="text-slate-600 space-y-4 text-lg leading-relaxed text-justify mt-6">
                  <p>KIRRANA adalah program konsorsium perguruan tinggi untuk mempercepat pemulihan pascabencana di Indonesia melalui penerapan riset, inovasi, dan teknologi tepat guna sesuai kebutuhan daerah terdampak. Implementasinya dilakukan melalui tiga tahapan: (1) Rehabilitasi – pemulihan fungsi secara cepat, (2) Rekonstruksi – pembangunan kembali yang lebih tangguh/Build Back Better, dan (3) Keberlanjutan – transfer teknologi, penguatan kapasitas, dan kemandirian daerah.</p>
                </div>
              </div>

            </div>
          </section>

          {/* ================= 2. DASHBOARD DATA ================= */}
          <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="mb-2">
              <h2 className="text-2xl font-bold text-slate-800">Dashboard Data KIRRANA</h2>
              <p className="text-slate-500 mt-1">Statistik program pendanaan tahun berjalan.</p>
            </div>

            {/* FILTER BAR */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Tahun</label>
                <select value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white text-sm cursor-pointer">
                  <option value="Semua">Semua</option>
                  {uniqueTahun.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Bidang Fokus</label>
                <select value={filterBidang} onChange={(e) => setFilterBidang(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white text-sm cursor-pointer">
                  <option value="Semua">Semua</option>
                  {uniqueBidang.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Tipe Institusi</label>
                <select value={filterTipe} onChange={(e) => setFilterTipe(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white text-sm cursor-pointer">
                  <option value="Semua">Semua</option>
                  {uniqueTipe.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Provinsi</label>
                <select value={filterProvinsi} onChange={(e) => setFilterProvinsi(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white text-sm cursor-pointer">
                  <option value="Semua">Semua</option>
                  {uniqueProvinsi.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* TABS NAVIGATION */}
            <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
              {["ringkasan", "sebaran", "top10", "peta"].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-semibold capitalize border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === tab ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab === "top10" ? "Top 10 Riset" : tab === "peta" ? "Peta Wilayah" : tab}
                </button>
              ))}
            </div>

            {/* TAB CONTENT */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div>
                {/* ================= TAB RINGKASAN ================= */}
                {activeTab === "ringkasan" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
                    <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-6 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wide mb-1">Total Anggaran</h3>
                        <p className="text-2xl font-black text-slate-800 mb-1">Rp {totalAnggaran.toLocaleString('id-ID')}</p>
                        <p className="text-xs text-slate-500 font-medium">Rata-rata Rp {rataRata.toLocaleString('id-ID', { maximumFractionDigits: 0 })} / judul</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-2xl p-6 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wide mb-1">Total Judul</h3>
                        <p className="text-2xl font-black text-slate-800 mb-1">{totalJudul}</p>
                        <p className="text-xs text-slate-500 font-medium">Judul riset terdaftar</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-2xl p-6 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide mb-1">Perguruan Tinggi</h3>
                        <p className="text-2xl font-black text-slate-800 mb-1">{uniqueInstitusi}</p>
                        <p className="text-xs text-slate-500 font-medium">Institusi mitra unik</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= TAB SEBARAN ================= */}
                {activeTab === "sebaran" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                    {/* CHART 1: Fokus Riset */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <div className="flex flex-col mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
                          <h3 className="font-bold text-slate-800">Fokus Riset per Bidang</h3>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                          <button onClick={() => setChartFokusMode("dana")} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${chartFokusMode === "dana" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Dana</button>
                          <button onClick={() => setChartFokusMode("judul")} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${chartFokusMode === "judul" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Judul Proposal</button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {topFokusRiset.map(([bidang, val], idx) => {
                          const currentVal = chartFokusMode === "dana" ? val.dana : val.judul;
                          const pct = (currentVal / maxFokusValue) * 100;
                          return (
                            <div key={idx}>
                              <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-slate-700 font-semibold truncate pr-2" title={bidang}>{bidang}</span>
                                <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                                  {chartFokusMode === "dana" ? `Rp ${(val.dana / 1000000000).toFixed(2)} M` : `${val.judul} Judul`}
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* CHART 2: Status Institusi */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
                        <h3 className="font-bold text-slate-800">Status Institusi</h3>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="relative w-40 h-40 rounded-full flex items-center justify-center mb-6 shadow-inner"
                             style={{ background: `conic-gradient(${pieGradientStops})` }}>
                          <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center shadow-md">
                            <span className="text-3xl font-black text-slate-800">{totalJudulInstitusi}</span>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Judul</span>
                          </div>
                        </div>
                        <div className="w-full space-y-3">
                          {Object.entries(statusInstitusiMap).map(([tipe, val], idx) => {
                            const pct = Math.round((val.judul / totalJudulInstitusi) * 100);
                            return (
                              <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: pieColors[idx % pieColors.length] }}></div>
                                  <span className="font-bold text-slate-700 text-sm">{tipe}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-sm font-bold text-slate-800">{pct}%</span>
                                  <span className="text-xs text-slate-500 ml-2">({val.judul} judul)</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* CHART 3: Top 5 Provinsi */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <div className="flex flex-col mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-6 bg-orange-500 rounded-full"></div>
                          <h3 className="font-bold text-slate-800">Top 5 Provinsi</h3>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                          <button onClick={() => setChartProvinsiMode("dana")} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${chartProvinsiMode === "dana" ? "bg-orange-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Dana</button>
                          <button onClick={() => setChartProvinsiMode("judul")} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${chartProvinsiMode === "judul" ? "bg-orange-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Judul Proposal</button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {topProvinsi.map(([prov, val], idx) => {
                          const currentVal = chartProvinsiMode === "dana" ? val.dana : val.judul;
                          const pct = (currentVal / maxProvinsiValue) * 100;
                          return (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0">
                                #{idx + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-slate-700 font-semibold truncate pr-2" title={prov}>{prov}</span>
                                  <span className="text-slate-900 font-bold">
                                    {chartProvinsiMode === "dana" ? `Rp ${(val.dana / 1000000000).toFixed(2)} M` : `${val.judul} Judul`}
                                  </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <div className="bg-orange-400 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}

                {/* ================= TAB TOP 10 RISET ================= */}
                {activeTab === "top10" && (
                  <div className="animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-6 bg-purple-600 rounded-full"></div>
                      <h3 className="font-bold text-slate-800">10 Riset dengan Pendanaan Terbesar</h3>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-slate-800 text-white font-semibold">
                            <th className="px-4 py-4 w-16 text-center rounded-tl-2xl">No</th>
                            <th className="px-4 py-4">Nama Ketua</th>
                            <th className="px-4 py-4">Nama Institusi</th>
                            <th className="px-4 py-4">Bidang Fokus</th>
                            <th className="px-4 py-4 text-center">Tahun</th>
                            <th className="px-4 py-4 text-right rounded-tr-2xl">Pendanaan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {top10Riset.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-4 text-center font-bold text-slate-500">
                                {idx + 1}
                              </td>
                              <td className="px-4 py-4 font-bold text-slate-800">{row.nama}</td>
                              <td className="px-4 py-4 text-slate-600">{row.nama_institusi_ketua_konsorsium}</td>
                              <td className="px-4 py-4 text-slate-500">
                                <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200">
                                  {row.bidang_fokus}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-100">{row.tahun_pendanaan}</span>
                              </td>
                              <td className="px-4 py-4 text-right font-black text-emerald-600 text-base">
                                Rp {Number(row.pendanaan).toLocaleString('id-ID')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ================= TAB PETA WILAYAH ================= */}
                {activeTab === "peta" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative space-y-4">
                      
                      {/* Header Controls */}
                      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
                        <div className="relative w-full md:w-96">
                          <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <input 
                            type="text" 
                            placeholder="Cari penelitian, universitas, atau peneliti..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setMapMetric("judul")}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm ${mapMetric === "judul" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
                          >
                            Jumlah Judul
                          </button>
                          <button 
                            onClick={() => setMapMetric("dana")}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm ${mapMetric === "dana" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
                          >
                            Total Dana (M)
                          </button>
                        </div>
                      </div>

                      {/* Leaflet Map Container */}
                      <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                        <div id="leaflet-map-container" className="w-full h-full z-10"></div>
                      </div>

                      {/* Footer Summary Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 rounded-2xl shadow-md border border-slate-800 flex justify-between items-center">
                          <div>
                            <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider mb-1">Total Penelitian</span>
                            <span className="text-2xl font-black text-white">{totalJudul.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white p-4 rounded-2xl shadow-md border border-slate-800 flex justify-between items-center">
                          <div>
                            <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider mb-1">Perguruan Tinggi</span>
                            <span className="text-2xl font-black text-white">{uniqueInstitusi.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white p-4 rounded-2xl shadow-md border border-slate-800 flex justify-between items-center">
                          <div>
                            <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider mb-1">Total Provinsi</span>
                            <span className="text-2xl font-black text-white">{petaClusterData.length}</span>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 rounded-2xl shadow-md border border-slate-800 flex justify-between items-center">
                          <div>
                            <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider mb-1">Bidang Fokus</span>
                            <span className="text-2xl font-black text-white">{uniqueBidang.length}</span>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                )}

              </div>
            )}
          </section>

        </main>
      </div>

      <PublicFooter />

      {/* ================= MODAL PDF PANDUAN ================= */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-all animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">Panduan RIKUB 2026</h3>
              <button 
                onClick={() => setIsPdfModalOpen(false)}
                className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Area PDF (Google Drive Preview) */}
            <div className="flex-1 bg-slate-100 relative">
              <iframe 
                src="https://drive.google.com/file/d/1xNcHh3A2pD3ZBCUcvia0UvxDcw_t7bG2/preview" 
                className="w-full h-full border-none"
                title="Panduan RIKUB PDF"
                allow="autoplay"
              />
            </div>

            {/* Footer Modal (Tombol Buka di Tab Baru) */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <a 
                href="https://drive.google.com/file/d/1xNcHh3A2pD3ZBCUcvia0UvxDcw_t7bG2/view?usp=sharing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Buka di Tab Baru
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}