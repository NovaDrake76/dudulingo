import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import ProgressRing from '../../components/ProgressRing';
import { AppColors } from '../../constants/theme';
import { api } from '../../services/api';
import i18n from '../../services/i18n';
import logger from '../../services/logger';

type UserStats = {
  totalWords: number;
  masteredWords: number;
  learningWords: number;
};

const MOTIVATIONS = [
  "Every word brings you closer to fluency! 🚀",
  "Small steps, big progress! 💪",
  "Your vocabulary is growing! 🌱",
  "Keep the momentum going! 🔥",
  "Learning is a superpower! ⚡",
];

export default function Learn() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const userStats = await api.getUserStats();
      setStats(userStats);
    } catch (error) {
      logger.error('Failed to load stats', { error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const handleStartReview = () => {
    router.push('/select-deck');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  const mastery = stats && stats.totalWords > 0
    ? stats.masteredWords / stats.totalWords
    : 0;
  const masteryPct = Math.round(mastery * 100);
  const newWords = stats ? stats.totalWords - stats.masteredWords : 0;
  const motivation = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
        <Text style={styles.greeting}>
          {i18n.t('yourProgress')}
        </Text>
        <Text style={styles.motivation}>{motivation}</Text>
      </Animated.View>

      {/* Progress Ring */}
      {stats && (
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.ringSection}>
          <ProgressRing
            progress={mastery}
            label={masteryPct + '%'}
            sublabel="mastered"
          />
        </Animated.View>
      )}

      {/* Stats Row */}
      {stats && (
        <Animated.View entering={FadeInDown.delay(300)} style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>📚</Text>
            <Text style={styles.statNumber}>{stats.totalWords}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statItem, styles.statItemHighlight]}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={[styles.statNumber, { color: AppColors.primary }]}>{stats.masteredWords}</Text>
            <Text style={styles.statLabel}>Mastered</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🆕</Text>
            <Text style={[styles.statNumber, { color: AppColors.info }]}>{newWords}</Text>
            <Text style={styles.statLabel}>To Learn</Text>
          </View>
        </Animated.View>
      )}

      {/* Actions */}
      <Animated.View entering={FadeInDown.delay(400)} style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
          ]}
          onPress={handleStartReview}
        >
          <Ionicons name="play" size={22} color={AppColors.white} />
          <Text style={styles.primaryButtonText}>Browse decks</Text>
        </Pressable>
      </Animated.View>

      {/* Empty state */}
      {stats && stats.totalWords === 0 && (
        <Animated.View entering={FadeInDown.delay(300)} style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📖</Text>
          <Text style={styles.emptyTitle}>{i18n.t('noDecks')}</Text>
          <Text style={styles.emptySubtext}>{i18n.t('noDecksSubtitle')}</Text>
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: AppColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 70,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '800',
    color: AppColors.text,
    marginBottom: 6,
  },
  motivation: {
    fontSize: 15,
    color: AppColors.textMuted,
    lineHeight: 20,
  },
  ringSection: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    gap: 10,
    marginBottom: 32,
  },
  statItem: {
    flex: 1,
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statItemHighlight: {
    backgroundColor: AppColors.surfaceElevated,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: AppColors.text,
  },
  statLabel: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginTop: 4,
  },
  actions: {
    paddingHorizontal: 20,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    gap: 10,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
    borderWidth: 1.5,
    borderColor: AppColors.primary,
  },
  secondaryButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  secondaryButtonText: {
    color: AppColors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  tertiaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
  },
  tertiaryButtonPressed: {
    opacity: 0.75,
  },
  tertiaryButtonText: {
    color: AppColors.textMuted,
    fontSize: 15,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 20,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: AppColors.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    color: AppColors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
