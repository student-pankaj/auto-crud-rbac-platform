# Deployment Guide

## Prerequisites
- GitHub account
- Render account (free tier available)
- Vercel account (free tier available)

## Step 1: Prepare Repository

### 1.1 Remove node_modules from Git (if already staged)
```bash
git reset HEAD client/node_modules server/node_modules node_modules
git rm -r --cached client/node_modules server/node_modules node_modules
```

### 1.2 Commit .gitignore and deployment files
```bash
git add .gitignore render.yaml DEPLOYMENT.md
git commit -m "Add .gitignore and deployment configuration"
```

### 1.3 Push to GitHub
```bash
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub

### 2.2 Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `auto-crud-backend`
   - **Root Directory**: Leave empty (or `server` if you want to deploy only server folder)
   - **Runtime**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Instance Type**: Starter (Free)

### 2.3 Environment Variables
Add these in Render Dashboard → Environment:

- `NODE_ENV` = `production`
- `JWT_SECRET` = (Generate a strong secret key, e.g., use `openssl rand -base64 32`)
- `CORS_ORIGIN` = (Leave empty for now, update after frontend deployment)
- `PORT` = (Automatically set by Render, don't override)

### 2.4 Database Setup (Choose One)

#### Option A: SQLite with Persistent Disk (Free)
1. In your Render service, go to "Disks" tab
2. Create a new disk:
   - Name: `data-disk`
   - Mount Path: `/opt/render/project/src/server/data`
   - Size: 1GB (free tier)

2. Update your database path in `server/config/database.js` to use:
   ```javascript
   storage: process.env.DATABASE_PATH || path.join(__dirname, '../data/database.sqlite')
   ```

3. Add environment variable:
   - `DATABASE_PATH` = `/opt/render/project/src/server/data/database.sqlite`

#### Option B: PostgreSQL (Recommended for Production)
1. In Render Dashboard, create a new PostgreSQL database:
   - Name: `auto-crud-db`
   - Plan: Starter (Free)
   - Version: Latest

2. Update `server/config/database.js` to use PostgreSQL:
   ```javascript
   const sequelize = new Sequelize(process.env.DATABASE_URL, {
     dialect: 'postgres',
     logging: false,
   });
   ```

3. The `DATABASE_URL` will be automatically provided by Render

### 2.5 Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Copy your backend URL (e.g., `https://auto-crud-backend.onrender.com`)

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub

### 3.2 Import Project
1. Click "New Project"
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Create React App (or Vite if using Vite)
   - **Root Directory**: `client` (if your frontend is in client folder)
   - **Build Command**: `npm run build`
   - **Output Directory**: `build` (for CRA) or `dist` (for Vite)

### 3.3 Environment Variables
Add in Vercel Dashboard → Settings → Environment Variables:

- `REACT_APP_API_URL` = `https://your-backend-url.onrender.com/api`
  - Replace `your-backend-url` with your actual Render backend URL

### 3.4 Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Copy your frontend URL (e.g., `https://your-project.vercel.app`)

## Step 4: Update CORS Configuration

### 4.1 Update Render Environment Variables
1. Go back to Render Dashboard → Your Backend Service → Environment
2. Update `CORS_ORIGIN` with your Vercel frontend URL:
   - `CORS_ORIGIN` = `https://your-project.vercel.app`
3. Redeploy the backend service

### 4.2 Verify Connection
1. Visit your Vercel frontend URL
2. Try logging in - it should connect to your Render backend
3. Check browser console for any CORS errors

## Step 5: Post-Deployment Checklist

- [ ] Backend is accessible at Render URL
- [ ] Frontend can connect to backend API
- [ ] Health check endpoint works: `https://your-backend.onrender.com/api/health`
- [ ] Authentication works
- [ ] Models can be created and published
- [ ] CORS errors are resolved
- [ ] Database persistence is working (check if data persists after restart)

## Troubleshooting

### Backend Issues
- **Port binding error**: Ensure server listens on `0.0.0.0` (already configured)
- **Database errors**: Check database path and permissions
- **CORS errors**: Verify `CORS_ORIGIN` matches your frontend URL exactly

### Frontend Issues
- **API connection fails**: Verify `REACT_APP_API_URL` is correct
- **Build fails**: Check Node version in Vercel settings (should match local)
- **404 errors**: Verify routing configuration for client-side routing

### Common Commands
```bash
# Check Render logs
# Go to Render Dashboard → Your Service → Logs

# Check Vercel logs
# Go to Vercel Dashboard → Your Project → Deployments → View Function Logs

# Test backend health
curl https://your-backend.onrender.com/api/health
```

## Environment Variables Summary

### Backend (Render)
- `NODE_ENV` = `production`
- `JWT_SECRET` = (your secret key)
- `CORS_ORIGIN` = (your Vercel frontend URL)
- `DATABASE_PATH` = (if using SQLite with disk)
- `DATABASE_URL` = (if using PostgreSQL - auto-provided)

### Frontend (Vercel)
- `REACT_APP_API_URL` = (your Render backend URL + /api)

## Support

For issues:
1. Check Render logs for backend errors
2. Check Vercel deployment logs for frontend errors
3. Check browser console for client-side errors
4. Verify all environment variables are set correctly

