import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Printer, 
  ShieldCheck, 
  Building2,
  Lock,
  Globe,
  QrCode,
  FileText,
  ExternalLink,
  Maximize2,
  Download,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const CertificatesPage = () => {
  const [selectedCert, setSelectedCert] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const certificates = [
    {
      id: 'NOVA-SEC-2026',
      title: 'Global Veri Şifreleme Protokolü',
      subtitle: '256-Bit Military Grade Encryption Standard',
      issuer: 'Nova Security & Cryptography Division',
      entity: 'Nova SaaS Infrastructure',
      ref: 'NV-ENC-1029',
      period: '2026 - 2027',
      stamp: 'Nova Validated',
      desc: 'Nova platformu, siber güvenlik mimarisinde TLS 1.3 ve AES-256 bit yüksek güvenlikli şifreleme protokollerini temel alır. Tüm veri transferleri, Quantum-Resistant algoritmalarla korunan güvenli tüneller üzerinden gerçekleştirilmektedir.',
      legalNote: 'Standard Compliance: ISO/IEC 27001 & NIST Cybersecurity Framework',
      qrTarget: 'https://files.nova.shop/certs/security-a4.pdf'
    },
    {
      id: 'NOVA-PAY-PCI-26',
      title: 'Ödeme Sistemleri Güvenlik Onayı',
      subtitle: 'PCI-DSS v4.0 Financial Compliance',
      issuer: 'Nova Global Financial Board',
      entity: 'Nova Transaction Network',
      ref: 'NV-PAY-8821',
      period: 'Continuous Validation',
      stamp: 'Financial Secure',
      desc: 'Ödeme altyapımız, küresel PCI-DSS veri güvenliği standartlarının en güncel sürümü (v4.0) ile tam uyumludur. Kullanıcıların finansal verileri Nova sunucularına asla dokunmadan, tamamen şifrelenmiş jetonlar (tokens) ile işlenmektedir.',
      legalNote: 'Infrastructure Authority: Nova Payment Systems API v3',
      qrTarget: 'https://files.nova.shop/certs/payment-a4.pdf'
    },
    {
      id: 'NOVA-LGL-KVKK-26',
      title: 'Veri Gizliliği ve KVKK Sertifikası',
      subtitle: 'GDPR & KVKK Regulatory Compliance',
      issuer: 'Nova Legal Affairs Bureau',
      entity: 'Nova Cloud Ecosystem',
      ref: 'NV-LAW-7712',
      period: 'Annual Audit 2026',
      stamp: 'Legal Compliance',
      desc: '6698 Sayılı Kişisel Verilerin Korunması Kanunu ve Avrupa Birliği GDPR standartları kapsamında, veri saklama, işleme ve anonimleştirme süreçlerimizin tam uyumluluk içerisinde olduğu resmi olarak tasdik edilmiştir.',
      legalNote: 'Statutory Body: Law No. 6698 / EU Regulation 2016/679',
      qrTarget: 'https://files.nova.shop/certs/privacy-a4.pdf'
    }
  ];

  const handlePrint = (id) => {
    const printContent = document.getElementById(`doc-${id}`);
    const WinPrint = window.open('', '', 'width=1000,height=1400');
    WinPrint.document.write('<html><head><title>Nova Official Certificate</title>');
    WinPrint.document.write('<style>body { margin: 0; padding: 40px; font-family: "Playfair Display", serif; background: #fff; }</style>');
    WinPrint.document.write('<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Inter:wght@400;700;900&display=swap" rel="stylesheet">');
    WinPrint.document.write('</head><body>');
    WinPrint.document.write(printContent.innerHTML);
    WinPrint.document.write('</body></html>');
    WinPrint.document.close();
    WinPrint.focus();
    setTimeout(() => {
      WinPrint.print();
      WinPrint.close();
    }, 1000);
  };

  const A4Certificate = ({ cert, scale = 1 }) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${cert.qrTarget}`;
    
    return (
      <div 
        id={`doc-${cert.id}`} 
        className="bg-[#FAFAFA] text-[#0A0A0A] shadow-[0_0_100px_rgba(0,0,0,0.1)] mx-auto overflow-hidden relative border border-black/5"
        style={{ 
          width: scale === 1 ? '100%' : '210mm', 
          aspectRatio: '1/1.414',
          transform: `scale(${scale})`,
          transformOrigin: 'top center'
        }}
      >
        {/* Aristocratic Border Pattern */}
        <div className="absolute inset-4 border-[0.5px] border-black/10" />
        <div className="absolute inset-6 border-[1px] border-black/5" />
        <div className="absolute inset-8 border-[3px] border-double border-black/10" />

        {/* Content Section */}
        <div className="relative z-10 p-16 md:p-24 flex flex-col h-full font-serif text-left">
          {/* Header */}
          <div className="flex justify-between items-start border-b-[4px] border-black pb-12 mb-16">
            <div className="space-y-3">
              <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Nova</h1>
              <p className="text-[10px] font-sans font-black uppercase tracking-[0.5em] text-black/40">Strategic Infrastructure Division</p>
            </div>
            <div className="text-right font-sans text-[10px] space-y-2 leading-tight">
              <div className="bg-black text-white px-5 py-2 font-black mb-3 inline-block tracking-widest">OFFICIAL CERTIFICATE</div>
              <p className="font-bold text-black/40 uppercase tracking-widest text-[9px]">CERT ID: <span className="text-black font-black">{cert.id}</span></p>
              <p className="font-bold text-black/40 uppercase tracking-widest text-[9px]">REF: <span className="text-black font-black">{cert.ref}</span></p>
            </div>
          </div>

          {/* Title Area */}
          <div className="text-center mb-20 space-y-6">
            <h2 className="text-5xl font-bold tracking-tight uppercase italic mb-6">Certificate of Compliance</h2>
            <div className="w-64 h-[1px] bg-black/10 mx-auto" />
            <p className="text-[12px] font-sans font-black text-black/30 tracking-[0.4em] uppercase">Security Validated & Authenticated by Nova Labs</p>
          </div>

          {/* Core Body */}
          <div className="space-y-12 flex-1">
            <div className="space-y-3">
              <label className="text-[10px] font-sans font-black text-black/20 uppercase tracking-[0.4em]">Certification Protocol</label>
              <h3 className="text-3xl font-bold border-b border-black/10 pb-4 leading-tight uppercase tracking-tight">{cert.title}</h3>
              <p className="text-[13px] italic text-black/50 font-medium">{cert.subtitle}</p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-sans font-black text-black/20 uppercase tracking-[0.4em]">Authorized Authority</label>
              <h3 className="text-3xl font-bold border-b border-black/10 pb-4 uppercase tracking-tight">{cert.issuer}</h3>
            </div>

            <div className="bg-black/5 p-10 border-l-[8px] border-black relative">
              <p className="text-[17px] leading-relaxed text-justify first-letter:text-5xl first-letter:font-bold first-letter:mr-3 font-serif">
                {cert.desc}
              </p>
              <div className="mt-10 pt-8 border-t border-black/10">
                <p className="text-[11px] font-sans font-black text-black/40 uppercase tracking-[0.3em]">
                  Regulatory Reference: {cert.legalNote}
                </p>
              </div>
            </div>
          </div>

          {/* Footer & Signature Section */}
          <div className="mt-auto pt-16 flex justify-between items-end">
            <div className="flex gap-10 items-end">
              <div className="relative group cursor-help">
                <img src={qrUrl} alt="QR Verification" className="w-28 h-28 p-2 bg-white border border-black/10" />
                <p className="text-[9px] font-sans font-black text-center mt-3 text-black/40 tracking-widest">SCAN TO AUTHENTICATE</p>
              </div>
              <div className="space-y-2 pb-2">
                <p className="text-[10px] font-sans font-black text-black/20 uppercase tracking-[0.3em]">Validity Term</p>
                <p className="text-[15px] font-black uppercase tracking-widest">{cert.period}</p>
              </div>
            </div>

            <div className="text-center">
              <div className="relative inline-block pb-4">
                <div 
                  className="absolute -top-24 -left-16 w-40 h-40 rounded-full border-[2px] border-double flex items-center justify-center rotate-[-15deg] select-none opacity-40 border-black text-black"
                >
                  <div className="text-center font-sans">
                    <p className="text-[8px] font-black uppercase tracking-tighter">NOVA TRUST</p>
                    <p className="text-[12px] font-black uppercase my-2 tracking-[0.3em] border-y border-black">CERTIFIED</p>
                    <p className="text-[8px] font-black uppercase tracking-tighter">GLOBAL OPS 2026</p>
                  </div>
                </div>
                
                <div className="pt-12 text-center">
                   <div className="font-serif italic text-5xl mb-3 opacity-90" style={{ fontFamily: '"Playfair Display", serif' }}>
                     M. Bayram
                   </div>
                  <div className="w-64 h-[2px] bg-black mb-3" />
                  <p className="text-[11px] font-sans font-black uppercase tracking-[0.4em]">Chief Infrastructure Officer</p>
                  <p className="text-[9px] font-sans text-black/30 uppercase tracking-[0.2em] mt-1">Verification Division / Nova SaaS</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2EBE1] font-sans selection:bg-white selection:text-black overflow-x-hidden">
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#1A1A1A_0%,#0A0A0A_70%)] opacity-50" />
        <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-white/[0.01] blur-[180px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-[900px] h-[900px] bg-white/[0.02] blur-[220px] rounded-full" />
      </div>

      <div className="relative pt-48 pb-64 px-6 sm:px-12 max-w-[1600px] mx-auto">
        
        <div className="text-center mb-48">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-4 px-8 py-3 rounded-full bg-white/5 border border-white/10 mb-12"
          >
            <ShieldCheck size={20} className="text-white" />
            <span className="text-[12px] font-black uppercase tracking-[0.5em] text-white/80">Nova Official Compliance Archive</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-7xl sm:text-9xl md:text-[11rem] font-serif tracking-tighter leading-[0.85] mb-16 italic"
          >
            Nova Belgeleri
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-xl sm:text-2xl text-white/30 max-w-4xl mx-auto leading-relaxed font-light tracking-wide italic"
          >
            Nova SaaS altyapısının kurumsal güvenilirliğini, siber güvenlik mimarisini ve küresel veri uyumluluğunu tasdik eden kurumsal dijital arşiv.
          </motion.p>
        </div>

        {isMobile ? (
          <div className="space-y-12">
            {certificates.map((cert, i) => (
              <motion.div 
                key={cert.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-[#111] border border-white/5 p-10 rounded-sm relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5">
                   <FileText size={120} />
                </div>
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 bg-white text-black flex items-center justify-center rounded-sm shadow-xl">
                        <QrCode size={28} strokeWidth={2.5} />
                     </div>
                     <div>
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{cert.id}</span>
                        <h3 className="text-2xl font-serif italic text-white">{cert.title}</h3>
                     </div>
                  </div>
                  <p className="text-sm text-white/40 leading-relaxed font-medium">{cert.desc}</p>
                  <div className="flex flex-col gap-4 pt-4">
                    <button 
                      onClick={() => setSelectedCert(cert)}
                      className="w-full bg-white text-black h-16 text-[12px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 rounded-sm shadow-2xl active:scale-95 transition-all"
                    >
                      <Maximize2 size={20} /> BELGEYİ ODAKLA
                    </button>
                    <button 
                      onClick={() => window.open(cert.qrTarget, '_blank')}
                      className="w-full bg-white/5 border border-white/10 text-white/60 h-16 text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 rounded-sm hover:bg-white hover:text-black transition-all"
                    >
                      <Download size={20} /> DİJİTAL ASLI (A4)
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-2 gap-32">
            {certificates.map((cert, i) => (
              <motion.div 
                key={cert.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className="group relative"
              >
                <div className="absolute -top-20 right-0 flex gap-6 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-6 group-hover:translate-y-0 z-50">
                  <button 
                    onClick={() => handlePrint(cert.id)}
                    className="bg-white text-black px-8 py-4 text-[11px] font-black uppercase tracking-widest flex items-center gap-4 hover:scale-105 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] rounded-sm"
                  >
                    <Printer size={18} strokeWidth={2.5} /> YAZDIR / PDF
                  </button>
                  <button 
                    onClick={() => setSelectedCert(cert)}
                    className="bg-white/10 border border-white/20 backdrop-blur-xl text-white px-8 py-4 text-[11px] font-black uppercase tracking-widest flex items-center gap-4 hover:bg-white hover:text-black transition-all rounded-sm"
                  >
                    <Maximize2 size={18} strokeWidth={2.5} /> TAM EKRAN
                  </button>
                </div>

                <div className="relative perspective-2000 group-hover:z-40">
                  <div className="absolute inset-0 bg-white/5 translate-x-6 translate-y-6 -z-10 transition-all duration-1000 group-hover:translate-x-12 group-hover:translate-y-12 group-hover:bg-white/10 rounded-sm" />
                  <div className="border border-white/10 p-1.5 bg-[#111] overflow-hidden group-hover:scale-[1.02] transition-all duration-1000 shadow-[0_0_100px_rgba(0,0,0,0.5)] cursor-zoom-in" onClick={() => setSelectedCert(cert)}>
                    <A4Certificate cert={cert} />
                  </div>
                </div>

                <div className="mt-16 space-y-6">
                  <div className="flex justify-between items-end border-b border-white/10 pb-8">
                    <div className="space-y-2">
                       <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">{cert.id}</span>
                       <h3 className="text-4xl font-serif italic text-white/80 group-hover:text-white transition-colors">{cert.title}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-2 leading-none">Status</p>
                      <div className="flex items-center gap-3 text-emerald-500 font-black text-sm tracking-tighter uppercase">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_100px_rgba(16,185,129,0.3)]" />
                         VERIFIED 2026
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-12 items-center text-[11px] font-black text-white/10 uppercase tracking-[0.3em]">
                    <div className="flex items-center gap-3"><FileText size={14} /> REF: {cert.ref}</div>
                    <div className="flex items-center gap-3"><Building2 size={14} /> ISSUED BY NOVA SYSTEMS</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {selectedCert && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[2000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-0 sm:p-12 overflow-y-auto"
            >
              <button 
                onClick={() => setSelectedCert(null)}
                className="fixed top-10 right-10 w-20 h-20 bg-white text-black flex items-center justify-center hover:scale-110 transition-all z-[2100] rounded-sm shadow-2xl active:scale-95"
              >
                <X size={40} strokeWidth={2.5} />
              </button>
              
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 100 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 100 }}
                className="w-full max-w-5xl shadow-[0_0_200px_rgba(255,255,255,0.05)] my-20"
              >
                <A4Certificate cert={selectedCert} />
                <div className="mt-16 flex flex-col sm:flex-row justify-center gap-8">
                  <button 
                    onClick={() => handlePrint(selectedCert.id)}
                    className="h-20 px-16 bg-white text-black text-[14px] font-black uppercase tracking-[0.4em] flex items-center gap-6 hover:bg-[#F2EBE1] transition-all rounded-sm shadow-2xl"
                  >
                    <Printer size={24} strokeWidth={2.5} /> RESMİ DÖKÜMANI YAZDIR
                  </button>
                  <button 
                    onClick={() => window.open(selectedCert.qrTarget, '_blank')}
                    className="h-20 px-16 bg-white/5 border border-white/10 text-white text-[14px] font-black uppercase tracking-[0.4em] flex items-center gap-6 hover:bg-white/10 transition-all rounded-sm"
                  >
                    <Download size={24} strokeWidth={2.5} /> DİJİTAL DOSYAYI İNDİR (A4)
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-80 pt-60 border-t border-white/5 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16 md:gap-32 mb-32 opacity-20 grayscale hover:grayscale-0 transition-all duration-1000">
            <div className="flex flex-col items-center gap-6 group cursor-default">
              <Building2 size={56} strokeWidth={1} className="group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] group-hover:text-white transition-colors">Nova Enterprise</span>
            </div>
            <div className="flex flex-col items-center gap-6 group cursor-default">
              <Lock size={56} strokeWidth={1} className="group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] group-hover:text-white transition-colors">Nova Security</span>
            </div>
            <div className="flex flex-col items-center gap-6 group cursor-default">
              <Globe size={56} strokeWidth={1} className="group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] group-hover:text-white transition-colors">Global Compliance</span>
            </div>
            <div className="flex flex-col items-center gap-6 group cursor-default">
              <QrCode size={56} strokeWidth={1} className="group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] group-hover:text-white transition-colors">Digital Trust</span>
            </div>
          </div>
          <p className="text-base sm:text-lg text-white/20 font-medium max-w-4xl mx-auto leading-relaxed tracking-wider italic">
            Nova resmi dökümanları dijital kriptografik imzalarla mühürlenmiştir. Her belge üzerindeki QR kod, ilgili sertifikanın orijinalliğini Nova Strategic Infrastructure Division ana sunucuları üzerinden, dijital A4 dosyası formatında doğrular.
          </p>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        
        .perspective-2000 {
          perspective: 3000px;
        }

        @media print {
          body * { visibility: hidden; }
          [id^="doc-"], [id^="doc-"] * { visibility: visible; }
          [id^="doc-"] { position: absolute; left: 0; top: 0; width: 100%; border: none; shadow: none; }
        }

        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0A0A0A;
        }
        ::-webkit-scrollbar-thumb {
          background: #222;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
      `}</style>
    </div>
  );
};

export default CertificatesPage;
