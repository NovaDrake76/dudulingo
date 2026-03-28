import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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

const { width } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (width - 48 - CARD_GAP) / 2;

export default function SelectDeck() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    try {
      const allDecks = await api.getAllDecks();
      setDecks(allDecks);
    } catch (error) {
      logger.error('Failed to load decks', { error: String(error) });
      Alert.alert('Error', 'Failed to load decks');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDeck = async (deckId: string) => {
    try {
      await api.addDeckToUser(deckId);
      await AsyncStorage.setItem('selectedDeck', deckId);
      router.replace('/(tabs)/learn');
    } catch (error) {
      logger.error('Failed to add deck', { error: String(error) });
      Alert.alert('Error', 'Failed to add deck to your learning list');
    }
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
        <Text style={styles.subtitle}>Pick a deck to start learning new words</Text>

        <View style={styles.grid}>
          {decks.map((deck, index) => (
            <Animated.View
              key={deck._id}
              entering={FadeInDown.delay(index * 80).springify()}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.deckCard,
                  pressed && styles.deckCardPressed,
                ]}
                onPress={() => handleSelectDeck(deck._id)}
              >
                <DeckThumbnail
                  name={deck.name}
                  cardCount={deck.cardCount}
                  size="medium"
                />
                <View style={styles.deckInfo}>
                  <Text style={styles.deckTitle} numberOfLines={1}>
                    {deck.name}
                  </Text>
                  <Text style={styles.deckDescription} numberOfLines={2}>
                    {deck.description}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
        ]}
        onPress={() => router.push('/create-deck')}
      >
        <Ionicons name="add" size={28} color={AppColors.white} />
      </Pressable>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 100,
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
    marginBottom: 28,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  deckCard: {
    width: CARD_WIDTH,
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 4,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  deckCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  deckInfo: {
    padding: 12,
    paddingTop: 10,
  },
  deckTitle: {
    color: AppColors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  deckDescription: {
    color: AppColors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabPressed: {
    transform: [{ scale: 0.92 }],
    opacity: 0.9,
  },
});
