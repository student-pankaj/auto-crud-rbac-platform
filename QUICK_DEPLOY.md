# Quick Deployment Checklist

## Before You Start
1. ✅ Remove `node_modules` from Git:
   ```bash
   git reset HEAD client/node_modules server/node_modules node_modules
   git rm -r --cached client/node_modules server/node_modules node_modules
   ```

2. ✅ Commit deployment files:
   ```bash
   git add .gitignore render.yaml DEPLOYMENT.md QUICK_DEPLOY.md
   git commit -m "Add deployment configuration"
   git push
   ```

## Backend (Render) - 5 Minutes

1. Go to https://render.com → Sign up with GitHub
2. Click "New +" → "Web Service"
3. Connect your repository
4. Configure:
   - **Name**: `auto-crud-backend`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Starter (Free)

5. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = (run: `openssl rand -base64 32`)
   - `CORS_ORIGIN` = (leave empty, update after frontend deploy)

6. For Database (choose one):
   - **SQLite**: Add Disk in Render → Mount Path: `/opt/render/project/src/server/data`
     - Add env: `DATABASE_PATH` = `/opt/render/project/src/server/data/database.sqlite`
   - **PostgreSQL**: Create PostgreSQL database in Render → Auto-provides `DATABASE_URL`

7. Deploy → Copy your backend URL

## Frontend (Vercel) - 3 Minutes

1. Go to https://vercel.com → Sign up with GitHub
2. Click "New Project" → Import repository
3. Configure:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. Add Environment Variable:
   - `REACT_APP_API_URL` = `https://your-backend.onrender.com/api`

5. Deploy → Copy your frontend URL

## Connect Them - 2 Minutes

1. Go back to Render → Your Backend → Environment
2. Update `CORS_ORIGIN` = `https://your-project.vercel.app`
3. Redeploy backend

## Test

- Backend Health: `https://your-backend.onrender.com/api/health`
- Frontend: `https://your-project.vercel.app`
- Try logging in!

---

**Full Guide**: See `DEPLOYMENT.md` for detailed instructions and troubleshooting.

