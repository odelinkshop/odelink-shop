import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Eye, ShoppingCart, CheckCircle2 } from 'lucide-react';
import './ThemesPage.css';

const ThemesPage = () => {
  const navigate = useNavigate();

  const themes = [
    {
      id: 'nova',
      name: 'NOVA — Aristocratic Premium',
      description: 'İtalyan Riviera esintili, sessiz lüks (Quiet Luxury) ve Old Money estetiğine sahip, Türkiye\'nin en prestijli e-ticaret şablonu.',
      image: '/images/nova_preview.png',
      isNew: true,
      demoUrl: 'https://demo.odelink.shop',
      category: 'Lüks Moda / Butik'
    },
    {
      id: 'rhodes',
      name: 'RHODES — Classic Shop',
      description: 'Geniş ürün kataloğuna sahip mağazalar için optimize edilmiş klasik ve güvenilir tasarım.',
      image: '/images/rhodes_preview.png',
      isNew: false,
      demoUrl: '#',
      category: 'Genel Mağaza'
    },
    {
      id: 'streetwear',
      name: 'STREETWEAR — Urban Style',
      description: 'Sokak stili ve genç markalar için dinamik, cesur ve hareketli bir alışveriş deneyimi.',
      image: '/images/streetwear_preview.png',
      isNew: true,
      demoUrl: '#',
      category: 'Streetwear / Genç'
    }
  ];

  return (
    <div className="themes-page">
      <div className="themes-hero">
        <div className="container">
          <h1>Tema Mağazası</h1>
          <p>Markanıza en uygun profesyonel tasarımı seçin, dakikalar içinde satışa başlayın.</p>
        </div>
      </div>

      <div className="themes-container container">
        <div className="themes-grid">
          {themes.map((theme) => (
            <div key={theme.id} className="theme-card">
              <div className="theme-badge-container">
                {theme.isNew && <span className="badge-new">YENİ</span>}
                <span className="theme-category">{theme.category}</span>
              </div>
              
              <div className="theme-image-wrapper">
                <img src={theme.image} alt={theme.name} />
                <div className="theme-actions-overlay">
                  <a href={theme.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-demo">
                    <Eye size={18} /> Canlı Demo
                  </a>
                  <button onClick={() => navigate('/plans')} className="btn-buy">
                    <ShoppingCart size={18} /> Satın Al
                  </button>
                </div>
              </div>

              <div className="theme-info">
                <h3>{theme.name}</h3>
                <p>{theme.description}</p>
                <div className="theme-features">
                  <span><CheckCircle2 size={14} /> %100 Mobil Uyumlu</span>
                  <span><CheckCircle2 size={14} /> SEO Optimizasyonu</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="themes-cta">
        <div className="container">
          <h2>Kendi Temanı Oluşturmak İster Misin?</h2>
          <p>Profesyonel editörümüz ile renkleri, fontları ve içerikleri saniyeler içinde değiştir.</p>
          <button onClick={() => navigate('/site-builder')} className="btn-primary">
            ŞİMDİ BAŞLA
          </button>
        </div>
      </section>
    </div>
  );
};

export default ThemesPage;
