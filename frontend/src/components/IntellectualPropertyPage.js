import React from 'react';
import { useNavigate } from 'react-router-dom';
import LegalPageLayout from './LegalPageLayout';

const IntellectualPropertyPage = () => {
  const navigate = useNavigate();
  return (
    <LegalPageLayout title="Fikri ve Sınai Mülkiyet Politikası" lastUpdated="21.04.2026">
      <section className="space-y-6">
        <p>
          Ödelink ("Platform"), fikri ve sınai mülkiyet haklarına en üst düzeyde saygı göstermekte ve bu hakların korunması için gerekli yasal altyapıyı sağlamaktadır. İşbu politika, Platform üzerindeki hak sahipliği durumlarını ve ihlal bildirim süreçlerini düzenler.
        </p>

        <h2>1. Platform Hak Sahipliği</h2>
        <p>
          Platform üzerinde yer alan; yazılım kodları, algoritmalar, arayüz tasarımları, "Noir Fashion" ve diğer özel temalar, grafikler, metinler ve "Ödelink" markası 5846 sayılı Fikir ve Sanat Eserleri Kanunu ile 6769 sayılı Sınai Mülkiyet Kanunu kapsamında korunmaktadır. Bu içeriklerin Ödelink'in yazılı izni olmaksızın kopyalanması, çoğaltılması veya ticari amaçlarla kullanılması yasal takibat sebebidir.
        </p>

        <h2>2. Kullanıcı İçerikleri ve Lisans</h2>
        <p>
          Kullanıcılar tarafından yüklenen logolar, marka görselleri ve oluşturulan metin içerikleri ilgili Kullanıcının mülkiyetindedir. Kullanıcı, bu içerikleri Platforma yükleyerek, hizmetin sunulması ve Vitrin Sitenin yayınlanması için gerekli olan "sınırlı, dünya çapında ve devredilemez bir kullanım hakkını" Platforma vermiş sayılır.
        </p>

        <h2>3. Shopier ve Üçüncü Taraf İçerikleri</h2>
        <p>
          Shopier altyapısı üzerinden çekilen ürün fotoğrafları, açıklamaları ve fiyat bilgileri ilgili satıcının ve Shopier platformunun sorumluluğundadır. Ödelink, bu verileri sadece Kullanıcının talimatı doğrultusunda Vitrin Siteye yansıtan bir teknik altyapı sağlayıcısıdır.
        </p>

        <h2>4. İhlal Bildirim Süreci (Uyar-Kaldır)</h2>
        <p>
          Fikri mülkiyet haklarınızın (telif, marka vb.) Platform üzerindeki herhangi bir içerik tarafından ihlal edildiğini düşünüyorsanız, "Uyar-Kaldır" prensibi çerçevesinde aşağıdaki bilgileri içeren bir bildirimle bize başvurabilirsiniz:
        </p>
        <ul>
          <li>Hak sahibi olduğunuzu kanıtlayan belgeler,</li>
          <li>İhlal edildiği iddia edilen içeriğin tam bağlantısı (URL),</li>
          <li>İletişim bilgileriniz.</li>
        </ul>
        <p>
          Başvurularınız incelenerek, haklı bulunması durumunda ilgili içerik 48 saat içerisinde yayından kaldırılacaktır. Bildirimler için{' '}
          <button type="button" onClick={() => navigate('/contact')}>
            İletişim Formu
          </button>{' '}
          kullanılabilir.
        </p>

        <h2>5. Marka Kullanım Kılavuzu</h2>
        <p>
          Kullanıcılar, Ödelink markasını sadece "Powered by Ödelink" veya benzeri atıf ifadeleriyle, markanın kurumsal kimliğine zarar vermeyecek şekilde kullanabilirler. Ödelink logosu üzerinde değişiklik yapılması veya markanın Ödelink ile resmi bir ortaklık varmış izlenimi yaratacak şekilde kullanılması yasaktır.
        </p>

        <h2>6. Yasal Müeyyideler</h2>
        <p>
          Platformun kaynak kodlarının kopyalanması veya tersine mühendislik yöntemleriyle çalınması durumunda, Ödelink Türk Ceza Kanunu ve Fikri Mülkiyet mevzuatı kapsamında her türlü tazminat ve ceza davası açma hakkını saklı tutar.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default IntellectualPropertyPage;
