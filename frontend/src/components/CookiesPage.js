import React from 'react';
import { useNavigate } from 'react-router-dom';
import LegalPageLayout from './LegalPageLayout';

const CookiesPage = () => {
  const navigate = useNavigate();
  return (
    <LegalPageLayout title="Çerez (Cookie) Politikası" lastUpdated="21.04.2026">
      <section className="space-y-6">
        <p>
          Ödelink ("Platform"), kullanıcı deneyimini geliştirmek, hizmet kalitesini artırmak ve sistem güvenliğini sağlamak amacıyla çerezler (cookies) ve benzeri teknolojiler kullanmaktadır. İşbu politika, hangi çerezlerin neden kullanıldığını ve bunları nasıl kontrol edebileceğinizi açıklamaktadır.
        </p>

        <h2>1. Çerez Nedir?</h2>
        <p>
          Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza (bilgisayar, telefon, tablet) kaydedilen küçük metin dosyalarıdır. Bu dosyalar, sitenin sizi tanımasına, tercihlerinizi hatırlamasına ve daha hızlı çalışmasına yardımcı olur.
        </p>

        <h2>2. Kullanılan Çerez Türleri</h2>
        <ul>
          <li><strong>Zorunlu Çerezler:</strong> Platformun temel işlevlerini yerine getirmesi (oturum yönetimi, güvenlik, Gmail Login doğrulaması) için zorunludur. Bunlar devre dışı bırakıldığında Platform düzgün çalışmayabilir.</li>
          <li><strong>Performans ve Analitik Çerezleri:</strong> Ziyaretçi sayıları, en çok tıklanan alanlar ve hata raporları gibi verileri anonim olarak toplayarak hizmetimizi geliştirmemize yardımcı olur.</li>
          <li><strong>Fonksiyonel Çerezler:</strong> Dil tercihiniz, tema seçiminiz (Karanlık/Aydınlık mod) gibi kişiselleştirilmiş ayarların hatırlanmasını sağlar.</li>
        </ul>

        <h2>3. Çerezlerin Kullanım Amaçları</h2>
        <p>
          Çerezler aşağıdaki amaçlarla işlenmektedir:
        </p>
        <ul>
          <li>Kullanıcı kimliğinin doğrulanması ve oturumun açık tutulması.</li>
          <li>Vitrin sitelerinin oluşturulması ve ayarların kaydedilmesi.</li>
          <li>Sistem performansının ölçülmesi ve optimize edilmesi.</li>
          <li>Şüpheli aktivitelerin tespiti ve güvenliğin artırılması.</li>
        </ul>

        <h2>4. Çerezleri Nasıl Kontrol Edebilirsiniz?</h2>
        <p>
          Çoğu web tarayıcısı çerezleri otomatik olarak kabul eder. Ancak, tarayıcı ayarlarınız üzerinden çerezleri reddetme veya silme hakkına sahipsiniz. Ayarlarınızı değiştirmek için kullandığınız tarayıcının (Chrome, Safari, Firefox, Edge vb.) yardım menüsünü ziyaret edebilirsiniz. Zorunlu çerezleri devre dışı bırakmanız durumunda Platformun bazı özelliklerinin kullanılamayabileceğini hatırlatmak isteriz.
        </p>

        <h2>5. Politika Güncellemeleri</h2>
        <p>
          Ödelink, çerez kullanımına ilişkin politikalarını hizmet gerekliliklerine göre güncelleme hakkını saklı tutar. Güncellemeler bu sayfada yayınlandığı an itibarıyla geçerlilik kazanır.
        </p>

        <h2>6. İletişim</h2>
        <p>
          Çerez politikamızla ilgili tüm sorularınız için{' '}
          <button type="button" onClick={() => navigate('/contact')}>
            İletişim Formu
          </button>{' '}
          üzerinden bize ulaşabilirsiniz.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default CookiesPage;
