const express = require('express');
const { body, validationResult, query } = require('express-validator');
const ApiKey = require('../models/ApiKey');
const { auth, adminAuth, superAdminAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all API keys
// @route   GET /api/admin/api-keys
// @access  Private (Super Admin)
router.get('/', superAdminAuth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('active').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.active !== undefined) {
      filter.isActive = req.query.active === 'true';
    }

    const apiKeys = await ApiKey.find(filter)
      .populate('createdBy', 'name email')
      .populate('lastUsedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-hashedKey'); // Exclude hashed key from response

    const total = await ApiKey.countDocuments(filter);

    res.json({
      success: true,
      data: apiKeys,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Get single API key
// @route   GET /api/admin/api-keys/:id
// @access  Private (Super Admin)
router.get('/:id', superAdminAuth, async (req, res) => {
  try {
    const apiKey = await ApiKey.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('lastUsedBy', 'name email')
      .select('-hashedKey');

    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.json({
      success: true,
      data: apiKey
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Create new API key
// @route   POST /api/admin/api-keys
// @access  Private (Super Admin)
router.post('/', superAdminAuth, [
  body('name').notEmpty().withMessage('API key name is required'),
  body('permissions').isArray({ min: 1 }).withMessage('At least one permission is required'),
  body('permissions.*').isIn(['read', 'write', 'admin', 'analytics']).withMessage('Invalid permission'),
  body('rateLimit').optional().isInt({ min: 1 }).withMessage('Rate limit must be a positive integer'),
  body('expiresAt').optional().isISO8601().withMessage('Invalid expiration date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, permissions, rateLimit, expiresAt } = req.body;

    // Generate new API key
    const newKey = ApiKey.generateKey();

    const apiKey = await ApiKey.create({
      name,
      key: newKey,
      permissions,
      rateLimit: rateLimit || 1000,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.user.id
    });

    await apiKey.populate('createdBy', 'name email');

    // Return the actual key only once during creation
    const response = apiKey.toJSON();
    response.key = newKey; // Include the actual key in the response

    res.status(201).json({
      success: true,
      data: response,
      message: 'API key created successfully. Please save the key securely as it will not be shown again.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Update API key
// @route   PUT /api/admin/api-keys/:id
// @access  Private (Super Admin)
router.put('/:id', superAdminAuth, [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('permissions').optional().isArray({ min: 1 }).withMessage('At least one permission is required'),
  body('permissions.*').optional().isIn(['read', 'write', 'admin', 'analytics']).withMessage('Invalid permission'),
  body('rateLimit').optional().isInt({ min: 1 }).withMessage('Rate limit must be a positive integer'),
  body('expiresAt').optional().isISO8601().withMessage('Invalid expiration date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const apiKey = await ApiKey.findById(req.params.id);
    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    const updateData = { ...req.body };
    if (updateData.expiresAt) {
      updateData.expiresAt = new Date(updateData.expiresAt);
    }

    const updatedApiKey = await ApiKey.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy lastUsedBy', 'name email')
     .select('-hashedKey');

    res.json({
      success: true,
      data: updatedApiKey
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Toggle API key status
// @route   PATCH /api/admin/api-keys/:id/toggle
// @access  Private (Super Admin)
router.patch('/:id/toggle', superAdminAuth, async (req, res) => {
  try {
    const apiKey = await ApiKey.findById(req.params.id);
    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    apiKey.isActive = !apiKey.isActive;
    await apiKey.save();

    await apiKey.populate('createdBy lastUsedBy', 'name email');

    res.json({
      success: true,
      data: apiKey.toJSON(),
      message: `API key ${apiKey.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Delete API key
// @route   DELETE /api/admin/api-keys/:id
// @access  Private (Super Admin)
router.delete('/:id', superAdminAuth, async (req, res) => {
  try {
    const apiKey = await ApiKey.findById(req.params.id);
    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    await ApiKey.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'API key deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Get API key usage statistics
// @route   GET /api/admin/api-keys/:id/usage
// @access  Private (Super Admin)
router.get('/:id/usage', superAdminAuth, [
  query('days').optional().isInt({ min: 1, max: 90 }).withMessage('Days must be between 1 and 90')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const apiKey = await ApiKey.findById(req.params.id);
    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    const days = parseInt(req.query.days) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Filter usage within the specified period
    const recentUsage = apiKey.usage.filter(usage => 
      usage.timestamp >= startDate
    );

    // Group usage by date
    const usageByDate = {};
    recentUsage.forEach(usage => {
      const date = usage.timestamp.toISOString().split('T')[0];
      if (!usageByDate[date]) {
        usageByDate[date] = {
          date,
          count: 0,
          endpoints: {}
        };
      }
      usageByDate[date].count++;
      
      const endpoint = `${usage.method} ${usage.endpoint}`;
      usageByDate[date].endpoints[endpoint] = (usageByDate[date].endpoints[endpoint] || 0) + 1;
    });

    const usageStats = Object.values(usageByDate).sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      success: true,
      data: {
        totalUsage: apiKey.usageCount,
        recentUsage: recentUsage.length,
        period: { days, startDate, endDate: new Date() },
        dailyUsage: usageStats,
        lastUsed: apiKey.lastUsed
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Regenerate API key
// @route   POST /api/admin/api-keys/:id/regenerate
// @access  Private (Super Admin)
router.post('/:id/regenerate', superAdminAuth, async (req, res) => {
  try {
    const apiKey = await ApiKey.findById(req.params.id);
    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    // Generate new key
    const newKey = ApiKey.generateKey();
    apiKey.key = newKey;
    apiKey.usageCount = 0;
    apiKey.lastUsed = null;
    apiKey.usage = [];
    
    await apiKey.save();
    await apiKey.populate('createdBy lastUsedBy', 'name email');

    // Return the new key only once
    const response = apiKey.toJSON();
    response.key = newKey;

    res.json({
      success: true,
      data: response,
      message: 'API key regenerated successfully. Please save the new key securely.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;