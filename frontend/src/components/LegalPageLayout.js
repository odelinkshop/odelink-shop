import React from 'react';
import { FileText, Calendar, Shield } from 'lucide-react';

const LegalPageLayout = ({ title, children, lastUpdated = '15.04.2026' }) => {
  return (
    <div className="min-h-screen gradient-bg text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-950 to-black border-b border-white/10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 pt-32 pb-16 max-w-5xl relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
              <FileText className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Shield className="w-4 h-4" />
              <span>Yasal Belgeler</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            {title}
          </h1>
          
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Son Güncelleme: {lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 md:p-12">
          <div className="prose prose-invert prose-lg max-w-none text-white/90 leading-relaxed">
            <style jsx>{`
              .prose h2 {
                color: #fff;
                font-weight: 700;
                font-size: 1.5rem;
                margin-top: 2.5rem;
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 2px solid rgba(239, 68, 68, 0.3);
              }
              .prose h3 {
                color: #fff;
                font-weight: 600;
                font-size: 1.25rem;
                margin-top: 2rem;
                margin-bottom: 0.75rem;
              }
              .prose p {
                margin-bottom: 1.25rem;
                line-height: 1.8;
              }
              .prose strong {
                color: #fff;
                font-weight: 600;
              }
              .prose ul, .prose ol {
                margin-top: 1rem;
                margin-bottom: 1.5rem;
                padding-left: 1.5rem;
              }
              .prose li {
                margin-bottom: 0.5rem;
              }
              .prose a {
                color: #ef4444;
                text-decoration: none;
                font-weight: 600;
                transition: all 0.2s;
              }
              .prose a:hover {
                color: #dc2626;
                text-decoration: underline;
              }
              .prose button {
                color: #ef4444;
                text-decoration: none;
                font-weight: 600;
                transition: all 0.2s;
                background: none;
                border: none;
                cursor: pointer;
                padding: 0;
                font-size: inherit;
              }
              .prose button:hover {
                color: #dc2626;
                text-decoration: underline;
              }
            `}</style>
            {children}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-white mb-1">Önemli Not</p>
              <p>
                Bu belge, Ödelink platformunun kullanım koşullarını ve yasal yükümlülüklerini açıklar.
                Hizmeti kullanarak bu şartları kabul etmiş sayılırsınız.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPageLayout;
