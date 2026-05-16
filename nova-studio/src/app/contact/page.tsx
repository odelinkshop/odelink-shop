"use client";

import React from 'react';
import InfoPage from '@/components/layout/info-page-template';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useStoreData } from '@/store/useStoreData';

export default function ContactPage() {
  const { settings } = useStoreData();
  const contact = settings?.contact_info || {};
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <InfoPage 
      title="İletişim" 
      subtitle="BİZE ULAŞIN" 
      content={
        <div className="space-y-16">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h2 className="text-3xl font-serif">Yardım etmeye hazırız.</h2>
              <p className="text-white/60">
                Sorularınız, iş birliği teklifleriniz veya sadece merhaba demek için bize her zaman ulaşabilirsiniz. Ekibimiz en kısa sürede size dönüş yapacaktır.
              </p>
              
              <div className="space-y-6 pt-8">
                <div className="flex items-center space-x-4 group">
                  <div className="p-3 bg-white/5 rounded-full group-hover:bg-accent/20 transition-colors">
                    <Mail className="w-5 h-5 text-accent" strokeWidth={1} />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 tracking-widest uppercase">E-POSTA</p>
                    <p className="text-lg">{contact.email || "info@gmail.com"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 group">
                  <div className="p-3 bg-white/5 rounded-full group-hover:bg-accent/20 transition-colors">
                    <Phone className="w-5 h-5 text-accent" strokeWidth={1} />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 tracking-widest uppercase">TELEFON</p>
                    <p className="text-lg">{contact.phone || "+90 000 000 00 00"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 p-10 rounded-sm space-y-8">
              <div className="flex items-start space-x-4">
                <MapPin className="w-5 h-5 text-accent mt-1" strokeWidth={1} />
                <div>
                  <h4 className="text-white font-serif mb-2">Adres</h4>
                  <p className="text-sm text-white/50 leading-relaxed uppercase">
                    {contact.address || "İSTANBUL / TÜRKİYE"}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Clock className="w-5 h-5 text-accent mt-1" strokeWidth={1} />
                <div>
                  <h4 className="text-white font-serif mb-2">Çalışma Saatleri</h4>
                  <div className="text-sm text-white/50 leading-relaxed whitespace-pre-line">
                    {contact.working_hours || "Pazartesi - Cuma: 09:00 - 18:00\nCumartesi: 10:00 - 14:00"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      } 
    />
  );
}
