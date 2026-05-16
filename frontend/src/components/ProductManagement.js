import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  X, 
  Loader2, 
  Search,
  CheckCircle2,
  AlertCircle,
  Tag,
  Box,
  Upload,
  Percent,
  Layers,
  ArrowRight,
  Eye,
  Settings2,
  Sparkles,
  Save,
  Grid,
  ExternalLink,
  Link
} from 'lucide-react';
import { getApiBase } from '../utils/apiBase';
import { getAuthToken } from '../utils/authStorage';

const API_BASE = getApiBase();

const ProductManagement = ({ onOpenBulk }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    discountPrice: '',
    description: '',
    stockCount: 100,
    sku: '',
    category: 'Genel',
    images: [],
    shopierUrl: '',
    personalizationSettings: {
      accentColor: 'white',
      buttonText: 'Hemen Al'
    }
  });

  const [categories, setCategories] = useState(['Genel', 'Yeni Sezon', 'Öne Çıkanlar']);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [sites, setSites] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchUserSites();
  }, []);

  const fetchUserSites = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/sites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSites(data.sites || []);
      }
    } catch (e) {
      console.error('Sites fetch error:', e);
    }
  };

  const getProductPreviewLink = (product) => {
    if (sites.length === 0) return '#';
    const site = sites[0];
    const domain = site.custom_domain || `${site.subdomain}.odelink.shop`;
    const protocol = window.location.protocol;
    return `${protocol}//${domain}/product/${product.slug || product.id}`;
  };

  const fetchProducts = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/products/my-products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        const uniqueCats = [...new Set(data.map(p => p.category).filter(Boolean))];
        if (uniqueCats.length > 0) {
          setCategories(prev => [...new Set([...prev, ...uniqueCats])]);
        }
      }
    } catch (e) {
      console.error('Products fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const parsePrice = (val) => {
    if (!val) return 0;
    let s = val.toString().trim();
    // Eğer virgül varsa, bu kuruş ayıracıdır. Noktaları (binlik) sil, virgülü noktaya çevir.
    if (s.includes(',')) {
      s = s.replace(/\./g, '').replace(/,/g, '.');
    } else {
      // Sadece nokta varsa ve sonrasında 3 rakam varsa, büyük ihtimalle binlik ayıracıdır (Örn: 1.990)
      const parts = s.split('.');
      if (parts.length > 1 && parts[parts.length - 1].length === 3) {
        s = s.replace(/\./g, '');
      }
    }
    return parseFloat(s) || 0;
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const token = getAuthToken();
      const url = editingProduct ? `${API_BASE}/api/products/${editingProduct.id}` : `${API_BASE}/api/products`;
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: parsePrice(formData.price),
          discountPrice: formData.discountPrice ? parsePrice(formData.discountPrice) : null
        })
      });

      if (res.ok) {
        await fetchProducts();
        closeModal();
        setMessage({ 
          type: 'success', 
          text: editingProduct ? 'Ürün başarıyla güncellendi.' : 'Ürün başarıyla kataloğa eklendi.' 
        });
      } else {
        throw new Error('İşlem başarısız oldu.');
      }
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
        setMessage({ type: 'success', text: 'Ürün silindi.' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Silme başarısız.' });
    }
  };


  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title || '',
      price: product.price || '',
      discountPrice: product.discount_price || '',
      description: product.description || '',
      stockCount: product.stock_count || 0,
      sku: product.sku || '',
      category: product.category || 'Genel',
      images: product.images || [],
      shopierUrl: product.shopier_url || product.url || '',
      personalizationSettings: product.personalization_settings || {
        accentColor: 'white',
        buttonText: 'Hemen Al'
      }
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
    setFormData({
      title: '', price: '', discountPrice: '', description: '', stockCount: 100, sku: '', category: 'Genel', images: [], shopierUrl: '',
      personalizationSettings: { accentColor: 'white', buttonText: 'Hemen Al' }
    });
  };

  const addNewCategory = () => {
    if (newCategoryName && !categories.includes(newCategoryName)) {
      setCategories([...categories, newCategoryName]);
      setFormData({ ...formData, category: newCategoryName });
      setNewCategoryName('');
      setShowNewCatInput(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 sm:space-y-12 pb-20 px-4 lg:px-0">
      {/* ENTERPRISE HEADER: Reimagined for Mobile */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-12 border-b border-white/5 pb-10 sm:pb-20">
        <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 sm:gap-4 bg-white/5 border border-white/10 px-4 py-2 sm:px-6 sm:py-2.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.4em] text-white/60">Envanter Yönetim Sistemi</span>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <h2 className="text-4xl sm:text-8xl font-serif text-[#F2EBE1] tracking-tighter leading-none">Katalog</h2>
            <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-4">
              <div className="h-px w-8 sm:w-12 bg-white/20" />
              <p className="text-[8px] sm:text-[11px] text-white/30 uppercase tracking-[0.5em] font-black">
                Kurumsal Ürün Arşivi
              </p>
            </div>
          </div>
          <p className="text-[9px] sm:text-[13px] text-white/40 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            Mağazanızdaki ürünleri Shopier altyapısı ile senkronize edin. 
            Yüksek çözünürlüklü görseller ve otomatik veri çekme sistemi aktiftir.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative group w-full sm:min-w-[320px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4 group-focus-within:text-white transition-all" />
            <input 
              type="text"
              placeholder="ARŞİVDE ARA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/5 pl-12 pr-4 py-3 sm:pl-14 sm:pr-6 sm:py-4 text-[9px] sm:text-[11px] text-white focus:border-white/40 focus:bg-white/[0.05] focus:outline-none transition-all font-bold tracking-[0.2em] uppercase rounded-sm"
            />
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenBulk}
            className="flex items-center justify-center gap-2 sm:gap-3 bg-transparent border border-white/20 text-white px-5 py-3 sm:px-8 sm:py-4 font-bold uppercase tracking-[0.2em] text-[9px] sm:text-[11px] hover:bg-white hover:text-[#0A0A0A] hover:border-white transition-all rounded-sm group whitespace-nowrap"
          >
            <Link size={14} className="sm:w-4 sm:h-4 group-hover:rotate-45 transition-transform" strokeWidth={2} /> 
            <span>TOPLU LİNK YÜKLE</span>
          </motion.button>
        </div>
      </div>

      {message.text && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-between gap-3 border ${message.type === 'success' ? 'bg-green-500/5 text-green-500 border-green-500/10' : 'bg-red-500/5 text-red-500 border-red-500/10'}`}
        >
          <div className="flex items-center gap-4">
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
          <button onClick={() => setMessage({ type: '', text: '' })}><X size={18} /></button>
        </motion.div>
      )}

      {/* GRID DENEYİMİ */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 sm:py-60 space-y-4 sm:space-y-6">
          <div className="w-10 h-10 sm:w-16 sm:h-16 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.6em] text-white">Sistem Yükleniyor</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-12">
          {filteredProducts.map((product, i) => {
            const validImages = (product.images || []).filter(img => typeof img === 'string' && img.trim() !== '');
            return (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="group relative"
              >
                {/* Image Laboratory */}
                <div className="aspect-[3/4] relative overflow-hidden bg-white/[0.02] border border-white/5 rounded-sm">
                  {validImages[0] ? (
                    <img 
                      src={validImages[0]} 
                      alt={product.title} 
                      className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110 opacity-80 group-hover:opacity-100" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/5 gap-4">
                      <ImageIcon size={60} strokeWidth={1} />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em]">Görsel Yok</span>
                    </div>
                  )}
                  
                  {/* Status & Price Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent translate-y-2 sm:translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                    <div className="flex items-end justify-between gap-3 sm:gap-4">
                      <div className="space-y-1">
                        <span className="text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest">{product.category || 'General'}</span>
                        <div className="flex items-center gap-3 sm:gap-4">
                          <span className="text-xl sm:text-2xl font-serif text-white tracking-tighter">{product.price} TL</span>
                          {product.discount_price && (
                            <span className="text-[9px] sm:text-[11px] text-white/30 line-through font-bold tracking-tighter">{product.discount_price} TL</span>
                          )}
                        </div>
                      </div>
                      <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${product.stock_count > 0 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]'}`} />
                    </div>
                  </div>

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-[#0A0A0A]/95 opacity-0 group-hover:opacity-100 transition-all duration-700 backdrop-blur-md flex flex-col items-center justify-center gap-3 sm:gap-5 px-4 sm:px-0">
                     <button 
                       onClick={() => openEditModal(product)} 
                       className="w-full sm:w-64 py-3 sm:py-5 bg-white text-black text-[9px] sm:text-[11px] font-black uppercase tracking-[0.4em] hover:bg-[#F2EBE1] transition-all transform translate-y-4 sm:translate-y-8 group-hover:translate-y-0 duration-700"
                     >
                       Detayları Düzenle
                     </button>
                     <div className="flex gap-2 sm:gap-4 transform translate-y-4 sm:translate-y-8 group-hover:translate-y-0 duration-700 delay-75 w-full sm:w-64">
                       <a 
                         href={getProductPreviewLink(product)} 
                         target="_blank" 
                         rel="noopener noreferrer" 
                         className="flex-1 py-3 sm:py-5 bg-white/5 border border-white/10 text-white text-[9px] sm:text-[11px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all flex items-center justify-center"
                       >
                         <Eye size={14} className="sm:w-[18px] sm:h-[18px]" />
                       </a>
                       <button 
                         onClick={() => handleDelete(product.id)} 
                         className="flex-1 py-3 sm:py-5 bg-red-600/10 border border-red-500/20 text-red-500 text-[9px] sm:text-[11px] font-black uppercase tracking-[0.4em] hover:bg-red-600 hover:text-white transition-all flex items-center justify-center"
                       >
                         <Trash2 size={14} className="sm:w-[18px] sm:h-[18px]" />
                       </button>
                     </div>
                  </div>
                </div>

                  {/* Title & Info */}
                <div className="mt-4 sm:mt-8 space-y-2 sm:space-y-3 px-1 sm:px-2">
                  <h3 className="text-lg sm:text-2xl font-serif text-[#F2EBE1] group-hover:text-white transition-colors line-clamp-1 tracking-tight">
                    {product.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] sm:text-[10px] font-black text-white/20 uppercase tracking-[0.2em] sm:tracking-[0.3em]">{product.stock_count} Ünite Stok</span>
                    <span className="text-[7px] sm:text-[9px] font-black text-white/10 tracking-widest italic">{product.sku || 'REF-PENDING'}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Urun Ekleme / Duzenleme Modali */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 sm:p-6 lg:p-12">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal} className="fixed inset-0 bg-[#0A0A0A]/98 backdrop-blur-3xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-[#0D0D0D] sm:border border-white/10 w-full h-full sm:h-auto sm:max-w-7xl relative z-10 flex flex-col lg:flex-row sm:max-h-[85vh] overflow-hidden shadow-2xl"
            >
              {/* Sol: HD Görsel Laboratuvarı */}
              <div className="lg:w-[450px] bg-black/50 border-b lg:border-b-0 lg:border-r border-white/5 p-6 sm:p-14 flex flex-col shrink-0 overflow-y-auto no-scrollbar">
                <div className="space-y-2 sm:space-y-4 mb-8 sm:mb-12">
                  <div className="flex items-center gap-2 sm:gap-3 text-white">
                    <ImageIcon size={14} className="sm:w-4 sm:h-4" />
                    <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.4em]">Görsel Yönetimi</span>
                  </div>
                  <p className="text-[9px] sm:text-[11px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">
                    Ürün görsellerini buradan yönetebilirsiniz.
                  </p>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-5">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="aspect-[3/4] bg-white/[0.02] relative group border border-white/10 overflow-hidden rounded-sm">
                        <img src={img} className="w-full h-full object-cover" alt="" />
                        <button onClick={() => removeImage(idx)} className="absolute top-2 right-2 w-8 h-8 sm:w-10 sm:h-10 bg-red-600 text-white flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all shadow-xl rounded-sm"><X size={14} className="sm:w-[18px] sm:h-[18px]" /></button>
                        {idx === 0 && <div className="absolute bottom-0 left-0 right-0 bg-white text-black text-[7px] sm:text-[9px] font-black uppercase py-1.5 sm:py-2 text-center">VİTRİN GÖRSELİ</div>}
                      </div>
                    ))}
                    <button 
                      onClick={() => fileInputRef.current.click()}
                      className="aspect-[3/4] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 sm:gap-4 hover:border-white/40 hover:bg-white/5 transition-all group rounded-sm"
                    >
                      <Plus size={20} className="sm:w-[28px] sm:h-[28px] text-white/10 group-hover:text-white transition-all" strokeWidth={2.5} />
                      <span className="text-[7px] sm:text-[9px] font-black text-white/20 group-hover:text-white uppercase tracking-widest">GÖRSEL YÜKLE</span>
                    </button>
                  </div>
                  <input type="file" multiple hidden ref={fileInputRef} onChange={handleImageUpload} accept="image/*" />
                </div>

                <div className="mt-16 pt-10 border-t border-white/5 space-y-8">
                   <div className="flex items-center gap-4 text-white/30">
                      <Settings2 size={16} />
                      <span className="text-[11px] font-black uppercase tracking-widest">Personalization</span>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] text-white/30 font-black uppercase tracking-widest">Accent</label>
                        <input type="color" value={formData.personalizationSettings.accentColor} onChange={(e) => setFormData({...formData, personalizationSettings: {...formData.personalizationSettings, accentColor: e.target.value }})} className="w-full h-12 bg-transparent border-none cursor-pointer rounded-sm" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] text-white/30 font-black uppercase tracking-widest">Button</label>
                        <input type="text" value={formData.personalizationSettings.buttonText} onChange={(e) => setFormData({...formData, personalizationSettings: {...formData.personalizationSettings, buttonText: e.target.value }})} className="w-full bg-white/[0.03] border border-white/10 px-5 py-4 text-[11px] text-white focus:border-white outline-none transition-all uppercase font-black tracking-widest rounded-sm" />
                      </div>
                   </div>
                </div>
              </div>

              {/* Sağ: Bilgi Matrisi */}
              <div className="flex-1 p-6 sm:p-20 flex flex-col overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between mb-12 sm:mb-20">
                  <div className="space-y-2 sm:space-y-4">
                    <h3 className="text-3xl sm:text-6xl font-serif text-white tracking-tighter">Ürün Detayları</h3>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-6 sm:w-10 h-px bg-white/20" />
                      <span className="text-[8px] sm:text-[11px] uppercase tracking-[0.3em] sm:tracking-[0.5em] text-white/40 font-black">Ürün Düzenleme Paneli</span>
                    </div>
                  </div>
                  <button onClick={closeModal} className="w-10 h-10 sm:w-14 sm:h-14 bg-white/5 text-white/30 hover:text-white flex items-center justify-center transition-all border border-white/10 rounded-sm shrink-0"><X size={20} className="sm:w-[28px] sm:h-[28px]" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12 sm:space-y-16">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 sm:gap-y-12">
                    <div className="md:col-span-2 space-y-3 sm:space-y-5">
                      <label className="text-[9px] sm:text-[11px] uppercase tracking-[0.3em] text-white/50 font-black flex items-center gap-3 sm:gap-4">ÜRÜN BAŞLIĞI <Layers size={12} className="sm:w-[14px] sm:h-[14px]" /></label>
                      <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-transparent border-b border-white/10 py-4 sm:py-6 text-2xl sm:text-4xl text-white focus:border-white focus:outline-none transition-all font-serif italic" placeholder="Ürün adı..." />
                    </div>


                    <div className="space-y-3 sm:space-y-5">
                      <label className="text-[9px] sm:text-[11px] uppercase tracking-[0.3em] text-white/50 font-black flex items-center gap-3 sm:gap-4">LİSTE FİYATI <Tag size={12} className="sm:w-[14px] sm:h-[14px]" /></label>
                      <input required type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 px-5 py-4 sm:px-8 sm:py-6 text-lg sm:text-xl text-white focus:border-white focus:outline-none transition-all font-mono rounded-sm" placeholder="0.00" />
                    </div>

                    <div className="space-y-3 sm:space-y-5">
                      <label className="text-[9px] sm:text-[11px] uppercase tracking-[0.3em] text-white/50 font-black flex items-center gap-3 sm:gap-4">İNDİRİMLİ <Percent size={12} className="sm:w-[14px] sm:h-[14px]" /></label>
                      <input type="number" step="0.01" value={formData.discountPrice} onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 px-5 py-4 sm:px-8 sm:py-6 text-lg sm:text-xl text-white focus:border-white focus:outline-none transition-all font-mono rounded-sm" placeholder="0.00" />
                    </div>

                    <div className="space-y-3 sm:space-y-5">
                      <label className="text-[9px] sm:text-[11px] uppercase tracking-[0.3em] text-white/50 font-black flex items-center gap-3 sm:gap-4">STOK ADEDİ <Box size={12} className="sm:w-[14px] sm:h-[14px]" /></label>
                      <input required type="number" value={formData.stockCount} onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 px-5 py-4 sm:px-8 sm:py-6 text-lg sm:text-xl text-white focus:border-white focus:outline-none transition-all font-mono rounded-sm" />
                    </div>

                    <div className="space-y-3 sm:space-y-5">
                      <label className="text-[9px] sm:text-[11px] uppercase tracking-[0.3em] text-white/50 font-black flex items-center gap-3 sm:gap-4">SKU KODU <Package size={12} className="sm:w-[14px] sm:h-[14px]" /></label>
                      <input type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 px-5 py-4 sm:px-8 sm:py-6 text-[10px] sm:text-[12px] text-white focus:border-white focus:outline-none transition-all font-black uppercase tracking-[0.2em] rounded-sm" placeholder="AUTOGEN-2026" />
                    </div>

                    <div className="md:col-span-2 space-y-3 sm:space-y-5">
                      <label className="text-[9px] sm:text-[11px] uppercase tracking-[0.3em] text-white/50 font-black">KATEGORİ</label>
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                         <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="flex-grow bg-white/[0.03] border border-white/10 px-5 py-4 sm:px-8 sm:py-6 text-[10px] sm:text-[12px] text-white focus:border-white outline-none font-black uppercase tracking-[0.2em] rounded-sm appearance-none">
                           {categories.map(cat => <option key={cat} value={cat} className="bg-black">{cat}</option>)}
                         </select>
                         <button type="button" onClick={() => setShowNewCatInput(!showNewCatInput)} className="px-6 py-4 sm:px-10 sm:py-5 bg-white/5 border border-white/10 text-white font-black text-[9px] sm:text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all rounded-sm">{showNewCatInput ? 'İPTAL' : 'YENİ +'}</button>
                      </div>
                      {showNewCatInput && (
                        <div className="flex gap-3 sm:gap-4 mt-4 sm:mt-6">
                           <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="flex-grow bg-white/5 border border-white/20 px-5 py-3 sm:px-8 sm:py-5 text-[10px] sm:text-[12px] text-white outline-none rounded-sm uppercase tracking-widest" placeholder="YENİ KATEGORİ ADI..." />
                           <button type="button" onClick={addNewCategory} className="px-6 sm:px-10 bg-white text-black text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-sm">EKLE</button>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2 space-y-3 sm:space-y-5">
                      <label className="text-[9px] sm:text-[11px] uppercase tracking-[0.3em] text-white/50 font-black">ÜRÜN AÇIKLAMASI</label>
                      <textarea rows={6} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 px-6 py-5 sm:px-10 sm:py-8 text-[12px] sm:text-[14px] text-white/70 focus:border-white focus:outline-none transition-all resize-none leading-relaxed font-medium rounded-sm" placeholder="Ürün açıklamasını buraya girin..." />
                    </div>
                  </div>

                  <div className="pt-8 sm:pt-16 flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <button type="button" onClick={closeModal} className="flex-1 bg-white/5 border border-white/10 text-white/40 py-4 sm:py-6 font-black uppercase tracking-[0.4em] text-[9px] sm:text-[11px] hover:bg-white/10 hover:text-white transition-all rounded-sm">İPTAL</button>
                    <button type="submit" disabled={submitting} className="flex-[2] bg-white text-black py-4 sm:py-6 font-black uppercase tracking-[0.4em] text-[10px] sm:text-[12px] hover:bg-[#F2EBE1] transition-all flex items-center justify-center gap-3 sm:gap-5 rounded-sm shadow-2xl">
                      {submitting ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : <Save size={18} className="sm:w-[22px] sm:h-[22px]" strokeWidth={2.5} />}
                      {editingProduct ? 'GÜNCELLEMEYİ KAYDET' : 'SİSTEME İŞLE'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductManagement;
