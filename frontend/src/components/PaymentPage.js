import React from 'react';

const SHOPIER_STORE_URL = 'https://www.shopier.com/odelinkshop';

const PaymentPage = () => {
  return (
    <div className="min-h-screen gradient-bg pt-20 sm:pt-32 pb-16 px-4">
      <div className="container mx-auto" style={{ maxWidth: 900 }}>
        <div className="card" style={{ borderRadius: 16 }}>
          <h1 className="text-3xl font-bold text-gray-900">Plan Satın Al</h1>
          <p className="text-gray-700 mt-4 leading-relaxed">
            3 günlük deneme süreniz sona erdi. Devam etmek için plan satın almanız gerekiyor.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button type="button" className="btn-primary" onClick={() => { window.location.href = SHOPIER_STORE_URL; }}>
              Planları Gör
            </button>
            <button type="button" className="btn-secondary" onClick={() => { window.location.href = '/'; }}>
              Ana Sayfa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
