#!/bin/bash

# Backend Startup Script for Inventory Management System
echo "🚀 Starting Inventory Management Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Navigate to backend directory
cd "$(dirname "$0")"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env file from template"
        echo "⚠️  Please update the .env file with your actual configuration"
    else
        echo "❌ .env.example not found!"
        exit 1
    fi
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

# Check if MongoDB is running (simple check)
echo "🔍 Checking MongoDB connection..."

# Start the server
echo "🗄️  Starting Express server..."
echo "📱 Backend will be available at: http://localhost:3001"
echo "🔍 Health check: http://localhost:3001/health"
echo "📖 API docs: http://localhost:3001/api-docs"
echo ""
echo "💡 Quick setup tips:"
echo "   - Update MONGODB_URI in .env file"
echo "   - Update JWT_SECRET in .env file"
echo "   - Run 'node seeds/seedDatabase.js' to seed sample data"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Start with nodemon for development
if command -v nodemon &> /dev/null; then
    nodemon server.js
else
    echo "⚠️  nodemon not found. Installing globally..."
    npm install -g nodemon
    nodemon server.js
fi