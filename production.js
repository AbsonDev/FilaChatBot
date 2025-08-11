#!/usr/bin/env node

/**
 * Production deployment script for FilaChatBot
 * This script builds and starts the application in production mode
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

console.log('🚀 FilaChatBot Production Deployment');
console.log('======================================');

try {
  // Set production environment
  process.env.NODE_ENV = 'production';
  
  console.log('📦 Building application for production...');
  
  // Run build command
  execSync('npm run build', {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  console.log('✅ Build completed successfully!');
  
  // Verify build output exists
  const distPath = path.join(__dirname, 'dist');
  const serverPath = path.join(distPath, 'index.js');
  const publicPath = path.join(distPath, 'public');
  
  if (!existsSync(serverPath)) {
    throw new Error('Server build not found at dist/index.js');
  }
  
  if (!existsSync(publicPath)) {
    throw new Error('Frontend build not found at dist/public');
  }
  
  console.log('🌟 Starting production server...');
  
  // Start production server
  execSync('npm start', {
    stdio: 'inherit',
    cwd: __dirname
  });
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}