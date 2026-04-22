import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Theme, Type } from '../constants/theme';

type TabBarProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

const TAB_CONFIG: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; label: string }
> = {
  learn: { icon: 'home-outline', label: 'Today' },
  profile: { icon: 'person-outline', label: 'You' },
};

export default function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.tabRow}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const config = TAB_CONFIG[route.name] || {
            icon: 'ellipse-outline' as const,
            label: route.name,
          };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tabItem}>
              {isFocused && <View style={styles.activeIndicator} />}
              <Ionicons
                name={config.icon}
                size={22}
                color={isFocused ? Theme.ink : Theme.inkFaint}
              />
              <Text
                style={[
                  styles.label,
                  { color: isFocused ? Theme.ink : Theme.inkFaint },
                  isFocused && { fontFamily: Type.sansSemi },
                ]}
              >
                {config.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.paper,
    borderTopWidth: 0.5,
    borderTopColor: Theme.line,
  },
  tabRow: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: Platform.OS === 'web' ? 12 : 28,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    position: 'relative',
    paddingTop: 6,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 14,
    height: 2,
    borderRadius: 2,
    backgroundColor: Theme.forest,
  },
  label: {
    fontFamily: Type.sansMedium,
    fontSize: 10.5,
    letterSpacing: 0.2,
  },
});
