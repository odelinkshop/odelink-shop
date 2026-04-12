import React from 'react';
import { useNavigate } from 'react-router-dom';
import LegalPageLayout from './LegalPageLayout';

const PrivacyPage = () => {
  const navigate = useNavigate();
  return (
    <LegalPageLayout title="Gizlilik Politikası">
      <p>
        Bu sayfa, Ödelink uygulamasını kullanırken hangi verilerin işlendiğini ve genel yaklaşımlarımızı açıklar.
        Ödelink, yalnızca hizmetin çalışması için gerekli verileri işlemeyi hedefler.
      </p>

      <p>
        Yürürlük tarihi: 06.02.2026
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">İşlenen Veriler</h2>
      <p>
        Hesap açma ve hizmet sunumu kapsamında ad/soyad, e-posta gibi hesap bilgileri; oluşturduğunuz sitelere ilişkin ayarlar ve Shopier bağlantıları işlenebilir.
        Teknik olarak; güvenlik ve hata tespiti için IP adresi, tarayıcı bilgisi ve istek zamanları gibi kayıtlar tutulabilir.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">İşleme Amaçları</h2>
      <p>
        Veriler; hesap yönetimi, kimlik doğrulama, site oluşturma, destek süreçlerinin yürütülmesi ve hizmetin güvenli şekilde işletilmesi amaçlarıyla işlenir.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Üçüncü Taraflar</h2>
      <p>
        Shopier bağlantıları üzerinden kullanıcıyı Shopier sayfalarına yönlendirebiliriz.
        Shopier; Ödelink tarafından işletilmeyen bağımsız bir üçüncü taraf platformdur ve kendi gizlilik politikalarına tabidir.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Paylaşım</h2>
      <p>
        Kişisel veriler, temel olarak hizmetin sunulması için gerekli durumlarda ve yasal yükümlülükler kapsamında iş ortakları/altyapı sağlayıcıları ile sınırlı ölçüde paylaşılabilir.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Saklama Süresi</h2>
      <p>
        Veriler, hizmetin sunulması için gerekli olduğu süre boyunca saklanır. Yasal yükümlülükler kapsamında daha uzun süre saklama gerekebilir.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Güvenlik</h2>
      <p>
        Verilerin güvenliği için makul teknik ve idari tedbirler uygulanır. Ancak internet üzerinden iletimde mutlak güvenlik garanti edilemez.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">İletişim</h2>
      <p>
        Gizlilikle ilgili talepler için{' '}
        <button type="button" onClick={() => navigate('/contact')} className="text-red-600 font-semibold">
          İletişim
        </button>{' '}
        sayfasını kullanabilirsiniz.
      </p>
    </LegalPageLayout>
  );
};

export default PrivacyPage;
