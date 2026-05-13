import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Printer, 
  Download, 
  ChevronRight,
  Shield,
  FileCheck,
  Search,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

const CertificatesPage = () => {
  const [selectedCert, setSelectedCert] = useState(null);
  const printRef = useRef();

  const certificates = [
    {
      id: 'SEC-TLS-2401',
      title: 'Transport Layer Security (TLS 1.3)',
      subtitle: 'Data Encryption & Identity Verification',
      issuer: 'Global Certification Authority',
      entity: 'Odelink Cloud Platform',
      ref: '00X-550E8400',
      period: '2024 - 2025',
      stamp: 'Official Security Seal',
      desc: 'Bu döküman, platform üzerindeki tüm veri trafiğinin TLS 1.3 protokolü ve 256-bit AES şifreleme standartları ile uçtan uca korunduğunu tasdik eder.',
      legalNote: 'Technical Specification: ISO/IEC 18033-3:2010'
    },
    {
      id: 'FIN-PCI-2402',
      title: 'PCI-DSS Compliance (v4.0)',
      subtitle: 'Financial Data Security Standards',
      issuer: 'Payment Security Council',
      entity: 'Odelink Transaction Services',
      ref: '00X-661F9511',
      period: '2024 - 2026',
      stamp: 'Financial Integrity Seal',
      desc: 'Ödeme kanalları ve kullanıcı finansal verilerinin, uluslararası ödeme kartı endüstrisi standartlarına tam uyumluluğunu gösteren yetki belgesidir.',
      legalNote: 'Compliance Code: PCI-DSS-4.0-A1'
    },
    {
      id: 'ISO-ISMS-2403',
      title: 'ISO/IEC 27001:2022',
      subtitle: 'Information Security Management System',
      issuer: 'Quality & Standards Board',
      entity: 'Odelink Infrastructure Operations',
      ref: '00X-772G0622',
      period: '2024 - 2027',
      stamp: 'Quality Assurance Seal',
      desc: 'Kurumsal bilgi güvenliği yönetim süreçlerinin, uluslararası standartlar çerçevesinde denetlendiği ve onaylandığı resmi sertifikasyon dökümanıdır.',
      legalNote: 'Audit ID: 27001-2024-ISMS'
    },
    {
      id: 'LGL-KVKK-2404',
      title: 'Data Privacy & KVKK Compliance',
      subtitle: 'General Data Protection Regulation',
      issuer: 'Legal Compliance Institute',
      entity: 'Odelink Digital Ecosystem',
      ref: '00X-883H1733',
      period: 'Current / Ongoing',
      stamp: 'Legal Compliance Seal',
      desc: '6698 Sayılı KVKK ve Avrupa Birliği GDPR standartları kapsamında, kullanıcı veri gizliliği ve işleme protokollerine tam uyum belgesidir.',
      legalNote: 'Regulatory Framework: Law No. 6698'
    }
  ];

  const handlePrint = () => {
    const printContent = document.getElementById('printable-document');
    const WinPrint = window.open('', '', 'width=900,height=1200');
    WinPrint.document.write('<html><head><title>Ödelink Certificate</title>');
    WinPrint.document.write('<style>body { margin: 0; padding: 0; }</style>');
    WinPrint.document.write('</head><body>');
    WinPrint.document.write(printContent.innerHTML);
    WinPrint.document.write('</body></html>');
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  };

  const OfficialDocument = ({ cert, isForPrint = false }) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://www.odelink.shop/certificates/${cert.id}`;
    
    return (
      <div id={isForPrint ? 'printable-document' : ''} className={`relative bg-white text-black shadow-[0_0_80px_rgba(0,0,0,0.5)] mx-auto overflow-hidden ${isForPrint ? 'w-[794px] h-[1123px]' : 'w-full aspect-[1/1.414]'}`} style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        {/* REFINED BORDER */}
        <div className="absolute inset-8 border border-gray-100" />
        <div className="absolute inset-[34px] border-[2px] border-gray-900/10" />

        {/* WATERMARK */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none -rotate-45">
          <span className="text-[12rem] font-serif font-black tracking-tighter">ODELINK</span>
        </div>

        {/* CONTENT */}
        <div className="relative z-10 px-20 py-24 flex flex-col h-full">
          {/* HEADER */}
          <div className="flex justify-between items-start border-b-2 border-gray-900 pb-10 mb-20">
            <div>
              <h1 className="text-2xl font-bold tracking-widest uppercase">ÖDELINK</h1>
              <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-sans font-black mt-2">Infrastructure & Trust Compliance</p>
            </div>
            <div className="text-right font-sans text-[10px] space-y-1">
              <p className="font-bold text-gray-400">DOCUMENT ID</p>
              <p className="font-black text-gray-900">{cert.id}</p>
              <p className="font-bold text-gray-400 mt-4">REFERENCE</p>
              <p className="font-black text-gray-900">{cert.ref}</p>
            </div>
          </div>

          {/* MAIN TITLE */}
          <div className="text-center space-y-4 mb-24">
            <h2 className="text-4xl font-bold tracking-tight">CERTIFICATE OF COMPLIANCE</h2>
            <div className="w-48 h-[1px] bg-gray-300 mx-auto" />
            <p className="text-xs italic text-gray-500 uppercase tracking-widest">Protocol Verification Statement</p>
          </div>

          {/* FIELDS */}
          <div className="space-y-12 mb-auto">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-sans font-black text-gray-300 uppercase tracking-[0.3em]">Certification Subject</span>
              <span className="text-2xl font-bold border-b border-gray-100 pb-2">{cert.title}</span>
              <span className="text-xs italic text-gray-400">{cert.subtitle}</span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-sans font-black text-gray-300 uppercase tracking-[0.3em]">Certified Entity</span>
              <span className="text-2xl font-bold border-b border-gray-100 pb-2">{cert.entity}</span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-sans font-black text-gray-300 uppercase tracking-[0.3em]">Authority Body</span>
              <span className="text-xl font-bold italic">{cert.issuer}</span>
            </div>

            <div className="mt-16 bg-gray-50/50 p-8 border-l-4 border-gray-900">
               <p className="text-base text-gray-800 leading-relaxed text-justify first-letter:text-4xl first-letter:font-bold first-letter:mr-2">
                 {cert.desc} Bu belge, belirtilen altyapı bileşenlerinin standartlara tam uyum sağladığını ve periyodik denetim protokollerinden başarıyla geçtiğini beyan eder.
               </p>
               <p className="text-[10px] font-sans font-bold text-gray-400 uppercase tracking-widest mt-6">
                 Legal Reference: {cert.legalNote}
               </p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-between items-end mt-20">
            <div className="space-y-6">
               <img src={qrUrl} alt="QR Verification" className="w-24 h-24 p-1 bg-white border border-gray-100 shadow-sm" />
               <div className="space-y-1">
                 <p className="text-[9px] font-sans font-black text-gray-300 uppercase tracking-widest">Certification Period</p>
                 <p className="text-xs font-bold text-gray-900">{cert.period}</p>
               </div>
            </div>

            <div className="relative text-center">
              {/* SEAL */}
              <div className="absolute -top-32 -left-20 w-40 h-40 opacity-15 pointer-events-none rotate-[-15deg]">
                 <svg viewBox="0 0 100 100" className="w-full h-full fill-gray-900">
                    <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <text className="text-[8px] font-bold" transform="rotate(-15, 50, 50)">
                       <textPath href="#circlePath">OFFICIAL COMPLIANCE SEAL • ODELINK TECHNOLOGIES • </textPath>
                    </text>
                    <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="none" />
                 </svg>
              </div>

              <div className="space-y-2">
                 <div className="h-12 flex items-end justify-center">
                    <span className="font-serif italic text-3xl opacity-80" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                      M. Bayram
                    </span>
                 </div>
                 <div className="w-48 h-[1px] bg-gray-900 mx-auto" />
                 <p className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-gray-800">Board of Directors</p>
                 <p className="text-[8px] font-sans text-gray-400 uppercase tracking-widest">Verification Division HQ</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F2EBE1] pt-32 pb-40 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* CORPORATE HEADER */}
        <div className="mb-32 border-b border-white/10 pb-20">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2">
              <Shield size={16} className="text-gray-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Institutional Compliance</span>
            </div>
            <h1 className="text-7xl font-serif tracking-tighter leading-none italic">Güvenlik ve Uyumluluk Belgeleri</h1>
            <p className="text-xl text-[#F2EBE1]/40 font-medium leading-relaxed">
              Ödelink, teknolojik altyapısını uluslararası veri güvenliği ve finansal işlem standartlarına göre kurgulamıştır. Aşağıdaki resmi belgeler, bu standartlara olan bağlılığımızın beyanıdır.
            </p>
          </div>
        </div>

        {/* MINIMALIST LIST LAYOUT */}
        <div className="space-y-4">
          {certificates.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedCert(cert)}
              className="group relative bg-[#0C0C0C] border border-white/5 p-8 flex flex-col md:flex-row items-start md:items-center justify-between cursor-pointer hover:bg-white/[0.03] hover:border-[#F2EBE1]/20 transition-all duration-500"
            >
              <div className="flex items-center gap-10">
                 <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#F2EBE1]/40 transition-colors">
                    <FileCheck size={24} className="text-gray-400 group-hover:text-[#F2EBE1] transition-colors" />
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-2xl font-serif italic text-white/90">{cert.title}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{cert.id} • REF: {cert.ref}</p>
                 </div>
              </div>
              
              <div className="mt-6 md:mt-0 flex items-center gap-12">
                 <div className="text-right hidden md:block">
                    <p className="text-[10px] font-black text-white/10 uppercase tracking-widest mb-1">Validity Period</p>
                    <p className="text-sm font-bold text-white/60 tracking-tighter">{cert.period}</p>
                 </div>
                 <div className="flex items-center gap-4 bg-white/5 px-6 py-3 border border-white/10 group-hover:bg-[#F2EBE1] group-hover:text-black transition-all">
                    <span className="text-[10px] font-black uppercase tracking-widest">Dökümanı Aç</span>
                    <ChevronRight size={14} />
                 </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* MODAL VIEWPORT */}
        <AnimatePresence>
          {selectedCert && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 backdrop-blur-3xl overflow-hidden p-6 md:p-10"
            >
              {/* MODAL CONTROLS */}
              <div className="absolute top-10 right-10 flex gap-4 z-[110]">
                 <button 
                  onClick={handlePrint}
                  className="w-14 h-14 bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                  title="Yazdır"
                 >
                    <Printer size={20} />
                 </button>
                 <button 
                  onClick={handlePrint} // Same as print to save as PDF
                  className="w-14 h-14 bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                  title="İndir (PDF)"
                 >
                    <Download size={20} />
                 </button>
                 <button 
                  onClick={() => setSelectedCert(null)}
                  className="w-14 h-14 bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                 >
                    <X size={20} />
                 </button>
              </div>

              {/* DOCUMENT VIEWER */}
              <motion.div
                initial={{ y: 100, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 100, opacity: 0, scale: 0.9 }}
                className="relative max-h-full overflow-y-auto no-scrollbar py-10"
              >
                 <div className="bg-[#111] p-1 shadow-[0_0_100px_rgba(255,255,255,0.05)]">
                    <OfficialDocument cert={selectedCert} />
                 </div>
                 
                 {/* HIDDEN PRINTABLE VERSION */}
                 <div className="hidden">
                    <OfficialDocument cert={selectedCert} isForPrint={true} />
                 </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:italic,wght@400;700&display=swap');
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-document, #printable-document * {
            visibility: visible;
          }
          #printable-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificatesPage;
