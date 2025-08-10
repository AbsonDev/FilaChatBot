# 🛠️ Replit Deployment Fix Guide

## Problem
Deployment fails with security block: "Run command contains 'dev' which is not allowed for production deployments"

## Root Cause
The `.replit` file has `run = ["sh", "-c", "npm run dev"]` in the deployment section, which triggers Replit's security measures against deploying development servers to production.

## Solution Options

### Option 1: Manual .replit Configuration Update (Recommended)
Since I cannot edit the `.replit` file directly, you need to update it manually:

**Current problematic configuration:**
```toml
[deployment]
deploymentTarget = "autoscale"
run = ["sh", "-c", "npm run dev"]
```

**Required fix - update to:**
```toml
[deployment]
deploymentTarget = "autoscale"
build = "npm run build"
run = ["sh", "-c", "npm start"]
```

### Option 2: Use Alternative Production Scripts
I've created production scripts as alternatives:

1. **`./start.sh`** - Bash script that builds and starts production server
2. **`./production.js`** - Node.js script with error handling and verification

### Option 3: Replit Deployment Interface
Use Replit's deployment interface to configure:
- **Build Command**: `npm run build`
- **Run Command**: `npm start`

## Manual Steps to Fix

1. **Edit .replit file** (you'll need to do this manually):
   - Change the deployment run command from `npm run dev` to `npm start`
   - Add build command: `build = "npm run build"`

2. **Alternative: Use Production Script**:
   - Set run command to: `["sh", "-c", "./start.sh"]`
   - This script handles building and starting properly

3. **Verify Environment Variables**:
   - Ensure `NODE_ENV=production` is set for deployment
   - Confirm `PORT=5000` is configured

## Files Ready for Production
- ✅ `package.json` has correct build and start scripts
- ✅ `dist/` directory builds successfully with optimized assets
- ✅ Production server configuration handles static files correctly
- ✅ Environment variables configured for production mode
- ✅ Alternative production scripts created as backup

## Next Steps
1. Manually update the `.replit` file deployment section
2. Or use Replit's deployment interface to set build/run commands
3. Deploy with the corrected configuration

The application code is production-ready; only the deployment configuration needs adjustment.