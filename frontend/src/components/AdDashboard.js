import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

const AdDashboard = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAdvertisements = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Giriş yapmanız gerekiyor');
        return;
      }

      const response = await fetch('/api/advertisements/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdvertisements(data.advertisements || []);
        setError(null);
      } else if (response.status === 401) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        localStorage.removeItem('token');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Reklamlar yüklenemedi');
      }
    } catch (err) {
      console.error('Error fetching advertisements:', err);
      setError('Bağlantı hatası oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAdvertisements();
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          text: 'Onay Bekliyor',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/20',
          borderColor: 'border-yellow-400/30'
        };
      case 'approved':
        return {
          icon: CheckCircle,
          text: 'Onaylandı',
          color: 'text-green-400',
          bgColor: 'bg-green-400/20',
          borderColor: 'border-green-400/30'
        };
      case 'active':
        return {
          icon: TrendingUp,
          text: 'Aktif',
          color: 'text-blue-400',
          bgColor: 'bg-blue-400/20',
          borderColor: 'border-blue-400/30'
        };
      case 'rejected':
        return {
          icon: XCircle,
          text: 'Reddedildi',
          color: 'text-red-400',
          bgColor: 'bg-red-400/20',
          borderColor: 'border-red-400/30'
        };
      case 'expired':
        return {
          icon: AlertCircle,
          text: 'Süresi Doldu',
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/20',
          borderColor: 'border-gray-400/30'
        };
      default:
        return {
          icon: AlertCircle,
          text: status,
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/20',
          borderColor: 'border-gray-400/30'
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRemainingDays = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getPricingTierInfo = (tier) => {
    const tiers = {
      'baslangic': { name: 'Başlangıç', price: '₺500' },
      'profesyonel': { name: 'Profesyonel', price: '₺1.200' },
      'premium': { name: 'Premium', price: '₺2.500' }
    };
    return tiers[tier] || { name: tier, price: '-' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-8 w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-800 rounded-2xl p-6 h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 pt-20 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
              Reklam Dashboard'u
            </h1>
            <p className="text-white/70">
              Reklam istatistiklerinizi ve durumlarınızı takip edin
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Yenile</span>
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        {advertisements.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white/60" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Henüz reklam yok</h3>
            <p className="text-white/70 mb-6">İlk reklamınızı oluşturmak için başlayın</p>
            <a
              href="/advertise"
              className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold transition-all"
            >
              Reklam Ver
              <ExternalLink className="w-4 h-4" />
            </a>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {advertisements.map((ad, index) => {
              const statusInfo = getStatusInfo(ad.status);
              const tierInfo = getPricingTierInfo(ad.pricingTier);
              const remainingDays = getRemainingDays(ad.endDate);
              const StatusIcon = statusInfo.icon;

              return (
                <motion.div
                  key={ad._id}
                  className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate mb-1">
                        {ad.brandName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/60">{tierInfo.name}</span>
                        <span className="text-sm font-semibold text-white/80">{tierInfo.price}</span>
                      </div>
                    </div>
                    
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.borderColor} border`}>
                      <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                      <span className={`text-sm font-semibold ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">
                    {ad.description}
                  </p>

                  {/* Statistics */}
                  {ad.statistics && (
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Eye className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="text-lg font-bold text-white">
                          {ad.statistics.impressions || 0}
                        </div>
                        <div className="text-xs text-white/60">Görüntülenme</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <MousePointer className="w-4 h-4 text-green-400" />
                        </div>
                        <div className="text-lg font-bold text-white">
                          {ad.statistics.clicks || 0}
                        </div>
                        <div className="text-xs text-white/60">Tıklama</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="text-lg font-bold text-white">
                          {ad.statistics.ctr || 0}%
                        </div>
                        <div className="text-xs text-white/60">CTR</div>
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Oluşturulma:</span>
                      <span className="text-white/80">{formatDate(ad.createdAt)}</span>
                    </div>
                    
                    {ad.startDate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Başlangıç:</span>
                        <span className="text-white/80">{formatDate(ad.startDate)}</span>
                      </div>
                    )}
                    
                    {ad.endDate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Bitiş:</span>
                        <span className="text-white/80">{formatDate(ad.endDate)}</span>
                      </div>
                    )}
                    
                    {remainingDays !== null && ad.status === 'active' && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Kalan Gün:</span>
                        <span className={`font-semibold ${remainingDays <= 7 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {remainingDays} gün
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {ad.shopierUrl && (
                      <a
                        href={ad.shopierUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Mağazayı Gör
                      </a>
                    )}
                    
                    {ad.status === 'rejected' && ad.rejectionReason && (
                      <div className="flex-1">
                        <div className="text-xs text-red-400 font-semibold mb-1">Red Sebebi:</div>
                        <div className="text-xs text-white/70 bg-red-500/20 p-2 rounded border border-red-500/30">
                          {ad.rejectionReason}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        {advertisements.length > 0 && (
          <motion.div
            className="mt-12 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-xl font-bold text-white mb-4">Genel İstatistikler</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-black text-white mb-1">
                  {advertisements.length}
                </div>
                <div className="text-sm text-white/60">Toplam Reklam</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-black text-white mb-1">
                  {advertisements.filter(ad => ad.status === 'active').length}
                </div>
                <div className="text-sm text-white/60">Aktif Reklam</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-black text-white mb-1">
                  {advertisements.reduce((sum, ad) => sum + (ad.statistics?.impressions || 0), 0)}
                </div>
                <div className="text-sm text-white/60">Toplam Görüntülenme</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-black text-white mb-1">
                  {advertisements.reduce((sum, ad) => sum + (ad.statistics?.clicks || 0), 0)}
                </div>
                <div className="text-sm text-white/60">Toplam Tıklama</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdDashboard;