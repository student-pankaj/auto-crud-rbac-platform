# ⚡ Quick Deployment Reference

A one-page cheat sheet for deploying your Auto-CRUD RBAC Platform.

---

## 🎯 The 5-Step Process

```
1️⃣ Backend  →  Render.com   (3-5 min)
2️⃣ Frontend  →  Vercel      (2-4 min)
3️⃣ Connect   →  Update CORS (2 min)
4️⃣ Test      →  Verify URLs (2 min)
5️⃣ Done!     →  Share URL
```

---

## 🔧 Configuration Quick Reference

### Backend (Render)
| Setting | Value |
|---------|-------|
| **Service Type** | Web Service |
| **Name** | `auto-crud-backend` |
| **Build Cmd** | `cd server && npm install` |
| **Start Cmd** | `cd server && npm start` |
| **Instance** | Starter (Free) |

**Environment Variables:**
```bash
NODE_ENV=production
JWT_SECRET=<generate-random-secret>
CORS_ORIGIN=<your-vercel-url>  # Add after frontend deploy
```

**Database (choose one):**
- **SQLite**: Mount disk at `/opt/render/project/src/server/data`
  - Add: `DATABASE_PATH=/opt/render/project/src/server/data/database.sqlite`
- **PostgreSQL**: Create database, auto-provides `DATABASE_URL`

### Frontend (Vercel)
| Setting | Value |
|---------|-------|
| **Framework** | Create React App |
| **Root Dir** | `client` |
| **Build Cmd** | `npm run build` |
| **Output** | `build` |

**Environment Variable:**
```bash
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

---

## 🔗 Your URLs Template

Replace `your-service-name` with your actual names:

```
Backend:   https://auto-crud-backend.onrender.com
Frontend:  https://auto-crud-frontend.vercel.app
Health:    https://auto-crud-backend.onrender.com/api/health
```

---

## 🧪 Quick Tests

### Test Backend
```powershell
curl https://your-backend.onrender.com/api/health
```
**Expected:** `{"status":"OK","timestamp":"..."}`

### Test Full Flow
1. Open frontend URL
2. Register account → Should redirect to dashboard
3. Login → Should see dashboard
4. Create model → Should save successfully

---

## 🚨 Common Issues

| Problem | Solution |
|---------|----------|
| Backend returns 503 | Service spinning up (wait 30s) |
| CORS error | Update `CORS_ORIGIN` in Render env vars |
| "Cannot connect" | Check `REACT_APP_API_URL` in Vercel |
| Auth fails | Verify `JWT_SECRET` is set in Render |
| Database error | Check database connection in logs |

---

## 📱 Check Logs

**Render Backend:**
```
Dashboard → Service → Logs tab
```

**Vercel Frontend:**
```
Dashboard → Project → Deployments → Latest → View logs
```

---

## 🔄 Update Your App

```powershell
git add .
git commit -m "Your changes"
git push origin main
```

Both Render and Vercel auto-deploy! 🎉

---

## 📞 Need Help?

1. ✅ Check logs (most issues visible there)
2. ✅ Test backend health endpoint first
3. ✅ Verify all env vars are set
4. ✅ See `DEPLOYMENT_GUIDE.md` for details

---

**Full Guide**: See `DEPLOYMENT_GUIDE.md` for detailed step-by-step instructions.

**Your Repo**: https://github.com/student-pankaj/auto-crud-rbac-platform

