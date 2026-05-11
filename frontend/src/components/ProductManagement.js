import React, { useState, useEffect } from 'react';
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
  Box
} from 'lucide-react';
import { getApiBase } from '../utils/apiBase';
import { getAuthToken } from '../utils/authStorage';

const API_BASE = getApiBase();

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    stockCount: 100,
    images: []
  });

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
      }
    } catch (e) {
      console.error('Products fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        await fetchProducts();
        setShowAddModal(false);
        setFormData({ title: '', price: '', description: '', stockCount: 100, images: [] });
        setMessage({ type: 'success', text: 'Ürün başarıyla eklendi.' });
      } else {
        throw new Error('Ürün eklenemedi.');
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
      setMessage({ type: 'error', text: 'Silme işlemi başarısız.' });
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-serif text-[#F2EBE1]">Ürünlerim</h2>
          <p className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold opacity-60">Katalog Yönetimi & Envanter Kontrolü</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4 group-focus-within:text-[#C5A059] transition-colors" />
            <input 
              type="text"
              placeholder="Ürün Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/[0.03] border border-white/10 pl-12 pr-6 py-3.5 text-xs focus:border-[#C5A059]/50 focus:outline-none transition-all min-w-[250px] font-bold uppercase tracking-widest"
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#C5A059] text-[#0A0A0A] px-6 py-4 font-black uppercase tracking-widest text-[11px] hover:bg-[#F2EBE1] transition-all shadow-xl shadow-[#C5A059]/10"
          >
            <Plus size={16} /> YENİ ÜRÜN
          </button>
        </div>
      </div>

      {message.text && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`p-4 mb-8 text-[10px] font-black uppercase tracking-widest flex items-center justify-between gap-3 border ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
        >
          <div className="flex items-center gap-3">
            {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {message.text}
          </div>
          <button onClick={() => setMessage({ type: '', text: '' })}><X size={14} /></button>
        </motion.div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-32 text-center border border-dashed border-[#C5A059]/20 bg-white/[0.01]">
          <Package className="w-16 h-16 text-[#C5A059]/20 mx-auto mb-6" />
          <p className="text-xs text-[#F2EBE1]/40 uppercase tracking-[0.4em] font-bold">Henüz bir ürün bulunmuyor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, i) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/[0.02] border border-white/5 group hover:border-[#C5A059]/30 transition-all relative overflow-hidden"
            >
              <div className="aspect-video bg-white/[0.02] relative overflow-hidden flex items-center justify-center border-b border-white/5">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <ImageIcon size={32} className="text-white/10" />
                )}
                <div className="absolute top-4 right-4 bg-[#C5A059] text-[#0A0A0A] px-3 py-1.5 text-[10px] font-black tracking-widest">
                  {product.price} TL
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-serif text-[#F2EBE1] mb-2 truncate">{product.title}</h3>
                <p className="text-[10px] text-[#F2EBE1]/40 mb-6 line-clamp-2 uppercase font-bold tracking-wider leading-relaxed">
                  {product.description || 'Açıklama belirtilmemiş.'}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-[#C5A059] font-black uppercase tracking-tighter">STOK</span>
                      <span className="text-xs font-bold text-[#F2EBE1]">{product.stock_count} Adet</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-3 bg-white/5 text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button 
                      className="p-3 bg-white/5 text-white/20 hover:text-[#C5A059] hover:bg-[#C5A059]/10 transition-all border border-transparent hover:border-[#C5A059]/20"
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-[#0A0A0A]/95 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white/[0.03] border border-white/10 w-full max-w-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-serif text-[#F2EBE1]">Yeni Ürün Ekle</h3>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-[#C5A059] font-black mt-1">Aristokratik Katalog Genişletme</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-white/20 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase tracking-widest text-[#C5A059] font-black mb-2">Ürün Başlığı</label>
                    <input 
                      required
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 px-4 py-4 text-sm focus:border-[#C5A059]/50 focus:outline-none transition-all"
                      placeholder="Örn: El Yapımı Deri Saat Kordonu"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#C5A059] font-black mb-2">Fiyat (TL)</label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                      <input 
                        required
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 pl-12 pr-4 py-4 text-sm focus:border-[#C5A059]/50 focus:outline-none transition-all"
                        placeholder="150.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#C5A059] font-black mb-2">Stok Adedi</label>
                    <div className="relative">
                      <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                      <input 
                        required
                        type="number"
                        value={formData.stockCount}
                        onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 pl-12 pr-4 py-4 text-sm focus:border-[#C5A059]/50 focus:outline-none transition-all"
                        placeholder="100"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase tracking-widest text-[#C5A059] font-black mb-2">Açıklama</label>
                    <textarea 
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 px-4 py-4 text-sm focus:border-[#C5A059]/50 focus:outline-none transition-all resize-none"
                      placeholder="Ürün detaylarını buraya girin..."
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#C5A059] text-[#0A0A0A] py-5 font-black uppercase tracking-widest text-xs hover:bg-[#F2EBE1] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#C5A059]/10"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus size={18} />}
                  ÜRÜNÜ KATALOĞA EKLE
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductManagement;
