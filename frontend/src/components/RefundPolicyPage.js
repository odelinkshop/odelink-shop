import React from 'react';
import { useNavigate } from 'react-router-dom';
import LegalPageLayout from './LegalPageLayout';

const RefundPolicyPage = () => {
  const navigate = useNavigate();
  return (
    <LegalPageLayout title="İptal ve İade Koşulları">
      <p>
        Bu sayfa, Ödelink platformu üzerinden satın alınan abonelik planlarına ilişkin iptal ve iade koşullarını açıklar.
      </p>

      <p>
        Yürürlük tarihi: 15.04.2026
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Ödeme ve Satış Süreci</h2>
      <p>
        Ödelink abonelik planları, Shopier e-ticaret platformu üzerinden satışa sunulmaktadır.
        Ödeme işlemleri Shopier'ın güvenli ödeme altyapısı (PCI DSS uyumlu) üzerinden gerçekleştirilir.
        Satın alma işlemi tamamlandıktan sonra, abonelik manuel olarak hesabınıza tanımlanır.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Dijital Hizmet Niteliği</h2>
      <p>
        Ödelink abonelik planları, 6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamında "dijital içerik" ve "dijital hizmet" niteliğindedir.
        Abonelik aktivasyonu yapıldıktan sonra hizmet sunumu başlamış olur.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Cayma Hakkı</h2>
      <p>
        6502 sayılı Kanun'un 15. maddesi uyarınca, dijital içerik ve hizmetlerde cayma hakkı, içeriğin veya hizmetin ifasına başlanması ile sona erer.
        Aboneliğiniz aktive edildikten ve hizmet sunumu başladıktan sonra cayma hakkı kullanılamaz.
      </p>
      <p>
        Ancak, abonelik henüz aktive edilmemişse ve hizmet sunumu başlamamışsa, satın alma tarihinden itibaren 14 gün içinde cayma hakkınızı kullanabilirsiniz.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">İade Talepleri</h2>
      <p>
        İade taleplerini{' '}
        <button type="button" onClick={() => navigate('/contact')} className="text-red-600 font-semibold">
          İletişim
        </button>{' '}
        sayfası üzerinden iletebilirsiniz.
        İade talepleri, hizmet sunumunun başlayıp başlamadığı ve yasal şartların sağlanıp sağlanmadığı değerlendirilerek sonuçlandırılır.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">İade Süreci</h2>
      <p>
        Onaylanan iade talepleri için ödeme, Shopier platformu üzerinden iade edilir.
        İade tutarı, bankanızın işlem süresine bağlı olarak 2-10 iş günü içinde kartınıza yansır.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Abonelik İptali</h2>
      <p>
        Aktif abonelikler, süre sonunda otomatik olarak yenilenmez.
        Abonelik süreniz boyunca hizmetten yararlanmaya devam edebilirsiniz.
        Süre bitiminde aboneliğinizi yenilemek isterseniz, yeni bir satın alma işlemi gerçekleştirmeniz gerekir.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Fatura ve Belge</h2>
      <p>
        Satın alma işleminize ait fatura, Shopier platformu tarafından düzenlenir ve e-posta adresinize gönderilir.
        Fatura ile ilgili talepleriniz için Shopier müşteri hizmetleri ile iletişime geçebilirsiniz.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">İletişim</h2>
      <p>
        İptal ve iade ile ilgili sorularınız için{' '}
        <button type="button" onClick={() => navigate('/contact')} className="text-red-600 font-semibold">
          İletişim
        </button>{' '}
        sayfasını kullanabilirsiniz.
      </p>
    </LegalPageLayout>
  );
};

export default RefundPolicyPage;
