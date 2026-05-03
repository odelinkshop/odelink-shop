import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LegalPageLayout from './LegalPageLayout';
import { getAuthToken } from '../utils/authStorage';

const API_BASE =
  process.env.REACT_APP_API_URL ||
  ((typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:5000'
    : '');

const VipSupportPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const supportEmail = useMemo(() => {
    const v = process.env.REACT_APP_SUPPORT_EMAIL;
    return typeof v === 'string' && v.trim().length > 0 ? v.trim() : 'odelinkdestek@gmail.com';
  }, []);

  const [capabilities, setCapabilities] = useState(null);
  const [capsLoading, setCapsLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  const visitorId = useMemo(() => {
    try {
      return localStorage.getItem('odelink_visitor_id') || '';
    } catch (e) {
      void e;
      return '';
    }
  }, []);

  useEffect(() => {
    setStatus('');
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;

    const loadCaps = async () => {
      setCapsLoading(true);
      try {
        const token = getAuthToken();
        if (!token) {
          if (!cancelled) setCapabilities(null);
          return;
        }

        const res = await fetch(`${API_BASE}/api/subscriptions/capabilities`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (!cancelled) setCapabilities(null);
          return;
        }

        if (!cancelled) setCapabilities(data?.capabilities || null);
      } catch (e) {
        if (!cancelled) setCapabilities(null);
      } finally {
        if (!cancelled) setCapsLoading(false);
      }
    };

    loadCaps();
    return () => {
      cancelled = true;
    };
  }, []);

  const isVipEligible = Boolean(capabilities?.vipSupport);

  if (capsLoading) {
    return (
      <LegalPageLayout title="VIP Destek">
        <p>Yükleniyor...</p>
      </LegalPageLayout>
    );
  }

  if (!isVipEligible) {
    return (
      <LegalPageLayout title="VIP Destek">
        <p>
          Bu bölüm sadece <span className="font-semibold">Profesyonel paket</span> sahipleri içindir.
        </p>
        <div className="mt-6">
          <button type="button" className="btn-primary" onClick={() => navigate('/support')}>Normal Desteğe Git</button>
        </div>
      </LegalPageLayout>
    );
  }

  return (
    <LegalPageLayout title="VIP Destek">
      <p>
        Profesyonel paketiniz sayesinde VIP destek kanalınız aktif.
        Yoğunluğa göre ortalama <span className="font-semibold">5 dakika</span> içinde dönüş yapıyoruz.
        Mesajınız otomatik olarak {supportEmail} adresine gönderilir.
      </p>

      <div className="card mt-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
            <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Konu</label>
            <input className="input-field" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Örn: VIP destek - Site oluşturma" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mesaj</label>
            <textarea className="input-field" rows={7} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              className="btn-primary"
              disabled={sending}
              onClick={async () => {
                setStatus('');

                if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
                  setStatus('Lütfen tüm alanları doldurun.');
                  return;
                }

                setSending(true);
                try {
                  const token = getAuthToken();
                  const headers = {
                    'Content-Type': 'application/json'
                  };
                  if (token) headers.Authorization = `Bearer ${token}`;

                  const res = await fetch(`${API_BASE}/api/support/send`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                      name: name.trim(),
                      email: email.trim(),
                      subject: subject.trim(),
                      message,
                      page: location.pathname,
                      visitorId
                    })
                  });

                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    setStatus(data?.error || 'Mesaj gönderilemedi.');
                    return;
                  }

                  setStatus('VIP destek talebi gönderildi.');
                  setMessage('');
                } catch (e) {
                  setStatus('Mesaj gönderilemedi.');
                } finally {
                  setSending(false);
                }
              }}
            >
              {sending ? 'Gönderiliyor...' : 'VIP Destek Talebi Gönder'}
            </button>
          </div>

          {status ? <p className="text-sm text-gray-600">{status}</p> : null}
        </div>
      </div>
    </LegalPageLayout>
  );
};

export default VipSupportPage;
