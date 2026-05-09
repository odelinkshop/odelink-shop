const AnalyticsStore = require('../models/AnalyticsStore');
const pool = require('../config/database');

class AIInsightsService {
  static async generateInsights(siteId) {
    try {
      const days = 7;
      const stats = await AnalyticsStore.getBreakdowns({ siteId, days });
      const products = await AnalyticsStore.getTopProducts({ siteId, days });
      
      const insights = [];

      // 1. Şehir/Ülke Analizi
      if (stats.countries?.length > 0) {
        const topCountry = stats.countries[0];
        insights.push({
          type: 'location',
          priority: 'high',
          title: 'Bölgesel Fırsat Yakalandı',
          message: `${topCountry.key} bölgesinden yoğun trafik alıyorsunuz. Bu bölgeye özel kampanya satışları %25 artırabilir.`,
          icon: 'MapPin'
        });
      }

      // 2. Cihaz Analizi
      const mobileStats = stats.devices?.find(d => d.key === 'mobile');
      if (mobileStats && mobileStats.count > stats.totals?.pageViews * 0.7) {
        insights.push({
          type: 'optimization',
          priority: 'medium',
          title: 'Mobil Öncelikli Kitle',
          message: 'Müşterilerinizin %70\'inden fazlası mobilde. Mağaza tasarımınızın mobil hızını optimize etmeyi unutmayın.',
          icon: 'Smartphone'
        });
      }

      // 3. Dönüşüm Analizi
      const heatmap = await AnalyticsStore.getHeatmapData({ siteId, days });
      if (heatmap.length > 500 && products.length < 5) {
        insights.push({
          type: 'conversion',
          priority: 'critical',
          title: 'Trafik Var, Satış Az',
          message: 'Tıklama sayınız çok yüksek ancak sepete ekleme oranı düşük. Ürün fiyatlarını veya açıklamalarını gözden geçirmeniz önerilir.',
          icon: 'TrendingDown'
        });
      }

      return insights;
    } catch (e) {
      console.error('AI Insights Error:', e);
      return [];
    }
  }
}

module.exports = AIInsightsService;
