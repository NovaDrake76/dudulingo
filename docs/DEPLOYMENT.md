# Dudulingo Deployment Guide

This guide covers deploying Dudulingo to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Google OAuth Setup](#google-oauth-setup)
4. [Backend Deployment (Render.com)](#backend-deployment)
5. [Frontend Deployment (EAS Build)](#frontend-deployment)
6. [GitHub Secrets Configuration](#github-secrets)
7. [Monitoring Setup (Optional)](#monitoring-setup)
8. [Verification](#verification)
9. [Troubleshooting](#troubleshooting)
10. [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] GitHub account
- [ ] MongoDB Atlas account (free tier available)
- [ ] Google Cloud Console project
- [ ] Render.com account (free tier available)
- [ ] Expo account (for EAS builds)
- [ ] Node.js 20+ and npm installed locally

---

## MongoDB Atlas Setup

### 1. Create a Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Click "Build a Database"
4. Select **M0 FREE** tier
5. Choose a cloud provider and region (AWS, us-east-1 recommended)
6. Cluster name: `dudulingo-production`
7. Click "Create"

### 2. Configure Network Access

1. Navigate to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (0.0.0.0/0)
   - **Note**: For better security, add only Render's IP ranges later
4. Click "Confirm"

### 3. Create Database User

1. Navigate to "Database Access"
2. Click "Add New Database User"
3. Authentication Method: Password
4. Username: `dudulingo-app`
5. Password: Generate a strong password (save it securely!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### 4. Get Connection String

1. Go to "Database" → Click "Connect"
2. Select "Connect your application"
3. Driver: Node.js, Version: 5.5 or later
4. Copy the connection string:
   ```
   mongodb+srv://dudulingo-app:<password>@dudulingo-production.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=dudulingo-production
   ```
5. Replace `<password>` with your actual password
6. Add database name: `/dudulingo` before the `?`
   ```
   mongodb+srv://dudulingo-app:PASSWORD@cluster.mongodb.net/dudulingo?retryWrites=true&w=majority
   ```

---

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "Dudulingo"
3. Select the project

### 2. Configure OAuth Consent Screen

1. Navigate to "APIs & Services" → "OAuth consent screen"
2. User Type: **External**
3. Fill in:
   - App name: `Dudulingo`
   - User support email: Your email
   - Developer contact: Your email
4. Scopes: Add `email` and `profile`
5. Test users: Add your email
6. Save and continue

### 3. Create OAuth Credentials

1. Navigate to "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS" → "OAuth client ID"
3. Application type: **Web application**
4. Name: `Dudulingo Backend`
5. Authorized redirect URIs:
   ```
   https://your-backend-url.onrender.com/auth/google/callback
   http://localhost:8000/auth/google/callback
   ```
6. Click "Create"
7. **Save the Client ID and Client Secret** - you'll need these!

---

## Backend Deployment

### Using Render.com (Recommended)

#### 1. Connect Repository

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub account
4. Select the `dudulingo` repository

#### 2. Configure Service

- **Name**: `dudulingo-backend`
- **Region**: Oregon (US West) or closest to you
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: Free (or Starter for no cold starts - $7/month)

#### 3. Environment Variables

Click "Advanced" → Add the following environment variables:

```env
DATABASE_URL=mongodb+srv://dudulingo-app:PASSWORD@cluster.mongodb.net/dudulingo?retryWrites=true&w=majority
JWT_SECRET=<generate-with-command-below>
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
PORT=8000
BASE_URL=https://your-backend-url.onrender.com
API_URL=https://your-backend-url.onrender.com
IS_DEV=false
NODE_ENV=production
LOG_LEVEL=info
ALLOWED_ORIGINS=exp://localhost:8081,http://localhost:19000
```

**Generate JWT_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 4. Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy
3. Wait for deployment to complete (5-10 minutes)
4. Note your service URL: `https://dudulingo-backend.onrender.com`

#### 5. Verify Deployment

Test the health endpoint:
```bash
curl https://your-backend-url.onrender.com/health
```

Expected response:
```json
{"status":"ok"}
```

---

## Frontend Deployment

### Using Expo Application Services (EAS)

#### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

#### 2. Login to Expo

```bash
eas login
```

#### 3. Configure EAS

In `frontend/.env`:
```env
EXPO_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

#### 4. Build for Android (Preview)

```bash
cd frontend
eas build --platform android --profile preview
```

This creates an APK you can install on Android devices for testing.

#### 5. Build for Production (App Stores)

**For Play Store:**
```bash
eas build --platform android --profile production
eas submit --platform android --latest
```

**For App Store:**
```bash
eas build --platform ios --profile production
eas submit --platform ios --latest
```

**Note**: App store submission requires:
- Developer accounts ($99/year for Apple, $25 one-time for Google)
- App store assets (icons, screenshots, descriptions)
- Privacy policy URL
- Review process (3-7 days)

---

## GitHub Secrets

Configure these secrets in your GitHub repository for CI/CD:

1. Go to repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"

Add the following secrets:

| Secret Name | Value | Purpose |
|------------|-------|---------|
| `RENDER_DEPLOY_HOOK` | `https://api.render.com/deploy/...` | Auto-deploy backend on push |
| `EXPO_TOKEN` | (from `eas whoami`) | EAS builds in CI |

**Get Render Deploy Hook:**
1. Render Dashboard → Your service → Settings
2. Scroll to "Deploy Hook"
3. Copy the URL

---

## Monitoring Setup (Optional)

### Sentry for Error Tracking

#### 1. Create Sentry Project

1. Go to [sentry.io](https://sentry.io)
2. Create account (free tier: 5K errors/month)
3. Create new project:
   - Platform: Node.js (for backend)
   - Platform: React Native (for frontend)
4. Copy the DSN

#### 2. Add to Environment Variables

**Backend (Render):**
```env
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

**Frontend (.env):**
```env
EXPO_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

#### 3. Test Error Tracking

```bash
# Backend test
curl https://your-backend-url.onrender.com/trigger-error

# Check Sentry dashboard for error
```

---

## Verification

### Backend Health Checks

```bash
# Basic health
curl https://your-backend-url.onrender.com/health

# Detailed health with metrics
curl https://your-backend-url.onrender.com/health/detailed

# Database connectivity
curl https://your-backend-url.onrender.com/health/ready
```

### End-to-End Test

1. Install the frontend APK on your Android device
2. Sign in with Google
3. Select a language
4. Create a deck
5. Add a card
6. Start a review session
7. Complete a review

### Monitor Logs

**Render Logs:**
1. Render Dashboard → Your service → Logs
2. Look for:
   - "Server is running on port: 8000"
   - "Database connection successful"
   - No error messages

---

## Troubleshooting

### Backend Won't Start

**Issue**: Service crashes on startup

**Solutions**:
1. Check environment variables are set correctly
2. Verify DATABASE_URL connection string
3. Check logs for specific error messages
4. Ensure JWT_SECRET is at least 32 characters

### Database Connection Failed

**Issue**: "MongooseServerSelectionError"

**Solutions**:
1. Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
2. Check database user credentials
3. Ensure connection string format is correct
4. Test connection locally with same credentials

### Google OAuth Fails

**Issue**: "Redirect URI mismatch"

**Solutions**:
1. Add exact redirect URI to Google Console:
   - `https://your-backend-url.onrender.com/auth/google/callback`
2. Wait 5 minutes for changes to propagate
3. Clear browser cookies and try again

### CORS Errors in Frontend

**Issue**: "Access-Control-Allow-Origin" error

**Solutions**:
1. Add frontend URL to `ALLOWED_ORIGINS` environment variable
2. For local development: `exp://localhost:8081`
3. Restart backend service after changing env vars

### Rate Limiting Issues

**Issue**: "Too many requests" error

**Solutions**:
1. Set `IS_DEV=true` temporarily to disable rate limiting
2. Adjust limits in `backend/api/middleware/rateLimiter.ts`
3. Whitelist specific IPs if needed

---

## Rollback Procedures

### Render Automatic Rollback

1. Render Dashboard → Your service → Events
2. Find the last successful deployment
3. Click "Rollback" next to that deployment

### Manual Rollback

```bash
# Locally
git revert <commit-hash>
git push origin main

# Render will auto-deploy the reverted version
```

### Database Rollback

**Warning**: No automatic database rollbacks!

**Prevention**:
- Always test migrations locally first
- Create database backups before major changes
- Use MongoDB Atlas scheduled backups

**Recovery**:
1. MongoDB Atlas → Clusters → Your cluster
2. Backup tab → Download snapshot
3. Restore to a specific point in time

---

## Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Database indexed (users.email, decks.ownerId, cards.deckId)
- [ ] Health checks returning 200 OK
- [ ] Google OAuth working with production URL
- [ ] CORS configured for production domains
- [ ] Rate limiting enabled (IS_DEV=false)
- [ ] Logging level set to 'info' or 'warn'
- [ ] Sentry error tracking configured
- [ ] GitHub Actions CI/CD passing
- [ ] End-to-end test completed successfully
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] App store assets prepared (if submitting to stores)

---

## Cost Estimate

### Free Tier (MVP/Testing)

- MongoDB Atlas M0: **$0/month**
- Render.com Free: **$0/month** (with cold starts)
- Sentry Free: **$0/month** (5K errors)
- GitHub Actions: **$0/month** (2000 minutes)
- EAS Builds: **Limited free builds**

**Total: $0/month** (with limitations)

### Recommended Paid Tier (Production)

- MongoDB Atlas M2: **$9/month** (2GB + backups)
- Render.com Starter: **$7/month** (no cold starts)
- Sentry Team: **$26/month** (50K errors)

**Total: ~$42/month**

### App Store Costs

- Apple Developer: **$99/year**
- Google Play: **$25 one-time**

---

## Support

- **Backend Issues**: Check Render logs
- **Database Issues**: MongoDB Atlas metrics
- **Frontend Issues**: Expo logs (`npx expo start`)
- **CI/CD Issues**: GitHub Actions logs

For community support, create an issue in the GitHub repository.
