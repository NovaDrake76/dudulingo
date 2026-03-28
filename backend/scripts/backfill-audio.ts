import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Card } from '../api/db/schema.ts';
import { generateSpeechUrl } from '../api/services/tts.ts';
import logger from '../api/logger.ts';

config();

/**
 * Backfill audio URLs for existing cards
 *
 * This script:
 * - Finds all cards without audioUrl
 * - Generates TTS audio for each unique word+language combination
 * - Caches results to avoid duplicate API calls
 * - Updates cards in batches
 * - Shows progress
 *
 * Run with: npm run backfill-audio
 */

interface AudioCache {
  [key: string]: string | null; // key: "word|lang", value: audioUrl or null
}

async function backfillAudio() {
  try {
    // Connect to database
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not set in environment');
    }

    await mongoose.connect(process.env.DATABASE_URL);
    logger.info('Connected to database');

    // Find cards without audio
    const cardsWithoutAudio = await Card.find({
      audioUrl: { $exists: false },
      answer: { $exists: true, $ne: '' }
    });

    if (cardsWithoutAudio.length === 0) {
      logger.info('✅ All cards already have audio!');
      process.exit(0);
    }

    logger.info(`Found ${cardsWithoutAudio.length} cards without audio`);

    // Build cache of unique word+language combinations
    const audioCache: AudioCache = {};
    const uniqueCombinations = new Map<string, { word: string; lang?: string }>();

    for (const card of cardsWithoutAudio) {
      const key = `${card.answer}|${card.lang || 'en'}`;
      if (!uniqueCombinations.has(key)) {
        uniqueCombinations.set(key, { word: card.answer, lang: card.lang });
      }
    }

    logger.info(`Generating audio for ${uniqueCombinations.size} unique words...`);

    // Generate audio for unique combinations with progress tracking
    let processed = 0;
    for (const [key, { word, lang }] of uniqueCombinations) {
      try {
        const audioUrl = await generateSpeechUrl(word, lang);
        audioCache[key] = audioUrl;
        processed++;

        // Log progress every 10 words
        if (processed % 10 === 0 || processed === uniqueCombinations.size) {
          logger.info(`Progress: ${processed}/${uniqueCombinations.size} words generated`);
        }

        // Add small delay to avoid rate limiting (200ms between calls)
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        logger.error(`Failed to generate audio for "${word}" (${lang})`, { error });
        audioCache[key] = null; // Mark as failed
      }
    }

    // Update cards with cached audio URLs
    logger.info('Updating cards with generated audio...');
    let updated = 0;
    let skipped = 0;

    for (const card of cardsWithoutAudio) {
      const key = `${card.answer}|${card.lang || 'en'}`;
      const audioUrl = audioCache[key];

      if (audioUrl) {
        await Card.findByIdAndUpdate(card._id, { audioUrl });
        updated++;
      } else {
        skipped++;
      }
    }

    logger.info('✅ Backfill complete!');
    logger.info(`  - Updated: ${updated} cards`);
    logger.info(`  - Skipped (failed): ${skipped} cards`);
    logger.info(`  - Unique words cached: ${uniqueCombinations.size}`);
    logger.info(`  - API calls saved: ${cardsWithoutAudio.length - uniqueCombinations.size}`);

  } catch (error) {
    logger.error('Backfill failed', { error });
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the script
backfillAudio();
