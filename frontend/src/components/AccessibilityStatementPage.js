import React from 'react';
import { useNavigate } from 'react-router-dom';
import LegalPageLayout from './LegalPageLayout';

const AccessibilityStatementPage = () => {
  const navigate = useNavigate();
  return (
    <LegalPageLayout title="Erişilebilirlik Beyanı" lastUpdated="15.04.2026">
      <p>
        Ödelink olarak, web sitemizin herkes tarafından, yetenekler ve koşullar ne olursa olsun, erişilebilir olmasını sağlamayı taahhüt ediyoruz.
        Bu beyan, platformumuzun erişilebilirlik durumunu ve sürekli iyileştirme çabalarımızı açıklar.
      </p>

      <h2>1. Erişilebilirlik Standartları</h2>
      <h3>1.1. WCAG 2.1 Uyumluluğu</h3>
      <p>
        Ödelink platformu, World Wide Web Consortium (W3C) tarafından belirlenen Web İçeriği Erişilebilirlik Kılavuzu (WCAG) 2.1 standartlarına AA seviyesinde uyum sağlamayı hedefler.
      </p>
      <p>
        WCAG 2.1, web içeriğinin daha geniş bir kullanıcı kitlesine erişilebilir hale getirilmesi için uluslararası kabul görmüş bir standarttır.
      </p>

      <h3>1.2. Kapsam</h3>
      <p>
        Bu erişilebilirlik beyanı, www.odelink.shop alan adı altındaki tüm sayfaları kapsar.
        Kullanıcıların oluşturduğu site içerikleri, kullanıcıların kendi sorumluluğundadır.
      </p>

      <h2>2. Erişilebilirlik Özellikleri</h2>
      <h3>2.1. Görme Engelliler İçin</h3>
      <p>
        <strong>Ekran Okuyucu Uyumluluğu:</strong> Platform, NVDA, JAWS ve VoiceOver gibi ekran okuyucu yazılımlarıyla uyumlu olacak şekilde tasarlanmıştır.
      </p>
      <p>
        <strong>Alternatif Metinler:</strong> Görseller ve ikonlar için anlamlı alternatif metinler (alt text) sağlanır.
      </p>
      <p>
        <strong>Klavye Navigasyonu:</strong> Tüm işlevlere klavye ile erişilebilir. Fare kullanımı zorunlu değildir.
      </p>
      <p>
        <strong>Odak Göstergeleri:</strong> Klavye ile gezinirken, odaklanılan öğeler görsel olarak belirgindir.
      </p>
      <p>
        <strong>Renk Kontrastı:</strong> Metin ve arka plan renkleri arasında yeterli kontrast oranı sağlanır (WCAG AA standardı: minimum 4.5:1).
      </p>

      <h3>2.2. İşitme Engelliler İçin</h3>
      <p>
        <strong>Görsel İçerik:</strong> Ses içeriği gerektiren işlemler, alternatif görsel yöntemlerle de gerçekleştirilebilir.
      </p>
      <p>
        <strong>Metin Tabanlı İletişim:</strong> Destek ve iletişim kanalları metin tabanlı olarak da sunulur.
      </p>

      <h3>2.3. Motor Engelliler İçin</h3>
      <p>
        <strong>Büyük Tıklama Alanları:</strong> Düğmeler ve bağlantılar, kolay tıklanabilir boyutlardadır.
      </p>
      <p>
        <strong>Zaman Sınırı Esnekliği:</strong> Oturum süreleri, kullanıcıların işlemlerini tamamlaması için yeterli uzunluktadır.
      </p>
      <p>
        <strong>Hata Toleransı:</strong> Formlar, hataları açıkça belirtir ve düzeltme önerileri sunar.
      </p>

      <h3>2.4. Bilişsel Engelliler İçin</h3>
      <p>
        <strong>Basit ve Anlaşılır Dil:</strong> İçerikler, mümkün olduğunca sade ve anlaşılır dille yazılır.
      </p>
      <p>
        <strong>Tutarlı Navigasyon:</strong> Menüler ve navigasyon öğeleri, tüm sayfalarda tutarlıdır.
      </p>
      <p>
        <strong>Hata Önleme:</strong> Önemli işlemler için onay adımları bulunur.
      </p>

      <h2>3. Teknik Özellikler</h2>
      <h3>3.1. Semantik HTML</h3>
      <p>
        Platform, anlamsal HTML5 etiketleri kullanır (header, nav, main, footer, article, section vb.).
        Bu, ekran okuyucuların sayfa yapısını doğru anlamasını sağlar.
      </p>

      <h3>3.2. ARIA Etiketleri</h3>
      <p>
        Gerekli yerlerde ARIA (Accessible Rich Internet Applications) etiketleri kullanılır.
        Bu etiketler, dinamik içeriklerin ve etkileşimli bileşenlerin erişilebilirliğini artırır.
      </p>

      <h3>3.3. Responsive Tasarım</h3>
      <p>
        Platform, farklı ekran boyutlarında ve cihazlarda (masaüstü, tablet, mobil) düzgün çalışır.
        Mobil cihazlarda dokunmatik kontroller optimize edilmiştir.
      </p>

      <h2>4. Bilinen Sınırlamalar</h2>
      <p>
        Sürekli iyileştirme çabalarımıza rağmen, bazı alanlarda erişilebilirlik sınırlamaları olabilir:
      </p>
      <ul>
        <li>Üçüncü taraf entegrasyonlar (Shopier, Google OAuth) kendi erişilebilirlik standartlarına tabidir</li>
        <li>Kullanıcıların yüklediği görseller için alternatif metin sağlanması kullanıcının sorumluluğundadır</li>
        <li>Bazı karmaşık etkileşimli bileşenler, tam erişilebilirlik için iyileştirme sürecindedir</li>
      </ul>

      <h2>5. Geri Bildirim ve Destek</h2>
      <h3>5.1. Erişilebilirlik Sorunları Bildirimi</h3>
      <p>
        Platformda erişilebilirlik sorunu yaşarsanız veya iyileştirme önerileriniz varsa, lütfen bizimle iletişime geçin:
      </p>
      <ul>
        <li>
          <button type="button" onClick={() => navigate('/contact')} className="text-red-600 font-semibold">
            İletişim Formu
          </button>
        </li>
        <li>E-posta: odelinkdestek@gmail.com</li>
      </ul>
      <p>
        Bildiriminizde lütfen şunları belirtin:
      </p>
      <ul>
        <li>Karşılaştığınız sorunun açıklaması</li>
        <li>Sorunun yaşandığı sayfa URL'si</li>
        <li>Kullandığınız tarayıcı ve yardımcı teknoloji (varsa)</li>
      </ul>

      <h3>5.2. Yanıt Süresi</h3>
      <p>
        Erişilebilirlik ile ilgili geri bildirimlerinizi ciddiyetle değerlendiririz ve mümkün olan en kısa sürede yanıt vermeye çalışırız.
        Genellikle 5 iş günü içinde geri dönüş yapılır.
      </p>

      <h2>6. Sürekli İyileştirme</h2>
      <p>
        Erişilebilirlik, sürekli bir süreçtir. Ödelink olarak:
      </p>
      <ul>
        <li>Düzenli erişilebilirlik denetimleri yaparız</li>
        <li>Kullanıcı geri bildirimlerini değerlendiririz</li>
        <li>Yeni özellikler eklerken erişilebilirliği göz önünde bulundururuz</li>
        <li>Ekip üyelerimize erişilebilirlik eğitimleri veririz</li>
        <li>Teknoloji ve standartlardaki gelişmeleri takip ederiz</li>
      </ul>

      <h2>7. Üçüncü Taraf İçerikleri</h2>
      <p>
        <strong>Shopier Entegrasyonu:</strong> Shopier platformu, bağımsız bir üçüncü taraf hizmetidir ve kendi erişilebilirlik standartlarına tabidir.
      </p>
      <p>
        <strong>Kullanıcı İçerikleri:</strong> Kullanıcıların oluşturduğu site içeriklerinin erişilebilirliği, kullanıcıların sorumluluğundadır.
        Kullanıcılara, içeriklerini erişilebilir hale getirmeleri için rehberlik sağlamaya çalışırız.
      </p>

      <h2>8. Yasal Çerçeve</h2>
      <p>
        Bu erişilebilirlik beyanı, aşağıdaki yasal düzenlemeler ve standartlar çerçevesinde hazırlanmıştır:
      </p>
      <ul>
        <li>Web İçeriği Erişilebilirlik Kılavuzu (WCAG) 2.1</li>
        <li>5378 sayılı Engelliler Hakkında Kanun</li>
        <li>Türkiye Cumhuriyeti Anayasası'nın eşitlik ve ayrımcılık yasağı hükümleri</li>
      </ul>

      <h2>9. Son Güncelleme</h2>
      <p>
        Bu erişilebilirlik beyanı en son 15 Nisan 2026 tarihinde güncellenmiştir.
        Beyan, platform geliştikçe ve erişilebilirlik iyileştirmeleri yapıldıkça düzenli olarak güncellenir.
      </p>

      <h2>İletişim</h2>
      <p>
        Erişilebilirlik ile ilgili sorularınız için{' '}
        <button type="button" onClick={() => navigate('/contact')} className="text-red-600 font-semibold">
          İletişim
        </button>{' '}
        sayfasını kullanabilirsiniz.
      </p>
    </LegalPageLayout>
  );
};

export default AccessibilityStatementPage;
