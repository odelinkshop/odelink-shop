import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

export default function CustomDomainSitePage() {
  const { domain } = useParams();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const res = await fetch(`/api/sites/public-by-host`, {
          headers: {
            'X-Forwarded-Host': domain
          }
        });
        if (!res.ok) throw new Error('Site not found');
        const data = await res.json();
        if (!data.site) throw new Error('No site data');
        setSite(data.site);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (domain) fetchSite();
  }, [domain]);

  // Theme support removed

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-2xl mb-2">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-2xl mb-2">Site bulunamadı</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-50">
      <div className="absolute inset-0 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-2xl mb-2">{site.name}</div>
          <div className="text-gray-600">Tema desteği kaldırıldı</div>
        </div>
      </div>
    </div>
  );
}
