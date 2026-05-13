import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  X, 
  ChevronRight, 
  Download, 
  Printer, 
  Search,
  Library,
  ShieldCheck,
  Building2,
  Lock,
  Maximize2
} from 'lucide-react';

const CertificatesPage = () => {
  const [selectedCert, setSelectedCert] = useState(null);

  const certificates = [
    {
      id: 'OD-SEC-2024-001',
      title: 'Global SSL Encryption Protocol',
      issuer: 'Network Security Division',
      issuedTo: 'Odelink Cloud Infrastructure',
      date: '12 Ocak 2024',
      validity: '31 Aralık 2025',
      type: 'SECURITY',
      serial: '550e8400-e29b-41d4-a716-446655440000',
      description: 'Uçtan uca şifreleme ve kimlik doğrulama standartlarına tam uyumluluk belgesidir.',
      stampColor: 'blue'
    },
    {
      id: 'OD-FIN-2024-088',
      title: 'PCI-DSS Compliance Certificate',
      issuer: 'Financial Security Board',
      issuedTo: 'Odelink Payment Systems',
      date: '05 Şubat 2024',
      validity: '04 Şubat 2026',
      type: 'FINANCE',
      serial: '661f9511-f30c-52e5-b827-557766551111',
      description: 'Uluslararası ödeme kartı veri güvenliği standartlarına (v4.0) tam uyumluluk onayıdır.',
      stampColor: 'gold'
    },
    {
      id: 'OD-ISO-27001-X',
      title: 'ISO/IEC 27001:2022 Certification',
      issuer: 'Quality Control Authority',
      issuedTo: 'Odelink Tech Management',
      date: '15 Mart 2024',
      validity: '14 Mart 2027',
      type: 'MANAGEMENT',
      serial: '772g0622-g41d-63f6-c938-668877662222',
      description: 'Bilgi güvenliği yönetim sistemi standartları denetiminden başarıyla geçilmiştir.',
      stampColor: 'red'
    },
    {
      id: 'OD-KVKK-2024-LGL',
      title: 'KVKK Compliance Verification',
      issuer: 'Legal Compliance Department',
      issuedTo: 'Odelink Digital Services',
      date: '20 Nisan 2024',
      validity: 'Süresiz / Periyodik Denetim',
      type: 'LEGAL',
      serial: '883h1733-h52e-74g7-d049-779988773333',
      description: '6698 sayılı Kişisel Verilerin Korunması Kanunu protokollerine tam uyumluluk beyanıdır.',
      stampColor: 'blue'
    }
  ];

  const DocumentComponent = ({ cert, isModal = false }) => {
    // QR code points to the real certificates page with ID
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://www.odelink.shop/certificates?id=${cert.id}`;

    return (
      <div className={`relative bg-white text-black shadow-2xl p-12 overflow-hidden ${isModal ? 'w-[800px] aspect-[1/1.414]' : 'w-full aspect-[1/1.414]'}`} style={{ fontFamily: 'serif' }}>
        {/* PAPER TEXTURE OVERLAY */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")' }} />
        
        {/* BORDER */}
        <div className="absolute inset-4 border-[3px] border-double border-gray-300" />
        <div className="absolute inset-8 border border-gray-200" />

        {/* WATERMARK */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-[-45deg]">
          <span className="text-9xl font-black tracking-widest uppercase">ÖDELINK</span>
        </div>

        {/* HEADER */}
        <div className="relative z-10 flex justify-between items-start mb-16">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-[0.2em] uppercase text-gray-800">ÖDELINK TECHNOLOGIES</h1>
            <p className="text-[10px] text-gray-500 font-sans tracking-widest uppercase">Official Certification & Compliance Division</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[10px] font-sans font-bold text-gray-400">DOC NO: {cert.id}</p>
            <p className="text-[10px] font-sans font-bold text-gray-400">REF: {cert.serial.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>

        {/* TITLE SECTION */}
        <div className="relative z-10 text-center mb-16 mt-20">
          <h2 className="text-4xl font-bold mb-4 tracking-tight border-b-2 border-gray-900 inline-block pb-2">CERTIFICATE OF COMPLIANCE</h2>
          <p className="text-sm italic text-gray-600 mt-4">This document confirms that the stated entity has met the requirements of the specified protocol.</p>
        </div>

        {/* BODY */}
        <div className="relative z-10 space-y-10 mt-20 text-lg leading-loose px-10">
          <div className="flex justify-between items-end border-b border-gray-100 pb-2">
            <span className="text-sm font-sans uppercase font-black text-gray-400 tracking-widest">Protocol</span>
            <span className="text-2xl font-bold">{cert.title}</span>
          </div>

          <div className="flex justify-between items-end border-b border-gray-100 pb-2">
            <span className="text-sm font-sans uppercase font-black text-gray-400 tracking-widest">Issued To</span>
            <span className="text-2xl font-bold">{cert.issuedTo}</span>
          </div>

          <div className="flex justify-between items-end border-b border-gray-100 pb-2">
            <span className="text-sm font-sans uppercase font-black text-gray-400 tracking-widest">Issuing Authority</span>
            <span className="text-xl font-medium italic">{cert.issuer}</span>
          </div>

          <div className="pt-8">
            <p className="text-base text-gray-700 text-justify first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left">
              {cert.description} Bu sertifika, belirtilen tarihler arasında geçerli olup, periyodik denetimler ve standartlara tam uyumluluk çerçevesinde düzenlenmiştir. Belgenin dijital aslına yan taraftaki resmi QR kod aracılığıyla erişilebilir.
            </p>
          </div>
        </div>

        {/* FOOTER / SIGNATURES */}
        <div className="absolute bottom-20 left-12 right-12 flex justify-between items-end">
          <div className="space-y-6">
            <img src={qrUrl} alt="QR Code" className="w-24 h-24 border border-gray-200 p-1" />
            <div className="space-y-1">
                <p className="text-[10px] font-sans font-bold uppercase text-gray-400">Effective Date</p>
                <p className="text-sm font-bold">{cert.date}</p>
            </div>
          </div>

          <div className="relative">
            {/* STAMP */}
            <div className={`absolute -top-24 -left-16 w-32 h-32 rounded-full border-4 flex items-center justify-center opacity-70 rotate-[-15deg] select-none
              ${cert.stampColor === 'blue' ? 'border-blue-800 text-blue-800' : 
                cert.stampColor === 'gold' ? 'border-[#C5A059] text-[#C5A059]' : 
                'border-red-800 text-red-800'}`}>
              <div className="text-center">
                <p className="text-[8px] font-black uppercase">OFFICIAL SEAL</p>
                <p className="text-[10px] font-black uppercase leading-none">VERIFIED</p>
                <p className="text-[8px] font-black uppercase">2024</p>
              </div>
            </div>

            {/* SIGNATURE */}
            <div className="text-center space-y-0">
               <div className="h-16 flex items-end justify-center mb-2">
                  <span className="font-serif italic text-3xl opacity-80 select-none" style={{ fontFamily: '"Great Vibes", cursive' }}>
                    M. Bayram
                  </span>
               </div>
               <div className="w-48 h-px bg-gray-900 mx-auto" />
               <p className="text-[10px] font-black uppercase tracking-widest mt-2">Managing Director</p>
               <p className="text-[8px] text-gray-400 uppercase tracking-widest">Odelink Technologies HQ</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-40 px-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-24 border-b border-white/5 pb-16">
          <div className="space-y-6">
             <div className="flex items-center gap-3 text-[#C5A059]">
               <Library size={24} />
               <span className="text-xs font-black uppercase tracking-[0.5em]">Digital Archive</span>
             </div>
             <h1 className="text-6xl font-serif text-[#F2EBE1] tracking-tighter leading-none">Kurumsal Sertifika Kasası</h1>
             <p className="text-[#F2EBE1]/40 max-w-xl text-lg font-medium">
               Ödelink altyapısının güvenilirliğini belgeleyen tüm resmi dökümanlar dijital olarak mühürlenmiş ve bu arşivde muhafaza edilmektedir.
             </p>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Archive Integrity</p>
                <p className="text-sm font-bold text-green-500 uppercase tracking-widest flex items-center gap-2 justify-end">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   Verified Secure
                </p>
             </div>
             <div className="w-px h-12 bg-white/10" />
             <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <Search size={20} className="text-[#C5A059]" />
             </div>
          </div>
        </div>

        {/* ARCHIVE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {certificates.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative cursor-pointer"
              onClick={() => setSelectedCert(cert)}
            >
              {/* DOCUMENT STACK EFFECT */}
              <div className="absolute inset-0 bg-white/5 translate-x-2 translate-y-2 rounded-sm" />
              <div className="absolute inset-0 bg-white/5 translate-x-1 translate-y-1 rounded-sm" />
              
              <div className="relative bg-[#111] border border-white/10 p-2 group-hover:border-[#C5A059]/50 transition-all duration-500">
                {/* PREVIEW CONTAINER */}
                <div className="relative bg-gray-900 aspect-[1/1.414] overflow-hidden">
                   <div className="scale-[0.5] origin-top transform transition-transform duration-700 group-hover:scale-[0.52]">
                     <DocumentComponent cert={cert} />
                   </div>
                   
                   {/* OVERLAY ON HOVER */}
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-[#C5A059] flex items-center justify-center text-black">
                        <Maximize2 size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Görüntüle</span>
                   </div>
                </div>

                {/* LABEL */}
                <div className="p-8 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-serif text-[#F2EBE1] mb-2">{cert.title}</h3>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{cert.id}</p>
                  </div>
                  <ChevronRight size={20} className="text-[#C5A059] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* MODAL VIEW */}
        <AnimatePresence>
          {selectedCert && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-20 bg-black/95 backdrop-blur-xl"
            >
              <div className="absolute top-10 right-10 flex gap-4">
                 <button className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-[#C5A059] hover:text-black transition-all">
                    <Printer size={20} />
                 </button>
                 <button className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-[#C5A059] hover:text-black transition-all">
                    <Download size={20} />
                 </button>
                 <button 
                  onClick={() => setSelectedCert(null)}
                  className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-all"
                 >
                    <X size={20} />
                 </button>
              </div>

              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                className="max-h-full overflow-y-auto no-scrollbar"
              >
                <DocumentComponent cert={selectedCert} isModal={true} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default CertificatesPage;
