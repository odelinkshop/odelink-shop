import React from 'react';
import { useNavigate } from 'react-router-dom';
import LegalPageLayout from './LegalPageLayout';

const SecurityPolicyPage = () => {
  const navigate = useNavigate();
  return (
    <LegalPageLayout title="Güvenlik Politikası" lastUpdated="15.04.2026">
      <p>
        Bu politika, Ödelink platformunun veri güvenliği, sistem güvenliği ve kullanıcı hesap güvenliği konularındaki yaklaşımını açıklar.
        6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve ilgili mevzuat hükümlerine uygun olarak hazırlanmıştır.
      </p>

      <h2>1. Veri Güvenliği</h2>
      <h3>1.1. Şifreleme ve Veri Koruma</h3>
      <p>
        <strong>SSL/TLS Şifreleme:</strong> Tüm veri iletişimi SSL/TLS protokolü ile şifrelenir. Platform, HTTPS üzerinden çalışır ve veri aktarımı sırasında üçüncü tarafların erişimi engellenir.
      </p>
      <p>
        <strong>Veritabanı Güvenliği:</strong> Kullanıcı verileri, endüstri standardı şifreleme yöntemleriyle korunur. Şifreler, bcrypt algoritması ile hash'lenerek saklanır ve düz metin olarak asla depolanmaz.
      </p>
      <p>
        <strong>Veri Yedekleme:</strong> Düzenli otomatik yedeklemeler yapılır ve yedekler güvenli ortamlarda saklanır.
      </p>

      <h3>1.2. Erişim Kontrolü</h3>
      <p>
        Kişisel verilere erişim, yalnızca yetkili personel ve hizmetin sunulması için gerekli sistemlerle sınırlıdır.
        Erişim logları tutulur ve düzenli olarak denetlenir.
      </p>

      <h2>2. Hesap Güvenliği</h2>
      <h3>2.1. Kimlik Doğrulama</h3>
      <p>
        <strong>Güçlü Şifre Politikası:</strong> Kullanıcılardan minimum 6 karakter uzunluğunda şifre oluşturmaları istenir. Daha güçlü şifreler (büyük/küçük harf, rakam, özel karakter içeren) önerilir.
      </p>
      <p>
        <strong>JWT Token Sistemi:</strong> Oturum yönetimi için JSON Web Token (JWT) kullanılır. Token'lar belirli bir süre sonra otomatik olarak geçersiz hale gelir.
      </p>
      <p>
        <strong>Google OAuth Entegrasyonu:</strong> Kullanıcılar, Google hesapları ile güvenli giriş yapabilirler. Bu yöntem, iki faktörlü doğrulama avantajı sağlar.
      </p>

      <h3>2.2. Oturum Güvenliği</h3>
      <p>
        <strong>Cookie Güvenliği:</strong> Oturum cookie'leri HttpOnly ve Secure bayrakları ile korunur. Production ortamında SameSite=Lax politikası uygulanır.
      </p>
      <p>
        <strong>Otomatik Çıkış:</strong> Uzun süre aktif olmayan oturumlar güvenlik amacıyla sonlandırılabilir.
      </p>

      <h2>3. Sistem Güvenliği</h2>
      <h3>3.1. Altyapı Güvenliği</h3>
      <p>
        <strong>Güvenlik Duvarı:</strong> Sunucular, güvenlik duvarı (firewall) ile korunur ve yalnızca gerekli portlar açıktır.
      </p>
      <p>
        <strong>DDoS Koruması:</strong> Dağıtık hizmet reddi (DDoS) saldırılarına karşı koruma mekanizmaları aktiftir.
      </p>
      <p>
        <strong>Düzenli Güncellemeler:</strong> Sistem yazılımları ve bağımlılıklar düzenli olarak güncellenir ve güvenlik yamaları uygulanır.
      </p>

      <h3>3.2. Uygulama Güvenliği</h3>
      <p>
        <strong>SQL Injection Koruması:</strong> Veritabanı sorguları parametrize edilir ve SQL injection saldırılarına karşı korunur.
      </p>
      <p>
        <strong>XSS Koruması:</strong> Kullanıcı girdileri sanitize edilir ve Cross-Site Scripting (XSS) saldırılarına karşı önlemler alınır.
      </p>
      <p>
        <strong>CSRF Koruması:</strong> Cross-Site Request Forgery (CSRF) saldırılarına karşı token tabanlı koruma uygulanır.
      </p>
      <p>
        <strong>Rate Limiting:</strong> API endpoint'lerine hız sınırlaması (rate limiting) uygulanır ve kötüye kullanım engellenir.
      </p>

      <h2>4. Ödeme Güvenliği</h2>
      <p>
        <strong>PCI DSS Uyumluluğu:</strong> Ödemeler, Shopier platformu üzerinden gerçekleştirilir. Shopier, PCI DSS (Payment Card Industry Data Security Standard) standartlarına uygun güvenli ödeme altyapısı sağlar.
      </p>
      <p>
        <strong>Kart Bilgileri:</strong> Ödelink, kredi kartı bilgilerini saklamaz. Tüm ödeme işlemleri Shopier'ın güvenli altyapısı üzerinden yapılır.
      </p>

      <h2>5. Güvenlik İhlali Yönetimi</h2>
      <h3>5.1. İhlal Tespiti</h3>
      <p>
        Sistem logları düzenli olarak izlenir ve anormal aktiviteler tespit edilir.
        Güvenlik ihlali şüphesi durumunda derhal araştırma başlatılır.
      </p>

      <h3>5.2. İhlal Bildirimi</h3>
      <p>
        KVKK'nın 12. maddesi uyarınca, kişisel verilerin güvenliğini tehlikeye atacak bir ihlal tespit edildiğinde:
      </p>
      <ul>
        <li>İhlal, mümkün olan en kısa sürede Kişisel Verileri Koruma Kurumu'na bildirilir</li>
        <li>Etkilenen kullanıcılar bilgilendirilir</li>
        <li>Gerekli önlemler alınır ve ihlal kaynağı kapatılır</li>
      </ul>

      <h2>6. Kullanıcı Sorumlulukları</h2>
      <h3>6.1. Şifre Güvenliği</h3>
      <p>
        Kullanıcılar, hesap şifrelerini gizli tutmakla ve güçlü şifreler oluşturmakla yükümlüdür.
        Şifrenin başkaları ile paylaşılmaması ve düzenli olarak değiştirilmesi önerilir.
      </p>

      <h3>6.2. Şüpheli Aktivite Bildirimi</h3>
      <p>
        Hesabınızda yetkisiz erişim veya şüpheli aktivite fark ederseniz, derhal{' '}
        <button type="button" onClick={() => navigate('/contact')} className="text-red-600 font-semibold">
          İletişim
        </button>{' '}
        sayfası üzerinden bildirim yapın.
      </p>

      <h3>6.3. Güvenli Bağlantı</h3>
      <p>
        Hesabınıza güvenli ve güncel cihazlardan erişin.
        Halka açık Wi-Fi ağlarında hassas işlemler yapmaktan kaçının.
      </p>

      <h2>7. Üçüncü Taraf Güvenliği</h2>
      <p>
        <strong>Shopier Entegrasyonu:</strong> Shopier, bağımsız bir üçüncü taraf platformdur ve kendi güvenlik politikalarına tabidir.
      </p>
      <p>
        <strong>Google OAuth:</strong> Google ile giriş yapıldığında, Google'ın güvenlik standartları uygulanır.
      </p>

      <h2>8. Güvenlik Denetimleri</h2>
      <p>
        Platform güvenliği düzenli olarak gözden geçirilir ve gerekli iyileştirmeler yapılır.
        Güvenlik açıkları tespit edildiğinde öncelikli olarak kapatılır.
      </p>

      <h2>9. Güvenlik İpuçları</h2>
      <ul>
        <li>Güçlü ve benzersiz şifreler kullanın</li>
        <li>Şifrenizi düzenli olarak değiştirin</li>
        <li>Şüpheli e-postalara ve linklere tıklamayın (phishing)</li>
        <li>Hesabınızdan çıkış yapmayı unutmayın (özellikle paylaşımlı cihazlarda)</li>
        <li>Tarayıcınızı ve işletim sisteminizi güncel tutun</li>
      </ul>

      <h2>İletişim</h2>
      <p>
        Güvenlik ile ilgili sorularınız veya güvenlik açığı bildirimleri için{' '}
        <button type="button" onClick={() => navigate('/contact')} className="text-red-600 font-semibold">
          İletişim
        </button>{' '}
        sayfasını kullanabilirsiniz.
      </p>
    </LegalPageLayout>
  );
};

export default SecurityPolicyPage;
