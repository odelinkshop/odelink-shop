import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  ChevronLeft, 
  Save, 
  Palette, 
  Type, 
  Layers, 
  Image as ImageIcon, 
  Globe, 
  Zap, 
  Sparkles,
  Smartphone as PhoneIcon,
  MousePointer2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Layout,
  MessageSquare,
  Instagram,
  Facebook,
  Phone,
  Mail,
  MapPin,
  Loader2,
  Move,
  Trash2,
  Plus,
  Box,
  Settings,
  Cpu,
  BarChart,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Activity,
  MousePointer,
  Code,
  Maximize,
  Lock,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import useCapabilities from '../hooks/useCapabilities';
import { getAuthHeaders, getAuthToken } from '../utils/authStorage';
import BrandLogo from './BrandLogo';

const API_BASE = process.env.REACT_APP_API_URL || '';

const DEFAULT_THEME_CUSTOMIZATION = {
  brandLogoText: '',
  heroBadge: '',
  heroLine1: '',
  heroAccent: '',
  heroLine3: '',
  heroDescription: '',
  heroImage1: '',
  heroImage2: '',
  heroImage3: '',
  catalogTitle: '',
  catalogSubtitle: '',
  featuredLabel: '',
  featuredTitle: '',
  featuredDescription: '',
  featuredButtonText: '',
  featuredImage1: '',
  featuredImage2: '',
  featuredImage3: '',
  contactTitle: '',
  contactSubtitle: '',
  ctaBoxTitle: '',
  ctaBoxText: '',
  ctaBoxButtonText: '',
  footerAbout: '',
  productImageHeight: 300,
  productTitleSize: 22,
  productImageFit: 'cover',
  glassmorphism: true,
  animations: true,
  gradientBg: true,
  fontFamily: 'Inter',
  theme: 'modern'
};

const normalizeThemeCustomization = (raw) => {
  const input = raw && typeof raw === 'object' ? raw : {};
  return { ...DEFAULT_THEME_CUSTOMIZATION, ...input };
};

