import React from 'react';
import { Monitor } from 'lucide-react';

const DesktopOnlyGate = ({ children }) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0A0A0A] flex items-center justify-center p-6 text-center overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 max-w-md w-full">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
            <div className="relative w-20 h-20 bg-neutral-900 border border-white/10 rounded-2xl flex items-center justify-center">
              <Monitor className="w-10 h-10 text-blue-400" />
            </div>
          </div>
        </div>

        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4">
          Nova Intelligence Protocol
        </h2>
        
        <h1 className="text-3xl font-serif text-white mb-6 leading-tight">
          Elite Studio & <br /> Analitik Karargahı
        </h1>
        
        <p className="text-gray-400 text-sm leading-relaxed mb-10 font-light italic">
          "Kusursuz bir tasarım deneyimi ve derinlemesine veri analizi için çok daha geniş bir tuvale ihtiyacınız var. Nova'nın aristokratik detaylarını yönetebilmeniz için lütfen masaüstü bir cihazdan giriş yapın."
        </p>

        <div className="inline-flex items-center space-x-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
            Masaüstüne Geç, Sanatını Konuştur
          </span>
        </div>

        <div className="mt-12">
           <button 
             onClick={() => window.location.href = '/panel'}
             className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
           >
             ← Panele Geri Dön
           </button>
        </div>
      </div>

      {/* Decorative Bottom Text */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <span className="text-[8px] font-medium uppercase tracking-[0.5em] text-white/10">
          Odelink SaaS Engine v2.1 • Command Center
        </span>
      </div>
    </div>
  );
};

export default DesktopOnlyGate;
