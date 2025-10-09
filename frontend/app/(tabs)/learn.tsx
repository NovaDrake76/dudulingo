import { router } from 'expo-router';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';

const mockDecks = [
  { id: 'fruits', name: 'Fruits', progress: 20, totalWords: 50, image: "https://www.realfruitpower.com/RealFruit/RealFruitImages/457/image-thumb__457__full-banner/contentimage7-8-2014873623971.42b35659.png" },
  { id: 'animals', name: 'Animals', progress: 45, totalWords: 75, image: "https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg" },
];

const ProgressBar = ({ progress, total }: { progress: number, total: number }) => {
  const percentage = (progress / total) * 100;
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${percentage}%` }]} />
    </View>
  );
};

export default function Learn() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Decks</Text>
      {mockDecks.map((deck) => (
        <View key={deck.id} style={styles.deckContainer}>
          <Image source={{ uri: deck.image }} style={styles.deckImage} />
          <View style={styles.deckInfo}>
            <Text style={styles.deckName}>{deck.name}</Text>
            <Text style={styles.deckProgress}>
              You learned {deck.progress} of {deck.totalWords} words
            </Text>
            <ProgressBar progress={deck.progress} total={deck.totalWords} />
            <Pressable style={styles.button} onPress={() => router.push(`../review/${deck.id}`)}>
              <Text style={styles.buttonText}>Start Learning</Text>
            </Pressable>
          </View>
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
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#58cc02',
    marginBottom: 36,
    textAlign: 'center',
  },
  deckContainer: {
    backgroundColor: '#121212',
    borderRadius: 14,
    marginBottom: 20,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  deckImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  deckInfo: {
    flex: 1,
  },
  deckName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  deckProgress: {
    color: '#ccc',
    fontSize: 14,
    marginVertical: 8,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    marginBottom: 15,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#58cc02',
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#58cc02',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
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
    alignItems: 'center',
  },
  addButtonText: {
    color: '#58cc02',
    fontSize: 18,
    fontWeight: 'bold',
  },
});