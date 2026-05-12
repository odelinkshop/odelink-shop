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
  Save
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/products/my-products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        
        // Extract unique categories from products
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
        body: JSON.stringify(formData)
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
    if (!window.confirm('Bu ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
        setMessage({ type: 'success', text: 'Ürün başarıyla silindi.' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Silme işlemi başarısız.' });
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
    <div className="space-y-10 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-[#C5A059]">
            <Sparkles size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Kurumsal Katalog Yönetimi</span>
          </div>
          <h2 className="text-5xl font-serif text-[#F2EBE1] tracking-tight">Enterprise Studio</h2>
          <p className="text-[11px] text-[#F2EBE1]/40 max-w-md leading-relaxed font-medium uppercase tracking-wider">
            Sınırsız ürün envanterinizi aristokratik bir disiplinle yönetin, dükkanınızı global standartlara taşıyın.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4 group-focus-within:text-[#C5A059] transition-all" />
            <input 
              type="text"
              placeholder="Ürün veya SKU Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/[0.03] border border-white/10 pl-12 pr-6 py-4 text-xs focus:border-[#C5A059]/50 focus:outline-none transition-all min-w-[300px] font-bold uppercase tracking-widest rounded-none"
            />
          </div>
          
          <input 
            type="file" 
            id="bulkImport" 
            hidden 
            accept=".json"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              
              setLoading(true);
              setMessage({ type: 'success', text: 'Toplu yükleme başlatıldı...' });
              
              const reader = new FileReader();
              reader.onload = async (event) => {
                try {
                  const data = JSON.parse(event.target.result);
                  if (!Array.isArray(data)) throw new Error('Geçersiz dosya formatı.');
                  
                  const token = getAuthToken();
                  let count = 0;
                  
                  for (const item of data) {
                    await fetch(`${API_BASE}/api/products`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        title: item.title,
                        price: item.price,
                        description: item.description,
                        stockCount: item.stockCount || 100,
                        sku: item.sku,
                        category: item.category || 'Genel',
                        images: item.images || []
                      })
                    });
                    count++;
                  }
                  
                  await fetchProducts();
                  setMessage({ type: 'success', text: `${count} ürün başarıyla içe aktarıldı.` });
                } catch (err) {
                  setMessage({ type: 'error', text: 'İçe aktarma hatası: ' + err.message });
                } finally {
                  setLoading(false);
                }
              };
              reader.readAsText(file);
            }}
          />

          <button 
            onClick={() => document.getElementById('bulkImport').click()}
            className="flex items-center gap-3 bg-white/5 border border-white/10 text-white/60 px-8 py-4 font-black uppercase tracking-widest text-[11px] hover:bg-white/10 transition-all group"
          >
            <Upload size={18} className="group-hover:-translate-y-1 transition-transform" /> 
            <span>TOPLU İÇE AKTAR</span>
          </button>

          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-3 bg-[#C5A059] text-[#0A0A0A] px-10 py-4 font-black uppercase tracking-widest text-[11px] hover:bg-[#F2EBE1] transition-all shadow-2xl shadow-[#C5A059]/20 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" /> 
            <span>YENİ ÜRÜN OLUŞTUR</span>
          </button>
        </div>
      </div>

      {message.text && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-5 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-between gap-3 border backdrop-blur-xl ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 flex items-center justify-center rounded-full ${message.type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            </div>
            {message.text}
          </div>
          <button onClick={() => setMessage({ type: '', text: '' })} className="hover:rotate-90 transition-transform"><X size={16} /></button>
        </motion.div>
      )}

      {/* Corporate Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <Loader2 className="w-12 h-12 text-[#C5A059] animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#C5A059]">Katalog Yükleniyor</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-40 text-center border border-dashed border-[#C5A059]/10 bg-white/[0.01] group hover:bg-[#C5A059]/05 transition-all duration-700">
          <Package className="w-20 h-20 text-[#C5A059]/10 mx-auto mb-8 group-hover:scale-110 transition-transform duration-700" />
          <h3 className="text-xl font-serif text-[#F2EBE1]/60 mb-2">Henüz Bir Ürün Tanımlanmadı</h3>
          <p className="text-[10px] text-[#F2EBE1]/30 uppercase tracking-[0.4em] font-bold">Koleksiyonunuzu oluşturmaya başlamak için yukarıdaki butonu kullanın.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {filteredProducts.map((product, i) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/[0.02] border border-white/5 group hover:border-[#C5A059]/40 transition-all duration-500 relative flex flex-col"
            >
              {/* Product Visual */}
              <div className="aspect-[4/5] bg-[#0A0A0A] relative overflow-hidden flex items-center justify-center">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-80 group-hover:opacity-100" />
                ) : (
                  <div className="flex flex-col items-center gap-4 text-white/5">
                    <ImageIcon size={48} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Görsel Yok</span>
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <div className="bg-[#C5A059] text-[#0A0A0A] px-4 py-2 text-[10px] font-black tracking-widest shadow-2xl">
                    {product.price} TL
                  </div>
                  {product.discount_price && (
                    <div className="bg-red-600 text-white px-3 py-1.5 text-[9px] font-black tracking-widest shadow-2xl">
                       %{Math.round((1 - product.discount_price / product.price) * 100)} İNDİRİM
                    </div>
                  )}
                </div>

                <div className="absolute top-6 right-6">
                   <div className="bg-white/10 backdrop-blur-md text-white/60 px-3 py-1.5 text-[8px] font-black tracking-widest uppercase border border-white/10">
                      {product.category || 'GENEL'}
                   </div>
                </div>

                {/* Quick Actions Hover Overlay */}
                <div className="absolute inset-0 bg-[#0A0A0A]/80 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm">
                   <button 
                     onClick={() => openEditModal(product)}
                     className="w-12 h-12 bg-white text-[#0A0A0A] flex items-center justify-center hover:bg-[#C5A059] transition-all duration-300"
                   >
                     <Edit3 size={18} />
                   </button>
                   <button 
                     onClick={() => handleDelete(product.id)}
                     className="w-12 h-12 bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-300"
                   >
                     <Trash2 size={18} />
                   </button>
                   <a 
                     href="#" 
                     target="_blank"
                     className="w-12 h-12 bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all duration-300"
                   >
                     <Eye size={18} />
                   </a>
                </div>
              </div>

              {/* Product Content */}
              <div className="p-8 flex-grow flex flex-col">
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-serif text-[#F2EBE1] group-hover:text-[#C5A059] transition-colors line-clamp-1">{product.title}</h3>
                    <p className="text-[9px] font-black text-[#C5A059]/60 uppercase tracking-widest">SKU: {product.sku || 'N/A'}</p>
                  </div>
                </div>
                
                <p className="text-[11px] text-[#F2EBE1]/30 mb-8 line-clamp-2 font-medium uppercase tracking-wider leading-relaxed">
                  {product.description || 'Bu kurumsal ürün için henüz bir açıklama girilmemiş.'}
                </p>

                <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
                   <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Box size={12} className="text-[#C5A059]" />
                        <span className="text-[8px] font-black text-[#C5A059] uppercase tracking-tighter">ENVANTER DURUMU</span>
                      </div>
                      <span className={`text-xs font-bold ${product.stock_count > 10 ? 'text-[#F2EBE1]' : 'text-red-500'}`}>
                        {product.stock_count} Ürün Mevcut
                      </span>
                   </div>
                   
                   <div className="flex -space-x-2">
                      {product.images?.slice(0, 3).map((img, idx) => (
                        <div key={idx} className="w-8 h-8 rounded-full border-2 border-[#0A0A0A] overflow-hidden bg-[#111]">
                           <img src={img} className="w-full h-full object-cover" alt="" />
                        </div>
                      ))}
                      {product.images?.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-[#0A0A0A] bg-[#C5A059] flex items-center justify-center text-[8px] font-black text-[#0A0A0A]">
                          +{product.images.length - 3}
                        </div>
                      )}
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Product Modal - The Real Studio */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 md:px-10 overflow-y-auto py-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-[#0A0A0A]/98 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-[#111] border border-white/10 w-full max-w-6xl relative z-10 flex flex-col lg:flex-row max-h-[90vh] overflow-hidden"
            >
              {/* Left Side: Visual Studio */}
              <div className="lg:w-2/5 bg-[#0D0D0D] border-r border-white/10 p-10 flex flex-col">
                <div className="mb-8">
                  <h4 className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.4em] mb-2">Görsel Laboratuvarı</h4>
                  <p className="text-[11px] text-[#F2EBE1]/40 font-medium leading-relaxed uppercase tracking-widest">
                    Ürününüzü en iyi açılardan gösterin. İlk fotoğraf vitrin görseli olacaktır.
                  </p>
                </div>

                {/* Image Dropzone/Grid */}
                <div className="flex-grow space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="grid grid-cols-2 gap-4">
                    {formData.images.map((img, idx) => (
                      <motion.div 
                        layoutId={`img-${idx}`}
                        key={idx} 
                        className="aspect-square bg-white/5 relative group border border-white/10"
                      >
                        <img src={img} className="w-full h-full object-cover" alt="" />
                        <button 
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X size={14} />
                        </button>
                        {idx === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-[#C5A059] text-[#0A0A0A] text-[7px] font-black uppercase py-1 text-center tracking-tighter">
                            ANA GÖRSEL
                          </div>
                        )}
                      </motion.div>
                    ))}
                    
                    <button 
                      onClick={() => fileInputRef.current.click()}
                      className="aspect-square border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 hover:border-[#C5A059]/40 hover:bg-[#C5A059]/05 transition-all group"
                    >
                      <Upload size={24} className="text-white/20 group-hover:text-[#C5A059] transition-colors" />
                      <span className="text-[8px] font-black text-white/20 group-hover:text-[#C5A059] uppercase tracking-widest">Görsel Yükle</span>
                    </button>
                  </div>
                  
                  <input 
                    type="file" 
                    multiple 
                    hidden 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                  />
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                   <div className="flex items-center gap-3">
                      <Settings2 size={16} className="text-[#C5A059]" />
                      <span className="text-[10px] font-black text-[#F2EBE1] uppercase tracking-widest">Sayfa Kişiselleştirme</span>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[8px] text-white/20 font-black uppercase">Vurgu Rengi</label>
                        <input 
                          type="color" 
                          value={formData.personalizationSettings.accentColor}
                          onChange={(e) => setFormData({
                            ...formData, 
                            personalizationSettings: { ...formData.personalizationSettings, accentColor: e.target.value }
                          })}
                          className="w-full h-10 bg-transparent border-none cursor-pointer"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] text-white/20 font-black uppercase">Buton Metni</label>
                        <input 
                          type="text" 
                          value={formData.personalizationSettings.buttonText}
                          onChange={(e) => setFormData({
                            ...formData, 
                            personalizationSettings: { ...formData.personalizationSettings, buttonText: e.target.value }
                          })}
                          className="w-full bg-white/5 border border-white/10 px-3 py-2 text-[10px] text-white focus:border-[#C5A059] outline-none transition-all uppercase font-bold"
                        />
                      </div>
                   </div>
                </div>
              </div>

              {/* Right Side: Information Studio */}
              <div className="lg:w-3/5 p-10 flex flex-col overflow-y-auto">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-3xl font-serif text-[#F2EBE1]">{editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Tanımla'}</h3>
                    <p className="text-[9px] uppercase tracking-[0.4em] text-[#C5A059] font-black mt-2">Envanter Bilgi Matrisi</p>
                  </div>
                  <button onClick={closeModal} className="w-10 h-10 bg-white/5 text-white/20 hover:text-white flex items-center justify-center transition-all">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 flex-grow">
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-[#C5A059] font-black mb-3">
                           <Layers size={12} /> Ürün Başlığı
                        </label>
                        <input 
                          required
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full bg-white/[0.03] border border-white/10 px-5 py-4 text-sm text-white focus:border-[#C5A059]/50 focus:outline-none transition-all font-medium"
                          placeholder="Örn: Masterpiece Sınırlı Üretim Porselen Takımı"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-[#C5A059] font-black mb-3">
                           <Tag size={12} /> Satış Fiyatı (TL)
                        </label>
                        <input 
                          required
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full bg-white/[0.03] border border-white/10 px-5 py-4 text-sm text-white focus:border-[#C5A059]/50 focus:outline-none transition-all font-mono"
                          placeholder="2450.00"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-[#C5A059] font-black mb-3">
                           <Percent size={12} /> İndirimli Fiyat (Opsiyonel)
                        </label>
                        <input 
                          type="number"
                          step="0.01"
                          value={formData.discountPrice}
                          onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                          className="w-full bg-white/[0.03] border border-white/10 px-5 py-4 text-sm text-white focus:border-[#C5A059]/50 focus:outline-none transition-all font-mono"
                          placeholder="1999.90"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-[#C5A059] font-black mb-3">
                           <Box size={12} /> Stok Adedi
                        </label>
                        <input 
                          required
                          type="number"
                          value={formData.stockCount}
                          onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
                          className="w-full bg-white/[0.03] border border-white/10 px-5 py-4 text-sm text-white focus:border-[#C5A059]/50 focus:outline-none transition-all font-mono"
                          placeholder="50"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-[#C5A059] font-black mb-3">
                           <Package size={12} /> Stok Kodu (SKU)
                        </label>
                        <input 
                          type="text"
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          className="w-full bg-white/[0.03] border border-white/10 px-5 py-4 text-sm text-white focus:border-[#C5A059]/50 focus:outline-none transition-all font-mono uppercase"
                          placeholder="SKU-2026-X"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-[#C5A059] font-black mb-3">
                           <ArrowRight size={12} /> Kategori Seçimi
                        </label>
                        <div className="flex gap-4">
                           <select 
                             value={formData.category}
                             onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                             className="flex-grow bg-white/[0.03] border border-white/10 px-5 py-4 text-sm text-white focus:border-[#C5A059]/50 focus:outline-none transition-all"
                           >
                             {categories.map(cat => (
                               <option key={cat} value={cat} className="bg-[#0A0A0A]">{cat}</option>
                             ))}
                           </select>
                           <button 
                             type="button"
                             onClick={() => setShowNewCatInput(!showNewCatInput)}
                             className="px-6 bg-white/5 border border-white/10 hover:border-[#C5A059]/50 transition-all text-[#C5A059] font-black text-[10px] uppercase"
                           >
                             {showNewCatInput ? 'VAZGEÇ' : 'YENİ +'}
                           </button>
                        </div>
                        
                        {showNewCatInput && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-4 flex gap-2"
                          >
                             <input 
                               type="text"
                               placeholder="Yeni Kategori Adı..."
                               value={newCategoryName}
                               onChange={(e) => setNewCategoryName(e.target.value)}
                               className="flex-grow bg-white/[0.03] border border-[#C5A059]/20 px-4 py-2 text-xs text-white outline-none"
                             />
                             <button 
                               type="button"
                               onClick={addNewCategory}
                               className="px-4 bg-[#C5A059] text-[#0A0A0A] text-[8px] font-black uppercase"
                             >
                               EKLE
                             </button>
                          </motion.div>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-[#C5A059] font-black mb-3">
                           <Settings2 size={12} /> Ürün Açıklaması (Kurumsal Dil)
                        </label>
                        <textarea 
                          rows={6}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full bg-white/[0.03] border border-white/10 px-5 py-4 text-sm text-white focus:border-[#C5A059]/50 focus:outline-none transition-all resize-none leading-relaxed"
                          placeholder="Ürününüzün hikayesini ve özelliklerini buraya aktarın..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="sticky bottom-0 pt-10 pb-2 bg-[#111] border-t border-white/5 flex gap-4">
                    <button 
                      type="button"
                      onClick={closeModal}
                      className="flex-1 bg-white/5 border border-white/10 text-white py-5 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white/10 transition-all"
                    >
                      İPTAL ET
                    </button>
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="flex-[2] bg-[#C5A059] text-[#0A0A0A] py-5 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-[#F2EBE1] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-[#C5A059]/20"
                    >
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingProduct ? <Save size={18} /> : <Plus size={18} />)}
                      {editingProduct ? 'DEĞİŞİKLİKLERİ KAYDET' : 'ÜRÜNÜ SİSTEME İŞLE'}
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
