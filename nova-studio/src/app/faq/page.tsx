"use client";

import InfoPage from '@/components/layout/info-page-template';

export default function FAQPage() {
  const faqs = [
    {
      q: "Siparişim ne zaman kargoya verilir?",
      a: "Siparişleriniz genellikle 1-3 iş günü içerisinde özenle paketlenerek kargoya teslim edilir. Kargo takip numaranız e-posta adresinize iletilecektir."
    },
    {
      q: "Ödememi nasıl yapabilirim?",
      a: "Tüm ödemeleriniz Shopier güvencesiyle 256bit SSL sertifikalı ödeme sayfası üzerinden kredi kartı veya banka kartı ile güvenle gerçekleştirebilirsiniz."
    },
    {
      q: "Yurtdışına gönderim yapıyor musunuz?",
      a: "Şu an için sadece Türkiye sınırları içerisine gönderim yapmaktayız. Gelecekte yurtdışı operasyonlarımız için bizi takip etmeye devam edin."
    }
  ];

  return (
    <InfoPage 
      title="Sıkça Sorulan Sorular" 
      subtitle="YARDIM MERKEZİ" 
      content={
        <div className="space-y-12">
          <div className="space-y-8">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-white/5 pb-8 space-y-4">
                <h3 className="text-xl font-serif text-white">{faq.q}</h3>
                <p className="text-secondary/60 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/5 p-8 rounded-sm border border-white/10 italic">
            <p className="text-accent text-xs font-black tracking-widest uppercase mb-4">EDİTÖR TAVSİYESİ:</p>
            "Buraya müşterilerinizden en çok gelen soruları ve cevaplarını ekleyin. İyi bir SSS sayfası, destek taleplerini %40 oranında azaltabilir."
          </div>
        </div>
      } 
    />
  );
}
