import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { api } from '../services/api'
import i18n from '../services/i18n'

type Deck = {
  _id: string
  name: string
  description: string
  cardCount: number
}

export default function SelectDeck() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDecks()
  }, [])

  const loadDecks = async () => {
    try {
      const allDecks = await api.getAllDecks()
      setDecks(allDecks)
    } catch (error) {
      console.error('Failed to load decks:', error)
      Alert.alert('Error', 'Failed to load decks')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectDeck = async (deckId: string) => {
    try {
      await api.addDeckToUser(deckId)
      await AsyncStorage.setItem('selectedDeck', deckId)
      router.replace('/(tabs)/learn')
    } catch (error) {
      console.error('Failed to add deck:', error)
      Alert.alert('Error', 'Failed to add deck to your learning list')
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#58cc02" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t('selectDeckTitle')}</Text>
      <ScrollView contentContainerStyle={styles.decksContainer}>
        {decks.map((deck) => (
          <Pressable
            key={deck._id}
            style={styles.deckButton}
            onPress={() => handleSelectDeck(deck._id)}>
            <View style={styles.deckInfo}>
              <Text style={styles.deckTitle}>{deck.name}</Text>
              <Text style={styles.deckDescription}>{deck.description}</Text>
              <Text style={styles.deckWordCount}>
                {deck.cardCount || 0} cards
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 36,
    textAlign: 'center',
  },
  decksContainer: {
    alignItems: 'center',
  },
  deckButton: {
    backgroundColor: '#1f1f1f',
    borderRadius: 14,
    width: '100%',
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  deckInfo: {
    flex: 1,
  },
  deckTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  deckDescription: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 8,
  },
  deckWordCount: {
    color: '#58cc02',
    fontSize: 14,
    marginTop: 8,
    fontWeight: 'bold',
  },
})