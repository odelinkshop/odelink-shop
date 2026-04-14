const AdvertisementService = require('./advertisementService');

class AdvertisementStatusUpdater {
  static async updateStatuses() {
    try {
      console.log('🔄 Updating advertisement statuses...');

      const expiredCount = await AdvertisementService.updateExpiredAds();
      if (expiredCount > 0) {
        console.log(`✅ Expired ${expiredCount} advertisements`);
      }

      const activatedCount = await AdvertisementService.activateApprovedAds();
      if (activatedCount > 0) {
        console.log(`✅ Activated ${activatedCount} advertisements`);
      }

      return { expiredCount, activatedCount };
    } catch (error) {
      console.error('❌ Error updating advertisement statuses:', error);
      throw error;
    }
  }

  static startScheduler(intervalMinutes = 5) {
    console.log(`⏰ Starting advertisement status updater (every ${intervalMinutes} minutes)`);

    // Run immediately on start
    this.updateStatuses().catch(err => {
      console.error('Initial status update failed:', err);
    });

    // Then run on interval
    const intervalMs = intervalMinutes * 60 * 1000;
    const intervalId = setInterval(() => {
      this.updateStatuses().catch(err => {
        console.error('Scheduled status update failed:', err);
      });
    }, intervalMs);

    return intervalId;
  }
}

module.exports = AdvertisementStatusUpdater;
