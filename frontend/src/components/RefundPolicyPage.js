import React from 'react';
import { useNavigate } from 'react-router-dom';
import LegalPageLayout from './LegalPageLayout';

const RefundPolicyPage = () => {
  const navigate = useNavigate();
  return (
    <LegalPageLayout title="İptal ve İade Politikası" lastUpdated="21.04.2026">
      <section className="space-y-6">
        <p>
          Ödelink ("Platform"), sunduğu dijital hizmetlerde müşteri memnuniyetini esas alır. İşbu politika, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği çerçevesinde, abonelik iptali ve ücret iadesi süreçlerini düzenlemektedir.
        </p>

        <h2>1. Dijital Hizmetlerin Niteliği</h2>
        <p>
          Ödelink tarafından sunulan abonelik planları, "anında ifa edilen dijital hizmetler" ve "gayrimaddi mallar" kapsamında değerlendirilmektedir. Bu hizmetler, ödeme onayı sonrası Kullanıcı hesabına tanımlandığı anda ifa edilmiş sayılır.
        </p>

        <h2>2. Cayma Hakkı İstisnası</h2>
        <p>
          Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin (ğ) bendi uyarınca; <strong>"Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmelerde cayma hakkı kullanılamaz."</strong> Bu nedenle, abonelik planı aktive edildikten sonra (vitrin sitesi oluşturma ve yönetim yetkisi tanımlandıktan sonra) ücret iadesi mümkün değildir.
        </p>

        <h2>3. İade Şartları ve Kapsamı</h2>
        <p>
          Sadece aşağıdaki durumlarda iade talebi değerlendirmeye alınabilir:
        </p>
        <ul>
          <li><strong>Hizmet Başlatılmamışsa:</strong> Satın alma işleminden sonraki ilk 14 gün içinde, Kullanıcı panelinde henüz hiçbir vitrin sitesi oluşturulmamış ve hizmetten yararlanılmaya başlanmamışsa.</li>
          <li><strong>Teknik Hatalar:</strong> Platformdan kaynaklanan ve makul süre (48 saat) içerisinde giderilemeyen kronik teknik kusurlar nedeniyle hizmetin hiç sunulamaması durumunda.</li>
        </ul>

        <h2>4. Abonelik İptal Süreci</h2>
        <p>
          Kullanıcılar, mevcut aboneliklerini diledikleri zaman panel üzerinden "Otomatik Yenilemeyi Kapat" seçeneğiyle iptal edebilirler. Abonelik iptal edildiğinde;
        </p>
        <ul>
          <li>Mevcut kullanım süresinin sonuna kadar Platform tüm özellikleriyle kullanılmaya devam edilir.</li>
          <li>Süre sonunda yeni bir tahsilat yapılmaz ve vitrin siteleri pasif duruma getirilir.</li>
          <li>İptal işlemi, geçmişe dönük ödenmiş ücretlerin iadesi hakkını doğurmaz.</li>
        </ul>

        <h2>5. İade Talebi Nasıl Yapılır?</h2>
        <p>
          İade kriterlerini karşıladığınızı düşünüyorsanız, talebinizi satın alma tarihinden itibaren en geç 14 gün içinde{' '}
          <button type="button" onClick={() => navigate('/contact')}>
            Destek Ekibimize
          </button>{' '}
          bildirebilirsiniz. Talebiniz incelendikten sonra, onaylanması durumunda iade işlemi Shopier altyapısı üzerinden 7-10 iş günü içerisinde ödeme yaptığınız karta yansıtılacaktır.
        </p>

        <h2>6. Yürürlük</h2>
        <p>
          Satın alma işlemini tamamlayan her Kullanıcı, işbu İptal ve İade Politikası'nı okumuş ve kabul etmiş sayılır.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default RefundPolicyPage;
