const express = require('express');
const { query, validationResult } = require('express-validator');
const Product = require('../../models/Product');
const { apiKeyAuth } = require('../../middleware/apiKeyAuth');

const router = express.Router();

// @desc    Get all products (External API - Read Only)
// @route   GET /api/external/products
// @access  API Key (read permission)
router.get('/', apiKeyAuth(['read']), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isString(),
  query('status').optional().isIn(['active', 'inactive', 'discontinued']),
  query('search').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { sku: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter)
      .select('-createdBy -updatedBy -__v') // Exclude sensitive fields
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      metadata: {
        timestamp: new Date().toISOString(),
        apiVersion: '1.0',
        requestId: req.headers['x-request-id'] || 'N/A'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch products'
    });
  }
});

// @desc    Get single product (External API - Read Only)
// @route   GET /api/external/products/:id
// @access  API Key (read permission)
router.get('/:id', apiKeyAuth(['read']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .select('-createdBy -updatedBy -__v');

    if (!product) {
      return res.status(404).json({ 
        success: false,
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    res.json({
      success: true,
      data: product,
      metadata: {
        timestamp: new Date().toISOString(),
        apiVersion: '1.0',
        requestId: req.headers['x-request-id'] || 'N/A'
      }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid product ID',
        message: 'The provided product ID is not valid'
      });
    }
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch product'
    });
  }
});

// @desc    Get product categories (External API - Read Only)
// @route   GET /api/external/products/categories
// @access  API Key (read permission)
router.get('/meta/categories', apiKeyAuth(['read']), async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    
    res.json({
      success: true,
      data: categories,
      metadata: {
        timestamp: new Date().toISOString(),
        apiVersion: '1.0',
        requestId: req.headers['x-request-id'] || 'N/A'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch categories'
    });
  }
});

// @desc    Get low stock products (External API - Read Only)
// @route   GET /api/external/products/alerts/low-stock
// @access  API Key (read permission)
router.get('/alerts/low-stock', apiKeyAuth(['read']), async (req, res) => {
  try {
    const products = await Product.find({
      $expr: {
        $lte: ['$stock.current', '$stock.minimum']
      },
      status: 'active'
    }).select('-createdBy -updatedBy -__v');

    res.json({
      success: true,
      data: products,
      count: products.length,
      metadata: {
        timestamp: new Date().toISOString(),
        apiVersion: '1.0',
        requestId: req.headers['x-request-id'] || 'N/A'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch low stock products'
    });
  }
});

module.exports = router;