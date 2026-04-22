import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { DeckCover } from '../../components/chrome';
import { deckIdentity, Theme, Type } from '../../constants/theme';
import { currentStreak, medianSecondsPerCard, windowSinceMs } from '../../services/activity';
import { api } from '../../services/api';
import logger from '../../services/logger';

type UserStats = {
  totalWords: number;
  masteredWords: number;
  learningWords: number;
};

type Deck = {
  _id: string;
  name: string;
  description: string;
  cardCount: number;
};

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDate(d: Date): string {
  return `${WEEKDAYS[d.getDay()]} · ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function greetingFor(d: Date): string {
  const h = d.getHours();
  if (h < 12) return 'Morning';
  if (h < 18) return 'Afternoon';
  return 'Evening';
}

export default function Learn() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [dueByDeck, setDueByDeck] = useState<Record<string, number>>({});
  const [events, setEvents] = useState<{ reviewed_at: number; rating: string | null }[]>([]);
  const [name, setName] = useState<string>('Learner');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [userStats, allDecks, me, due, activity] = await Promise.all([
        api.getUserStats(),
        api.getAllDecks(),
        api.getMe(),
        api.getDueCountsByDeck(),
        api.getActivitySince(windowSinceMs(7)),
      ]);
      setStats(userStats);
      setDecks(allDecks);
      setName(me?.name ?? 'Learner');
      setDueByDeck(due);
      setEvents(activity);
    } catch (error) {
      logger.error('Failed to load today screen', { error: String(error) });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Theme.ink} />
      </View>
    );
  }

  const now = new Date();
  const totalDue = Object.values(dueByDeck).reduce((a, b) => a + b, 0);
  const perCardSeconds = medianSecondsPerCard(events);
  const streak = currentStreak(events);

  // 7-day retention from the rating column: correct ≠ "very_hard"; null (legacy) counts as correct.
  const retention = (() => {
    const buckets: { total: number; correct: number }[] = Array.from({ length: 7 }, () => ({
      total: 0,
      correct: 0,
    }));
    const todayMid = new Date();
    todayMid.setHours(0, 0, 0, 0);
    for (const e of events) {
      const d = new Date(e.reviewed_at);
      d.setHours(0, 0, 0, 0);
      const dayOffset = Math.round((todayMid.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
      if (dayOffset < 0 || dayOffset > 6) continue;
      const i = 6 - dayOffset;
      buckets[i].total++;
      if (e.rating !== 'very_hard') buckets[i].correct++;
    }
    return buckets.map((b) => (b.total === 0 ? 0 : b.correct / b.total));
  })();
  const retentionDays = retention.filter((v) => v > 0).length;
  const retentionAvg =
    retentionDays > 0
      ? Math.round((retention.reduce((a, b) => a + b, 0) / retentionDays) * 100)
      : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Masthead */}
      <View style={styles.masthead}>
        <View style={styles.markRow}>
          <View style={styles.mark}>
            <Text style={styles.markGlyph}>R</Text>
          </View>
          <Text style={styles.wordmark}>Repecards</Text>
        </View>
        {streak > 0 && (
          <View style={styles.streakPill}>
            <Ionicons name="flame" size={12} color={Theme.amberInk} />
            <Text style={styles.streakText}>{streak}</Text>
          </View>
        )}
      </View>

      {/* Greeting */}
      <Animated.View entering={FadeInUp.duration(320)} style={styles.greetBlock}>
        <Text style={styles.dateKicker}>{formatDate(now).toUpperCase()}</Text>
        <Text style={styles.greetHero}>
          {greetingFor(now)}, {name.split(' ')[0]}.
        </Text>
        <Text style={styles.greetSub}>
          {totalDue > 0 ? (
            perCardSeconds ? (
              <>
                You have <Text style={styles.greetBold}>{totalDue} cards</Text> due today —
                about {Math.max(1, Math.round((totalDue * perCardSeconds) / 60))} minutes at
                your pace.
              </>
            ) : (
              <>
                You have <Text style={styles.greetBold}>{totalDue} cards</Text> due today.
              </>
            )
          ) : (
            <>Nothing due. A good day to add new words or browse a deck.</>
          )}
        </Text>
      </Animated.View>

      {/* Hero review card */}
      <Animated.View entering={FadeInDown.delay(120).duration(340)} style={styles.heroWrap}>
        <View style={styles.hero}>
          <View style={styles.heroColumnRule} />
          <View style={styles.heroRow}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroKicker}>DUE NOW</Text>
              <Text style={styles.heroNumber}>{totalDue}</Text>
              <Text style={styles.heroTail}>
                {totalDue === 1 ? 'card' : 'cards'}
                {perCardSeconds
                  ? ` · ~${Math.max(1, Math.round((totalDue * perCardSeconds) / 60))} min`
                  : ''}
              </Text>
            </View>
            <View style={styles.heroRight}>
              <Text style={styles.heroKicker}>RETENTION · LAST 7D</Text>
              <View style={styles.spark}>
                {retention.map((v, i) => (
                  <View
                    key={i}
                    style={[
                      styles.sparkBar,
                      {
                        height: `${Math.max(4, Math.round(v * 100))}%`,
                        backgroundColor:
                          v === 0 ? Theme.line : i === 6 ? Theme.forest : '#CFE3D4',
                      },
                    ]}
                  />
                ))}
              </View>
              <View style={styles.sparkFoot}>
                <Text style={styles.sparkFootText}>
                  {retentionDays > 0 ? `avg ${retentionAvg}%` : 'no data yet'}
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
            onPress={() => router.push('/select-deck')}
          >
            <Ionicons name="play" size={13} color={Theme.paper} />
            <Text style={styles.ctaText}>Begin review</Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* By deck */}
      {decks.length > 0 && (
        <View style={styles.deckSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionKicker}>BY DECK</Text>
            <Pressable onPress={() => router.push('/select-deck')}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>

          <View style={styles.deckList}>
            {decks
              .map((d) => ({ ...d, due: dueByDeck[d._id] ?? 0 }))
              .sort((a, b) => b.due - a.due)
              .slice(0, 3)
              .map((deck, i) => {
              const id = deckIdentity(deck.name);
              const due = deck.due;
              return (
                <Pressable
                  key={deck._id}
                  onPress={() => router.push(`/review/${deck._id}`)}
                  style={({ pressed }) => [
                    styles.deckRow,
                    i > 0 && styles.deckRowDivider,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <DeckCover glyph={id.glyph} hue={id.hue} size={40} radius={10} />
                  <View style={styles.deckRowBody}>
                    <Text style={styles.deckRowName} numberOfLines={1}>
                      {deck.name}
                    </Text>
                    <Text style={styles.deckRowMeta}>
                      {due} due · {deck.cardCount} total
                    </Text>
                  </View>
                  <Text style={styles.deckRowCount}>{due}</Text>
                  <Ionicons name="chevron-forward" size={14} color={Theme.inkFaint} />
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* Editorial note */}
      <View style={styles.noteWrap}>
        <View style={styles.note}>
          <Text style={styles.noteQuote}>&ldquo;</Text>
          <Text style={styles.noteText}>
            Spaced repetition works because you review just before forgetting. Today&apos;s batch
            targets the edge of your curve.
          </Text>
        </View>
      </View>
    </ScrollView>
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

  // Masthead
  masthead: {
    paddingTop: 62,
    paddingHorizontal: 20,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  markRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mark: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: Theme.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markGlyph: {
    fontFamily: Type.serifItalic,
    color: Theme.paper,
    fontSize: 15,
    lineHeight: 18,
  },
  wordmark: {
    fontFamily: Type.sansSemi,
    fontSize: 15,
    color: Theme.ink,
    letterSpacing: -0.1,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingLeft: 9,
    paddingRight: 11,
    borderRadius: 999,
    backgroundColor: Theme.amberSoft,
    borderWidth: 0.5,
    borderColor: '#E9CF96',
  },
  streakText: {
    fontFamily: Type.sansSemi,
    fontSize: 12,
    color: Theme.amberInk,
  },

  // Greeting
  greetBlock: { paddingTop: 18, paddingHorizontal: 20, paddingBottom: 10 },
  dateKicker: {
    fontFamily: Type.sansSemi,
    fontSize: 12,
    letterSpacing: 1.4,
    color: Theme.inkMute,
  },
  greetHero: {
    fontFamily: Type.serif,
    fontSize: 34,
    lineHeight: 36,
    color: Theme.ink,
    letterSpacing: -0.5,
    marginTop: 4,
  },
  greetSub: {
    fontFamily: Type.sans,
    fontSize: 14.5,
    color: Theme.inkSoft,
    lineHeight: 20,
    marginTop: 6,
  },
  greetBold: { fontFamily: Type.sansSemi, color: Theme.ink },

  // Hero card
  heroWrap: { paddingHorizontal: 20, paddingTop: 14 },
  hero: {
    backgroundColor: Theme.card,
    borderRadius: 22,
    borderWidth: 0.5,
    borderColor: Theme.line,
    padding: 18,
    overflow: 'hidden',
  },
  heroColumnRule: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '38%',
    width: 0.5,
    backgroundColor: Theme.line,
  },
  heroRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 18 },
  heroLeft: { width: '32%' },
  heroRight: { flex: 1, paddingLeft: 8 },
  heroKicker: {
    fontFamily: Type.sansSemi,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: Theme.inkMute,
  },
  heroNumber: {
    fontFamily: Type.serif,
    fontSize: 64,
    lineHeight: 66,
    color: Theme.ink,
    letterSpacing: -1,
    marginTop: 6,
  },
  heroTail: {
    fontFamily: Type.sans,
    fontStyle: 'italic',
    fontSize: 11.5,
    color: Theme.inkMute,
    marginTop: 4,
  },
  spark: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 42,
    marginTop: 8,
  },
  sparkBar: { flex: 1, borderRadius: 2 },
  sparkFoot: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sparkFootText: { fontFamily: Type.sans, fontSize: 11, color: Theme.inkMute },
  sparkFootAcc: { fontFamily: Type.sansSemi, fontSize: 11, color: Theme.forest },

  cta: {
    marginTop: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: Theme.ink,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: {
    fontFamily: Type.sansSemi,
    fontSize: 15,
    color: Theme.paper,
    letterSpacing: -0.1,
  },

  // Deck section
  deckSection: { paddingTop: 28, paddingHorizontal: 20 },
  sectionHeader: {
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
  },
  seeAll: {
    fontFamily: Type.sansSemi,
    fontSize: 12,
    color: Theme.forest,
  },
  deckList: {
    backgroundColor: Theme.card,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Theme.line,
    overflow: 'hidden',
  },
  deckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  deckRowDivider: {
    borderTopWidth: 0.5,
    borderTopColor: Theme.line,
  },
  deckRowBody: { flex: 1, minWidth: 0 },
  deckRowName: {
    fontFamily: Type.sansSemi,
    fontSize: 14,
    color: Theme.ink,
    letterSpacing: -0.1,
  },
  deckRowMeta: {
    fontFamily: Type.sans,
    fontSize: 11.5,
    color: Theme.inkMute,
    marginTop: 2,
  },
  deckRowCount: {
    fontFamily: Type.serif,
    fontSize: 22,
    color: Theme.ink,
    letterSpacing: -0.4,
  },

  // Note
  noteWrap: { paddingTop: 22, paddingHorizontal: 20 },
  note: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: Theme.forestSoft,
    borderWidth: 0.5,
    borderColor: '#C5DCC9',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  noteQuote: {
    fontFamily: Type.serifItalic,
    fontSize: 24,
    color: Theme.forestInk,
    lineHeight: 22,
  },
  noteText: {
    flex: 1,
    fontFamily: Type.sans,
    fontSize: 13,
    lineHeight: 20,
    color: '#4A6B56',
  },
});
