const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");
const Asset = require("../models/Asset");
const ApiKey = require("../models/ApiKey");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/inventory_management"
    );
    console.log("MongoDB Connected for seeding");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  console.log("Seeding users...");

  const users = [
    {
      name: "Super Admin",
      email: "superadmin@inventory.com",
      password: await bcrypt.hash("admin123", 12),
      role: "super_admin",
      department: "IT",
      isActive: true,
      permissions: ["read", "write", "admin"], // bukan "all"
    },
    {
      name: "Admin User",
      email: "admin@inventory.com",
      password: await bcrypt.hash("admin123", 12),
      role: "admin",
      department: "Operations",
      isActive: true,
      permissions: ["read", "write"], // bukan "inventory_manage"
    },
    {
      name: "Staff User",
      email: "staff@inventory.com",
      password: await bcrypt.hash("staff123", 12),
      role: "user",
      department: "Warehouse",
      isActive: true,
      permissions: ["read"], // cukup read saja
    },
  ];

  const createdUsers = await User.insertMany(users);
  console.log(`Created ${createdUsers.length} users`);
  return createdUsers;
};

const seedProducts = async (users) => {
  console.log("Seeding products...");

  const adminUser = users.find((u) => u.role === "admin");

  const products = [
    {
      name: "Router WiFi AC1200",
      sku: "RTR-AC1200",
      category: "Networking",
      description: "Router WiFi dual band AC1200 untuk rumah dan kantor kecil",
      price: 450000,
      costPrice: 350000,
      stock: {
        current: 25,
        minimum: 10,
        maximum: 100,
      },
      unit: "pcs",
      location: {
        warehouse: "Gudang A",
        shelf: "Rak 1",
        bin: "A1",
      },
      supplier: {
        name: "TP-Link Indonesia",
        contact: "+62-21-12345678",
        email: "sales@tplink.co.id",
      },
      barcode: "8901234567890",
      tags: ["router", "wifi", "networking", "ac1200"],
      status: "active",
      createdBy: adminUser._id,
    },
    {
      name: "Modem ADSL",
      sku: "MDM-ADSL2",
      category: "Modem",
      description: "Modem ADSL2+ untuk koneksi internet DSL",
      price: 320000,
      costPrice: 250000,
      stock: {
        current: 8,
        minimum: 15,
        maximum: 50,
      },
      unit: "pcs",
      location: {
        warehouse: "Gudang A",
        shelf: "Rak 2",
        bin: "A2",
      },
      supplier: {
        name: "Huawei Indonesia",
        contact: "+62-21-87654321",
        email: "support@huawei.co.id",
      },
      barcode: "8901234567891",
      tags: ["modem", "adsl", "internet"],
      status: "active",
      createdBy: adminUser._id,
    },
    {
      name: "Set Top Box",
      sku: "STB-HD01",
      category: "Entertainment",
      description: "Set top box HD untuk layanan TV digital",
      price: 280000,
      costPrice: 200000,
      stock: {
        current: 15,
        minimum: 8,
        maximum: 40,
      },
      unit: "pcs",
      location: {
        warehouse: "Gudang B",
        shelf: "Rak 1",
        bin: "B1",
      },
      supplier: {
        name: "ZTE Indonesia",
        contact: "+62-21-11223344",
        email: "info@zte.co.id",
      },
      barcode: "8901234567892",
      tags: ["set-top-box", "tv", "digital", "entertainment"],
      status: "active",
      createdBy: adminUser._id,
    },
    {
      name: "Kabel UTP Cat6",
      sku: "CBL-UTP6",
      category: "Cables",
      description: "Kabel UTP Category 6 untuk jaringan ethernet (per meter)",
      price: 8500,
      costPrice: 6000,
      stock: {
        current: 500,
        minimum: 100,
        maximum: 1000,
      },
      unit: "meter",
      location: {
        warehouse: "Gudang C",
        shelf: "Rak 1",
        bin: "C1",
      },
      supplier: {
        name: "Belden Indonesia",
        contact: "+62-21-55667788",
        email: "sales@belden.co.id",
      },
      barcode: "8901234567893",
      tags: ["cable", "utp", "cat6", "ethernet", "networking"],
      status: "active",
      createdBy: adminUser._id,
    },
    {
      name: "Switch 24 Port",
      sku: "SWH-24P",
      category: "Networking",
      description: "Switch jaringan 24 port managed untuk kantor",
      price: 1250000,
      costPrice: 1000000,
      stock: {
        current: 0,
        minimum: 5,
        maximum: 20,
      },
      unit: "pcs",
      location: {
        warehouse: "Gudang A",
        shelf: "Rak 3",
        bin: "A3",
      },
      supplier: {
        name: "Cisco Indonesia",
        contact: "+62-21-99887766",
        email: "partner@cisco.co.id",
      },
      barcode: "8901234567894",
      tags: ["switch", "managed", "24-port", "networking"],
      status: "active",
      createdBy: adminUser._id,
    },
  ];

  const createdProducts = await Product.insertMany(products);
  console.log(`Created ${createdProducts.length} products`);
  return createdProducts;
};

