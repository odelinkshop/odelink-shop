import React from 'react';
import { useNavigate } from 'react-router-dom';
import LegalPageLayout from './LegalPageLayout';

const AccessibilityStatementPage = () => {
  const navigate = useNavigate();
  return (
    <LegalPageLayout title="Erişilebilirlik Beyanı" lastUpdated="21.04.2026">
      <section className="space-y-6">
        <p>
          Ödelink olarak, dijital dünyada engelleri kaldırmayı ve platformumuzun yetenekleri veya koşulları ne olursa olsun herkes için erişilebilir olmasını sağlamayı bir sorumluluk olarak görüyoruz. Bu beyan, kapsayıcılık vizyonumuzu ve uyguladığımız standartları açıklar.
        </p>

        <h2>1. Hedeflediğimiz Standartlar</h2>
        <p>
          Web sitemiz ve sunduğumuz Vitrin Site temaları, World Wide Web Consortium (W3C) tarafından yayınlanan <strong>Web İçeriği Erişilebilirlik Kılavuzu (WCAG) 2.1 AA</strong> seviyesindeki standartlara uyum sağlamayı hedeflemektedir. Bu standartlar, web içeriğini görme, işitme, hareket ve bilişsel engelli bireyler için daha erişilebilir hale getirmektedir.
        </p>

        <h2>2. Uygulanan Erişilebilirlik Özellikleri</h2>
        <ul>
          <li><strong>Semantik Yapı:</strong> Sayfalarımız, ekran okuyucu yazılımların (NVDA, JAWS, VoiceOver) hiyerarşiyi doğru anlamasını sağlayan anlamsal HTML5 kod yapısıyla inşa edilmiştir.</li>
          <li><strong>Klavye Erişilebilirliği:</strong> Fare kullanımı zorunluluğunu ortadan kaldırarak, tüm menü ve işlevlere klavye (Tab tuşu) ile erişim imkanı sağlanmaktadır.</li>
          <li><strong>Renk Kontrastı:</strong> Metinler ve arka planlar arasında, okumayı kolaylaştıran yüksek kontrast oranları gözetilmiştir.</li>
          <li><strong>Alternatif Metinler (Alt-Text):</strong> Kritik görseller ve ikonlar, ekran okuyucular için betimleyici metinlerle desteklenmiştir.</li>
        </ul>

        <h2>3. Kullanıcı Sorumluluğu ve Sınırlar</h2>
        <p>
          Ödelink altyapısı erişilebilirlik dostu olsa da; Kullanıcıların Vitrin Sitelerine yüklediği özel görseller, logolar ve metin içeriklerinin erişilebilirliği tamamen Kullanıcının sorumluluğundadır. Kullanıcılarımıza, yükledikleri içeriklerde betimleyici açıklamalar kullanmalarını önemle tavsiye ederiz.
        </p>

        <h2>4. Sürekli İyileştirme</h2>
        <p>
          Teknoloji geliştikçe, biz de erişilebilirlik özelliklerimizi periyodik olarak test ediyor ve güncelliyoruz. Amacımız, tüm platformumuzu her geçen gün daha kapsayıcı bir hale getirmektir.
        </p>

        <h2>5. Geri Bildirim Bildirimi</h2>
        <p>
          Platformumuzda herhangi bir erişilebilirlik engeliyle karşılaşırsanız veya iyileştirme öneriniz varsa, lütfen bizimle paylaşmaktan çekinmeyin. Geri bildirimleriniz bizim için çok değerlidir.{' '}
          <button type="button" onClick={() => navigate('/contact')}>
            Erişilebilirlik Formu
          </button>{' '}
          üzerinden bize ulaşabilirsiniz.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default AccessibilityStatementPage;
