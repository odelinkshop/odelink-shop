import React from 'react';
import { useNavigate } from 'react-router-dom';
import LegalPageLayout from './LegalPageLayout';

const KvkkPage = () => {
  const navigate = useNavigate();
  return (
    <LegalPageLayout title="KVKK Aydınlatma Metni" lastUpdated="21.04.2026">
      <section className="space-y-6">
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, Ödelink (“Platform”) olarak, veri sorumlusu sıfatıyla, kişisel verilerinizin işlenme amaçları, hukuki sebepleri, toplanma yöntemleri, kimlere aktarılabileceği ve KVKK kapsamında size tanınan haklara ilişkin olarak sizleri bilgilendirmek istiyoruz.
        </p>

        <h2>1. Veri Sorumlusu</h2>
        <p>
          KVKK uyarınca, kişisel verileriniz veri sorumlusu olarak Ödelink tarafından işbu Aydınlatma Metni'nde belirtilen kapsamda işlenebilecektir.
        </p>

        <h2>2. İşlenen Kişisel Verileriniz</h2>
        <p>
          Platformumuz üzerinden sunulan hizmetler kapsamında; kimlik bilgileriniz (ad-soyad), iletişim bilgileriniz (e-posta), işlem güvenliği bilgileriniz (IP adresi, log kayıtları) ve müşteri işlem bilgileriniz (Shopier mağaza bağlantıları ve ürün verileri) işlenmektedir.
        </p>

        <h2>3. Kişisel Verilerin İşlenme Amaçları</h2>
        <p>
          Kişisel verileriniz, KVKK’nın 5. ve 6. maddelerinde belirtilen kişisel veri işleme şartları dahilinde;
        </p>
        <ul>
          <li>Hizmetlerimizin sunulması, üyelik işlemlerinin gerçekleştirilmesi ve yönetilmesi,</li>
          <li>Kullanıcı deneyiminin geliştirilmesi ve kişiselleştirilmesi,</li>
          <li>Sistem güvenliğinin sağlanması, suistimallerin ve usulsüzlüklerin önlenmesi,</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi ve yetkili mercilere bilgi verilmesi,</li>
          <li>İletişim faaliyetlerinin yürütülmesi ve destek süreçlerinin takibi amaçlarıyla işlenmektedir.</li>
        </ul>

        <h2>4. Kişisel Verilerin Aktarılması</h2>
        <p>
          Kişisel verileriniz; işbu metinde belirtilen amaçların gerçekleştirilmesi doğrultusunda ve bu amaçlarla sınırlı olarak; altyapı sağlayıcılarımıza, iş ortaklarımıza (bulut bilişim, veri depolama vb.) ve kanunen yetkili kamu kurum ve kuruluşları ile paylaşılabilecektir. Verileriniz, yasal zorunluluklar haricinde üçüncü taraflara ticari amaçlarla aktarılmamaktadır.
        </p>

        <h2>5. Kişisel Veri Toplamanın Yöntemi ve Hukuki Sebebi</h2>
        <p>
          Kişisel verileriniz, Platform üzerindeki formlar, Google Login entegrasyonu ve otomatik kayıt yöntemleri (çerezler vb.) ile tamamen veya kısmen otomatik yollarla toplanmaktadır. İşleme faaliyetleri; "Sözleşmenin kurulması veya ifası", "Veri sorumlusunun hukuki yükümlülüğü" ve "İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla veri sorumlusunun meşru menfaati" hukuki sebeplerine dayanmaktadır.
        </p>

        <h2>6. KVKK’nın 11. Maddesi Kapsamındaki Haklarınız</h2>
        <p>
          Veri sahibi olarak Platforma başvurarak;
        </p>
        <ul>
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
          <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
          <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
          <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
          <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
          <li>KVKK’nın 7. maddesinde öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme,</li>
          <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme haklarına sahipsiniz.</li>
        </ul>

        <h2>7. Başvuru ve İletişim</h2>
        <p>
          Yukarıda belirtilen haklarınızı kullanmak için Platformumuzdaki{' '}
          <button type="button" onClick={() => navigate('/contact')}>
            İletişim Formu
          </button>{' '}
          üzerinden veya yasal bildirim adreslerimize yazılı olarak başvurabilirsiniz. Başvurunuz, talebin niteliğine göre en kısa sürede ve en geç 30 gün içinde ücretsiz olarak sonuçlandırılacaktır.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default KvkkPage;
