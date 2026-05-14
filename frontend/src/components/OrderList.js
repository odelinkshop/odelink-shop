import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Search,
  Calendar,
  CreditCard,
  User as UserIcon
} from 'lucide-react';
import { getApiBase } from '../utils/apiBase';
import { getAuthToken } from '../utils/authStorage';

const API_BASE = getApiBase();

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/users/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error('Orders fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="flex items-center gap-1.5 text-green-500 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest"><CheckCircle2 size={10} /> TAMAMLANDI</span>;
      case 'pending':
        return <span className="flex items-center gap-1.5 text-white bg-white/10 border border-white/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest"><Clock size={10} /> BEKLEYEN ÖDEME</span>;
      case 'failed':
        return <span className="flex items-center gap-1.5 text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest"><AlertCircle size={10} /> HATALI / İPTAL</span>;
      default:
        return status;
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.buyer_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 border-b border-white/5 pb-16">
        <div className="space-y-4 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2 rounded-full">
            <ShoppingBag size={14} className="text-white" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Revenue & Operations</span>
          </div>
          <h2 className="text-5xl sm:text-7xl font-serif text-[#F2EBE1] tracking-tight">Siparişler</h2>
          <p className="text-[10px] sm:text-[12px] text-[#F2EBE1]/40 max-w-lg mx-auto lg:mx-0 leading-relaxed font-bold uppercase tracking-[0.2em] sm:tracking-widest">
            Satışlarınızı ve operasyonel verilerinizi gerçek zamanlı takip edin.
          </p>
        </div>
        
        <div className="relative group w-full lg:w-auto">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4 group-focus-within:text-white transition-all" />
          <input 
            type="text"
            placeholder="SİPARİŞ ID VEYA E-POSTA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 pl-14 pr-6 py-5 text-[11px] focus:border-white focus:outline-none transition-all lg:min-w-[400px] font-black uppercase tracking-[0.25em] text-white rounded-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-60 space-y-6">
          <div className="w-16 h-16 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white">Veri Alınıyor</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-40 text-center border border-dashed border-white/5 bg-white/[0.01] rounded-sm group">
          <div className="w-20 h-20 border border-white/5 bg-white/[0.02] flex items-center justify-center mx-auto mb-8 transition-all group-hover:border-white/20">
            <ShoppingBag className="w-10 h-10 text-white/10 group-hover:text-white/30 transition-all" />
          </div>
          <p className="text-[11px] text-white/30 uppercase tracking-[0.4em] font-black">Henüz bir sipariş bulunmuyor.</p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE: Visible only on LG screens */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.3em] text-white/40 font-black">
                  <th className="py-10 px-8">Sipariş Detayı</th>
                  <th className="py-10 px-8">Müşteri Matrisi</th>
                  <th className="py-10 px-8">Finansal Veri</th>
                  <th className="py-10 px-8">Operasyonel Durum</th>
                  <th className="py-10 px-8 text-right">Aksiyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order, i) => (
                  <motion.tr 
                    key={order.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-10 px-8">
                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-[#F2EBE1] font-mono tracking-tighter uppercase">{order.id}</span>
                        <div className="flex items-center gap-3 text-[9px] text-[#F2EBE1]/30 font-black tracking-widest uppercase">
                          <Calendar size={12} className="text-white/10" /> {new Date(order.created_at).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </td>
                    <td className="py-10 px-8">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 text-[11px] text-white font-bold uppercase tracking-widest">
                          <UserIcon size={12} className="text-white/20" /> {order.buyer_email?.split('@')[0]}
                        </div>
                        <span className="text-[10px] text-white/20 font-bold lowercase tracking-normal">{order.buyer_email}</span>
                      </div>
                    </td>
                    <td className="py-10 px-8">
                      <div className="flex flex-col gap-2">
                        <span className="text-lg font-serif text-white font-bold">{order.amount} TL</span>
                        <div className="flex items-center gap-3 text-[9px] text-white/20 font-black uppercase tracking-widest">
                          <CreditCard size={12} /> SHOPIER Altyapısı
                        </div>
                      </div>
                    </td>
                    <td className="py-10 px-8">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-10 px-8 text-right">
                      <button className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white transition-all border border-white/5 hover:border-white/20 px-6 py-3 rounded-sm">
                        İncele
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS: Visible on smaller screens */}
          <div className="lg:hidden grid grid-cols-1 gap-8">
            {filteredOrders.map((order, i) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#0D0D0D] border border-white/5 p-8 space-y-8 rounded-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] block">Sipariş ID</span>
                    <span className="text-sm font-bold text-white font-mono tracking-tighter uppercase">{order.id}</span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/5">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] block">Müşteri</span>
                    <span className="text-[11px] text-white font-bold uppercase tracking-widest truncate block">{order.buyer_email?.split('@')[0]}</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] block">Tutar</span>
                    <span className="text-lg font-serif text-white font-bold block">{order.amount} TL</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] text-white/30 font-black tracking-widest uppercase">
                    <Calendar size={14} className="text-white/10" /> {new Date(order.created_at).toLocaleDateString('tr-TR')}
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-[0.2em] text-white bg-white/5 border border-white/10 px-6 py-3 rounded-sm">
                    DETAY
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default OrderList;
