const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'API key name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  hashedKey: {
    type: String,
    required: true
  },
  permissions: [{
    type: String,
    enum: ['read', 'write', 'admin', 'analytics'],
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date,
    default: null
  },
  rateLimit: {
    type: Number,
    default: 1000,
    min: [1, 'Rate limit must be at least 1']
  },
  expiresAt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUsedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  usage: [{
    endpoint: String,
    method: String,
    timestamp: { type: Date, default: Date.now },
    ip: String,
    userAgent: String
  }]
}, {
  timestamps: true
});

// Indexes for performance
apiKeySchema.index({ hashedKey: 1 });
apiKeySchema.index({ isActive: 1, expiresAt: 1 });
apiKeySchema.index({ createdBy: 1 });

// Virtual for checking if key is expired
apiKeySchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Virtual for checking if key is valid
apiKeySchema.virtual('isValid').get(function() {
  return this.isActive && !this.isExpired;
});

// Pre-save hook to hash the API key
apiKeySchema.pre('save', function(next) {
  if (this.isNew && this.key) {
    this.hashedKey = crypto.createHash('sha256').update(this.key).digest('hex');
  }
  next();
});

// Static method to generate a new API key
apiKeySchema.statics.generateKey = function() {
  const prefix = 'sk_live_';
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return prefix + randomBytes;
};

// Static method to find by key (comparing hashed versions)
apiKeySchema.statics.findByKey = async function(apiKey) {
  const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
  return this.findOne({ 
    hashedKey,
    isActive: true,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  }).populate('createdBy', 'name email');
};

// Method to log usage
apiKeySchema.methods.logUsage = async function(endpoint, method, ip, userAgent) {
  this.usageCount += 1;
  this.lastUsed = new Date();
  
  // Keep only last 100 usage records
  if (this.usage.length >= 100) {
    this.usage.shift();
  }
  
  this.usage.push({
    endpoint,
    method,
    timestamp: new Date(),
    ip,
    userAgent
  });
  
  await this.save();
};

// Method to check permissions
apiKeySchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

apiKeySchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    // Don't return the actual key or hashed key in JSON
    delete ret.key;
    delete ret.hashedKey;
    return ret;
  }
});

module.exports = mongoose.model('ApiKey', apiKeySchema);
