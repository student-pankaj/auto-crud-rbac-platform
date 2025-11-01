# 🚀 Complete Deployment Guide - Step by Step

This guide will walk you through deploying your Auto-CRUD RBAC Platform to production.

## 📋 Overview

You'll be deploying:
- **Backend** (Node.js/Express) → **Render.com** (Free tier)
- **Frontend** (React) → **Vercel** (Free tier)

**Total Time**: ~10-15 minutes
**Cost**: $0 (using free tiers)

---

## ✅ Prerequisites Checklist

Before starting, make sure you have:
- [x] Project is on GitHub (✅ You're all set!)
- [ ] GitHub account (free)
- [ ] Render.com account (free tier)
- [ ] Vercel account (free tier)

---

## 🎯 STEP 1: Deploy Backend to Render

### 1.1 Create Render Account
1. Go to **[https://render.com](https://render.com)**
2. Click **"Get Started for Free"**
3. Choose **"Sign up with GitHub"**
4. Authorize Render to access your GitHub repositories

### 1.2 Create Web Service
1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect to your repository:
   - Click **"Connect account"** if GitHub isn't connected
   - Select repository: **`auto-crud-rbac-platform`**
   - Click **"Connect"**

### 1.3 Configure Backend Settings
Fill in these settings:

| Field | Value |
|-------|-------|
| **Name** | `auto-crud-backend` |
| **Region** | Choose closest to you (e.g., US West, US East) |
| **Branch** | `main` |
| **Root Directory** | Leave **empty** (it will use root folder) |
| **Runtime** | `Node` |
| **Build Command** | `cd server && npm install` |
| **Start Command** | `cd server && npm start` |
| **Instance Type** | `Starter` (Free tier - $7/month free credit) |

Click **"Advanced"** to add environment variables.

### 1.4 Add Environment Variables
Click **"Add Environment Variable"** and add these one by one:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `JWT_SECRET` | Generate one below | **Important!** |
| `CORS_ORIGIN` | Leave **empty** for now | Update after frontend deploy |
| `PORT` | **Don't add this** | Auto-set by Render |

#### Generate JWT Secret (Choose ONE method):

**Option A - Using PowerShell:**
```powershell
openssl rand -base64 32
```

**Option B - Using Online Tool:**
- Go to: https://generate-secret.vercel.app/32
- Copy the generated secret
- Use it as your JWT_SECRET value

### 1.5 Choose Database Option

You have **2 options** for your database:

#### **Option A: SQLite with Persistent Disk** (Recommended for Free Tier)
1. In the service configuration, scroll to **"Disks"** section
2. Click **"Add Disk"**
3. Configure:
   - **Name**: `data-disk`
   - **Mount Path**: `/opt/render/project/src/server/data`
   - **Size**: 1 GB (Free tier max)
4. Add environment variable:
   - Key: `DATABASE_PATH`
   - Value: `/opt/render/project/src/server/data/database.sqlite`

#### **Option B: PostgreSQL** (Better for production)
1. Create PostgreSQL database:
   - In Render Dashboard, click **"New +"** → **"PostgreSQL"**
   - Name: `auto-crud-db`
   - Plan: `Starter` (Free - 90 day trial)
   - Click **"Create Database"**
2. The `DATABASE_URL` environment variable is **automatically added** to your web service

### 1.6 Deploy Backend
1. Scroll down and click **"Create Web Service"**
2. Render will start building and deploying
3. Watch the logs - this takes 3-5 minutes
4. Wait for: **"Your service is live"** message ✅
5. Copy your backend URL (e.g., `https://auto-crud-backend.onrender.com`)

**💡 Tip**: The URL will be `https://[name].onrender.com` where `[name]` is what you entered in step 1.3

---

## 🎨 STEP 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Account
1. Go to **[https://vercel.com](https://vercel.com)**
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your repositories

### 2.2 Import Project
1. In Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Import your repository:
   - Click **"Import"** next to `auto-crud-rbac-platform`
   - If not visible, use **"Import Git Repository"** and paste your GitHub URL

### 2.3 Configure Frontend Settings
Fill in these settings:

| Field | Value |
|-------|-------|
| **Project Name** | `auto-crud-frontend` (or any name you like) |
| **Framework Preset** | `Create React App` |
| **Root Directory** | `client` ← **IMPORTANT!** |
| **Build Command** | `npm run build` |
| **Output Directory** | `build` |
| **Install Command** | `npm install` (default) |

### 2.4 Add Environment Variable
Before deploying, add the backend URL:

1. In the configuration, find **"Environment Variables"** section
2. Click to expand it
3. Add:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://auto-crud-backend.onrender.com/api`
     - ⚠️ Replace `auto-crud-backend` with your actual Render service name!

### 2.5 Deploy Frontend
1. Click **"Deploy"**
2. Wait 2-4 minutes for build to complete
3. Once deployed, click **"Continue to Dashboard"**
4. Copy your frontend URL (e.g., `https://auto-crud-frontend.vercel.app`)

---

## 🔗 STEP 3: Connect Backend and Frontend

### 3.1 Update Backend CORS
Your backend needs to allow your frontend to make requests:

1. Go back to **Render Dashboard**
2. Select your backend service (`auto-crud-backend`)
3. Go to **"Environment"** tab
4. Find `CORS_ORIGIN` environment variable
5. Click the **pencil icon** to edit
6. Update value to your Vercel URL:
   - `https://auto-crud-frontend.vercel.app`
   - ⚠️ Replace `auto-crud-frontend` with your actual Vercel project name!
7. Click **"Save Changes"**
8. Render will **automatically redeploy** (wait 2-3 minutes)

---

## 🧪 STEP 4: Test Your Deployment

### 4.1 Test Backend Health
Open your browser and visit:
```
https://auto-crud-backend.onrender.com/api/health
```

You should see:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 4.2 Test Frontend
1. Open your Vercel frontend URL
2. You should see the **Login/Register** page
3. Try registering a new account
4. Try logging in

### 4.3 Common Issues

**❌ Problem**: Backend health check fails
- **Solution**: Check Render logs (Dashboard → Service → Logs)

**❌ Problem**: "Cannot connect to backend" in frontend
- **Solution**: 
  1. Verify `REACT_APP_API_URL` is correct in Vercel
  2. Check browser console for errors
  3. Make sure backend is running in Render

**❌ Problem**: CORS error
- **Solution**: 
  1. Verify `CORS_ORIGIN` matches your Vercel URL exactly
  2. Make sure backend was redeployed after updating CORS
  3. Check URL doesn't have trailing slash

**❌ Problem**: Login/Register doesn't work
- **Solution**:
  1. Check backend logs in Render
  2. Verify JWT_SECRET is set
  3. Check database connection in logs

---

## 📊 STEP 5: Monitor and Maintain

### 5.1 View Logs

**Backend Logs (Render):**
1. Go to Render Dashboard
2. Select your service
3. Click **"Logs"** tab
4. Real-time logs will appear

**Frontend Logs (Vercel):**
1. Go to Vercel Dashboard
2. Select your project
3. Click **"Deployments"**
4. Click on latest deployment
5. View build logs or runtime logs

### 5.2 Update Your Application

When you make changes:

1. **Push to GitHub:**
   ```powershell
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **Auto-Deploy**: Both Render and Vercel will automatically redeploy!

### 5.3 Rollback if Something Breaks

**Render:**
1. Go to service → **"Events"** tab
2. Find previous successful deployment
3. Click **"Rollback"**

**Vercel:**
1. Go to project → **"Deployments"**
2. Find previous working deployment
3. Click **"⋯"** → **"Promote to Production"**

---

## 📝 Important URLs to Save

Keep these URLs handy:

- **Backend URL**: `https://auto-crud-backend.onrender.com`
- **Frontend URL**: `https://auto-crud-frontend.vercel.app`
- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repository**: https://github.com/student-pankaj/auto-crud-rbac-platform

---

## 🔐 Free Tier Limitations

**Render (Backend):**
- ✅ $7/month free credit
- ⚠️ Service spins down after 15 mins of inactivity
- ⚠️ First request after spin-down takes 30-50 seconds
- ✅ Auto-wake on first request
- 💡 Upgrade to **Starter ($7/month)** for always-on

**Vercel (Frontend):**
- ✅ Unlimited deployments
- ✅ Always on (no spin-down)
- ✅ Global CDN included
- ✅ Perfect for production!

---

## 🎓 Next Steps

Now that your app is deployed:

1. ✅ **Share your URL** with friends/clients
2. ✅ **Create admin account** to manage models
3. ✅ **Add your domain** (optional):
   - Vercel: Settings → Domains → Add your domain
   - Render: Settings → Custom Domains → Add domain
4. ✅ **Set up monitoring**:
   - Add UptimeRobot for uptime monitoring (free)
   - Set up email alerts in Render

---

## 🆘 Need Help?

If you encounter issues:

1. **Check the logs** (most problems are in logs)
2. **Verify all environment variables** are set correctly
3. **Test backend health** endpoint first
4. **Check browser console** for frontend errors
5. **Ensure CORS_ORIGIN** matches exactly

Common commands to test:

```powershell
# Test backend
curl https://your-backend.onrender.com/api/health

# Test with auth
curl -X POST https://your-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123","role":"Viewer"}'
```

---

## ✨ You're Done!

Your Auto-CRUD RBAC Platform is now live on the internet! 🎉

**Backend**: Running on Render ✅  
**Frontend**: Running on Vercel ✅  
**Database**: Persistent and connected ✅  
**Auto-Deploy**: Enabled ✅  

**Share your frontend URL and start building!** 🚀

---

*Deployment completed! If you need help, check the logs or refer back to this guide.*

