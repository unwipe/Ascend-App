# Ascend Production Deployment Guide
## Vercel (Frontend) + Render (Backend) + MongoDB Atlas

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] MongoDB Atlas account (free tier M0 is fine)
- [ ] Google Cloud Console access
- [ ] Vercel account (free tier)
- [ ] Render account (free tier)
- [ ] Git repository with latest code

---

## Phase 1: MongoDB Atlas Setup (Production Database)

### 1.1 Create Production Cluster

1. **Login to MongoDB Atlas**: https://cloud.mongodb.com
2. **Create New Cluster** (if you don't have one)
   - Choose **M0 Free Tier**
   - Region: Choose closest to your backend (Render Oregon → AWS us-west-2)
   - Cluster Name: `ascend-prod`

### 1.2 Create Database User

1. **Database Access** → **Add New Database User**
   - Authentication Method: **Password**
   - Username: `ascend_admin`
   - Password: **Generate a strong password** (save it securely!)
   - Database User Privileges: **Atlas admin** or **Read and write to any database**

### 1.3 Configure Network Access

1. **Network Access** → **Add IP Address**
   - **Option A (Development)**: Click **"Allow Access from Anywhere"** (`0.0.0.0/0`)
   - **Option B (Production - Recommended)**: Add your Render backend IP after deployment

### 1.4 Get Connection String

1. **Clusters** → Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Driver: **Python** / Version: **3.11 or later**
4. Copy the connection string:
   ```
   mongodb+srv://ascend_admin:<password>@ascend-prod.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Replace `<password>`** with your actual password
6. **Save this connection string** - you'll need it for Render

### 1.5 Create Database and Collections

1. **Clusters** → **Browse Collections** → **Add My Own Data**
2. **Database name**: `ascend_prod`
3. **Collection name**: `users`
4. Create another collection: `promo_codes`

### 1.6 Seed Promo Codes (Optional but Recommended)

Run the seed script locally pointing to production:

```bash
cd backend

# Set environment variable temporarily
export MONGO_URL="mongodb+srv://ascend_admin:<password>@ascend-prod.xxxxx.mongodb.net/?retryWrites=true&w=majority"
export DB_NAME="ascend_prod"

# Run seed script
python seed_promos.py
```

**Expected output:**
```
✅ Seeded 4 promo codes successfully!
```

Verify in Atlas → Collections → `promo_codes` (should show 4 documents)

---

## Phase 2: Google OAuth (Production Client)

### 2.1 Create Production OAuth Client

1. **Go to Google Cloud Console**: https://console.cloud.google.com/apis/credentials
2. **Create Credentials** → **OAuth 2.0 Client ID**
3. **Application type**: Web application
4. **Name**: `Ascend Production`

### 2.2 Configure OAuth Settings

**⚠️ IMPORTANT: You'll need to update these URLs after deployment**

For now, create with placeholder URLs and update later:

**Authorized JavaScript origins:**
```
https://your-app-name.vercel.app
```

**Authorized redirect URIs:**
```
https://your-app-name.vercel.app/auth/callback
```

**Note**: After deploying to Vercel, you'll get the actual URL. Come back and update these!

### 2.3 Save OAuth Credentials

1. **Copy the Client ID** (starts with something like `123456789-abc.apps.googleusercontent.com`)
2. Save it as: `GOOGLE_CLIENT_ID_PROD`

### 2.4 Enable Required APIs

1. **APIs & Services** → **Enable APIs and Services**
2. Search and enable:
   - ✅ **Google+ API** (for profile info)
   - ✅ **Google People API** (optional, for better profile data)

---

## Phase 3: Backend Deployment (Render)

### 3.1 Push Code to Git Repository

Ensure your code is pushed to GitHub/GitLab:

```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### 3.2 Create Render Service

1. **Login to Render**: https://dashboard.render.com
2. **New** → **Web Service**
3. **Connect Repository**: Choose your Git repository
4. **Service Configuration**:
   - **Name**: `ascend-backend` (or your choice)
   - **Region**: Oregon (Free)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port 8000`
   - **Plan**: Free

### 3.3 Set Environment Variables

In Render dashboard → **Environment** tab, add these variables:

| Key | Value | Notes |
|-----|-------|-------|
| `MONGO_URL` | `mongodb+srv://ascend_admin:<password>@...` | Your Atlas connection string |
| `DB_NAME` | `ascend_prod` | Production database name |
| `JWT_SECRET` | `<generate-random-string>` | **Generate a strong 64-char random string** |
| `JWT_ALGORITHM` | `HS256` | Algorithm for JWT |
| `JWT_EXPIRATION_MINUTES` | `43200` | 30 days in minutes |
| `GOOGLE_CLIENT_ID` | `123456789-abc.apps.googleusercontent.com` | Your production OAuth Client ID |
| `CORS_ORIGINS` | `https://your-app.vercel.app` | Your Vercel URL (update after frontend deployed) |
| `ENVIRONMENT` | `production` | Environment identifier |

**Generate JWT_SECRET:**
```bash
# On macOS/Linux:
openssl rand -hex 32

# Or use Python:
python -c "import secrets; print(secrets.token_hex(32))"
```

### 3.4 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. **Copy your Render backend URL**: `https://ascend-backend-xxxx.onrender.com`

### 3.5 Test Backend Health

Open in browser or use curl:

```bash
curl https://ascend-backend-xxxx.onrender.com/api/health
```

**Expected response:**
```json
{
  "ok": true,
  "status": "healthy",
  "environment": "production",
  "database": "connected",
  "version": "1.0.0"
}
```

✅ If you see this, your backend is live!

### 3.6 Update CORS_ORIGINS (After Frontend Deployment)

After deploying the frontend (next phase), come back to Render:

1. **Environment** tab
2. Update `CORS_ORIGINS` to: `https://your-actual-app.vercel.app`
3. Save → Service will auto-redeploy

---

## Phase 4: Frontend Deployment (Vercel)

### 4.1 Install Vercel CLI (Optional but Recommended)

```bash
npm install -g vercel
```

### 4.2 Deploy via Vercel Dashboard (Easier)

1. **Login to Vercel**: https://vercel.com/dashboard
2. **Add New Project** → **Import Git Repository**
3. **Select your repository**
4. **Configure Project**:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `build` (or leave default)

### 4.3 Set Environment Variables

In Vercel project settings → **Environment Variables**, add:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `REACT_APP_GOOGLE_CLIENT_ID` | `Your production OAuth Client ID` | Production |
| `REACT_APP_BACKEND_URL` | `https://ascend-backend-xxxx.onrender.com` | Production |

**⚠️ IMPORTANT:** 
- Use your **production** OAuth Client ID (not dev)
- Use your **Render backend URL** (from Phase 3)
- These vars MUST start with `REACT_APP_` for Create React App

### 4.4 Deploy

1. Click **"Deploy"**
2. Wait for build (2-5 minutes)
3. **Copy your Vercel URL**: `https://your-app-name.vercel.app`

### 4.5 Verify Frontend

Open your Vercel URL in browser. You should see the Ascend welcome screen!

---

## Phase 5: Update Google OAuth URLs

Now that you have your actual Vercel URL, update Google OAuth:

1. **Google Cloud Console** → **Credentials**
2. Click your **Ascend Production** OAuth client
3. **Update Authorized JavaScript origins:**
   ```
   https://your-actual-app.vercel.app
   ```
4. **Update Authorized redirect URIs:**
   ```
   https://your-actual-app.vercel.app/auth/callback
   ```
5. **Save**
6. **Wait 2-5 minutes** for changes to propagate

---

## Phase 6: Smoke Tests (End-to-End)

### 6.1 Authentication Flow

1. **Open your Vercel URL** in an **incognito window**
2. Click **"Continue with Google"**
3. Select your Google account
4. **Expected**: Login succeeds, you see the dashboard

**✅ Pass Criteria**: No `origin_mismatch` error, successful login

### 6.2 Data Persistence

1. **Add a Daily Quest**: "Test Quest"
2. Complete it (check it off)
3. **Verify**: XP increases, coins increase
4. **Check MongoDB Atlas**: Users collection → your user document should exist
5. **Refresh the page** (F5)
6. **Expected**: Your quest is still there, XP/coins persisted

**✅ Pass Criteria**: Data survives page refresh

### 6.3 Today's Progress Card

1. Complete another Daily Quest
2. **Expected**: "Today's Progress" card updates **instantly** showing:
   - XP Gained today
   - Quests completed count
   - No delay, no polling

**✅ Pass Criteria**: Instant update without page refresh

### 6.4 Store Purchase

1. Click **"Store"** button
2. Purchase an item (e.g., XP Multiplier - 20 coins)
3. **Expected**: 
   - Coins decrease immediately
   - Item appears in Profile → Inventory
   - Today's Progress shows coins spent

**✅ Pass Criteria**: Purchase works, inventory updates

### 6.5 Promo Code Redemption

1. Click **"Store"** → **"Redeem Code"**
2. Enter: `WELCOME100`
3. **Expected**: 
   - Success toast
   - XP increases by 100
   - Today's Progress updates

**✅ Pass Criteria**: Promo redeems successfully

### 6.6 Autosave/Sync Status

1. Complete several quests
2. **Watch the header** (top right)
3. **Expected**: Status pill shows:
   - `🟡 Saving...` (briefly)
   - `🟢 Synced` (after save completes)

**✅ Pass Criteria**: Autosave indicator works

### 6.7 Mobile Responsiveness

1. Open on **mobile device** or use Chrome DevTools (F12 → Toggle device toolbar)
2. Test:
   - Modals scroll properly
   - No horizontal overflow
   - Buttons are tappable (44px+ touch targets)
   - Text is readable

**✅ Pass Criteria**: App is usable on mobile

### 6.8 Confetti & Sounds

1. Complete enough quests to **level up**
2. **Expected**: Confetti animation + sound effect
3. Build a **3-day streak** (or modify localStorage for testing)
4. **Expected**: Streak confetti on milestone

**✅ Pass Criteria**: Animations and sounds work

### 6.9 Logout/Login Cycle

1. Click **Settings** → **Logout**
2. Log back in with Google
3. **Expected**: All your data is still there

**✅ Pass Criteria**: Data persists across sessions

---

## Phase 7: Production Monitoring & Security

### 7.1 Check Backend Logs

**Render Dashboard** → Your service → **Logs** tab

Look for:
- ✅ Successful authentication logs
- ✅ Database connection messages
- ❌ No error spam

### 7.2 Check MongoDB Atlas Metrics

**Atlas Dashboard** → Your cluster → **Metrics** tab

Monitor:
- Connection count
- Operations per second
- Storage usage

### 7.3 Set Up Alerts (Optional)

**Render:**
- Dashboard → Notifications → Enable email alerts for deploy failures

**MongoDB Atlas:**
- Alerts → Create alert for connection spikes or storage

### 7.4 Rate Limiting (Future Enhancement)

For production scale, add rate limiting:
- Render: Use Cloudflare in front
- FastAPI: Use `slowapi` or similar middleware

### 7.5 Backup Strategy

**MongoDB Atlas Backups:**
1. Clusters → Your cluster → **Backup** tab
2. Enable **Continuous Backups** (M10+ clusters) or manual snapshots

**Manual Export (M0 Free Tier):**
```bash
mongodump --uri="mongodb+srv://..." --out=./backup-$(date +%Y%m%d)
```

Run weekly and store securely.

---

## 🎉 Deployment Complete!

### Your Production URLs

- **Frontend**: `https://your-app-name.vercel.app`
- **Backend**: `https://ascend-backend-xxxx.onrender.com`
- **Health Check**: `https://ascend-backend-xxxx.onrender.com/api/health`

### Credentials Summary (Names Only)

**Backend Environment Variables:**
- `MONGO_URL` - MongoDB Atlas connection string ✅
- `DB_NAME` - `ascend_prod` ✅
- `JWT_SECRET` - Strong random string ✅
- `GOOGLE_CLIENT_ID` - Production OAuth client ID ✅
- `CORS_ORIGINS` - Your Vercel frontend URL ✅
- `ENVIRONMENT` - `production` ✅

**Frontend Environment Variables:**
- `REACT_APP_GOOGLE_CLIENT_ID` - Production OAuth client ID ✅
- `REACT_APP_BACKEND_URL` - Your Render backend URL ✅

**Google OAuth:**
- Authorized origin: Your Vercel URL ✅
- Redirect URI: `{Vercel URL}/auth/callback` ✅

**MongoDB Atlas:**
- Database: `ascend_prod` ✅
- Collections: `users`, `promo_codes` ✅
- User: `ascend_admin` ✅

---

## 🚨 Troubleshooting Common Issues

### Issue: "origin_mismatch" on Google Login

**Cause**: OAuth client URLs don't match your Vercel URL

**Fix**:
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth client
3. Ensure Authorized JavaScript origin EXACTLY matches: `https://your-app.vercel.app`
4. No trailing slash, no typos
5. Wait 5 minutes, try again

---

### Issue: Backend 503 Service Unavailable

**Cause**: Render service failed to start or crashed

**Fix**:
1. Render Dashboard → Logs
2. Look for error messages
3. Common issues:
   - Missing `requirements.txt`
   - Wrong Python version
   - Invalid MONGO_URL
4. Fix issue, redeploy

---

### Issue: "Authentication failed" on Login

**Cause**: Backend can't verify Google token

**Fix**:
1. Check Render logs for error details
2. Verify `GOOGLE_CLIENT_ID` matches production OAuth client
3. Ensure backend can reach Google APIs (check network)

---

### Issue: Data Doesn't Persist After Refresh

**Cause**: Backend not saving to MongoDB or CORS blocking

**Fix**:
1. Check browser console for CORS errors
2. Verify `CORS_ORIGINS` in Render includes your Vercel URL
3. Check MongoDB Atlas → Collections → users (should have documents)
4. Check Render logs for database errors

---

### Issue: Frontend Shows Old Code After Deploy

**Cause**: Browser cache or Vercel cache

**Fix**:
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Try incognito window
4. Vercel: Dashboard → Deployments → Force redeploy

---

### Issue: Environment Variables Not Working

**Cause**: Vercel didn't rebuild after adding env vars

**Fix**:
1. Vercel Dashboard → Settings → Environment Variables
2. Verify variables are set for **Production** environment
3. **Redeploy**: Deployments tab → ⋯ menu → Redeploy

---

## 📞 Support

If you encounter issues not covered here:

1. **Check Render Logs**: Render Dashboard → Your service → Logs
2. **Check Browser Console**: F12 → Console tab
3. **Check MongoDB Atlas Logs**: Atlas → Activity Feed
4. **Search Error Messages**: Google the exact error text
5. **Render Community**: https://community.render.com
6. **Vercel Docs**: https://vercel.com/docs

---

## 🎯 Next Steps (Post-Launch)

1. **Custom Domain**: Add your own domain in Vercel/Render
2. **Analytics**: Add Google Analytics or Plausible
3. **Error Tracking**: Add Sentry for error monitoring
4. **Performance**: Enable Vercel Analytics
5. **SEO**: Add meta tags, sitemap
6. **Privacy Policy**: Add legal pages for OAuth compliance
7. **Staging Environment**: Create separate staging deployments

---

**Congratulations on deploying Ascend to production! 🚀**
