import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { AppColors } from '../constants/theme';
import logger from '../services/logger';

type Props = {
  audioUrl: string;
  size?: number;
  color?: string;
};

export function AudioButton({ audioUrl, size = 32, color = AppColors.primary }: Props) {
  const [playing, setPlaying] = useState(false);

  const handlePlay = async () => {
    if (playing) return;
    setPlaying(true);
    try {
      // expo-av will be used here once installed
      // For now, this component is ready for audio playback
      const { Audio } = await import('expo-av');
      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
      sound.setOnPlaybackStatusUpdate((status) => {
        if ('didJustFinish' in status && status.didJustFinish) {
          sound.unloadAsync();
          setPlaying(false);
        }
      });
      await sound.playAsync();
    } catch (error) {
      logger.error('Audio playback failed', { error: String(error) });
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
