import React from 'react';
import { useNavigate } from 'react-router-dom';
import LegalPageLayout from './LegalPageLayout';

const KvkkPage = () => {
  const navigate = useNavigate();
  return (
    <LegalPageLayout title="KVKK Aydınlatma Metni">
      <p>
        Bu metin, Ödelink uygulaması kapsamında kişisel verilerin işlenmesine ilişkin genel bilgilendirme sağlar.
        Ödelink; kullanıcı hesapları ve hizmetin işletilmesi için gerekli sınırlı verileri işler.
      </p>

      <p>
        Yürürlük tarihi: 06.02.2026
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Kişisel Veri Kategorileri</h2>
      <p>
        Kimlik ve iletişim bilgileri (ör. ad, e-posta), hesap ve kullanım kayıtları, oluşturulan sitelere ait ayarlar ve Shopier bağlantıları işlenebilir.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">İşleme Amaçları</h2>
      <p>
        Kimlik doğrulama, hesap yönetimi, site oluşturma, güvenlik, hata tespiti ve hizmet kalitesinin geliştirilmesi.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Hukuki Sebepler</h2>
      <p>
        Hizmetin ifası için gerekli olması, meşru menfaat, ve gerektiğinde açık rıza gibi hukuki sebepler çerçevesinde işleme yapılabilir.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Haklar</h2>
      <p>
        KVKK kapsamında; kişisel verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini isteme, silinmesini talep etme gibi haklarınız bulunabilir.
        Talepler için{' '}
        <button type="button" onClick={() => navigate('/contact')} className="text-red-600 font-semibold">
          İletişim
        </button>{' '}
        sayfasını kullanabilirsiniz.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Başvuru</h2>
      <p>
        Talepleriniz değerlendirildikten sonra, ilgili mevzuat çerçevesinde makul süre içinde yanıt verilir.
        Kimliğinizi doğrulamaya yönelik ek bilgi talep edilebilir.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Üçüncü Taraf</h2>
      <p>
        Shopier, Ödelink tarafından işletilmeyen bağımsız bir platformdur. Ödelink ile Shopier arasında resmi bir ortaklık bulunmamaktadır.
      </p>
    </LegalPageLayout>
  );
};

export default KvkkPage;
