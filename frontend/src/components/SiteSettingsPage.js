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

      <div className="flex-1 flex overflow-hidden relative bg-[#050505]">
        
        {/* --- ULTRA-MODERN COLLAPSIBLE SIDEBAR --- */}
        <AnimatePresence mode="wait">
          {!isSidebarCollapsed && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="bg-[#0A0A0A] border-r border-white/5 z-[100] relative shadow-[20px_0_100px_rgba(0,0,0,0.8)] flex-shrink-0"
            >
              <div className="w-[380px] sm:w-[420px] h-full flex flex-col overflow-y-auto custom-scrollbar">
                <div className="p-8 space-y-10">
                  
                  {/* Header with Close */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Studio Config</span>
                    </div>
                    <button onClick={() => setIsSidebarCollapsed(true)} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all"><X size={18} /></button>
                  </div>

                  {/* Subdomain - Compact & Sexy */}
                  <div className="bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 p-6 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Store Address</span>
                      <div className="px-2 py-1 bg-blue-600 rounded-lg text-[8px] font-black text-white">{3 - (site?.subdomain_change_count || 0)} LEFT</div>
                    </div>
                    <div className="flex items-center gap-2 bg-black/60 rounded-2xl p-4 border border-white/5 focus-within:border-blue-500/50 transition-all">
                      <input 
                        defaultValue={site?.subdomain} 
                        onBlur={(e) => handleSubdomainUpdate(e.target.value)}
                        disabled={(3 - (site?.subdomain_change_count || 0)) <= 0}
                        className="bg-transparent border-none outline-none text-[12px] font-bold text-white w-full uppercase tracking-widest"
                      />
                      <span className="text-[10px] font-black text-white/20">.odelink</span>
                    </div>
                  </div>

                  {/* Navigation - Ultra Minimal */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'brand', icon: Palette },
                      { id: 'social', icon: Instagram },
                      { id: 'contact', icon: Phone },
                      { id: 'pages', icon: BookOpen }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`h-16 rounded-2xl border transition-all flex items-center justify-center ${activeTab === tab.id ? 'bg-white text-black border-transparent shadow-xl' : 'bg-white/[0.02] border-white/5 text-gray-500 hover:bg-white/5'}`}
                      >
                        <tab.icon size={20} strokeWidth={2} />
                      </button>
                    ))}
                  </div>

                  {/* Editor Content Area */}
                  <div className="space-y-8 pb-12">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                      >
                        {activeTab === 'brand' && (
                          <>
                            <EditorInput label="Mağaza İsmi" value={formData.name} onChange={v => setFormData({...formData, name: v})} />
                            <EditorInput label="Mağaza Açıklaması" type="textarea" value={formData.description} onChange={v => setFormData({...formData, description: v})} />
                            <EditorInput label="Logo Link" value={formData.branding.logo_url} onChange={v => setFormData({...formData, branding: {...formData.branding, logo_url: v}})} icon={ImageIcon} />
                            
                            <div className="space-y-3">
                              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Tipografi</p>
                              <select 
                                value={formData.branding.font_family} 
                                onChange={e => setFormData({...formData, branding: {...formData.branding, font_family: e.target.value}})}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-[11px] font-bold uppercase tracking-widest outline-none appearance-none cursor-pointer"
                              >
                                <option value="Playfair Display">Playfair Display (Lüks)</option>
                                <option value="Inter">Inter (Modern)</option>
                                <option value="Montserrat">Montserrat (Keskin)</option>
                                <option value="Outfit">Outfit (Premium)</option>
                              </select>
                            </div>

                            <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                              <div>
                                 <p className="text-[10px] font-black text-white uppercase tracking-widest">Odelink Logosu</p>
                                 <p className="text-[8px] text-gray-500 font-bold uppercase mt-1">Footer kısmında gizle</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={formData.branding.hide_odelink_credit} onChange={e => setFormData({...formData, branding: {...formData.branding, hide_odelink_credit: e.target.checked}})} className="sr-only peer" />
                                <div className="w-12 h-7 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                          </>
                        )}

                        {activeTab === 'social' && (
                          <div className="space-y-6">
                            <EditorInput label="Instagram" value={formData.social_links.instagram} onChange={v => setFormData({...formData, social_links: {...formData.social_links, instagram: v}})} icon={Instagram} placeholder="@user" />
                            <EditorInput label="X / Twitter" value={formData.social_links.x} onChange={v => setFormData({...formData, social_links: {...formData.social_links, x: v}})} icon={Twitter} placeholder="@user" />
                            <EditorInput label="Facebook" value={formData.social_links.facebook} onChange={v => setFormData({...formData, social_links: {...formData.social_links, facebook: v}})} icon={Facebook} placeholder="user" />
                          </div>
                        )}

                        {activeTab === 'contact' && (
                          <div className="space-y-6">
                            <EditorInput label="Müşteri Hattı" value={formData.contact_info.phone} onChange={v => setFormData({...formData, contact_info: {...formData.contact_info, phone: v}})} icon={Phone} placeholder="+90" />
                            <EditorInput label="Kurumsal E-posta" value={formData.contact_info.email} onChange={v => setFormData({...formData, contact_info: {...formData.contact_info, email: v}})} icon={Mail} />
                            <EditorInput label="Adres" type="textarea" value={formData.contact_info.address} onChange={v => setFormData({...formData, contact_info: {...formData.contact_info, address: v}})} icon={MapPin} />
                          </div>
                        )}

                        {activeTab === 'pages' && (
                          <div className="space-y-8">
                            {['about', 'privacy', 'returns', 'shipping', 'faq'].map(page => (
                              <div key={page} className="space-y-3">
                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">{page.toUpperCase()}</span>
                                <textarea 
                                  value={formData.pages[page]} 
                                  onChange={e => setFormData({...formData, pages: {...formData.pages, [page]: e.target.value}})}
                                  className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-[12px] font-medium min-h-[150px] focus:border-blue-500/50 outline-none transition-all resize-none"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* --- MAIN PREVIEW: Perfect Scaling & Realistic Mockups --- */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-dot-white/[0.05]">
          
          {/* Hamburger Trigger - Compact & Elegant */}
          {isSidebarCollapsed && (
            <motion.button 
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              onClick={() => setIsSidebarCollapsed(false)}
              className="absolute top-6 left-6 z-[110] w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all"
            >
              <Palette size={16} />
            </motion.button>
          )}

          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[600px] h-[600px] bg-blue-500/5 blur-[200px] rounded-full" />
          </div>

          <motion.div 
            layout
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="w-full h-full flex items-center justify-center perspective-[2000px] px-4"
          >
            {/* REALISTIC STUDIO MONITOR (Apple Studio Display Style) */}
            {previewMode === 'desktop' && (
              <div className="relative w-full max-w-[800px] flex flex-col items-center transition-all duration-700">
                {/* Monitor Frame */}
                <div className="relative w-full aspect-video border-[12px] border-[#1C1D1F] rounded-[2rem] shadow-[0_60px_120px_rgba(0,0,0,0.8)] bg-black overflow-hidden ring-1 ring-white/10 group-hover:rotate-x-1 transition-transform">
                   <PreviewFrame site={site} />
                </div>
                {/* Stand Neck */}
                <div className="w-32 h-12 bg-gradient-to-b from-[#1C1D1F] to-[#0A0A0A] -mt-1" style={{ clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)' }} />
                {/* Stand Base */}
                <div className="w-56 h-2.5 bg-[#1C1D1F] rounded-t-xl shadow-2xl" />
              </div>
            )}

            {/* REALISTIC IPAD PRO Mockup */}
            {previewMode === 'tablet' && (
              <div className="relative transition-all duration-700 h-[80vh] max-h-[800px] aspect-[3/4] flex-shrink-0">
                {/* iPad outer shell */}
                <div className="w-full h-full bg-[#1C1D1F] rounded-[2.5rem] p-3.5 shadow-[0_50px_100px_rgba(0,0,0,0.8)] ring-1 ring-white/10 relative">
                  {/* Screen */}
                  <div className="w-full h-full bg-black rounded-[2rem] overflow-hidden relative">
                    {/* Front camera dot */}
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1a1a1a] rounded-full z-50 ring-1 ring-white/5" />
                    <PreviewFrame site={site} />
                  </div>
                </div>
                {/* Volume buttons */}
                <div className="absolute right-[-4px] top-[15%] w-[4px] h-[5%] bg-[#2a2a2a] rounded-r-sm" />
                <div className="absolute right-[-4px] top-[22%] w-[4px] h-[5%] bg-[#2a2a2a] rounded-r-sm" />
                {/* Power button */}
                <div className="absolute top-[-4px] right-[15%] h-[4px] w-[8%] bg-[#2a2a2a] rounded-t-sm" />
              </div>
            )}

            {/* REALISTIC IPHONE 17 PRO Mockup */}
            {previewMode === 'mobile' && (
              <div className="relative transition-all duration-700 h-[80vh] max-h-[750px] aspect-[9/19.5] flex-shrink-0">
                {/* iPhone outer shell */}
                <div className="w-full h-full bg-[#1C1D1F] rounded-[3.5rem] p-3 shadow-[0_40px_80px_rgba(0,0,0,0.8)] ring-1 ring-white/20 relative">
                  {/* Screen */}
                  <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden relative">
                    {/* Dynamic Island */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-50 flex items-center justify-end pr-2 ring-1 ring-[#1C1D1F]">
                      <div className="w-2 h-2 bg-[#0a0a0a] rounded-full ring-1 ring-[#222]" />
                    </div>
                    <PreviewFrame site={site} />
                    {/* Home Indicator */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-50" />
                  </div>
                </div>
                {/* Side buttons */}
                <div className="absolute left-[-4px] top-[20%] w-[4px] h-[4%] bg-[#2a2a2a] rounded-l-sm" />
                <div className="absolute left-[-4px] top-[28%] w-[4px] h-[8%] bg-[#2a2a2a] rounded-l-sm" />
                <div className="absolute left-[-4px] top-[38%] w-[4px] h-[8%] bg-[#2a2a2a] rounded-l-sm" />
                {/* Power button */}
                <div className="absolute right-[-4px] top-[30%] w-[4px] h-[12%] bg-[#2a2a2a] rounded-r-sm" />
              </div>
            )}
          </motion.div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        .bg-dot-white\/\\[0\.05\\] { background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px); background-size: 30px 30px; }
      `}} />
    </div>
  );
}

function EditorInput({ label, value, onChange, type = 'text', icon: Icon, placeholder }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-1">{label}</label>
      <div className="relative group">
        {Icon && <Icon className="absolute left-5 top-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={16} />}
        {type === 'textarea' ? (
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-[11px] font-bold min-h-[110px] focus:border-blue-500/50 focus:bg-white/[0.04] outline-none transition-all resize-none ${Icon ? 'pl-14' : ''}`}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-[11px] font-black uppercase tracking-widest focus:border-blue-500/50 focus:bg-white/[0.04] outline-none transition-all ${Icon ? 'pl-14' : ''}`}
          />
        )}
      </div>
    </div>
  );
}

