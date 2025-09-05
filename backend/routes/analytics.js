const express = require('express');
const { query, validationResult } = require('express-validator');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const Asset = require('../models/Asset');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get analytics overview
// @route   GET /api/analytics/overview
// @access  Private
router.get('/overview', auth, async (req, res) => {
  try {
    const [
      totalProducts,
      totalAssets,
      totalUsers,
      lowStockProducts,
      recentMovements,
      totalStockValue,
      activeProducts,
      inUseAssets
    ] = await Promise.all([
      Product.countDocuments(),
      Asset.countDocuments(),
      User.countDocuments({ isActive: true }),
      Product.countDocuments({
        $expr: { $lte: ['$stock.current', '$stock.minimum'] },
        status: 'active'
      }),
      StockMovement.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
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
      Product.countDocuments({ status: 'active' }),
      Asset.countDocuments({ status: 'in_use' })
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
          total: totalAssets,
          inUse: inUseAssets
        },
        users: {
          total: totalUsers
        },
        stock: {
          totalValue: totalStockValue[0]?.totalValue || 0,
          recentMovements
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Get stock velocity analysis
// @route   GET /api/analytics/stock-velocity
// @access  Private
router.get('/stock-velocity', auth, [
  query('period').optional().isIn(['7d', '30d', '90d']).withMessage('Invalid period'),
  query('category').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const period = req.query.period || '30d';
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const matchFilter = {
      createdAt: { $gte: startDate },
      type: { $in: ['out', 'damage'] } // Only outbound movements
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
      { $limit: 50 }
    ];

    const velocityData = await StockMovement.aggregate(pipeline);

    res.json({
      success: true,
      data: velocityData,
      period: {
        days,
        startDate,
        endDate: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Get category analysis
// @route   GET /api/analytics/category-analysis
// @access  Private
router.get('/category-analysis', auth, async (req, res) => {
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

    // Get movement trends by category
    const movementTrends = await StockMovement.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: {
            category: '$productInfo.category',
            type: '$type'
          },
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.category',
          movements: {
            $push: {
              type: '$_id.type',
              quantity: '$totalQuantity',
              count: '$count'
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        categoryStats,
        movementTrends
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Get supplier performance
// @route   GET /api/analytics/supplier-performance
// @access  Private
router.get('/supplier-performance', auth, async (req, res) => {
  try {
    const supplierStats = await Product.aggregate([
      {
        $match: {
          'supplier.name': { $exists: true, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$supplier.name',
          totalProducts: { $sum: 1 },
          totalStockValue: {
            $sum: { $multiply: ['$price', '$stock.current'] }
          },
          avgPrice: { $avg: '$price' },
          categories: { $addToSet: '$category' },
          contact: { $first: '$supplier.contact' },
          email: { $first: '$supplier.email' }
        }
      },
      {
        $addFields: {
          categoryCount: { $size: '$categories' }
        }
      },
      { $sort: { totalStockValue: -1 } }
    ]);

    // Get recent stock movements by supplier
    const recentMovements = await StockMovement.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          'supplier.name': { $exists: true, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$supplier.name',
          totalInbound: {
            $sum: {
              $cond: {
                if: { $eq: ['$type', 'in'] },
                then: '$quantity',
                else: 0
              }
            }
          },
          totalCost: { $sum: '$cost' },
          movementCount: { $sum: 1 }
        }
      },
      { $sort: { totalInbound: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        suppliers: supplierStats,
        recentActivity: recentMovements
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Get trend analysis
// @route   GET /api/analytics/trends
// @access  Private
router.get('/trends', auth, [
  query('period').optional().isIn(['7d', '30d', '90d']).withMessage('Invalid period')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const period = req.query.period || '30d';
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Daily stock movements trend
    const movementTrends = await StockMovement.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            type: '$type'
          },
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          movements: {
            $push: {
              type: '$_id.type',
              quantity: '$totalQuantity',
              count: '$count'
            }
          },
          totalMovements: { $sum: '$count' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Stock value trend
    const stockValueTrend = await Product.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $group: {
          _id: '$category',
          totalValue: {
            $sum: { $multiply: ['$price', '$stock.current'] }
          },
          totalQuantity: { $sum: '$stock.current' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        movementTrends,
        stockValueTrend,
        period: {
          days,
          startDate,
          endDate: new Date()
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Get asset analytics
// @route   GET /api/analytics/assets
// @access  Private
router.get('/assets', auth, async (req, res) => {
  try {
    const [
      statusDistribution,
      categoryDistribution,
      utilizationRate,
      depreciationAnalysis,
      maintenanceSchedule
    ] = await Promise.all([
      Asset.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Asset.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalValue: { $sum: '$purchasePrice' },
            avgValue: { $avg: '$purchasePrice' }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Asset.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            inUse: {
              $sum: {
                $cond: {
                  if: { $eq: ['$status', 'in_use'] },
                  then: 1,
                  else: 0
                }
              }
            }
          }
        }
      ]),
      Asset.aggregate([
        {
          $match: {
            currentValue: { $exists: true }
          }
        },
        {
          $addFields: {
            depreciation: { $subtract: ['$purchasePrice', '$currentValue'] },
            depreciationPercent: {
              $multiply: [
                { $divide: [{ $subtract: ['$purchasePrice', '$currentValue'] }, '$purchasePrice'] },
                100
              ]
            }
          }
        },
        {
          $group: {
            _id: '$category',
            avgDepreciation: { $avg: '$depreciation' },
            avgDepreciationPercent: { $avg: '$depreciationPercent' },
            totalOriginalValue: { $sum: '$purchasePrice' },
            totalCurrentValue: { $sum: '$currentValue' }
          }
        }
      ]),
      Asset.aggregate([
        {
          $match: {
            'maintenanceSchedule.nextMaintenance': { $exists: true }
          }
        },
        {
          $addFields: {
            daysUntilMaintenance: {
              $divide: [
                { $subtract: ['$maintenanceSchedule.nextMaintenance', new Date()] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        },
        {
          $match: {
            daysUntilMaintenance: { $lte: 30, $gte: -30 }
          }
        },
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $lt: ['$daysUntilMaintenance', 0] }, then: 'overdue' },
                  { case: { $lte: ['$daysUntilMaintenance', 7] }, then: 'due_soon' },
                  { case: { $lte: ['$daysUntilMaintenance', 30] }, then: 'upcoming' }
                ],
                default: 'other'
              }
            },
            count: { $sum: 1 },
            assets: {
              $push: {
                name: '$name',
                assetCode: '$assetCode',
                nextMaintenance: '$maintenanceSchedule.nextMaintenance'
              }
            }
          }
        }
      ])
    ]);

    const utilizationPercent = utilizationRate[0] 
      ? (utilizationRate[0].inUse / utilizationRate[0].total) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        statusDistribution,
        categoryDistribution,
        utilization: {
          rate: utilizationPercent,
          inUse: utilizationRate[0]?.inUse || 0,
          total: utilizationRate[0]?.total || 0
        },
        depreciation: depreciationAnalysis,
        maintenance: maintenanceSchedule
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;