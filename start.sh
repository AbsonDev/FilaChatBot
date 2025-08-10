#!/bin/bash

# Production start script for Replit deployment
echo "Starting FilaChatBot in production mode..."

# Build the application if dist doesn't exist
if [ ! -d "dist" ]; then
  echo "Building application..."
  npm run build
fi

# Start the production server
echo "Starting production server..."
NODE_ENV=production npm start