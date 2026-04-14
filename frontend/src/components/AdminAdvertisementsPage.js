import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, XCircle, Eye, MousePointer, TrendingUp } from 'lucide-react';

export default function AdminAdvertisementsPage() {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAd, setSelectedAd] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [approvalData, setApprovalData] = useState({
    startDate: '',
    endDate: '',
    placementPosition: 'header-banner'
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const placements = [
    { id: 'header-banner', name: 'Başlık Banner' },
    { id: 'hero-section', name: 'Hero Bölümü' },
    { id: 'sidebar-top', name: 'Kenar Çubuğu Üst' },
    { id: 'sidebar-bottom', name: 'Kenar Çubuğu Alt' },
    { id: 'footer-banner', name: 'Altbilgi Banner' }
  ];

  useEffect(() => {
    fetchAdvertisements();
  }, [page, statusFilter]);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      let url = `/api/admin/advertisements?page=${page}`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }

      const response = await fetch(url);
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

  const handleApprove = async () => {
    if (!selectedAd || !approvalData.startDate || !approvalData.endDate) {
      setError('Lütfen tüm alanları doldurunuz');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/advertisements/${selectedAd.id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: new Date(approvalData.startDate).toISOString(),
          endDate: new Date(approvalData.endDate).toISOString(),
          placementPosition: approvalData.placementPosition
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Onaylama başarısız');
      }

      setShowApprovalModal(false);
      setSelectedAd(null);
      setApprovalData({ startDate: '', endDate: '', placementPosition: 'header-banner' });
      fetchAdvertisements();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedAd) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/advertisements/${selectedAd.id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rejectionReason: rejectionReason || null
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Reddetme başarısız');
      }

      setShowRejectionModal(false);
      setSelectedAd(null);
      setRejectionReason('');
      fetchAdvertisements();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (adId) => {
    if (!window.confirm('Bu reklamı silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/advertisements/${adId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Silme başarısız');
      fetchAdvertisements();
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Beklemede' },
      approved: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Onaylandı' },
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Aktif' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Reddedildi' },
      expired: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Süresi Doldu' }
    };

    const c = config[status] || config.pending;
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  if (loading && advertisements.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reklam Yönetimi</h1>
          <p className="text-gray-600">Tüm reklamları yönetin ve onaylayın</p>
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

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tüm Durumlar</option>
            <option value="pending">Beklemede</option>
            <option value="approved">Onaylandı</option>
            <option value="active">Aktif</option>
            <option value="rejected">Reddedildi</option>
            <option value="expired">Süresi Doldu</option>
          </select>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Marka</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Müşteri</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Durum</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Paket</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">İstatistikler</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {advertisements.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {ad.logo_url && (
                          <img src={ad.logo_url} alt={ad.brand_name} className="w-8 h-8 object-contain rounded" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{ad.brand_name}</p>
                          <p className="text-xs text-gray-500 truncate">{ad.shopier_url}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{ad.display_name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{ad.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(ad.status)}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {ad.pricing_tier === 'baslangic' && 'Başlangıç'}
                        {ad.pricing_tier === 'profesyonel' && 'Profesyonel'}
                        {ad.pricing_tier === 'premium' && 'Premium'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-gray-500" />
                          {ad.impressions || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MousePointer className="w-4 h-4 text-gray-500" />
                          {ad.clicks || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {ad.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedAd(ad);
                                setShowApprovalModal(true);
                              }}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition"
                            >
                              Onayla
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAd(ad);
                                setShowRejectionModal(true);
                              }}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition"
                            >
                              Reddet
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(ad.id)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {advertisements.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">Reklam bulunamadı</p>
            </div>
          )}
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

      {/* Approval Modal */}
      {showApprovalModal && selectedAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reklamı Onayla</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
                <input
                  type="date"
                  value={approvalData.startDate}
                  onChange={(e) => setApprovalData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
                <input
                  type="date"
                  value={approvalData.endDate}
                  onChange={(e) => setApprovalData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yerleşim Konumu</label>
                <select
                  value={approvalData.placementPosition}
                  onChange={(e) => setApprovalData(prev => ({ ...prev, placementPosition: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {placements.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                İptal
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {actionLoading ? 'İşleniyor...' : 'Onayla'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reklamı Reddet</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reddetme Sebebi (İsteğe Bağlı)</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reddetme sebebini yazınız..."
                maxLength="500"
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{rejectionReason.length}/500</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                İptal
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {actionLoading ? 'İşleniyor...' : 'Reddet'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
