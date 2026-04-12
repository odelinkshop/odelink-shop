import React from 'react';
import { useNavigate } from 'react-router-dom';
import LegalPageLayout from './LegalPageLayout';

const TermsPage = () => {
  const navigate = useNavigate();
  return (
    <LegalPageLayout title="Kullanım Şartları">
      <p>
        Bu kullanım şartları, Ödelink web uygulamasının kullanımına ilişkin genel kuralları açıklar.
        Ödelink; kullanıcıların Shopier üzerinde bulunan mağaza/ürün bağlantılarını kullanarak kendi vitrin sayfalarını oluşturmasına yardımcı olan bir yazılım hizmetidir.
      </p>

      <p>
        Yürürlük tarihi: 06.02.2026
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Hizmetin Kapsamı</h2>
      <p>
        Ödelink, kullanıcıların hesap açması ve uygulama üzerinden site oluşturması için araçlar sunar.
        Ödeme, sipariş, iade ve teslimat gibi ticari süreçler ilgili satıcı ve Shopier altyapısı üzerinden yürütülür.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Hesap ve Erişim</h2>
      <p>
        Hesap oluştururken doğru ve güncel bilgi vermeniz beklenir.
        Hesabınız üzerinden yapılan işlemlerden ve hesap güvenliğinizden siz sorumlusunuz.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Üçüncü Taraf Hizmetleri</h2>
      <p>
        Shopier; Ödelink tarafından işletilmeyen bağımsız bir üçüncü taraf platformdur.
        Ödelink ile Shopier arasında resmi bir ortaklık, temsilcilik veya yetkili satıcılık ilişkisi bulunmamaktadır.
        Kullanıcı, Shopier üzerinde gerçekleştirdiği işlemlerden ve üçüncü taraf şartlarından kendisi sorumludur.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Kullanıcı Sorumlulukları</h2>
      <p>
        Kullanıcı, sağladığı bağlantıların ve içeriklerin hukuka uygun olmasından, fikri mülkiyet haklarını ihlal etmemesinden ve gerekli izinlere sahip olmasından sorumludur.
        Kullanıcı, hesap güvenliğini sağlamakla yükümlüdür.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Yasaklı Kullanım</h2>
      <p>
        Hizmeti; hukuka aykırı içerik barındırmak, aldatıcı/yanıltıcı yönlendirme yapmak, kötüye kullanım veya güvenlik testleriyle sistemi zedelemek amacıyla kullanamazsınız.
        Bu tür kullanımlar tespit edildiğinde erişim kısıtlanabilir.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Sorumluluğun Sınırlandırılması</h2>
      <p>
        Ödelink, hizmetin kesintisiz veya hatasız olacağını garanti etmez.
        Üçüncü taraf servislerden kaynaklanan kesintiler, değişiklikler veya erişim kısıtlamaları nedeniyle oluşabilecek zararlardan sorumluluk kabul edilmez.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Hizmet Değişiklikleri</h2>
      <p>
        Uygulama özellikleri zamanla güncellenebilir veya değiştirilebilir.
        Gerekli görülen durumlarda bakım çalışmaları yapılabilir.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Değişiklikler</h2>
      <p>
        Bu şartlar güncellenebilir. Güncellemeler yayınlandığı tarihten itibaren geçerlidir.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">İletişim</h2>
      <p>
        Bu şartlarla ilgili sorular için{' '}
        <button type="button" onClick={() => navigate('/contact')} className="text-red-600 font-semibold">
          İletişim
        </button>{' '}
        sayfasını kullanabilirsiniz.
      </p>
    </LegalPageLayout>
  );
};

export default TermsPage;