export default function SiteSettingsPage({ forcedSection }) {
  const navigate = useNavigate();
  const { id, section: sectionParam } = useParams();
  const { capabilities } = useCapabilities();
  const token = getAuthToken();

  // Core States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [site, setSite] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [stats, setStats] = useState({ views: 0, visitors: 0, conversion: 0 });

  // Editor States
  const [previewMode, setPreviewMode] = useState('mobile'); 
  const [activeTab, setActiveTab] = useState(
    forcedSection === 'design' ? 'style' : (forcedSection || sectionParam || 'hero')
  ); 
  const [layout, setLayout] = useState(['hero', 'catalog', 'featured', 'contact', 'footer']);
  const [scale, setScale] = useState(1);
  const previewContainerRef = useRef(null);
  
  // Customization States
  const [themeCustomization, setThemeCustomization] = useState(DEFAULT_THEME_CUSTOMIZATION);
  const [generalInfo, setGeneralInfo] = useState({ name: '', shopierUrl: '', description: '' });
  const [contactInfo, setContactInfo] = useState({ phone: '', email: '', address: '', instagram: '', tiktok: '', facebook: '' });
  const [selectedColor, setSelectedColor] = useState('blue');
  const [mobileView, setMobileView] = useState('editor'); // 'editor' or 'preview'
  const [manualProducts, setManualProducts] = useState([]);
  const [articles, setArticles] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);

  useEffect(() => {
    if (!token) { navigate('/auth'); return; }
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/sites/${encodeURIComponent(id)}`, {
          headers: getAuthHeaders()
        });
        const data = await res.json();
        if (res.ok) {
          const s = data.site;
          setSite(s);
          setGeneralInfo({
            name: s.name || '',
            shopierUrl: s.shopier_url || s.shopierUrl || '',
            customDomain: s.custom_domain || '',
            description: s.settings?.description || ''
          });
          setContactInfo(s.settings?.contact || {});
          setSelectedColor(s.settings?.color || 'blue');
          setThemeCustomization(normalizeThemeCustomization(s.settings?.themeCustomization));
          setManualProducts(Array.isArray(s.settings?.manualProducts) ? s.settings.manualProducts : []);
          setArticles(Array.isArray(s.settings?.articles) ? s.settings.articles : []);
          if (s.settings?.layout) setLayout(s.settings.layout);
        }
      } catch (e) { setError('Bağlantı hatası'); }
      finally { setLoading(false); }
    };

    const loadStats = async () => {
       try {
          const res = await fetch(`${API_BASE}/api/metrics/site/${encodeURIComponent(id)}/summary`, {
             headers: getAuthHeaders()
          });
          const data = await res.json();
          if (res.ok) setStats(data.summary || { views: 0, visitors: 0, conversion: 0 });
       } catch (e) { void e; }
    };

    load();
    loadStats();
  }, [id, token, navigate]);

  // Handle Dynamic Scaling
  useEffect(() => {
    const handleResize = () => {
      if (!previewContainerRef.current) return;
      const container = previewContainerRef.current;
      const { width, height } = container.getBoundingClientRect();
      
      let deviceWidth = width;
      let deviceHeight = height;

      if (previewMode === 'mobile') {
        deviceWidth = 430;
        deviceHeight = 880;
      } else if (previewMode === 'tablet') {
        deviceWidth = 820;
        deviceHeight = 1080;
      } else {
        setScale(1);
        return;
      }

      const padding = 60;
      const scaleX = (width - padding) / deviceWidth;
      const scaleY = (height - padding) / deviceHeight;
      const newScale = Math.min(scaleX, scaleY, 1);
      setScale(newScale);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [previewMode, loading]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const payload = {
        name: generalInfo.name,
        shopierUrl: generalInfo.shopierUrl,
        customDomain: generalInfo.customDomain,
        settings: {
          ...(site?.settings || {}),
          description: generalInfo.description,
          contact: contactInfo,
          color: selectedColor,
          themeCustomization,
          manualProducts,
          articles,
          layout
        }
      };
      const res = await fetch(`${API_BASE}/api/sites/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (e) { setError('Hata oluştu'); }
    finally { setSaving(false); }
  };

  const updateCustomField = (key, val) => {
    const next = { ...themeCustomization, [key]: val };
    setThemeCustomization(next);
    syncToPreview({ themeCustomization: next });
  };

  const syncToPreview = (updates) => {
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'ODELINK_EDITOR_UPDATE',
        settings: {
          ...updates,
          design: {
            primaryColor: selectedColor === 'blue' ? '#F2EBE1' : '#ffffff', // Simplified
            accentColor: '#C5A059'
          }
        }
      }, '*');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#08090A] flex flex-col items-center justify-center gap-6">
       <div className="relative">
          <div className="w-20 h-20 border-2 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <Activity className="text-blue-500 w-8 h-8 animate-pulse" />
          </div>
       </div>
       <div className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-500">Nova Elite Studio</div>
    </div>
  );

  return (
    <div className="h-screen bg-[#08090A] text-[#E1E1E1] flex flex-col overflow-hidden font-sans select-none">
      {/* --- TOP HEADER --- */}
      <header className="h-[60px] md:h-[90px] px-4 md:px-10 flex items-center justify-between bg-[#08090A]/80 backdrop-blur-3xl border-b border-white/5 z-[60] sticky top-0">
         <div className="flex items-center gap-2 md:gap-6 min-w-0">
            <button onClick={() => navigate('/panel')} className="group flex items-center gap-2 p-1.5 md:p-2 hover:bg-white/5 rounded-lg md:rounded-2xl transition-all text-gray-500 hover:text-white border border-transparent hover:border-white/5 shrink-0">
               <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform md:w-[18px] md:h-[18px]" />
            </button>
            <div className="flex items-center gap-2 md:gap-3.5 min-w-0">
               <div className="w-7 h-7 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg md:rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] shrink-0">
                  <Sparkles size={12} className="md:w-5 md:h-5" />
               </div>
               <div className="min-w-0">
                  <h1 className="text-[11px] md:text-base font-black text-white leading-none tracking-tight uppercase md:normal-case truncate">Studio</h1>
                  <div className="hidden lg:flex items-center gap-2 mt-1.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Canlı Düzenleme</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Device Selector */}
         <div className="hidden md:flex items-center bg-black/50 p-1.5 rounded-[22px] border border-white/10 shadow-inner">
            {[
              { id: 'desktop', icon: Monitor, label: 'Desktop' },
              { id: 'tablet', icon: Tablet, label: 'Tablet' },
              { id: 'mobile', icon: PhoneIcon, label: 'iPhone 14 Pro Max' }
            ].map(d => (
              <button
                key={d.id}
                onClick={() => setPreviewMode(d.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-[18px] transition-all duration-300 ${previewMode === d.id ? 'bg-white text-black shadow-xl scale-105 font-black' : 'text-gray-500 hover:text-gray-200'}`}
                title={d.label}
              >
                <d.icon size={16} />
                {previewMode === d.id && <span className="text-[10px] uppercase tracking-widest hidden xl:block">{d.label}</span>}
              </button>
            ))}
         </div>

         {/* Mobile View Toggle */}
         <div className="flex md:hidden items-center bg-[#111214] p-1 md:p-1.5 rounded-lg md:rounded-xl border border-white/5">
            <button 
               onClick={() => setMobileView('editor')}
               className={`px-3 md:px-6 py-2 md:py-2.5 rounded-md md:rounded-lg text-[10px] md:text-xs font-black tracking-widest transition-all ${mobileView === 'editor' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-gray-500 hover:text-gray-300'}`}
            >
               EDİTÖR
            </button>
            <button 
               onClick={() => setMobileView('preview')}
               className={`px-3 md:px-6 py-2 md:py-2.5 rounded-md md:rounded-lg text-[10px] md:text-xs font-black tracking-widest transition-all ${mobileView === 'preview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-gray-300'}`}
            >
               ÖNİZLE
            </button>
         </div>

           <div className="flex items-center gap-2">
            <button 
               onClick={handleSave}
               className="h-10 md:h-12 px-5 md:px-8 bg-white hover:bg-gray-100 text-black text-[10px] md:text-xs font-black tracking-widest rounded-lg md:rounded-xl transition-all active:scale-95 shadow-xl shadow-white/5"
            >
               <span className="hidden sm:inline">DEĞİŞİKLİKLERİ YAYINLA</span>
               <span className="sm:hidden uppercase">Yayınla</span>
            </button>
         </div>
      </header>

      {/* --- MAIN EDITOR AREA --- */}
      <div className="flex-1 flex overflow-hidden">
         
         {/* LEFT SIDEBAR: THE ELITE CONTROL CENTER */}
         <aside className={`${mobileView === 'editor' ? 'flex' : 'hidden'} lg:flex w-full lg:w-[380px] bg-[#0C0D0E] border-r border-white/5 flex flex-col z-40 shadow-2xl overflow-hidden`}>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-7 space-y-6 sm:space-y-9">
               
               {/* Quick Stats Panel */}
               <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl md:rounded-2xl p-2.5 md:p-4">
                     <p className="text-[7px] md:text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1 md:gap-1.5">
                        <Activity size={8} className="text-blue-500 md:w-2.5 md:h-2.5" /> İzlenme
                     </p>
                     <p className="text-xs md:text-xl font-serif text-white">{stats.views.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl md:rounded-2xl p-2.5 md:p-4">
                     <p className="text-[7px] md:text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1 md:gap-1.5">
                        <MousePointer size={8} className="text-emerald-500 md:w-2.5 md:h-2.5" /> Ziyaretçi
                     </p>
                     <p className="text-xs md:text-xl font-serif text-white">{stats.visitors.toLocaleString()}</p>
                  </div>
               </div>

               {/* Navigation Tabs */}
               <div className="space-y-1.5">
                  <p className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 md:mb-5">Mimari Kontrol</p>
                  {[
                    { id: 'hero', label: 'Kapak', labelFull: 'Kapak & Karşılama', icon: ImageIcon, color: 'text-rose-500' },
                    { id: 'products', label: 'Ürünler', labelFull: 'Ürün Yönetimi', icon: Box, color: 'text-emerald-500' },
                    { id: 'blog', label: 'Dergi', labelFull: 'Editorial (Blog)', icon: BookOpen, color: 'text-amber-500' },
                    { id: 'layout', label: 'Dizilim', labelFull: 'Bölüm Yönetimi', icon: Layers, color: 'text-blue-500' },
                    { id: 'style', label: 'Tasarım', labelFull: 'Marka & Estetik', icon: Palette, color: 'text-purple-500' },
                    { id: 'general', label: 'Sosyal', labelFull: 'İletişim & Sosyal', icon: MessageSquare, color: 'text-sky-500' }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => setActiveTab(s.id)}
                      className={`w-full flex items-center justify-between px-3 md:px-5 py-2.5 md:py-4 rounded-lg md:rounded-[20px] text-[8px] md:text-[11px] font-black transition-all border ${activeTab === s.id ? 'bg-blue-600/10 text-white border-blue-500/40 shadow-xl' : 'text-gray-500 hover:bg-white/[0.03] border-transparent'}`}
                    >
                      <div className="flex items-center gap-2.5 md:gap-4">
                         <s.icon size={14} className={activeTab === s.id ? 'text-blue-400 md:w-[18px] md:h-[18px]' : s.color + ' md:w-[18px] md:h-[18px]'} />
                         <span className="md:hidden">{s.label.toUpperCase()}</span>
                         <span className="hidden md:block">{s.labelFull.toUpperCase()}</span>
                      </div>
                      {activeTab === s.id && <motion.div layoutId="activeInd" className="w-1 md:w-1.5 h-3 md:h-6 bg-blue-500 rounded-full" />}
                    </button>
                  ))}
               </div>

               <div className="h-px bg-white/5" />

               {/* Tab Content */}
               <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                    className="space-y-7"
                  >
                     {activeTab === 'hero' && (
                        <div className="space-y-6">
                           <EditorField label="Kapak Rozeti" value={themeCustomization.heroBadge} onChange={v => updateCustomField('heroBadge', v)} placeholder="Örn: Limitli Koleksiyon" icon={Sparkles} />
                           <EditorField label="Kayan Yazı (Duyuru)" value={themeCustomization.announcementBar} onChange={v => updateCustomField('announcementBar', v)} placeholder="Kargo ve indirim duyurusu..." icon={Zap} />
                           <EditorField label="Ana Başlık" value={themeCustomization.heroLine1} onChange={v => updateCustomField('heroLine1', v)} placeholder="Örn: Tarzını" />
                           <EditorField label="Alt Başlık" value={themeCustomization.heroSubtitle} onChange={v => updateCustomField('heroSubtitle', v)} placeholder="Örn: İstanbul, TR" />
                           <EditorField label="Vurgu Kelimesi" value={themeCustomization.heroAccent} onChange={v => updateCustomField('heroAccent', v)} placeholder="Örn: Özgür Bırak" icon={Zap} />
                           <EditorField label="Alt Açıklama" type="textarea" value={themeCustomization.heroDescription} onChange={v => updateCustomField('heroDescription', v)} placeholder="Site girişinde görünecek profesyonel açıklama..." />
                           <EditorField label="Kapak Görseli URL" value={themeCustomization.heroImage1} onChange={v => updateCustomField('heroImage1', v)} placeholder="https://..." icon={ImageIcon} />
                        </div>
                      )}

                      {activeTab === 'products' && (
                        <div className="space-y-6">
                           <div className="flex justify-between items-center px-1">
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Envanter</p>
                              <button 
                                 onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                                 className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                              >
                                 <Plus size={10} /> Ürün Ekle
                              </button>
                           </div>

                           <div className="space-y-3">
                              {manualProducts.length === 0 && (
                                 <div className="py-12 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[32px]">
                                    <Box className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Henüz ürün eklenmedi</p>
                                 </div>
                              )}
                              {manualProducts.map((p, idx) => (
                                 <div key={idx} className="bg-white/[0.03] border border-white/5 p-4 rounded-[24px] flex items-center justify-between group hover:border-blue-500/30 transition-all">
                                    <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden border border-white/5">
                                          {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <ImageIcon className="w-full h-full p-3 text-gray-700" />}
                                       </div>
                                       <div>
                                          <p className="text-[11px] font-black text-white truncate max-w-[120px]">{p.name}</p>
                                          <p className="text-[9px] font-bold text-blue-500">{p.price}</p>
                                       </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                       <button onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white"><Settings size={14} /></button>
                                       <button onClick={() => setManualProducts(prev => prev.filter((_, i) => i !== idx))} className="p-2 hover:bg-rose-500/20 rounded-xl text-gray-400 hover:text-rose-500"><Trash2 size={14} /></button>
                                    </div>
                                 </div>
                              ))}
                           </div>

                           <div className="h-px bg-white/5" />
                           
                           <div>
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Görünüm Ayarları</p>
                              <div className="bg-black/30 border border-white/5 rounded-3xl p-6 space-y-5">
                                 <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Kart Boyutu</span>
                                    <span className="text-[10px] font-black text-blue-400">{themeCustomization.productImageHeight}px</span>
                                 </div>
                                 <input 
                                    type="range" min="180" max="520" step="10" 
                                    value={themeCustomization.productImageHeight}
                                    onChange={e => updateCustomField('productImageHeight', e.target.value)}
                                    className="w-full accent-blue-500 h-1 bg-white/10 rounded-full appearance-none"
                                 />
                              </div>
                           </div>
                        </div>
                      )}

                     {activeTab === 'layout' && (
                        <div className="space-y-4">
                           <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Bölüm Sıralaması</p>
                           <Reorder.Group axis="y" values={layout} onReorder={setLayout} className="space-y-3">
                              {layout.map(item => (
                                 <Reorder.Item 
                                    key={item} value={item}
                                    className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex items-center justify-between cursor-grab active:cursor-grabbing hover:border-white/10 transition-all"
                                 >
                                    <div className="flex items-center gap-4">
                                       <Move size={14} className="text-gray-600" />
                                       <span className="text-[11px] font-black uppercase tracking-widest text-gray-300">
                                          {item === 'hero' ? 'Kapak' : item === 'catalog' ? 'Ürünler' : item === 'featured' ? 'Öne Çıkan' : item === 'contact' ? 'İletişim' : 'Alt Bilgi'}
                                       </span>
                                    </div>
                                    <div className="flex gap-2">
                                       <button className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white"><Eye size={14} /></button>
                                    </div>
                                 </Reorder.Item>
                              ))}
                           </Reorder.Group>
                        </div>
                     )}

                     {activeTab === 'style' && (
                        <div className="space-y-8">
                            <div className="mb-8">
                               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-5">Şablon Seçimi</p>
                               <div className="grid grid-cols-2 gap-4">
                                  {[
                                    { id: 'modern', name: 'NOVA Modern', desc: 'Aristokratik & Temiz', isLocked: !capabilities?.allowedThemes?.includes('modern') && capabilities?.tier !== 'profesyonel' },
                                    { id: 'luxury', name: 'LÜKS (V2)', desc: 'Gold & Deep Black', isLocked: !capabilities?.allowedThemes?.includes('luxury') },
                                    { id: 'minimal', name: 'MİNİMAL', desc: 'Saf & Tipografik', isLocked: !capabilities?.allowedThemes?.includes('minimal') }
                                  ].map(t => (
                                    <button
                                      key={t.id}
                                      onClick={() => {
                                         if (t.isLocked) {
                                            toast.error('Bu tema Profesyonel plana özeldir.');
                                            return;
                                         }
                                         updateCustomField('theme', t.id);
                                      }}
                                      className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${themeCustomization.theme === t.id ? 'bg-blue-600/10 border-blue-500 shadow-xl' : 'bg-white/[0.02] border-white/5 opacity-60 hover:opacity-100'}`}
                                    >
                                      <div className="text-[10px] font-black text-white uppercase tracking-widest">{t.name}</div>
                                      <div className="text-[8px] text-gray-500 font-bold uppercase mt-1">{t.desc}</div>
                                      {t.isLocked && (
                                         <div className="absolute top-2 right-2 text-amber-500"><Lock size={12} /></div>
                                      )}
                                      {themeCustomization.theme === t.id && (
                                         <div className="absolute bottom-2 right-2 text-blue-500"><CheckCircle2 size={12} /></div>
                                      )}
                                    </button>
                                  ))}
                               </div>
                            </div>

                            <div className="mb-8">
                               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-5">Görsel Kimlik Rengi</p>
                               <div className="grid grid-cols-4 gap-4">
                                  {['blue', 'emerald', 'rose', 'indigo', 'amber', 'purple', 'sky', 'gray'].map(c => {
                                    const isPremiumColor = !['blue', 'purple', 'emerald', 'amber'].includes(c);
                                    const isLocked = isPremiumColor && !capabilities?.allowedColors?.includes(c);
                                    return (
                                    <button
                                       key={c}
                                       onClick={() => {
                                          if (isLocked) {
                                             toast.error('Bu renk Profesyonel plana özeldir. Lütfen planınızı yükseltin.');
                                             return;
                                          }
                                          setSelectedColor(c);
                                       }}
                                       className={`w-full aspect-square rounded-[20px] border-4 transition-all relative ${selectedColor === c ? 'border-white scale-110 shadow-2xl' : 'border-transparent opacity-40 hover:opacity-100'}`}
                                       style={{ backgroundColor: c === 'blue' ? '#3B82F6' : c === 'emerald' ? '#10B981' : c === 'rose' ? '#F43F5E' : c === 'indigo' ? '#6366F1' : c === 'amber' ? '#F59E0B' : c === 'purple' ? '#A855F7' : c === 'sky' ? '#0EA5E9' : '#64748B' }}
                                    >
                                       {selectedColor === c && <div className="absolute inset-0 flex items-center justify-center text-white"><CheckCircle2 size={24} /></div>}
                                       {isLocked && <div className="absolute inset-0 flex items-center justify-center text-white/80 bg-black/50 rounded-[16px] backdrop-blur-sm"><Lock size={18} /></div>}
                                    </button>
                                 )})}
                              </div>
                           </div>

                           <div className="space-y-4">
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Estetik Özellikler</p>
                              {[
                                 { key: 'glassmorphism', label: 'Cam Efekti (Glass)', icon: Sparkles, locked: !capabilities?.allowedDesignControls?.includes('custom_css') },
                                 { key: 'animations', label: 'Scroll Akıcılığı', icon: Move, locked: !capabilities?.allowedDesignControls?.includes('advanced_animations') },
                                 { key: 'gradientBg', label: 'Lüks Arka Plan', icon: Palette, locked: !capabilities?.allowedDesignControls?.includes('custom_css') }
                              ].map(f => (
                                 <button
                                    key={f.key}
                                    onClick={() => {
                                       if (f.locked) {
                                          toast.error('Bu tasarım özelliği Profesyonel plana özeldir.');
                                          return;
                                       }
                                       updateCustomField(f.key, !themeCustomization[f.key]);
                                    }}
                                    className={`w-full flex items-center justify-between p-5 rounded-3xl border transition-all relative overflow-hidden ${themeCustomization[f.key] ? 'bg-blue-600/10 border-blue-500/30' : 'bg-white/[0.02] border-white/5 opacity-80'} ${f.locked ? 'opacity-50 grayscale' : ''}`}
                                 >
                                    <div className="flex items-center gap-4 relative z-10">
                                       <f.icon size={18} className={themeCustomization[f.key] ? 'text-blue-400' : 'text-gray-500'} />
                                       <span className="text-[11px] font-black tracking-widest uppercase">{f.label}</span>
                                       {f.locked && <Lock size={12} className="text-amber-500 ml-2" />}
                                    </div>
                                    <div className={`w-12 h-6 rounded-full relative transition-all z-10 ${themeCustomization[f.key] ? 'bg-blue-600' : 'bg-gray-800'}`}>
                                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${themeCustomization[f.key] ? 'right-1' : 'left-1'}`} />
                                    </div>
                                 </button>
                              ))}
                           </div>
                        </div>
                     )}

                      {activeTab === 'general' && (
                        <div className="space-y-6">
                           <EditorField label="Mağaza İsmi" value={generalInfo.name} onChange={v => setGeneralInfo(p => ({...p, name: v}))} icon={Globe} />
                           <EditorField label="Hakkımızda Başlık" value={themeCustomization.aboutTitle} onChange={v => updateCustomField('aboutTitle', v)} placeholder="Örn: Hikayemiz" />
                           <EditorField label="Hakkımızda Metni" type="textarea" value={themeCustomization.aboutText} onChange={v => updateCustomField('aboutText', v)} />
                           <div className="h-px bg-white/5" />
                           <EditorField label="Instagram" value={contactInfo.instagram} onChange={v => setContactInfo(p => ({...p, instagram: v}))} icon={Instagram} />
                           <EditorField label="Telefon" value={contactInfo.phone} onChange={v => setContactInfo(p => ({...p, phone: v}))} icon={Phone} />
                           <EditorField label="E-posta" value={contactInfo.email} onChange={v => setContactInfo(p => ({...p, email: v}))} icon={Mail} />
                        </div>
                      )}


                  </motion.div>
               </AnimatePresence>

            </div>
         </aside>

         {/* RIGHT PREVIEW: THE INFINITE ENGINE (WITH SMART SCALING) */}
         <main ref={previewContainerRef} className={`${mobileView === 'preview' ? 'fixed inset-0 pt-[60px] z-[50] bg-[#08090A]' : 'hidden'} lg:relative lg:flex lg:pt-0 lg:z-0 flex-1 items-center justify-center p-0 md:p-12 overflow-hidden`}>
            <div className="absolute inset-0 pointer-events-none">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-500/[0.02] blur-[200px] rounded-full animate-pulse" />
            </div>

            <motion.div 
               layout
               initial={false}
               animate={{ scale: scale }}
               transition={{ type: 'spring', stiffness: 200, damping: 30 }}
               className={`relative z-10 origin-center transition-all duration-700 ${
                  previewMode === 'mobile' ? 'w-[430px] h-[880px]' : 
                  previewMode === 'tablet' ? 'w-[820px] h-[1080px]' : 
                  'w-full h-full'
               }`}
            >
               <AnimatePresence mode="wait">
                  {previewMode === 'mobile' ? (
                     <motion.div 
                        key="iphone"
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full h-full relative flex items-center justify-center"
                     >
                        <div className="w-full max-w-[430px] aspect-[9/19.5] md:h-full relative bg-[#0C0D0E] rounded-[40px] md:rounded-[70px] border-[8px] md:border-[16px] border-[#1C1D1F] shadow-[0_60px_150px_rgba(0,0,0,0.9)] outline outline-2 outline-white/10 overflow-hidden">
                           <div className="w-full h-full bg-black relative">
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80px] md:w-[124px] h-[20px] md:h-[36px] bg-black rounded-b-[20px] z-[60] flex items-center justify-center gap-2 border border-white/5">
                                 <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-[#1A1A1A]" />
                              </div>
                              <iframe 
                                 src={`https://${site?.subdomain}.odelink.shop?preview=true&v=${Date.now()}`} 
                                 className="w-full h-full border-none"
                              />
                           </div>
                        </div>
                     </motion.div>
                  ) : previewMode === 'tablet' ? (
                     <motion.div 
                        key="tablet"
                        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                        className="w-full h-full bg-[#0C0D0E] rounded-[50px] border-[24px] border-[#1C1D1F] shadow-[0_80px_180px_rgba(0,0,0,0.8)] overflow-hidden"
                     >
                        <iframe 
                           src={`https://${site?.subdomain}.odelink.shop?preview=true&v=${Date.now()}`} 
                           className="w-full h-full border-none rounded-[26px]"
                        />
                     </motion.div>
                  ) : (
                     <motion.div 
                        key="desktop"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="w-full h-full bg-black rounded-[24px] overflow-hidden shadow-2xl border border-white/5 flex flex-col"
                     >
                        <div className="h-9 bg-[#0C0D0E] border-b border-white/5 flex items-center px-6 gap-2">
                           <div className="w-3 h-3 rounded-full bg-rose-500/30" />
                           <div className="w-3 h-3 rounded-full bg-amber-500/30" />
                           <div className="w-3 h-3 rounded-full bg-emerald-500/30" />
                           <div className="flex-1 flex justify-center ml-[-40px]">
                              <div className="bg-white/5 px-8 py-1 rounded-full text-[9px] font-black tracking-widest text-gray-500">
                                 {site?.subdomain}.odelink.shop
                              </div>
                           </div>
                        </div>
                        <iframe 
                           src={`https://${site?.subdomain}.odelink.shop?preview=true&v=${Date.now()}`} 
                           className="w-full flex-1 border-none"
                        />
                     </motion.div>
                  )}
               </AnimatePresence>

               {/* Scale Indicator for Mobile/Tablet */}
               {scale < 1 && previewMode !== 'desktop' && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                     <Maximize size={10} className="text-gray-500" />
                     <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Otomatik Ölçeklendi: %{Math.round(scale * 100)}</span>
                  </div>
               )}
            </motion.div>

            {/* Bottom Info */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-8 py-3 bg-white/[0.02] border border-white/10 rounded-full backdrop-blur-3xl shadow-2xl z-20">
               <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Nova Rendering Engine v2.1</span>
            </div>
         </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.12); }
      `}} />

      {/* PRODUCT MODAL */}
      <AnimatePresence>
         {isProductModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProductModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
               <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-2xl bg-[#0C0D0E] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
               >
                  <div className="p-8 border-b border-white/5 flex justify-between items-center">
                     <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-widest">{editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-1">Aristokratik Envanter Yönetimi</p>
                     </div>
                     <button onClick={() => setIsProductModalOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                        <Plus size={20} className="rotate-45" />
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <EditorField label="Ürün İsmi" value={editingProduct ? editingProduct.name : ''} onChange={v => setEditingProduct(p => ({...(p || {}), name: v}))} placeholder="Örn: Silk Night Robe" />
                        <EditorField label="Fiyat (TL)" value={editingProduct ? editingProduct.price : ''} onChange={v => setEditingProduct(p => ({...(p || {}), price: v}))} placeholder="Örn: 2,450 TL" />
                     </div>
                     <EditorField label="Açıklama" type="textarea" value={editingProduct ? editingProduct.description : ''} onChange={v => setEditingProduct(p => ({...(p || {}), description: v}))} />
                     <EditorField label="Görsel URL" value={editingProduct ? editingProduct.image : ''} onChange={v => setEditingProduct(p => ({...(p || {}), image: v}))} placeholder="https://..." icon={ImageIcon} />
                     
                     <div className="bg-blue-600/5 border border-blue-500/20 p-6 rounded-[32px] flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 shrink-0">
                           <Zap size={24} />
                        </div>
                        <div>
                           <p className="text-[11px] font-black text-white uppercase tracking-widest">Akıllı Entegrasyon</p>
                           <p className="text-[10px] text-gray-500 font-medium mt-1 leading-relaxed">Eklediğiniz ürünler Nova Engine tarafından anında işlenir ve vitrininizde en yüksek çözünürlükle sergilenir.</p>
                        </div>
                     </div>
                  </div>

                  <div className="p-8 bg-black/40 border-t border-white/5 flex gap-4">
                     <button 
                        onClick={() => setIsProductModalOpen(false)}
                        className="flex-1 h-14 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:bg-white/5 transition-all"
                     >
                        İptal
                     </button>
                     <button 
                        onClick={() => {
                           if (editingProduct?.id) {
                              setManualProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
                           } else {
                              const newP = { ...editingProduct, id: 'manual-' + Date.now() };
                              setManualProducts(prev => [...prev, newP]);
                           }
                           setIsProductModalOpen(false);
                        }}
                        className="flex-[2] h-14 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-100 transition-all shadow-xl shadow-white/5"
                     >
                        Kaydet ve Yayınla
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}

const EditorField = ({ label, value, onChange, type = 'text', placeholder, icon: Icon }) => (
  <div className="space-y-3">
     <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
        {Icon && <Icon size={12} className="text-blue-500/80" />}
        {label}
     </label>
     {type === 'textarea' ? (
       <textarea
         value={value || ''}
         onChange={e => onChange(e.target.value)}
         placeholder={placeholder}
         className="w-full bg-white/[0.02] border border-white/5 rounded-xl md:rounded-[24px] px-4 md:px-6 py-4 md:py-5 text-[11px] md:text-xs text-white placeholder-gray-700 focus:outline-none focus:border-blue-500/40 transition-all min-h-[100px] md:min-h-[140px] resize-none shadow-inner"
       />
     ) : (
       <div className="relative group">
           <input
            type="text"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-white/[0.02] border border-white/5 rounded-lg md:rounded-[20px] px-4 md:px-6 py-3.5 md:py-4.5 text-[11px] md:text-xs text-white placeholder-gray-700 focus:outline-none focus:border-blue-500/40 transition-all shadow-inner"
          />
          <div className="absolute inset-0 rounded-[20px] bg-blue-500/[0.02] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500" />
       </div>
     )}
  </div>
);

