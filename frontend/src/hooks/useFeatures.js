import { useMemo } from 'react';
import { Shield, Link2, Globe, TrendingUp } from 'lucide-react';

/**
 * @typedef {Object} Feature
 * @property {string} id - Unique feature identifier
 * @property {string} title - Feature title
 * @property {string} description - Feature description
 * @property {React.ComponentType} icon - Icon component
 * @property {string} color - Color scheme (red, blue, green, purple)
 * @property {string} gradient - Gradient background class
 * @property {string} border - Border color class
 * @property {string} iconBg - Icon background class
 * @property {string} iconColor - Icon color class
 */

/**
 * Hook for managing feature data with memoization
 * @returns {Feature[]} Array of feature objects
 */
export const useFeatures = () => {
  return useMemo(() => [
    {
      id: 'commission-free',
      title: 'Komisyonsuz',
      description: 'Kazancın sende kalsın',
      icon: Shield,
      color: 'red',
      gradient: 'from-red-500/20 via-red-600/15 to-red-700/10',
      border: 'border-red-500/40',
      iconBg: 'bg-red-500/30 border-red-500/50',
      iconColor: 'text-red-300',
    },
    {
      id: 'shopier-compatible',
      title: 'Shopier Uyumlu',
      description: 'Satış Shopier\'de tamamlanır',
      icon: Link2,
      color: 'blue',
      gradient: 'from-blue-500/20 via-blue-600/15 to-blue-700/10',
      border: 'border-blue-500/40',
      iconBg: 'bg-blue-500/30 border-blue-500/50',
      iconColor: 'text-blue-300',
    },
    {
      id: 'seo-ready',
      title: 'SEO Hazır',
      description: 'Google için düzenli vitrin',
      icon: Globe,
      color: 'green',
      gradient: 'from-green-500/20 via-green-600/15 to-green-700/10',
      border: 'border-green-500/40',
      iconBg: 'bg-green-500/30 border-green-500/50',
      iconColor: 'text-green-300',
    },
    {
      id: 'minutes-setup',
      title: 'Dakikalar İçinde',
      description: 'Kur, yayınla, paylaş',
      icon: TrendingUp,
      color: 'purple',
      gradient: 'from-purple-500/20 via-purple-600/15 to-purple-700/10',
      border: 'border-purple-500/40',
      iconBg: 'bg-purple-500/30 border-purple-500/50',
      iconColor: 'text-purple-300',
    },
  ], []);
};

export default useFeatures;
