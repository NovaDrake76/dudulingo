import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import type { google } from '@google-cloud/text-to-speech/build/protos/protos';
import logger from '../logger.ts';

// Language code to voice mapping (Google Cloud TTS voice names)
const VOICE_MAP: Record<string, { languageCode: string; name: string }> = {
  en: { languageCode: 'en-US', name: 'en-US-Neural2-J' }, // Male voice
  'pt-BR': { languageCode: 'pt-BR', name: 'pt-BR-Neural2-B' }, // Male voice
  it: { languageCode: 'it-IT', name: 'it-IT-Neural2-C' }, // Male voice
  de: { languageCode: 'de-DE', name: 'de-DE-Neural2-B' }, // Male voice
};

let ttsClient: TextToSpeechClient | null = null;

/**
 * Initialize Google Cloud TTS client
 * Requires GOOGLE_APPLICATION_CREDENTIALS environment variable
 */
function getClient(): TextToSpeechClient {
  if (!ttsClient) {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && process.env.NODE_ENV === 'production') {
      logger.warn('Google Cloud TTS credentials not found. TTS will be disabled.');
    }
    ttsClient = new TextToSpeechClient();
  }
  return ttsClient;
}

/**
 * Generate audio URL for a given text using Google Cloud TTS
 * Returns base64-encoded MP3 data URL
 */
export async function generateSpeechUrl(
  text: string,
  languageCode: string = 'en'
): Promise<string | null> {
  try {
    // Skip TTS in development if credentials not set
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      logger.debug('TTS skipped: No credentials configured');
      return null;
    }

    const voice = VOICE_MAP[languageCode] || VOICE_MAP['en'];
    const client = getClient();

    const request: google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
      input: { text },
      voice: {
        languageCode: voice.languageCode,
        name: voice.name,
        ssmlGender: 'MALE',
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.9, // Slightly slower for learning
        pitch: 0,
      },
    };

    const [response] = await client.synthesizeSpeech(request);

    if (!response.audioContent) {
      logger.error('TTS response missing audio content');
      return null;
    }

    // Convert audio content to base64 data URL
    const audioBase64 = Buffer.from(response.audioContent as Uint8Array).toString('base64');
    const dataUrl = `data:audio/mp3;base64,${audioBase64}`;

    logger.debug('TTS audio generated', { text, languageCode, length: audioBase64.length });
    return dataUrl;
  } catch (error) {
    logger.error('Failed to generate TTS audio', { error, text, languageCode });
    return null;
  }
}

/**
 * Batch generate speech URLs for multiple texts
 */
export async function batchGenerateSpeechUrls(
  items: Array<{ text: string; lang?: string }>
): Promise<Array<string | null>> {
  return Promise.all(items.map((item) => generateSpeechUrl(item.text, item.lang)));
}
