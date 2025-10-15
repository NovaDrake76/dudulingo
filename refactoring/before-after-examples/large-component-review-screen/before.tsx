import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { api } from '../../services/api';

type QuestionData = {
  cardId: string;
  questionType: string;
  correctAnswer: string;
  imageUrl?: string;
  word?: string;
  prompt?: string;
  options?: string[] | { text: string; imageUrl: string }[];
};

export default function Review() {
  const { deckId } = useLocalSearchParams();
  
  const [sessionCards, setSessionCards] = useState<QuestionData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [typedAnswer, setTypedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);

  const flipAnimation = useSharedValue(0);

  const currentQuestion = sessionCards[currentQuestionIndex];

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const spin = interpolate(flipAnimation.value, [0, 1], [0, 180]);
    return {
      transform: [{ rotateY: `${spin}deg` }],
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const spin = interpolate(flipAnimation.value, [0, 1], [180, 360]);
    return {
      transform: [{ rotateY: `${spin}deg` }],
    };
  });

  useEffect(() => {
    const startSession = async () => {
      setLoading(true);
      try {
        const sessionData = deckId === 'general'
          ? await api.getGeneralReviewSession()
          : await api.getDeckReviewSession(deckId as string);

        if (sessionData.cards && sessionData.cards.length > 0) {
          setSessionCards(sessionData.cards);
        } else {
          Alert.alert("All done!", "You have no cards to review at the moment.", [{ text: "OK", onPress: () => router.back() }]);
        }
      } catch (error) {
        console.error('Failed to start session:', error);
        Alert.alert("Error", "Could not start the review session.", [{ text: "OK", onPress: () => router.back() }]);
      } finally {
        setLoading(false);
      }
    };

    startSession();
  }, [deckId]);


  const checkAnswer = (answer: string) => {
    if (!currentQuestion) return;
    const isAnswerCorrect = answer.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);

    if (!isAnswerCorrect) {
      flipAnimation.value = withTiming(1, { duration: 500 });
    }
  };

  const handleSelectOption = (option: string) => {
    if (showResult) return;
    setSelectedAnswer(option);
    checkAnswer(option);
  };
  
  const handleCheckTypedAnswer = () => {
    if (showResult) return;
    checkAnswer(typedAnswer);
  };


  const handleNext = async () => {
    if (!currentQuestion) return;

    const rating = isCorrect ? 'easy' : 'very_hard';
    
    try {
      await api.submitReview(currentQuestion.cardId, rating);
      
      const nextIndex = currentQuestionIndex + 1;
        
      if (nextIndex < sessionCards.length) {
          setCurrentQuestionIndex(nextIndex);
      } else {
          router.back();
          return;
      }
      
      setShowResult(false);
      setSelectedAnswer('');
      setTypedAnswer('');
      setIsCorrect(false);
      flipAnimation.value = 0;

    } catch (error) {
      console.error('Failed to submit review:', error);
      Alert.alert('Error', 'Could not save your progress. Please try again.');
    }
  };

  const getOptionStyle = (optionText: string) => {
    if (!showResult) return {};

    const isCorrectAnswer = optionText.toLowerCase() === currentQuestion?.correctAnswer.toLowerCase();
    const isSelectedAnswer = optionText === selectedAnswer;

    if (isCorrectAnswer) return styles.correctOption;
    if (isSelectedAnswer && !isCorrect) return styles.wrongOption;
    
    return styles.disabledOption;
  };

  const renderQuestionContent = () => {
    if (!currentQuestion) return null;
    const { questionType, imageUrl, word, prompt } = currentQuestion;
    
    let title = 'Translate this word:';
    if (questionType?.includes('image_type_answer')) {
      title = 'What is this in English?';
    } else if (questionType?.includes('image')) {
      title = 'What is this?';
    }


    return (
      <View style={styles.questionContentContainer}>
        <Text style={styles.questionTitle}>{title}</Text>
        {imageUrl && !questionType.includes('word_multiple_choice_image') && <Image source={{ uri: imageUrl }} style={styles.questionImage} />}
        {word && <Text style={styles.questionWord}>{word}</Text>}
        {prompt && !questionType.includes('image_word_multiple_choice') && <Text style={styles.questionTranslation}>{prompt}</Text>}
      </View>
    );
  };

  const renderFeedbackContent = () => {
    if (!currentQuestion) return null;
    return (
      <View style={styles.feedbackCard}>
        <Text style={styles.feedbackTitle}>Correct Answer:</Text>
        {currentQuestion.imageUrl && <Image source={{ uri: currentQuestion.imageUrl }} style={styles.feedbackImage} />}
        <Text style={styles.feedbackWord}>{currentQuestion.correctAnswer}</Text>
        <Text style={styles.feedbackTranslation}>{currentQuestion.prompt}</Text>
      </View>
    );
  };

  if (loading || !currentQuestion) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#58cc02" />
      </View>
    );
  }

  const { questionType, options } = currentQuestion;

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.progressText}>Card {currentQuestionIndex + 1} of {sessionCards.length}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View>
            <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
              {renderQuestionContent()}
            </Animated.View>
            <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
              {renderFeedbackContent()}
            </Animated.View>
          </View>

          {questionType?.includes('multiple_choice') && options && (
            <View style={styles.optionsContainer}>
              {options.map((option, index) => {
                const isImageOption = typeof option === 'object' && 'imageUrl' in option;
                const optionText = isImageOption ? option.text : (option as string);
                const optionImage = isImageOption ? option.imageUrl : null;

                return (
                  <Pressable
                    key={index}
                    style={[styles.optionButton, getOptionStyle(optionText)]}
                    onPress={() => handleSelectOption(optionText)}
                    disabled={showResult}
                  >
                    {optionImage && <Image source={{ uri: optionImage }} style={styles.optionImage} />}
                    <Text style={styles.optionText}>{optionText}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {questionType?.includes('type_answer') && (
            <TextInput
              style={styles.input}
              placeholder="Type your answer"
              placeholderTextColor="#777"
              value={typedAnswer}
              onChangeText={setTypedAnswer}
              editable={!showResult}
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}
        </ScrollView>
        <View style={styles.footer}>
            {showResult ? (
              <Pressable 
                style={[styles.footerButton, isCorrect ? styles.correctButton : styles.wrongButton]} 
                onPress={handleNext}
              >
                <Text style={styles.footerButtonText}>Next</Text>
              </Pressable>
            ) : questionType?.includes('type_answer') && (
              <Pressable style={styles.footerButton} onPress={handleCheckTypedAnswer}>
                <Text style={styles.footerButtonText}>Check Answer</Text>
              </Pressable>
            )}
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0e0e0e',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 10,
    alignItems: 'center',
  },
  progressText: {
    color: '#aaa',
    fontSize: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  card: {
    width: '100%',
    minHeight: 300,
    backgroundColor: '#1f1f1f',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backfaceVisibility: 'hidden',
  },
  cardFront: {},
  cardBack: {
    position: 'absolute',
    top: 0,
  },
  questionContentContainer: {
    alignItems: 'center',
  },
  questionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  questionImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
  },
  questionWord: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  questionTranslation: {
    fontSize: 24,
    color: '#ccc',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  optionsContainer: {
    width: '100%',
    marginTop: 20,
  },
  optionButton: {
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  correctOption: {
    backgroundColor: 'rgba(88, 204, 2, 0.2)',
    borderColor: '#58cc02',
  },
  wrongOption: {
    backgroundColor: 'rgba(255, 75, 75, 0.2)',
    borderColor: '#ff4b4b',
  },
  disabledOption: {
    opacity: 0.5,
  },
  optionImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 16,
  },
  optionText: {
    color: '#fff',
    fontSize: 18,
    flex: 1,
  },
  input: {
    width: '100%',
    backgroundColor: '#1f1f1f',
    color: '#fff',
    fontSize: 18,
    padding: 20,
    borderRadius: 12,
    textAlign: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#333',
  },
  footer: {
    paddingVertical: 10,
    minHeight: 80,
  },
  footerButton: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    backgroundColor: '#58cc02',
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  correctButton: {
    backgroundColor: '#58cc02',
  },
  wrongButton: {
    backgroundColor: '#ff4b4b',
  },
  feedbackCard: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%'
  },
  feedbackTitle: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 16,
  },
  feedbackImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 12,
  },
  feedbackWord: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  feedbackTranslation: {
    color: '#ccc',
    fontSize: 18,
  },
});