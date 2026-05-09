import React from 'react';

const ShoppingPage = () => {
  return (
    <div className="min-h-screen gradient-bg pt-20 sm:pt-32 pb-16 px-4">
      <div className="container mx-auto" style={{ maxWidth: 900 }}>
        <div className="card" style={{ borderRadius: 16 }}>
          <h1 className="text-3xl font-bold text-gray-900">Alışveriş</h1>
          <p className="text-gray-700 mt-4 leading-relaxed">
            Sipariş/alışveriş akışları bu sayfadan yönetilecek.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShoppingPage;
