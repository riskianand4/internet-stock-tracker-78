#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting backend development server...\n');

// Change to backend directory
process.chdir(path.join(__dirname, '..'));

// Install dependencies if node_modules doesn't exist
const fs = require('fs');
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing backend dependencies...');
  const installProcess = spawn('npm', ['install'], { stdio: 'inherit' });
  
  installProcess.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Failed to install dependencies');
      process.exit(1);
    }
    startServer();
  });
} else {
  startServer();
}

function startServer() {
  console.log('🗄️  Starting MongoDB connection...');
  console.log('📱 Backend will run on http://localhost:3001');
  console.log('🔄 Auto-restart enabled with nodemon\n');
  
  // Start the server with nodemon for auto-restart
  const serverProcess = spawn('npx', ['nodemon', 'server.js'], { stdio: 'inherit' });
  
  serverProcess.on('close', (code) => {
    console.log(`\n🛑 Backend server exited with code ${code}`);
  });
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down backend server...');
    serverProcess.kill('SIGINT');
    process.exit(0);
  });
}