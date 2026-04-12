import React, { useMemo, useState } from 'react';
import LegalPageLayout from './LegalPageLayout';
import { getAuthToken } from '../utils/authStorage';

const API_BASE =
  process.env.REACT_APP_API_URL ||
  ((typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:5000'
    : '');

const ContactPage = () => {
  const supportEmail = useMemo(() => {
    const v = process.env.REACT_APP_SUPPORT_EMAIL;
    return typeof v === 'string' && v.trim().length > 0 ? v.trim() : 'odelinkdestek@gmail.com';
  }, []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const [sending, setSending] = useState(false);

  return (
    <LegalPageLayout title="İletişim">
      <p>
        Destek talebi veya soru için bu formu kullanabilirsiniz.
        Bu sayfa, herhangi bir üçüncü taraf platform adına temsil/ortaklık iddiası içermez.
      </p>

      {!supportEmail ? (
        <div className="card mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Destek e-postası ayarlanmadı</h2>
          <p className="text-gray-700">
            Bu projede sahte iletişim bilgisi göstermiyoruz.
            İstersen gerçek destek e-postanı bana yaz; footer ve bu sayfaya ekleyelim.
          </p>
        </div>
      ) : (
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Mesaj</label>
              <textarea className="input-field" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                className="btn-primary"
                disabled={sending}
                onClick={async () => {
                  setStatus('');

                  if (!name.trim() || !email.trim() || !message.trim()) {
                    setStatus('Lütfen tüm alanları doldurun.');
                    return;
                  }

                  setSending(true);
                  try {
                    const token = getAuthToken();
                    const headers = { 'Content-Type': 'application/json' };
                    if (token) headers.Authorization = `Bearer ${token}`;

                    const res = await fetch(`${API_BASE}/api/support/send`, {
                      method: 'POST',
                      headers,
                      body: JSON.stringify({
                        name: name.trim(),
                        email: email.trim(),
                        subject: 'Ödelink İletişim',
                        message
                      })
                    });

                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) {
                      setStatus(data?.error || 'Mesaj gönderilemedi.');
                      return;
                    }

                    setStatus('Mesaj gönderildi.');
                    setMessage('');
                  } catch (e) {
                    setStatus('Mesaj gönderilemedi.');
                  } finally {
                    setSending(false);
                  }
                }}
              >
                {sending ? 'Gönderiliyor...' : 'Gönder'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(`Ad: ${name}\nE-posta: ${email}\n\nMesaj:\n${message}`);
                    setStatus('Mesaj panoya kopyalandı.');
                  } catch (e) {
                    setStatus('Mesaj kopyalanamadı.');
                  }
                }}
              >
                Panoya Kopyala
              </button>
            </div>

            {status ? <p className="text-sm text-gray-600">{status}</p> : null}
          </div>
        </div>
      )}
    </LegalPageLayout>
  );
};

export default ContactPage;
