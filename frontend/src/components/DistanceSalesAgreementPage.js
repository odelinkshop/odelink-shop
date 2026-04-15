import React from 'react';
import { useNavigate } from 'react-router-dom';
import LegalPageLayout from './LegalPageLayout';

const DistanceSalesAgreementPage = () => {
  const navigate = useNavigate();
  return (
    <LegalPageLayout title="Mesafeli Satış Sözleşmesi">
      <p>
        Bu sözleşme, Ödelink platformu üzerinden sunulan dijital hizmetlerin mesafeli satışına ilişkin şartları düzenler.
        6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümlerine tabidir.
      </p>

      <p>
        Yürürlük tarihi: 15.04.2026
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. Taraflar</h2>
      <p>
        <strong>SATICI:</strong> Ödelink platformu işletmecisi
      </p>
      <p>
        <strong>ALICI:</strong> Ödelink abonelik planı satın alan kullanıcı
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. Sözleşme Konusu</h2>
      <p>
        Bu sözleşme, ALICI'nın SATICI'dan satın aldığı dijital hizmet (Ödelink abonelik planı) kapsamında tarafların hak ve yükümlülüklerini düzenler.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Hizmet Bilgileri</h2>
      <p>
        <strong>Hizmet Adı:</strong> Ödelink Abonelik Planı (Standart / Profesyonel)
      </p>
      <p>
        <strong>Hizmet Türü:</strong> Dijital hizmet - Web sitesi oluşturma ve yönetim platformu
      </p>
      <p>
        <strong>Süre:</strong> Aylık veya yıllık (seçilen plana göre)
      </p>
      <p>
        <strong>Fiyat:</strong> Seçilen plana göre değişkenlik gösterir. Güncel fiyatlar{' '}
        <button type="button" onClick={() => navigate('/plans')} className="text-red-600 font-semibold">
          Planlar
        </button>{' '}
        sayfasında belirtilmiştir.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. Ödeme Şekli</h2>
      <p>
        Ödemeler, Shopier e-ticaret platformu üzerinden güvenli ödeme altyapısı (PCI DSS uyumlu) kullanılarak gerçekleştirilir.
        Kredi kartı, banka kartı ve diğer ödeme yöntemleri ile tek çekim veya taksitli ödeme yapılabilir.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">5. Teslimat (Hizmet Sunumu)</h2>
      <p>
        Dijital hizmet niteliğinde olduğundan fiziksel teslimat söz konusu değildir.
        Ödeme onaylandıktan sonra, abonelik manuel olarak hesabınıza tanımlanır ve hizmet sunumu başlar.
        Aktivasyon süresi genellikle ödeme sonrası 24 saat içindedir.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">6. Cayma Hakkı</h2>
      <p>
        6502 sayılı Kanun'un 15. maddesi uyarınca, dijital içerik ve hizmetlerde cayma hakkı, hizmetin ifasına başlanması ile sona erer.
      </p>
      <p>
        Aboneliğiniz aktive edilmeden önce, satın alma tarihinden itibaren 14 gün içinde cayma hakkınızı kullanabilirsiniz.
        Cayma hakkı kullanımı için{' '}
        <button type="button" onClick={() => navigate('/contact')} className="text-red-600 font-semibold">
          İletişim
        </button>{' '}
        sayfası üzerinden talepte bulunabilirsiniz.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">7. ALICI'nın Hak ve Yükümlülükleri</h2>
      <p>
        ALICI, sözleşme konusu hizmeti kullanım şartlarına uygun olarak kullanmakla yükümlüdür.
        ALICI, ödeme bilgilerinin doğruluğundan sorumludur.
        ALICI, hizmeti hukuka aykırı amaçlarla kullanamaz.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">8. SATICI'nın Hak ve Yükümlülükleri</h2>
      <p>
        SATICI, sözleşme konusu hizmeti eksiksiz ve zamanında sunmakla yükümlüdür.
        SATICI, hizmet kalitesini korumak için gerekli teknik altyapıyı sağlar.
        SATICI, kullanıcı verilerinin güvenliğini sağlamakla yükümlüdür.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">9. Uyuşmazlık Çözümü</h2>
      <p>
        İşbu sözleşmeden doğabilecek uyuşmazlıklarda, Türkiye Cumhuriyeti yasaları uygulanır.
        Tüketici şikayetleri için T.C. Gümrük ve Ticaret Bakanlığı tarafından her yıl belirlenen parasal sınırlar dahilinde tüketicinin yerleşim yerindeki veya tüketici işleminin yapıldığı yerdeki Tüketici Hakem Heyetleri ile Tüketici Mahkemeleri yetkilidir.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">10. Yürürlük</h2>
      <p>
        ALICI, satın alma işlemini tamamlayarak işbu sözleşmenin tüm şartlarını kabul etmiş sayılır.
        Sözleşme, ödeme onayı ile yürürlüğe girer.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">İletişim</h2>
      <p>
        Sözleşme ile ilgili sorularınız için{' '}
        <button type="button" onClick={() => navigate('/contact')} className="text-red-600 font-semibold">
          İletişim
        </button>{' '}
        sayfasını kullanabilirsiniz.
      </p>
    </LegalPageLayout>
  );
};

export default DistanceSalesAgreementPage;
