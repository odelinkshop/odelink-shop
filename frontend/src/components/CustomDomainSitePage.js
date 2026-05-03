import React, { useState, useEffect } from 'react';
import { Activity, Sparkles } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || '';

export default function CustomDomainSitePage() {
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSiteByHost = async () => {
      try {
        const host = window.location.hostname.toLowerCase();
        console.log(`🕵️‍♂️ Resolving site for host: ${host}`);

        const res = await fetch(`${API_BASE}/api/sites/public-by-host`, {
          headers: {
            'x-forwarded-host': host
          }
        });

        if (!res.ok) throw new Error('Mağaza bulunamadı veya DNS yönlendirmesi henüz tamamlanmadı.');
        
        const data = await res.json();
        if (!data.site) throw new Error('Mağaza verisi alınamadı.');
        
        setSite(data.site);
      } catch (e) {
        console.error('❌ Custom domain resolve error:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteByHost();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090A] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 border-2 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="text-blue-500 w-10 h-10 animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
           <div className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-500">Nova Intelligence</div>
           <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest animate-pulse">Mağaza Yükleniyor</div>
        </div>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen bg-[#08090A] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mb-6 border border-rose-500/20">
           <Sparkles className="text-rose-500 w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-white mb-4 tracking-tight">Mağaza Bulunamadı</h1>
        <p className="text-gray-500 max-w-md leading-relaxed text-sm font-medium">
          {error || 'Bu alan adı henüz bir Nova mağazasına bağlanmamış veya DNS ayarları henüz yayılmamış olabilir.'}
        </p>
        <a href="https://www.odelink.shop" className="mt-10 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-white transition-colors">
           Nova SaaS İmparatorluğu'na Dön
        </a>
      </div>
    );
  }

  // Özel alan adında mağazayı göster (S-proxy üzerinden)
  return (
    <div className="fixed inset-0 w-full h-full bg-black overflow-hidden">
      <iframe 
        src={`https://${site.subdomain}.odelink.shop?origin_host=${window.location.hostname}`} 
        className="w-full h-full border-none"
        title={site.name}
        allow="payment; clipboard-write"
      />
    </div>
  );
}
