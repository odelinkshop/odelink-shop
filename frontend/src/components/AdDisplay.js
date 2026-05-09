import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Instagram, ExternalLink } from 'lucide-react';

export default function AdDisplay({ placement = 'header-banner' }) {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visitorId, setVisitorId] = useState(null);
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  const impressionTrackedRef = useRef(false);

  // Initialize visitor ID
  useEffect(() => {
    let id = sessionStorage.getItem('ad_visitor_id');
    if (!id) {
      id = `visitor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('ad_visitor_id', id);
    }
    setVisitorId(id);
  }, []);

  // Fetch active ad
  useEffect(() => {
    const fetchAd = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/advertisements/active?placement=${placement}`);
        if (!response.ok) throw new Error('Ad not found');
        const data = await response.json();
        setAd(data.advertisement);
      } catch (err) {
        console.error('Error fetching ad:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [placement]);

  // Setup Intersection Observer for impression tracking
  useEffect(() => {
    if (!ad || !visitorId || !containerRef.current) return;

    const trackImpression = async () => {
      if (impressionTrackedRef.current) return;

      try {
        impressionTrackedRef.current = true;
        await fetch(`/api/advertisements/${ad.id}/impression`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorId })
        });
      } catch (err) {
        console.error('Error tracking impression:', err);
        impressionTrackedRef.current = false;
      }
    };

    // Wait 1 second before tracking impression
    const timer = setTimeout(() => {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              trackImpression();
            }
          });
        },
        { threshold: 0.5 }
      );

      observerRef.current.observe(containerRef.current);
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [ad, visitorId]);

  const trackClick = async (clickType) => {
    if (!ad || !visitorId) return;

    try {
      // Check for duplicate click within 5 seconds
      const lastClickKey = `ad_last_click_${ad.id}`;
      const lastClickTime = sessionStorage.getItem(lastClickKey);
      const now = Date.now();

      if (lastClickTime && now - parseInt(lastClickTime) < 5000) {
        return; // Duplicate click, ignore
      }

      sessionStorage.setItem(lastClickKey, now.toString());

      await fetch(`/api/advertisements/${ad.id}/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, clickType })
      });
    } catch (err) {
      console.error('Error tracking click:', err);
    }
  };

  if (loading || !ad) {
    return null;
  }

  const handleLinkClick = (clickType, url) => {
    trackClick(clickType);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 sm:p-6 hover:shadow-lg transition"
    >
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Logo */}
        {ad.logo_url && (
          <div className="flex-shrink-0">
            <img
              src={ad.logo_url}
              alt={ad.brand_name}
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <button
              onClick={() => handleLinkClick('brand-link', ad.shopier_url)}
              className="text-lg sm:text-xl font-bold text-blue-600 hover:text-blue-700 hover:underline transition truncate"
            >
              {ad.brand_name}
            </button>
            {ad.instagram_handle && (
              <button
                onClick={() => handleLinkClick('instagram-link', `https://instagram.com/${ad.instagram_handle}`)}
                className="text-blue-600 hover:text-blue-700 transition flex-shrink-0"
                title={`@${ad.instagram_handle}`}
              >
                <Instagram className="w-5 h-5" />
              </button>
            )}
          </div>

          {ad.description && (
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
              {ad.description.substring(0, 200)}
              {ad.description.length > 200 ? '...' : ''}
            </p>
          )}

          {/* CTA Button */}
          <button
            onClick={() => handleLinkClick('cta-button', ad.shopier_url)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            Mağazayı Ziyaret Et
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
