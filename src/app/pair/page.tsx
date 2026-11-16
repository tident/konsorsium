// src/app/pair/page.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import PublicNavbar from "../components/PublicNavbar";
import { callApi } from "../components/api";
import PublicFooter from "../components/PublicFooter";

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

// MAPPING 5 PROVINSI PAIR (Inggris -> Indonesia) dengan Koordinat
const PAIR_PROVINSI_COORDINATES: Record<string, { lat: number; lng: number; label: string }> = {
  "SOUTHEAST SULAWESI": { lat: -4.14491, lng: 122.174605, label: "Sulawesi Tenggara" },
  "SOUTH SULAWESI": { lat: -3.6687994, lng: 119.9740534, label: "Sulawesi Selatan" },
  "CENTRAL SULAWESI": { lat: -1.4300254, lng: 121.4456179, label: "Sulawesi Tengah" },
  "WEST SULAWESI": { lat: -2.8441371, lng: 119.2320784, label: "Sulawesi Barat" },
  "GORONTALO": { lat: 0.6999372, lng: 122.4467238, label: "Gorontalo" },
};

const normalizeLocation = (str: string) => {
  if (!str) return "";
  return str.toUpperCase().replace(/PROVINSI\s+/g, "").trim();
};

export default function PairPage() {
  const [data, setData] = useState<PairData[]>([]);
  const [loading, setLoading] = useState(true);

  // State Filter
  const [filterOutput, setFilterOutput] = useState("Semua");
  const [filterLocation, setFilterLocation] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // State Tab & Mode Chart
  const [activeTab, setActiveTab] = useState("ringkasan");
  const [chartTopicMode, setChartTopicMode] = useState<"dana" | "judul">("dana");
  const [chartLocationMode, setChartLocationMode] = useState<"dana" | "judul">("dana");
  const [mapMetric, setMapMetric] = useState<"judul" | "dana">("judul");
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Ref untuk Menyimpan Instance Peta
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await callApi("getPairData");
      if (res.success) setData(res.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  // --- LOGIKA FILTER & STATISTIK ---
  const uniqueOutputs = useMemo(() => {
    const items = data.map(item => String(item.project_output || "").trim()).filter(Boolean);
    return Array.from(new Set(items)).sort();
  }, [data]);

  const uniqueLocations = useMemo(() => {
    const items = data.map(item => String(item.project_location || "").trim()).filter(Boolean);
    return Array.from(new Set(items)).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const rowOutput = String(row.project_output || "").trim();
      const rowLocation = String(row.project_location || "").trim();

      const matchOutput = filterOutput === "Semua" || rowOutput === filterOutput;
      const matchLocation = filterLocation === "Semua" || rowLocation === filterLocation;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        String(row.proposal_title || "").toLowerCase().includes(q) ||
        String(row.unhas_coordinator || "").toLowerCase().includes(q) ||
        String(row.aus_university || "").toLowerCase().includes(q);

      return matchOutput && matchLocation && matchSearch;
    });
  }, [data, filterOutput, filterLocation, searchQuery]);

  // Statistik
  const totalAnggaran = filteredData.reduce((sum, row) => sum + (Number(row.final_budget) || 0), 0);
  const totalJudul = filteredData.length;
  const uniqueAustraliaUniv = new Set(filteredData.map(row => row.aus_university).filter(Boolean)).size;
  const rataRata = totalJudul > 0 ? totalAnggaran / totalJudul : 0;

  // --- LOGIKA CHART: Main Topic ---
  const mainTopicMap: Record<string, { dana: number; judul: number }> = {};
  filteredData.forEach(row => {
    const topic = row.main_topic || "Lainnya";
    if (!mainTopicMap[topic]) mainTopicMap[topic] = { dana: 0, judul: 0 };
    mainTopicMap[topic].dana += (Number(row.final_budget) || 0);
    mainTopicMap[topic].judul += 1;
  });

  const topMainTopics = Object.entries(mainTopicMap)
    .sort((a, b) => chartTopicMode === "dana" ? b[1].dana - a[1].dana : b[1].judul - a[1].judul)
    .slice(0, 6);

  const maxTopicValue = Math.max(...topMainTopics.map(item => chartTopicMode === "dana" ? item[1].dana : item[1].judul), 1);

  // --- LOGIKA CHART: Project Output (Donut) ---
  const projectOutputMap: Record<string, { dana: number; judul: number }> = {};
  filteredData.forEach(row => {
    const output = row.project_output || "Lainnya";
    if (!projectOutputMap[output]) projectOutputMap[output] = { dana: 0, judul: 0 };
    projectOutputMap[output].dana += (Number(row.final_budget) || 0);
    projectOutputMap[output].judul += 1;
  });
  const totalJudulOutput = filteredData.length || 1;

  const pieColors = ["#4f46e5", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];
  const pieGradientStops = Object.entries(projectOutputMap).map(([tipe, val], idx) => {
    const percentage = (val.judul / totalJudulOutput) * 100;
    const previousPercentages = Object.entries(projectOutputMap)
      .slice(0, idx)
      .reduce((sum, [, v]) => sum + (v.judul / totalJudulOutput) * 100, 0);
    return `${pieColors[idx % pieColors.length]} ${previousPercentages}% ${previousPercentages + percentage}%`;
  }).join(', ');

  // --- LOGIKA CHART: Project Location ---
  const projectLocationMap: Record<string, { dana: number; judul: number; rawName: string }> = {};
  filteredData.forEach(row => {
    const loc = String(row.project_location || "").trim();
    if (!loc) return;
    const normKey = normalizeLocation(loc);
    if (!projectLocationMap[normKey]) {
      projectLocationMap[normKey] = { dana: 0, judul: 0, rawName: loc };
    }
    projectLocationMap[normKey].dana += (Number(row.final_budget) || 0);
    projectLocationMap[normKey].judul += 1;
  });

  const topLocations = Object.entries(projectLocationMap)
    .sort((a, b) => chartLocationMode === "dana" ? b[1].dana - a[1].dana : b[1].judul - a[1].judul)
    .slice(0, 5);

  const maxLocationValue = Math.max(...topLocations.map(item => chartLocationMode === "dana" ? item[1].dana : item[1].judul), 1);

  // --- PETA CLUSTER ---
  const petaClusterData = useMemo(() => {
    return Object.entries(projectLocationMap).map(([normKey, val]) => {
      const coords = PAIR_PROVINSI_COORDINATES[normKey];
      if (!coords) return null;
      return {
        rawName: coords.label, // Gunakan label Indonesia
        dana: val.dana,
        judul: val.judul,
        lat: coords.lat,
        lng: coords.lng,
      };
    }).filter(Boolean) as Array<{ rawName: string; dana: number; judul: number; lat: number; lng: number }>;
  }, [projectLocationMap]);

  // --- TAB PENERIMA PAIR (Semua Data) ---
  const penerimaPair = [...filteredData].sort((a, b) => (Number(b.final_budget) || 0) - (Number(a.final_budget) || 0));

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
        script.onload = () => setupLeafletMap();
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
    if (activeTab === "peta" && mapInstanceRef.current) updateMarkers();
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
      if (item.judul > 5) size = 50;
      if (item.judul > 10) size = 62;

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
      <PublicNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        
        {/* ================= 1. HERO SECTION ================= */}
        <section className="flex flex-col-reverse md:flex-row-reverse gap-8 md:gap-12 items-center">
          <div className="w-full md:w-1/2 relative flex justify-center items-center">
            <div className="relative w-full group cursor-pointer" onClick={() => setIsPdfModalOpen(true)}>
              <img src="/bookpair.png" alt="Book PAIR" className="w-full h-auto max-h-[650px] object-contain transition-all duration-300 hover:scale-105" />
            </div>
          </div>

          <div className="w-full md:w-1/2 space-y-4">
            <div className="flex justify-between items-start w-full">
              <div className="flex items-center gap-2 pt-2">
                <div className="w-8 h-1 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-bold text-slate-400 tracking-widest uppercase">Tentang Program</span>
              </div>
              <img src="/logopair.png" alt="Logo PAIR" className="h-12 md:h-17 w-auto object-contain -mt-2 md:-mt-4" />
            </div>
            <div className="-mt-2 md:-mt-6">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                PAIR 2nd Call <span className="block text-indigo-700">Partnership for Australia-Indonesia Research</span>
              </h1>
              <div className="text-slate-600 space-y-4 text-lg leading-relaxed text-justify mt-6">
                <p>Partnership for Australia-Indonesia Research (PAIR) Sulawesi membangun ekosistem riset kolaboratif antara perguruan tinggi Indonesia dan Australia agar penelitian tidak berhenti pada tataran akademis semata. Melalui pendekatan demand-driven dan interdisipliner bersama Impact Partners (pemerintah, industri, dan masyarakat sipil), program ini mengakselerasi lahirnya kebijakan dan teknologi inklusif untuk memperkuat ketahanan iklim serta kesejahteraan masyarakat pesisir Sulawesi.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 2. DASHBOARD DATA ================= */}
        <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="mb-2">
            <h2 className="text-2xl font-bold text-slate-800">Dashboard Data PAIR 2nd Call</h2>
            <p className="text-slate-500 mt-1">Statistik program pendanaan tahun berjalan.</p>
          </div>

          {/* FILTER BAR (Diperbarui) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Project Output</label>
              <select value={filterOutput} onChange={(e) => setFilterOutput(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white text-sm cursor-pointer">
                <option value="Semua">Semua</option>
                {uniqueOutputs.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Project Location</label>
              <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white text-sm cursor-pointer">
                <option value="Semua">Semua</option>
                {uniqueLocations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* TABS NAVIGATION */}
          <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
            {["ringkasan", "sebaran", "penerima", "peta"].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-semibold capitalize border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab === "penerima" ? "Penerima PAIR 2nd Call" : tab === "peta" ? "Peta Wilayah (Lokasi Penelitian)" : tab}
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
                      <p className="text-xs text-slate-500 font-medium">Judul proposal terdaftar</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-2xl p-6 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-200">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide mb-1">Australia University</h3>
                      <p className="text-2xl font-black text-slate-800 mb-1">{uniqueAustraliaUniv}</p>
                      <p className="text-xs text-slate-500 font-medium">Institusi mitra unik</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB SEBARAN ================= */}
              {activeTab === "sebaran" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                  {/* CHART 1: Main Topic */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
                        <h3 className="font-bold text-slate-800">Main Topic</h3>
                      </div>
                      <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                        <button onClick={() => setChartTopicMode("dana")} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${chartTopicMode === "dana" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Dana</button>
                        <button onClick={() => setChartTopicMode("judul")} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${chartTopicMode === "judul" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Judul</button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {topMainTopics.map(([topic, val], idx) => {
                        const currentVal = chartTopicMode === "dana" ? val.dana : val.judul;
                        const pct = (currentVal / maxTopicValue) * 100;
                        return (
                          <div key={idx}>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="text-slate-700 font-semibold truncate pr-2" title={topic}>{topic}</span>
                              <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                                {chartTopicMode === "dana" ? `Rp ${(val.dana / 1000000000).toFixed(2)} M` : `${val.judul}`}
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

                  {/* CHART 2: Project Output (Donut) */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
                      <h3 className="font-bold text-slate-800">Project Output</h3>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="relative w-40 h-40 rounded-full flex items-center justify-center mb-6 shadow-inner"
                           style={{ background: `conic-gradient(${pieGradientStops})` }}>
                        <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center shadow-md">
                          <span className="text-3xl font-black text-slate-800">{totalJudulOutput}</span>
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Judul</span>
                        </div>
                      </div>
                      <div className="w-full space-y-3">
                        {Object.entries(projectOutputMap).map(([tipe, val], idx) => {
                          const pct = Math.round((val.judul / totalJudulOutput) * 100);
                          return (
                            <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: pieColors[idx % pieColors.length] }}></div>
                                <span className="font-bold text-slate-700 text-sm">{tipe}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-bold text-slate-800">{pct}%</span>
                                <span className="text-xs text-slate-500 ml-2">({val.judul})</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* CHART 3: Project Location */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-6 bg-orange-500 rounded-full"></div>
                        <h3 className="font-bold text-slate-800">Project Location</h3>
                      </div>
                      <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                        <button onClick={() => setChartLocationMode("dana")} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${chartLocationMode === "dana" ? "bg-orange-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Dana</button>
                        <button onClick={() => setChartLocationMode("judul")} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${chartLocationMode === "judul" ? "bg-orange-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Judul</button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {topLocations.map(([normKey, val], idx) => {
                        const currentVal = chartLocationMode === "dana" ? val.dana : val.judul;
                        const pct = (currentVal / maxLocationValue) * 100;
                        const labelIndonesia = PAIR_PROVINSI_COORDINATES[normKey]?.label || val.rawName;
                        return (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0">
                              #{idx + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-700 font-semibold truncate pr-2" title={labelIndonesia}>{labelIndonesia}</span>
                                <span className="text-slate-900 font-bold">
                                  {chartLocationMode === "dana" ? `Rp ${(val.dana / 1000000000).toFixed(2)} M` : `${val.judul}`}
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

              {/* ================= TAB PENERIMA PAIR ================= */}
              {activeTab === "penerima" && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-6 bg-purple-600 rounded-full"></div>
                    <h3 className="font-bold text-slate-800">Semua Penerima PAIR 2nd Call</h3>
                  </div>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-800 text-white font-semibold">
                          <th className="px-4 py-4 w-16 text-center rounded-tl-2xl">No</th>
                          <th className="px-4 py-4">Nama Ketua</th>
                          <th className="px-4 py-4">Nama Institusi</th>
                          <th className="px-4 py-4">Main Topic</th>
                          <th className="px-4 py-4 text-center">Project Output</th>
                          <th className="px-4 py-4 text-right rounded-tr-2xl">Pendanaan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {penerimaPair.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-4 text-center font-bold text-slate-500">{idx + 1}</td>
                            <td className="px-4 py-4 font-bold text-slate-800">{row.unhas_coordinator}</td>
                            <td className="px-4 py-4 text-slate-600">{row.university}</td>
                            <td className="px-4 py-4 text-slate-500">
                              <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200">{row.main_topic}</span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                                row.project_output === "Technology Focus"
                                  ? "bg-blue-50 text-blue-700 border-blue-100"
                                  : "bg-yellow-100 text-yellow-700 border-yellow-200"
                              }`}>
                                {row.project_output}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right font-black text-emerald-600 text-base">
                              Rp {Number(row.final_budget).toLocaleString('id-ID')}
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
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
                      <div className="relative w-full md:w-96">
                        <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input type="text" placeholder="Cari data PAIR..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setMapMetric("judul")} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm ${mapMetric === "judul" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}>Jumlah Judul</button>
                        <button onClick={() => setMapMetric("dana")} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm ${mapMetric === "dana" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}>Total Dana (M)</button>
                      </div>
                    </div>

                    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                      <div id="leaflet-map-container" className="w-full h-full z-10"></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 rounded-2xl shadow-md border border-slate-800 flex justify-between items-center">
                        <div><span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider mb-1">Total Judul</span><span className="text-2xl font-black text-white">{totalJudul}</span></div>
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg></div>
                      </div>
                      <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white p-4 rounded-2xl shadow-md border border-slate-800 flex justify-between items-center">
                        <div><span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider mb-1">Australia Univ</span><span className="text-2xl font-black text-white">{uniqueAustraliaUniv}</span></div>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg></div>
                      </div>
                      <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white p-4 rounded-2xl shadow-md border border-slate-800 flex justify-between items-center">
                        <div><span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider mb-1">Total Lokasi</span><span className="text-2xl font-black text-white">{petaClusterData.length}</span></div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
                      </div>
                      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 rounded-2xl shadow-md border border-slate-800 flex justify-between items-center">
                        <div><span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider mb-1">Main Topic</span><span className="text-2xl font-black text-white">{Object.keys(mainTopicMap).length}</span></div>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <PublicFooter />

      {isPdfModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-all animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">Panduan PAIR 2nd Call</h3>
              <button onClick={() => setIsPdfModalOpen(false)} className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors cursor-pointer">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 bg-slate-100 relative">
              <iframe src="https://drive.google.com/file/d/1jyHMNB7c15P4qOmRxe33_V4584FY2xlT/preview" className="w-full h-full border-none" title="Panduan PAIR PDF" allow="autoplay" />
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <a href="https://drive.google.com/file/d/1jyHMNB7c15P4qOmRxe33_V4584FY2xlT/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer">
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