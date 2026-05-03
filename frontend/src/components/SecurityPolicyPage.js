import React from 'react';
import { useNavigate } from 'react-router-dom';
import LegalPageLayout from './LegalPageLayout';

const SecurityPolicyPage = () => {
  const navigate = useNavigate();
  return (
    <LegalPageLayout title="Bilgi ve Sistem Güvenliği Politikası" lastUpdated="21.04.2026">
      <section className="space-y-6">
        <p>
          Ödelink olarak, kullanıcı verilerinin ve sistem bütünlüğünün korunmasını en yüksek önceliğimiz olarak kabul ediyoruz. İşbu politika, Platformumuzdaki güvenlik standartlarını ve veri koruma mekanizmalarını açıklar.
        </p>

        <h2>1. Veri İletişim Güvenliği (SSL/TLS)</h2>
        <p>
          Platform üzerindeki tüm veri trafiği, 256-bit uçtan uca SSL/TLS (Secure Sockets Layer) şifreleme protokolü ile korunmaktadır. Tarayıcınız ile sunucularımız arasındaki iletişim, üçüncü şahıslar tarafından dinlenemez ve müdahale edilemez şekilde kriptolanır.
        </p>

        <h2>2. Hesap ve Kimlik Doğrulama</h2>
        <ul>
          <li><strong>Google OAuth:</strong> Platform, kimlik doğrulama süreçlerinde Google altyapısını kullanarak "Sıfır Güven" (Zero Trust) modelini benimser. Bu sayede, şifreleriniz sistemlerimizde depolanmaz ve Google'ın dünya standartlarındaki güvenlik önlemleriyle korunur.</li>
          <li><strong>JWT Oturum Yönetimi:</strong> Giriş yapmış kullanıcılar, şifrelenmiş JSON Web Token (JWT) sistemiyle yönetilir. Her oturum belirli bir süre sonunda otomatik olarak sonlandırılarak yetkisiz erişim riski minimize edilir.</li>
        </ul>

        <h2>3. Ödeme Güvenliği ve PCI-DSS</h2>
        <p>
          Ödelink, hiçbir şekilde kredi kartı veya banka kartı bilgilerinizi sistemlerinde saklamaz. Tüm ödeme işlemleri, global güvenlik standardı olan PCI-DSS (Payment Card Industry Data Security Standard) uyumlu Shopier altyapısı üzerinden gerçekleştirilir. Ödeme anında verileriniz doğrudan lisanslı ödeme kuruluşuna iletilir.
        </p>

        <h2>4. Uygulama ve Sunucu Güvenliği</h2>
        <p>
          Uygulama katmanımız; SQL Injection, Cross-Site Scripting (XSS) ve CSRF gibi web tabanlı saldırılara karşı modern filtreleme yöntemleriyle korunmaktadır. Sunucularımız düzenli olarak güvenlik taramalarından geçirilmekte ve işletim sistemi seviyesinde en güncel güvenlik yamalarıyla güncel tutulmaktadır.
        </p>

        <h2>5. Veri Yedekleme ve Kurtarma</h2>
        <p>
          Oluşturduğunuz Vitrin Siteler ve kullanıcı ayarları, olası bir sistemsel arızaya karşı günlük olarak yedeklenmektedir. Veri kayıplarını önlemek amacıyla yedeklerimiz, fiziksel olarak farklı ve güvenli veri merkezlerinde (Data Centers) depolanmaktadır.
        </p>

        <h2>6. Güvenlik İhlali ve Bildirim</h2>
        <p>
          Herhangi bir güvenlik ihlali tespit edilmesi durumunda, KVKK mevzuatına uygun olarak ilgili makamlara ve etkilenen kullanıcılara 72 saat içerisinde gerekli bildirimler yapılır. Şüpheli bir durum fark etmeniz halinde lütfen derhal{' '}
          <button type="button" onClick={() => navigate('/contact')}>
            Güvenlik Birimimizle
          </button>{' '}
          iletişime geçiniz.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default SecurityPolicyPage;
