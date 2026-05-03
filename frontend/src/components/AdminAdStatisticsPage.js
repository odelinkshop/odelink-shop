import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, MousePointer, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';

export default function AdminAdStatisticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
    const interval = setInterval(fetchStatistics, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/admin/advertisements/statistics');
      if (!response.ok) throw new Error('İstatistikler yüklenemedi');
      const data = await response.json();
      setStats(data.statistics);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reklam İstatistikleri</h1>
          <p className="text-gray-600">Tüm reklamların performans verilerini görüntüleyin</p>
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

        {stats && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Toplam Gösterim</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.aggregate.total_impressions.toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <Eye className="w-12 h-12 text-blue-500 opacity-20" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Toplam Tıklama</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.aggregate.total_clicks.toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <MousePointer className="w-12 h-12 text-green-500 opacity-20" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Ortalama CTR</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.aggregate.average_ctr}%
                    </p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-purple-500 opacity-20" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Toplam Gelir</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      ₺{stats.totalRevenue.toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <DollarSign className="w-12 h-12 text-yellow-500 opacity-20" />
                </div>
              </motion.div>
            </div>

            {/* By Pricing Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Paket Türüne Göre İstatistikler</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Paket</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reklam Sayısı</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Gösterim</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tıklama</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">CTR</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Gelir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {stats.byPricingTier.map((tier) => (
                      <tr key={tier.pricing_tier} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {tier.pricing_tier === 'baslangic' && 'Başlangıç'}
                          {tier.pricing_tier === 'profesyonel' && 'Profesyonel'}
                          {tier.pricing_tier === 'premium' && 'Premium'}
                        </td>
                        <td className="px-6 py-4 text-gray-900">{tier.total_ads}</td>
                        <td className="px-6 py-4 text-gray-900">{tier.total_impressions.toLocaleString('tr-TR')}</td>
                        <td className="px-6 py-4 text-gray-900">{tier.total_clicks.toLocaleString('tr-TR')}</td>
                        <td className="px-6 py-4 text-gray-900">{tier.average_ctr}%</td>
                        <td className="px-6 py-4 font-semibold text-green-600">₺{tier.revenue.toLocaleString('tr-TR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* By Placement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Yerleşim Konumuna Göre İstatistikler</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Konum</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reklam Sayısı</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Gösterim</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tıklama</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">CTR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {stats.byPlacement.map((placement) => (
                      <tr key={placement.placement_position} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {placement.placement_position === 'header-banner' && 'Başlık Banner'}
                          {placement.placement_position === 'hero-section' && 'Hero Bölümü'}
                          {placement.placement_position === 'sidebar-top' && 'Kenar Çubuğu Üst'}
                          {placement.placement_position === 'sidebar-bottom' && 'Kenar Çubuğu Alt'}
                          {placement.placement_position === 'footer-banner' && 'Altbilgi Banner'}
                        </td>
                        <td className="px-6 py-4 text-gray-900">{placement.total_ads}</td>
                        <td className="px-6 py-4 text-gray-900">{placement.total_impressions.toLocaleString('tr-TR')}</td>
                        <td className="px-6 py-4 text-gray-900">{placement.total_clicks.toLocaleString('tr-TR')}</td>
                        <td className="px-6 py-4 text-gray-900">{placement.average_ctr}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Top Performing Ads */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">En İyi Performans Gösteren Reklamlar</h2>
              <div className="space-y-3">
                {stats.topPerforming.map((ad, idx) => (
                  <div key={ad.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{ad.brand_name}</p>
                        <p className="text-sm text-gray-600">
                          {ad.pricing_tier === 'baslangic' && 'Başlangıç'} •
                          {ad.placement_position === 'header-banner' && ' Başlık Banner'}
                          {ad.placement_position === 'hero-section' && ' Hero Bölümü'}
                          {ad.placement_position === 'sidebar-top' && ' Kenar Çubuğu Üst'}
                          {ad.placement_position === 'sidebar-bottom' && ' Kenar Çubuğu Alt'}
                          {ad.placement_position === 'footer-banner' && ' Altbilgi Banner'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">{ad.ctr}%</p>
                      <p className="text-xs text-gray-600">{ad.impressions} gösterim, {ad.clicks} tıklama</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
