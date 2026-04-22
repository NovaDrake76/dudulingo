import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Theme, Type } from '../../constants/theme';

type BarProps = {
  pct?: number; // 0..1
  color?: string;
  track?: string;
  h?: number;
};

export function Bar({ pct = 0, color = Theme.forest, track = Theme.line, h = 4 }: BarProps) {
  const clamped = Math.max(0, Math.min(1, pct));
  return (
    <View style={{ width: '100%', height: h, backgroundColor: track, borderRadius: 999, overflow: 'hidden' }}>
      <View
        style={{
          width: `${clamped * 100}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
    </View>
  );
}

type StatTileProps = {
  kicker: string;
  value: string | number;
  label?: string;
  accent?: string;
};

export function StatTile({ kicker, value, label, accent = Theme.ink }: StatTileProps) {
  return (
    <View style={styles.tile}>
      <Text style={styles.kicker}>{kicker}</Text>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: Theme.card,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Theme.line,
    gap: 2,
  },
  kicker: {
    fontFamily: Type.sansSemi,
    fontSize: 10.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Theme.inkMute,
  },
  value: {
    fontFamily: Type.serif,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  label: {
    fontFamily: Type.sans,
    fontSize: 12,
    color: Theme.inkMute,
    marginTop: 2,
  },
});
