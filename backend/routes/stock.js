const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get stock movements
// @route   GET /api/stock/movements
// @access  Private
router.get('/movements', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('product').optional().isMongoId(),
  query('type').optional().isIn(['in', 'out', 'adjustment', 'transfer', 'return', 'damage', 'count']),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.product) filter.product = req.query.product;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.dateFrom || req.query.dateTo) {
      filter.createdAt = {};
      if (req.query.dateFrom) filter.createdAt.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) filter.createdAt.$lte = new Date(req.query.dateTo);
    }

    const movements = await StockMovement.find(filter)
      .populate('product', 'name sku category')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await StockMovement.countDocuments(filter);

    res.json({
      success: true,
      data: movements,
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

// @desc    Create stock movement
// @route   POST /api/stock/movements
// @access  Private (Admin)
router.post('/movements', adminAuth, [
  body('product').isMongoId().withMessage('Valid product ID is required'),
  body('type').isIn(['in', 'out', 'adjustment', 'transfer', 'return', 'damage', 'count']).withMessage('Invalid movement type'),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('reason').notEmpty().withMessage('Reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { product: productId, type, quantity, reason, reference, cost, supplier, location, batchNumber, expiryDate, notes } = req.body;

    // Get current product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const previousStock = product.stock.current;
    let newStock;

    // Calculate new stock based on movement type
    switch (type) {
      case 'in':
      case 'return':
        newStock = previousStock + Math.abs(quantity);
        break;
      case 'out':
      case 'damage':
        newStock = Math.max(0, previousStock - Math.abs(quantity));
        break;
      case 'adjustment':
      case 'count':
        newStock = Math.max(0, quantity);
        break;
      case 'transfer':
        // For transfer, quantity can be negative (out) or positive (in)
        newStock = Math.max(0, previousStock + quantity);
        break;
      default:
        return res.status(400).json({ error: 'Invalid movement type' });
    }

    // Create stock movement
    const movement = await StockMovement.create({
      product: productId,
      type,
      quantity: Math.abs(quantity),
      previousStock,
      newStock,
      reason,
      reference,
      cost,
      supplier,
      location,
      batchNumber,
      expiryDate,
      notes,
      createdBy: req.user.id
    });

    // Update product stock
    product.stock.current = newStock;
    await product.save();

    await movement.populate('product', 'name sku category');
    await movement.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: movement
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Update stock movement
// @route   PUT /api/stock/movements/:id
// @access  Private (Admin)
router.put('/movements/:id', adminAuth, async (req, res) => {
  try {
    const movement = await StockMovement.findById(req.params.id);
    if (!movement) {
      return res.status(404).json({ error: 'Stock movement not found' });
    }

    if (movement.status === 'approved') {
      return res.status(400).json({ error: 'Cannot update approved stock movement' });
    }

    const updatedMovement = await StockMovement.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('product createdBy approvedBy', 'name sku category email');

    res.json({
      success: true,
      data: updatedMovement
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Delete stock movement
// @route   DELETE /api/stock/movements/:id
// @access  Private (Admin)
router.delete('/movements/:id', adminAuth, async (req, res) => {
  try {
    const movement = await StockMovement.findById(req.params.id);
    if (!movement) {
      return res.status(404).json({ error: 'Stock movement not found' });
    }

    if (movement.status === 'approved') {
      return res.status(400).json({ error: 'Cannot delete approved stock movement. Create an adjustment instead.' });
    }

    await StockMovement.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Stock movement deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Get stock levels
// @route   GET /api/stock/levels
// @access  Private
router.get('/levels', auth, async (req, res) => {
  try {
    const products = await Product.find({ status: 'active' })
      .select('name sku category stock')
      .sort({ name: 1 });

    const stockLevels = products.map(product => ({
      product: {
        id: product._id,
        name: product.name,
        sku: product.sku,
        category: product.category
      },
      current: product.stock.current,
      minimum: product.stock.minimum,
      maximum: product.stock.maximum,
      status: product.stockStatus,
      difference: product.stock.current - product.stock.minimum
    }));

    res.json({
      success: true,
      data: stockLevels
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Stock count/audit
// @route   POST /api/stock/count
// @access  Private (Admin)
router.post('/count', adminAuth, [
  body('items').isArray().withMessage('Items must be an array'),
  body('items.*.product').isMongoId().withMessage('Valid product ID is required'),
  body('items.*.countedQuantity').isNumeric().withMessage('Counted quantity must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, notes } = req.body;
    const movements = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        continue; // Skip invalid products
      }

      const previousStock = product.stock.current;
      const countedQuantity = item.countedQuantity;
      const difference = countedQuantity - previousStock;

      if (difference !== 0) {
        // Create stock movement for the difference
        const movement = await StockMovement.create({
          product: product._id,
          type: 'count',
          quantity: Math.abs(difference),
          previousStock,
          newStock: countedQuantity,
          reason: `Stock count adjustment - ${difference > 0 ? 'surplus' : 'shortage'} found`,
          notes: notes || `Physical count: ${countedQuantity}, System: ${previousStock}`,
          createdBy: req.user.id
        });

        // Update product stock
        product.stock.current = countedQuantity;
        await product.save();

        movements.push(movement);
      }
    }

    res.json({
      success: true,
      data: movements,
      message: `Stock count completed. ${movements.length} adjustments made.`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;