"use client";

import InfoPage from '@/components/layout/info-page-template';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
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
                    <p className="text-lg">info@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 group">
                  <div className="p-3 bg-white/5 rounded-full group-hover:bg-accent/20 transition-colors">
                    <Phone className="w-5 h-5 text-accent" strokeWidth={1} />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 tracking-widest uppercase">TELEFON</p>
                    <p className="text-lg">+90 000 000 00 00</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 p-10 rounded-sm space-y-8">
              <div className="flex items-start space-x-4">
                <MapPin className="w-5 h-5 text-accent mt-1" strokeWidth={1} />
                <div>
                  <h4 className="text-white font-serif mb-2">Merkez Ofis</h4>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Nişantaşı, Teşvikiye Cd. No:12<br />
                    Şişli / İstanbul
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Clock className="w-5 h-5 text-accent mt-1" strokeWidth={1} />
                <div>
                  <h4 className="text-white font-serif mb-2">Çalışma Saatleri</h4>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Pazartesi - Cuma: 09:00 - 18:00<br />
                    Cumartesi: 10:00 - 14:00
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      } 
    />
  );
}
