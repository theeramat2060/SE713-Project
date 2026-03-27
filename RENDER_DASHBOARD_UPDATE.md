# Render Dashboard Configuration - Update Required

## The Issue

Render is still trying to run `node index.js` because the service was created BEFORE we added the Procfile and render.yaml configuration files.

**Current behavior:**
```
==> Running build command 'npm install'...
==> Running 'node index.js'  ← WRONG! Should be npm run build && npm start
Error: Cannot find module '/opt/render/project/src/index.js'
```

**What should happen:**
```
==> Running build command 'npm install && npm run build'...
==> Running 'npm start'  ← Correct! Runs node dist/server.js
```

## Solution: Update Render Dashboard Settings

Since the service was already created, you need to update its settings manually in the Render dashboard.

### Step-by-Step Instructions

#### 1. Go to Render Dashboard
- Visit https://dashboard.render.com
- Find your service: "se713-project-api" (or whatever you named it)
- Click on it

#### 2. Go to Settings
- Click "Settings" tab
- Scroll to "Build & Deploy" section

#### 3. Update Build Command
Find: **Build Command**
- Current: `npm install`
- Change to: `npm install && npm run build`
- Click "Save"

#### 4. Update Start Command
Find: **Start Command**
- Current: `node index.js`
- Change to: `npm start`
- Click "Save"

#### 5. Trigger Redeploy
- Go back to "Deploys" tab
- Click "Redeploy" button (or "Clear build cache and redeploy")
- Wait for deployment

### Screenshot Location (if needed)
In Render dashboard:
1. Dashboard → Your Service
2. Settings → Build & Deploy
3. Modify "Build Command" and "Start Command"
4. Saves automatically
5. Go to Deploys tab and click "Redeploy"

---

## Alternative: Connect via Infrastructure as Code

If you want Render to auto-detect configuration from your repository:

### Option A: Use render.yaml (Most Powerful)
1. We already created `render.yaml` in the repo
2. Delete current service from Render
3. Go to https://dashboard.render.com/infrastructure-as-code
4. Click "New" → "Deploy Infrastructure as Code"
5. Select your GitHub repo
6. Render will auto-detect `render.yaml`
7. Click "Deploy"

### Option B: Use Procfile (Simpler)
The Procfile approach doesn't work retroactively on existing services - it only works if Render detects it on initial setup.

---

## What We Fixed in the Code

✅ `package.json`:
- Changed `"main"` from `"index.js"` to `"dist/server.js"`
- Added `"prebuild"` and `"prestart"` lifecycle hooks

✅ `Procfile`:
- Changed from: `web: npm run build && npm start`
- To: `web: npm install && npm run build && npm start`
- (More explicit about all steps)

✅ `.nvmrc`:
- Added Node version specification: `24.5.0`
- Ensures consistent Node version across environments

✅ `render.yaml`:
- Full Render-native configuration
- Specifies build and start commands explicitly

---

## Step-by-Step What Happens After Fix

### Render Dashboard Update Method (Quick Fix)

1. ✅ You update Build Command in Render dashboard
2. ✅ You update Start Command in Render dashboard
3. ✅ You click "Redeploy"
4. Render fetches latest code from GitHub
5. Runs: `npm install && npm run build` (Build Command)
   - Installs dependencies
   - Compiles TypeScript to dist/
6. Runs: `npm start` (Start Command)
   - Executes: `node dist/server.js`
   - Server starts ✅

### Infrastructure as Code Method (Long-term)

1. ✅ Delete current service
2. ✅ Create new service from `render.yaml`
3. Render auto-detects configuration from repo
4. Everything else same as above

---

## Commands to Verify Locally

```bash
# These commands verify everything works locally
cd SE713-Project

# Simulate clean environment (like Render)
rm -rf dist node_modules package-lock.json

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start the server
npm start

# Should show no errors and server running on PORT
```

---

## Current State

✅ **Code is fixed and committed:**
- package.json updated
- Procfile enhanced
- .nvmrc added
- render.yaml created
- All pushed to GitHub

❌ **Render service needs dashboard update:**
- Build Command: Change to `npm install && npm run build`
- Start Command: Change to `npm start`
- Then click "Redeploy"

---

## Files Ready for Deploy

If you create a NEW service:
- ✅ Procfile exists (will be auto-detected)
- ✅ render.yaml exists (will be auto-detected if using Infrastructure as Code)
- ✅ .nvmrc exists (specifies Node version)
- ✅ package.json updated (main field correct)

---

## Summary

The Render service you created earlier doesn't have the new configuration files in its mind. You need to:

**Quick Fix (5 minutes):**
1. Log in to Render dashboard
2. Find your service
3. Click Settings
4. Change Build Command to: `npm install && npm run build`
5. Change Start Command to: `npm start`
6. Click Redeploy

**Or Long-term Fix (Clean restart):**
1. Delete current service
2. Deploy new service using render.yaml (Infrastructure as Code)
3. Render auto-detects everything from your repo

Choose whichever is easier for your workflow!
