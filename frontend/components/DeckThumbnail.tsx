import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppColors } from '../constants/theme';

const DECK_THEMES: Record<string, { emoji: string; colorIndex: number }> = {
  // Pre-made deck mappings
  'Comida': { emoji: '🍕', colorIndex: 0 },
  'Cores e Formas': { emoji: '🎨', colorIndex: 1 },
  'Partes do Corpo': { emoji: '🦵', colorIndex: 2 },
  'Família': { emoji: '👨‍👩‍👧', colorIndex: 3 },
  'Roupas': { emoji: '👕', colorIndex: 4 },
  'Animais': { emoji: '🦁', colorIndex: 5 },
  '40 Palavras Mais Comuns': { emoji: '📖', colorIndex: 6 },
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

type Props = {
  name: string;
  cardCount?: number;
  size?: 'small' | 'medium' | 'large';
};

export default function DeckThumbnail({ name, cardCount, size = 'medium' }: Props) {
  const theme = DECK_THEMES[name];
  const colorIndex = theme
    ? theme.colorIndex
    : hashString(name) % AppColors.deckColors.length;
  const emoji = theme?.emoji || '📚';
  const colors = AppColors.deckColors[colorIndex];

  const sizeStyles = {
    small: { width: 60, height: 60, emoji: 28, radius: 12 },
    medium: { width: '100%' as any, height: 120, emoji: 44, radius: 16 },
    large: { width: '100%' as any, height: 160, emoji: 56, radius: 20 },
  }[size];

  return (
    <LinearGradient
      colors={[colors[0], colors[1]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.container,
        {
          width: sizeStyles.width,
          height: sizeStyles.height,
          borderRadius: sizeStyles.radius,
        },
      ]}
    >
      <Text style={[styles.emoji, { fontSize: sizeStyles.emoji }]}>{emoji}</Text>
      {cardCount !== undefined && size !== 'small' && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{cardCount}</Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  emoji: {
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
