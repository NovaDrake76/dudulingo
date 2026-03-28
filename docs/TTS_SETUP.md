# Google Cloud Text-to-Speech Setup Guide

This guide will help you set up Google Cloud Text-to-Speech (TTS) so your app can pronounce words for users.

## What We Implemented

✅ **Automatic TTS Integration:**
- When creating a new card, audio is automatically generated for the word
- When reviewing cards without audio, it's generated on-the-fly and saved
- Uses Google Cloud Neural2 voices (high quality, natural sounding)
- Supports all languages: English, Portuguese (BR), Italian, German
- Audio is stored as base64 data URLs in the database (no external hosting needed)

## Setup Steps

### 1. Create Google Cloud Project (Free Tier Available!)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing one)
3. **Free tier:** 1 million characters/month free! (≈10,000 words)

### 2. Enable Text-to-Speech API

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Cloud Text-to-Speech API"
3. Click **Enable**

### 3. Create Service Account

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service Account**
3. Name it: `dudulingo-tts` (or any name you prefer)
4. Click **Create and Continue**
5. Skip role assignment (click **Continue**, then **Done**)

### 4. Generate Service Account Key

1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key** > **Create new key**
4. Choose **JSON** format
5. Click **Create** - a JSON file will download

### 5. Configure Backend

**Option A: Local Development**

```bash
# Place the downloaded JSON file in your backend folder
cp ~/Downloads/dudulingo-tts-*.json backend/google-cloud-key.json

# Add to backend/.env
echo 'GOOGLE_APPLICATION_CREDENTIALS=./google-cloud-key.json' >> backend/.env
```

**Option B: Production (Render.com)**

1. Copy the entire contents of the JSON file
2. Go to your Render.com backend dashboard
3. Navigate to **Environment** variables
4. Add new environment variable:
   - **Key:** `GOOGLE_CLOUD_JSON_KEY`
   - **Value:** Paste the entire JSON content
5. Add another variable:
   - **Key:** `GOOGLE_APPLICATION_CREDENTIALS`
   - **Value:** `/tmp/google-cloud-key.json`
6. Add build command in Render.com (before `npm run build`):
   ```bash
   echo "$GOOGLE_CLOUD_JSON_KEY" > /tmp/google-cloud-key.json && npm install && npm run build
   ```

### 6. Test TTS

**Create a test card:**

```bash
curl -X POST https://your-backend.onrender.com/cards \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "selection_mc",
    "answer": "Hello",
    "prompt": "Olá",
    "lang": "en",
    "level": 1
  }'
```

**Check the response** - it should include an `audioUrl` field with base64 data!

## How It Works

### Supported Languages & Voices

| Language | Voice Name | Gender | Quality |
|----------|-----------|--------|---------|
| English (US) | en-US-Neural2-J | Male | High |
| Portuguese (BR) | pt-BR-Neural2-B | Male | High |
| Italian | it-IT-Neural2-C | Male | High |
| German | de-DE-Neural2-B | Male | High |

### Audio Generation Flow

1. **Card Creation:**
   - User creates a new card via `/cards` endpoint
   - Backend calls Google Cloud TTS with the word/answer
   - Audio is generated and stored as base64 data URL
   - Card is saved with `audioUrl` field populated

2. **Review Session:**
   - User starts a review session
   - If a card doesn't have `audioUrl`, it's generated on-the-fly
   - Generated audio is saved to the card for future use
   - Audio is returned in the question/feedback data

3. **Frontend Playback:**
   - `AudioButton` component appears when `audioUrl` is present
   - User clicks the speaker icon
   - Audio plays using `expo-av`

## Cost Estimates

**Free Tier:** 1 million characters/month (renews monthly)

**Example calculations:**
- Average word: 7 characters
- 1M characters = ~142,000 words
- Creating 1,000 flashcards = ~7,000 characters (way under free tier!)

**After free tier:** $4.00 per 1 million characters

For a typical user creating 100-500 cards/month, **you'll stay within the free tier**.

## Troubleshooting

### "TTS skipped: No credentials configured"

This is a **warning**, not an error. The app works fine without TTS - cards just won't have audio.

**To fix:**
- Ensure `GOOGLE_APPLICATION_CREDENTIALS` is set in `.env`
- Verify the JSON file path is correct
- Check JSON file is valid (open it, should be valid JSON)

### "Failed to generate TTS audio"

**Check:**
1. Text-to-Speech API is enabled in Google Cloud Console
2. Service account has no restrictions
3. JSON key file is not expired
4. Internet connection is working

### "Audio playback failed"

**Frontend issue:**
1. Check `expo-av` is installed: `npm list expo-av`
2. Try reinstalling: `npx expo install expo-av`
3. Check audio permissions on device

## Security Notes

⚠️ **IMPORTANT:**

1. **Never commit the JSON key file to git**
   - It's already in `.gitignore` as `google-cloud-key.json`
   - If accidentally committed, rotate the key immediately

2. **Production best practices:**
   - Use environment variables (not files) on Render.com
   - Restrict service account to only Text-to-Speech API
   - Monitor usage in Google Cloud Console

## Alternative: Skip TTS (No Audio)

If you don't want to set up Google Cloud:

1. **Don't set** `GOOGLE_APPLICATION_CREDENTIALS`
2. Cards will be created without audio
3. App works perfectly, just no pronunciation feature
4. You can add TTS later - existing cards will get audio when first reviewed

## Testing Voice Quality

You can test Google Cloud voices here:
https://cloud.google.com/text-to-speech

Try "Neural2" voices in the demo - those are what we use!

## Questions?

- **Google Cloud docs:** https://cloud.google.com/text-to-speech/docs
- **Pricing calculator:** https://cloud.google.com/text-to-speech/pricing
- **Free tier info:** https://cloud.google.com/free
