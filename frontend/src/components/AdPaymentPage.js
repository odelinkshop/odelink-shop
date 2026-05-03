import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, CreditCard, Banknote } from 'lucide-react';

export default function AdPaymentPage() {
  const { id } = useParams();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('shopier');
  const [processing, setProcessing] = useState(false);

  const pricingTierPrices = {
    baslangic: 500,
    profesyonel: 1200,
    premium: 2500
  };

  useEffect(() => {
    fetchAd();
  }, [id]);

  const fetchAd = async () => {
    try {
      const response = await fetch(`/api/advertisements/${id}`);
      if (!response.ok) throw new Error('Reklam bulunamadı');
      const data = await response.json();
      setAd(data.advertisement);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShopierPayment = async () => {
    setProcessing(true);
    try {
      // In a real implementation, this would redirect to Shopier payment gateway
      // For now, we'll show a placeholder
      alert('Shopier ödeme sayfasına yönlendiriliyorsunuz...');
      // window.location.href = `https://shopier.com/pay/${paymentReference}`;
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
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

  if (error || !ad) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Hata</h2>
                <p className="text-gray-600 mt-1">{error || 'Reklam bulunamadı'}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const amount = pricingTierPrices[ad.pricing_tier] || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 sm:px-8 py-8">
            <h1 className="text-3xl font-bold text-white mb-2">Ödeme</h1>
            <p className="text-blue-100">Reklamınızı yayınlamak için ödeme yapın</p>
          </div>

          {/* Content */}
          <div className="px-6 sm:px-8 py-8">
            {/* Order Summary */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Özeti</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Marka Adı:</span>
                  <span className="font-medium text-gray-900">{ad.brand_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paket:</span>
                  <span className="font-medium text-gray-900">
                    {ad.pricing_tier === 'baslangic' && 'Başlangıç'}
                    {ad.pricing_tier === 'profesyonel' && 'Profesyonel'}
                    {ad.pricing_tier === 'premium' && 'Premium'}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-gray-900 font-semibold">Toplam Tutar:</span>
                  <span className="text-2xl font-bold text-blue-600">₺{amount.toLocaleString('tr-TR')}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ödeme Yöntemi</h2>
              <div className="space-y-3">
                {/* Shopier Payment */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setPaymentMethod('shopier')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                    paymentMethod === 'shopier'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Shopier Ödeme Kapısı</h3>
                      <p className="text-sm text-gray-600">Kredi kartı, banka transferi ve diğer yöntemler</p>
                    </div>
                    {paymentMethod === 'shopier' && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </motion.div>

                {/* Bank Transfer */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                    paymentMethod === 'bank'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Banknote className="w-6 h-6 text-green-600" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Banka Transferi</h3>
                      <p className="text-sm text-gray-600">Doğrudan banka hesabına transfer yapın</p>
                    </div>
                    {paymentMethod === 'bank' && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Bank Transfer Details */}
            {paymentMethod === 'bank' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg"
              >
                <h3 className="font-semibold text-green-900 mb-4">Banka Hesap Bilgileri</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-green-700 font-medium">Banka Adı:</p>
                    <p className="text-green-900">Örnek Banka A.Ş.</p>
                  </div>
                  <div>
                    <p className="text-green-700 font-medium">IBAN:</p>
                    <p className="text-green-900 font-mono">TR12 3456 7890 1234 5678 9012 34</p>
                  </div>
                  <div>
                    <p className="text-green-700 font-medium">Hesap Sahibi:</p>
                    <p className="text-green-900">Odelink Yazılım Ltd. Şti.</p>
                  </div>
                  <div>
                    <p className="text-green-700 font-medium">Referans Numarası:</p>
                    <p className="text-green-900 font-mono">{ad.payment_reference}</p>
                  </div>
                  <p className="text-xs text-green-700 mt-4">
                    Lütfen transfer yaparken referans numarasını açıklama kısmına yazınız.
                  </p>
                </div>
              </motion.div>
            )}

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

            {/* Action Buttons */}
            <div className="flex gap-3">
              <a
                href="/dashboard/ads"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-center font-medium text-gray-700"
              >
                İptal
              </a>
              {paymentMethod === 'shopier' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShopierPayment}
                  disabled={processing}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {processing ? 'İşleniyor...' : 'Shopier ile Öde'}
                </motion.button>
              )}
              {paymentMethod === 'bank' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    alert('Banka transferi talimatlarını yukarıda bulabilirsiniz. Transfer yaptıktan sonra admin tarafından onaylanacaktır.');
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition font-medium"
                >
                  Transfer Yaptım
                </motion.button>
              )}
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Ödeme yaparak Odelink Hizmet Şartlarını kabul etmiş olursunuz.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
