import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { AppColors } from '../constants/theme';
import logger from '../services/logger';

type Props = {
  text: string;
  lang?: string;
  size?: number;
  color?: string;
};

const LANG_TO_BCP47: Record<string, string> = {
  en: 'en-US',
  it: 'it-IT',
  de: 'de-DE',
  'pt-BR': 'pt-BR',
};

export function AudioButton({ text, lang, size = 32, color = AppColors.primary }: Props) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      Speech.stop().catch(() => undefined);
    };
  }, []);

  const handlePlay = () => {
    if (playing) return;
    setPlaying(true);
    try {
      Speech.speak(text, {
        language: lang ? (LANG_TO_BCP47[lang] ?? lang) : undefined,
        rate: 0.9,
        onDone: () => setPlaying(false),
        onStopped: () => setPlaying(false),
        onError: () => setPlaying(false),
      });
    } catch (error) {
      logger.error('Speech.speak failed', { error: String(error) });
      setPlaying(false);
    }
  };

  return (
    <Pressable style={styles.button} onPress={handlePlay} disabled={playing}>
      <Ionicons
        name={playing ? 'volume-high' : 'volume-medium-outline'}
        size={size}
        color={playing ? AppColors.info : color}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});
