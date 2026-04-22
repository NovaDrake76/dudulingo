import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { coverBg, coverBgMuted, coverInk, coverInkMuted, Theme, Type } from '../../constants/theme';

type Props = {
  glyph: string;
  hue: number;
  size?: number;
  radius?: number;
  muted?: boolean;
};

export function DeckCover({ glyph, hue, size = 72, radius = 14, muted = false }: Props) {
  const bg = muted ? coverBgMuted(hue) : coverBg(hue);
  const ink = muted ? coverInkMuted(hue) : coverInk(hue);
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: bg,
        },
      ]}
    >
      <View style={StyleSheet.absoluteFill}>
        <View
          style={{
            position: 'absolute',
            top: '45%',
            right: '-20%',
            width: size * 1.2,
            height: 1,
            backgroundColor: ink,
            opacity: 0.12,
            transform: [{ rotate: '-45deg' }],
          }}
        />
      </View>
      <Text
        style={{
          fontFamily: Type.serifItalic,
          fontSize: size * 0.58,
          color: ink,
          lineHeight: size * 0.7,
          letterSpacing: -0.5,
        }}
      >
        {glyph}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: Theme.line,
  },
});
