import React from 'react';
import { useNavigate } from 'react-router-dom';
import LegalPageLayout from './LegalPageLayout';

const TermsPage = () => {
  const navigate = useNavigate();
  return (
    <LegalPageLayout title="Kullanım Koşulları ve Hizmet Sözleşmesi" lastUpdated="21.04.2026">
      <section className="space-y-6">
        <p>
          İşbu Kullanım Koşulları ve Hizmet Sözleşmesi ("Sözleşme"), Ödelink ("Platform") tarafından sunulan yazılım hizmetlerinin ("Hizmet") kullanımına ilişkin usul ve esasları düzenlemektedir. Platformu kullanarak, işbu Sözleşme'de yer alan tüm şartları okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan etmiş sayılırsınız.
        </p>

        <h2>1. Tanımlar</h2>
        <p>
          <strong>Platform:</strong> Ödelink markası altında sunulan web uygulaması ve servisleri.
          <br /><strong>Kullanıcı:</strong> Platforma kayıt olan ve hizmetlerden yararlanan gerçek veya tüzel kişi.
          <br /><strong>Vitrin Sitesi:</strong> Kullanıcının Shopier mağazasındaki ürünleri sergilemek amacıyla Platform üzerinde oluşturduğu web sayfası.
          <br /><strong>Shopier:</strong> Platformun entegre olduğu, ancak Ödelink'ten tamamen bağımsız bir üçüncü taraf ödeme ve mağaza altyapısı sağlayıcısı.
        </p>

        <h2>2. Hizmetin Kapsamı ve Doğu Niteliği</h2>
        <p>
          Ödelink, Kullanıcılara Shopier üzerindeki mağazalarını profesyonel bir vitrin arayüzü ile sunmalarına yardımcı olan bir SaaS (Yazılım Hizmeti) platformudur. Platform; ödeme aracısı, kargo firması veya ürün satıcısı değildir. Tüm ticari işlemler, ödemeler, kargo ve iade süreçleri doğrudan Kullanıcı ve Shopier (veya ilgili ödeme kuruluşu) arasında gerçekleşir.
        </p>

        <h2>3. Üyelik ve Hesap Güvenliği</h2>
        <ul>
          <li>Kullanıcı, kayıt sırasında sunduğu bilgilerin (Gmail hesabı vb.) doğru ve güncel olduğunu taahhüt eder.</li>
          <li>Hesap güvenliğinin sağlanması tamamen Kullanıcının sorumluluğundadır. Hesabınız üzerinden gerçekleştirilen tüm işlemlerden şahsen sorumlu olduğunuzu kabul edersiniz.</li>
          <li>Yetkisiz erişim şüphesi durumunda Platforma derhal bilgi verilmelidir.</li>
        </ul>

        <h2>4. Ödeme ve Abonelik Şartları</h2>
        <p>
          Ödelink; Standart (Aylık) ve Profesyonel (Yıllık) olmak üzere farklı abonelik modelleri sunar. Abonelik ücretleri, seçilen paket tipine göre ön ödemeli olarak tahsil edilir. Platform, abonelik ücretlerinde ve paket içeriklerinde makul süre öncesinden bildirimde bulunmak kaydıyla değişiklik yapma hakkını saklı tutar.
        </p>

        <h2>5. Shopier ve Üçüncü Taraf İlişkileri</h2>
        <p>
          Platform ile Shopier arasında herhangi bir resmi ortaklık, temsilcilik veya acentelik ilişkisi bulunmamaktadır. Shopier altyapısında meydana gelebilecek kesintiler, kısıtlamalar veya kural değişiklikleri nedeniyle Platformda yaşanabilecek aksaklıklardan Ödelink sorumlu tutulamaz. Kullanıcı, Shopier'in kendi kullanım şartlarına uymakla yükümlüdür.
        </p>

        <h2>6. Fikri Mülkiyet Hakları</h2>
        <p>
          Platformun tasarımı, yazılım kodları, logoları ve sunulan "Noir Fashion" gibi temaların tüm hakları Ödelink'e aittir. Kullanıcıya sunulan hizmet, sadece belirtilen amaçlarla kullanım hakkı (lisans) sağlar; bu içeriklerin kopyalanması, dağıtılması veya tersine mühendislik yoluyla işlenmesi yasaktır.
        </p>

        <h2>7. Sorumluluğun Sınırlandırılması</h2>
        <p>
          Ödelink; veri kaybı, kâr kaybı veya sistem kesintileri gibi dolaylı zararlardan sorumlu değildir. Platform, hizmeti "olduğu gibi" sunar ve kesintisiz veya hatasız çalışma garantisi vermez. Sistemsel hatalardan kaynaklanan veri uyuşmazlıklarında Platform kayıtları esas alınır.
        </p>

        <h2>8. Sözleşmenin Feshi</h2>
        <p>
          Kullanıcı, aboneliğini dilediği zaman iptal edebilir. İptal durumunda, önceden ödenmiş olan hizmet bedellerinin iadesi yapılmaz; ancak Kullanıcı dönem sonuna kadar hizmetten yararlanmaya devam eder. İşbu sözleşme kurallarının ihlali durumunda Ödelink, hesabı askıya alma veya feshetme hakkını saklı tutar.
        </p>

        <h2>9. İletişim</h2>
        <p>
          İşbu sözleşme ile ilgili tüm sorularınız için{' '}
          <button type="button" onClick={() => navigate('/contact')}>
            İletişim Formu
          </button>{' '}
          üzerinden hukuk birimimize ulaşabilirsiniz.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default TermsPage;
