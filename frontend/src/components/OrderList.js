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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-serif text-[#F2EBE1]">Sipariş Yönetimi</h2>
          <p className="text-[10px] uppercase tracking-widest text-white font-bold opacity-60">Satış Takibi & Gelir Analizi</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4 group-focus-within:text-white transition-colors" />
          <input 
            type="text"
            placeholder="Sipariş ID veya E-posta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/[0.03] border border-white/10 pl-12 pr-6 py-3.5 text-xs focus:border-white/50 focus:outline-none transition-all min-w-[300px] font-bold uppercase tracking-widest"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-32 text-center border border-dashed border-white/20 bg-white/[0.01]">
          <ShoppingBag className="w-16 h-16 text-white/20 mx-auto mb-6" />
          <p className="text-xs text-[#F2EBE1]/40 uppercase tracking-[0.4em] font-bold">Henüz bir sipariş bulunmuyor.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[9px] uppercase tracking-[0.2em] text-white font-black">
                <th className="py-6 px-4">Sipariş / Tarih</th>
                <th className="py-6 px-4">Müşteri</th>
                <th className="py-6 px-4">Tutar</th>
                <th className="py-6 px-4">Durum</th>
                <th className="py-6 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((order, i) => (
                <motion.tr 
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-6 px-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-[#F2EBE1] font-mono">{order.id}</span>
                      <div className="flex items-center gap-2 text-[8px] text-[#F2EBE1]/40 font-black tracking-widest">
                        <Calendar size={10} /> {new Date(order.created_at).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[10px] text-[#F2EBE1]/80 font-bold uppercase tracking-wider">
                        <UserIcon size={10} /> {order.buyer_email?.split('@')[0]}
                      </div>
                      <span className="text-[9px] text-[#F2EBE1]/30 font-bold">{order.buyer_email}</span>
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-serif text-white font-bold">{order.amount} TL</span>
                      <div className="flex items-center gap-2 text-[8px] text-[#F2EBE1]/30 font-black uppercase">
                        <CreditCard size={10} /> SHOPIER
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="py-6 px-4 text-right">
                    <button className="text-[9px] font-black uppercase tracking-widest text-[#F2EBE1]/20 hover:text-white transition-colors">
                      Detaylar
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderList;
