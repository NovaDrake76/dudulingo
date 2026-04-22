import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { CARD_IMAGES } from '../../../assets/cards';
import { AppColors } from '../../../constants/theme';

type Props = {
  imageKey?: string;
  imageUrl?: string;
  emoji?: string;
  style: StyleProp<ImageStyle & ViewStyle>;
};

/**
 * Renders whichever card visual is available, in this order:
 *   1. A bundled CC0 photo addressed by `imageKey` (lookup in assets/cards/index.ts)
 *   2. A remote image at `imageUrl` (downloaded language pack)
 *   3. A large emoji
 *   4. A neutral placeholder icon
 */
export function CardVisual({ imageKey, imageUrl, emoji, style }: Props) {
  const [remoteFailed, setRemoteFailed] = useState(false);

  const bundledSource = imageKey ? CARD_IMAGES[imageKey] : undefined;
  if (bundledSource) {
    return <Image source={bundledSource} style={style as StyleProp<ImageStyle>} resizeMode="cover" />;
  }

  if (imageUrl && !remoteFailed) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={style as StyleProp<ImageStyle>}
        onError={() => setRemoteFailed(true)}
      />
    );
  }

  if (emoji) {
    return (
      <View style={[style as object, styles.center]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
    );
  }

  return (
    <View style={[style as object, styles.center]}>
      <Ionicons name="image-outline" size={48} color={AppColors.textMuted} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    backgroundColor: AppColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 96,
    lineHeight: 112,
  },
});
