import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Award, 
  Lock, 
  CheckCircle2, 
  ExternalLink, 
  FileCheck, 
  Globe, 
  Zap,
  Building2,
  BadgeCheck
} from 'lucide-react';

const CertificatesPage = () => {
  const certificates = [
    {
      id: 'SSL-2024-001',
      title: 'SSL Secure Connection',
      issuer: 'GlobalSign High Assurance CA',
      date: '2024 - 2025',
      type: 'Security',
      icon: <Lock className="text-[#C5A059]" size={32} />,
      status: 'Active',
      description: '256-bit uçtan uca şifreleme ve kimlik doğrulama protokolü ile tüm veri trafiği siber zırh altındadır.'
    },
    {
      id: 'PCI-DSS-v4',
      title: 'PCI-DSS Compliance',
      issuer: 'Payment Card Industry Security',
      date: 'Valid through 2026',
      type: 'Financial',
      icon: <ShieldCheck className="text-[#C5A059]" size={32} />,
      status: 'Verified',
      description: 'Kredi kartı verileri ve ödeme işlemleri uluslararası PCI Veri Güvenliği Standartları ile korunmaktadır.'
    },
    {
      id: 'ISO-27001',
      title: 'ISO/IEC 27001',
      issuer: 'Information Security Management',
      date: 'Annual Audit Completed',
      type: 'Infrastructure',
      icon: <Building2 className="text-[#C5A059]" size={32} />,
      status: 'Certified',
      description: 'Bilgi güvenliği yönetim sistemi standartlarına tam uyumluluk ve periyodik risk analizi onayı.'
    },
    {
      id: 'KVKK-2026',
      title: 'KVKK Compliance',
      issuer: 'Personal Data Protection Authority',
      date: 'Full Compliance',
      type: 'Legal',
      icon: <FileCheck className="text-[#C5A059]" size={32} />,
      status: 'Compliant',
      description: '6698 Sayılı Kişisel Verilerin Korunması Kanunu kapsamında tam uyumluluk ve veri gizliliği zırhı.'
    },
    {
      id: 'SHOPIER-TRUST',
      title: 'Shopier Integrated Partner',
      issuer: 'Shopier Infrastructure Seal',
      date: 'Continuous Integration',
      type: 'Operational',
      icon: <Zap className="text-[#C5A059]" size={32} />,
      status: 'Trusted',
      description: 'Shopier ödeme altyapısı ile %100 entegre ve güvenli ödeme kanalları onay mühürü.'
    },
    {
      id: 'ELITE-CLOUD',
      title: 'Tier IV Data Center',
      issuer: 'Infrastructure Excellence',
      date: '2024 Service Agreement',
      type: 'Performance',
      icon: <Globe className="text-[#C5A059]" size={32} />,
      status: 'Premium',
      description: '%99.9 uptime garantisi ve yüksek performanslı sunucu altyapısı sertifikası.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER SECTION */}
        <div className="text-center mb-24 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 bg-[#C5A059]/10 border border-[#C5A059]/20 px-6 py-2 rounded-full"
          >
            <BadgeCheck size={16} className="text-[#C5A059]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C5A059]">Digital Trust Protocol</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-7xl font-serif text-[#F2EBE1] tracking-tighter"
          >
            Sertifikalar ve Güvenlik
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[#F2EBE1]/40 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Ödelink, kurumsal güvenliği ve veri gizliliğini en üst düzeyde tutmak için uluslararası standartlara uyum sağlamaktadır. Dijital sertifikalarımızı aşağıdan inceleyebilirsiniz.
          </motion.p>
        </div>

        {/* CERTIFICATES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {certificates.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white/[0.02] border border-white/5 p-10 hover:border-[#C5A059]/30 transition-all duration-700 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Award size={80} />
              </div>

              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 bg-black border border-white/10 flex items-center justify-center group-hover:border-[#C5A059]/50 transition-colors">
                    {cert.icon}
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] font-black uppercase tracking-widest text-[#C5A059] mb-1">ID: {cert.id}</span>
                    <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">{cert.status}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-serif text-[#F2EBE1] tracking-tight">{cert.title}</h3>
                  <p className="text-[11px] text-white/30 uppercase tracking-[0.2em] font-black italic">{cert.issuer}</p>
                </div>

                <p className="text-sm text-[#F2EBE1]/50 leading-relaxed min-h-[60px]">
                  {cert.description}
                </p>

                <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Validity</span>
                    <span className="text-[10px] font-bold text-white/60 tracking-wider uppercase">{cert.date}</span>
                  </div>
                  <button className="flex items-center gap-3 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-[#C5A059] hover:text-black transition-all">
                    <span>Doğrula</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* BOTTOM SEAL */}
        <div className="mt-32 pt-20 border-t border-white/5 flex flex-col items-center space-y-10">
          <div className="flex flex-wrap justify-center gap-16 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
             <div className="flex items-center gap-4">
                <ShieldCheck size={24} />
                <span className="text-xs font-black uppercase tracking-[0.3em]">AES-256 Bit Secure</span>
             </div>
             <div className="flex items-center gap-4">
                <Building2 size={24} />
                <span className="text-xs font-black uppercase tracking-[0.3em]">GDPR Compliant</span>
             </div>
             <div className="flex items-center gap-4">
                <Globe size={24} />
                <span className="text-xs font-black uppercase tracking-[0.3em]">Cloud Security Alliance</span>
             </div>
          </div>
          <p className="text-[9px] text-[#F2EBE1]/20 font-bold uppercase tracking-[0.5em] text-center max-w-2xl leading-relaxed">
            Tüm sertifikalar dijital olarak imzalanmış ve üçüncü taraf otorite sağlayıcıları tarafından doğrulanmıştır. Ödelink güvenlik protokolleri periyodik olarak sızma testlerinden geçirilmektedir.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CertificatesPage;
