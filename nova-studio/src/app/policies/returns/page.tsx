"use client";

import InfoPage from '@/components/layout/info-page-template';

export default function ReturnsPage() {
  return (
    <InfoPage 
      title="İade ve İptal Koşulları" 
      subtitle="GÜVENLİ ALIŞVERİŞ" 
      content={
        <div className="space-y-8">
          <p>
            Müşteri memnuniyeti bizim için her şeyden önce gelir. Aldığınız ürün beklentilerinizi karşılamıyorsa, aşağıdaki koşullar çerçevesinde iade veya değişim yapabilirsiniz.
          </p>
          
          <div className="space-y-6">
            <h3 className="text-xl font-serif">1. İade Süreci</h3>
            <p>
              Ürününüzü teslim aldığınız tarihten itibaren 14 gün içerisinde iade etme hakkına sahipsiniz. İade edilecek ürünün kullanılmamış, etiketleri sökülmemiş ve orijinal ambalajında olması gerekmektedir.
            </p>
          </div>

          <div className="bg-white/5 p-8 rounded-sm border border-white/10 italic">
            <p className="text-accent text-xs font-black tracking-widest uppercase mb-4">ÖNEMLİ HATIRLATMA:</p>
            "Buraya Shopier üzerindeki iade politikanızı veya kendi özel şartlarınızı detaylıca ekleyin. Kargo ücreti kime ait, geri ödeme ne kadar sürede yapılır gibi bilgileri belirtmeniz güven oluşturur."
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-serif">2. Değişim Koşulları</h3>
            <p>
              Beden veya renk değişikliği yapmak isterseniz, stok durumuna bağlı olarak değişim sürecinizi başlatabiliriz. Lütfen destek ekibimizle iletişime geçin.
            </p>
          </div>

          <p className="text-sm opacity-50 uppercase tracking-widest">
            Tüm iade süreçleri Tüketiciyi Koruma Kanunu çerçevesinde yürütülmektedir.
          </p>
        </div>
      } 
    />
  );
}
