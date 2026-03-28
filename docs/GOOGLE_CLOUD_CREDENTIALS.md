# 🔑 Getting Google Cloud TTS Credentials - Step by Step

This guide shows you **exactly where to click** to get your credentials.

---

## 📋 What You Need

By the end, you'll have:
1. ✅ A JSON file with credentials (looks like `dudulingo-tts-xxxxx.json`)
2. ✅ This file path in your `.env` file

---

## 🚀 Step-by-Step Instructions

### Step 1: Create Google Cloud Project (2 minutes)

1. **Go to:** https://console.cloud.google.com/
2. **Log in** with your Google account
3. **Click** the project dropdown (top left, next to "Google Cloud")
4. **Click** "NEW PROJECT"
5. **Enter:**
   - Project name: `Dudulingo` (or anything you want)
   - Location: Leave as "No organization"
6. **Click** "CREATE"
7. **Wait** ~10 seconds for it to create
8. **Select** your new project from the dropdown

---

### Step 2: Enable Text-to-Speech API (1 minute)

1. **Click** the hamburger menu (☰ top left)
2. **Navigate:** APIs & Services → **Library**
   - Or go directly to: https://console.cloud.google.com/apis/library
3. **Search:** "text to speech" (in the search box)
4. **Click** "Cloud Text-to-Speech API" (should be first result)
5. **Click** the blue "ENABLE" button
6. **Wait** ~5 seconds (page will refresh when enabled)

---

### Step 3: Create Service Account (2 minutes)

1. **Click** hamburger menu (☰)
2. **Navigate:** APIs & Services → **Credentials**
   - Or go to: https://console.cloud.google.com/apis/credentials
3. **Click** "CREATE CREDENTIALS" (blue button at top)
4. **Select** "Service account" from dropdown
5. **Fill in:**
   - Service account name: `dudulingo-tts`
   - Service account ID: Auto-fills (leave it)
   - Description: "TTS for Dudulingo app" (optional)
6. **Click** "CREATE AND CONTINUE"
7. **Skip** the optional steps:
   - Step 2 (Grant access): Click "CONTINUE"
   - Step 3 (Grant users access): Click "DONE"

---

### Step 4: Download JSON Key (1 minute) ⭐ **THIS IS THE IMPORTANT PART**

1. You're now on the **Credentials** page
2. **Scroll down** to "Service Accounts" section
3. **Find** the `dudulingo-tts@...` service account you just created
4. **Click** on the email (the whole row is clickable)
5. **Click** the "KEYS" tab (at the top)
6. **Click** "ADD KEY" dropdown button
7. **Select** "Create new key"
8. **Choose** "JSON" format (should be selected by default)
9. **Click** "CREATE"
10. **A file downloads automatically** - this is your credential file!
    - Name will be like: `dudulingo-tts-xxxxxxxxxxxxx.json`
    - **IMPORTANT:** Keep this file safe! It's like a password.

---

## 📁 What to Do with the JSON File

### For Local Development:

```bash
# 1. Move the file to your backend folder
mv ~/Downloads/dudulingo-tts-*.json "E:\codes 2\boas-praticas\dudulingo\backend\google-cloud-key.json"

# 2. Add to backend/.env file
echo 'GOOGLE_APPLICATION_CREDENTIALS=./google-cloud-key.json' >> "E:\codes 2\boas-praticas\dudulingo\backend\.env"
```

**Or manually:**
1. Move the downloaded file to: `E:\codes 2\boas-praticas\dudulingo\backend\`
2. Rename it to: `google-cloud-key.json`
3. Open `backend/.env` and add:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./google-cloud-key.json
   ```

### For Production (Render.com):

1. **Open the JSON file** in a text editor (Notepad, VS Code, etc.)
2. **Copy the entire contents** (it's one big JSON object)
3. **Go to Render.com** → Your backend service
4. **Click** "Environment" in left sidebar
5. **Click** "Add Environment Variable"
6. **Add first variable:**
   - Key: `GOOGLE_CLOUD_JSON_KEY`
   - Value: **Paste the entire JSON contents**
7. **Add second variable:**
   - Key: `GOOGLE_APPLICATION_CREDENTIALS`
   - Value: `/tmp/google-cloud-key.json`
8. **Update "Build Command"** (in Settings tab):
   ```bash
   echo "$GOOGLE_CLOUD_JSON_KEY" > /tmp/google-cloud-key.json && npm install && npm run build
   ```
9. **Click** "Manual Deploy" → "Clear build cache & deploy"

---

## 🧪 Test It Works

### Test Locally:

```bash
cd "E:\codes 2\boas-praticas\dudulingo\backend"
npm run audio:backfill
```

**Expected output:**
```
Connected to database
Found X cards without audio
Generating audio for Y unique words...
Progress: 10/Y words generated
...
✅ Backfill complete!
```

**If it fails:**
- Check the JSON file path is correct
- Make sure the file is valid JSON (open it, should be formatted)
- Ensure TTS API is enabled in Google Cloud Console

### Test in Production:

Create a test card and check for `audioUrl`:

```bash
curl https://dudulingo-api.onrender.com/cards \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "selection_mc",
    "answer": "Hello",
    "prompt": "Olá",
    "lang": "en"
  }'
```

**Check response** - should have `"audioUrl": "data:audio/mp3;base64,..."` ✅

---

## ❓ FAQ

### Where exactly is the JSON file downloaded?

- **Windows:** `C:\Users\YourName\Downloads\`
- **Mac:** `/Users/YourName/Downloads/`
- **Linux:** `~/Downloads/`

Look for: `dudulingo-tts-` followed by numbers/letters and `.json`

### What does the JSON file look like inside?

```json
{
  "type": "service_account",
  "project_id": "dudulingo-xxxxx",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "dudulingo-tts@dudulingo-xxxxx.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

If it looks like this, it's correct! ✅

### Can I delete the JSON file after adding to Render?

**Local:** NO - Your backend needs it on every startup

**Render.com:** YES - Once it's in environment variables, you can delete the local file (but keep a backup somewhere safe)

### What if I lose the JSON file?

1. Go back to Google Cloud Console
2. Go to Credentials → Service Accounts
3. Click on your service account
4. Go to Keys tab
5. **Delete the old key** (for security)
6. Create a new key (repeat Step 4)

**Important:** Only create keys you need. Each key is a security risk if leaked.

---

## 🔒 Security Notes

⚠️ **NEVER:**
- Commit the JSON file to git (it's in `.gitignore`, but double-check)
- Share the JSON file publicly
- Email the JSON file
- Put it in frontend code

✅ **DO:**
- Keep it in backend folder only
- Use environment variables in production
- Rotate keys if you suspect they're compromised
- Delete unused service account keys

---

## 🎉 You're Done!

Once you have:
- ✅ JSON file downloaded
- ✅ Moved to `backend/google-cloud-key.json`
- ✅ Added to `.env`

Your app will automatically generate voice for every new card! 🔊

---

## 🆘 Still Stuck?

**Check:**
1. Is TTS API enabled? → https://console.cloud.google.com/apis/library/texttospeech.googleapis.com
2. Do you have a service account? → https://console.cloud.google.com/iam-admin/serviceaccounts
3. Is the JSON file valid? → Open it in VS Code, should be formatted JSON
4. Is the path correct in `.env`? → Use forward slashes `/` or `./`

**Common errors:**
- "Could not load credentials" → Wrong file path in `.env`
- "API not enabled" → Go back to Step 2
- "Permission denied" → Service account deleted, recreate it
