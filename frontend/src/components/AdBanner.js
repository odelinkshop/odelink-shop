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
      <div className="w-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 border-b border-gray-600/50">
        <div className="container mx-auto px-4 py-4">
          <div className="animate-pulse flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-600 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-600 rounded mb-2"></div>
              <div className="h-3 bg-gray-600 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ads.length) {
    // Show placeholder when no ads or error
    return (
      <div className="w-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 border-b border-gray-600/50">
        <div className="container mx-auto px-4 py-4">
          <a
            href="/advertise"
            className="flex items-center justify-between gap-4 hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">AD</span>
              </div>
              <div>
                <div className="text-sm sm:text-base font-bold text-white">
                  Bu Alan Sizin Olabilir - Reklam Verin
                </div>
                <div className="text-xs text-white/70">
                  Binlerce kullanıcıya ulaşın • Uygun fiyatlar • Hızlı yayın
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
              <span className="text-sm font-bold text-white whitespace-nowrap">Detaylı Bilgi</span>
              <ExternalLink className="w-4 h-4 text-white" />
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
      className="w-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 border-b border-gray-600/50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Logo */}
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                <span className="text-white text-xs font-bold">
                  {currentAd.brandName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <a
                  href={currentAd.shopierUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleClick(currentAd, 'brand-link')}
                  className="text-sm sm:text-base font-bold text-white hover:text-white/80 transition-colors truncate"
                >
                  {currentAd.brandName}
                </a>
                <span className="text-white/60 text-xs hidden sm:inline">•</span>
                <span className="text-white/60 text-xs hidden sm:inline">Shopier Mağazası</span>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-white/70">
                <span className="truncate">{currentAd.description}</span>
                {currentAd.instagramHandle && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <a
                      href={`https://instagram.com/${currentAd.instagramHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleClick(currentAd, 'instagram-link')}
                      className="flex items-center gap-1 hover:text-white/90 transition-colors flex-shrink-0"
                    >
                      <Instagram className="w-3 h-3" />
                      <span className="hidden sm:inline">@{currentAd.instagramHandle}</span>
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex items-center gap-2">
            <a
              href={currentAd.shopierUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleClick(currentAd, 'cta-button')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 sm:px-4 py-2 rounded-lg transition-all flex-shrink-0"
            >
              <span className="text-sm font-bold text-white whitespace-nowrap">
                <span className="hidden sm:inline">Mağazayı Ziyaret Et</span>
                <span className="sm:hidden">Ziyaret Et</span>
              </span>
              <ExternalLink className="w-4 h-4 text-white" />
            </a>
          </div>
        </div>

        {/* Ad indicator dots for multiple ads */}
        {ads.length > 1 && (
          <div className="flex justify-center gap-1 mt-3">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentAdIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentAdIndex ? 'bg-white' : 'bg-white/30'
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