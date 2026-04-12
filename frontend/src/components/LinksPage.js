import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LegalPageLayout from './LegalPageLayout';

const LinksPage = () => {
  const navigate = useNavigate();

  const firstPreviewSubdomain = useMemo(() => {
    try {
      const raw = localStorage.getItem('odelink_cache_dashboard_v1');
      const parsed = raw ? JSON.parse(raw) : null;
      const sites = Array.isArray(parsed?.sites) ? parsed.sites : [];
      const first = sites.find((s) => String(s?.subdomain || '').trim());
      const sd = (first?.subdomain || '').toString().trim();
      return sd || '';
    } catch (e) {
      void e;
      return '';
    }
  }, []);

  const goHomeHash = (hash) => {
    navigate('/');
    try {
      setTimeout(() => {
        try {
          window.location.hash = hash;
        } catch (error) {
          void error;
        }
      }, 0);
    } catch (error) {
      void error;
    }
  };

  const supportEmail = useMemo(() => {
    const value = process.env.REACT_APP_SUPPORT_EMAIL;
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : 'odelinkdestek@gmail.com';
  }, []);

  const gmailHref = useMemo(() => {
    const to = encodeURIComponent(supportEmail);
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}`;
  }, [supportEmail]);

  return (
    <LegalPageLayout title="Hizli Linkler">
      <p>Odelink icinde en cok kullanilan sayfalara buradan hizlica ulasabilirsin.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Olusturma</h2>
          <div className="flex flex-col gap-2">
            <button type="button" className="btn-primary text-center" onClick={() => navigate('/panel')}>
              Magaza Paneli
            </button>
            {firstPreviewSubdomain ? (
              <button
                type="button"
                className="btn-secondary text-center"
                onClick={() => window.open(`https://odelink.shop/s/${encodeURIComponent(firstPreviewSubdomain)}`, '_blank', 'noopener,noreferrer')}
              >
                Magaza Onizleme
              </button>
            ) : null}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Ana Sayfa</h2>
          <div className="flex flex-col gap-2">
            <button type="button" className="btn-secondary text-center" onClick={() => navigate('/')}>
              Ana Sayfa
            </button>
            <button type="button" className="btn-secondary text-center" onClick={() => goHomeHash('#features')}>
              Ozellikler
            </button>
            <button type="button" className="btn-secondary text-center" onClick={() => goHomeHash('#pricing')}>
              Fiyatlandirma
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Destek</h2>
          <div className="flex flex-col gap-2">
            <button type="button" className="btn-secondary text-center" onClick={() => navigate('/support')}>
              Destek Talebi
            </button>
            <a className="btn-secondary text-center" href={gmailHref} target="_blank" rel="noreferrer">
              {supportEmail}
            </a>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Yasal</h2>
          <div className="flex flex-col gap-2">
            <button type="button" className="btn-secondary text-center" onClick={() => navigate('/terms')}>
              Kullanim Sartlari
            </button>
            <button type="button" className="btn-secondary text-center" onClick={() => navigate('/privacy')}>
              Gizlilik Politikasi
            </button>
            <button type="button" className="btn-secondary text-center" onClick={() => navigate('/kvkk')}>
              KVKK
            </button>
            <button type="button" className="btn-secondary text-center" onClick={() => navigate('/cookies')}>
              Cerez Politikasi
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-3">CEO</h2>
          <div className="flex flex-col gap-2">
            <button type="button" className="btn-secondary text-center" onClick={() => navigate('/admin')}>
              CEO
            </button>
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Not</h2>
        <p>
          Odelink, Shopier ile resmi bir ortaklik veya temsil iliskisi icinde degildir.
          Shopier baglantilari seni ucuncu taraf platforma yonlendirebilir.
        </p>
      </div>
    </LegalPageLayout>
  );
};

export default LinksPage;
