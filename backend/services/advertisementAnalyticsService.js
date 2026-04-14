const pool = require('../config/database');

class AdvertisementAnalyticsService {
  static async recordImpression(advertisementId, visitorId, ipAddress, userAgent) {
    try {
      // Check for duplicate within 30 seconds
      const checkQuery = `
        SELECT id FROM advertisement_impression_tracking
        WHERE advertisement_id = $1
          AND visitor_id = $2
          AND tracked_at > NOW() - INTERVAL '30 seconds'
        LIMIT 1
      `;

      const existing = await pool.query(checkQuery, [advertisementId, visitorId]);
      if (existing.rows.length > 0) {
        return { recorded: false, reason: 'duplicate' };
      }

      // Record tracking
      await pool.query(
        `INSERT INTO advertisement_impression_tracking 
         (advertisement_id, visitor_id, ip_address, user_agent)
         VALUES ($1, $2, $3, $4)`,
        [advertisementId, visitorId, ipAddress, userAgent]
      );

      // Update statistics
      await pool.query(
        `UPDATE advertisement_statistics
         SET impressions = impressions + 1, last_updated = NOW()
         WHERE advertisement_id = $1`,
        [advertisementId]
      );

      // Update hourly breakdown
      const hour = new Date();
      hour.setMinutes(0, 0, 0);

      await pool.query(
        `INSERT INTO advertisement_hourly_stats (advertisement_id, hour_timestamp, impressions, clicks)
         VALUES ($1, $2, 1, 0)
         ON CONFLICT (advertisement_id, hour_timestamp)
         DO UPDATE SET impressions = advertisement_hourly_stats.impressions + 1`,
        [advertisementId, hour]
      );

      return { recorded: true };
    } catch (error) {
      console.error('Error recording impression:', error);
      return { recorded: false, reason: 'error', error: error.message };
    }
  }

  static async recordClick(advertisementId, clickType, visitorId) {
    try {
      // Check for duplicate within 5 seconds
      const checkQuery = `
        SELECT id FROM advertisement_impression_tracking
        WHERE advertisement_id = $1
          AND visitor_id = $2
          AND tracked_at > NOW() - INTERVAL '5 seconds'
        LIMIT 1
      `;

      const existing = await pool.query(checkQuery, [advertisementId, visitorId]);
      if (existing.rows.length > 0) {
        return { recorded: false, reason: 'duplicate' };
      }

      // Determine click field based on type
      let clickField = 'clicks';
      if (clickType === 'brand-link') {
        clickField = 'brand_link_clicks';
      } else if (clickType === 'cta-button') {
        clickField = 'cta_button_clicks';
      } else if (clickType === 'instagram-link') {
        clickField = 'instagram_link_clicks';
      }

      // Update statistics
      const updateQuery = `
        UPDATE advertisement_statistics
        SET clicks = clicks + 1, 
            ${clickField} = ${clickField} + 1, 
            last_updated = NOW()
        WHERE advertisement_id = $1
      `;

      await pool.query(updateQuery, [advertisementId]);

      // Update hourly breakdown
      const hour = new Date();
      hour.setMinutes(0, 0, 0);

      await pool.query(
        `INSERT INTO advertisement_hourly_stats (advertisement_id, hour_timestamp, impressions, clicks)
         VALUES ($1, $2, 0, 1)
         ON CONFLICT (advertisement_id, hour_timestamp)
         DO UPDATE SET clicks = advertisement_hourly_stats.clicks + 1`,
        [advertisementId, hour]
      );

      return { recorded: true };
    } catch (error) {
      console.error('Error recording click:', error);
      return { recorded: false, reason: 'error', error: error.message };
    }
  }

