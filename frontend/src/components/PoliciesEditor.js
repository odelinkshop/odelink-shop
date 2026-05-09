import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuthHeaders } from '../utils/authStorage';

const PoliciesEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [siteSubdomain, setSiteSubdomain] = useState('');
  const [policies, setPolicies] = useState({
    privacy: '',
    returns: '',
    shipping: '',
    terms: '',
    kvkk: '',
    cookies: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadSiteInfo = useCallback(async () => {
    try {
      const response = await fetch(`/api/sites/${id}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setSiteSubdomain(data.site?.subdomain || '');
      }
    } catch (err) {
      void err;
    }
  }, [id]);

  const loadPolicies = useCallback(async () => {
    try {
      const response = await fetch(`/api/sites/${id}/policies`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setPolicies(data.policies || {});
      } else {
        setError('Politikalar yüklenemedi');
      }
    } catch (err) {
      setError('Politikalar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPolicies();
    loadSiteInfo();
  }, [loadPolicies, loadSiteInfo]);

  const updatePolicy = (field, value) => {
    setPolicies(prev => ({ ...prev, [field]: value }));
  };

  const savePolicies = async () => {
    // Basic validation
    const requiredFields = ['privacy', 'returns', 'shipping', 'terms', 'kvkk'];
    const missing = requiredFields.filter(field => !policies[field]?.trim());

    if (missing.length > 0) {
      setError(`Aşağıdaki alanlar doldurulmalıdır: ${missing.join(', ')}`);
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/sites/${id}/policies`, {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(policies)
      });

      if (response.ok) {
        const data = await response.json();
        setPolicies(data.policies);
        // Kaydettikten sonra direkt siteyi aç
        if (siteSubdomain) {
          const siteUrl = `https://odelink.shop/s/${encodeURIComponent(siteSubdomain)}`;
          window.open(siteUrl, '_blank');
          navigate('/panel');
        } else {
          navigate('/panel');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Politikalar kaydedilemedi');
      }
    } catch (err) {
      setError('Politikalar kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">📋 Zorunlu Site Politikaları</h1>
            <p className="text-slate-600">Bu alanlar doldurulmadan site yayınlanamaz. Tüm metinleri dikkatlice hazırlayın.</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-600 text-sm font-medium">⚠️ {error}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {[
            { key: 'privacy', title: 'Gizlilik Politikası', required: true, placeholder: 'Kişisel verilerin nasıl toplandığını, kullanıldığını ve korunduğunu açıklayın...', rows: 6 },
            { key: 'returns', title: 'İade ve Değişim Politikası', required: true, placeholder: 'İade süresi, koşulları, prosedürleri belirtin...', rows: 5 },
            { key: 'shipping', title: 'Kargo ve Teslimat', required: true, placeholder: 'Kargo süreleri, ücretleri, bölgeler...', rows: 5 },
            { key: 'terms', title: 'Kullanım Koşulları', required: true, placeholder: 'Site kullanım kuralları, sorumluluklar...', rows: 5 },
            { key: 'kvkk', title: 'KVKK Aydınlatma Metni', required: true, placeholder: 'Kişisel verilerin işlenmesi, haklarınız...', rows: 5 },
            { key: 'cookies', title: 'Çerez Politikası', required: false, placeholder: 'Çerez kullanımı, ayarları...', rows: 4 }
          ].map((field) => (
            <div key={field.key} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                <label className="text-lg font-semibold text-slate-900">
                  {field.title}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
              </div>
              <div className="p-6">
                <textarea
                  value={policies[field.key]}
                  onChange={(e) => updatePolicy(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={field.rows}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[120px] text-base leading-relaxed"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={savePolicies}
            disabled={saving}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Kaydediliyor...
              </>
            ) : (
              <>
                💾 Kaydet ve Siteyi Aç
              </>
            )}
          </button>
          <button
            onClick={() => navigate('/panel')}
            className="px-8 py-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            ❌ İptal
          </button>
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            💡 Tüm zorunlu alanları (*) doldurduktan sonra kaydedebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PoliciesEditor;
