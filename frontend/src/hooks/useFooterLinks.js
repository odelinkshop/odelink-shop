import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const useFooterLinks = () => {
  const navigate = useNavigate();

  const quickLinks = useMemo(() => [
    { id: 'features', label: 'Özellikler', action: 'hash', value: '#features' },
    { id: 'pricing', label: 'Fiyatlandırma', action: 'hash', value: '#pricing' },
    { id: 'site-builder', label: 'Site Oluştur', action: 'navigate', value: '/site-builder' },
    { id: 'support', label: 'Destek', action: 'navigate', value: '/support' },
    { id: 'contact', label: 'İletişim', action: 'navigate', value: '/contact' },
  ], []);

  const resourceLinks = useMemo(() => [
    { id: 'about', label: 'Hakkımızda', path: '/about' },
    { id: 'blog', label: 'Blog', path: '/blog' },
    { id: 'faq', label: 'SSS', path: '/faq' },
    { id: 'guide', label: 'Kullanım Kılavuzu', path: '/guide' },
    { id: 'reviews', label: 'Müşteri Yorumları', path: '/reviews' },
  ], []);

  const legalLinks = useMemo(() => [
    { id: 'all-policies', label: 'Yasal Politikalar', path: '/terms' },
  ], []);

  const socialLinks = useMemo(() => [
    { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/odelink.tr/', icon: 'instagram' },
    { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/murat-bayram-4a23083b5', icon: 'linkedin' },
  ], []);

  const handleNavigation = useCallback((action, value) => {
    if (action === 'hash') {
      navigate('/');
      requestAnimationFrame(() => {
        window.location.hash = value;
      });
    } else if (action === 'navigate') {
      navigate(value);
    }
  }, [navigate]);

  return {
    quickLinks,
    resourceLinks,
    legalLinks,
    socialLinks,
    handleNavigation,
  };
};

export default useFooterLinks;
