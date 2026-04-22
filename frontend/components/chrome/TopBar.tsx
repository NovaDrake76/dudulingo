import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Theme, Type } from '../../constants/theme';

type Props = {
  title?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  pad?: number;
};

export function TopBar({ title, leading, trailing, pad = 62 }: Props) {
  return (
    <View style={[styles.row, { paddingTop: pad }]}>
      <View style={styles.side}>
        {leading}
        {title ? <Text style={styles.title}>{title}</Text> : null}
      </View>
      <View style={styles.side}>{trailing}</View>
    </View>
  );
}

export function CircleBtn({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.circle, pressed && { opacity: 0.7 }]}
      hitSlop={6}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 20,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  side: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: Type.sansSemi,
    fontSize: 15,
    color: Theme.ink,
    letterSpacing: -0.1,
  },
  circle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Theme.card,
    borderWidth: 0.5,
    borderColor: Theme.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
