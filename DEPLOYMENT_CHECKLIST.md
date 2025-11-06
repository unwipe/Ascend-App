# Ascend Production Deployment Checklist

Use this checklist to track your deployment progress.

---

## ☁️ MongoDB Atlas Setup

- [ ] Created MongoDB Atlas account
- [ ] Created production cluster (M0 Free Tier)
- [ ] Created database user (`ascend_admin`)
- [ ] Saved strong password securely
- [ ] Configured network access (0.0.0.0/0 or specific IP)
- [ ] Obtained connection string
- [ ] Replaced `<password>` in connection string
- [ ] Created database: `ascend_prod`
- [ ] Created collection: `users`
- [ ] Created collection: `promo_codes`
- [ ] Ran `seed_promos.py` to populate promo codes
- [ ] Verified 4 promo codes in Atlas dashboard

**MongoDB URL (save securely):**
```
mongodb+srv://ascend_admin:YOUR_PASSWORD@cluster.mongodb.net/?retryWrites=true&w=majority
```

---

## 🔐 Google OAuth Setup

- [ ] Logged into Google Cloud Console
- [ ] Created new OAuth 2.0 Client ID (Web application)
- [ ] Named it "Ascend Production"
- [ ] Copied Client ID (starts with numbers-xxx.apps.googleusercontent.com)
- [ ] Saved Client ID as `GOOGLE_CLIENT_ID_PROD`
- [ ] Enabled Google+ API
- [ ] Enabled Google People API (optional)
- [ ] **Note**: Will update OAuth URLs after getting Vercel URL

**Google OAuth Client ID (save securely):**
```
YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
```

---

## 🖥️ Backend Deployment (Render)

### Preparation
- [ ] Code committed and pushed to Git repository
- [ ] Generated strong JWT_SECRET (64 characters)

**JWT Secret (save securely):**
```
YOUR_64_CHAR_RANDOM_STRING_HERE
```

### Render Setup
- [ ] Logged into Render dashboard
- [ ] Created new Web Service
- [ ] Connected Git repository
- [ ] Set service name: `ascend-backend` (or custom)
- [ ] Selected region: Oregon (Free)
- [ ] Set branch: `main`
- [ ] Set root directory: `backend`
- [ ] Set runtime: Python 3
- [ ] Set build command: `pip install -r requirements.txt`
- [ ] Set start command: `uvicorn server:app --host 0.0.0.0 --port 8000`
- [ ] Selected plan: Free

### Environment Variables
Set these in Render dashboard → Environment tab:

- [ ] `MONGO_URL` = Your Atlas connection string
- [ ] `DB_NAME` = `ascend_prod`
- [ ] `JWT_SECRET` = Your generated secret
- [ ] `JWT_ALGORITHM` = `HS256`
- [ ] `JWT_EXPIRATION_MINUTES` = `43200`
- [ ] `GOOGLE_CLIENT_ID` = Your production OAuth Client ID
- [ ] `CORS_ORIGINS` = `https://your-app.vercel.app` (placeholder, update after frontend)
- [ ] `ENVIRONMENT` = `production`

### Deployment
- [ ] Clicked "Create Web Service"
- [ ] Waited for build to complete (5-10 min)
- [ ] Deployment succeeded
- [ ] Copied Render backend URL

**Render Backend URL (save):**
```
https://ascend-backend-xxxx.onrender.com
```

### Health Check
- [ ] Tested: `https://YOUR_BACKEND_URL/api/health`
- [ ] Response shows: `"ok": true, "status": "healthy"`

---

## 🌐 Frontend Deployment (Vercel)

### Vercel Setup
- [ ] Logged into Vercel dashboard
- [ ] Clicked "Add New Project"
- [ ] Imported Git repository
- [ ] Selected repository
- [ ] Set framework preset: Create React App
- [ ] Set root directory: `frontend`
- [ ] Left build/output commands as default

### Environment Variables
Set these in Vercel project → Settings → Environment Variables:

- [ ] `REACT_APP_GOOGLE_CLIENT_ID` = Your production OAuth Client ID
- [ ] `REACT_APP_BACKEND_URL` = Your Render backend URL (from above)
- [ ] Set both variables for: **Production** environment

### Deployment
- [ ] Clicked "Deploy"
- [ ] Waited for build (2-5 min)
- [ ] Deployment succeeded
- [ ] Copied Vercel frontend URL

**Vercel Frontend URL (save):**
```
https://your-app-name.vercel.app
```

### Verification
- [ ] Opened Vercel URL in browser
- [ ] Ascend welcome screen loads
- [ ] No console errors (F12)

---

## 🔄 Update Google OAuth URLs

Now that you have your actual Vercel URL:

- [ ] Went back to Google Cloud Console → Credentials
- [ ] Clicked on "Ascend Production" OAuth client
- [ ] Updated Authorized JavaScript origins:
  - Added: `https://your-actual-app.vercel.app`
- [ ] Updated Authorized redirect URIs:
  - Added: `https://your-actual-app.vercel.app/auth/callback`
- [ ] Clicked "Save"
- [ ] Waited 5 minutes for propagation

---

## 🔄 Update Backend CORS

- [ ] Went back to Render dashboard
- [ ] Navigated to your backend service
- [ ] Clicked Environment tab
- [ ] Updated `CORS_ORIGINS` to your actual Vercel URL
- [ ] Saved changes
- [ ] Service auto-redeployed

---

## ✅ Smoke Tests

### Test 1: Authentication
- [ ] Opened Vercel URL in **incognito window**
- [ ] Clicked "Continue with Google"
- [ ] Selected Google account
- [ ] Login succeeded (no errors)
- [ ] Dashboard loads with welcome message

### Test 2: Data Creation
- [ ] Added a Daily Quest: "Test Quest"
- [ ] Completed the quest (checked it off)
- [ ] XP increased
- [ ] Coins increased
- [ ] Checked MongoDB Atlas → users collection → my user document exists

### Test 3: Data Persistence
- [ ] Refreshed the page (F5)
- [ ] Quest is still there
- [ ] XP/coins values persisted
- [ ] No data loss

### Test 4: Today's Progress Card
- [ ] Added another Daily Quest
- [ ] Completed it
- [ ] "Today's Progress" card updated **instantly**
- [ ] Shows correct XP gained
- [ ] Shows correct quests completed
- [ ] No delay, no manual refresh needed

### Test 5: Store Purchase
- [ ] Clicked "Store" button
- [ ] Purchased XP Multiplier (20 coins)
- [ ] Coins decreased immediately
- [ ] Item appeared in Profile → Inventory
- [ ] Today's Progress shows coins spent

### Test 6: Promo Code
- [ ] Clicked Store → "Redeem Code"
- [ ] Entered: `WELCOME100`
- [ ] Success toast appeared
- [ ] XP increased by 100
- [ ] Today's Progress card updated

### Test 7: Autosave Indicator
- [ ] Completed several quests
- [ ] Watched header (top right)
- [ ] Status pill showed: `🟡 Saving...`
- [ ] Then changed to: `🟢 Synced`

### Test 8: Mobile Responsiveness
- [ ] Opened on mobile device (or Chrome DevTools)
- [ ] App layout looks good
- [ ] Modals scroll properly
- [ ] Buttons are tappable
- [ ] No horizontal overflow

### Test 9: Confetti & Sounds
- [ ] Completed enough quests to level up
- [ ] Confetti animation appeared
- [ ] Sound effect played
- [ ] Streak milestone triggered confetti (if applicable)

### Test 10: Logout/Login
- [ ] Clicked Settings → Logout
- [ ] Logged back in with Google
- [ ] All data persisted
- [ ] No data loss

---

## 🎉 Production Checklist Complete!

If all tests passed, your Ascend app is **LIVE IN PRODUCTION**! 🚀

---

## 📝 Final Information

**Save these URLs permanently:**

- **Frontend (Public)**: `https://_____________________.vercel.app`
- **Backend (API)**: `https://_____________________.onrender.com`
- **Health Check**: `https://_____________________.onrender.com/api/health`
- **MongoDB Database**: `ascend_prod` on MongoDB Atlas

**Credentials Summary:**
- MongoDB user: `ascend_admin`
- JWT Secret: Securely saved ✅
- Google OAuth Client ID: Securely saved ✅
- All environment variables configured ✅

---

## 🔜 Next Steps (Optional)

- [ ] Add custom domain to Vercel
- [ ] Add custom domain to Render
- [ ] Set up monitoring/alerts
- [ ] Add error tracking (Sentry)
- [ ] Add analytics (Google Analytics)
- [ ] Create staging environment
- [ ] Add Privacy Policy page
- [ ] Add Terms of Service page
- [ ] Announce beta launch! 🎊

---

**Date Completed**: _______________

**Deployed By**: _______________

**Notes**:
```
(Add any deployment notes, issues encountered, or customizations here)
```
