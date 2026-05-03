import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Globe as GlobeIcon, 
  Users, 
  Eye, 
  MousePointer2, 
  Activity, 
  ChevronLeft, 
  Zap, 
  RefreshCcw, 
  Satellite, 
  Radar, 
  Target,
  Monitor,
  Smartphone,
  Chrome,
  Compass,
  Bell,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { getAuthHeaders, getAuthToken } from '../utils/authStorage';

const API_BASE = process.env.REACT_APP_API_URL || '';

// High-Fidelity Textures
// High-Fidelity 8K Textures (Yerel Varlıklar - CORS Çözümü)
const GLOBE_IMAGE = "/assets/globe/earth-blue-marble.jpg";
const GLOBE_NIGHT = "/assets/globe/earth-night.jpg";
const GLOBE_BUMP = "/assets/globe/earth-topology.png";
const CLOUDS_IMAGE = "/assets/globe/earth-clouds.png";
const COUNTRIES_GEOJSON = "/assets/globe/countries.geojson";

export default function SiteAnalyticsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const globeRef = useRef();
  const token = useMemo(() => getAuthToken(), []);

  // States
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(30);
  const [lastEvents, setLastEvents] = useState([]);
  const [globeRotation, setGlobeRotation] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [countries, setCountries] = useState({ features: [] });
  const [aiInsights, setAiInsights] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapData, setHeatmapData] = useState([]);
  const toastTimeoutRef = useRef({});

  // Fetch Countries for High-Res Borders
  useEffect(() => {
    fetch(COUNTRIES_GEOJSON)
      .then(res => res.json())
      .then(setCountries)
      .catch(err => console.error('GeoJSON Load Error:', err));
  }, []);

  // Fetch AI Insights
  const fetchAIInsights = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sites/${id}/ai-insights`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.ok) setAiInsights(d.insights || []);
    } catch (e) { void e; }
  }, [id, token]);

  // Fetch Heatmap Data
  const fetchHeatmap = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sites/${id}/heatmap?days=${days}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.ok) setHeatmapData(d.heatmap || []);
    } catch (e) { void e; }
  }, [id, token, days]);

  // Fetch Real Data (7/30/90 Days)
  const fetchAnalytics = useCallback(async (selectedDays) => {
    try {
      const res = await fetch(`${API_BASE}/api/sites/${id}/analytics?days=${selectedDays}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const d = await res.json();
      if (d.error) {
        if (d.code === 'PAYWALL') navigate('/plans');
        return;
      }
      setData(d);
      void fetchAIInsights();
      if (showHeatmap) void fetchHeatmap();
    } catch (err) {
      console.error('Fetch Analytics Error:', err);
    } finally {
      setLoading(false);
    }
  }, [id, token, navigate, fetchAIInsights, fetchHeatmap, showHeatmap]);

  useEffect(() => {
    void fetchAnalytics(days);
  }, [days, fetchAnalytics]);

  useEffect(() => {
    if (showHeatmap) void fetchHeatmap();
  }, [showHeatmap, fetchHeatmap]);

  // Real-time Pulse Stream
  useEffect(() => {
    if (!token || !id || loading) return;
    let es;
    const connectSSE = () => {
      const url = `${API_BASE}/api/sites/${encodeURIComponent(id)}/analytics/stream?days=${days}&access_token=${encodeURIComponent(token)}`;
      es = new EventSource(url);
      es.addEventListener('analytics', (event) => {
        try {
          const parsed = JSON.parse(event.data || '{}');
          // Update live totals
          setData(prev => ({ ...prev, ...parsed }));
          // Update live pulses (Dots)
          if (parsed.realtime?.events) {
             const newEvents = parsed.realtime.events;
             setLastEvents(prev => {
                const combined = [...newEvents, ...prev].slice(0, 100);
                return Array.from(new Set(combined.map(e => e.id))).map(id => combined.find(e => e.id === id));
             });

             // Show toast for brand new events
             newEvents.slice(0, 3).forEach(ev => {
               if (!lastEvents.find(e => e.id === ev.id)) {
                 const id = Math.random().toString(36).substr(2, 9);
                 setToasts(prev => [...prev, { ...ev, toastId: id }]);
                 setTimeout(() => {
                   setToasts(prev => prev.filter(t => t.toastId !== id));
                 }, 4000);
               }
             });
          }
        } catch (e) { console.error('Pulse Error:', e); }
      });
      es.onerror = () => { es.close(); };
    };
    connectSSE();
    return () => es && es.close();
  }, [id, token, days, loading]);

  // Marker Dots Logic (Red for Clicks, Cyan for Views)
  const globePoints = useMemo(() => {
    return lastEvents
      .filter(e => e.lat && e.lon)
      .map(e => ({
        lat: parseFloat(e.lat),
        lng: parseFloat(e.lon),
        size: e.type === 'click' ? 1.5 : 0.8,
        color: e.type === 'click' ? '#FF1E1E' : '#00F0FF',
        label: `${e.city || 'Bilinmeyen'}, ${e.country} (${e.type === 'click' ? 'SATIN ALMA' : 'İZLEME'})`
      }));
  }, [lastEvents]);

  // Atmosphere & Rotation
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = globeRotation;
      globeRef.current.controls().autoRotateSpeed = 0.6;
    }
  }, [globeRotation]);

  // High-Fidelity Arcs (Visitor Paths)
  const arcsData = useMemo(() => {
    return lastEvents.slice(0, 15).map(e => ({
      startLat: 39.1, startLng: 35.2, // Turkey Hub
      endLat: parseFloat(e.lat || 39.1), endLng: parseFloat(e.lon || 35.2),
      color: ['#00F0FF', '#FF1E1E'][Math.round(Math.random())]
    }));
  }, [lastEvents]);

  // Rings for Cyber-Aesthetics
  const ringsData = useMemo(() => {
    return lastEvents.slice(0, 5).map(e => ({ lat: parseFloat(e.lat), lng: parseFloat(e.lon) }));
  }, [lastEvents]);

  if (loading) return (
    <div className="h-screen bg-[#020406] flex flex-col items-center justify-center gap-8">
       <div className="relative">
          <div className="w-32 h-32 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <Satellite size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400 animate-pulse" />
       </div>
       <p className="text-[10px] text-cyan-500/50 font-black uppercase tracking-[0.5em] animate-pulse">Siber Bağlantı Kuruluyor...</p>
    </div>
  );

  return (
    <div className="h-screen bg-[#020406] text-[#F8FAFC] flex flex-col overflow-hidden font-sans relative select-none">
      
      {/* HEADER HUD */}
      <header className="h-auto px-3 py-2 flex flex-col md:flex-row items-center justify-between bg-black/40 backdrop-blur-2xl border-b border-white/5 z-50 gap-2">
         <div className="w-full md:w-auto flex items-center justify-between md:gap-8">
            <div className="flex items-center gap-2">
               <button onClick={() => navigate('/panel')} className="p-1 text-cyan-500/40 hover:text-cyan-400">
                  <ChevronLeft size={18} />
               </button>
               <div className="flex items-center gap-2">
                  <div className="w-6 h-6 md:w-11 md:h-11 bg-cyan-600/10 border border-cyan-500/20 rounded flex items-center justify-center text-cyan-400">
                     <Activity size={12} className="md:w-[22px] md:h-[22px]" />
                  </div>
                  <div className="min-w-0">
                     <h1 className="text-[8px] md:text-lg font-black text-white tracking-widest uppercase">ANALİTİK</h1>
                     <div className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-[5px] md:text-[8px] text-emerald-500 font-black uppercase tracking-widest opacity-50">LIVE</span>
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="flex items-center gap-2">
               <button onClick={() => fetchAnalytics(days)} className="w-6 h-6 md:w-11 md:h-11 bg-black/50 border border-white/5 rounded flex items-center justify-center text-cyan-400">
                  <RefreshCcw size={12} />
               </button>
               <button 
                  onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                  className="md:hidden w-6 h-6 bg-cyan-500/10 border border-cyan-500/20 rounded flex items-center justify-center text-cyan-400"
               >
                  <Radar size={12} />
               </button>
            </div>
         </div>

          <div className="w-full md:w-auto flex items-center gap-2">
            <div className="flex-1 md:flex-none bg-black/50 p-1 rounded-lg border border-white/5 flex gap-1">
               {[7, 30, 90].map(d => (
                 <button 
                   key={d} onClick={() => setDays(d)}
                   className={`flex-1 md:flex-none px-3 py-2 md:px-2 md:py-1 rounded-md text-[10px] md:text-[10px] font-black tracking-widest transition-all ${days === d ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'text-gray-500 hover:text-gray-300'}`}
                 >
                    {d}G
                 </button>
               ))}
            </div>
         </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
         
         {/* SIDEBAR HUD */}
         <aside className={`
            fixed md:relative inset-y-0 left-0 w-full md:w-[360px] p-6 md:p-8 flex flex-col gap-6 z-[60] md:z-40 
            bg-black/90 md:bg-black/40 backdrop-blur-2xl border-r border-white/5 overflow-y-auto custom-scrollbar 
            transition-transform duration-500 ease-cyber
            ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
         `}>
            
            <div className="bg-[#0A0D12] border border-cyan-500/20 rounded-[28px] p-8 relative overflow-hidden shadow-2xl group">
               <div className="absolute -inset-1 bg-cyan-500/5 blur-xl group-hover:bg-cyan-500/10 transition-all" />
               <p className="text-[10px] font-black text-cyan-500/60 uppercase tracking-[0.4em] mb-4 flex items-center gap-3 relative z-10">
                  <Users size={14} /> ŞU AN CANLI
               </p>
               <div className="flex items-baseline gap-3 relative z-10">
                  <h2 className="text-7xl font-serif text-white tracking-tighter leading-none">{data?.realtime?.activeVisitors || 0}</h2>
                  <span className="text-emerald-500 font-black text-[9px] animate-pulse tracking-widest">SIGNAL_OK</span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               {[
                  { label: 'İZLENME', val: data?.totals?.pageViews || 0, icon: Eye, color: 'text-rose-500' },
                  { label: 'ZİYARETÇİ', val: data?.totals?.uniqueVisitors || 0, icon: Users, color: 'text-cyan-500' },
                  { label: 'TIKLAMA', val: data?.totals?.clicks || 0, icon: MousePointer2, color: 'text-amber-500' },
                  { label: 'VERİM', val: `%${((data?.totals?.clicks / (data?.totals?.pageViews || 1)) * 100).toFixed(1)}`, icon: Zap, color: 'text-emerald-500' }
               ].map((m, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:border-cyan-500/20 transition-all">
                     <m.icon size={16} className={`${m.color} mb-3`} />
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{m.label}</p>
                     <p className="text-2xl font-serif text-white">{m.val.toLocaleString()}</p>
                  </div>
               ))}
            </div>

            {/* NEW: Device & Browser Distribution */}
            <div className="bg-black/50 border border-white/5 rounded-2xl p-6 flex flex-col gap-6">
               <div>
                  <div className="flex items-center justify-between mb-4">
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Monitor size={12} /> CİHAZ DAĞILIMI
                     </p>
                  </div>
                  <div className="space-y-3">
                     {(data?.breakdowns?.devices || []).slice(0, 3).map((d, idx) => (
                        <div key={idx}>
                           <div className="flex items-center justify-between text-[10px] mb-1.5">
                              <span className="text-white font-bold uppercase tracking-wider flex items-center gap-2">
                                 {d.key === 'desktop' ? <Monitor size={10} className="text-cyan-500" /> : <Smartphone size={10} className="text-rose-500" />}
                                 {d.key}
                              </span>
                              <span className="text-gray-500 font-black">{d.count}</span>
                           </div>
                           <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${(d.count / (data?.totals?.pageViews || 1)) * 100}%` }}
                                 className={`h-full ${d.key === 'desktop' ? 'bg-cyan-500' : 'bg-rose-500'}`}
                              />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="h-px bg-white/5" />

               <div>
                  <div className="flex items-center justify-between mb-4">
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Chrome size={12} /> TARAYICI ANALİZİ
                     </p>
                  </div>
                  <div className="space-y-3">
                     {(data?.breakdowns?.browsers || []).slice(0, 4).map((b, idx) => (
                        <div key={idx}>
                           <div className="flex items-center justify-between text-[10px] mb-1.5">
                              <span className="text-white font-bold uppercase tracking-wider flex items-center gap-2">
                                 {b.key === 'chrome' ? <Chrome size={10} className="text-emerald-500" /> : <Compass size={10} className="text-blue-500" />}
                                 {b.key}
                              </span>
                              <span className="text-gray-500 font-black">{b.count}</span>
                           </div>
                           <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${(b.count / (data?.totals?.pageViews || 1)) * 100}%` }}
                                 className="h-full bg-emerald-500/50"
                              />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="flex-1 flex flex-col gap-4 min-h-0">
               <div className="flex items-center justify-between px-2">
                  <p className="text-[10px] font-black text-cyan-500/50 uppercase tracking-[0.4em] flex items-center gap-2">
                     <Radar size={14} /> CANLI AKIŞ
                  </p>
                  <span className="text-[8px] text-emerald-500/40 font-black tracking-widest">REAL_TIME</span>
               </div>
               <div className="flex-1 space-y-3 overflow-y-auto pr-3 custom-scrollbar">
                  <AnimatePresence initial={false}>
                     {lastEvents.slice(0, 15).map((event) => (
                        <motion.div
                           key={event.id}
                           initial={{ opacity: 0, x: -20 }}
                           animate={{ opacity: 1, x: 0 }}
                           className="bg-white/[0.01] border border-white/5 p-4 rounded-xl flex items-center gap-4 hover:bg-white/[0.03] transition-all cursor-pointer group"
                           onClick={() => {
                              if (event.lat && event.lon) {
                                 globeRef.current.pointOfView({ lat: parseFloat(event.lat), lng: parseFloat(event.lon), altitude: 0.6 }, 1500);
                                 setGlobeRotation(false);
                              }
                           }}
                        >
                           <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-white/5 ${event.type === 'click' ? 'bg-rose-500/10 text-rose-500' : 'bg-cyan-500/10 text-cyan-500'}`}>
                              {event.type === 'click' ? <Target size={18} /> : <Eye size={18} />}
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                 <span className="text-[11px] font-black text-white truncate uppercase">{event.city || 'BİLİNMEYEN'}, {event.country}</span>
                                 <div className="flex items-center gap-1.5 shrink-0">
                                    {event.device_type === 'desktop' ? <Monitor size={8} className="text-cyan-400/50" /> : <Smartphone size={8} className="text-rose-400/50" />}
                                    <span className="text-[8px] text-gray-600 font-black">{new Date(event.ts).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                                 </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-[9px] text-gray-500 font-bold truncate uppercase tracking-wider">
                                   {event.type === 'click' ? `OPERASYON: ${event.product_key || 'Ürün'}` : `KEŞİF MODU`}
                                </p>
                                {event.browser === 'chrome' && <Chrome size={8} className="text-emerald-500/40" />}
                                {event.browser === 'safari' && <Compass size={8} className="text-blue-500/40" />}
                              </div>
                           </div>
                        </motion.div>
                     ))}
                  </AnimatePresence>
               </div>
            </div>
         </aside>

         {/* MAIN GLOBE */}
         <main className="flex-1 relative cursor-crosshair bg-black min-h-0 flex flex-col">
            <div className="analytics-globe-container">
               <Globe
                  ref={globeRef}
                  width={window.innerWidth > 768 ? window.innerWidth - 360 : window.innerWidth}
                  height={window.innerWidth > 768 ? window.innerHeight - 80 : window.innerHeight - 150}
                  
                  // High-Res 8K Core
                  globeImageUrl={GLOBE_IMAGE}
                  bumpImageUrl={GLOBE_BUMP}
                  nightImageUrl={GLOBE_NIGHT}
                  backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
                  
                  // Atmosphere & Ocean
                  atmosphereColor="#00F0FF"
                  atmosphereAltitude={0.25}
                  
                  // Country Borders & Labels (Polygons)
                  polygonsData={countries.features}
                  polygonCapColor={() => 'rgba(6, 182, 212, 0.04)'}
                  polygonSideColor={() => 'rgba(0, 0, 0, 0.2)'}
                  polygonStrokeColor={() => 'rgba(6, 182, 212, 0.2)'}
                  polygonLabel={({ properties: d }) => `
                    <div style="background: rgba(0,0,0,0.8); padding: 10px; border-radius: 8px; border: 1px solid #06b6d4; backdrop-blur: 10px;">
                      <div style="font-size: 10px; font-weight: 900; color: #06b6d4; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">EGEMEN DEVLET</div>
                      <div style="font-size: 14px; font-weight: bold; color: white;">${d.ADMIN}</div>
                    </div>
                  `}
                  
                  // High-Fidelity Arcs (Visitor Paths)
                  arcsData={arcsData}
                  arcColor="color"
                  arcDashLength={0.4}
                  arcDashGap={4}
                  arcDashAnimateTime={2000}
                  arcAltitudeAutoScale={0.5}

                  // Live Pulse Points & Heatmap
                  pointsData={showHeatmap ? heatmapData.map(h => ({
                    lat: h.click_y ? (h.click_y / h.screen_height * 180 - 90) * -1 : 0,
                    lng: h.click_x ? (h.click_x / h.screen_width * 360 - 180) : 0,
                    size: 0.5,
                    color: '#FF1E1E',
                    label: 'Tıklama Yoğunluğu'
                  })) : globePoints}
                  pointLat="lat"
                  pointLng="lng"
                  pointColor="color"
                  pointRadius="size"
                  pointsMerge={false}
                  pointAltitude={0.12}
                  pointLabel="label"
                  
                  // Rings for Cyber-Aesthetics
                  ringsData={ringsData}
                  ringColor={() => "#00F0FF"}
                  ringMaxRadius={2.5}
                  ringPropagationSpeed={3}
                  ringRepeat={2}

                  onPointClick={p => {
                     globeRef.current.pointOfView({ lat: p.lat, lng: p.lng, altitude: 0.6 }, 1500);
                     setGlobeRotation(false);
                  }}
                  
                  // Clouds Integration
                  onGlobeReady={() => {
                    const CLOUDS_ALT = 0.004;
                    const CLOUDS_ROTATION_SPEED = -0.006; // deg/frame

                    new THREE.TextureLoader().load(CLOUDS_IMAGE, cloudsTexture => {
                      const clouds = new THREE.Mesh(
                        new THREE.SphereGeometry(globeRef.current.getGlobeRadius() * (1 + CLOUDS_ALT), 75, 75),
                        new THREE.MeshPhongMaterial({ map: cloudsTexture, transparent: true })
                      );
                      globeRef.current.scene().add(clouds);

                      (function rotateClouds() {
                        clouds.rotation.y += CLOUDS_ROTATION_SPEED * Math.PI / 180;
                        requestAnimationFrame(rotateClouds);
                      })();
                    });
                  }}
               />
            </div>

            {/* CYBER SHIELD STATUS - Hidden on Mobile */}
            <div className="hidden md:flex absolute bottom-8 left-8 items-center gap-4 bg-black/60 backdrop-blur-3xl border border-emerald-500/20 px-6 py-3 rounded-2xl z-50">
               <div className="relative">
                  <ShieldCheck size={18} className="text-emerald-500" />
                  <div className="absolute inset-0 bg-emerald-500/20 blur-lg animate-pulse" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">Siber Zırh Aktif</p>
                  <p className="text-[8px] text-emerald-500/60 font-bold uppercase tracking-tight">Nova Intelligence Protection</p>
               </div>
            </div>

            <div className="absolute top-4 md:top-8 right-4 md:right-8 flex flex-col gap-3 md:gap-3 z-50">
                <button 
                   onClick={() => globeRef.current.pointOfView({ lat: 39.1, lng: 35.2, altitude: 1.0 }, 1500)}
                   className="h-11 w-11 md:h-14 md:w-52 rounded-xl md:rounded-xl border border-rose-500/30 bg-black/80 flex items-center justify-center gap-3 text-rose-500 shadow-2xl backdrop-blur-md"
                   title="Türkiye Odak"
                >
                   <Target size={20} className="md:w-[18px] md:h-[18px] animate-pulse" />
                   <span className="hidden md:inline text-[9px] font-black tracking-[0.3em] uppercase">TÜRKİYE ODAK</span>
                </button>
 
                <button 
                   onClick={() => setGlobeRotation(!globeRotation)}
                   className={`h-11 w-11 md:h-14 md:w-52 rounded-xl md:rounded-xl border flex items-center justify-center gap-3 bg-black/80 backdrop-blur-md shadow-2xl ${globeRotation ? 'border-cyan-500 text-cyan-500' : 'border-white/10 text-gray-500'}`}
                   title="Otomatik Pilot"
                >
                   <RefreshCcw size={20} className={(globeRotation ? 'animate-spin-slow' : '') + ' md:w-[18px] md:h-[18px]'} />
                   <span className="hidden md:inline text-[9px] font-black tracking-[0.3em] uppercase">{globeRotation ? 'OTOMATİK PİLOT' : 'MANUEL'}</span>
                </button>
 
                <button 
                   onClick={() => {
                     setGlobeRotation(true);
                     globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1500);
                   }}
                   className="h-11 w-11 md:h-14 md:w-52 rounded-xl md:rounded-xl border border-white/10 bg-black/80 backdrop-blur-md text-gray-500 flex items-center justify-center gap-3 shadow-2xl"
                   title="Global Görünüm"
                >
                   <GlobeIcon size={20} className="md:w-[18px] md:h-[18px]" />
                   <span className="hidden md:inline text-[9px] font-black tracking-[0.3em] uppercase">GLOBAL GÖRÜNÜM</span>
                </button>
             </div>
         </main>
      </div>

      {/* LIVE TOAST NOTIFICATIONS */}
      <div className="fixed bottom-10 right-10 flex flex-col gap-4 z-[100] pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.toastId}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              className="w-80 bg-black/80 backdrop-blur-3xl border border-white/10 p-5 rounded-[24px] shadow-2xl flex items-center gap-5 pointer-events-auto group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 ${t.type === 'click' ? 'bg-rose-500/20 text-rose-500' : 'bg-cyan-500/20 text-cyan-500'}`}>
                 {t.type === 'click' ? <Target size={24} /> : <Eye size={24} />}
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                 <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest truncate">{t.city || 'BİLİNMEYEN'}, {t.country}</p>
                    <span className="text-[8px] text-cyan-500/50 font-black">CANLI</span>
                 </div>
                 <p className="text-[11px] text-gray-400 font-bold uppercase truncate">
                    {t.type === 'click' ? `TIKLAMA: ${t.product_key || 'Ürün'}` : 'MAĞAZA KEŞFİ'}
                 </p>
                 <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1.5">
                       {t.device_type === 'desktop' ? <Monitor size={10} className="text-gray-600" /> : <Smartphone size={10} className="text-gray-600" />}
                       <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{t.device_type}</span>
                    </div>
                    <div className="h-1 w-1 rounded-full bg-white/10" />
                    <div className="flex items-center gap-1.5">
                       {t.browser === 'chrome' ? <Chrome size={10} className="text-gray-600" /> : <Compass size={10} className="text-gray-600" />}
                       <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{t.browser}</span>
                    </div>
                 </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 240, 255, 0.1); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 240, 255, 0.3); }
        .animate-spin-slow { animation: spin 25s linear infinite; }
        .ease-cyber { transition-timing-function: cubic-bezier(0.19, 1, 0.22, 1); }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
