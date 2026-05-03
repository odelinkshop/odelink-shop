import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  ChevronLeft, 
  Layout, 
  Palette, 
  Type, 
  Package, 
  Eye, 
  Monitor, 
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Edit2,
  X,
  Mail,
  Phone,
  Instagram,
  Info,
  Zap
} from 'lucide-react';
import axios from 'axios';
import './ThemeEditor.css';

const ThemeEditor = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('design'); // design, content, products
  const [viewMode, setViewMode] = useState('desktop'); // desktop, mobile
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [settings, setSettings] = useState({
    design: {
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      accentColor: '#ff0000',
      fontFamily: 'Inter, sans-serif'
    },
    content: {
      announcementBar: 'ÜCRETSİZ KARGO VE ÖZEL İNDİRİMLER!',
      heroTitle: 'YENİ SEZON KOLEKSİYONU',
      heroSubtitle: 'PREMIUM MENSWEAR — İSTANBUL, TR',
      heroButtonText: 'ŞİMDİ KEŞFET',
      heroImageUrl: '',
      aboutTitle: 'HİKAYEMİZ',
      aboutText: 'Modern aristokrasinin sessiz lüksü ile tanışın.',
      contactEmail: '',
      contactPhone: '',
      contactInstagram: ''
    },
    manualProducts: []
  });

  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    fetchSiteSettings();
  }, [siteId]);

  const fetchSiteSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/editor/${siteId}`, {
        headers: { 'x-auth-token': token }
      });
      setSite(res.data);
      setSettings(res.data.settings);
      setLoading(false);
    } catch (err) {
      console.error('❌ Fetch Error:', err);
      setMessage({ type: 'error', text: 'Ayarlar yüklenemedi.' });
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/editor/${siteId}`, { settings }, {
        headers: { 'x-auth-token': token }
      });
      setMessage({ type: 'success', text: 'Tüm değişiklikler kaydedildi.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Kaydedilemedi.' });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category, key, value) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    };
    setSettings(newSettings);
    
    // Send message to Iframe for real-time update
    if (iframeRef.current) {
      iframeRef.current.contentWindow.postMessage({
        type: 'ODELINK_EDITOR_UPDATE',
        settings: newSettings
      }, '*');
    }
  };

  const handleProductAction = (action, productData) => {
    let nextProducts = [...(settings.manualProducts || [])];
    
    if (action === 'add') {
      const newProduct = {
        ...productData,
        id: `manual-${Date.now()}`,
        slug: productData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      };
      nextProducts.push(newProduct);
    } else if (action === 'update') {
      nextProducts = nextProducts.map(p => p.id === productData.id ? productData : p);
    } else if (action === 'delete') {
      nextProducts = nextProducts.filter(p => p.id !== productData.id);
    }

    const newSettings = { ...settings, manualProducts: nextProducts };
    setSettings(newSettings);
    
    if (iframeRef.current) {
      iframeRef.current.contentWindow.postMessage({
        type: 'ODELINK_EDITOR_UPDATE',
        settings: newSettings
      }, '*');
    }
    setShowProductModal(false);
    setEditingProduct(null);
  };

  if (loading) {
    return (
      <div className="editor-loading">
        <Loader2 className="animate-spin" size={48} />
        <p>Editör Hazırlanıyor...</p>
      </div>
    );
  }

  return (
    <div className="theme-editor">
      {/* Top Header */}
      <header className="editor-header">
        <div className="header-left">
          <button onClick={() => navigate('/panel')} className="back-btn">
            <ChevronLeft size={20} />
          </button>
          <div className="site-info">
            <h1>{site?.name}</h1>
            <span>{site?.subdomain}.odelink.shop</span>
          </div>
        </div>
        
        <div className="header-center">
          <div className="view-selector">
            <button 
              className={viewMode === 'desktop' ? 'active' : ''} 
              onClick={() => setViewMode('desktop')}
            >
              <Monitor size={18} />
            </button>
            <button 
              className={viewMode === 'mobile' ? 'active' : ''} 
              onClick={() => setViewMode('mobile')}
            >
              <Smartphone size={18} />
            </button>
          </div>
        </div>

        <div className="header-right">
          {message.text && (
            <div className={`editor-message ${message.type}`}>
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {message.text}
            </div>
          )}
          <button className="preview-btn">
            <Eye size={18} /> Önizle
          </button>
          <button 
            className="save-btn" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Kaydet
          </button>
        </div>
      </header>

      <div className="editor-layout">
        {/* Sidebar Controls */}
        <aside className="editor-sidebar">
          <nav className="sidebar-nav">
            <button className={activeTab === 'design' ? 'active' : ''} onClick={() => setActiveTab('design')}>
              <Palette size={20} /> Tasarım
            </button>
            <button className={activeTab === 'content' ? 'active' : ''} onClick={() => setActiveTab('content')}>
              <Type size={20} /> İçerik
            </button>
            <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
              <Package size={20} /> Ürünler
            </button>
          </nav>

          <div className="sidebar-content">
            {activeTab === 'design' && (
              <div className="settings-group">
                <h3>Renk Paleti</h3>
                <div className="setting-item">
                  <label>Ana Renk</label>
                  <input 
                    type="color" 
                    value={settings.design.primaryColor} 
                    onChange={(e) => updateSetting('design', 'primaryColor', e.target.value)}
                  />
                </div>
                <div className="setting-item">
                  <label>Vurgu Rengi</label>
                  <input 
                    type="color" 
                    value={settings.design.accentColor} 
                    onChange={(e) => updateSetting('design', 'accentColor', e.target.value)}
                  />
                </div>
                <h3>Tipografi</h3>
                <div className="setting-item">
                  <label>Font Ailesi</label>
                  <select 
                    value={settings.design.fontFamily}
                    onChange={(e) => updateSetting('design', 'fontFamily', e.target.value)}
                  >
                    <option value="Inter, sans-serif">Inter (Modern)</option>
                    <option value="'Playfair Display', serif">Playfair (Klasik)</option>
                    <option value="'Roboto Mono', monospace">Roboto Mono (Minimal)</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="settings-group">
                <h3>Duyuru Çubuğu</h3>
                <div className="setting-item">
                  <textarea 
                    value={settings.content.announcementBar}
                    onChange={(e) => updateSetting('content', 'announcementBar', e.target.value)}
                  />
                </div>
                <h3>Hero (Kapak) Alanı</h3>
                <div className="setting-item">
                  <label>Ana Başlık</label>
                  <input 
                    type="text"
                    value={settings.content.heroTitle}
                    onChange={(e) => updateSetting('content', 'heroTitle', e.target.value)}
                  />
                </div>
                <div className="setting-item">
                  <label>Alt Başlık</label>
                  <input 
                    type="text"
                    value={settings.content.heroSubtitle}
                    onChange={(e) => updateSetting('content', 'heroSubtitle', e.target.value)}
                  />
                </div>
                <div className="setting-item">
                  <label>Kapak Görseli URL</label>
                  <input 
                    type="text"
                    value={settings.content.heroImageUrl}
                    placeholder="https://..."
                    onChange={(e) => updateSetting('content', 'heroImageUrl', e.target.value)}
                  />
                </div>
                <h3>Kurumsal Bilgiler</h3>
                <div className="setting-item">
                  <label>Hakkımızda Başlık</label>
                  <input 
                    type="text"
                    value={settings.content.aboutTitle}
                    onChange={(e) => updateSetting('content', 'aboutTitle', e.target.value)}
                  />
                </div>
                <div className="setting-item">
                  <label>Hakkımızda İçerik</label>
                  <textarea 
                    value={settings.content.aboutText}
                    onChange={(e) => updateSetting('content', 'aboutText', e.target.value)}
                  />
                </div>
                <h3>İletişim & Sosyal</h3>
                <div className="setting-item">
                  <label><Mail size={14} /> E-posta</label>
                  <input 
                    type="email"
                    value={settings.content.contactEmail}
                    onChange={(e) => updateSetting('content', 'contactEmail', e.target.value)}
                  />
                </div>
                <div className="setting-item">
                  <label><Phone size={14} /> Telefon</label>
                  <input 
                    type="text"
                    value={settings.content.contactPhone}
                    onChange={(e) => updateSetting('content', 'contactPhone', e.target.value)}
                  />
                </div>
                <div className="setting-item">
                  <label><Instagram size={14} /> Instagram Kullanıcı Adı</label>
                  <input 
                    type="text"
                    value={settings.content.contactInstagram}
                    onChange={(e) => updateSetting('content', 'contactInstagram', e.target.value)}
                  />
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="products-manager">
                <div className="manager-header">
                  <h3>Mağaza Ürünleri</h3>
                  <button className="add-product-btn" onClick={() => { setEditingProduct(null); setShowProductModal(true); }}>
                    <Plus size={16} /> Ürün Ekle
                  </button>
                </div>
                
                <div className="product-list">
                  {settings.manualProducts.length === 0 ? (
                    <div className="empty-state">
                      <Package size={32} />
                      <p>Henüz manuel ürün eklenmemiş.</p>
                    </div>
                  ) : (
                    settings.manualProducts.map((p) => (
                      <div key={p.id} className="product-item">
                        <div className="product-img">
                          <img src={p.image || p.imageUrl || 'https://via.placeholder.com/50'} alt="" />
                        </div>
                        <div className="product-details">
                          <h4>{p.name}</h4>
                          <span>{p.price} TL</span>
                        </div>
                        <div className="product-actions">
                          <button onClick={() => { setEditingProduct(p); setShowProductModal(true); }}>
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleProductAction('delete', p)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="sync-info">
                  <Zap size={14} /> Shopier ürünleri otomatik senkronize edilir.
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Product Modal */}
        {showProductModal && (
          <div className="editor-modal-overlay">
            <div className="editor-modal">
              <div className="modal-header">
                <h3>{editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h3>
                <button onClick={() => setShowProductModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                  id: editingProduct?.id,
                  name: formData.get('name'),
                  price: formData.get('price').includes('TL') ? formData.get('price') : `${formData.get('price')} TL`,
                  description: formData.get('description'),
                  image: formData.get('image'),
                  category: formData.get('category'),
                };
                handleProductAction(editingProduct ? 'update' : 'add', data);
              }}>
                <div className="form-group">
                  <label>Ürün Adı</label>
                  <input name="name" defaultValue={editingProduct?.name} required placeholder="Örn: Minimalist Kazak" />
                </div>
                <div className="form-group">
                  <label>Fiyat (TL)</label>
                  <input name="price" type="number" defaultValue={editingProduct?.price} required placeholder="Örn: 899" />
                </div>
                <div className="form-group">
                  <label>Görsel URL</label>
                  <input name="image" defaultValue={editingProduct?.image} required placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label>Açıklama</label>
                  <textarea name="description" defaultValue={editingProduct?.description} placeholder="Ürün detayları..." />
                </div>
                <div className="form-group">
                  <label>Kategori</label>
                  <input name="category" defaultValue={editingProduct?.category} placeholder="Örn: Yeni Sezon" />
                </div>
                <div className="modal-footer">
                  <button type="button" className="cancel-btn" onClick={() => setShowProductModal(false)}>İptal</button>
                  <button type="submit" className="submit-btn">Kaydet</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Live Preview Iframe */}
        <main className={`editor-preview ${viewMode}`}>
          <div className="iframe-container">
            <iframe 
              ref={iframeRef}
              src={`http://localhost:5000/s/${site?.subdomain}?editor=true`}
              title="Site Preview"
              frameBorder="0"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ThemeEditor;
