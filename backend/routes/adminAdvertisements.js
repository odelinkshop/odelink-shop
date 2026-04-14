const express = require('express');
const Joi = require('joi');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const AdvertisementService = require('../services/advertisementService');
const AdvertisementAnalyticsService = require('../services/advertisementAnalyticsService');
const pool = require('../config/database');

const router = express.Router();

// Validation schemas
const approveAdSchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
  placementPosition: Joi.string()
    .valid('header-banner', 'hero-section', 'sidebar-top', 'sidebar-bottom', 'footer-banner')
    .required()
});

const rejectAdSchema = Joi.object({
  rejectionReason: Joi.string().max(500).optional()
});

const updateAdSchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  placementPosition: Joi.string()
    .valid('header-banner', 'hero-section', 'sidebar-top', 'sidebar-bottom', 'footer-banner')
    .optional()
});

// GET /api/admin/advertisements - Get all advertisements with filtering
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 50;
    const offset = (page - 1) * limit;

    const filters = {};
    if (req.query.status) {
      filters.status = req.query.status;
    }
    if (req.query.pricingTier) {
      filters.pricingTier = req.query.pricingTier;
    }
    if (req.query.paymentStatus) {
      filters.paymentStatus = req.query.paymentStatus;
    }

    const [advertisements, total] = await Promise.all([
      AdvertisementService.getAll(filters, limit, offset),
      AdvertisementService.countAll(filters)
    ]);

    return res.json({
      success: true,
      advertisements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all advertisements error:', error);
    return res.status(500).json({ error: 'Advertisements could not be retrieved' });
  }
});

// GET /api/admin/advertisements/:id - Get single advertisement with full details
router.get('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const ad = await AdvertisementService.getById(req.params.id);

    if (!ad) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }

    const logs = await AdvertisementService.getAdminLogs(req.params.id);

    return res.json({
      success: true,
      advertisement: ad,
      adminLogs: logs
    });
  } catch (error) {
    console.error('Get advertisement error:', error);
    return res.status(500).json({ error: 'Advertisement could not be retrieved' });
  }
});

// PATCH /api/admin/advertisements/:id/approve - Approve advertisement
router.patch('/:id/approve', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { error, value } = approveAdSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const ad = await AdvertisementService.getById(req.params.id);
    if (!ad) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }

    if (ad.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending advertisements can be approved' });
    }

    if (ad.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Advertisement must be paid before approval' });
    }

    // Validate dates
    const now = new Date();
    if (new Date(value.startDate) < now) {
      return res.status(400).json({ error: 'Start date cannot be in the past' });
    }

    const updated = await AdvertisementService.updateStatus(req.params.id, 'approved', {
      startDate: value.startDate,
      endDate: value.endDate,
      placementPosition: value.placementPosition
    });

    // Log admin action
    await AdvertisementService.logAdminAction(req.userId, req.params.id, 'approve', {
      startDate: value.startDate,
      endDate: value.endDate,
      placementPosition: value.placementPosition
    });

    return res.json({
      success: true,
      message: 'Advertisement approved successfully',
      advertisement: updated
    });
  } catch (error) {
    console.error('Approve advertisement error:', error);
    return res.status(500).json({ error: 'Advertisement could not be approved' });
  }
});

// PATCH /api/admin/advertisements/:id/reject - Reject advertisement
router.patch('/:id/reject', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { error, value } = rejectAdSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const ad = await AdvertisementService.getById(req.params.id);
    if (!ad) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }

    if (ad.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending advertisements can be rejected' });
    }

    const updated = await AdvertisementService.updateStatus(req.params.id, 'rejected', {
      rejectionReason: value.rejectionReason || null
    });

    // Log admin action
    await AdvertisementService.logAdminAction(req.userId, req.params.id, 'reject', {
      rejectionReason: value.rejectionReason
    });

    return res.json({
      success: true,
      message: 'Advertisement rejected successfully',
      advertisement: updated
    });
  } catch (error) {
    console.error('Reject advertisement error:', error);
    return res.status(500).json({ error: 'Advertisement could not be rejected' });
  }
});

// PATCH /api/admin/advertisements/:id - Update advertisement details
router.patch('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { error, value } = updateAdSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const ad = await AdvertisementService.getById(req.params.id);
    if (!ad) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }

    if (ad.status !== 'approved' && ad.status !== 'active') {
      return res.status(400).json({ error: 'Only approved or active advertisements can be updated' });
    }

    const updateData = {};
    if (value.startDate) updateData.start_date = value.startDate;
    if (value.endDate) updateData.end_date = value.endDate;
    if (value.placementPosition) updateData.placement_position = value.placementPosition;

    const updated = await AdvertisementService.update(req.params.id, updateData);

    // Log admin action
    await AdvertisementService.logAdminAction(req.userId, req.params.id, 'update', updateData);

    return res.json({
      success: true,
      message: 'Advertisement updated successfully',
      advertisement: updated
    });
  } catch (error) {
    console.error('Update advertisement error:', error);
    return res.status(500).json({ error: 'Advertisement could not be updated' });
  }
});

// DELETE /api/admin/advertisements/:id - Delete advertisement
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const ad = await AdvertisementService.getById(req.params.id);
    if (!ad) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }

    await AdvertisementService.delete(req.params.id);

    // Log admin action
    await AdvertisementService.logAdminAction(req.userId, req.params.id, 'delete', {
      brandName: ad.brand_name,
      status: ad.status
    });

    return res.json({
      success: true,
      message: 'Advertisement deleted successfully'
    });
  } catch (error) {
    console.error('Delete advertisement error:', error);
    return res.status(500).json({ error: 'Advertisement could not be deleted' });
  }
});

// GET /api/admin/advertisements/statistics - Get aggregate statistics
router.get('/statistics', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [
      aggregateStats,
      statsByTier,
      statsByPlacement,
      topAds
    ] = await Promise.all([
      AdvertisementAnalyticsService.getAggregateStatistics(),
      AdvertisementAnalyticsService.getStatisticsByPricingTier(),
      AdvertisementAnalyticsService.getStatisticsByPlacement(),
      AdvertisementAnalyticsService.getTopPerformingAds(10)
    ]);

    // Calculate revenue
    const pricingTierPrices = {
      baslangic: 500,
      profesyonel: 1200,
      premium: 2500
    };

    const revenueByTier = statsByTier.map(tier => ({
      ...tier,
      revenue: tier.total_ads * (pricingTierPrices[tier.pricing_tier] || 0)
    }));

    const totalRevenue = revenueByTier.reduce((sum, tier) => sum + tier.revenue, 0);

    return res.json({
      success: true,
      statistics: {
        aggregate: aggregateStats,
        byPricingTier: revenueByTier,
        byPlacement: statsByPlacement,
        topPerforming: topAds,
        totalRevenue,
        projectedMonthlyRevenue: totalRevenue // Simplified - would need more complex calculation
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    return res.status(500).json({ error: 'Statistics could not be retrieved' });
  }
});

module.exports = router;
