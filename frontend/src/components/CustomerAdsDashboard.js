import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, MousePointer, TrendingUp, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function CustomerAdsDashboard() {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAd, setSelectedAd] = useState(null);
  const [adStats, setAdStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    fetchAdvertisements();
  }, [page]);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/advertisements/my?page=${page}`);
      if (!response.ok) throw new Error('Reklamlar yüklenemedi');
      const data = await response.json();
      setAdvertisements(data.advertisements);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdStats = async (adId) => {
    try {
      setStatsLoading(true);
      const response = await fetch(`/api/advertisements/${adId}/statistics`);
      if (!response.ok) throw new Error('İstatistikler yüklenemedi');
      const data = await response.json();
      setAdStats(data.statistics);
    } catch (err) {
      console.error('Stats error:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSelectAd = (ad) => {
    setSelectedAd(ad);
    fetchAdStats(ad.id);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Beklemede' },
      approved: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle, label: 'Onaylandı' },
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Aktif' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Reddedildi' },
      expired: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle, label: 'Süresi Doldu' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${config.bg} ${config.text} text-sm font-medium`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </div>
    );
  };

  const calculateRemainingDays = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const calculateCTR = (impressions, clicks) => {
    if (impressions === 0) return 0;
    return ((clicks / impressions) * 100).toFixed(2);
  };

  if (loading && advertisements.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reklam Yönetimi</h1>
          <p className="text-gray-600">Reklamlarınızın performansını izleyin ve yönetin</p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Hata</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {advertisements.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-12 text-center"
          >
            <div className="text-gray-400 mb-4">
              <TrendingUp className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Henüz reklam yok</h2>
            <p className="text-gray-600 mb-6">Mağazanızı tanıtmak için ilk reklamınızı oluşturun</p>
            <a
              href="/advertise"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Reklam Oluştur
            </a>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ads List */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {advertisements.map((ad, idx) => (
                  <motion.div
                    key={ad.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => handleSelectAd(ad)}
                    className={`bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer p-6 border-l-4 ${
                      selectedAd?.id === ad.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        {ad.logo_url && (
                          <img
                            src={ad.logo_url}
                            alt={ad.brand_name}
                            className="w-12 h-12 object-contain rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{ad.brand_name}</h3>
                          <p className="text-sm text-gray-600 truncate">{ad.shopier_url}</p>
                        </div>
                      </div>
                      {getStatusBadge(ad.status)}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Eye className="w-4 h-4" />
                          <span className="text-xs font-medium">Gösterim</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{ad.impressions || 0}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <MousePointer className="w-4 h-4" />
                          <span className="text-xs font-medium">Tıklama</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{ad.clicks || 0}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-xs font-medium">CTR</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{calculateCTR(ad.impressions, ad.clicks)}%</p>
                      </div>
                    </div>

                    {ad.status === 'pending' && (
                      <p className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                        Reklam onay beklemektedir
                      </p>
                    )}

                    {ad.status === 'rejected' && (
                      <p className="text-sm text-red-700 bg-red-50 p-2 rounded">
                        Reklam reddedildi: {ad.rejection_reason || 'Sebep belirtilmedi'}
                      </p>
                    )}

                    {ad.status === 'active' && ad.end_date && (
                      <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                        Kalan gün: {calculateRemainingDays(ad.end_date)} gün
                      </p>
                    )}
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Önceki
                  </button>
                  <span className="px-4 py-2 text-gray-600">
                    Sayfa {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Sonraki
                  </button>
                </div>
              )}
            </div>

            {/* Stats Panel */}
            {selectedAd && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-lg p-6 h-fit sticky top-4"
              >
                <h2 className="text-lg font-bold text-gray-900 mb-4">Detaylı İstatistikler</h2>

                {statsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : adStats ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Toplam Gösterim</p>
                      <p className="text-3xl font-bold text-blue-600">{adStats.total.impressions}</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Toplam Tıklama</p>
                      <p className="text-3xl font-bold text-green-600">{adStats.total.clicks}</p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Tıklama Oranı (CTR)</p>
                      <p className="text-3xl font-bold text-purple-600">{adStats.ctr}%</p>
                    </div>

                    {adStats.total.brand_link_clicks > 0 && (
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <p className="text-gray-600">Marka Linki Tıklamaları: {adStats.total.brand_link_clicks}</p>
                      </div>
                    )}

                    {adStats.total.cta_button_clicks > 0 && (
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <p className="text-gray-600">CTA Butonu Tıklamaları: {adStats.total.cta_button_clicks}</p>
                      </div>
                    )}

                    {adStats.total.instagram_link_clicks > 0 && (
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <p className="text-gray-600">Instagram Linki Tıklamaları: {adStats.total.instagram_link_clicks}</p>
                      </div>
                    )}

                    {adStats.hourly && adStats.hourly.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Son 24 Saat</p>
                        <div className="space-y-1 text-xs text-gray-600">
                          {adStats.hourly.slice(0, 5).map((hour, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>{new Date(hour.hour_timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                              <span>{hour.impressions} gösterim, {hour.clicks} tıklama</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
