const express = require('express');
const Advertisement = require('../../models/Advertisement');
const AdStatistics = require('../../models/AdStatistics');
const auth = require('../../middleware/auth');
const adminOnly = require('../../middleware/adminOnly');

const router = express.Router();

// Input validation for admin operations
const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 'Invalid date format';
  }
  
  if (start >= end) {
    return 'Start date must be before end date';
  }
  
  if (start < now) {
    return 'Start date cannot be in the past';
  }
  
  return null;
};

const validatePlacementPosition = (position) => {
  const validPositions = ['header-banner', 'hero-section', 'sidebar-top', 'sidebar-bottom', 'footer-banner'];
  return validPositions.includes(position);
};

// GET /api/admin/advertisements - Get all advertisements
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const pricingTier = req.query.pricingTier;
    
    // Build query
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (pricingTier && pricingTier !== 'all') {
      query.pricingTier = pricingTier;
    }
    
    const advertisements = await Advertisement
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get statistics for each advertisement
    const advertisementsWithStats = await Promise.all(
      advertisements.map(async (ad) => {
        const stats = await AdStatistics.findOne({ advertisementId: ad._id });
        return {
          ...ad,
          statistics: stats ? {
            impressions: stats.impressions,
            clicks: stats.clicks,
            ctr: stats.ctr
          } : { impressions: 0, clicks: 0, ctr: 0 }
        };
      })
    );
    
    const total = await Advertisement.countDocuments(query);
    
    res.json({
      advertisements: advertisementsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching advertisements for admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/admin/advertisements/:id/approve - Approve advertisement
router.patch('/:id/approve', auth, adminOnly, async (req, res) => {
  try {
    const { startDate, endDate, placementPosition } = req.body;
    
    // Validate required fields
    if (!startDate || !endDate || !placementPosition) {
      return res.status(400).json({ error: 'Start date, end date, and placement position are required' });
    }
    
    // Validate date range
    const dateError = validateDateRange(startDate, endDate);
    if (dateError) {
      return res.status(400).json({ error: dateError });
    }
    
    // Validate placement position
    if (!validatePlacementPosition(placementPosition)) {
      return res.status(400).json({ error: 'Invalid placement position' });
    }
    
    const advertisement = await Advertisement.findById(req.params.id);
    
    if (!advertisement) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }
    
    if (advertisement.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending advertisements can be approved' });
    }
    
    // Check if payment is completed (if payment system is implemented)
    if (advertisement.paymentStatus !== 'paid') {
      return res.status(400).json({ error: 'Advertisement must be paid before approval' });
    }
    
    // Update advertisement
    advertisement.status = 'approved';
    advertisement.startDate = new Date(startDate);
    advertisement.endDate = new Date(endDate);
    advertisement.placementPosition = placementPosition;
    
    // Check if it should be active immediately
    const now = new Date();
    if (advertisement.startDate <= now && advertisement.endDate >= now) {
      advertisement.status = 'active';
    }
    
    await advertisement.save();
    
    // Log admin action
    console.log(`Admin ${req.user.id} approved advertisement ${advertisement._id}`);
    
    res.json({
      message: 'Advertisement approved successfully',
      advertisement: {
        id: advertisement._id,
        status: advertisement.status,
        startDate: advertisement.startDate,
        endDate: advertisement.endDate,
        placementPosition: advertisement.placementPosition
      }
    });
  } catch (error) {
    console.error('Error approving advertisement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/admin/advertisements/:id/reject - Reject advertisement
router.patch('/:id/reject', auth, adminOnly, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    
    const advertisement = await Advertisement.findById(req.params.id);
    
    if (!advertisement) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }
    
    if (advertisement.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending advertisements can be rejected' });
    }
    
    advertisement.status = 'rejected';
    if (rejectionReason) {
      advertisement.rejectionReason = rejectionReason.trim().substring(0, 500);
    }
    
    await advertisement.save();
    
    // Log admin action
    console.log(`Admin ${req.user.id} rejected advertisement ${advertisement._id}`);
    
    res.json({
      message: 'Advertisement rejected successfully',
      advertisement: {
        id: advertisement._id,
        status: advertisement.status,
        rejectionReason: advertisement.rejectionReason
      }
    });
  } catch (error) {
    console.error('Error rejecting advertisement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/admin/advertisements/:id - Update advertisement details
router.patch('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { startDate, endDate, placementPosition, status } = req.body;
    
    const advertisement = await Advertisement.findById(req.params.id);
    
    if (!advertisement) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }
    
    // Validate dates if provided
    if (startDate && endDate) {
      const dateError = validateDateRange(startDate, endDate);
      if (dateError) {
        return res.status(400).json({ error: dateError });
      }
      advertisement.startDate = new Date(startDate);
      advertisement.endDate = new Date(endDate);
    }
    
    // Validate placement position if provided
    if (placementPosition) {
      if (!validatePlacementPosition(placementPosition)) {
        return res.status(400).json({ error: 'Invalid placement position' });
      }
      advertisement.placementPosition = placementPosition;
    }
    
    // Validate status if provided
    if (status) {
      const validStatuses = ['pending', 'approved', 'rejected', 'active', 'expired'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      advertisement.status = status;
    }
    
    await advertisement.save();
    
    // Log admin action
    console.log(`Admin ${req.user.id} updated advertisement ${advertisement._id}`);
    
    res.json({
      message: 'Advertisement updated successfully',
      advertisement
    });
  } catch (error) {
    console.error('Error updating advertisement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/advertisements/:id - Delete advertisement
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);
    
    if (!advertisement) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }
    
    // Delete associated statistics
    await AdStatistics.deleteOne({ advertisementId: req.params.id });
    
    // Delete advertisement
    await Advertisement.deleteOne({ _id: req.params.id });
    
    // Log admin action
    console.log(`Admin ${req.user.id} deleted advertisement ${req.params.id}`);
    
    res.json({ message: 'Advertisement deleted successfully' });
  } catch (error) {
    console.error('Error deleting advertisement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/admin/advertisements/:id/payment - Mark payment as received
router.patch('/:id/payment', auth, adminOnly, async (req, res) => {
  try {
    const { paymentMethod, transactionId, amount } = req.body;
    
    const advertisement = await Advertisement.findById(req.params.id);
    
    if (!advertisement) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }
    
    advertisement.paymentStatus = 'paid';
    advertisement.paymentMethod = paymentMethod || 'manual';
    advertisement.paymentTransactionId = transactionId;
    advertisement.paymentAmount = amount || advertisement.pricingAmount;
    advertisement.paymentDate = new Date();
    
    await advertisement.save();
    
    // Log admin action
    console.log(`Admin ${req.user.id} marked payment as received for advertisement ${advertisement._id}`);
    
    res.json({
      message: 'Payment marked as received',
      advertisement: {
        id: advertisement._id,
        paymentStatus: advertisement.paymentStatus,
        paymentMethod: advertisement.paymentMethod,
        paymentAmount: advertisement.paymentAmount,
        paymentDate: advertisement.paymentDate
      }
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/advertisements/statistics - Get aggregate statistics
router.get('/statistics', auth, adminOnly, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }
    
    // Get aggregate statistics
    const aggregateStats = await AdStatistics.getAggregateStats();
    
    // Get statistics by pricing tier
    const tierStats = await Advertisement.aggregate([
      ...(Object.keys(dateFilter).length > 0 ? [{ $match: { createdAt: dateFilter } }] : []),
      {
        $lookup: {
          from: 'adstatistics',
          localField: '_id',
          foreignField: 'advertisementId',
          as: 'statistics'
        }
      },
      {
        $group: {
          _id: '$pricingTier',
          totalAds: { $sum: 1 },
          totalImpressions: { $sum: { $arrayElemAt: ['$statistics.impressions', 0] } },
          totalClicks: { $sum: { $arrayElemAt: ['$statistics.clicks', 0] } }
        }
      }
    ]);
    
    // Calculate CTR for each tier
    tierStats.forEach(tier => {
      tier.averageCTR = tier.totalImpressions > 0 
        ? ((tier.totalClicks / tier.totalImpressions) * 100).toFixed(2)
        : 0;
    });
    
    // Get statistics by placement position
    const placementStats = await Advertisement.aggregate([
      { $match: { status: 'active' } },
      {
        $lookup: {
          from: 'adstatistics',
          localField: '_id',
          foreignField: 'advertisementId',
          as: 'statistics'
        }
      },
      {
        $group: {
          _id: '$placementPosition',
          totalAds: { $sum: 1 },
          totalImpressions: { $sum: { $arrayElemAt: ['$statistics.impressions', 0] } },
          totalClicks: { $sum: { $arrayElemAt: ['$statistics.clicks', 0] } }
        }
      }
    ]);
    
    // Calculate CTR for each placement
    placementStats.forEach(placement => {
      placement.averageCTR = placement.totalImpressions > 0 
        ? ((placement.totalClicks / placement.totalImpressions) * 100).toFixed(2)
        : 0;
    });
    
    // Get top performing advertisements
    const topPerforming = await AdStatistics.aggregate([
      { $match: { impressions: { $gt: 0 } } },
      {
        $lookup: {
          from: 'advertisements',
          localField: 'advertisementId',
          foreignField: '_id',
          as: 'advertisement'
        }
      },
      { $unwind: '$advertisement' },
      {
        $addFields: {
          ctr: { $multiply: [{ $divide: ['$clicks', '$impressions'] }, 100] }
        }
      },
      { $sort: { ctr: -1 } },
      { $limit: 10 },
      {
        $project: {
          advertisementId: 1,
          brandName: '$advertisement.brandName',
          pricingTier: '$advertisement.pricingTier',
          impressions: 1,
          clicks: 1,
          ctr: 1
        }
      }
    ]);
    
    // Calculate revenue summary
    const revenueStats = await Advertisement.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: '$pricingTier',
          count: { $sum: 1 },
          revenue: { $sum: '$paymentAmount' }
        }
      }
    ]);
    
    const totalRevenue = revenueStats.reduce((sum, tier) => sum + (tier.revenue || 0), 0);
    
    // Get active ads count
    const activeAdsCount = await Advertisement.countDocuments({ status: 'active' });
    
    // Calculate projected monthly revenue
    const projectedRevenue = await Advertisement.aggregate([
      { $match: { status: { $in: ['active', 'approved'] } } },
      {
        $group: {
          _id: '$pricingTier',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const monthlyProjection = projectedRevenue.reduce((sum, tier) => {
      const amounts = { baslangic: 500, profesyonel: 1200, premium: 2500 };
      return sum + (tier.count * (amounts[tier._id] || 0));
    }, 0);
    
    res.json({
      aggregate: aggregateStats,
      byTier: tierStats,
      byPlacement: placementStats,
      topPerforming,
      revenue: {
        total: totalRevenue,
        byTier: revenueStats,
        monthlyProjection
      },
      activeAds: activeAdsCount
    });
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;