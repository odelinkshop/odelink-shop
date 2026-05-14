import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Printer, 
  Download, 
  Shield, 
  Building2,
  Lock,
  Globe,
  QrCode,
  FileText,
  ExternalLink,
  ChevronRight,
  Maximize2
} from 'lucide-react';

const CertificatesPage = () => {
  const [selectedCert, setSelectedCert] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const certificates = [
    {
      id: 'OD-TLS-SEC-24',
      title: 'Veri Şifreleme ve SSL Protokol Onayı',
      subtitle: '256-Bit End-to-End Encryption Statement',
      issuer: 'Global Security & Encryption Division',
      entity: 'Odelink Digital Ecosystem',
      ref: 'REF-SSL-9920',
      period: '2024 - 2025',
      stamp: 'Security Validated',
      desc: 'Odelink platformu üzerindeki tüm veri trafiğinin TLS 1.3 protokolü ve AES-256 bit şifreleme standartları ile uçtan uca korunduğunu, kullanıcı verilerinin transfer sırasında üçüncü taraflarca erişilemez olduğunu tasdik eder.',
      legalNote: 'Compliance: Transport Layer Security v1.3 Standards',
      stampColor: '#1a365d'
    },
    {
      id: 'OD-PAY-PCI-24',
      title: 'Güvenli Ödeme ve PCI-DSS Entegrasyonu',
      subtitle: 'Shopier Infrastructure Security Statement',
      issuer: 'Financial Compliance Board',
      entity: 'Odelink Transaction Infrastructure',
      ref: 'REF-PAY-4412',
      period: 'Continuous Integration',
      stamp: 'Payment Verified',
      desc: 'Ödeme işlemleri PCI-DSS v4.0 uyumlu Shopier altyapısı üzerinden gerçekleştirilmektedir. Kart verilerinin hiçbir şekilde Odelink sunucularında tutulmadığını ve Shopier güvencesiyle işlendiğini beyan eder.',
      legalNote: 'Integration Framework: Shopier Secure API v2.0',
      stampColor: '#b45309'
    },
    {
      id: 'OD-LGL-KVKK-24',
      title: 'KVKK ve Veri Gizliliği Taahhütnamesi',
      subtitle: 'Data Protection & Privacy Compliance',
      issuer: 'Legal Affairs Department',
      entity: 'Odelink Platform Operations',
      ref: 'REF-LAW-8831',
      period: 'Permanent Compliance',
      stamp: 'Legal Verified',
      desc: '6698 Sayılı Kişisel Verilerin Korunması Kanunu kapsamında, kullanıcı verilerinin işlenmesi, saklanması ve imha edilmesi süreçlerinin yasal mevzuata tam uyumlu olduğunu bildiren resmi beyandır.',
      legalNote: 'Regulatory Act: Republic of Turkey Law No. 6698',
      stampColor: '#1e40af'
    },
    {
      id: 'OD-INF-UPS-24',
      title: 'Yüksek Erişilebilirlik ve Altyapı Onayı',
      subtitle: 'Server Infrastructure & Uptime Certification',
      issuer: 'Infrastructure Quality Board',
      entity: 'Odelink Server Networks',
      ref: 'REF-INF-7712',
      period: '2024 Service Level',
      stamp: 'Systems Active',
      desc: 'Dijital vitrin sistemlerinin barındırıldığı sunucu altyapısının %99.9 uptime garantisine sahip olduğu ve çok katmanlı güvenlik duvarları (WAF) ile korunduğunu tasdik eder.',
      legalNote: 'Infrastructure Standard: Tier III Data Center Standards',
      stampColor: '#991b1b'
    }
  ];

  const handlePrint = (id) => {
    const printContent = document.getElementById(`doc-${id}`);
    const WinPrint = window.open('', '', 'width=900,height=1200');
    WinPrint.document.write('<html><head><title>Ödelink Official Document</title>');
    WinPrint.document.write('<style>body { margin: 0; padding: 20px; font-family: "Times New Roman", serif; }</style>');
    WinPrint.document.write('</head><body>');
    WinPrint.document.write(printContent.innerHTML);
    WinPrint.document.write('</body></html>');
    WinPrint.document.close();
    WinPrint.focus();
    setTimeout(() => {
      WinPrint.print();
      WinPrint.close();
    }, 500);
  };

  const A4Document = ({ cert, scale = 1 }) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://www.odelink.shop/verify/${cert.id}`;
    
    return (
      <div 
        id={`doc-${cert.id}`} 
        className="bg-white text-black shadow-2xl mx-auto overflow-hidden relative"
        style={{ 
          width: scale === 1 ? '100%' : '210mm', 
          aspectRatio: '1/1.414',
          transform: `scale(${scale})`,
          transformOrigin: 'top center'
        }}
      >
        {/* Decorative Frame */}
        <div className="absolute inset-4 border-[0.5px] border-black/10" />
        <div className="absolute inset-6 border-[2px] border-black/5" />

        {/* Content */}
        <div className="relative z-10 p-12 md:p-16 flex flex-col h-full font-serif">
          {/* Header */}
          <div className="flex justify-between items-start border-b-[3px] border-black pb-8 mb-12">
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tighter">ÖDELINK</h1>
              <p className="text-[10px] font-sans font-black uppercase tracking-[0.4em] text-gray-400">Strategic Infrastructure Division</p>
            </div>
            <div className="text-right font-sans text-[9px] space-y-1 leading-tight">
              <div className="bg-black text-white px-3 py-1 font-black mb-2 inline-block">OFFICIAL DOCUMENT</div>
              <p className="font-bold text-gray-400 uppercase">Document ID: <span className="text-black font-black">{cert.id}</span></p>
              <p className="font-bold text-gray-400 uppercase">Ref No: <span className="text-black font-black">{cert.ref}</span></p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight uppercase mb-4">Certificate of Compliance</h2>
            <div className="w-48 h-[1px] bg-black/20 mx-auto" />
            <p className="text-[11px] font-sans font-bold text-gray-400 mt-4 tracking-widest uppercase">Verification Status: Verified & Encrypted</p>
          </div>

          {/* Body */}
          <div className="space-y-10 flex-1">
            <div className="space-y-2">
              <label className="text-[9px] font-sans font-black text-gray-300 uppercase tracking-widest">Certification Subject</label>
              <h3 className="text-2xl font-bold border-b border-black/5 pb-2 leading-tight">{cert.title}</h3>
              <p className="text-[12px] italic text-gray-500">{cert.subtitle}</p>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-sans font-black text-gray-300 uppercase tracking-widest">Authorized Entity</label>
              <h3 className="text-2xl font-bold border-b border-black/5 pb-2">{cert.entity}</h3>
            </div>

            <div className="bg-gray-50 p-8 border-l-[6px] border-black relative">
              <p className="text-[15px] leading-relaxed text-justify first-letter:text-4xl first-letter:font-bold first-letter:mr-2">
                {cert.desc}
              </p>
              <div className="mt-8 pt-6 border-t border-black/5">
                <p className="text-[10px] font-sans font-black text-gray-400 uppercase tracking-widest">
                  Legal Reference: {cert.legalNote}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-12 flex justify-between items-end">
            <div className="flex gap-8 items-end">
              <div className="relative">
                <img src={qrUrl} alt="QR" className="w-24 h-24 p-1 bg-white border border-black/10" />
                <p className="text-[8px] font-sans font-black text-center mt-2 text-gray-400">SCAN TO VERIFY</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-sans font-black text-gray-300 uppercase tracking-widest">Validity Period</p>
                <p className="text-[13px] font-bold uppercase">{cert.period}</p>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="relative inline-block">
                {/* Official Seal */}
                <div 
                  className="absolute -top-16 -left-12 w-32 h-32 rounded-full border-[3px] border-double flex items-center justify-center rotate-[-12deg] select-none opacity-60"
                  style={{ borderColor: cert.stampColor, color: cert.stampColor }}
                >
                  <div className="text-center font-sans">
                    <p className="text-[7px] font-black uppercase tracking-tighter">OFFICIAL SEAL</p>
                    <p className="text-[10px] font-black uppercase my-1 tracking-widest border-y border-current">VERIFIED</p>
                    <p className="text-[7px] font-black uppercase tracking-tighter">SYSTEMS 2024</p>
                  </div>
                </div>
                
                <div className="pt-8">
                  <p className="font-serif italic text-4xl opacity-90 mb-1" style={{ fontFamily: '"Great Vibes", cursive' }}>
                    M. Bayram
                  </p>
                  <div className="w-48 h-[1.5px] bg-black mb-2" />
                  <p className="text-[10px] font-sans font-black uppercase tracking-[0.2em]">Board Director</p>
                  <p className="text-[8px] font-sans text-gray-400 uppercase">Verification Division</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F2EBE1] font-sans selection:bg-white selection:text-black">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/[0.02] blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-white/[0.03] blur-[180px] rounded-full" />
      </div>

      <div className="relative pt-40 pb-60 px-6 max-w-[1400px] mx-auto">
        
        {/* Title Section */}
        <div className="text-center mb-40">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
          >
            <Shield size={16} className="text-white" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em]">Strategic Trust & Security Protocol</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-7xl md:text-9xl font-serif tracking-tighter leading-[0.8] mb-12 italic"
          >
            Resmi Belgeler
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-white/40 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Ödelink altyapısının kurumsal güvenilirliğini, veri şifreleme standartlarını ve yasal uyumluluğunu tasdik eden resmi dijital arşiv.
          </motion.p>
        </div>

        {/* Certificate Display Strategy */}
        {isMobile ? (
          // MOBILE VIEW: Modern Card Stack
          <div className="space-y-8">
            {certificates.map((cert, i) => (
              <motion.div 
                key={cert.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white/5 border border-white/10 p-8 rounded-[32px] group"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <FileText size={24} className="text-white" />
                  </div>
                  <span className="text-[10px] font-black opacity-20 uppercase tracking-widest">{cert.id}</span>
                </div>
                <h3 className="text-2xl font-serif italic mb-4 leading-tight">{cert.title}</h3>
                <p className="text-sm text-white/40 mb-8 leading-relaxed line-clamp-3">{cert.desc}</p>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedCert(cert)}
                    className="flex-1 bg-white text-black h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <Maximize2 size={16} /> GÖRÜNTÜLE
                  </button>
                  <button 
                    className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"
                    onClick={() => handlePrint(cert.id)}
                  >
                    <Download size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // DESKTOP VIEW: Premium Document Grid
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            {certificates.map((cert, i) => (
              <motion.div 
                key={cert.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="group relative"
              >
                {/* Actions */}
                <div className="absolute -top-16 right-0 flex gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                  <button 
                    onClick={() => handlePrint(cert.id)}
                    className="bg-white text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-2xl"
                  >
                    <Printer size={16} /> YAZDIR / PDF
                  </button>
                  <button 
                    onClick={() => setSelectedCert(cert)}
                    className="bg-white/10 border border-white/20 backdrop-blur-md text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-white hover:text-black transition-all"
                  >
                    <Maximize2 size={16} /> ODAKLAN
                  </button>
                </div>

                {/* Document Container */}
                <div className="relative perspective-1000 group-hover:z-50">
                  <div className="absolute inset-0 bg-white shadow-[0_0_100px_rgba(255,255,255,0.05)] translate-x-4 translate-y-4 -z-10 transition-transform duration-700 group-hover:translate-x-8 group-hover:translate-y-8" />
                  <div className="border border-white/10 p-1 bg-[#111] overflow-hidden group-hover:scale-[1.02] transition-transform duration-700 shadow-2xl">
                    <A4Document cert={cert} />
                  </div>
                </div>

                {/* Info Overlay */}
                <div className="mt-12 space-y-4">
                  <div className="flex justify-between items-end border-b border-white/10 pb-6">
                    <h3 className="text-3xl font-serif italic text-white/90 group-hover:text-white transition-colors">{cert.title}</h3>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-1 leading-none">Validity</p>
                      <p className="text-sm font-bold tracking-tighter uppercase">{cert.period}</p>
                    </div>
                  </div>
                  <div className="flex gap-8 items-center text-[10px] font-black text-white/20 uppercase tracking-widest">
                    <span>ID: {cert.id}</span>
                    <span>REF: {cert.ref}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal for Focus Mode */}
        <AnimatePresence>
          {selectedCert && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-8 overflow-y-auto"
            >
              <button 
                onClick={() => setSelectedCert(null)}
                className="fixed top-8 right-8 w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all z-[110]"
              >
                <Maximize2 className="rotate-45" size={32} />
              </button>
              
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="w-full max-w-4xl shadow-[0_0_150px_rgba(255,255,255,0.1)] my-20"
              >
                <A4Document cert={selectedCert} />
                <div className="mt-12 flex justify-center gap-6">
                  <button 
                    onClick={() => handlePrint(selectedCert.id)}
                    className="h-16 px-12 bg-white text-black text-[13px] font-black uppercase tracking-[0.3em] flex items-center gap-4 hover:brightness-90 transition-all"
                  >
                    <Printer size={20} /> BU BELGEYİ YAZDIR
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Corporate Trust Badges */}
        <div className="mt-60 pt-40 border-t border-white/5 text-center">
          <div className="flex flex-wrap justify-center gap-16 md:gap-32 mb-20 opacity-20 grayscale hover:grayscale-0 transition-all duration-1000">
            <div className="flex flex-col items-center gap-4">
              <Building2 size={48} strokeWidth={1} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Enterprise</span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <Lock size={48} strokeWidth={1} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Security</span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <Globe size={48} strokeWidth={1} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Compliance</span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <QrCode size={48} strokeWidth={1} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Verified</span>
            </div>
          </div>
          <p className="text-sm text-white/20 font-medium max-w-3xl mx-auto leading-relaxed tracking-wide">
            Ödelink resmi dökümanları dijital kriptografik imzalarla korunmaktadır. Her belge üzerindeki QR kod, ilgili sertifikanın orijinalliğini Strategic Intelligence Division sunucuları üzerinden doğrular.
          </p>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        
        .perspective-1000 {
          perspective: 2000px;
        }

        @media print {
          body * { visibility: hidden; }
          #printable-document, #printable-document * { visibility: visible; }
          #printable-document { position: absolute; left: 0; top: 0; width: 100%; }
        }

        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #050505;
        }
        ::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
      `}</style>
    </div>
  );
};

export default CertificatesPage;
