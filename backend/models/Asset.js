const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Asset name is required'],
    trim: true,
    maxlength: [100, 'Asset name cannot exceed 100 characters']
  },
  assetCode: {
    type: String,
    required: [true, 'Asset code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['IT Equipment', 'Office Furniture', 'Machinery', 'Vehicle', 'Tools', 'Other'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  purchasePrice: {
    type: Number,
    required: [true, 'Purchase price is required'],
    min: [0, 'Purchase price must be positive']
  },
  currentValue: {
    type: Number,
    min: [0, 'Current value must be positive']
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Purchase date is required']
  },
  warrantyExpiry: {
    type: Date
  },
  location: {
    department: {
      type: String,
      trim: true
    },
    room: {
      type: String,
      trim: true
    },
    building: {
      type: String,
      trim: true
    }
  },
  assignedTo: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedDate: {
      type: Date
    },
    returnDate: {
      type: Date
    }
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'damaged'],
    default: 'good'
  },
  status: {
    type: String,
    enum: ['available', 'in_use', 'maintenance', 'retired', 'lost', 'stolen'],
    default: 'available'
  },
  maintenanceSchedule: {
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'semi_annual', 'annual', 'none'],
      default: 'none'
    },
    lastMaintenance: {
      type: Date
    },
    nextMaintenance: {
      type: Date
    }
  },
  specifications: {
    brand: String,
    model: String,
    serialNumber: String,
    specifications: {
      type: Map,
      of: String
    }
  },
  images: [{
    url: String,
    alt: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  documents: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['manual', 'warranty', 'invoice', 'certificate', 'other']
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
assetSchema.index({ category: 1, status: 1 });
assetSchema.index({ 'assignedTo.user': 1 });
assetSchema.index({ status: 1 });

// Virtual for depreciation
assetSchema.virtual('depreciation').get(function() {
  if (!this.currentValue) return 0;
  return this.purchasePrice - this.currentValue;
});

// Virtual for age in months
assetSchema.virtual('ageInMonths').get(function() {
  const now = new Date();
  const purchaseDate = new Date(this.purchaseDate);
  return Math.floor((now - purchaseDate) / (1000 * 60 * 60 * 24 * 30.44));
});

assetSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Asset', assetSchema);