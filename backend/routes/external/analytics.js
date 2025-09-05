const express = require('express');
const { query, validationResult } = require('express-validator');
const Product = require('../../models/Product');
const StockMovement = require('../../models/StockMovement');
const Asset = require('../../models/Asset');
const User = require('../../models/User');
const { apiKeyAuth } = require('../../middleware/apiKeyAuth');

const router = express.Router();

// @desc    Get analytics overview (External API - Read Only)
// @route   GET /api/external/analytics/overview
// @access  API Key (read permission)
router.get('/overview', apiKeyAuth(['read']), async (req, res) => {
  try {
    const [
      totalProducts,
      totalAssets,
      lowStockProducts,
      totalStockValue,
      activeProducts
    ] = await Promise.all([
      Product.countDocuments(),
      Asset.countDocuments(),
      Product.countDocuments({
        $expr: { $lte: ['$stock.current', '$stock.minimum'] },
        status: 'active'
      }),
      Product.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: null,
            totalValue: {
              $sum: { $multiply: ['$price', '$stock.current'] }
            }
          }
        }
      ]),
      Product.countDocuments({ status: 'active' })
    ]);

    res.json({
      success: true,
      data: {
        products: {
          total: totalProducts,
          active: activeProducts,
          lowStock: lowStockProducts
        },
        assets: {
          total: totalAssets
        },
        stock: {
          totalValue: totalStockValue[0]?.totalValue || 0
        }
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
      message: 'Failed to fetch analytics overview'
    });
  }
});

// @desc    Get category analysis (External API - Read Only)
// @route   GET /api/external/analytics/categories
// @access  API Key (read permission)
router.get('/categories', apiKeyAuth(['read']), async (req, res) => {
  try {
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          totalStockValue: {
            $sum: { $multiply: ['$price', '$stock.current'] }
          },
          avgPrice: { $avg: '$price' },
          totalStock: { $sum: '$stock.current' },
          lowStockCount: {
            $sum: {
              $cond: {
                if: { $lte: ['$stock.current', '$stock.minimum'] },
                then: 1,
                else: 0
              }
            }
          }
        }
      },
      {
        $addFields: {
          lowStockPercentage: {
            $cond: {
              if: { $eq: ['$totalProducts', 0] },
              then: 0,
              else: { $multiply: [{ $divide: ['$lowStockCount', '$totalProducts'] }, 100] }
            }
          }
        }
      },
      { $sort: { totalStockValue: -1 } }
    ]);

    res.json({
      success: true,
      data: categoryStats,
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
      message: 'Failed to fetch category analysis'
    });
  }
});

// @desc    Get stock velocity analysis (External API - Read Only)
// @route   GET /api/external/analytics/stock-velocity
// @access  API Key (read permission)
router.get('/stock-velocity', apiKeyAuth(['read']), [
  query('period').optional().isIn(['7d', '30d', '90d']).withMessage('Invalid period'),
  query('category').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const period = req.query.period || '30d';
    const limit = parseInt(req.query.limit) || 50;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const matchFilter = {
      createdAt: { $gte: startDate },
      type: { $in: ['out', 'damage'] }
    };

    const pipeline = [
      { $match: matchFilter },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      ...(req.query.category ? [{ $match: { 'productInfo.category': req.query.category } }] : []),
      {
        $group: {
          _id: '$product',
          productName: { $first: '$productInfo.name' },
          productSku: { $first: '$productInfo.sku' },
          category: { $first: '$productInfo.category' },
          totalOut: { $sum: '$quantity' },
          currentStock: { $first: '$productInfo.stock.current' },
          price: { $first: '$productInfo.price' }
        }
      },
      {
        $addFields: {
          velocityPerDay: { $divide: ['$totalOut', days] },
          daysOfStock: {
            $cond: {
              if: { $eq: ['$velocityPerDay', 0] },
              then: 999,
              else: { $divide: ['$currentStock', '$velocityPerDay'] }
            }
          },
          revenueImpact: { $multiply: ['$totalOut', '$price'] }
        }
      },
      { $sort: { velocityPerDay: -1 } },
      { $limit: limit }
    ];

    const velocityData = await StockMovement.aggregate(pipeline);

    res.json({
      success: true,
      data: velocityData,
      period: {
        days,
        startDate,
        endDate: new Date()
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
      message: 'Failed to fetch stock velocity analysis'
    });
  }
});

module.exports = router;