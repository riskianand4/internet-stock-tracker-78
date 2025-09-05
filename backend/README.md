# Inventory Management System - Backend API

Backend API untuk sistem manajemen inventory yang dibuat dengan Node.js, Express.js, dan MongoDB.

## Fitur

- 🔐 **Authentication & Authorization** - JWT-based auth dengan role management
- 📦 **Product Management** - CRUD operations untuk produk
- 📊 **Stock Management** - Track stock movements dan inventory levels
- 🏢 **Asset Management** - Manage company assets
- 👥 **User Management** - User roles dan permissions
- 📈 **Analytics & Reporting** - Comprehensive analytics
- 🔒 **Security** - Rate limiting, input validation, error handling
- 📱 **API Documentation** - Well-documented REST API

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer
- **Environment**: dotenv

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` ke `.env` dan atur konfigurasi:

```bash
cp .env.example .env
```

Edit file `.env`:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/inventory_management

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# API Security
API_KEY=your-secure-api-key

# Server
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 3. Start MongoDB

Pastikan MongoDB berjalan di sistem Anda:
```bash
# macOS dengan Homebrew
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Run Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server akan berjalan di `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products (dengan pagination, filter, search)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)
- `GET /api/products/alerts/low-stock` - Get low stock products
- `GET /api/products/categories/list` - Get product categories

### Stock Management
- `GET /api/stock/movements` - Get stock movements
- `POST /api/stock/movements` - Create stock movement (admin only)
- `PUT /api/stock/movements/:id` - Update stock movement (admin only)
- `DELETE /api/stock/movements/:id` - Delete stock movement (admin only)
- `GET /api/stock/levels` - Get current stock levels
- `POST /api/stock/count` - Perform stock count/audit (admin only)

### Assets
- `GET /api/assets` - Get all assets
- `GET /api/assets/:id` - Get single asset
- `POST /api/assets` - Create asset (admin only)
- `PUT /api/assets/:id` - Update asset (admin only)
- `DELETE /api/assets/:id` - Delete asset (admin only)
- `POST /api/assets/:id/assign` - Assign asset to user (admin only)
- `POST /api/assets/:id/return` - Return asset (admin only)

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Analytics
- `GET /api/analytics/overview` - Get analytics overview
- `GET /api/analytics/stock-velocity` - Stock velocity analysis
- `GET /api/analytics/category-analysis` - Category analysis
- `GET /api/analytics/supplier-performance` - Supplier performance

### Reports
- `GET /api/reports/inventory` - Inventory report
- `GET /api/reports/stock-movements` - Stock movements report
- `GET /api/reports/low-stock` - Low stock report

## Authentication

API menggunakan JWT untuk authentication. Include token di header:

```
Authorization: Bearer <your-jwt-token>
```

API Key juga diperlukan untuk semua endpoints:

```
x-api-key: your-api-key
```

## Role Management

- **user**: Basic access, read-only
- **admin**: Full access to inventory management
- **super_admin**: Full system access including user management

## Request/Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "pagination": { ... } // untuk list endpoints
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "errors": [ ... ] // untuk validation errors
}
```

## File Structure

```
backend/
├── config/
│   └── database.js          # Database connection
├── middleware/
│   ├── auth.js             # Authentication middleware
│   └── errorHandler.js     # Global error handler
├── models/
│   ├── User.js             # User model
│   ├── Product.js          # Product model
│   ├── StockMovement.js    # Stock movement model
│   └── Asset.js            # Asset model
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── products.js         # Product routes
│   ├── stock.js            # Stock routes
│   ├── assets.js           # Asset routes
│   ├── users.js            # User routes
│   ├── analytics.js        # Analytics routes
│   └── reports.js          # Report routes
├── server.js               # Main server file
├── package.json
└── README.md
```

## Testing

Anda bisa test API menggunakan tools seperti:
- Postman
- Insomnia
- cURL
- Frontend aplikasi di `http://localhost:5173`

### Health Check

Test apakah server berjalan:
```bash
curl http://localhost:3001/health
```

## Deployment

### Production Environment Variables

Set environment variables untuk production:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/inventory
JWT_SECRET=very-secure-secret-key
API_KEY=production-api-key
```

### PM2 (Process Manager)

```bash
npm install -g pm2
pm2 start server.js --name inventory-api
pm2 startup
pm2 save
```

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License