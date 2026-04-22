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
import DeckThumbnail from '../components/DeckThumbnail';
import { AppColors } from '../constants/theme';
import { api } from '../services/api';
import i18n from '../services/i18n';
import logger from '../services/logger';

type Deck = {
  _id: string;
  name: string;
  description: string;
  cardCount: number;
};

export default function SelectDeck() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const allDecks = await api.getAllDecks();
        if (!cancelled) setDecks(allDecks);
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

  const handleSelectDeck = (deckId: string) => {
    router.push(`/review/${deckId}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{i18n.t('selectDeckTitle')}</Text>
        <Text style={styles.subtitle}>Pick a deck to start learning.</Text>

        {decks.length === 0 ? (
          <Text style={styles.emptyText}>
            No decks available for this language yet.
          </Text>
        ) : (
          <View style={styles.list}>
            {decks.map((deck, index) => (
              <Animated.View
                key={deck._id}
                entering={FadeInDown.delay(index * 60).springify()}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.deckCard,
                    pressed && styles.deckCardPressed,
                  ]}
                  onPress={() => handleSelectDeck(deck._id)}
                >
                  <DeckThumbnail name={deck.name} cardCount={deck.cardCount} size="medium" />
                  <View style={styles.deckInfo}>
                    <Text style={styles.deckTitle} numberOfLines={1}>
                      {deck.name}
                    </Text>
                    <Text style={styles.deckDescription} numberOfLines={3}>
                      {deck.description}
                    </Text>
                    <Text style={styles.deckMeta}>{deck.cardCount} cards</Text>
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: AppColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: AppColors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: AppColors.textMuted,
    marginBottom: 24,
  },
  emptyText: {
    color: AppColors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 40,
  },
  list: {
    gap: 12,
  },
  deckCard: {
    flexDirection: 'row',
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  deckCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  deckInfo: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
  },
  deckTitle: {
    color: AppColors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  deckDescription: {
    color: AppColors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  deckMeta: {
    color: AppColors.textSubtle,
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
});
