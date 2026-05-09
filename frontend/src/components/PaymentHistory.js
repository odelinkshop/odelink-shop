import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAuthToken } from '../utils/authStorage';
import { getApiBase } from '../utils/apiBase';

const API_BASE = getApiBase();

const PaymentHistory = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/auth');
      return;
    }

    const fetchPaymentHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE}/api/payments/history?page=${page}&limit=${limit}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Ödeme geçmişi alınamadı');
        }

        setPayments(data.payments || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error('Payment history fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [page, navigate]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Tamamlandı
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Beklemede
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Başarısız
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getProductTypeName = (productType) => {
    switch (productType) {
      case 'subscription':
        return 'Abonelik';
      case 'ad_package':
        return 'Reklam Paketi';
      default:
        return productType;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && payments.length === 0) {
    return (
      <div className="min-h-screen gradient-bg pt-20 sm:pt-32 pb-16 px-4">
        <div className="container mx-auto" style={{ maxWidth: 1200 }}>
          <div className="card" style={{ borderRadius: 16 }}>
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pt-20 sm:pt-32 pb-16 px-4">
      <div className="container mx-auto" style={{ maxWidth: 1200 }}>
        <div className="card" style={{ borderRadius: 16 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <CreditCard className="w-8 h-8 text-primary-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Ödeme Geçmişi</h1>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Dashboard'a Dön
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {payments.length === 0 && !loading ? (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Henüz ödeme kaydı yok
              </h3>
              <p className="text-gray-600 mb-6">
                İlk ödemenizi yaptığınızda burada görünecektir.
              </p>
              <button
                onClick={() => navigate('/pricing')}
                className="btn-primary"
              >
                Planları Görüntüle
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Tarih</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Ürün</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Tutar</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Durum</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Ödeme Yöntemi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.transaction_id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm text-gray-900">
                          {formatDate(payment.payment_date || payment.created_at)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm font-medium text-gray-900">
                            {getProductTypeName(payment.product_type)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {payment.product_id}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                          ₺{parseFloat(payment.amount).toFixed(2)}
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {payment.payment_method || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Sayfa {page} / {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(prev => Math.max(1, prev - 1))}
                      disabled={page === 1}
                      className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Önceki
                    </button>
                    <button
                      onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={page === totalPages}
                      className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sonraki
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
