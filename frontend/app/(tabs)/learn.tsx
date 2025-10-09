import { router } from 'expo-router';
import { View, Text, Pressable, StyleSheet } from 'react-native';

const mockDecks = [
  { id: 'fruits', name: 'Fruits', progress: 0 },
  { id: 'animals', name: 'Animals', progress: 0 },
];

export default function Learn() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Decks</Text>
      {mockDecks.map((deck) => (
        <View key={deck.id} style={styles.deckContainer}>
          <Text style={styles.deckName}>{deck.name}</Text>
          <Text style={styles.deckProgress}>
            You learned {deck.progress} words from this deck
          </Text>
          <Pressable style={styles.button} onPress={() => router.push(`../review/${deck.id}`)}>
            <Text style={styles.buttonText}>Start Learning</Text>
          </Pressable>
        </View>
      ))}
      <Pressable style={styles.addButton} onPress={() => router.push('/select-deck')}>
        <Text style={styles.addButtonText}>Add New Deck</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#58cc02',
    marginBottom: 36,
  },
  deckContainer: {
    backgroundColor: '#121212',
    padding: 20,
    borderRadius: 14,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  deckName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  deckProgress: {
    color: '#ccc',
    fontSize: 16,
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#58cc02',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    marginTop: 20,
    backgroundColor: '#1f1f1f',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  addButtonText: {
    color: '#58cc02',
    fontSize: 18,
    fontWeight: 'bold',
  },
});