import React from 'react';

const LegalPageLayout = ({ title, children }) => {
  return (
    <div className="min-h-screen gradient-bg text-white">
      <div className="container mx-auto px-4 pt-28 pb-16 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-6">{title}</h1>
        <div className="prose prose-invert max-w-none text-white/85 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

export default LegalPageLayout;
