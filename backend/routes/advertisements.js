const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const Advertisement = require('../models/Advertisement');
const AdStatistics = require('../models/AdStatistics');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const rateLimiters = require('../middleware/rateLimiters');

const router = express.Router();

// Configure multer for logo uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/logos');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPG, JPEG, and SVG are allowed.'));
    }
  }
});

// Input validation and sanitization
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '').trim();
};

const validateAdvertisementInput = (req, res, next) => {
  const { shopierUrl, brandName, instagramHandle, description, pricingTier } = req.body;
  
  // Sanitize inputs
  req.body.shopierUrl = sanitizeInput(shopierUrl);
  req.body.brandName = sanitizeInput(brandName);
  req.body.instagramHandle = sanitizeInput(instagramHandle);
  req.body.description = sanitizeInput(description);
  req.body.pricingTier = sanitizeInput(pricingTier);
  
  // Validate required fields
  if (!req.body.shopierUrl || !req.body.brandName || !req.body.instagramHandle || !req.body.description || !req.body.pricingTier) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }
  
  // Validate Shopier URL
  if (!/^https?:\/\/.*shopier\.com\/.*/.test(req.body.shopierUrl)) {
    return res.status(400).json({ error: 'Invalid Shopier URL format' });
  }
  
  // Validate Instagram handle
  if (!/^[a-zA-Z0-9_.]+$/.test(req.body.instagramHandle)) {
    return res.status(400).json({ error: 'Instagram handle can only contain letters, numbers, underscores, and periods' });
  }
  
  // Validate pricing tier
  if (!['baslangic', 'profesyonel', 'premium'].includes(req.body.pricingTier)) {
    return res.status(400).json({ error: 'Invalid pricing tier' });
  }
  
  // Validate field lengths
  if (req.body.brandName.length > 100) {
    return res.status(400).json({ error: 'Brand name must be 100 characters or less' });
  }
  
  if (req.body.description.length > 500) {
    return res.status(400).json({ error: 'Description must be 500 characters or less' });
  }
  
  if (req.body.instagramHandle.length > 50) {
    return res.status(400).json({ error: 'Instagram handle must be 50 characters or less' });
  }
  
  next();
};

// Rate limiting for advertisement creation
const createAdLimiter = rateLimiters.createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // 5 ads per day per user
  message: 'Too many advertisements created. Maximum 5 per day allowed.',
  keyGenerator: (req) => req.user?.id || req.ip
});

// Rate limiting for tracking endpoints
const trackingLimiter = rateLimiters.createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: 'Too many tracking requests. Please slow down.'
});

// POST /api/advertisements - Create new advertisement
router.post('/', auth, createAdLimiter, upload.single('logo'), validateAdvertisementInput, async (req, res) => {
  try {
    const { shopierUrl, brandName, instagramHandle, description, pricingTier } = req.body;
    
    const advertisementData = {
      userId: req.user.id,
      shopierUrl,
      brandName,
      instagramHandle,
      description,
      pricingTier,
      status: 'pending'
    };
    
    // Add logo URL if file was uploaded
    if (req.file) {
      advertisementData.logoUrl = `/uploads/logos/${req.file.filename}`;
    }
    
    const advertisement = new Advertisement(advertisementData);
    await advertisement.save();
    
    // Create statistics record
    await AdStatistics.createForAdvertisement(advertisement._id);
    
    res.status(201).json({
      message: 'Advertisement submitted successfully',
      advertisement: {
        id: advertisement._id,
        brandName: advertisement.brandName,
        status: advertisement.status,
        pricingTier: advertisement.pricingTier,
        createdAt: advertisement.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating advertisement:', error);
    
    // Clean up uploaded file if advertisement creation failed
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/advertisements/my - Get user's advertisements
router.get('/my', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const advertisements = await Advertisement
      .find({ userId: req.user.id })
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
    
    const total = await Advertisement.countDocuments({ userId: req.user.id });
    
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
    console.error('Error fetching user advertisements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/advertisements/active - Get active advertisements (public)
router.get('/active', async (req, res) => {
  try {
    const placementPosition = req.query.placement;
    const advertisements = await Advertisement.getActiveAds(placementPosition);
    
    // Update status for any advertisements that should be active/expired
    await Promise.all(
      advertisements.map(ad => ad.updateStatusByDate())
    );
    
    // Filter again after status updates
    const activeAds = advertisements.filter(ad => ad.isActive());
    
    res.json({
      advertisements: activeAds.map(ad => ({
        id: ad._id,
        brandName: ad.brandName,
        shopierUrl: ad.shopierUrl,
        instagramHandle: ad.instagramHandle,
        description: ad.description,
        logoUrl: ad.logoUrl,
        placementPosition: ad.placementPosition
      }))
    });
  } catch (error) {
    console.error('Error fetching active advertisements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/advertisements/:id - Get single advertisement
router.get('/:id', auth, async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);
    
    if (!advertisement) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }
    
    // Check if user owns the advertisement or is admin
    if (advertisement.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const statistics = await AdStatistics.findOne({ advertisementId: advertisement._id });
    
    res.json({
      advertisement,
      statistics: statistics || { impressions: 0, clicks: 0, ctr: 0, hourlyBreakdown: [] }
    });
  } catch (error) {
    console.error('Error fetching advertisement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/advertisements/:id/impression - Track impression
router.post('/:id/impression', trackingLimiter, async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);
    
    if (!advertisement || !advertisement.isActive()) {
      return res.status(404).json({ error: 'Advertisement not found or not active' });
    }
    
    let statistics = await AdStatistics.findOne({ advertisementId: req.params.id });
    
    if (!statistics) {
      statistics = await AdStatistics.createForAdvertisement(req.params.id);
    }
    
    await statistics.incrementImpressions();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking impression:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/advertisements/:id/click - Track click
router.post('/:id/click', trackingLimiter, async (req, res) => {
  try {
    const { elementType } = req.body; // 'brand-link', 'cta-button', 'instagram-link'
    
    const advertisement = await Advertisement.findById(req.params.id);
    
    if (!advertisement || !advertisement.isActive()) {
      return res.status(404).json({ error: 'Advertisement not found or not active' });
    }
    
    let statistics = await AdStatistics.findOne({ advertisementId: req.params.id });
    
    if (!statistics) {
      statistics = await AdStatistics.createForAdvertisement(req.params.id);
    }
    
    await statistics.incrementClicks();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/advertisements/:id/statistics - Get advertisement statistics
router.get('/:id/statistics', auth, async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);
    
    if (!advertisement) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }
    
    // Check if user owns the advertisement or is admin
    if (advertisement.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const statistics = await AdStatistics.findOne({ advertisementId: req.params.id });
    
    if (!statistics) {
      return res.json({
        impressions: 0,
        clicks: 0,
        ctr: 0,
        last24Hours: [],
        lastUpdated: null
      });
    }
    
    res.json({
      impressions: statistics.impressions,
      clicks: statistics.clicks,
      ctr: parseFloat(statistics.ctr),
      last24Hours: statistics.getLast24Hours(),
      lastUpdated: statistics.lastUpdated
    });
  } catch (error) {
    console.error('Error fetching advertisement statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;