const seedStockMovements = async (products, users) => {
  console.log("Seeding stock movements...");

  const adminUser = users.find((u) => u.role === "admin");
  const movements = [];

  // Create initial stock movements for products
  products.forEach((product) => {
    if (product.stock.current > 0) {
      movements.push({
        product: product._id,
        type: "in",
        quantity: product.stock.current,
        previousStock: 0,
        newStock: product.stock.current,
        reason: "Initial stock",
        reference: `INIT-${product.sku}`,
        createdBy: adminUser._id,
      });
    }
  });

  // Add some additional movements for demonstration
  const router = products.find((p) => p.sku === "RTR-AC1200");
  const modem = products.find((p) => p.sku === "MDM-ADSL2");

  if (router) {
    movements.push({
      product: router._id,
      type: "out",
      quantity: 5,
      previousStock: 25,
      newStock: 20,
      reason: "Sale to customer",
      reference: "INV-2024-001",
      createdBy: adminUser._id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });
  }

  if (modem) {
    movements.push({
      product: modem._id,
      type: "damage",
      quantity: 2,
      previousStock: 10,
      newStock: 8,
      reason: "Damaged during transport",
      notes: "Units damaged during delivery",
      createdBy: adminUser._id,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });
  }

  const createdMovements = await StockMovement.insertMany(movements);
  console.log(`Created ${createdMovements.length} stock movements`);
  return createdMovements;
};

const seedAssets = async (users) => {
  console.log("Seeding assets...");

  const adminUser = users.find((u) => u.role === "admin");
  const staffUser = users.find((u) => u.role === "user");

  const assets = [
    {
      name: "Laptop Dell Latitude 5520",
      assetCode: "LT-001",
      category: "IT Equipment",
      description: "Laptop untuk staff IT",
      serialNumber: "DL123456789",
      purchasePrice: 15000000,
      currentValue: 12000000,
      purchaseDate: new Date("2023-01-15"),
      supplier: "Dell Indonesia",
      location: "IT Office",
      assignedTo: staffUser._id,
      status: "in_use",
      condition: "good",
      maintenanceSchedule: {
        frequency: "quarterly",
        nextMaintenance: new Date("2024-04-15"),
      },
      createdBy: adminUser._id,
    },
    {
      name: "Printer HP LaserJet Pro",
      assetCode: "PR-001",
      category: "Office Furniture",
      description: "Printer laser untuk kantor",
      serialNumber: "HP987654321",
      purchasePrice: 3500000,
      currentValue: 2800000,
      purchaseDate: new Date("2023-03-20"),
      supplier: "HP Indonesia",
      location: "Admin Office",
      status: "available",
      condition: "excellent",
      maintenanceSchedule: {
        frequency: "monthly",
        nextMaintenance: new Date("2024-02-20"),
      },
      createdBy: adminUser._id,
    },
    {
      name: "Projector Epson EB-X51",
      assetCode: "PJ-001",
      category: "Machinery",
      description: "Projector untuk meeting room",
      serialNumber: "EP456789123",
      purchasePrice: 8000000,
      currentValue: 6500000,
      purchaseDate: new Date("2023-02-10"),
      supplier: "Epson Indonesia",
      location: "Meeting Room A",
      status: "in_use",
      condition: "good",
      maintenanceSchedule: {
        frequency: "quarterly",
        nextMaintenance: new Date("2024-03-10"),
      },
      createdBy: adminUser._id,
    },
  ];

  const createdAssets = await Asset.insertMany(assets);
  console.log(`Created ${createdAssets.length} assets`);
  return createdAssets;
};

const seedApiKeys = async (users) => {
  console.log("Seeding API keys...");

  const superAdmin = users.find((u) => u.role === "super_admin");

  const apiKeys = [
    {
      name: "Production API Key",
      key: "sk_live_prod_" + require("crypto").randomBytes(32).toString("hex"),
      permissions: ["read", "write", "analytics"],
      rateLimit: 5000,
      createdBy: superAdmin._id,
    },
    {
      name: "Analytics API Key",
      key:
        "sk_live_analytics_" +
        require("crypto").randomBytes(32).toString("hex"),
      permissions: ["read", "analytics"],
      rateLimit: 2000,
      createdBy: superAdmin._id,
    },
    {
      name: "Read Only API Key",
      key:
        "sk_live_readonly_" + require("crypto").randomBytes(32).toString("hex"),
      permissions: ["read"],
      rateLimit: 1000,
      createdBy: superAdmin._id,
    },
  ];

  const createdApiKeys = await ApiKey.insertMany(apiKeys);
  console.log(`Created ${createdApiKeys.length} API keys`);

  // Log the API keys for reference (in production, these should be securely distributed)
  console.log("\n=== GENERATED API KEYS ===");
  createdApiKeys.forEach((key) => {
    console.log(`${key.name}: ${key.key}`);
  });
  console.log("=========================\n");

  return createdApiKeys;
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log("Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      StockMovement.deleteMany({}),
      Asset.deleteMany({}),
      ApiKey.deleteMany({}),
    ]);
    console.log("Existing data cleared");

    // Seed in order due to dependencies
    const users = await seedUsers();
    const products = await seedProducts(users);
    const movements = await seedStockMovements(products, users);
    const assets = await seedAssets(users);
    const apiKeys = await seedApiKeys(users);

    console.log("\n=== SEEDING COMPLETE ===");
    console.log(`Users: ${users.length}`);
    console.log(`Products: ${products.length}`);
    console.log(`Stock Movements: ${movements.length}`);
    console.log(`Assets: ${assets.length}`);
    console.log(`API Keys: ${apiKeys.length}`);
    console.log("========================");

    console.log("\n=== LOGIN CREDENTIALS ===");
    console.log("Super Admin: superadmin@inventory.com / admin123");
    console.log("Admin: admin@inventory.com / admin123");
    console.log("Staff: staff@inventory.com / staff123");
    console.log("==========================");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
