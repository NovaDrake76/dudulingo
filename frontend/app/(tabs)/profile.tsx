import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Bar, CircleBtn, TopBar } from '../../components/chrome';
import { Theme, Type } from '../../constants/theme';
import {
  buildHeatmap,
  currentStreak,
  MILESTONE_LADDERS,
  nextMilestone,
  windowSinceMs,
} from '../../services/activity';
import { api } from '../../services/api';
import i18n, { setLocale } from '../../services/i18n';
import logger from '../../services/logger';

type User = {
  _id: string;
  name: string;
  selectedLanguage?: string | null;
};

type UserStats = {
  totalWords: number;
  masteredWords: number;
  learningWords: number;
};

const WEEKS = 14;
const DAYS = 7;

function getLanguageName(code?: string | null): string {
  if (code === 'en') return 'English';
  if (code === 'pt-BR') return 'Português';
  if (code === 'it') return 'Italian';
  if (code === 'de') return 'German';
  return 'Not set';
}

function heatColor(v: number): string {
  if (v === 0) return Theme.line;
  if (v === 1) return '#C5DBC7';
  if (v === 2) return '#7FB593';
  return Theme.forest;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [events, setEvents] = useState<{ reviewed_at: number; rating: string | null }[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [firstReviewAt, setFirstReviewAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [locale, setLocaleState] = useState(i18n.locale);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const since = windowSinceMs(WEEKS * DAYS);
      const [userData, statData, activity, reviews, first] = await Promise.all([
        api.getMe(),
        api.getUserStats(),
        api.getActivitySince(since),
        api.getReviewCount(),
        api.getFirstReviewAt(),
      ]);
      setUser(userData);
      setStats(statData);
      setEvents(activity);
      setReviewCount(reviews);
      setFirstReviewAt(first);
    } catch (error) {
      logger.error('Failed to load profile', { error: String(error) });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const grid = useMemo(() => buildHeatmap(events, WEEKS), [events]);
  const streakDays = useMemo(() => currentStreak(events), [events]);

  const handleResetProgress = () => {
    Alert.alert(
      'Reset progress?',
      'This will delete all your review progress. Installed language packs and cards stay. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.resetAllProgress();
              await load();
              Alert.alert('Done', 'Your progress has been reset.');
            } catch (error) {
              logger.error('Failed to reset progress', { error: String(error) });
              Alert.alert('Error', 'Could not reset progress.');
            }
          },
        },
      ],
    );
  };

  const changeLocale = (newLocale: string) => {
    setLocale(newLocale);
    setLocaleState(newLocale);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Theme.ink} />
      </View>
    );
  }

  const initial = (user?.name ?? 'L').trim().charAt(0).toUpperCase();
  const mastered = stats?.masteredWords ?? 0;
  const total = stats?.totalWords ?? 0;
  const learning = stats?.learningWords ?? 0;
  const reviews = reviewCount;

  // Milestone targets adapt to current progress so the bars always have
  // a reachable next goal.
  const masteredTarget = total > 0
    ? Math.min(nextMilestone(mastered, MILESTONE_LADDERS.words), total)
    : nextMilestone(mastered, MILESTONE_LADDERS.words);
  const streakTarget = nextMilestone(streakDays, MILESTONE_LADDERS.streak);

  const monthLabel = new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' });
  const sinceLabel = firstReviewAt
    ? `since ${new Date(firstReviewAt).toLocaleString('en-US', {
        month: 'short',
        year: 'numeric',
      })}`
    : 'just started';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <TopBar
        leading={<Text style={styles.pageTitle}>You</Text>}
        trailing={
          <CircleBtn onPress={() => router.push('/auth/select-language')}>
            <Ionicons name="add" size={16} color={Theme.ink} />
          </CircleBtn>
        }
      />

      {/* Identity */}
      <View style={styles.identityRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarGlyph}>{initial}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user?.name ?? 'Learner'}</Text>
          <Text style={styles.meta}>
            Learning{' '}
            <Text style={styles.metaBold}>{getLanguageName(user?.selectedLanguage)}</Text>{' '}
            · {sinceLabel}
          </Text>
        </View>
      </View>

      {/* Stats row — custom tiles so the tall serif numeral breathes */}
      <View style={styles.statsRow}>
        <View style={styles.tile}>
          <Text style={styles.tileKicker}>MASTERED</Text>
          <Text style={[styles.tileValue, { color: Theme.forest }]}>{mastered}</Text>
          <Text style={styles.tileMeta}>of {total || '—'}</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.tileKicker}>STREAK</Text>
          <Text style={[styles.tileValue, { color: Theme.amber }]}>{streakDays}</Text>
          <Text style={styles.tileMeta}>days</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.tileKicker}>REVIEWS</Text>
          <Text style={[styles.tileValue, { color: Theme.ink }]}>{reviews}</Text>
          <Text style={styles.tileMeta}>all time</Text>
        </View>
      </View>

      {/* Heatmap */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionKicker}>ACTIVITY · 14 WEEKS</Text>
          <Text style={styles.sectionMonth}>{monthLabel}</Text>
        </View>
        <View style={styles.heatCard}>
          <View style={styles.heatGrid}>
            {Array.from({ length: WEEKS }).map((_, w) => (
              <View key={w} style={styles.heatCol}>
                {Array.from({ length: DAYS }).map((_, d) => (
                  <View
                    key={d}
                    style={[styles.heatCell, { backgroundColor: heatColor(grid[w * DAYS + d]) }]}
                  />
                ))}
              </View>
            ))}
          </View>
          <View style={styles.heatLegend}>
            <Text style={styles.heatLegendText}>Less</Text>
            <View style={styles.heatLegendSwatches}>
              {[0, 1, 2, 3].map((v) => (
                <View key={v} style={[styles.heatLegendCell, { backgroundColor: heatColor(v) }]} />
              ))}
            </View>
            <Text style={styles.heatLegendText}>More</Text>
          </View>
        </View>
      </View>

      {/* Milestones */}
      <View style={styles.section}>
        <Text style={styles.sectionKicker}>MILESTONES</Text>
        <View style={styles.milestones}>
          <MilestoneRow
            title={`${masteredTarget} words mastered`}
            sub={`${Math.max(masteredTarget - mastered, 0)} away`}
            pct={masteredTarget > 0 ? mastered / masteredTarget : 0}
            color={Theme.forest}
            first
          />
          <MilestoneRow
            title={`${streakTarget}-day streak`}
            sub={
              streakDays >= streakTarget
                ? 'reached'
                : `${streakTarget - streakDays} days to go`
            }
            pct={streakTarget > 0 ? streakDays / streakTarget : 0}
            color={Theme.amber}
          />
          <MilestoneRow
            title="Finish all packs"
            sub={
              total === 0
                ? 'no cards yet'
                : `${learning} in progress · ${total - mastered - learning} not started`
            }
            pct={total > 0 ? mastered / Math.max(total, 1) : 0}
            color={Theme.indigo}
          />
        </View>
      </View>

      {/* Prefs */}
      <View style={styles.section}>
        <Text style={styles.sectionKicker}>APP LANGUAGE</Text>
        <View style={styles.prefCard}>
          <Pressable
            onPress={() => changeLocale('en')}
            style={[styles.prefRow, locale === 'en' && styles.prefRowOn]}
          >
            <Text style={[styles.prefLabel, locale === 'en' && styles.prefLabelOn]}>English</Text>
            {locale === 'en' && <Ionicons name="checkmark" size={16} color={Theme.forest} />}
          </Pressable>
          <View style={styles.prefDivider} />
          <Pressable
            onPress={() => changeLocale('pt-BR')}
            style={[styles.prefRow, locale === 'pt-BR' && styles.prefRowOn]}
          >
            <Text style={[styles.prefLabel, locale === 'pt-BR' && styles.prefLabelOn]}>
              Português (BR)
            </Text>
            {locale === 'pt-BR' && <Ionicons name="checkmark" size={16} color={Theme.forest} />}
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionKicker}>LEARNING LANGUAGE</Text>
        <Pressable
          onPress={() => router.push('/auth/select-language')}
          style={({ pressed }) => [styles.changeLangRow, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.changeLangName}>{getLanguageName(user?.selectedLanguage)}</Text>
          <View style={styles.changeLangRight}>
            <Text style={styles.changeLangHint}>Change</Text>
            <Ionicons name="chevron-forward" size={14} color={Theme.inkFaint} />
          </View>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Pressable
          onPress={handleResetProgress}
          style={({ pressed }) => [styles.dangerBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.dangerBtnText}>Reset progress</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function MilestoneRow({
  title,
  sub,
  pct,
  color,
  first,
}: {
  title: string;
  sub: string;
  pct: number;
  color: string;
  first?: boolean;
}) {
  return (
    <View style={[styles.milestone, !first && styles.milestoneDivider]}>
      <View style={styles.milestoneHead}>
        <Text style={styles.milestoneTitle}>{title}</Text>
        <Text style={styles.milestoneSub}>{sub}</Text>
      </View>
      <View style={{ marginTop: 8 }}>
        <Bar pct={pct} color={color} track={Theme.line} h={3} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.paper },
  content: { paddingBottom: 120 },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.paper,
  },

  pageTitle: {
    fontFamily: Type.serif,
    fontSize: 28,
    color: Theme.ink,
    letterSpacing: -0.6,
  },

  identityRow: {
    paddingHorizontal: 20,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: Theme.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlyph: {
    fontFamily: Type.serifItalic,
    color: Theme.paper,
    fontSize: 28,
    lineHeight: 32,
  },
  name: {
    fontFamily: Type.serif,
    fontSize: 22,
    color: Theme.ink,
    letterSpacing: -0.4,
  },
  meta: {
    fontFamily: Type.sans,
    fontSize: 12.5,
    color: Theme.inkMute,
    marginTop: 2,
  },
  metaBold: { fontFamily: Type.sansSemi, color: Theme.inkSoft },

  statsRow: {
    paddingHorizontal: 20,
    paddingTop: 18,
    flexDirection: 'row',
    gap: 10,
  },
  tile: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: Theme.card,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Theme.line,
  },
  tileKicker: {
    fontFamily: Type.sansSemi,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: Theme.inkMute,
  },
  tileValue: {
    fontFamily: Type.serif,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.5,
    marginTop: 4,
  },
  tileMeta: {
    fontFamily: Type.sans,
    fontSize: 12,
    color: Theme.inkMute,
    marginTop: 2,
  },

  section: { paddingHorizontal: 20, paddingTop: 22 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionKicker: {
    fontFamily: Type.sansSemi,
    fontSize: 11,
    letterSpacing: 1.4,
    color: Theme.inkMute,
    marginBottom: 10,
  },
  sectionMonth: {
    fontFamily: Type.sans,
    fontSize: 11.5,
    color: Theme.inkSoft,
  },

  heatCard: {
    backgroundColor: Theme.card,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Theme.line,
    padding: 14,
  },
  heatGrid: { flexDirection: 'row', gap: 3 },
  heatCol: { flex: 1, gap: 3 },
  heatCell: {
    aspectRatio: 1,
    borderRadius: 3,
  },
  heatLegend: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heatLegendText: {
    fontFamily: Type.sans,
    fontSize: 11,
    color: Theme.inkMute,
  },
  heatLegendSwatches: { flexDirection: 'row', gap: 3 },
  heatLegendCell: { width: 10, height: 10, borderRadius: 2 },

  milestones: {
    backgroundColor: Theme.card,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Theme.line,
    overflow: 'hidden',
  },
  milestone: { paddingHorizontal: 16, paddingVertical: 14 },
  milestoneDivider: {
    borderTopWidth: 0.5,
    borderTopColor: Theme.line,
  },
  milestoneHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 10,
  },
  milestoneTitle: {
    fontFamily: Type.sansSemi,
    fontSize: 14,
    color: Theme.ink,
    letterSpacing: -0.1,
  },
  milestoneSub: {
    fontFamily: Type.mono,
    fontSize: 10.5,
    color: Theme.inkMute,
  },

  prefCard: {
    backgroundColor: Theme.card,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Theme.line,
    overflow: 'hidden',
  },
  prefRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prefRowOn: { backgroundColor: Theme.forestSoft },
  prefDivider: {
    height: 0.5,
    backgroundColor: Theme.line,
  },
  prefLabel: {
    fontFamily: Type.sansMedium,
    fontSize: 14,
    color: Theme.ink,
  },
  prefLabelOn: { fontFamily: Type.sansSemi, color: Theme.forestInk },

  changeLangRow: {
    padding: 16,
    backgroundColor: Theme.card,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Theme.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  changeLangName: {
    fontFamily: Type.serif,
    fontSize: 20,
    color: Theme.ink,
    letterSpacing: -0.3,
  },
  changeLangRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changeLangHint: {
    fontFamily: Type.sansSemi,
    fontSize: 13,
    color: Theme.forest,
  },

  dangerBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Theme.roseSoft,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  dangerBtnText: {
    fontFamily: Type.sansSemi,
    fontSize: 14,
    color: Theme.rose,
  },
});
