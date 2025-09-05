const express = require('express');
const { apiKeyAuth, apiKeyRateLimit } = require('../../middleware/apiKeyAuth');
const productsRouter = require('./products');
const analyticsRouter = require('./analytics');

const router = express.Router();

// Apply rate limiting to all external API routes
router.use(apiKeyRateLimit());

// Health check for external API
router.get('/health', apiKeyAuth(['read']), (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    apiVersion: '1.0',
    timestamp: new Date().toISOString(),
    message: 'External API is operational'
  });
});

// API documentation endpoint
router.get('/docs', apiKeyAuth(['read']), (req, res) => {
  res.json({
    success: true,
    apiVersion: '1.0',
    documentation: {
      endpoints: {
        products: {
          'GET /api/external/products': 'List all products with pagination',
          'GET /api/external/products/:id': 'Get single product by ID',
          'GET /api/external/products/meta/categories': 'Get all product categories',
          'GET /api/external/products/alerts/low-stock': 'Get low stock products'
        },
        analytics: {
          'GET /api/external/analytics/overview': 'Get analytics overview',
          'GET /api/external/analytics/categories': 'Get category analysis',
          'GET /api/external/analytics/stock-velocity': 'Get stock velocity analysis'
        }
      },
      authentication: {
        method: 'API Key',
        header: 'x-api-key',
        permissions: ['read']
      },
      rateLimit: 'Per API key rate limiting applies',
      responseFormat: {
        success: true,
        data: '...',
        metadata: {
          timestamp: 'ISO 8601 timestamp',
          apiVersion: 'API version',
          requestId: 'Request identifier'
        }
      }
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'N/A'
    }
  });
});

// Mount sub-routers
router.use('/products', productsRouter);
router.use('/analytics', analyticsRouter);

module.exports = router;