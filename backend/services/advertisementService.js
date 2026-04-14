const Advertisement = require('../models/Advertisement');
const pool = require('../config/database');

class AdvertisementService {
  static async create(data) {
    return Advertisement.create(data);
  }

  static async getById(id) {
    return Advertisement.findById(id);
  }

  static async getByUserId(userId, limit = 20, offset = 0) {
    return Advertisement.findByUserId(userId, limit, offset);
  }

  static async countByUserId(userId) {
    return Advertisement.countByUserId(userId);
  }

  static async getActiveByPlacement(placement) {
    return Advertisement.getActiveByPlacement(placement);
  }

  static async getAllActive() {
    return Advertisement.getAllActive();
  }

  static async getAll(filters = {}, limit = 50, offset = 0) {
    return Advertisement.getAll(filters, limit, offset);
  }

  static async countAll(filters = {}) {
    return Advertisement.countAll(filters);
  }

  static async updateStatus(id, status, additionalData = {}) {
    return Advertisement.updateStatus(id, status, additionalData);
  }

  static async updatePayment(id, paymentData) {
    return Advertisement.updatePayment(id, paymentData);
  }

  static async updateExpiredAds() {
    return Advertisement.updateExpiredAds();
  }

  static async activateApprovedAds() {
    return Advertisement.activateApprovedAds();
  }

  static async delete(id) {
    return Advertisement.delete(id);
  }

  static async update(id, data) {
    return Advertisement.update(id, data);
  }

  static async logAdminAction(adminUserId, advertisementId, action, details = {}) {
    const query = `
      INSERT INTO advertisement_admin_logs (admin_user_id, advertisement_id, action, details)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(query, [
      adminUserId,
      advertisementId,
      action,
      JSON.stringify(details)
    ]);

    return result.rows[0];
  }

  static async getAdminLogs(advertisementId) {
    const query = `
      SELECT * FROM advertisement_admin_logs
      WHERE advertisement_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [advertisementId]);
    return result.rows;
  }
}

module.exports = AdvertisementService;
