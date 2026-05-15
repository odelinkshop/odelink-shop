import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Monitor, Tablet, Smartphone, ChevronLeft, Save, Palette, Type, Layers, 
  Image as ImageIcon, Globe, Zap, Sparkles, Instagram, Facebook, Twitter, 
  Phone, Mail, MapPin, Loader2, Box, Settings, Activity, MousePointer, 
  Lock, BookOpen, Trash2, Plus, Info, ShieldCheck, Truck, HelpCircle, FileText, CheckCircle2, EyeOff, Eye, X
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const handleSubdomainUpdate = async (value) => {
    const newSub = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!newSub || newSub === site.subdomain) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/sites/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ subdomain: newSub })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Mağaza adresi başarıyla güncellendi.');
        setSite({ ...site, subdomain: newSub, subdomain_change_count: (site.subdomain_change_count || 0) + 1 });
        // Refresh the whole page to ensure all routes sync up
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error(data.error || 'Bu adres kullanımda olabilir.');
      }
    } catch (e) { toast.error('Bağlantı hatası.'); }
    finally { setLoading(false); }
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
        setSite(prev => ({ ...prev, name: formData.name }));
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

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* --- SIDEBAR EDITOR: Collapsible & Professional --- */}
        <AnimatePresence mode="wait">
          {(!isSidebarCollapsed || window.innerWidth > 1024) && (
            <motion.aside 
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={cn(
                "w-full lg:w-[450px] bg-[#0C0D0E] border-r border-white/5 flex flex-col overflow-y-auto custom-scrollbar z-[60] absolute lg:relative inset-y-0 left-0 shadow-2xl lg:shadow-none",
                isSidebarCollapsed ? "hidden lg:flex" : "flex"
              )}
            >
              <div className="p-8 sm:p-12 space-y-12">
                
                {/* Header for Mobile Sidebar */}
                <div className="flex lg:hidden items-center justify-between mb-8">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Studio Editor</span>
                  <button onClick={() => setIsSidebarCollapsed(true)} className="p-4 bg-white/5 rounded-full text-white"><X size={20} /></button>
                </div>

                {/* Subdomain Info - Interactive */}
                <div className="bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 p-8 rounded-[2rem] group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                    <Globe size={80} />
                  </div>
                  <div className="flex justify-between items-center mb-6 relative z-10">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Subdomain Yönetimi</span>
                    <div className="bg-blue-600 text-[9px] font-black px-3 py-1 rounded-full text-white shadow-lg shadow-blue-500/20">
                      {3 - (site?.subdomain_change_count || 0)}/3 HAK
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-black/40 rounded-2xl p-5 border border-white/5 focus-within:border-blue-500/50 transition-all relative z-10">
                    <input 
                      defaultValue={site?.subdomain} 
                      onBlur={(e) => handleSubdomainUpdate(e.target.value)}
                      disabled={(3 - (site?.subdomain_change_count || 0)) <= 0}
                      className="bg-transparent border-none outline-none text-[13px] font-bold text-white w-full placeholder:text-white/20 uppercase tracking-widest"
                      placeholder="MAĞAZA ADI"
                    />
                    <span className="text-[11px] font-black text-gray-600">.odelink.shop</span>
                  </div>
                  <p className="text-[9px] text-blue-400/40 font-bold leading-relaxed mt-5 uppercase tracking-widest">Subdomain değişikliği sisteme 60 saniye içinde yansır.</p>
                </div>

                {/* Navigation Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'brand', label: 'MARKA', icon: Palette },
                    { id: 'social', label: 'SOSYAL', icon: Instagram },
                    { id: 'contact', label: 'İLETİŞİM', icon: Phone },
                    { id: 'pages', label: 'SAYFALAR', icon: BookOpen }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); if(window.innerWidth < 1024) setIsSidebarCollapsed(true); }}
                      className={`flex flex-col items-center justify-center gap-4 p-8 rounded-[2rem] border transition-all duration-500 ${activeTab === tab.id ? 'bg-white text-black border-transparent shadow-[0_20px_50px_rgba(255,255,255,0.1)] scale-105' : 'bg-white/[0.02] border-white/5 text-gray-500 hover:bg-white/5 hover:border-white/10'}`}
                    >
                      <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 1.5} />
                      <span className="text-[10px] font-black tracking-[0.3em] uppercase">{tab.label}</span>
                    </button>
                  ))}
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                {/* Dynamic Content Area */}
                <div className="pb-10">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                      className="space-y-10"
                    >
                      {activeTab === 'brand' && (
                        <>
                          <EditorInput label="Mağaza İsmi" value={formData.name} onChange={v => setFormData({...formData, name: v})} />
                          <EditorInput label="Mağaza Açıklaması" type="textarea" value={formData.description} onChange={v => setFormData({...formData, description: v})} />
                          <EditorInput label="Logo URL (PNG/SVG)" value={formData.branding.logo_url} onChange={v => setFormData({...formData, branding: {...formData.branding, logo_url: v}})} icon={ImageIcon} />
                          <div className="space-y-4">
                            <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em]">Kurumsal Tipografi</p>
                            <select 
                              value={formData.branding.font_family} 
                              onChange={e => setFormData({...formData, branding: {...formData.branding, font_family: e.target.value}})}
                              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-[12px] font-black uppercase tracking-[0.2em] focus:border-blue-500/50 outline-none appearance-none cursor-pointer"
                            >
                              <option value="Playfair Display">Playfair Display (Lüks)</option>
                              <option value="Inter">Inter (Modern)</option>
                              <option value="Montserrat">Montserrat (Keskin)</option>
                              <option value="Outfit">Outfit (Premium)</option>
                            </select>
                          </div>
                          
                          <div className="flex items-center justify-between p-7 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.04] transition-all">
                            <div className="flex items-center gap-5">
                              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                                <EyeOff size={20} className="text-amber-500" />
                              </div>
                              <div>
                                <p className="text-[11px] font-black text-white uppercase tracking-widest">Odelink Reklamı</p>
                                <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Görünürlüğü Yönetin</p>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" checked={formData.branding.hide_odelink_credit} onChange={e => setFormData({...formData, branding: {...formData.branding, hide_odelink_credit: e.target.checked}})} className="sr-only peer" />
                              <div className="w-14 h-8 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                            </label>
                          </div>
                        </>
                      )}

                      {activeTab === 'social' && (
                        <div className="space-y-8">
                          <EditorInput label="Instagram" value={formData.social_links.instagram} onChange={v => setFormData({...formData, social_links: {...formData.social_links, instagram: v}})} icon={Instagram} placeholder="@kullanici" />
                          <EditorInput label="X (Twitter)" value={formData.social_links.x} onChange={v => setFormData({...formData, social_links: {...formData.social_links, x: v}})} icon={Twitter} placeholder="@kullanici" />
                          <EditorInput label="Facebook" value={formData.social_links.facebook} onChange={v => setFormData({...formData, social_links: {...formData.social_links, facebook: v}})} icon={Facebook} placeholder="sayfa-ismi" />
                        </div>
                      )}

                      {activeTab === 'contact' && (
                        <div className="space-y-8">
                          <EditorInput label="Destek Hattı" value={formData.contact_info.phone} onChange={v => setFormData({...formData, contact_info: {...formData.contact_info, phone: v}})} icon={Phone} placeholder="+90 5XX XXX XX XX" />
                          <EditorInput label="İletişim E-posta" value={formData.contact_info.email} onChange={v => setFormData({...formData, contact_info: {...formData.contact_info, email: v}})} icon={Mail} placeholder="hello@domain.com" />
                          <EditorInput label="Fiziki Adres" type="textarea" value={formData.contact_info.address} onChange={v => setFormData({...formData, contact_info: {...formData.contact_info, address: v}})} icon={MapPin} />
                        </div>
                      )}

                      {activeTab === 'pages' && (
                        <div className="space-y-10">
                          {[
                            { id: 'about', label: 'HAKKIMIZDA', icon: Info },
                            { id: 'privacy', label: 'GİZLİLİK', icon: ShieldCheck },
                            { id: 'returns', label: 'İADE KOŞULLARI', icon: FileText },
                            { id: 'shipping', label: 'TESLİMAT', icon: Truck },
                            { id: 'faq', label: 'S.S.S', icon: HelpCircle }
                          ].map(page => (
                            <div key={page.id} className="space-y-4">
                              <div className="flex items-center gap-3 px-2">
                                <page.icon size={14} className="text-blue-500" />
                                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/60">{page.label}</span>
                              </div>
                              <textarea 
                                value={formData.pages[page.id]} 
                                onChange={e => setFormData({...formData, pages: {...formData.pages, [page.id]: e.target.value}})}
                                placeholder={`${page.label} metnini buraya girin...`}
                                className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-8 text-[13px] font-medium min-h-[180px] focus:border-blue-500/50 focus:bg-white/[0.04] outline-none transition-all resize-none leading-relaxed"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* --- LIVE PREVIEW AREA: Realistic Device Engineering --- */}
        <main className="flex-1 bg-[#08090A] flex flex-col items-center justify-center p-6 lg:p-20 relative overflow-hidden overflow-y-auto custom-scrollbar">
          
          {/* Hamburger for Mobile Sidebar */}
          <button 
            onClick={() => setIsSidebarCollapsed(false)}
            className="lg:hidden absolute top-10 left-10 z-[70] w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl"
          >
            <Palette size={24} />
          </button>

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-blue-500/[0.02] blur-[250px] rounded-full" />
          </div>

          <motion.div 
            layout
            transition={{ type: "spring", damping: 30, stiffness: 150 }}
            className="w-full h-full flex items-center justify-center"
          >
            {/* REALISTIC MONITOR Mockup */}
            {previewMode === 'desktop' && (
              <div className="relative w-full max-w-[1200px] group">
                {/* Monitor Stand (Back/Support) */}
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 h-20 bg-gradient-to-b from-[#1C1D1F] to-[#0A0A0A] rounded-t-lg shadow-2xl" />
                <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-72 h-4 bg-[#0A0A0A] rounded-full shadow-2xl" />
                
                {/* Monitor Frame */}
                <div className="relative border-[16px] border-[#1C1D1F] rounded-[2rem] shadow-[0_100px_200px_rgba(0,0,0,0.8)] bg-black overflow-hidden ring-1 ring-white/10 aspect-video">
                  <div className="absolute top-0 inset-x-0 h-10 bg-[#1C1D1F] flex items-center px-6 gap-3 z-50">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                    </div>
                    <div className="flex-1 flex justify-center">
                       <div className="px-6 py-1 bg-black/40 rounded-lg text-[9px] font-black text-white/30 tracking-[0.2em] uppercase">
                         {site?.subdomain}.odelink.shop
                       </div>
                    </div>
                  </div>
                  <div className="pt-10 w-full h-full">
                    <PreviewFrame site={site} />
                  </div>
                </div>
              </div>
            )}

            {/* REALISTIC TABLET Mockup */}
            {previewMode === 'tablet' && (
              <div className="relative w-[768px] aspect-[3/4] group">
                <div className="relative w-full h-full border-[18px] border-[#1C1D1F] rounded-[3rem] shadow-[0_80px_160px_rgba(0,0,0,0.8)] bg-black overflow-hidden ring-1 ring-white/10">
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/5 rounded-full mt-4" />
                   <PreviewFrame site={site} />
                </div>
                {/* Physical Button (Visual Only) */}
                <div className="absolute right-[-20px] top-24 w-1 h-16 bg-[#1C1D1F] rounded-r-lg" />
              </div>
            )}

            {/* REALISTIC PHONE Mockup */}
            {previewMode === 'mobile' && (
              <div className="relative w-[375px] h-[812px] group scale-90 sm:scale-100">
                <div className="relative w-full h-full border-[12px] border-[#1C1D1F] rounded-[4.5rem] shadow-[0_60px_120px_rgba(0,0,0,0.8)] bg-black overflow-hidden ring-1 ring-white/20">
                   {/* Dynamic Island Area */}
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#1C1D1F] rounded-b-3xl z-50 flex items-center justify-center">
                      <div className="w-12 h-1 bg-black/40 rounded-full" />
                   </div>
                   <PreviewFrame site={site} />
                   {/* Home Indicator */}
                   <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/20 rounded-full z-50" />
                </div>
                {/* Side Buttons */}
                <div className="absolute left-[-14px] top-32 w-1 h-12 bg-[#1C1D1F] rounded-l-lg" />
                <div className="absolute left-[-14px] top-48 w-1 h-16 bg-[#1C1D1F] rounded-l-lg" />
                <div className="absolute right-[-14px] top-40 w-1 h-20 bg-[#1C1D1F] rounded-r-lg" />
              </div>
            )}
          </motion.div>
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

