import React, { useEffect } from 'react';
import Header from './Header';
import PremiumPricing from './PremiumPricing';
import Footer from './Footer';

export default function PlansPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <div className="flex-1">
        <PremiumPricing />
      </div>
      <Footer />
    </div>
  );
}
