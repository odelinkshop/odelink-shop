import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Users, 
  Eye, 
  MousePointer2, 
  Activity, 
  ChevronLeft, 
  TrendingUp,
  Package,
  Globe,
  Monitor,
  Smartphone,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingCart,
  CreditCard,
  Clock
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthToken } from '../utils/authStorage';

const API_BASE = process.env.REACT_APP_API_URL || '';

export default function SiteAnalyticsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useMemo(() => getAuthToken(), []);

  // States
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  // Fetch Detailed Real Data
  const fetchAnalytics = useCallback(async (selectedDays) => {
    try {
      const res = await fetch(`${API_BASE}/api/metrics/detailed-stats/${id}?days=${selectedDays}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.error) return;
      setData(d);
    } catch (err) {
      console.error('Fetch Analytics Error:', err);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    void fetchAnalytics(days);
    const interval = setInterval(() => fetchAnalytics(days), 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [days, fetchAnalytics]);

  if (loading) return (
    <div className="h-screen bg-[#050505] flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <Activity className="text-white animate-pulse" size={48} />
          <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em]">Veriler Analiz Ediliyor...</p>
       </div>
    </div>
  );

  const stats = data?.summary || {};
  const chartData = data?.charts || [];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/panel')} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Mağaza Analitiği</h1>
            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Real-time Business Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/5 p-1 rounded-xl border border-white/5">
          {[7, 30, 90].map(d => (
            <button 
              key={d} onClick={() => setDays(d)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${days === d ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
            >
              {d} GÜN
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-8 space-y-8">
        
        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'TOPLAM CİRO', val: `${Number(stats.total_revenue || 0).toLocaleString()} TL`, sub: 'Real-time Sales', icon: DollarSign, trend: '+12%', color: 'text-emerald-500' },
            { label: 'ZİYARETÇİ', val: stats.total_visitors || 0, sub: `${data?.liveCount || 0} Şu an canlı`, icon: Users, trend: '+5%', color: 'text-white' },
            { label: 'DÖNÜŞÜM ORANI', val: `%${stats.conversion_rate || 0}`, sub: 'Visit to Purchase', icon: TrendingUp, trend: '+2%', color: 'text-white' },
            { label: 'TOPLAM SATIŞ', val: stats.total_sales || 0, sub: 'Confirmed Orders', icon: ShoppingCart, trend: '+8%', color: 'text-white' }
          ].map((m, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/5 p-6 rounded-[24px] group hover:bg-white/[0.05] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                  <m.icon size={20} className="text-white/60" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                  <ArrowUpRight size={12} /> {m.trend}
                </div>
              </div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{m.label}</p>
              <h3 className={`text-3xl font-bold tracking-tighter ${m.color}`}>{m.val.toLocaleString()}</h3>
              <p className="text-[10px] text-white/20 mt-2 font-medium">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* MAIN CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 p-8 rounded-[32px]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-sm font-bold">Ziyaretçi ve Etkileşim</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Performance Over Time</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white" />
                  <span className="text-[10px] font-bold text-white/40">Ziyaretçi</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <span className="text-[10px] font-bold text-white/40">İzlenme</span>
                </div>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                  <XAxis 
                    dataKey="d" 
                    stroke="rgba(255,255,255,0.2)" 
                    fontSize={10} 
                    tickFormatter={(val) => new Date(val).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                  />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="u" stroke="#ffffff" strokeWidth={3} fillOpacity={1} fill="url(#colorV)" />
                  <Area type="monotone" dataKey="v" stroke="rgba(255,255,255,0.2)" strokeWidth={1} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[32px] flex flex-col">
            <h3 className="text-sm font-bold mb-1">Dönüşüm Hunisi</h3>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-8">Sales Funnel Analysis</p>
            
            <div className="flex-1 flex flex-col justify-between py-4">
              {[
                { label: 'Ziyaretler', val: stats.total_visitors || 0, percent: 100, color: 'bg-white' },
                { label: 'Tıklamalar', val: stats.total_clicks || 0, percent: stats.total_visitors > 0 ? (stats.total_clicks / stats.total_visitors * 100) : 0, color: 'bg-white/60' },
                { label: 'Sepete Ekleme', val: stats.total_carts || 0, percent: stats.total_clicks > 0 ? (stats.total_carts / stats.total_clicks * 100) : 0, color: 'bg-white/40' },
                { label: 'Satışlar', val: stats.total_sales || 0, percent: stats.total_carts > 0 ? (stats.total_sales / stats.total_carts * 100) : 0, color: 'bg-white/20' }
              ].map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-end text-[10px] font-bold">
                    <span className="text-white/40 uppercase tracking-widest">{item.label}</span>
                    <span>{item.val.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percent}%` }}
                      className={`h-full ${item.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TOP PRODUCTS & BREAKDOWNS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Products Table */}
          <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-sm font-bold">En Çok Satan Ürünler</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Top Performing Inventory</p>
              </div>
              <Package size={20} className="text-white/20" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-white/20 uppercase tracking-widest border-b border-white/5">
                    <th className="pb-4">Ürün</th>
                    <th className="pb-4">Sepet</th>
                    <th className="pb-4">Satış</th>
                    <th className="pb-4 text-right">Ciro</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {(data?.topProducts || []).slice(0, 5).map((p, i) => (
                    <tr key={i} className="border-b border-white/[0.02] last:border-0 group">
                      <td className="py-4 font-bold text-white/80 group-hover:text-white transition-colors">{p.productKey || 'İsimsiz Ürün'}</td>
                      <td className="py-4 text-white/40">{p.carts}</td>
                      <td className="py-4 text-white/40 font-bold">{p.sales}</td>
                      <td className="py-4 text-right font-black">{Number(p.revenue || 0).toLocaleString()} TL</td>
                    </tr>
                  ))}
                  {(!data?.topProducts || data.topProducts.length === 0) && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-white/20 text-[10px] font-bold uppercase tracking-widest">Veri bulunamadı</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Device & Country Breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-8">Cihaz Dağılımı</h3>
              <div className="space-y-6">
                {(data?.breakdowns?.devices || []).map((d, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-[11px] font-bold mb-2">
                      <span className="flex items-center gap-2 uppercase tracking-widest">
                        {d.key === 'desktop' ? <Monitor size={12} /> : <Smartphone size={12} />}
                        {d.key}
                      </span>
                      <span>{d.count}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(d.count / (stats.total_views || 1)) * 100}%` }}
                        className="h-full bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-8">Ülke Odak</h3>
              <div className="space-y-6">
                {(data?.breakdowns?.countries || []).slice(0, 4).map((c, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-[11px] font-bold mb-2">
                      <span className="flex items-center gap-2 uppercase tracking-widest">
                        <Globe size={12} className="text-white/20" />
                        {c.key}
                      </span>
                      <span>{c.count}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(c.count / (stats.total_views || 1)) * 100}%` }}
                        className="h-full bg-white/40"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </main>

      <footer className="p-8 border-t border-white/5 text-center">
        <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.8em]">Nova Strategic Intelligence Division &copy; 2024</p>
      </footer>

    </div>
  );
}
