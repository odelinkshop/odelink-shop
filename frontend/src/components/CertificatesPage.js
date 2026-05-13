import React from 'react';
import { motion } from 'framer-motion';
import { 
  Printer, 
  Download, 
  Shield, 
  ChevronDown,
  Building2,
  Lock,
  Globe
} from 'lucide-react';

const CertificatesPage = () => {
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
      desc: 'Bu döküman, Odelink platformu üzerindeki tüm veri trafiğinin TLS 1.3 protokolü ve AES-256 bit şifreleme standartları ile uçtan uca korunduğunu, kullanıcı verilerinin transfer sırasında üçüncü taraflarca erişilemez olduğunu tasdik eder.',
      legalNote: 'Compliance: Transport Layer Security v1.3 Standards',
      stampColor: 'blue'
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
      desc: 'Odelink, ödeme işlemlerini PCI-DSS v4.0 uyumlu Shopier altyapısı üzerinden gerçekleştirmektedir. Bu belge, ödeme sırasında kart verilerinin hiçbir şekilde Odelink sunucularında tutulmadığını ve Shopier güvencesiyle işlendiğini beyan eder.',
      legalNote: 'Integration Framework: Shopier Secure API v2.0',
      stampColor: 'gold'
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
      desc: '6698 Sayılı Kişisel Verilerin Korunması Kanunu kapsamında, kullanıcı verilerinin işlenmesi, saklanması ve imha edilmesi süreçlerinin yasal mevzuata tam uyumlu olduğunu ve veri gizliliğinin kurumsal güvence altında olduğunu bildiren resmi beyandır.',
      legalNote: 'Regulatory Act: Republic of Turkey Law No. 6698',
      stampColor: 'blue'
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
      desc: 'Odelink dijital vitrin sistemlerinin barındırıldığı sunucu altyapısının %99.9 uptime garantisine sahip olduğu, verilerin periyodik olarak yedeklendiği ve siber saldırılara karşı çok katmanlı güvenlik duvarları (WAF) ile korunduğunu tasdik eder.',
      legalNote: 'Infrastructure Standard: Tier III Data Center Standards',
      stampColor: 'red'
    }
  ];

  const handlePrint = (id) => {
    const printContent = document.getElementById(`doc-${id}`);
    const WinPrint = window.open('', '', 'width=900,height=1200');
    WinPrint.document.write('<html><head><title>Ödelink Official Document</title>');
    WinPrint.document.write('<style>body { margin: 0; padding: 0; }</style>');
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

  const DocumentComponent = ({ cert }) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://www.odelink.shop/certificates/${cert.id}`;
    
    return (
      <div id={`doc-${cert.id}`} className="relative bg-white text-black shadow-[0_0_50px_rgba(0,0,0,0.1)] mx-auto overflow-hidden w-full aspect-[1/1.414]" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        {/* REFINED BORDER */}
        <div className="absolute inset-8 border border-gray-100" />
        <div className="absolute inset-[34px] border-[2px] border-gray-900/10" />

        {/* WATERMARK */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none -rotate-45">
          <span className="text-[10rem] font-serif font-black tracking-tighter">ODELINK</span>
        </div>

        {/* CONTENT */}
        <div className="relative z-10 px-16 py-20 flex flex-col h-full">
          {/* HEADER */}
          <div className="flex justify-between items-start border-b-2 border-gray-900 pb-8 mb-16">
            <div>
              <h1 className="text-xl font-bold tracking-widest uppercase">ÖDELINK</h1>
              <p className="text-[9px] uppercase tracking-[0.4em] text-gray-500 font-sans font-black mt-2">Official Infrastructure & Compliance</p>
            </div>
            <div className="text-right font-sans text-[9px] space-y-1">
              <p className="font-bold text-gray-400 uppercase">Document ID</p>
              <p className="font-black text-gray-900">{cert.id}</p>
              <p className="font-bold text-gray-400 mt-4 uppercase">Reference</p>
              <p className="font-black text-gray-900">{cert.ref}</p>
            </div>
          </div>

          {/* MAIN TITLE */}
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-3xl font-bold tracking-tight uppercase">CERTIFICATE OF COMPLIANCE</h2>
            <div className="w-32 h-[1px] bg-gray-300 mx-auto" />
          </div>

          {/* FIELDS */}
          <div className="space-y-10 mb-auto">
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-sans font-black text-gray-300 uppercase tracking-[0.3em]">Certification Subject</span>
              <span className="text-xl font-bold border-b border-gray-100 pb-1">{cert.title}</span>
              <span className="text-[10px] italic text-gray-400">{cert.subtitle}</span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-sans font-black text-gray-300 uppercase tracking-[0.3em]">Certified Entity</span>
              <span className="text-xl font-bold border-b border-gray-100 pb-1">{cert.entity}</span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-sans font-black text-gray-300 uppercase tracking-[0.3em]">Issuing Authority</span>
              <span className="text-lg font-bold italic">{cert.issuer}</span>
            </div>

            <div className="mt-12 bg-gray-50/50 p-6 border-l-4 border-gray-900">
               <p className="text-sm text-gray-800 leading-relaxed text-justify first-letter:text-3xl first-letter:font-bold first-letter:mr-2">
                 {cert.desc} Bu döküman, belirtilen altyapı standartlarına tam uyumluluğu ve periyodik denetim süreçlerini resmi olarak temsil etmektedir.
               </p>
               <p className="text-[9px] font-sans font-black text-gray-400 uppercase tracking-widest mt-6">
                 Legal Code: {cert.legalNote}
               </p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-between items-end mt-16">
            <div className="space-y-4">
               <img src={qrUrl} alt="QR Verification" className="w-20 h-20 p-1 bg-white border border-gray-100" />
               <div className="space-y-1">
                 <p className="text-[8px] font-sans font-black text-gray-300 uppercase tracking-widest">Validity Period</p>
                 <p className="text-[10px] font-bold text-gray-900 uppercase">{cert.period}</p>
               </div>
            </div>

            <div className="relative text-center">
              {/* STAMP */}
              <div className={`absolute -top-24 -left-16 w-32 h-32 rounded-full border-4 flex items-center justify-center opacity-70 rotate-[-15deg] select-none
                ${cert.stampColor === 'blue' ? 'border-blue-800 text-blue-800' : 
                  cert.stampColor === 'gold' ? 'border-[#C5A059] text-[#C5A059]' : 
                  'border-red-800 text-red-800'}`}>
                <div className="text-center">
                  <p className="text-[8px] font-black uppercase tracking-tighter">OFFICIAL SEAL</p>
                  <p className="text-[10px] font-black uppercase leading-none my-1 tracking-widest">VERIFIED</p>
                  <p className="text-[8px] font-black uppercase tracking-tighter">SYSTEMS 2024</p>
                </div>
              </div>

              <div className="space-y-1">
                 <div className="h-12 flex items-end justify-center mb-2">
                    <span className="font-serif italic text-3xl opacity-80" style={{ fontFamily: '"Great Vibes", cursive' }}>
                      M. Bayram
                    </span>
                 </div>
                 <div className="w-40 h-[1px] bg-gray-900 mx-auto" />
                 <p className="text-[9px] font-sans font-black uppercase tracking-[0.2em] text-gray-800">Board Director</p>
                 <p className="text-[7px] font-sans text-gray-400 uppercase tracking-widest">Verification Division</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-40 px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-32 space-y-8">
           <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2 rounded-full">
              <Shield size={16} className="text-[#C5A059]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C5A059]">Security & Trust Protocol</span>
           </div>
           <h1 className="text-6xl md:text-8xl font-serif text-[#F2EBE1] tracking-tighter leading-none italic">Resmi Belgeler</h1>
           <p className="text-[#F2EBE1]/40 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
             Ödelink altyapısının güvenilirliğini ve yasal uyumluluğunu belgeleyen tüm resmi evraklar aşağıda doğrudan sunulmaktadır.
           </p>
           <ChevronDown size={32} className="mx-auto text-white/10 animate-bounce mt-10" />
        </div>

        {/* DIRECT VIEW GRID/LIST */}
        <div className="space-y-32">
          {certificates.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative group"
            >
              {/* ACTIONS TOOLBAR */}
              <div className="absolute -top-12 right-0 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <button 
                  onClick={() => handlePrint(cert.id)}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                 >
                   <Printer size={14} />
                   <span>Yazdır / PDF</span>
                 </button>
              </div>

              {/* DOCUMENT BOX */}
              <div className="relative">
                {/* DECORATIVE STACK EFFECT */}
                <div className="absolute inset-0 bg-white/5 translate-x-3 translate-y-3" />
                <div className="absolute inset-0 bg-white/5 translate-x-1.5 translate-y-1.5" />
                
                <div className="relative border border-white/10 p-1 bg-[#111]">
                   <DocumentComponent cert={cert} />
                </div>
              </div>

              {/* CAPTION */}
              <div className="mt-10 flex justify-between items-end border-b border-white/5 pb-6">
                 <div className="space-y-2">
                    <h3 className="text-3xl font-serif italic text-white/90">{cert.title}</h3>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">ID: {cert.id} • REF: {cert.ref}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Validity</p>
                    <p className="text-sm font-bold text-[#C5A059] uppercase tracking-tighter">{cert.period}</p>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FINAL SEAL */}
        <div className="mt-40 pt-20 border-t border-white/5 text-center">
           <div className="flex justify-center gap-16 mb-12 opacity-20 grayscale hover:grayscale-0 transition-all duration-700">
              <Building2 size={32} />
              <Lock size={32} />
              <Globe size={32} />
           </div>
           <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.5em] leading-relaxed max-w-2xl mx-auto">
             Tüm belgeler Ödelink Technologies veri tabanında dijital olarak mühürlenmiş olup, döküman üzerindeki QR kodlar aracılığıyla doğrulanabilir durumdadır.
           </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        @media print {
          body * { visibility: hidden; }
          #printable-document, #printable-document * { visibility: visible; }
          #printable-document { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default CertificatesPage;
