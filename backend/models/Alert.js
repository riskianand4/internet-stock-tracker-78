const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['OUT_OF_STOCK', 'LOW_STOCK', 'OVERSTOCK', 'EXPIRING', 'SYSTEM', 'SECURITY', 'PERFORMANCE'],
    required: [true, 'Alert type is required']
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Alert message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: function() {
      return ['OUT_OF_STOCK', 'LOW_STOCK', 'OVERSTOCK', 'EXPIRING'].includes(this.type);
    }
  },
  productName: {
    type: String,
    trim: true
  },
  productCode: {
    type: String,
    trim: true
  },
  currentStock: {
    type: Number,
    min: 0
  },
  threshold: {
    type: Number,
    min: 0
  },
  category: {
    type: String,
    enum: ['inventory', 'system_health', 'security', 'performance', 'maintenance'],
    default: 'inventory'
  },
  acknowledged: {
    type: Boolean,
    default: false
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledgedAt: {
    type: Date
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

// Indexes
alertSchema.index({ type: 1, createdAt: -1 });
alertSchema.index({ severity: 1, acknowledged: 1 });
alertSchema.index({ product: 1, type: 1 });
alertSchema.index({ acknowledged: 1, resolved: 1 });
alertSchema.index({ category: 1 });

// Auto-populate product details for stock-related alerts
alertSchema.pre('save', async function(next) {
  if (this.product && ['OUT_OF_STOCK', 'LOW_STOCK', 'OVERSTOCK', 'EXPIRING'].includes(this.type)) {
    const Product = mongoose.model('Product');
    const product = await Product.findById(this.product);
    if (product) {
      this.productName = product.name;
      this.productCode = product.sku;
      this.currentStock = product.stock?.current || 0;
    }
  }
  next();
});

// Static method to create stock alerts
alertSchema.statics.createStockAlert = async function(product, type, message, severity = 'MEDIUM') {
  return this.create({
    type,
    severity,
    title: `${type.replace('_', ' ')} Alert: ${product.name}`,
    message,
    product: product._id,
    productName: product.name,
    productCode: product.sku,
    currentStock: product.stock?.current || 0,
    threshold: product.stock?.minimum || 0,
    category: 'inventory'
  });
};

// Method to acknowledge alert
alertSchema.methods.acknowledge = function(userId) {
  this.acknowledged = true;
  this.acknowledgedBy = userId;
  this.acknowledgedAt = new Date();
  return this.save();
};

// Method to resolve alert
alertSchema.methods.resolve = function(userId) {
  this.resolved = true;
  this.resolvedBy = userId;
  this.resolvedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Alert', alertSchema);