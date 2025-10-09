import { router } from 'expo-router';
import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

// mock data for cards with different types and knowledge levels
const mockCards = [
  {
    id: '1',
    type: 'multiple_choice',
    prompt: 'Apple',
    options: ['Maçã', 'Banana', 'Uva', 'Laranja'],
    answer: 'Maçã',
    image: "https://www.realfruitpower.com/RealFruit/RealFruitImages/457/image-thumb__457__full-banner/contentimage7-8-2014873623971.42b35659.png",
  },
  {
    id: '2',
    type: 'multiple_choice',
    prompt: 'Banana',
    options: ['Laranja', 'Banana', 'Pera', 'Maçã'],
    answer: 'Banana',
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyOnpln-YaRi-maL_UHOgcUYXrnr6RZPMMlw&s",
  },
  {
    id: '3',
    type: 'type_answer',
    prompt: 'strawberry',
    answer: 'Morango',
    image: null, // no image for higher level
  },
  {
    id: '4',
    type: 'type_answer',
    prompt: null, // no word prompt, only image
    answer: 'Melancia',
    image: "https://cdn.awsli.com.br/2500x2500/681/681419/produto/314521622/melancia-2-n5w8wts5yx.jpeg"
  },
];

export default function ReviewDeck() {
  const [cardIndex, setCardIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');

  const handleAnswer = (answer: string) => {
    const isCorrect = answer.toLowerCase() === mockCards[cardIndex].answer.toLowerCase();
    console.log(`Answer for card ${mockCards[cardIndex].id} is ${isCorrect ? 'correct' : 'incorrect'}`);

    // a small delay to show feedback before the next card
    setTimeout(() => {
      if (cardIndex < mockCards.length - 1) {
        setCardIndex(cardIndex + 1);
        setInputValue('');
      } else {
        alert('Deck finished!');
        router.back();
      }
    }, 300);
  };

  const currentCard = mockCards[cardIndex];

 return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0e0e0e' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.card}>
              {currentCard.image && <Image source={
    { uri: currentCard.image }
              } style={styles.cardImage} />}
              {currentCard.prompt && <Text style={styles.prompt}>{currentCard.prompt}</Text>}
            </View>

            {currentCard.type === 'multiple_choice' && (
              <View style={styles.optionsContainer}>
                {currentCard.options?.map((option) => (
                  <Pressable
                    key={option}
                    style={styles.optionButton}
                    onPress={() => handleAnswer(option)}>
                    <Text style={styles.optionText}>{option}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {currentCard.type === 'type_answer' && (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Type your answer"
                  placeholderTextColor="#888"
                  value={inputValue}
                  onChangeText={setInputValue}
                />
                <Pressable style={styles.checkButton} onPress={() => handleAnswer(inputValue)}>
                  <Text style={styles.checkButtonText}>Check</Text>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#1f1f1f',
    borderRadius: 20,
    width: '100%',
    height: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginBottom: 40,
  },
  cardImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  prompt: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  optionButton: {
    backgroundColor: '#1f1f1f',
    width: '48%',
    paddingVertical: 24,
    borderRadius: 14,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#1f1f1f',
    color: '#fff',
    width: '100%',
    padding: 20,
    borderRadius: 14,
    fontSize: 18,
    textAlign: 'center',
  },
  checkButton: {
    backgroundColor: '#58cc02',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 14,
    marginTop: 24,
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});