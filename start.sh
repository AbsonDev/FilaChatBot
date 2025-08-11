#!/bin/bash

# Production script for Replit deployment
# This script handles both building and starting the application

echo "🚀 FilaChatBot Production Deployment"
echo "======================================"

# Always build for production deployment
echo "📦 Building application for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🌟 Starting production server..."
    NODE_ENV=production npm start
else
    echo "❌ Build failed!"
    exit 1
fi