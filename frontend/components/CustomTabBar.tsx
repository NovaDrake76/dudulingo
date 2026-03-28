import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { AppColors } from '../constants/theme';

type TabBarProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

const TAB_CONFIG: Record<string, { icon: string; iconFocused: string; label: string }> = {
  learn: { icon: 'book-outline', iconFocused: 'book', label: 'Learn' },
  profile: { icon: 'person-outline', iconFocused: 'person', label: 'Profile' },
};

export default function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, styles.fallback]}>
        <TabButtons state={state} descriptors={descriptors} navigation={navigation} />
      </View>
    </View>
  );
}

function TabButtons({ state, descriptors, navigation }: TabBarProps) {
  return (
    <View style={styles.tabRow}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const config = TAB_CONFIG[route.name] || {
          icon: 'ellipse-outline',
          iconFocused: 'ellipse',
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
          <TabItem
            key={route.key}
            icon={isFocused ? config.iconFocused : config.icon}
            label={config.label}
            isFocused={isFocused}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
}

function TabItem({
  icon,
  label,
  isFocused,
  onPress,
}: {
  icon: string;
  label: string;
  isFocused: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.85, { damping: 15 }, () => {
      scale.value = withSpring(1, { damping: 15 });
    });
    onPress();
  };

  return (
    <Pressable onPress={handlePress} style={styles.tabItem}>
      <Animated.View style={[styles.tabContent, animatedStyle]}>
        {isFocused && <View style={styles.activeIndicator} />}
        <Ionicons
          name={icon as any}
          size={24}
          color={isFocused ? AppColors.primary : AppColors.textMuted}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: isFocused ? AppColors.primary : AppColors.textMuted },
            isFocused && styles.tabLabelActive,
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  container: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  fallback: {
    backgroundColor: 'rgba(14, 14, 14, 0.95)',
  },
  tabRow: {
    flexDirection: 'row',
    paddingBottom: Platform.OS === 'web' ? 12 : 28,
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -10,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: AppColors.primary,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  tabLabelActive: {
    fontWeight: '700',
  },
});
