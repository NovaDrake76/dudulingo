# 🚀 Quick Start Guide - Use Dudulingo on Your Phone

## 📱 Part 1: Install App on Your Phone (5 minutes)

Your backend is already online at `https://dudulingo-api.onrender.com`, so you just need to build the app!

### Step 1: Build the App

```bash
cd "E:\codes 2\boas-praticas\dudulingo\frontend"

# For Android (APK)
npx eas build --profile preview --platform android

# For iOS (if you have an iPhone)
npx eas build --profile preview --platform ios
```

**What happens:**
- EAS builds your app in the cloud (~10-15 minutes)
- You'll get a download link when done
- The app will connect to your production backend

### Step 2: Install on Your Phone

**Android:**
1. Open the download link on your phone
2. Download the APK
3. Allow installation from unknown sources (if prompted)
4. Install and open!

**iOS:**
1. Open the download link on your phone
2. Follow Apple's TestFlight installation
3. Open the app!

### Step 3: Test It!

1. Sign in with your Google account
2. Select a language to learn
3. Pick a deck
4. Start learning!

**✅ The app now works anywhere - no computer needed!**

---

## 🔊 Part 2: Enable Voice Pronunciation (Optional, 10 minutes)

We just implemented **Google Cloud Text-to-Speech** so users can hear how to pronounce words!

### Current Status: ❌ Not Working Yet

**Why:** You need to set up Google Cloud credentials for TTS

**Without TTS:**
- ✅ App works perfectly
- ❌ No audio/pronunciation button
- ❌ Users can't hear how to pronounce words

**With TTS:**
- ✅ Every card gets automatic pronunciation
- ✅ High-quality Neural2 voices
- ✅ Supports all 4 languages
- 💵 **FREE** (1 million characters/month)

### How to Enable TTS

**Quick Setup (5 steps):**

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
   - Create new project or use existing

2. **Enable Text-to-Speech API**
   - Go to APIs & Services > Library
   - Search "Cloud Text-to-Speech API"
   - Click Enable

3. **Create Service Account**
   - Go to APIs & Services > Credentials
   - Create Credentials > Service Account
   - Name: `dudulingo-tts`
   - Skip roles, click Done

4. **Download JSON Key**
   - Click on the service account
   - Keys tab > Add Key > Create new key
   - Choose JSON format
   - File downloads automatically

5. **Add to Render.com** (Production)
   - Go to your backend dashboard on Render.com
   - Environment tab
   - Add variable:
     - **Name:** `GOOGLE_CLOUD_JSON_KEY`
     - **Value:** Paste entire JSON file content
   - Add variable:
     - **Name:** `GOOGLE_APPLICATION_CREDENTIALS`
     - **Value:** `/tmp/google-cloud-key.json`
   - Update build command to:
     ```bash
     echo "$GOOGLE_CLOUD_JSON_KEY" > /tmp/google-cloud-key.json && npm install && npm run build
     ```
   - Click "Manual Deploy" > "Clear build cache & deploy"

**Done!** New cards will automatically have pronunciation.

### Detailed Instructions

See: [`docs/TTS_SETUP.md`](./docs/TTS_SETUP.md) for:
- Step-by-step screenshots
- Local development setup
- Troubleshooting
- Cost estimates
- Testing guide

---

## 🎯 What You Have Now

✅ **Production-Ready Backend**
- Deployed on Render.com
- MongoDB Atlas database
- Google OAuth authentication
- Rate limiting & security
- Health monitoring

✅ **Mobile App (After Build)**
- Works on Android/iOS
- Connects to production backend
- Works anywhere with internet
- Installable on phone

⏳ **Voice Pronunciation (After TTS Setup)**
- Auto-generated for all words
- Neural2 high-quality voices
- 4 languages supported
- Free tier: 142k words/month

---

## 📋 Next Steps

**Immediate (to use app):**
1. Run `npx eas build --profile preview --platform android`
2. Wait ~15 minutes for build
3. Download and install APK
4. Start learning!

**Optional (for voice):**
1. Set up Google Cloud TTS (10 min)
2. Add credentials to Render.com
3. Redeploy backend
4. New cards get automatic pronunciation!

**Future (App Store release):**
1. Complete TTS setup
2. Create app store assets (icons, screenshots)
3. Run `npx eas build --profile production`
4. Submit to Google Play / Apple App Store
5. (See `docs/DEPLOYMENT.md` for full guide)

---

## 🆘 Troubleshooting

### Build Failed

```bash
# Make sure you're logged in to EAS
npx eas login

# Check EAS project
npx eas whoami
```

### App Crashes on Phone

- Check backend is online: https://dudulingo-api.onrender.com/health
- Check `.env` has correct API URL: `EXPO_PUBLIC_API_URL=https://dudulingo-api.onrender.com`

### No Audio Button Showing

- This is expected if you haven't set up TTS yet
- Cards need `audioUrl` field (only generated with TTS enabled)
- Follow Part 2 to enable TTS

### Google OAuth Not Working

- Add your phone's browser to allowed redirect URIs in Google Cloud Console
- Should include: `exp://localhost`, `dudulingo://`, etc.

---

## 🎉 You're Ready!

**Current status:**
- ✅ Backend is live and secure
- ✅ All production features implemented
- ⏳ Mobile app building (15 min)
- ⏳ TTS setup (optional, 10 min)

**Your app is production-ready!** 🚀
