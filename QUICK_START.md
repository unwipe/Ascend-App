# Ascend - Quick Start Guide for Production Deployment

**Time to deploy: ~30-45 minutes**

---

## 🚀 TL;DR - Super Quick Overview

1. **MongoDB Atlas** → Create cluster → Get connection string
2. **Google OAuth** → Create production client → Get client ID  
3. **Render** → Deploy backend → Set env vars → Copy URL
4. **Vercel** → Deploy frontend → Set env vars → Copy URL
5. **Update** → Google OAuth URLs + Backend CORS
6. **Test** → Login with Google → Complete quest → Verify!

---

## 📦 What You Need

- [ ] MongoDB Atlas account (free)
- [ ] Google Cloud Console access
- [ ] Render account (free)
- [ ] Vercel account (free)
- [ ] Git repository with your code

---

## ⚡ Speed Run (Step-by-Step)

### 1️⃣ MongoDB (5 minutes)

```bash
# What to do:
1. Go to: https://cloud.mongodb.com
2. Create cluster (M0 Free, any region)
3. Create database user: ascend_admin + strong password
4. Network: Allow 0.0.0.0/0 (or specific IP later)
5. Get connection string, replace <password>
6. Create database: ascend_prod
7. Create collections: users, promo_codes
8. Run: python backend/seed_promos.py (with your MONGO_URL)
```

**Save:** Connection string → Will use in Render

---

### 2️⃣ Google OAuth (3 minutes)

```bash
# What to do:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client (Web app)
3. Name: Ascend Production
4. Origins: https://placeholder.com (update later)
5. Redirect: https://placeholder.com/auth/callback (update later)
6. Copy Client ID (looks like: 123-abc.apps.googleusercontent.com)
```

**Save:** Client ID → Will use in Render & Vercel

---

### 3️⃣ Generate JWT Secret (30 seconds)

```bash
# Run this command:
openssl rand -hex 32

# Or:
python -c "import secrets; print(secrets.token_hex(32))"

# Copy the output (64 character string)
```

**Save:** JWT Secret → Will use in Render

---

### 4️⃣ Deploy Backend to Render (10 minutes)

```bash
# What to do:
1. Go to: https://dashboard.render.com
2. New → Web Service
3. Connect your Git repo
4. Configure:
   - Name: ascend-backend
   - Region: Oregon (Free)
   - Branch: main
   - Root: backend
   - Build: pip install -r requirements.txt
   - Start: uvicorn server:app --host 0.0.0.0 --port 8000
   - Plan: Free

5. Environment Variables (critical!):
   MONGO_URL = (your MongoDB connection string)
   DB_NAME = ascend_prod
   JWT_SECRET = (your generated secret)
   JWT_ALGORITHM = HS256
   JWT_EXPIRATION_MINUTES = 43200
   GOOGLE_CLIENT_ID = (your OAuth Client ID)
   CORS_ORIGINS = https://placeholder.vercel.app
   ENVIRONMENT = production

6. Deploy → Wait 5-10 minutes
7. Copy your Render URL (e.g., https://ascend-backend-abc.onrender.com)
```

**Test:** Open `https://YOUR_BACKEND_URL/api/health` → Should see `"ok": true`

---

### 5️⃣ Deploy Frontend to Vercel (5 minutes)

```bash
# What to do:
1. Go to: https://vercel.com/dashboard
2. New Project → Import Git repo
3. Configure:
   - Framework: Create React App
   - Root: frontend
   - Build: (leave default)
   - Output: (leave default)

4. Environment Variables:
   REACT_APP_GOOGLE_CLIENT_ID = (your OAuth Client ID - same as backend)
   REACT_APP_BACKEND_URL = (your Render backend URL)
   
   ⚠️ Set for: Production environment
   ⚠️ Must start with REACT_APP_

5. Deploy → Wait 2-5 minutes
6. Copy your Vercel URL (e.g., https://your-app.vercel.app)
```

**Test:** Open your Vercel URL → Should see Ascend welcome screen

---

### 6️⃣ Update Google OAuth (2 minutes)

```bash
# What to do:
1. Go back to: https://console.cloud.google.com/apis/credentials
2. Click your "Ascend Production" OAuth client
3. Update Authorized JavaScript origins:
   - Remove placeholder
   - Add: https://your-actual-app.vercel.app
4. Update Authorized redirect URIs:
   - Remove placeholder
   - Add: https://your-actual-app.vercel.app/auth/callback
5. Save
6. Wait 2-5 minutes
```

---

### 7️⃣ Update Backend CORS (2 minutes)

```bash
# What to do:
1. Go to Render dashboard → Your backend service
2. Environment tab
3. Edit CORS_ORIGINS:
   - Change from placeholder
   - To: https://your-actual-app.vercel.app
4. Save → Auto-redeploys
```

---

### 8️⃣ Test Everything (5 minutes)

```bash
# Manual tests:
1. Open: https://your-app.vercel.app (incognito)
2. Click "Continue with Google"
3. Login should succeed
4. Add a Daily Quest
5. Complete it → XP increases
6. Refresh page → Quest still there
7. Check MongoDB Atlas → User document exists

# Automated test:
./smoke-test.sh
```

**If all tests pass → YOU'RE LIVE! 🎉**

---

## 🆘 Emergency Troubleshooting

### "origin_mismatch" error
→ Google OAuth URLs don't match Vercel URL exactly (no typos, no trailing slash)

### Backend 503 error
→ Check Render logs, usually missing env var or wrong MONGO_URL

### Frontend shows blank page
→ Check browser console, usually wrong REACT_APP_BACKEND_URL

### Data doesn't persist
→ CORS error, check backend logs and CORS_ORIGINS setting

---

## 📚 Full Documentation

For detailed instructions, see:
- **DEPLOYMENT_GUIDE.md** - Complete step-by-step guide
- **DEPLOYMENT_CHECKLIST.md** - Track your progress
- **Backend .env.production.example** - Environment variable reference
- **Frontend .env.production.example** - Environment variable reference

---

## ✅ Success Criteria

You know it's working when:
- ✅ `/api/health` returns `"ok": true`
- ✅ Google login succeeds (no errors)
- ✅ Completing quest increases XP
- ✅ Refresh page → data persists
- ✅ MongoDB Atlas shows user document

---

## 🎯 Your Production URLs

**Frontend (share this):** `https://_______________.vercel.app`

**Backend (keep private):** `https://_______________.onrender.com`

**Health Check:** `https://_______________.onrender.com/api/health`

---

**Questions?** Check DEPLOYMENT_GUIDE.md for detailed help!

**Ready to launch? LET'S GO! 🚀**
