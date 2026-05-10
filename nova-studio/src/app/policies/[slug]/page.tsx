"use client";

import React from 'react';
import InfoPage from '@/components/layout/info-page-template';
import { useParams } from 'next/navigation';

export default function PolicySlugPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const policies: Record<string, { title: string; subtitle: string; content: React.ReactNode }> = {
    terms: {
      title: "Kullanım Koşulları",
      subtitle: "YASAL SÖZLEŞMELER",
      content: (
        <div className="space-y-12">
          <section className="space-y-6">
            <h2 className="text-2xl font-serif">1. Hizmet Şartları</h2>
            <p>
              Bu internet sitesine girmeniz veya bu internet sitesindeki herhangi bir bilgiyi kullanmanız aşağıdaki koşulları kabul ettiğiniz anlamına gelir.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-serif">2. Sorumluluk Sınırları</h2>
            <p>
              [MAĞAZA İSMİ], sözleşmenin ihlali, haksız fiil, ihmal veya diğer sebepler neticesinde; işlemin kesintiye uğraması, hata, ihmal, kesinti hususunda herhangi bir sorumluluk kabul etmez.
            </p>
          </section>

          <div className="bg-accent/10 border-l-2 border-accent p-8 italic text-white/80">
            "Buraya mağazanız için geçerli olan tüm yasal kullanım şartlarını detaylıca ekleyin. Shopier üzerindeki standart sözleşmelerinizi buraya kopyalayabilirsiniz."
          </div>

          <section className="space-y-6">
            <h2 className="text-2xl font-serif">3. Fikri Mülkiyet</h2>
            <p>
              Bu internet sitesinde bulunan tüm içerikler; metinler, görseller, logolar ve tasarımlar [MAĞAZA İSMİ]'ne aittir ve izinsiz kullanılamaz.
            </p>
          </section>
        </div>
      )
    },
    privacy: {
      title: "Gizlilik Politikası",
      subtitle: "VERİ GÜVENLİĞİ",
      content: (
        <div className="space-y-12">
          <section className="space-y-6 text-center">
            <div className="inline-block p-4 rounded-full bg-accent/10 mb-6">
              <svg className="w-12 h-12 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <p className="max-w-2xl mx-auto">Verileriniz bizimle güvende. [MAĞAZA İSMİ] olarak gizliliğinize en az sizin kadar önem veriyoruz.</p>
          </section>

          <section className="grid md:grid-cols-2 gap-8 border-t border-white/10 pt-12">
            <div className="space-y-4">
              <h3 className="text-xl font-serif text-accent">Neleri Topluyoruz?</h3>
              <p className="text-sm">İsim, soyisim, e-posta ve teslimat adresi gibi temel alışveriş bilgilerini topluyoruz.</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-serif text-accent">Nasıl Kullanıyoruz?</h3>
              <p className="text-sm">Sadece siparişlerinizin teslimatı ve size daha iyi hizmet verebilmek için kullanıyoruz.</p>
            </div>
          </section>

          <div className="bg-white/5 border border-white/10 p-8 rounded-sm italic">
            "Buraya KVKK ve Gizlilik politikanızın detaylarını ekleyin. Müşterileriniz verilerinin nasıl işlendiğini bilmek ister."
          </div>
        </div>
      )
    }
  };

  const policy = policies[slug] || {
    title: "Yasal Sözleşme",
    subtitle: "BİLGİ MERKEZİ",
    content: (
      <div className="text-center space-y-8">
        <p>İlgili politika içeriği hazırlanmaktadır.</p>
        <div className="bg-accent/10 p-8 italic border border-accent/20">
          "Bu bölüm henüz doldurulmamış. Lütfen Shopier üzerindeki sözleşmelerinizi buraya ekleyin."
        </div>
      </div>
    )
  };

  return <InfoPage title={policy.title} subtitle={policy.subtitle} content={policy.content} />;
}