  static async getStatistics(advertisementId, days = 30) {
    try {
      const statsQuery = `
        SELECT * FROM advertisement_statistics
        WHERE advertisement_id = $1
      `;

      const hourlyQuery = `
        SELECT hour_timestamp, impressions, clicks
        FROM advertisement_hourly_stats
        WHERE advertisement_id = $1
          AND hour_timestamp >= NOW() - INTERVAL '${days} days'
        ORDER BY hour_timestamp DESC
      `;

      const [stats, hourly] = await Promise.all([
        pool.query(statsQuery, [advertisementId]),
        pool.query(hourlyQuery, [advertisementId])
      ]);

      const totalStats = stats.rows[0] || {
        impressions: 0,
        clicks: 0,
        brand_link_clicks: 0,
        cta_button_clicks: 0,
        instagram_link_clicks: 0
      };

      return {
        total: totalStats,
        hourly: hourly.rows,
        ctr: totalStats.impressions > 0 
          ? ((totalStats.clicks / totalStats.impressions) * 100).toFixed(2)
          : 0
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      throw error;
    }
  }

  static async getAggregateStatistics(filters = {}) {
    try {
      let whereClause = 'WHERE a.status = \'active\'';
      const params = [];

      if (filters.pricingTier) {
        whereClause += ` AND a.pricing_tier = $${params.length + 1}`;
        params.push(filters.pricingTier);
      }

      if (filters.placementPosition) {
        whereClause += ` AND a.placement_position = $${params.length + 1}`;
        params.push(filters.placementPosition);
      }

      const query = `
        SELECT 
          COUNT(DISTINCT a.id) as total_ads,
          COALESCE(SUM(s.impressions), 0) as total_impressions,
          COALESCE(SUM(s.clicks), 0) as total_clicks,
          CASE 
            WHEN COALESCE(SUM(s.impressions), 0) > 0 
            THEN ROUND((COALESCE(SUM(s.clicks), 0)::FLOAT / COALESCE(SUM(s.impressions), 0)) * 100, 2)
            ELSE 0
          END as average_ctr
        FROM advertisements a
        LEFT JOIN advertisement_statistics s ON s.advertisement_id = a.id
        ${whereClause}
      `;

      const result = await pool.query(query, params);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting aggregate statistics:', error);
      throw error;
    }
  }

  static async getStatisticsByPricingTier() {
    try {
      const query = `
        SELECT 
          a.pricing_tier,
          COUNT(DISTINCT a.id) as total_ads,
          COALESCE(SUM(s.impressions), 0) as total_impressions,
          COALESCE(SUM(s.clicks), 0) as total_clicks,
          CASE 
            WHEN COALESCE(SUM(s.impressions), 0) > 0 
            THEN ROUND((COALESCE(SUM(s.clicks), 0)::FLOAT / COALESCE(SUM(s.impressions), 0)) * 100, 2)
            ELSE 0
          END as average_ctr
        FROM advertisements a
        LEFT JOIN advertisement_statistics s ON s.advertisement_id = a.id
        WHERE a.status = 'active'
        GROUP BY a.pricing_tier
        ORDER BY a.pricing_tier
      `;

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting statistics by pricing tier:', error);
      throw error;
    }
  }

  static async getStatisticsByPlacement() {
    try {
      const query = `
        SELECT 
          a.placement_position,
          COUNT(DISTINCT a.id) as total_ads,
          COALESCE(SUM(s.impressions), 0) as total_impressions,
          COALESCE(SUM(s.clicks), 0) as total_clicks,
          CASE 
            WHEN COALESCE(SUM(s.impressions), 0) > 0 
            THEN ROUND((COALESCE(SUM(s.clicks), 0)::FLOAT / COALESCE(SUM(s.impressions), 0)) * 100, 2)
            ELSE 0
          END as average_ctr
        FROM advertisements a
        LEFT JOIN advertisement_statistics s ON s.advertisement_id = a.id
        WHERE a.status = 'active'
        GROUP BY a.placement_position
        ORDER BY a.placement_position
      `;

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting statistics by placement:', error);
      throw error;
    }
  }

  static async getTopPerformingAds(limit = 10) {
    try {
      const query = `
        SELECT 
          a.id,
          a.brand_name,
          a.pricing_tier,
          a.placement_position,
          s.impressions,
          s.clicks,
          CASE 
            WHEN s.impressions > 0 
            THEN ROUND((s.clicks::FLOAT / s.impressions) * 100, 2)
            ELSE 0
          END as ctr
        FROM advertisements a
        LEFT JOIN advertisement_statistics s ON s.advertisement_id = a.id
        WHERE a.status = 'active'
        ORDER BY ctr DESC, s.impressions DESC
        LIMIT $1
      `;

      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error getting top performing ads:', error);
      throw error;
    }
  }

  static async cleanupOldTracking(daysToKeep = 7) {
    try {
      const query = `
        DELETE FROM advertisement_impression_tracking
        WHERE tracked_at < NOW() - INTERVAL '${daysToKeep} days'
      `;

      const result = await pool.query(query);
      return result.rowCount;
    } catch (error) {
      console.error('Error cleaning up old tracking:', error);
      throw error;
    }
  }

  static async cleanupOldHourlyStats(daysToKeep = 30) {
    try {
      const query = `
        DELETE FROM advertisement_hourly_stats
        WHERE hour_timestamp < NOW() - INTERVAL '${daysToKeep} days'
      `;

      const result = await pool.query(query);
      return result.rowCount;
    } catch (error) {
      console.error('Error cleaning up old hourly stats:', error);
      throw error;
    }
  }
}

module.exports = AdvertisementAnalyticsService;
