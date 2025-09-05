const express = require('express');
const { query, body, validationResult } = require('express-validator');
const Alert = require('../models/Alert');
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Private
router.get('/', auth, [
  query('type').optional().isIn(['OUT_OF_STOCK', 'LOW_STOCK', 'OVERSTOCK', 'EXPIRING', 'SYSTEM', 'SECURITY', 'PERFORMANCE']),
  query('severity').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  query('acknowledged').optional().isBoolean(),
  query('resolved').optional().isBoolean(),
  query('category').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      type,
      severity,
      acknowledged,
      resolved,
      category,
      limit = 50,
      page = 1
    } = req.query;

    // Build filter
    const filter = {};
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (acknowledged !== undefined) filter.acknowledged = acknowledged === 'true';
    if (resolved !== undefined) filter.resolved = resolved === 'true';
    if (category) filter.category = category;

    const skip = (page - 1) * limit;

    const [alerts, total] = await Promise.all([
      Alert.find(filter)
        .populate('product', 'name sku category stock')
        .populate('acknowledgedBy', 'name')
        .populate('resolvedBy', 'name')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      Alert.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: alerts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Get alert statistics
// @route   GET /api/alerts/stats
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Alert.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unacknowledged: {
            $sum: { $cond: [{ $eq: ['$acknowledged', false] }, 1, 0] }
          },
          critical: {
            $sum: { $cond: [{ $eq: ['$severity', 'CRITICAL'] }, 1, 0] }
          },
          high: {
            $sum: { $cond: [{ $eq: ['$severity', 'HIGH'] }, 1, 0] }
          },
          medium: {
            $sum: { $cond: [{ $eq: ['$severity', 'MEDIUM'] }, 1, 0] }
          },
          low: {
            $sum: { $cond: [{ $eq: ['$severity', 'LOW'] }, 1, 0] }
          },
          resolved: {
            $sum: { $cond: [{ $eq: ['$resolved', true] }, 1, 0] }
          }
        }
      }
    ]);

    // Get alerts by type
    const typeBreakdown = await Alert.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          total: 0,
          unacknowledged: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          resolved: 0
        },
        breakdown: typeBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Create new alert
// @route   POST /api/alerts
// @access  Private (Admin)
router.post('/', adminAuth, [
  body('type').isIn(['OUT_OF_STOCK', 'LOW_STOCK', 'OVERSTOCK', 'EXPIRING', 'SYSTEM', 'SECURITY', 'PERFORMANCE']),
  body('severity').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  body('title').isLength({ min: 1, max: 200 }).trim(),
  body('message').isLength({ min: 1, max: 1000 }).trim(),
  body('product').optional().isMongoId(),
  body('category').optional().isIn(['inventory', 'system_health', 'security', 'performance', 'maintenance'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const alert = await Alert.create(req.body);
    await alert.populate('product', 'name sku category stock');

    res.status(201).json({
      success: true,
      data: alert,
      message: 'Alert created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Acknowledge alert
// @route   PATCH /api/alerts/:id/acknowledge
// @access  Private
router.patch('/:id/acknowledge', auth, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    if (alert.acknowledged) {
      return res.status(400).json({ error: 'Alert already acknowledged' });
    }

    await alert.acknowledge(req.user.id);

    res.json({
      success: true,
      data: alert,
      message: 'Alert acknowledged successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Resolve alert
// @route   PATCH /api/alerts/:id/resolve
// @access  Private
router.patch('/:id/resolve', auth, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    if (alert.resolved) {
      return res.status(400).json({ error: 'Alert already resolved' });
    }

    await alert.resolve(req.user.id);

    res.json({
      success: true,
      data: alert,
      message: 'Alert resolved successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
// @access  Private (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    await Alert.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Generate stock alerts (cron job endpoint)
// @route   POST /api/alerts/generate-stock-alerts
// @access  Private (System/Admin)
router.post('/generate-stock-alerts', adminAuth, async (req, res) => {
  try {
    const products = await Product.find({
      status: 'active',
      $or: [
        { 'stock.current': { $lte: 0 } }, // Out of stock
        { $expr: { $lte: ['$stock.current', '$stock.minimum'] } } // Low stock
      ]
    });

    const alerts = [];
    const existingAlerts = await Alert.find({
      type: { $in: ['OUT_OF_STOCK', 'LOW_STOCK'] },
      product: { $in: products.map(p => p._id) },
      acknowledged: false
    });

    const existingProductIds = new Set(existingAlerts.map(a => a.product.toString()));

    for (const product of products) {
      // Skip if alert already exists for this product
      if (existingProductIds.has(product._id.toString())) continue;

      const currentStock = product.stock?.current || 0;
      
      if (currentStock <= 0) {
        // Out of stock
        const alert = await Alert.createStockAlert(
          product,
          'OUT_OF_STOCK',
          `Product ${product.name} is completely out of stock. Immediate restock needed.`,
          'CRITICAL'
        );
        alerts.push(alert);
      } else if (currentStock <= (product.stock?.minimum || 0)) {
        // Low stock
        const alert = await Alert.createStockAlert(
          product,
          'LOW_STOCK',
          `Product ${product.name} stock is below minimum threshold (${currentStock}/${product.stock?.minimum || 0}).`,
          'HIGH'
        );
        alerts.push(alert);
      }
    }

    res.json({
      success: true,
      data: alerts,
      message: `Generated ${alerts.length} stock alerts`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;