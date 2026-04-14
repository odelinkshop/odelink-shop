const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const advertisementSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  shopierUrl: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.*shopier\.com\/.*/.test(v);
      },
      message: 'Shopier URL format is invalid'
    }
  },
  brandName: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },
  instagramHandle: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9_.]+$/.test(v);
      },
      message: 'Instagram handle can only contain letters, numbers, underscores, and periods'
    },
    maxlength: 50,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 500,
    trim: true
  },
  logoUrl: {
    type: String,
    default: null
  },
  pricingTier: {
    type: String,
    required: true,
    enum: ['baslangic', 'profesyonel', 'premium'],
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected', 'active', 'expired'],
    default: 'pending',
    index: true
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  placementPosition: {
    type: String,
    enum: ['header-banner', 'hero-section', 'sidebar-top', 'sidebar-bottom', 'footer-banner'],
    default: 'header-banner'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['shopier', 'manual', 'bank-transfer'],
    default: null
  },
  paymentTransactionId: {
    type: String,
    default: null
  },
  paymentAmount: {
    type: Number,
    default: null
  },
  paymentDate: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'advertisements'
});

// Compound indexes for efficient queries
advertisementSchema.index({ status: 1, startDate: 1, endDate: 1 });
advertisementSchema.index({ userId: 1, createdAt: -1 });
advertisementSchema.index({ status: 1, createdAt: -1 });

// Virtual for pricing tier amounts
advertisementSchema.virtual('pricingAmount').get(function() {
  const amounts = {
    'baslangic': 500,
    'profesyonel': 1200,
    'premium': 2500
  };
  return amounts[this.pricingTier] || 0;
});

// Method to check if advertisement is currently active
advertisementSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'active' && 
         this.startDate && 
         this.endDate && 
         now >= this.startDate && 
         now <= this.endDate;
};

// Method to update status based on dates
advertisementSchema.methods.updateStatusByDate = function() {
  const now = new Date();
  
  if (this.status === 'approved' && this.startDate && now >= this.startDate && this.endDate && now <= this.endDate) {
    this.status = 'active';
  } else if (this.status === 'active' && this.endDate && now > this.endDate) {
    this.status = 'expired';
  }
  
  return this.save();
};

// Static method to get active advertisements
advertisementSchema.statics.getActiveAds = function(placementPosition = null) {
  const query = {
    status: 'active',
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  };
  
  if (placementPosition) {
    query.placementPosition = placementPosition;
  }
  
  return this.find(query).sort({ createdAt: -1 });
};

// Pre-save middleware to update timestamps
advertisementSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Advertisement', advertisementSchema);