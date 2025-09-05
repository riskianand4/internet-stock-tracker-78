const express = require('express');
const { query, validationResult } = require('express-validator');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const Asset = require('../models/Asset');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Generate inventory report
// @route   GET /api/reports/inventory
// @access  Private
router.get('/inventory', auth, [
  query('category').optional().isString(),
  query('status').optional().isIn(['active', 'inactive', 'discontinued']),
  query('format').optional().isIn(['json', 'csv']).withMessage('Format must be json or csv')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;

    const products = await Product.find(filter)
      .populate('createdBy', 'name email')
      .sort({ category: 1, name: 1 });

    const report = products.map(product => ({
      sku: product.sku,
      name: product.name,
      category: product.category,
      currentStock: product.stock.current,
      minimumStock: product.stock.minimum,
      maximumStock: product.stock.maximum,
      stockStatus: product.stockStatus,
      price: product.price,
      costPrice: product.costPrice,
      stockValue: product.price * product.stock.current,
      profitMargin: product.profitMargin,
      location: {
        warehouse: product.location?.warehouse || '',
        shelf: product.location?.shelf || '',
        bin: product.location?.bin || ''
      },
      supplier: product.supplier?.name || '',
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));

    // Calculate summary
    const summary = {
      totalProducts: report.length,
      totalStockValue: report.reduce((sum, item) => sum + item.stockValue, 0),
      lowStockItems: report.filter(item => item.stockStatus === 'low_stock').length,
      outOfStockItems: report.filter(item => item.stockStatus === 'out_of_stock').length,
      categoryBreakdown: report.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {})
    };

    if (req.query.format === 'csv') {
      // Convert to CSV format
      const csvHeaders = 'SKU,Name,Category,Current Stock,Minimum Stock,Price,Stock Value,Status,Supplier\n';
      const csvRows = report.map(item => 
        `${item.sku},${item.name},${item.category},${item.currentStock},${item.minimumStock},${item.price},${item.stockValue},${item.status},${item.supplier}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=inventory-report.csv');
      return res.send(csvHeaders + csvRows);
    }

    res.json({
      success: true,
      data: {
        report,
        summary,
        generatedAt: new Date(),
        filters: req.query
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Generate stock movements report
// @route   GET /api/reports/stock-movements
// @access  Private
router.get('/stock-movements', auth, [
  query('dateFrom').optional().isISO8601().withMessage('Invalid date format'),
  query('dateTo').optional().isISO8601().withMessage('Invalid date format'),
  query('product').optional().isMongoId(),
  query('type').optional().isIn(['in', 'out', 'adjustment', 'transfer', 'return', 'damage', 'count']),
  query('format').optional().isIn(['json', 'csv'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const filter = {};
    if (req.query.dateFrom || req.query.dateTo) {
      filter.createdAt = {};
      if (req.query.dateFrom) filter.createdAt.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) filter.createdAt.$lte = new Date(req.query.dateTo);
    }
    if (req.query.product) filter.product = req.query.product;
    if (req.query.type) filter.type = req.query.type;

    const movements = await StockMovement.find(filter)
      .populate('product', 'name sku category')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    const report = movements.map(movement => ({
      date: movement.createdAt,
      product: {
        sku: movement.product?.sku || 'N/A',
        name: movement.product?.name || 'N/A',
        category: movement.product?.category || 'N/A'
      },
      type: movement.type,
      quantity: movement.quantity,
      previousStock: movement.previousStock,
      newStock: movement.newStock,
      difference: movement.newStock - movement.previousStock,
      reason: movement.reason,
      reference: movement.reference,
      cost: movement.cost || 0,
      supplier: movement.supplier?.name || '',
      createdBy: movement.createdBy?.name || 'System',
      status: movement.status
    }));

    // Calculate summary
    const summary = {
      totalMovements: report.length,
      movementsByType: report.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {}),
      totalQuantityIn: report
        .filter(item => ['in', 'return'].includes(item.type))
        .reduce((sum, item) => sum + item.quantity, 0),
      totalQuantityOut: report
        .filter(item => ['out', 'damage'].includes(item.type))
        .reduce((sum, item) => sum + item.quantity, 0),
      totalCost: report.reduce((sum, item) => sum + (item.cost || 0), 0)
    };

    if (req.query.format === 'csv') {
      const csvHeaders = 'Date,Product SKU,Product Name,Type,Quantity,Previous Stock,New Stock,Reason,Cost,Created By\n';
      const csvRows = report.map(item => 
        `${item.date.toISOString()},${item.product.sku},${item.product.name},${item.type},${item.quantity},${item.previousStock},${item.newStock},${item.reason},${item.cost},${item.createdBy}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=stock-movements-report.csv');
      return res.send(csvHeaders + csvRows);
    }

    res.json({
      success: true,
      data: {
        report,
        summary,
        generatedAt: new Date(),
        filters: req.query
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Generate low stock report
// @route   GET /api/reports/low-stock
// @access  Private
router.get('/low-stock', auth, [
  query('category').optional().isString(),
  query('threshold').optional().isNumeric().withMessage('Threshold must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const filter = {
      status: 'active'
    };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Custom threshold or use product minimum stock
    let stockFilter;
    if (req.query.threshold) {
      stockFilter = { 'stock.current': { $lte: parseInt(req.query.threshold) } };
    } else {
      stockFilter = { $expr: { $lte: ['$stock.current', '$stock.minimum'] } };
    }

    const products = await Product.find({ ...filter, ...stockFilter })
      .populate('createdBy', 'name email')
      .sort({ 'stock.current': 1 });

    const report = products.map(product => ({
      sku: product.sku,
      name: product.name,
      category: product.category,
      currentStock: product.stock.current,
      minimumStock: product.stock.minimum,
      shortfall: Math.max(0, product.stock.minimum - product.stock.current),
      stockStatus: product.stockStatus,
      price: product.price,
      reorderValue: Math.max(0, product.stock.minimum - product.stock.current) * product.price,
      supplier: product.supplier?.name || 'No supplier',
      supplierContact: product.supplier?.contact || '',
      location: {
        warehouse: product.location?.warehouse || '',
        shelf: product.location?.shelf || ''
      },
      lastUpdated: product.updatedAt
    }));

    // Calculate reorder suggestions
    const reorderSuggestions = report.map(item => ({
      ...item,
      suggestedOrderQuantity: Math.max(
        item.shortfall,
        Math.ceil((item.minimumStock * 1.5) - item.currentStock) // Order 50% more than minimum
      )
    }));

    const summary = {
      totalLowStockItems: report.length,
      totalReorderValue: report.reduce((sum, item) => sum + item.reorderValue, 0),
      categoriesAffected: [...new Set(report.map(item => item.category))].length,
      suppliersToContact: [...new Set(report.map(item => item.supplier).filter(s => s !== 'No supplier'))],
      criticalItems: report.filter(item => item.currentStock === 0).length
    };

    res.json({
      success: true,
      data: {
        report: reorderSuggestions,
        summary,
        generatedAt: new Date(),
        filters: req.query
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Generate asset report
// @route   GET /api/reports/assets
// @access  Private (Admin)
router.get('/assets', adminAuth, [
  query('category').optional().isString(),
  query('status').optional().isIn(['available', 'in_use', 'maintenance', 'retired', 'lost', 'stolen']),
  query('assignedTo').optional().isMongoId(),
  query('format').optional().isIn(['json', 'csv'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.assignedTo) filter['assignedTo.user'] = req.query.assignedTo;

    const assets = await Asset.find(filter)
      .populate('assignedTo.user', 'name email department')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    const report = assets.map(asset => ({
      assetCode: asset.assetCode,
      name: asset.name,
      category: asset.category,
      status: asset.status,
      condition: asset.condition,
      purchasePrice: asset.purchasePrice,
      currentValue: asset.currentValue || asset.purchasePrice,
      depreciation: asset.depreciation || 0,
      ageInMonths: asset.ageInMonths,
      location: {
        department: asset.location?.department || '',
        room: asset.location?.room || '',
        building: asset.location?.building || ''
      },
      assignedTo: asset.assignedTo?.user ? {
        name: asset.assignedTo.user.name,
        email: asset.assignedTo.user.email,
        department: asset.assignedTo.user.department,
        assignedDate: asset.assignedTo.assignedDate
      } : null,
      specifications: {
        brand: asset.specifications?.brand || '',
        model: asset.specifications?.model || '',
        serialNumber: asset.specifications?.serialNumber || ''
      },
      maintenance: {
        frequency: asset.maintenanceSchedule?.frequency || 'none',
        lastMaintenance: asset.maintenanceSchedule?.lastMaintenance,
        nextMaintenance: asset.maintenanceSchedule?.nextMaintenance
      },
      purchaseDate: asset.purchaseDate,
      warrantyExpiry: asset.warrantyExpiry,
      createdAt: asset.createdAt
    }));

    const summary = {
      totalAssets: report.length,
      totalValue: report.reduce((sum, item) => sum + item.currentValue, 0),
      totalDepreciation: report.reduce((sum, item) => sum + item.depreciation, 0),
      statusDistribution: report.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {}),
      categoryDistribution: report.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {}),
      assignedAssets: report.filter(item => item.assignedTo).length,
      maintenanceDue: report.filter(item => 
        item.maintenance.nextMaintenance && 
        new Date(item.maintenance.nextMaintenance) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ).length
    };

    if (req.query.format === 'csv') {
      const csvHeaders = 'Asset Code,Name,Category,Status,Condition,Purchase Price,Current Value,Assigned To,Location,Purchase Date\n';
      const csvRows = report.map(item => 
        `${item.assetCode},${item.name},${item.category},${item.status},${item.condition},${item.purchasePrice},${item.currentValue},${item.assignedTo?.name || ''},${item.location.department || ''},${item.purchaseDate}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=assets-report.csv');
      return res.send(csvHeaders + csvRows);
    }

    res.json({
      success: true,
      data: {
        report,
        summary,
        generatedAt: new Date(),
        filters: req.query
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Generate ABC analysis report
// @route   GET /api/reports/abc-analysis
// @access  Private
router.get('/abc-analysis', auth, [
  query('period').optional().isIn(['30d', '90d', '365d']).withMessage('Invalid period')
], async (req, res) => {
  try {
    const period = req.query.period || '90d';
    const days = period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get product movement data
    const productAnalysis = await StockMovement.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          type: { $in: ['out', 'damage'] }
        }
      },
      {
        $group: {
          _id: '$product',
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$cost'] } },
          movementCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $addFields: {
          revenueImpact: { $multiply: ['$totalQuantity', '$productInfo.price'] }
        }
      },
      { $sort: { revenueImpact: -1 } }
    ]);

    // Calculate cumulative percentages for ABC classification
    const totalRevenue = productAnalysis.reduce((sum, item) => sum + item.revenueImpact, 0);
    let cumulativeRevenue = 0;

    const abcClassified = productAnalysis.map(item => {
      cumulativeRevenue += item.revenueImpact;
      const cumulativePercentage = (cumulativeRevenue / totalRevenue) * 100;
      
      let classification = 'C';
      if (cumulativePercentage <= 80) classification = 'A';
      else if (cumulativePercentage <= 95) classification = 'B';

      return {
        product: {
          id: item._id,
          sku: item.productInfo.sku,
          name: item.productInfo.name,
          category: item.productInfo.category,
          currentStock: item.productInfo.stock.current,
          price: item.productInfo.price
        },
        analysis: {
          totalQuantityMoved: item.totalQuantity,
          revenueImpact: item.revenueImpact,
          movementFrequency: item.movementCount,
          cumulativePercentage: cumulativePercentage,
          classification: classification
        }
      };
    });

    const summary = {
      totalProducts: abcClassified.length,
      totalRevenue: totalRevenue,
      classificationBreakdown: {
        A: abcClassified.filter(item => item.analysis.classification === 'A').length,
        B: abcClassified.filter(item => item.analysis.classification === 'B').length,
        C: abcClassified.filter(item => item.analysis.classification === 'C').length
      },
      revenueByClass: {
        A: abcClassified
          .filter(item => item.analysis.classification === 'A')
          .reduce((sum, item) => sum + item.analysis.revenueImpact, 0),
        B: abcClassified
          .filter(item => item.analysis.classification === 'B')
          .reduce((sum, item) => sum + item.analysis.revenueImpact, 0),
        C: abcClassified
          .filter(item => item.analysis.classification === 'C')
          .reduce((sum, item) => sum + item.analysis.revenueImpact, 0)
      }
    };

    res.json({
      success: true,
      data: {
        report: abcClassified,
        summary,
        period: {
          days,
          startDate,
          endDate: new Date()
        },
        generatedAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;