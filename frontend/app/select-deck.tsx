import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { View, Text, Pressable, StyleSheet, Image, ScrollView } from 'react-native';

const decks = [
  {
    id: 'fruits',
    name: 'Fruits',
    wordCount: 50,
    image: "https://www.realfruitpower.com/RealFruit/RealFruitImages/457/image-thumb__457__full-banner/contentimage7-8-2014873623971.42b35659.png",
  },
  {
    id: 'animals',
    name: 'Animals',
    wordCount: 75,
    image: "https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg",
  },
];

export default function SelectDeck() {
  const handleSelectDeck = async (deckId: string) => {
    console.log('User selected deck:', deckId);
    await AsyncStorage.setItem('selectedDeck', deckId);
    router.replace(`/(tabs)/learn`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a deck to start learning!</Text>
      <ScrollView contentContainerStyle={styles.decksContainer}>
        {decks.map((deck) => (
          <Pressable
            key={deck.id}
            style={styles.deckButton}
            onPress={() => handleSelectDeck(deck.id)}>
            <View style={styles.deckInfo}>
              <Text style={styles.deckTitle}>{deck.name}</Text>
              <Text style={styles.deckWordCount}>{deck.wordCount} words</Text>
            </View>
            <Image source={{ uri: deck.image }} style={styles.deckImage} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    paddingTop: 80,
    paddingHorizontal: 24,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  deckWordCount: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 8,
  },
  deckImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
});