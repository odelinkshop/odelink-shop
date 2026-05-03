"use client";

import { useEffect, useRef } from 'react';
import { useStoreData } from '@/store/useStoreData';

interface StoreInitializerProps {
  subdomain?: string;
}

export default function StoreInitializer({ subdomain }: StoreInitializerProps) {
  const fetchStoreData = useStoreData((state) => state.fetchStoreData);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    // Detect subdomain from window.location if not provided
    let targetSubdomain = subdomain;
    
    if (!targetSubdomain && typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // Handle localhost, odelink.shop, and subdomains
      if (hostname.includes('odelink.shop')) {
        const parts = hostname.split('.');
        if (parts.length >= 3) {
          targetSubdomain = parts[0];
          // If it's 'www' or 'demo', we might want special handling
          if (targetSubdomain === 'www') targetSubdomain = 'demo'; 
        } else {
          targetSubdomain = 'demo'; // Default to demo if on main domain
        }
      } else {
        targetSubdomain = 'demo'; // Fallback for local development
      }
    }

    if (targetSubdomain) {
      console.log(`📡 Initializing store for: ${targetSubdomain}`);
      fetchStoreData(targetSubdomain);
      initialized.current = true;
    }

    // Listen for messages from the Editor for real-time updates
    const handleEditorMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ODELINK_EDITOR_UPDATE') {
        const newSettings = event.data.settings;
        console.log('🎨 Editor update received:', newSettings);
        useStoreData.getState().updateFromEditor(newSettings);
      }
    };

    window.addEventListener('message', handleEditorMessage);
    return () => window.removeEventListener('message', handleEditorMessage);
  }, [subdomain, fetchStoreData]);

  return null;
}
