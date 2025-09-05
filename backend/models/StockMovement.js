const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  type: {
    type: String,
    enum: ['in', 'out', 'adjustment', 'transfer', 'return', 'damage', 'count'],
    required: [true, 'Movement type is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required']
  },
  previousStock: {
    type: Number,
    required: [true, 'Previous stock is required']
  },
  newStock: {
    type: Number,
    required: [true, 'New stock is required']
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  reference: {
    type: String,
    trim: true
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },
  supplier: {
    name: String,
    contact: String,
    invoice: String
  },
  location: {
    from: {
      warehouse: String,
      shelf: String,
      bin: String
    },
    to: {
      warehouse: String,
      shelf: String,
      bin: String
    }
  },
  batchNumber: {
    type: String,
    trim: true
  },
  expiryDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  }
}, {
  timestamps: true
});

// Indexes
stockMovementSchema.index({ product: 1, createdAt: -1 });
stockMovementSchema.index({ type: 1, createdAt: -1 });
stockMovementSchema.index({ createdBy: 1 });
stockMovementSchema.index({ status: 1 });

// Virtual for movement direction
stockMovementSchema.virtual('direction').get(function() {
  return ['in', 'return'].includes(this.type) ? 'increase' : 'decrease';
});

stockMovementSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('StockMovement', stockMovementSchema);