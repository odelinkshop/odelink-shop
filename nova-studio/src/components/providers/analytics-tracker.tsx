"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useStoreData } from '@/store/useStoreData';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const { subdomain, settings } = useStoreData();
  const initialized = useRef(false);
  const visitorId = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Generate or get visitor ID
    let vid = localStorage.getItem('nova_visitor_id');
    if (!vid) {
      vid = 'v_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('nova_visitor_id', vid);
    }
    visitorId.current = vid;
  }, []);

  // Track Page Views
  useEffect(() => {
    if (!subdomain || !visitorId.current) return;

    const trackView = async () => {
      try {
        await fetch('https://api.odelink.shop/api/metrics/site-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subdomain: subdomain,
            path: pathname,
            visitorId: visitorId.current
          })
        });
      } catch (e) {
        console.warn('Analytics view tracking failed');
      }
    };

    trackView();

    // Heartbeat for "Live" count
    const interval = setInterval(async () => {
      try {
        await fetch('https://api.odelink.shop/api/metrics/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitorId: `${subdomain}:${visitorId.current}`,
            path: pathname
          })
        });
      } catch (e) {}
    }, 30000);

    return () => clearInterval(interval);
  }, [pathname, subdomain, visitorId]);

  // Track Global Clicks
  useEffect(() => {
    if (!subdomain) return;

    const handleClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const productCard = target.closest('[data-product-id]');
      const productKey = productCard?.getAttribute('data-product-id');
      
      // Fiyat bilgisini çek (Ciro takibi için)
      const priceText = productCard?.querySelector('.product-price, .price')?.textContent || '0';
      const amount = parseFloat(priceText.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
      
      try {
        await fetch('https://api.odelink.shop/api/metrics/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subdomain: subdomain,
            path: pathname,
            productKey: productKey || undefined,
            amount: amount > 0 ? amount : undefined,
            x: e.clientX,
            y: e.clientY,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight
          })
        });
      } catch (e) {}
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [pathname, subdomain]);

  return null;
}
