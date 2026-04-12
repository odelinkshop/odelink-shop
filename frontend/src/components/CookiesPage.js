import React from 'react';
import { useNavigate } from 'react-router-dom';
import LegalPageLayout from './LegalPageLayout';

const CookiesPage = () => {
  const navigate = useNavigate();
  return (
    <LegalPageLayout title="Çerez Politikası">
      <p>
        Ödelink, hizmetin çalışması için bazı teknik depolama yöntemleri kullanabilir.
        Bu uygulamada oturum yönetimi gibi amaçlarla tarayıcı tarafında depolama (ör. localStorage) kullanılabilir.
      </p>

      <p>
        Yürürlük tarihi: 06.02.2026
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Kullanım Amaçları</h2>
      <p>
        Kimlik doğrulama bilgilerini saklama, güvenlik, tercihlerin hatırlanması ve temel uygulama işlevlerinin sağlanması.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Kullanılan Depolama Türleri</h2>
      <p>
        Uygulama, temel işlevler için tarayıcı depolaması (ör. localStorage) ve benzeri teknik yöntemler kullanabilir.
        Bu kayıtlar genellikle oturum/kimlik doğrulama, tercihlerin hatırlanması ve güvenlik amaçlıdır.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Kontrol</h2>
      <p>
        Tarayıcı ayarlarınız üzerinden çerezleri ve site verilerini yönetebilirsiniz.
        Çerez veya site verilerini devre dışı bırakmanız, uygulamanın bazı özelliklerinin çalışmamasına neden olabilir.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">İletişim</h2>
      <p>
        Sorular için{' '}
        <button type="button" onClick={() => navigate('/contact')} className="text-red-600 font-semibold">
          İletişim
        </button>{' '}
        sayfasını kullanabilirsiniz.
      </p>
    </LegalPageLayout>
  );
};

export default CookiesPage;
