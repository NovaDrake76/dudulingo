import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, ImageStyle, StyleProp, View } from 'react-native';
import { AppColors } from '../../../constants/theme';

type Props = {
  uri: string;
  style: StyleProp<ImageStyle>;
};

export function CardImage({ uri, style }: Props) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <View
        style={[
          style as object,
          {
            backgroundColor: AppColors.surface,
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
          },
        ]}
      >
        <Ionicons name="image-outline" size={48} color={AppColors.textMuted} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      onError={() => setHasError(true)}
    />
  );
}
