import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Monitor, Tablet, Smartphone, ChevronLeft, Save, Palette, Type, Layers, 
  Image as ImageIcon, Globe, Zap, Sparkles, Instagram, Facebook, Twitter, 
  Phone, Mail, MapPin, Loader2, Box, Settings, Activity, MousePointer, 
  Lock, BookOpen, Trash2, Plus, Info, ShieldCheck, Truck, HelpCircle, FileText, CheckCircle2, EyeOff, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthHeaders, getAuthToken } from '../utils/authStorage';

const API_BASE = process.env.REACT_APP_API_URL || '';

const DEFAULT_SETTINGS = {
  name: '',
  description: '',
  social_links: { instagram: '', x: '', facebook: '' },
  contact_info: { phone: '', email: '', address: 'İSTANBUL / TÜRKİYE' },
  pages: {
    about: '',
    privacy: '',
    returns: '',
    shipping: '',
    faq: '',
    blog: ''
  },
  branding: {
    hide_odelink_credit: false,
    logo_url: '',
    font_family: 'Playfair Display'
  },
  theme: 'modern',
  color: 'blue'
};

function PreviewFrame({ site }) {
  if (!site?.subdomain) return <div className="w-full h-full bg-[#08090A] flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;
  return (
    <iframe 
      src={`https://${site.subdomain}.odelink.shop?preview=true&v=${Date.now()}`} 
      className="w-full h-full border-none"
      title="Store Preview"
    />
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function SiteSettingsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = getAuthToken();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [site, setSite] = useState(null);
  const [activeTab, setActiveTab] = useState('brand'); 
  const [previewMode, setPreviewMode] = useState('desktop');
  
  const handleSubdomainUpdate = async (newSub) => {
    if (!newSub || newSub === site.subdomain) return;
    try {
      const res = await fetch(`${API_BASE}/api/sites/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ subdomain: newSub })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Mağaza adresi güncellendi.');
        setSite({ ...site, subdomain: newSub, subdomain_change_count: (site.subdomain_change_count || 0) + 1 });
      } else {
        toast.error(data.error || 'Güncelleme başarısız.');
      }
    } catch (e) { toast.error('Bağlantı hatası.'); }
  };
  
  // Enterprise States
  const [formData, setFormData] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    if (!token) { navigate('/auth'); return; }
    const loadSite = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/sites/${id}`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (res.ok) {
          setSite(data.site);
          // Merge with defaults
          setFormData({
            ...DEFAULT_SETTINGS,
            name: data.site.name || '',
            ...data.site.settings,
            social_links: { ...DEFAULT_SETTINGS.social_links, ...(data.site.settings?.social_links || {}) },
            contact_info: { ...DEFAULT_SETTINGS.contact_info, ...(data.site.settings?.contact_info || {}) },
            pages: { ...DEFAULT_SETTINGS.pages, ...(data.site.settings?.pages || {}) },
            branding: { ...DEFAULT_SETTINGS.branding, ...(data.site.settings?.branding || {}) }
          });
        }
      } catch (e) { toast.error('Mağaza verileri yüklenemedi.'); }
      finally { setLoading(false); }
    };
    loadSite();
  }, [id, token, navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/sites/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          name: formData.name,
          settings: formData
        })
      });
      if (res.ok) {
        toast.success('Değişiklikler yayına alındı.');
        // Refresh preview if needed
        const iframe = document.querySelector('iframe');
        if (iframe) iframe.src = iframe.src;
      } else {
        const err = await res.json();
        toast.error(err.error || 'Güncelleme başarısız.');
      }
    } catch (e) { toast.error('Sunucu bağlantı hatası.'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="h-screen bg-[#08090A] flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-16 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500">Odelink Studio Altyapısı Hazırlanıyor</p>
    </div>
  );

  return (
    <div className="h-screen bg-[#08090A] text-[#E1E1E1] flex flex-col overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* --- TOP BAR --- */}
      <header className="h-[80px] px-8 flex items-center justify-between bg-[#08090A] border-b border-white/5 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/panel')} className="p-2 hover:bg-white/5 rounded-xl transition-all text-gray-500 hover:text-white border border-transparent hover:border-white/5">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-tight">Enterprise Studio</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Canlı Yapılandırma</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-black/50 p-1.5 rounded-2xl border border-white/10">
          {[
            { id: 'desktop', icon: Monitor },
            { id: 'tablet', icon: Tablet },
            { id: 'mobile', icon: Smartphone }
          ].map(d => (
            <button
              key={d.id}
              onClick={() => setPreviewMode(d.id)}
              className={`p-2.5 rounded-xl transition-all ${previewMode === d.id ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-gray-200'}`}
            >
              <d.icon size={18} />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.open(`https://${site?.subdomain}.odelink.shop`, '_blank')}
            className="h-12 px-6 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black tracking-widest rounded-xl transition-all border border-white/10 flex items-center gap-3"
          >
            <Eye size={16} className="text-blue-400" />
            MAĞAZAYI GÖR
          </button>
          
          <button 
            onClick={handleSave}
            disabled={saving}
            className="h-12 px-8 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-black tracking-widest rounded-xl transition-all shadow-xl shadow-blue-500/10 flex items-center gap-3"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            YAYINLA
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* --- SIDEBAR EDITOR --- */}
        <aside className="w-[400px] bg-[#0C0D0E] border-r border-white/5 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="p-8 space-y-10">
            
            {/* Subdomain Info - Interactive */}
            <div className="bg-blue-600/5 border border-blue-500/20 p-5 rounded-3xl group">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Subdomain Yönetimi</span>
                <span className={cn(
                  "text-[9px] font-black px-2 py-0.5 rounded-full",
                  (3 - (site?.subdomain_change_count || 0)) > 0 ? "bg-blue-600 text-white" : "bg-rose-500/20 text-rose-500"
                )}>
                  {3 - (site?.subdomain_change_count || 0)}/3 HAK
                </span>
              </div>
              <div className="flex items-center gap-2 bg-black/20 rounded-xl p-3 border border-white/5 group-focus-within:border-blue-500/50 transition-all">
                <input 
                  defaultValue={site?.subdomain} 
                  onBlur={(e) => handleSubdomainUpdate(e.target.value)}
                  disabled={(3 - (site?.subdomain_change_count || 0)) <= 0}
                  className="bg-transparent border-none outline-none text-xs font-bold text-white w-full placeholder:text-white/20"
                  placeholder="mağaza-adi"
                />
                <span className="text-[10px] font-black text-gray-600">.odelink.shop</span>
              </div>
              <p className="text-[9px] text-blue-400/60 font-medium leading-relaxed mt-3 uppercase tracking-tighter">Subdomain isminizi ayda en fazla 3 kez değiştirebilirsiniz.</p>
            </div>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'brand', label: 'MARKA', icon: Palette },
                { id: 'social', label: 'SOSYAL', icon: Instagram },
                { id: 'contact', label: 'İLETİŞİM', icon: Phone },
                { id: 'pages', label: 'SAYFALAR', icon: BookOpen }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${activeTab === tab.id ? 'bg-white/5 border-blue-500/50 text-white shadow-xl' : 'bg-transparent border-transparent text-gray-500 hover:bg-white/5'}`}
                >
                  <tab.icon size={16} className={activeTab === tab.id ? 'text-blue-400' : ''} />
                  <span className="text-[10px] font-black tracking-widest">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="h-px bg-white/5" />

            {/* Dynamic Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                {activeTab === 'brand' && (
                  <>
                    <EditorInput label="Mağaza İsmi" value={formData.name} onChange={v => setFormData({...formData, name: v})} />
                    <EditorInput label="Mağaza Açıklaması" type="textarea" value={formData.description} onChange={v => setFormData({...formData, description: v})} />
                    <EditorInput label="Logo URL" value={formData.branding.logo_url} onChange={v => setFormData({...formData, branding: {...formData.branding, logo_url: v}})} icon={ImageIcon} />
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Kurumsal Font</p>
                      <select 
                        value={formData.branding.font_family} 
                        onChange={e => setFormData({...formData, branding: {...formData.branding, font_family: e.target.value}})}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-[11px] font-black uppercase tracking-widest focus:border-blue-500/50 outline-none"
                      >
                        <option value="Playfair Display">Playfair Display (Lüks)</option>
                        <option value="Inter">Inter (Modern)</option>
                        <option value="Montserrat">Montserrat (Keskin)</option>
                        <option value="Outfit">Outfit (Premium)</option>
                      </select>
                    </div>
                    <div className="h-px bg-white/5" />
                    
                    {/* Modern Shopier PAT Integration */}
                    <div className="space-y-4 bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-3xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Shopier API Bağlantısı (PAT)</span>
                      </div>
                      <textarea
                        rows={5}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder-white/20 focus:border-emerald-500/50 outline-none transition-all font-mono text-[10px]"
                        placeholder="Shopier'den kopyaladığın o çok uzun kodu buraya yapıştır..."
                        value={formData.shopier_pat || ''}
                        onChange={(e) => setFormData({ ...formData, shopier_pat: e.target.value })}
                      />
                      <p className="text-[8px] text-emerald-500/60 font-bold leading-relaxed uppercase tracking-tighter">
                        Shopier panelinde oluşturduğunuz "Kişisel Erişim Anahtarı" (PAT) kodunu buraya girmelisiniz.
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-3xl">
                      <div className="flex items-center gap-4">
                        <EyeOff size={18} className="text-amber-500" />
                        <div>
                          <p className="text-[10px] font-black text-white uppercase tracking-widest">Odelink Reklamı</p>
                          <p className="text-[8px] text-gray-500 font-bold uppercase mt-1">Footer kısmındaki ibareyi kaldır</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.branding.hide_odelink_credit} onChange={e => setFormData({...formData, branding: {...formData.branding, hide_odelink_credit: e.target.checked}})} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </>
                )}

                {activeTab === 'social' && (
                  <>
                    <EditorInput label="Instagram" value={formData.social_links.instagram} onChange={v => setFormData({...formData, social_links: {...formData.social_links, instagram: v}})} icon={Instagram} placeholder="https://instagram.com/kullanici" />
                    <EditorInput label="X (Twitter)" value={formData.social_links.x} onChange={v => setFormData({...formData, social_links: {...formData.social_links, x: v}})} icon={Twitter} placeholder="https://x.com/kullanici" />
                    <EditorInput label="Facebook" value={formData.social_links.facebook} onChange={v => setFormData({...formData, social_links: {...formData.social_links, facebook: v}})} icon={Facebook} placeholder="https://facebook.com/sayfa" />
                  </>
                )}

                {activeTab === 'contact' && (
                  <>
                    <EditorInput label="Müşteri Hattı" value={formData.contact_info.phone} onChange={v => setFormData({...formData, contact_info: {...formData.contact_info, phone: v}})} icon={Phone} placeholder="+90 000 000 00 00" />
                    <EditorInput label="Kurumsal E-posta" value={formData.contact_info.email} onChange={v => setFormData({...formData, contact_info: {...formData.contact_info, email: v}})} icon={Mail} placeholder="info@markaniz.com" />
                    <EditorInput label="Merkez Ofis Adresi" type="textarea" value={formData.contact_info.address} onChange={v => setFormData({...formData, contact_info: {...formData.contact_info, address: v}})} icon={MapPin} />
                  </>
                )}

                {activeTab === 'pages' && (
                  <>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Kurumsal Sayfalar</p>
                    {[
                      { id: 'about', label: 'HAKKIMIZDA', icon: Info },
                      { id: 'privacy', label: 'GİZLİLİK POLİTİKASI', icon: ShieldCheck },
                      { id: 'returns', label: 'İADE KOŞULLARI', icon: FileText },
                      { id: 'shipping', label: 'KARGO TAKİP BİLGİSİ', icon: Truck },
                      { id: 'faq', label: 'SIKÇA SORULANLAR', icon: HelpCircle },
                      { id: 'blog', label: 'BLOG / EDİTORYAL', icon: BookOpen }
                    ].map(page => (
                      <div key={page.id} className="space-y-2">
                        <div className="flex items-center gap-2 text-[9px] font-black text-blue-500 uppercase tracking-widest">
                          <page.icon size={12} /> {page.label}
                        </div>
                        <textarea 
                          value={formData.pages[page.id]} 
                          onChange={e => setFormData({...formData, pages: {...formData.pages, [page.id]: e.target.value}})}
                          placeholder={`${page.label} içeriğini buraya yazın...`}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-xs font-medium min-h-[120px] focus:border-blue-500/50 outline-none transition-all"
                        />
                      </div>
                    ))}
                  </>
                )}
              </motion.div>
            </AnimatePresence>

          </div>
        </aside>

        {/* --- LIVE PREVIEW MAIN --- */}
        <main className="flex-1 bg-[#08090A] flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-500/[0.03] blur-[200px] rounded-full animate-pulse" />
          </div>

          <motion.div 
            layout
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className={cn(
              "relative z-10 origin-center transition-all duration-700",
              previewMode === 'mobile' ? 'w-[320px] h-[650px]' : 
              previewMode === 'tablet' ? 'w-[720px] h-[900px]' : 
              'w-full h-full max-w-[1200px] max-h-[750px]'
            )}
          >
            {/* Realistic Device Frames */}
            {previewMode === 'mobile' ? (
              <div className="relative w-full h-full border-[12px] border-[#1C1D1F] rounded-[50px] shadow-[0_50px_100px_rgba(0,0,0,0.8)] bg-black overflow-hidden ring-1 ring-white/10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1C1D1F] rounded-b-2xl z-50 flex items-center justify-center">
                  <div className="w-10 h-1 bg-black/40 rounded-full" />
                </div>
                <PreviewFrame site={site} />
              </div>
            ) : previewMode === 'tablet' ? (
              <div className="relative w-full h-full border-[15px] border-[#1C1D1F] rounded-[40px] shadow-[0_60px_120px_rgba(0,0,0,0.8)] bg-black overflow-hidden ring-1 ring-white/10">
                <div className="absolute -left-[15px] top-20 w-[3px] h-16 bg-[#2C2D2F] rounded-r-lg" />
                <PreviewFrame site={site} />
              </div>
            ) : (
              <div className="relative w-full h-full flex flex-col shadow-[0_80px_150px_rgba(0,0,0,0.9)] rounded-2xl overflow-hidden border border-white/5 bg-[#0C0D0E]">
                {/* Browser Top Bar */}
                <div className="h-11 bg-[#1C1D1F] flex items-center px-4 gap-4 border-b border-black/20">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                  </div>
                  <div className="flex-1 max-w-2xl mx-auto flex items-center gap-2 px-4 py-1.5 bg-black/40 rounded-lg border border-white/5 text-[10px] text-gray-500 font-bold tracking-widest uppercase">
                    <ShieldCheck size={10} className="text-emerald-500" />
                    {site?.subdomain}.odelink.shop
                  </div>
                </div>
                <div className="flex-1 bg-black">
                  <PreviewFrame site={site} />
                </div>
                {/* iMac Chin Style Footer */}
                <div className="h-12 bg-[#1C1D1F] flex items-center justify-center border-t border-black/20">
                   <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center">
                      <Sparkles size={14} className="text-blue-500/50" />
                   </div>
                </div>
              </div>
            )}
          </motion.div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-8 py-3 bg-white/[0.02] border border-white/10 rounded-full backdrop-blur-3xl shadow-2xl z-20">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Nova Rendering Engine v2.5</span>
          </div>
        </main>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.12); }
      `}} />
    </div>
  );
}

function EditorInput({ label, value, onChange, type = 'text', icon: Icon, placeholder }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</label>
      </div>
      <div className="relative group">
        {Icon && <Icon className="absolute left-4 top-4 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={16} />}
        {type === 'textarea' ? (
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-[11px] font-bold min-h-[100px] focus:border-blue-500/50 outline-none transition-all ${Icon ? 'pl-12' : ''}`}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-[11px] font-black uppercase tracking-widest focus:border-blue-500/50 outline-none transition-all ${Icon ? 'pl-12' : ''}`}
          />
        )}
      </div>
    </div>
  );
}

