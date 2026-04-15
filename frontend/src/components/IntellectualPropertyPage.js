import React from 'react';
import { useNavigate } from 'react-router-dom';
import LegalPageLayout from './LegalPageLayout';

const IntellectualPropertyPage = () => {
  const navigate = useNavigate();
  return (
    <LegalPageLayout title="Fikri Mülkiyet Politikası" lastUpdated="15.04.2026">
      <p>
        Bu politika, Ödelink platformu ve kullanıcıları arasındaki fikri mülkiyet haklarını düzenler.
        5846 sayılı Fikir ve Sanat Eserleri Kanunu ve 6769 sayılı Sınai Mülkiyet Kanunu hükümlerine tabidir.
      </p>

      <h2>1. Platform İçeriği ve Telif Hakları</h2>
      <h3>1.1. Ödelink'e Ait İçerikler</h3>
      <p>
        Ödelink platformunun tasarımı, yazılım kodu, arayüz, logo, marka, grafik tasarımlar ve diğer tüm içerikler Ödelink'in fikri mülkiyetidir.
        Bu içeriklerin izinsiz kopyalanması, çoğaltılması, dağıtılması veya ticari amaçla kullanılması yasaktır.
      </p>

      <h3>1.2. Kullanıcı Tarafından Oluşturulan İçerikler</h3>
      <p>
        Kullanıcıların platform üzerinde oluşturduğu site içerikleri (metinler, görseller, logolar) kullanıcının fikri mülkiyetindedir.
        Kullanıcı, yüklediği içeriklerin telif haklarına sahip olduğunu veya gerekli izinleri aldığını beyan ve taahhüt eder.
      </p>

      <h3>1.3. Üçüncü Taraf İçerikleri</h3>
      <p>
        Shopier üzerinden çekilen ürün bilgileri, görseller ve açıklamalar ilgili satıcıların ve Shopier platformunun sorumluluğundadır.
        Ödelink, bu içeriklerin telif haklarından sorumlu değildir.
      </p>

      <h2>2. Lisans ve Kullanım Hakları</h2>
      <h3>2.1. Platform Kullanım Lisansı</h3>
      <p>
        Ödelink, kullanıcılara abonelik süresi boyunca platformu kullanma hakkı tanır.
        Bu lisans, kişisel ve ticari kullanım için geçerlidir ancak platformun kaynak kodunu kopyalama, tersine mühendislik yapma veya türev eserler oluşturma hakkı vermez.
      </p>

      <h3>2.2. Kullanıcı İçerikleri Üzerinde Ödelink'in Hakları</h3>
      <p>
        Kullanıcı, oluşturduğu sitelerin Ödelink altyapısı üzerinde yayınlanması için gerekli sınırlı lisansı Ödelink'e verir.
        Bu lisans, hizmetin sunulması, teknik destek sağlanması ve platform iyileştirmeleri için gerekli olan işlemleri kapsar.
      </p>

      <h2>3. Marka ve Logo Kullanımı</h2>
      <h3>3.1. Ödelink Markası</h3>
      <p>
        "Ödelink" adı, logosu ve diğer marka unsurları tescilli veya tescil sürecindeki ticari markalardır.
        Bu markaların izinsiz kullanımı, taklit edilmesi veya yanıltıcı şekilde kullanılması yasaktır.
      </p>

      <h3>3.2. Kullanıcı Logoları</h3>
      <p>
        Kullanıcılar, kendi logolarını yükleyerek sitelerinde kullanabilirler.
        Yüklenen logoların üçüncü taraf haklarını ihlal etmemesi kullanıcının sorumluluğundadır.
      </p>

      <h2>4. Telif Hakkı İhlali Bildirimleri</h2>
      <h3>4.1. İhlal Bildirimi Süreci</h3>
      <p>
        Telif hakkınızın ihlal edildiğini düşünüyorsanız, aşağıdaki bilgileri içeren bir bildirim gönderin:
      </p>
      <ul>
        <li>Telif hakkı sahibinin kimlik bilgileri</li>
        <li>İhlal edilen eserin açıklaması</li>
        <li>İhlal içeriğinin platformdaki konumu (URL)</li>
        <li>İyi niyetle hareket edildiğine dair beyan</li>
        <li>Bildirimin doğruluğuna dair imzalı taahhüt</li>
      </ul>
      <p>
        Bildirimlerinizi{' '}
        <button type="button" onClick={() => navigate('/contact')} className="text-red-600 font-semibold">
          İletişim
        </button>{' '}
        sayfası üzerinden iletebilirsiniz.
      </p>

      <h3>4.2. İhlal Durumunda Yapılacaklar</h3>
      <p>
        Geçerli bir telif hakkı ihlali bildirimi alındığında, ilgili içerik incelenir ve gerekirse kaldırılır.
        Tekrarlayan ihlallerde kullanıcı hesabı askıya alınabilir veya kapatılabilir.
      </p>

      <h2>5. Açık Kaynak ve Üçüncü Taraf Yazılımlar</h2>
      <p>
        Ödelink platformu, bazı açık kaynak yazılım bileşenleri kullanabilir.
        Bu bileşenler kendi lisanslarına tabidir ve ilgili lisans şartları korunur.
      </p>

      <h2>6. Fikri Mülkiyet Uyuşmazlıkları</h2>
      <p>
        Fikri mülkiyet haklarından kaynaklanan uyuşmazlıklarda, öncelikle taraflar arasında dostane çözüm aranır.
        Çözüm sağlanamazsa, Türkiye Cumhuriyeti yasaları ve yetkili mahkemeler uygulanır.
      </p>

      <h2>7. Politika Güncellemeleri</h2>
      <p>
        Bu politika, yasal değişiklikler veya platform güncellemeleri nedeniyle değiştirilebilir.
        Önemli değişiklikler kullanıcılara bildirilir.
      </p>

      <h2>İletişim</h2>
      <p>
        Fikri mülkiyet ile ilgili sorularınız için{' '}
        <button type="button" onClick={() => navigate('/contact')} className="text-red-600 font-semibold">
          İletişim
        </button>{' '}
        sayfasını kullanabilirsiniz.
      </p>
    </LegalPageLayout>
  );
};

export default IntellectualPropertyPage;
