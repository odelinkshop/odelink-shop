const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const hourlyBreakdownSchema = new mongoose.Schema({
  hour: {
    type: String,
    required: true // Format: "YYYY-MM-DD HH:00"
  },
  impressions: {
    type: Number,
    default: 0,
    min: 0
  },
  clicks: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

const adStatisticsSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  advertisementId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  impressions: {
    type: Number,
    default: 0,
    min: 0
  },
  clicks: {
    type: Number,
    default: 0,
    min: 0
  },
  hourlyBreakdown: [hourlyBreakdownSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'adstatistics'
});

// Virtual for CTR calculation
adStatisticsSchema.virtual('ctr').get(function() {
  if (this.impressions === 0) return 0;
  return ((this.clicks / this.impressions) * 100).toFixed(2);
});

// Method to increment impressions
adStatisticsSchema.methods.incrementImpressions = function() {
  this.impressions += 1;
  this.lastUpdated = new Date();
  
  // Update hourly breakdown
  const currentHour = new Date().toISOString().slice(0, 13) + ':00';
  const hourlyEntry = this.hourlyBreakdown.find(entry => entry.hour === currentHour);
  
  if (hourlyEntry) {
    hourlyEntry.impressions += 1;
  } else {
    this.hourlyBreakdown.push({
      hour: currentHour,
      impressions: 1,
      clicks: 0
    });
  }
  
  // Keep only last 30 days of hourly data
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffHour = thirtyDaysAgo.toISOString().slice(0, 13) + ':00';
  
  this.hourlyBreakdown = this.hourlyBreakdown.filter(entry => entry.hour >= cutoffHour);
  
  return this.save();
};

// Method to increment clicks
adStatisticsSchema.methods.incrementClicks = function() {
  this.clicks += 1;
  this.lastUpdated = new Date();
  
  // Update hourly breakdown
  const currentHour = new Date().toISOString().slice(0, 13) + ':00';
  const hourlyEntry = this.hourlyBreakdown.find(entry => entry.hour === currentHour);
  
  if (hourlyEntry) {
    hourlyEntry.clicks += 1;
  } else {
    this.hourlyBreakdown.push({
      hour: currentHour,
      impressions: 0,
      clicks: 1
    });
  }
  
  // Keep only last 30 days of hourly data
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffHour = thirtyDaysAgo.toISOString().slice(0, 13) + ':00';
  
  this.hourlyBreakdown = this.hourlyBreakdown.filter(entry => entry.hour >= cutoffHour);
  
  return this.save();
};

// Method to get last 24 hours breakdown
adStatisticsSchema.methods.getLast24Hours = function() {
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
  const cutoffHour = twentyFourHoursAgo.toISOString().slice(0, 13) + ':00';
  
  return this.hourlyBreakdown
    .filter(entry => entry.hour >= cutoffHour)
    .sort((a, b) => a.hour.localeCompare(b.hour));
};

// Static method to create statistics for new advertisement
adStatisticsSchema.statics.createForAdvertisement = function(advertisementId) {
  return this.create({
    advertisementId,
    impressions: 0,
    clicks: 0,
    hourlyBreakdown: []
  });
};

// Static method to get aggregate statistics
adStatisticsSchema.statics.getAggregateStats = async function() {
  const pipeline = [
    {
      $group: {
        _id: null,
        totalImpressions: { $sum: '$impressions' },
        totalClicks: { $sum: '$clicks' },
        totalAds: { $sum: 1 }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  const stats = result[0] || { totalImpressions: 0, totalClicks: 0, totalAds: 0 };
  
  stats.averageCTR = stats.totalImpressions > 0 
    ? ((stats.totalClicks / stats.totalImpressions) * 100).toFixed(2)
    : 0;
    
  return stats;
};

// Index for efficient queries
adStatisticsSchema.index({ advertisementId: 1 });
adStatisticsSchema.index({ lastUpdated: -1 });

module.exports = mongoose.model('AdStatistics', adStatisticsSchema);