import React from 'react';
import { useNavigate } from 'react-router-dom';
import LegalPageLayout from './LegalPageLayout';

const PrivacyPage = () => {
  const navigate = useNavigate();
  return (
    <LegalPageLayout title="Gizlilik Politikası" lastUpdated="21.04.2026">
      <section className="space-y-6">
        <p>
          Ödelink olarak, kullanıcılarımızın ("Siz") gizliliğine büyük önem veriyoruz. İşbu Gizlilik Politikası, Platformumuzu kullanırken hangi kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklamaktadır.
        </p>

        <h2>1. Toplanan Veriler</h2>
        <p>
          Hizmet sunumu kapsamında aşağıdaki veriler işlenmektedir:
        </p>
        <ul>
          <li><strong>Hesap Bilgileri:</strong> Google (Gmail) üzerinden giriş yapıldığında alınan ad, soyad ve e-posta adresi.</li>
          <li><strong>Mağaza Bilgileri:</strong> Shopier mağaza linkiniz, ürün adları, açıklamalar ve fiyatlar gibi halka açık mağaza verileri.</li>
          <li><strong>Teknik Veriler:</strong> IP adresi, tarayıcı tipi, işletim sistemi ve Platform üzerindeki kullanım istatistikleriniz.</li>
          <li><strong>İletişim Kayıtları:</strong> Destek talepleriniz sırasında paylaştığınız mesajlar ve bilgiler.</li>
        </ul>

        <h2>2. Veri İşleme Amaçları</h2>
        <p>
          Toplanan kişisel verileriniz şu amaçlarla kullanılır:
        </p>
        <ul>
          <li>Hesabınızın oluşturulması ve kimlik doğrulama süreçlerinin yürütülmesi.</li>
          <li>Vitrin sitenizin oluşturulması ve Shopier verileriyle senkronize edilmesi.</li>
          <li>Sistem güvenliğinin sağlanması ve hata tespiti.</li>
          <li>Size teknik destek sunulması ve hizmet güncellemeleri hakkında bilgilendirme yapılması.</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi.</li>
        </ul>

        <h2>3. Veri Paylaşımı ve Aktarımı</h2>
        <p>
          Ödelink, kişisel verilerinizi üçüncü taraflara satmaz veya kiralamaz. Verileriniz ancak aşağıdaki durumlarda paylaşılabilir:
        </p>
        <ul>
          <li><strong>Hizmet Sağlayıcılar:</strong> Altyapı sunucuları (Cloud Hosting) gibi hizmetin çalışması için gerekli teknik iş ortakları.</li>
          <li><strong>Yasal Zorunluluklar:</strong> Yetkili makamlarca yürürlükteki mevzuat çerçevesinde talep edilmesi durumunda adli veya idari mercilerle.</li>
          <li><strong>Shopier Entegrasyonu:</strong> Vitrin sitenizin işleyişi için Shopier altyapısına yönlendirme yapılması durumunda.</li>
        </ul>

        <h2>4. Veri Güvenliği</h2>
        <p>
          Verilerinizin güvenliği için endüstri standardı olan SSL/TLS şifreleme yöntemleri kullanılmaktadır. Bilgileriniz, güvenli sunucularda saklanmakta ve yetkisiz erişime karşı idari ve teknik tedbirlerle korunmaktadır. Ancak, internet üzerinden iletilen hiçbir verinin %100 güvenli olduğu garanti edilemez.
        </p>

        <h2>5. Veri Saklama Süresi</h2>
        <p>
          Kişisel verileriniz, üyeliğiniz devam ettiği sürece ve hizmetin sunulması için gerekli olan süre boyunca saklanır. Hesabınızı sildiğinizde, yasal olarak saklanması zorunlu olmayan tüm verileriniz sistemlerimizden kalıcı olarak temizlenir.
        </p>

        <h2>6. Üçüncü Taraf Bağlantıları</h2>
        <p>
          Platformumuz, Shopier gibi üçüncü taraf web sitelerine bağlantılar içerebilir. Bu sitelerin gizlilik uygulamalarından Ödelink sorumlu değildir. Ziyaret ettiğiniz her sitenin kendi gizlilik politikasını okumanızı öneririz.
        </p>

        <h2>7. Haklarınız ve İletişim</h2>
        <p>
          Kişisel verileriniz üzerindeki haklarınızı kullanmak veya gizlilikle ilgili sorularınız için{' '}
          <button type="button" onClick={() => navigate('/contact')}>
            İletişim
          </button>{' '}
          sayfasını kullanabilirsiniz. Talepleriniz KVKK ve ilgili mevzuat çerçevesinde değerlendirilerek yanıtlanacaktır.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default PrivacyPage;
