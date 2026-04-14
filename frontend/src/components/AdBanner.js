import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Instagram } from 'lucide-react';

const AdBanner = ({ placement = 'header-banner' }) => {
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const bannerRef = useRef(null);
  const impressionTracked = useRef(new Set());
  const clickCooldown = useRef(new Set());

  // Fetch active advertisements
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch(`/api/advertisements/active?placement=${placement}`);
        if (response.ok) {
          const data = await response.json();
          setAds(data.advertisements || []);
        } else {
          setError('Reklamlar yüklenemedi');
        }
      } catch (err) {
        console.error('Error fetching ads:', err);
        setError('Bağlantı hatası');
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
    
    // Refresh ads every 5 minutes
    const interval = setInterval(fetchAds, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [placement]);

  // Rotate ads every 30 seconds if multiple ads exist
  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 30000);

    return () => clearInterval(interval);
  }, [ads.length]);

  // Track impressions using Intersection Observer
  useEffect(() => {
    if (!ads.length || !bannerRef.current) return;

    const currentAd = ads[currentAdIndex];
    if (!currentAd || impressionTracked.current.has(currentAd.id)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            // Track impression after 1 second of visibility
            setTimeout(() => {
              if (entry.isIntersecting && !impressionTracked.current.has(currentAd.id)) {
                trackImpression(currentAd.id);
                impressionTracked.current.add(currentAd.id);
              }
            }, 1000);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(bannerRef.current);
    return () => observer.disconnect();
  }, [ads, currentAdIndex]);

  const trackImpression = async (adId) => {
    try {
      // Use sendBeacon if available for reliable tracking
      const payload = JSON.stringify({});
      
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(`/api/advertisements/${adId}/impression`, blob);
      } else {
        await fetch(`/api/advertisements/${adId}/impression`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        });
      }
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  };

  const trackClick = async (adId, elementType) => {
    // Prevent duplicate clicks within 5 seconds
    const cooldownKey = `${adId}-${elementType}`;
    if (clickCooldown.current.has(cooldownKey)) return;
    
    clickCooldown.current.add(cooldownKey);
    setTimeout(() => {
      clickCooldown.current.delete(cooldownKey);
    }, 5000);

    try {
      const payload = JSON.stringify({ elementType });
      
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(`/api/advertisements/${adId}/click`, blob);
      } else {
        await fetch(`/api/advertisements/${adId}/click`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        });
      }
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const handleClick = (ad, elementType) => {
    trackClick(ad.id, elementType);
  };

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-r from-yellow-500/10 via-yellow-400/10 to-yellow-500/10 border-b border-yellow-500/20">
        <div className="container mx-auto px-3 py-2">
          <div className="animate-pulse flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500/20 rounded"></div>
            <div className="flex-1">
              <div className="h-3 bg-yellow-500/20 rounded mb-1"></div>
              <div className="h-2 bg-yellow-500/20 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ads.length) {
    // Show placeholder when no ads or error
    return (
      <div className="w-full bg-gradient-to-r from-yellow-500/10 via-yellow-400/10 to-yellow-500/10 border-b border-yellow-500/20">
        <div className="container mx-auto px-3 py-2">
          <a
            href="/advertise"
            className="flex items-center justify-between gap-3 hover:opacity-90 transition-opacity group"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 bg-yellow-500/20 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-yellow-600 text-xs font-bold">⚡</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-gray-800 truncate">
                  🎯 Yıllık %30 İndirim - Sadece ₺399/yıl
                </div>
                <div className="text-[10px] text-gray-600 truncate">
                  Profesyonel paket • Sınırsız site • Hemen Al →
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    );
  }

  const currentAd = ads[currentAdIndex];

  return (
    <div 
      ref={bannerRef}
      className="w-full bg-gradient-to-r from-yellow-500/10 via-yellow-400/10 to-yellow-500/10 border-b border-yellow-500/20"
    >
      <div className="container mx-auto px-3 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Logo */}
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
              {currentAd.logoUrl ? (
                <img 
                  src={currentAd.logoUrl} 
                  alt={`${currentAd.brandName} logo`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`w-full h-full flex items-center justify-center ${currentAd.logoUrl ? 'hidden' : 'flex'}`}
              >
                <span className="text-gray-800 text-xs font-bold">
                  {currentAd.brandName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-yellow-500 text-white px-1.5 py-0.5 rounded font-bold flex-shrink-0">REKLAM</span>
                <a
                  href={currentAd.shopierUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleClick(currentAd, 'brand-link')}
                  className="text-xs font-bold text-gray-800 hover:text-gray-600 transition-colors truncate"
                >
                  {currentAd.brandName}
                </a>
                {currentAd.instagramHandle && (
                  <a
                    href={`https://instagram.com/${currentAd.instagramHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleClick(currentAd, 'instagram-link')}
                    className="flex items-center gap-0.5 hover:opacity-80 transition-opacity flex-shrink-0"
                  >
                    <Instagram className="w-3 h-3 text-pink-600" />
                  </a>
                )}
              </div>
              
              <div className="text-[10px] text-gray-600 truncate">
                {currentAd.description}
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <a
            href={currentAd.shopierUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleClick(currentAd, 'cta-button')}
            className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 px-2.5 py-1.5 rounded text-white transition-all flex-shrink-0 shadow-sm"
          >
            <span className="text-[10px] font-bold whitespace-nowrap">
              Ziyaret Et
            </span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Ad indicator dots for multiple ads */}
        {ads.length > 1 && (
          <div className="flex justify-center gap-1 mt-1.5">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentAdIndex(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentAdIndex ? 'bg-yellow-600' : 'bg-yellow-600/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdBanner;