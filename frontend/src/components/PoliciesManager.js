import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuthToken } from '../utils/authStorage';

const API_BASE =
  process.env.REACT_APP_API_URL ||
  ((typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:5000'
    : '');

const POLICY_FIELDS = [
  { key: 'privacy', label: 'Gizlilik Politikasi', placeholder: 'Kisisel verilerin nasil toplandigi, islendigi ve korundugu hakkinda bilgi verin...' },
  { key: 'terms', label: 'Kullanim Kosullari', placeholder: 'Satis kosullari, sorumluluklar ve kurallar hakkinda bilgi verin...' },
  { key: 'returns', label: 'Iade ve Degisim Politikasi', placeholder: 'Iade sureci, kosullari ve degisim kurallari...' },
  { key: 'shipping', label: 'Kargo Politikasi', placeholder: 'Kargo suresi, ucretleri ve teslimat bilgileri...' },
  { key: 'kvkk', label: 'KVKK Aydinlatma Metni', placeholder: '6698 sayili Kisisel Verilerin Korunmasi Kanunu kapsaminda aydinlatma metni...' },
  { key: 'cookies', label: 'Cerez Politikasi', placeholder: 'Sitede kullanilan cerezler ve amaclarini aciklayin...' }
];

export default function PoliciesManager() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [siteName, setSiteName] = useState('');

  const [policies, setPolicies] = useState({
    privacy: '',
    terms: '',
    returns: '',
    shipping: '',
    kvkk: '',
    cookies: ''
  });

  const [activeTab, setActiveTab] = useState('privacy');

  const token = useMemo(() => getAuthToken(), []);

  useEffect(() => {
    if (!token) { navigate('/auth'); return; }

    let cancelled = false;
    const load = async () => {
      try {
        const [siteRes, polRes] = await Promise.all([
          fetch(`${API_BASE}/api/sites/${encodeURIComponent(id)}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_BASE}/api/sites/${encodeURIComponent(id)}/policies`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const siteData = await siteRes.json().catch(() => ({}));
        const polData = await polRes.json().catch(() => ({}));

        if (!cancelled) {
          if (siteData?.site?.name) setSiteName(siteData.site.name);
          if (polData?.policies) {
            setPolicies((prev) => ({
              ...prev,
              ...polData.policies
            }));
          }
        }
      } catch (e) {
        if (!cancelled) setError('Veriler yuklenemedi');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [id, token, navigate]);

  useEffect(() => {
    if (!saveSuccess) return;
    const t = setTimeout(() => setSaveSuccess(false), 2000);
    return () => clearTimeout(t);
  }, [saveSuccess]);

  const save = async () => {
    setSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      const res = await fetch(`${API_BASE}/api/sites/${encodeURIComponent(id)}/policies`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(policies)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Kaydedilemedi');
        return;
      }
      setSaveSuccess(true);
    } catch (e) {
      setError('Baglanti hatasi');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key, value) => {
    setPolicies((prev) => ({ ...prev, [key]: value }));
  };

  const currentField = POLICY_FIELDS.find((f) => f.key === activeTab) || POLICY_FIELDS[0];
  const filledCount = POLICY_FIELDS.filter((f) => (policies[f.key] || '').trim().length > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950">
      <div className="sticky top-0 inset-x-0 z-50 bg-black/35 backdrop-blur border-b border-white/10 shadow-2xl">
        <div className="container mx-auto px-4 py-4" style={{ maxWidth: 980 }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs text-gray-300/90">Magaza Paneli</div>
              <div className="text-2xl font-bold text-white truncate">Politika Yonetimi</div>
              <div className="text-sm text-gray-300 mt-1 truncate">{siteName || 'Site'} - {filledCount}/{POLICY_FIELDS.length} tamamlandi</div>
            </div>
            <div className="flex gap-3">
              <button type="button" className="btn-secondary" onClick={() => navigate('/panel')}>Panele Don</button>
              <button
                type="button"
                className="h-10 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors disabled:opacity-50"
                onClick={save}
                disabled={saving}
              >
                {saving ? 'Kaydediliyor...' : saveSuccess ? 'Kaydedildi' : 'Kaydet'}
              </button>
            </div>
          </div>

          <div className="mt-4 -mb-1 flex gap-2 overflow-x-auto pb-1">
            {POLICY_FIELDS.map((f) => {
              const filled = (policies[f.key] || '').trim().length > 0;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setActiveTab(f.key)}
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    activeTab === f.key
                      ? 'bg-white text-gray-900 border-white'
                      : 'bg-white/5 text-gray-100 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {filled && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6 sm:pt-8 pb-16 sm:pb-20" style={{ maxWidth: 980 }}>
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="h-6 w-44 rounded bg-white/10 mb-4" />
            <div className="h-64 rounded-xl bg-white/5 border border-white/10" />
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl backdrop-blur p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-white">{currentField.label}</div>
                <div className="text-xs text-gray-400 mt-1">Bu alani doldurmak zorunludur. Bos birakirsaniz sitede "Yakinida eklenecek" mesaji gosterilir.</div>
              </div>
            </div>

            <textarea
              value={policies[currentField.key] || ''}
              onChange={(e) => updateField(currentField.key, e.target.value)}
              rows={16}
              placeholder={currentField.placeholder}
              className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10 resize-y"
            />

            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-gray-400">
                {(policies[currentField.key] || '').length} / 10.000 karakter
              </div>
              <button
                type="button"
                className="h-9 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                onClick={save}
                disabled={saving}
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <div className="text-sm font-semibold text-yellow-200">Onemli Bilgi</div>
          <div className="text-xs text-yellow-300 mt-1">
            Politika sayfalari yasal zorunluluktur. Tum alanlari eksiksiz doldurmak sizin sorumlulugunuzdadir.
            Sistem bu sayfalari otomatik olusturmaz - icerigi siz hazirlamalisiniz.
          </div>
        </div>
      </div>
    </div>
  );
}
