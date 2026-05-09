import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Loader } from 'lucide-react';
import { getAuthToken } from '../utils/authStorage';
import { getApiBase } from '../utils/apiBase';

const API_BASE = getApiBase();

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState(null);
  const [pollCount, setPollCount] = useState(0);

  const transactionId = searchParams.get('transactionId') || localStorage.getItem('odelink_transaction_id');

  useEffect(() => {
    if (!transactionId) {
      setError('Ödeme işlemi bulunamadı');
      setStatus('error');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      navigate('/auth');
      return;
    }

    // Poll payment status with exponential backoff
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/payments/status/${transactionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Ödeme durumu sorgulanamadı');
        }

        setPaymentDetails(data);
        setStatus(data.status);

        // If still pending, schedule next poll with exponential backoff
        if (data.status === 'pending' && pollCount < 4) {
          const delays = [1000, 2000, 4000, 8000]; // 1s, 2s, 4s, 8s
          const delay = delays[pollCount] || 8000;
          
          setTimeout(() => {
            setPollCount(prev => prev + 1);
          }, delay);
        }

      } catch (err) {
        console.error('Payment status check error:', err);
        setError(err.message);
        setStatus('error');
      }
    };

    checkPaymentStatus();
  }, [transactionId, pollCount, navigate]);

  const handleContinue = () => {
    // Clear stored transaction ID
    try {
      localStorage.removeItem('odelink_transaction_id');
      localStorage.removeItem('odelink_intended_plan');
      localStorage.removeItem('odelink_intended_cycle');
    } catch (e) {
      console.warn('localStorage error:', e);
    }

    // Redirect based on status
    if (status === 'completed') {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
      case 'pending':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              {status === 'loading' ? (
                <Loader className="w-10 h-10 text-yellow-600 animate-spin" />
              ) : (
                <Clock className="w-10 h-10 text-yellow-600" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {status === 'loading' ? 'Ödeme durumu kontrol ediliyor...' : 'Ödeme işleniyor...'}
            </h1>
            <p className="text-gray-600 mb-6">
              {status === 'loading' 
                ? 'Lütfen bekleyin, ödeme durumunuz kontrol ediliyor.'
                : 'Ödemeniz işleniyor. Bu işlem birkaç dakika sürebilir.'}
            </p>
            {paymentDetails && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 mb-2">İşlem Tutarı</div>
                <div className="text-2xl font-bold text-gray-900">
                  ₺{parseFloat(paymentDetails.amount).toFixed(2)}
                </div>
              </div>
            )}
            <p className="text-sm text-gray-500">
              Sayfa otomatik olarak yenilenecektir...
            </p>
          </div>
        );

      case 'completed':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Ödeme Başarılı!
            </h1>
            <p className="text-gray-600 mb-6">
              Ödemeniz başarıyla tamamlandı. Aboneliğiniz aktif edildi.
            </p>
            {paymentDetails && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">İşlem Tutarı</div>
                    <div className="text-lg font-bold text-gray-900">
                      ₺{parseFloat(paymentDetails.amount).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Ödeme Tarihi</div>
                    <div className="text-lg font-bold text-gray-900">
                      {paymentDetails.paymentDate 
                        ? new Date(paymentDetails.paymentDate).toLocaleDateString('tr-TR')
                        : '-'}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={handleContinue}
              className="btn-primary px-8 py-3"
            >
              Dashboard'a Git
            </button>
          </div>
        );

      case 'failed':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Ödeme Başarısız
            </h1>
            <p className="text-gray-600 mb-6">
              Ödemeniz işlenemedi. Lütfen tekrar deneyin veya farklı bir ödeme yöntemi kullanın.
            </p>
            {paymentDetails && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 mb-2">İşlem Tutarı</div>
                <div className="text-2xl font-bold text-gray-900">
                  ₺{parseFloat(paymentDetails.amount).toFixed(2)}
                </div>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/pricing')}
                className="btn-primary px-8 py-3"
              >
                Tekrar Dene
              </button>
              <button
                onClick={handleContinue}
                className="btn-secondary px-8 py-3"
              >
                Ana Sayfa
              </button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Bir Hata Oluştu
            </h1>
            <p className="text-gray-600 mb-6">
              {error || 'Ödeme durumu kontrol edilirken bir hata oluştu.'}
            </p>
            <button
              onClick={handleContinue}
              className="btn-primary px-8 py-3"
            >
              Ana Sayfa
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen gradient-bg pt-20 sm:pt-32 pb-16 px-4">
      <div className="container mx-auto" style={{ maxWidth: 600 }}>
        <div className="card" style={{ borderRadius: 16 }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;
