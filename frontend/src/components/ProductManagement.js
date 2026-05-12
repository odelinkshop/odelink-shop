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
  Grid
} from 'lucide-react';
import { getApiBase } from '../utils/apiBase';
import { getAuthToken } from '../utils/authStorage';

const API_BASE = getApiBase();

const ProductManagement = () => {
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
    personalizationSettings: {
      accentColor: '#C5A059',
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
      personalizationSettings: product.personalization_settings || {
        accentColor: '#C5A059',
        buttonText: 'Hemen Al'
      }
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
    setFormData({
      title: '', price: '', discountPrice: '', description: '', stockCount: 100, sku: '', category: 'Genel', images: [],
      personalizationSettings: { accentColor: '#C5A059', buttonText: 'Hemen Al' }
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
    <div className="space-y-12 pb-20 px-4 lg:px-0">
      {/* ENTERPRISE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 border-b border-white/5 pb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 bg-[#C5A059]/10 border border-[#C5A059]/20 px-4 py-1.5">
            <Sparkles size={12} className="text-[#C5A059]" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#C5A059]">Elite Inventory Control</span>
          </div>
          <h2 className="text-6xl font-serif text-[#F2EBE1] tracking-tight">Katalog</h2>
          <p className="text-[12px] text-[#F2EBE1]/30 max-w-lg leading-relaxed font-bold uppercase tracking-widest">
            Ürünlerinizi en yüksek çözünürlükte ve kurumsal disiplinle yönetin.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative group min-w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 w-4 h-4 group-focus-within:text-[#C5A059] transition-all" />
            <input 
              type="text"
              placeholder="KOLEKSİYONDA ARA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/5 pl-12 pr-6 py-5 text-[10px] text-white focus:border-[#C5A059]/40 focus:outline-none transition-all font-black tracking-[0.2em] uppercase"
            />
          </div>
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-4 bg-[#C5A059] text-[#0A0A0A] px-10 py-5 font-black uppercase tracking-widest text-[11px] hover:bg-[#F2EBE1] transition-all shadow-2xl shadow-[#C5A059]/20"
          >
            <Plus size={18} /> 
            <span>YENİ ÜRÜN TANIMLA</span>
          </button>
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
        <div className="flex flex-col items-center justify-center py-60 space-y-6">
          <div className="w-16 h-16 border-2 border-[#C5A059]/20 border-t-[#C5A059] rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-[#C5A059]">Sistem Yükleniyor</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
          {filteredProducts.map((product, i) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="group bg-[#0D0D0D] border border-white/5 hover:border-[#C5A059]/30 transition-all duration-700 overflow-hidden"
            >
              <div className="aspect-[3/4] relative overflow-hidden bg-black">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-90 group-hover:opacity-100" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/5 gap-4">
                    <ImageIcon size={48} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Görsel Yok</span>
                  </div>
                )}
                
                {/* Status Badges */}
                <div className="absolute top-5 left-5 flex flex-col gap-2">
                  <div className="bg-black/80 backdrop-blur-md border border-white/10 text-white px-4 py-2 text-[10px] font-black tracking-widest">
                    {product.price} TL
                  </div>
                  {product.discount_price && (
                    <div className="bg-[#C5A059] text-black px-4 py-2 text-[10px] font-black tracking-widest">
                       %{-Math.round((1 - product.discount_price / product.price) * 100)} İNDİRİM
                    </div>
                  )}
                </div>

                <div className="absolute inset-0 bg-black/80 flex items-center justify-center gap-5 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm">
                   <button onClick={() => openEditModal(product)} className="w-14 h-14 bg-white text-black flex items-center justify-center hover:bg-[#C5A059] transition-all"><Edit3 size={20} /></button>
                   <button onClick={() => handleDelete(product.id)} className="w-14 h-14 bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"><Trash2 size={20} /></button>
                   <a href={getProductPreviewLink(product)} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all"><Eye size={20} /></a>
                </div>
              </div>

              <div className="p-8 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-xl font-serif text-white group-hover:text-[#C5A059] transition-colors line-clamp-1">{product.title}</h3>
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest whitespace-nowrap">{product.category || 'GENEL'}</span>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${product.stock_count > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{product.stock_count} ADET STOK</span>
                  </div>
                  <span className="text-[9px] font-black text-[#C5A059] tracking-tighter">SKU: {product.sku || 'N/A'}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ARISTOKRATIK ÜRÜN MODALI (CAM GİBİ ŞEFFAF & HD) */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 py-10 md:py-20">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal} className="fixed inset-0 bg-[#0A0A0A]/95 backdrop-blur-2xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-[#0D0D0D] border border-white/10 w-full max-w-7xl relative z-10 flex flex-col lg:flex-row max-h-[85vh] overflow-hidden shadow-[0_0_100px_-20px_rgba(197,160,89,0.15)]"
            >
              {/* Sol: HD Görsel Laboratuvarı */}
              <div className="lg:w-[400px] bg-black border-r border-white/5 p-12 flex flex-col">
                <div className="space-y-4 mb-12">
                  <div className="flex items-center gap-2 text-[#C5A059]">
                    <ImageIcon size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Visual Studio</span>
                  </div>
                  <p className="text-[11px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">
                    HD Ürün Vitrinini Tasarlayın
                  </p>
                </div>

                <div className="flex-grow space-y-6 overflow-y-auto no-scrollbar">
                  <div className="grid grid-cols-2 gap-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="aspect-[3/4] bg-white/[0.02] relative group border border-white/10 overflow-hidden">
                        <img src={img} className="w-full h-full object-cover" alt="" />
                        <button onClick={() => removeImage(idx)} className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><X size={16} /></button>
                        {idx === 0 && <div className="absolute bottom-0 left-0 right-0 bg-[#C5A059] text-black text-[8px] font-black uppercase py-1.5 text-center">VİTRİN GÖRSELİ</div>}
                      </div>
                    ))}
                    <button 
                      onClick={() => fileInputRef.current.click()}
                      className="aspect-[3/4] border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4 hover:border-[#C5A059]/40 hover:bg-[#C5A059]/05 transition-all group"
                    >
                      <Plus size={24} className="text-white/10 group-hover:text-[#C5A059] transition-all" />
                      <span className="text-[8px] font-black text-white/10 group-hover:text-[#C5A059] uppercase tracking-widest">HD YÜKLE</span>
                    </button>
                  </div>
                  <input type="file" multiple hidden ref={fileInputRef} onChange={handleImageUpload} accept="image/*" />
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 space-y-6">
                   <div className="flex items-center gap-3 text-white/20">
                      <Settings2 size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Personalization</span>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[9px] text-white/20 font-black uppercase">Accent</label>
                        <input type="color" value={formData.personalizationSettings.accentColor} onChange={(e) => setFormData({...formData, personalizationSettings: {...formData.personalizationSettings, accentColor: e.target.value }})} className="w-full h-10 bg-transparent border-none cursor-pointer" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] text-white/20 font-black uppercase">Button</label>
                        <input type="text" value={formData.personalizationSettings.buttonText} onChange={(e) => setFormData({...formData, personalizationSettings: {...formData.personalizationSettings, buttonText: e.target.value }})} className="w-full bg-white/5 border border-white/10 px-4 py-3 text-[10px] text-white focus:border-[#C5A059] outline-none transition-all uppercase font-black" />
                      </div>
                   </div>
                </div>
              </div>

              {/* Sağ: Bilgi Matrisi */}
              <div className="flex-1 p-12 lg:p-20 flex flex-col overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between mb-16">
                  <div>
                    <h3 className="text-5xl font-serif text-white tracking-tighter">{editingProduct ? 'Düzenleme' : 'Tanımlama'}</h3>
                    <div className="flex items-center gap-3 mt-4">
                      <div className="w-8 h-px bg-[#C5A059]" />
                      <span className="text-[10px] uppercase tracking-[0.5em] text-[#C5A059] font-black">Matrix Studio 2026</span>
                    </div>
                  </div>
                  <button onClick={closeModal} className="w-14 h-14 bg-white/5 text-white/20 hover:text-white flex items-center justify-center transition-all border border-white/5 hover:border-white/10"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    <div className="md:col-span-2 space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-black flex items-center gap-3">ÜRÜN BAŞLIĞI <Layers size={12} /></label>
                      <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-transparent border-b border-white/10 py-5 text-2xl text-white focus:border-[#C5A059] focus:outline-none transition-all font-serif italic" placeholder="The Masterpiece..." />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-black flex items-center gap-3">LİSTE FİYATI <Tag size={12} /></label>
                      <input required type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 px-6 py-5 text-lg text-white focus:border-[#C5A059]/40 focus:outline-none transition-all font-mono" placeholder="0.00" />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-black flex items-center gap-3">İNDİRİMLİ <Percent size={12} /></label>
                      <input type="number" step="0.01" value={formData.discountPrice} onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 px-6 py-5 text-lg text-white focus:border-[#C5A059]/40 focus:outline-none transition-all font-mono" placeholder="0.00" />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-black flex items-center gap-3">STOK ADEDİ <Box size={12} /></label>
                      <input required type="number" value={formData.stockCount} onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 px-6 py-5 text-lg text-white focus:border-[#C5A059]/40 focus:outline-none transition-all font-mono" />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-black flex items-center gap-3">SKU KODU <Package size={12} /></label>
                      <input type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 px-6 py-5 text-[11px] text-white focus:border-[#C5A059]/40 focus:outline-none transition-all font-black uppercase tracking-widest" placeholder="AUTOGEN-2026" />
                    </div>

                    <div className="md:col-span-2 space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-black">KATEGORİ</label>
                      <div className="flex gap-4">
                         <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="flex-grow bg-white/[0.03] border border-white/5 px-6 py-5 text-[11px] text-white focus:border-[#C5A059]/40 outline-none font-black uppercase tracking-widest">
                           {categories.map(cat => <option key={cat} value={cat} className="bg-black">{cat}</option>)}
                         </select>
                         <button type="button" onClick={() => setShowNewCatInput(!showNewCatInput)} className="px-8 bg-white/5 border border-white/5 text-[#C5A059] font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">{showNewCatInput ? 'İPTAL' : 'YENİ +'}</button>
                      </div>
                      {showNewCatInput && (
                        <div className="flex gap-2 mt-4">
                           <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="flex-grow bg-white/5 border border-[#C5A059]/30 px-6 py-4 text-xs text-white outline-none" placeholder="YENİ KATEGORİ ADI..." />
                           <button type="button" onClick={addNewCategory} className="px-8 bg-[#C5A059] text-black text-[9px] font-black uppercase">EKLE</button>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2 space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-black">ÜRÜN AÇIKLAMASI (KURUMSAL)</label>
                      <textarea rows={6} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 px-8 py-6 text-sm text-white/60 focus:border-[#C5A059]/40 focus:outline-none transition-all resize-none leading-relaxed font-medium" placeholder="Ürünün hikayesini buraya nakşedin..." />
                    </div>
                  </div>

                  <div className="pt-12 flex gap-6">
                    <button type="button" onClick={closeModal} className="flex-1 bg-white/5 border border-white/5 text-white/40 py-6 font-black uppercase tracking-[0.4em] text-[10px] hover:bg-white/10 hover:text-white transition-all">İPTAL</button>
                    <button type="submit" disabled={submitting} className="flex-[2] bg-[#C5A059] text-black py-6 font-black uppercase tracking-[0.4em] text-[11px] hover:bg-[#F2EBE1] transition-all flex items-center justify-center gap-4">
                      {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus size={20} />}
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
