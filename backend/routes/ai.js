const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { body, validationResult } = require('express-validator');
const {auth} = require('../middleware/auth');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * @route   POST /api/ai/chat
 * @desc    AI chat interaction with inventory context using Gemini
 * @access  Private
 */
router.post('/chat', [
  auth,
  [
    body('message').notEmpty().withMessage('Message is required'),
    body('context').optional().isObject()
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        details: errors.array()
      });
    }

    const { message, context } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Fetch real-time data for context
    const [products, recentMovements, stockStats] = await Promise.all([
      Product.find({}).limit(100),
      StockMovement.find({}).sort({ createdAt: -1 }).limit(20),
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
            lowStockCount: {
              $sum: { $cond: [{ $lt: ["$stock", "$minStock"] }, 1, 0] }
            },
            outOfStockCount: {
              $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] }
            }
          }
        }
      ])
    ]);

    // Prepare context for Gemini AI
    const inventoryContext = {
      totalProducts: stockStats[0]?.totalProducts || 0,
      totalValue: stockStats[0]?.totalValue || 0,
      lowStockCount: stockStats[0]?.lowStockCount || 0,
      outOfStockCount: stockStats[0]?.outOfStockCount || 0,
      recentMovements: recentMovements.length,
      userRole: userRole,
      categories: [...new Set(products.map(p => p.category))],
      topProducts: products.slice(0, 5).map(p => ({
        name: p.name,
        stock: p.stock,
        price: p.price,
        category: p.category,
        status: p.stock < p.minStock ? 'low_stock' : p.stock === 0 ? 'out_of_stock' : 'in_stock'
      }))
    };

    // Create Gemini prompt
    const prompt = `
Kamu adalah AI assistant untuk sistem inventory management. Jawab dalam bahasa Indonesia yang natural dan helpful.

KONTEKS INVENTORY SAAT INI:
- Total Produk: ${inventoryContext.totalProducts}
- Total Nilai: Rp ${(inventoryContext.totalValue || 0).toLocaleString('id-ID')}
- Stok Menipis: ${inventoryContext.lowStockCount}
- Stok Habis: ${inventoryContext.outOfStockCount}
- Pergerakan Terbaru: ${inventoryContext.recentMovements}
- Role User: ${userRole}
- Kategori: ${inventoryContext.categories.join(', ')}

PRODUK TERATAS:
${inventoryContext.topProducts.map(p => `- ${p.name}: ${p.stock} unit, Rp ${p.price.toLocaleString('id-ID')}, Status: ${p.status}`).join('\n')}

PERTANYAAN USER: "${message}"

Berikan respon yang:
1. Informatif dan akurat berdasarkan data real-time
2. Memberikan insight yang berguna
3. Menyarankan tindakan konkret jika relevan
4. Maksimal 2-3 kalimat, langsung to the point
5. Sertakan angka/data spesifik jika tersedia

Format respon: Jawaban langsung tanpa "AI:" atau prefix lainnya.
`;

    let response = '';
    let suggestions = [];

    try {
      // Get AI response from Gemini
      if (process.env.GEMINI_API_KEY) {
        const result = await model.generateContent(prompt);
        response = result.response.text().trim();
      } else {
        // Fallback to rule-based response if no API key
        throw new Error('Gemini API key not configured');
      }
    } catch (aiError) {
      console.log('Gemini AI not available, using fallback:', aiError.message);
      
      // Fallback intelligent response
      if (message.toLowerCase().includes('stok') || message.toLowerCase().includes('stock')) {
        const lowStockProducts = products.filter(p => p.stock < p.minStock);
        response = `Saat ini ada ${lowStockProducts.length} produk dengan stok menipis. `;
        
        if (lowStockProducts.length > 0) {
          const topLowStock = lowStockProducts.slice(0, 3);
          response += `Produk yang perlu segera direstock: ${topLowStock.map(p => p.name).join(', ')}.`;
        }
      } else if (message.toLowerCase().includes('laporan') || message.toLowerCase().includes('report')) {
        response = `Laporan inventory terkini: Total ${stockStats[0]?.totalProducts || 0} produk dengan nilai Rp ${(stockStats[0]?.totalValue || 0).toLocaleString('id-ID')}. ${stockStats[0]?.lowStockCount || 0} produk stok menipis.`;
      } else {
        response = `Saat ini sistem memiliki ${stockStats[0]?.totalProducts || 0} produk dengan total nilai Rp ${(stockStats[0]?.totalValue || 0).toLocaleString('id-ID')}. Ada ${stockStats[0]?.lowStockCount || 0} produk yang stoknya menipis. Ada yang bisa saya bantu?`;
      }
    }

    // Generate contextual suggestions
    if (message.toLowerCase().includes('stok')) {
      suggestions = ['Lihat produk stok menipis', 'Buat rekomendasi restock', 'Analisis velocity produk'];
    } else if (message.toLowerCase().includes('laporan')) {
      suggestions = ['Download laporan PDF', 'Analisis tren bulanan', 'Lihat performa kategori'];
    } else if (message.toLowerCase().includes('kategori')) {
      suggestions = ['Bandingkan performa kategori', 'Lihat distribusi nilai', 'Analisis trend kategori'];
    } else {
      suggestions = ['Cek stok produk tertentu', 'Lihat laporan inventory', 'Analisis tren', 'Rekomendasi restock'];
    }

    // Add role-specific suggestions
    if (userRole === 'admin' || userRole === 'super_admin') {
      suggestions.push('Kelola API keys', 'Monitor sistem');
    }

    res.json({
      success: true,
      data: {
        response,
        suggestions,
        timestamp: new Date().toISOString(),
        dataSource: 'real-time',
        aiProvider: process.env.GEMINI_API_KEY ? 'gemini' : 'fallback',
        context: {
          totalProducts: stockStats[0]?.totalProducts || 0,
          lowStockCount: stockStats[0]?.lowStockCount || 0,
          recentMovements: recentMovements.length
        }
      }
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process AI request',
      message: error.message
    });
  }
});

// @desc    Get AI suggestions based on current data
// @route   GET /api/ai/suggestions
// @access  Private
router.get('/suggestions', auth, async (req, res) => {
  try {
    const userRole = req.user.role;
    
    // Get contextual data
    const [lowStockCount, recentMovementsCount, totalProducts] = await Promise.all([
      Product.countDocuments({
        $expr: { $lte: ['$stock.current', '$stock.minimum'] },
        status: 'active'
      }),
      StockMovement.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      Product.countDocuments({ status: 'active' })
    ]);

    const suggestions = [
      `Berapa total stok saat ini?`,
      `Tampilkan produk stok rendah (${lowStockCount} item)`,
      `Pergerakan stok hari ini (${recentMovementsCount} transaksi)`,
      'Laporan penjualan bulan ini',
      'Analisis kategori produk'
    ];

    // Role-based suggestions
    if (userRole === 'admin' || userRole === 'super_admin') {
      suggestions.push('Rekomendasi reorder otomatis', 'Analisis supplier terbaik');
    }

    res.json({
      success: true,
      data: suggestions
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;