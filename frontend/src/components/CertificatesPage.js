import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Building2,
  Lock,
  Globe,
  QrCode,
  FileText,
  Maximize2,
  Download,
  X,
  ExternalLink,
  CheckCircle2,
  Award,
  Fingerprint
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
      id: 'ODL-ISO-27001',
      title: 'Bilgi Güvenliği Yönetim Sistemi',
      subtitle: 'ISO/IEC 27001:2022 Global Standard',
      issuer: 'Ödelink International Audit Board',
      entity: 'Ödelink International Ltd.',
      ref: 'CERT-27001-8842',
      period: '2026 - 2029',
      stamp: 'Security Certified',
      desc: 'Ödelink International altyapısı, dünya çapında kabul görmüş ISO/IEC 27001 bilgi güvenliği standartları çerçevesinde periyodik olarak denetlenmekte ve en üst seviye veri güvenliği protokollerini uygulamaktadır.',
      legalNote: 'Compliance Registry: International Accreditation Forum (IAF)',
      qrTarget: 'https://odelink.shop/verify/iso27001'
    },
    {
      id: 'ODL-PCI-DSS-L1',
      title: 'Ödeme Güvenliği Sertifikası',
      subtitle: 'PCI-DSS Level 1 Financial Security',
      issuer: 'Global Payment Security Council',
      entity: 'Ödelink Transaction Systems',
      ref: 'CERT-PCI-9921',
      period: 'Continuous Validation',
      stamp: 'Payment Secure',
      desc: 'Finansal veri güvenliğinde en yüksek standart olan PCI-DSS Level 1 sertifikasyonu ile, tüm ödeme süreçleriniz uçtan uca şifrelenmekte ve hiçbir hassas veri sunucularımızda saklanmamaktadır.',
      legalNote: 'Security Authority: PCI Security Standards Council (SSC)',
      qrTarget: 'https://odelink.shop/verify/pci-dss'
    },
    {
      id: 'ODL-GDPR-KVKK-26',
      title: 'Veri Koruma ve Gizlilik Belgesi',
      subtitle: 'GDPR & KVKK Regulatory Compliance',
      issuer: 'Ödelink International Legal Group',
      entity: 'Ödelink Data Services',
      ref: 'CERT-LAW-1102',
      period: 'Annual Audit 2026',
      stamp: 'Data Protection',
      desc: 'Kişisel verilerin korunması kanunu (KVKK) ve Avrupa Birliği Genel Veri Koruma Tüzüğü (GDPR) ile %100 uyumlu veri işleme ve saklama süreçlerimiz, hukuk birimimiz tarafından tescillenmiştir.',
      legalNote: 'Statutory Body: Law No. 6698 / EU Regulation 2016/679',
      qrTarget: 'https://odelink.shop/verify/privacy'
    },
    {
      id: 'ODL-TRUST-DS-26',
      title: 'Dijital Güven ve Satıcı Güvenilirliği',
      subtitle: 'Global Merchant Reliability & Trust Seal',
      issuer: 'Ödelink International Strategic Board',
      entity: 'Ödelink Digital Infrastructure',
      ref: 'TRUST-ODL-552',
      period: 'Active Member',
      stamp: 'Reliability Verified',
      desc: 'Ödelink International, dijital ticaret ekosisteminde şeffaflık, güvenilirlik ve kullanıcı odaklı hizmet standartlarını benimsemiştir. Platformumuzun işleyişi ve teknolojik altyapısı, global güven protokollerine uygun olarak optimize edilmiştir.',
      legalNote: 'Verified via Ödelink Strategic Merchant Protection Program',
      qrTarget: 'https://odelink.shop/verify/trust-seal'
    }
  ];

  const A4Certificate = ({ cert, scale = 1, isModal = false }) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${cert.qrTarget}`;
    
    return (
      <div 
        id={`doc-${cert.id}`} 
        className={`bg-white text-[#0A0A0A] shadow-2xl mx-auto overflow-hidden relative border border-black/10 transition-all duration-700 ${!isModal ? 'group-hover:shadow-[0_0_80px_rgba(255,255,255,0.05)]' : ''}`}
        style={{ 
          width: '100%', 
          aspectRatio: '1/1.414',
          transformOrigin: 'top center'
        }}
      >
        {/* Professional Frame */}
        <div className="absolute inset-4 border-[0.5px] border-black/10" />
        <div className="absolute inset-8 border-[2px] border-black pb-1 mb-1" />
        <div className="absolute inset-[34px] border-[0.5px] border-black/20" />

        <div className="relative z-10 p-12 md:p-20 flex flex-col h-full font-serif">
          {/* Top Header */}
          <div className="flex justify-between items-start border-b-[2px] border-black pb-10 mb-12">
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">Ödelink</h1>
              <p className="text-[9px] font-sans font-bold uppercase tracking-[0.4em] text-black/50">International Ltd.</p>
            </div>
            <div className="text-right font-sans text-[9px] space-y-1">
              <div className="bg-black text-white px-4 py-1.5 font-black mb-2 inline-block tracking-widest">OFFICIAL DOCUMENT</div>
              <p className="font-bold text-black/40 uppercase tracking-widest">DOC ID: <span className="text-black font-black">{cert.id}</span></p>
              <p className="font-bold text-black/40 uppercase tracking-widest">REF: <span className="text-black font-black">{cert.ref}</span></p>
            </div>
          </div>

          {/* Certificate Title */}
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-black tracking-tight uppercase italic mb-4">Sertifika Tasdiki</h2>
            <div className="w-48 h-[1px] bg-black/10 mx-auto" />
            <p className="text-[10px] font-sans font-black text-black/30 tracking-[0.3em] uppercase">Ödelink International Global Compliance Registry</p>
          </div>

          {/* Content Body */}
          <div className="space-y-10 flex-1">
            <div className="space-y-2">
              <label className="text-[9px] font-sans font-black text-black/20 uppercase tracking-[0.3em]">Belge Türü / Protocol</label>
              <h3 className="text-2xl font-black border-b border-black/5 pb-3 uppercase tracking-tight leading-tight">{cert.title}</h3>
              <p className="text-[11px] italic text-black/40 font-medium font-sans uppercase tracking-wider">{cert.subtitle}</p>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-sans font-black text-black/20 uppercase tracking-[0.3em]">Onaylayan Makam / Authority</label>
              <h3 className="text-2xl font-black border-b border-black/5 pb-3 uppercase tracking-tight">{cert.issuer}</h3>
            </div>

            <div className="bg-black/[0.02] p-8 border-l-[6px] border-black relative">
              <p className="text-[14px] leading-relaxed text-justify font-serif text-black/80 italic">
                {cert.desc}
              </p>
              <div className="mt-8 pt-6 border-t border-black/10">
                <p className="text-[9px] font-sans font-bold text-black/40 uppercase tracking-[0.2em]">
                  Yasal Dayanak: {cert.legalNote}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Area */}
          <div className="mt-auto pt-12 flex justify-between items-end border-t-[1px] border-black/10">
            <div className="flex gap-8 items-end">
              <div className="bg-white p-2 border border-black/5 shadow-sm">
                <img src={qrUrl} alt="Verification" className="w-20 h-20" />
                <p className="text-[7px] font-sans font-black text-center mt-2 text-black/40 tracking-widest">DİJİTAL DOĞRULAMA</p>
              </div>
              <div className="space-y-1 pb-1">
                <p className="text-[8px] font-sans font-bold text-black/20 uppercase tracking-[0.2em]">Geçerlilik Süresi</p>
                <p className="text-[12px] font-black uppercase tracking-widest">{cert.period}</p>
              </div>
            </div>

            <div className="text-center relative">
              {/* Official Seal Style Overlay */}
              <div className="absolute -top-20 -left-12 w-32 h-32 rounded-full border-[1.5px] border-black border-double flex items-center justify-center rotate-[-12deg] opacity-20 pointer-events-none">
                <div className="text-center font-sans">
                  <p className="text-[7px] font-black uppercase">ÖDELINK INTL</p>
                  <p className="text-[10px] font-black uppercase my-1 tracking-[0.2em] border-y border-black">CERTIFIED</p>
                  <p className="text-[7px] font-black uppercase">COMPLIANCE 2026</p>
                </div>
              </div>
              
              <div className="pt-8">
                 <div className="font-serif italic text-3xl mb-1 opacity-90 text-black/90">
                   Ödelink International
                 </div>
                <div className="w-56 h-[1.5px] bg-black mb-2" />
                <p className="text-[9px] font-sans font-black uppercase tracking-[0.3em]">Hukuk ve Uyum Birimi</p>
                <p className="text-[8px] font-sans text-black/30 uppercase tracking-[0.1em] mt-1">Ödelink International Global HQ</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black font-sans overflow-x-hidden">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100%] h-[50%] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03)_0%,transparent_80%)]" />
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-blue-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="relative pt-32 pb-48 px-4 sm:px-12 max-w-[1400px] mx-auto z-10">
        
        {/* Page Header */}
        <div className="mb-32 text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
          >
            <Award size={16} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Ödelink International Official Archive</span>
          </motion.div>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="max-w-3xl">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter mb-8 italic uppercase leading-[0.9]"
              >
                Sertifika <br/> <span className="text-blue-600">Arşivimiz</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="text-lg sm:text-xl text-gray-500 max-w-2xl leading-relaxed font-medium tracking-wide italic"
              >
                Ödelink International platformunun küresel güvenilirliğini, veri güvenliği mimarisini ve yasal uyumluluğunu belgeleyen resmi dijital sertifikalar.
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
              className="hidden lg:flex flex-col items-end text-right"
            >
              <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-blue-500 mb-6 shadow-2xl">
                <Fingerprint size={40} strokeWidth={1.5} />
              </div>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-relaxed">
                TÜM BELGELER <br/> KRİPTOGRAFİK OLARAK <br/> DOĞRULANABİLİRDİR
              </p>
            </motion.div>
          </div>
        </div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {certificates.map((cert, i) => (
            <motion.div 
              key={cert.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-6 lg:p-10 transition-all duration-500 hover:bg-white/[0.04] hover:border-white/10 relative overflow-hidden h-full flex flex-col">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-12">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                        <QrCode size={24} />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest block mb-1">{cert.id}</span>
                        <h3 className="text-xl lg:text-2xl font-black text-white leading-tight uppercase italic">{cert.title}</h3>
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col items-end">
                       <CheckCircle2 className="text-blue-500 mb-1" size={20} />
                       <span className="text-[8px] font-black text-blue-500/50 uppercase tracking-widest">VERIFIED</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 leading-relaxed mb-12 font-medium">
                    {cert.desc}
                  </p>

                  <div className="mt-auto grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setSelectedCert(cert)}
                      className="h-14 bg-white text-black text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 rounded-xl hover:bg-gray-200 transition-all active:scale-95"
                    >
                      <Maximize2 size={16} /> GÖRÜNTÜLE
                    </button>
                    <button 
                      className="h-14 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 rounded-xl hover:bg-white/10 transition-all"
                    >
                      <Download size={16} /> İNDİR (A4)
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Footer */}
        <div className="mt-48 pt-24 border-t border-white/5">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-12 mb-16 opacity-30 grayscale hover:grayscale-0 transition-all duration-1000">
               <ShieldCheck size={48} strokeWidth={1} />
               <Building2 size={48} strokeWidth={1} />
               <Lock size={48} strokeWidth={1} />
               <Globe size={48} strokeWidth={1} />
            </div>
            <p className="text-sm sm:text-base text-gray-600 max-w-3xl leading-relaxed font-medium italic">
              Ödelink International yasal belgeleri dijital kriptografik imzalarla korunmaktadır. Her belge üzerindeki QR kod, ilgili sertifikanın orijinalliğini Ödelink Global Compliance ana sunucuları üzerinden gerçek zamanlı olarak doğrular.
            </p>
          </div>
        </div>
      </div>

      {/* Modal View */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-12"
          >
            <button 
              onClick={() => setSelectedCert(null)}
              className="absolute top-6 right-6 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all z-50 active:scale-95"
            >
              <X size={24} strokeWidth={3} />
            </button>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="w-full max-w-4xl shadow-[0_0_100px_rgba(255,255,255,0.05)] overflow-y-auto max-h-[90vh] rounded-sm"
            >
              <A4Certificate cert={selectedCert} isModal={true} />
              
              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6 pb-12">
                <button className="h-16 px-12 bg-white text-black text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-gray-200 transition-all rounded-2xl shadow-2xl">
                  <FileText size={20} /> BELGEYİ YAZDIR (PDF)
                </button>
                <button className="h-16 px-12 bg-white/10 border border-white/20 text-white text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-white/20 transition-all rounded-2xl">
                  <Download size={20} /> DİJİTAL ASLINI İNDİR
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&display=swap');
        
        /* Modal Scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default CertificatesPage;
