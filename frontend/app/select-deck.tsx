import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Bar, CircleBtn, TopBar } from '../components/chrome';
import {
  coverBg,
  coverBgMuted,
  coverInk,
  coverInkMuted,
  deckIdentity,
  Theme,
  Type,
} from '../constants/theme';
import { api } from '../services/api';
import logger from '../services/logger';

type Deck = {
  _id: string;
  name: string;
  description: string;
  cardCount: number;
  lang?: string;
};

type DeckWithStats = Deck & {
  glyph: string;
  hue: number;
  progress: number;
  touched: number;
  mastered: number;
};

const FILTERS = ['All', 'In progress', 'Mastered', 'Not started'] as const;
type Filter = (typeof FILTERS)[number];

export default function SelectDeck() {
  const [decks, setDecks] = useState<DeckWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Filter>('All');
  const [selectedLang, setSelectedLang] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [allDecks, me, progressMap] = await Promise.all([
          api.getAllDecks(),
          api.getMe(),
          api.getDeckProgressMap(),
        ]);
        if (cancelled) return;

        const enriched: DeckWithStats[] = allDecks.map((d) => {
          const id = deckIdentity(d.name);
          const p = progressMap[d._id] ?? { touched: 0, mastered: 0 };
          const progress = d.cardCount > 0 ? p.mastered / d.cardCount : 0;
          return {
            ...d,
            ...id,
            progress,
            touched: p.touched,
            mastered: p.mastered,
          };
        });

        setDecks(enriched);
        setSelectedLang(me?.selectedLanguage ?? null);
      } catch (error) {
        logger.error('Failed to load decks', { error: String(error) });
        Alert.alert('Error', 'Could not load decks.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Theme.ink} />
      </View>
    );
  }

  const filtered = decks.filter((d) => {
    if (active === 'All') return true;
    if (active === 'Not started') return d.touched === 0;
    if (active === 'In progress') return d.touched > 0 && d.progress < 1;
    if (active === 'Mastered') return d.cardCount > 0 && d.progress >= 1;
    return true;
  });

  const totalCards = decks.reduce((s, d) => s + d.cardCount, 0);
  const langName = (() => {
    if (selectedLang === 'it') return 'Italian';
    if (selectedLang === 'de') return 'German';
    if (selectedLang === 'en') return 'English';
    return 'Library';
  })();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TopBar
          leading={<Text style={styles.title}>Library</Text>}
          trailing={
            <CircleBtn onPress={() => router.push('/(tabs)/profile')}>
              <Ionicons name="person-outline" size={14} color={Theme.ink} />
            </CircleBtn>
          }
        />

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {langName} · {decks.length} packs · {totalCards} cards
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => {
            const on = f === active;
            return (
              <Pressable
                key={f}
                onPress={() => setActive(f)}
                style={[styles.filter, on && styles.filterOn]}
              >
                <Text style={[styles.filterText, on && styles.filterTextOn]}>{f}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {filtered.length === 0 ? (
          <Text style={styles.empty}>No decks match that filter.</Text>
        ) : (
          <View style={styles.grid}>
            {filtered.map((deck, index) => (
              <Animated.View
                key={deck._id}
                entering={FadeInDown.delay(index * 40).springify()}
                style={styles.cell}
              >
                <DeckCard deck={deck} />
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function DeckCard({ deck }: { deck: DeckWithStats }) {
  const untouched = deck.touched === 0;
  const bg = untouched ? coverBgMuted(deck.hue) : coverBg(deck.hue);
  const inkColor = untouched ? coverInkMuted(deck.hue) : coverInk(deck.hue);
  return (
    <Pressable
      onPress={() => router.push(`/review/${deck._id}`)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.cover, { backgroundColor: bg }]}>
        <Text
          style={{
            fontFamily: Type.serifItalic,
            fontSize: 64,
            color: inkColor,
            lineHeight: 70,
            letterSpacing: -1,
          }}
        >
          {deck.glyph}
        </Text>
        {untouched && deck.cardCount > 0 && (
          <View style={styles.newPill}>
            <Text style={styles.newPillText}>NEW</Text>
          </View>
        )}
      </View>
      <Text numberOfLines={1} style={styles.cardTitle}>
        {deck.name}
      </Text>
      <Text style={styles.cardMeta}>
        {deck.cardCount} cards · {Math.round(deck.progress * 100)}%
      </Text>
      <View style={{ marginTop: 8 }}>
        <Bar
          pct={deck.progress}
          color={untouched ? Theme.inkFaint : Theme.forest}
          track={Theme.line}
          h={3}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.paper },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.paper,
  },
  scroll: { paddingBottom: 60 },

  title: {
    fontFamily: Type.serif,
    fontSize: 28,
    color: Theme.ink,
    letterSpacing: -0.6,
  },

  metaRow: { paddingHorizontal: 20, marginTop: 2 },
  metaText: {
    fontFamily: Type.sans,
    fontSize: 13,
    color: Theme.inkSoft,
  },

  filterRow: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
    gap: 6,
    flexDirection: 'row',
  },
  filter: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 999,
    borderWidth: 0.5,
    borderColor: Theme.line,
    backgroundColor: 'transparent',
  },
  filterOn: {
    backgroundColor: Theme.ink,
    borderColor: Theme.ink,
  },
  filterText: {
    fontFamily: Type.sansSemi,
    fontSize: 12.5,
    color: Theme.inkSoft,
  },
  filterTextOn: { color: Theme.paper },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  cell: { width: '47.8%' },

  card: {
    backgroundColor: Theme.card,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Theme.line,
    padding: 12,
    gap: 8,
  },
  cover: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: Theme.line,
    overflow: 'hidden',
  },
  newPill: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 999,
    backgroundColor: Theme.paper,
    borderWidth: 0.5,
    borderColor: Theme.line,
  },
  newPillText: {
    fontFamily: Type.sansBold,
    fontSize: 9.5,
    letterSpacing: 0.6,
    color: Theme.inkSoft,
  },
  cardTitle: {
    fontFamily: Type.sansSemi,
    fontSize: 13.5,
    color: Theme.ink,
    letterSpacing: -0.1,
  },
  cardMeta: {
    fontFamily: Type.sans,
    fontSize: 11,
    color: Theme.inkMute,
    marginTop: 2,
  },
  empty: {
    textAlign: 'center',
    marginTop: 48,
    color: Theme.inkMute,
    fontSize: 14,
    fontFamily: Type.sans,
  },
});
