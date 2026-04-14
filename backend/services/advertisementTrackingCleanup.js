const AdvertisementAnalyticsService = require('./advertisementAnalyticsService');

class AdvertisementTrackingCleanup {
  static async cleanup() {
    try {
      console.log('🧹 Cleaning up old advertisement tracking data...');

      const trackingDeleted = await AdvertisementAnalyticsService.cleanupOldTracking(7);
      console.log(`✅ Deleted ${trackingDeleted} old tracking records`);

      const hourlyDeleted = await AdvertisementAnalyticsService.cleanupOldHourlyStats(30);
      console.log(`✅ Deleted ${hourlyDeleted} old hourly stats records`);

      return { trackingDeleted, hourlyDeleted };
    } catch (error) {
      console.error('❌ Error cleaning up tracking data:', error);
      throw error;
    }
  }

  static startScheduler(intervalHours = 24) {
    console.log(`⏰ Starting advertisement tracking cleanup (every ${intervalHours} hours)`);

    // Run immediately on start
    this.cleanup().catch(err => {
      console.error('Initial cleanup failed:', err);
    });

    // Then run on interval
    const intervalMs = intervalHours * 60 * 60 * 1000;
    const intervalId = setInterval(() => {
      this.cleanup().catch(err => {
        console.error('Scheduled cleanup failed:', err);
      });
    }, intervalMs);

    return intervalId;
  }
}

module.exports = AdvertisementTrackingCleanup;
