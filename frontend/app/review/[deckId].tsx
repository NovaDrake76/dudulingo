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
import i18n from '../../services/i18n';

type QuestionData = {
  cardId: string;
  questionType: string;
  correctAnswer: string;
  imageUrl?: string;
  word?: string;
  prompt?: string;
  options?: string[] | { text: string; imageUrl: string }[];
  feedback: {
    word: string;
    translation: string;
    imageUrl?: string;
  }
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
          Alert.alert(i18n.t('allDone'), i18n.t('noCardsToReview'), [{ text: "OK", onPress: () => router.back() }]);
        }
      } catch (error) {
        console.error('Failed to start session:', error);
        Alert.alert(i18n.t('error'), i18n.t('failedToStartSession'), [{ text: "OK", onPress: () => router.back() }]);
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
        Alert.alert(
          "Session Complete!",
          "You've finished this review session.",
          [{ text: "OK", onPress: () => router.replace('/(tabs)/learn') }]
        );
        return;
      }

      setShowResult(false);
      setSelectedAnswer('');
      setTypedAnswer('');
      setIsCorrect(false);
      flipAnimation.value = 0;

    } catch (error) {
      console.error('Failed to submit review:', error);
      Alert.alert(i18n.t('error'), i18n.t('failedToSaveProgress'));
    }
  };

  // updated logic for option coloring
  const getOptionStyle = (optionText: string) => {
    if (!showResult) {
      return {}; // default style before answer is submitted
    }

    const isCorrectAnswer = optionText.toLowerCase() === currentQuestion?.correctAnswer.toLowerCase();
    const isSelectedAnswer = optionText === selectedAnswer;

    // if user selected this option
    if (isSelectedAnswer) {
      if (isCorrectAnswer) {
        // correct answer selected
        return styles.correctOption;
      } else {
        // wrong answer selected
        return styles.wrongOption;
      }
    }

    // if user selected a wrong answer, show the correct one in green
    if (!isCorrect && isCorrectAnswer) {
      return styles.correctOption;
    }

    // all other options remain default (dimmed)
    return styles.disabledOption;
  };

  const renderQuestionContent = () => {
    if (!currentQuestion) return null;
    const { imageUrl, word, prompt } = currentQuestion;

    return (
      <View style={styles.questionContentContainer}>
        <Text style={styles.questionTitle}>{prompt}</Text>
        {imageUrl && <Image source={{ uri: imageUrl }} style={styles.questionImage} />}
        {word && <Text style={styles.questionWord}>{word}</Text>}
      </View>
    );
  };

  const renderFeedbackContent = () => {
    if (!currentQuestion || !currentQuestion.feedback) {
      // If the question or its feedback object doesn't exist, render nothing to prevent a crash.
      return null;
    }
    const { feedback } = currentQuestion;
    return (
      <View style={styles.feedbackCard}>
        <Text style={styles.feedbackTitle}>{i18n.t('correctAnswer')}</Text>
        {feedback.imageUrl && <Image source={{ uri: feedback.imageUrl }} style={styles.feedbackImage} />}
        <Text style={styles.feedbackWord}>{feedback.word}</Text>
        <Text style={styles.feedbackTranslation}>{feedback.translation}</Text>
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
        <Text style={styles.progressText}>{i18n.t('card')} {currentQuestionIndex + 1} {i18n.t('of')} {sessionCards.length}</Text>
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

        {questionType?.includes('_mc') && options && (
          <View style={styles.optionsContainer}>
            {options.map((option, index) => {
              const isImageOption = typeof option === 'object' && 'imageUrl' in option;
              const optionText = isImageOption ? option.text : (option as string);
              const optionImage = isImageOption ? option.imageUrl : null;
              const displayLabel = isImageOption ? '' : optionText;

              return (
                <Pressable
                  key={index}
                  style={[styles.optionButton, getOptionStyle(optionText), isImageOption && styles.imageOptionButton]}
                  onPress={() => handleSelectOption(optionText)}
                  disabled={showResult}
                >
                  {optionImage && <Image source={{ uri: optionImage }} style={styles.optionImage} />}
                  {displayLabel ? <Text style={styles.optionText}>{displayLabel}</Text> : null}
                </Pressable>
              );
            })}
          </View>
        )}

        {questionType?.includes('type_answer') && (
          <TextInput
            style={styles.input}
            placeholder={i18n.t('typeYourAnswer')}
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
            <Text style={styles.footerButtonText}>{i18n.t('next')}</Text>
          </Pressable>
        ) : questionType?.includes('type_answer') && (
          <Pressable style={styles.footerButton} onPress={handleCheckTypedAnswer}>
            <Text style={styles.footerButtonText}>{i18n.t('checkAnswer')}</Text>
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  optionButton: {
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#333',
    width: '48%',
  },
  imageOptionButton: {
    padding: 8,
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
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  optionText: {
    color: '#fff',
    fontSize: 18,
    flex: 1,
    textAlign: 'center'
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
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
  },
  feedbackWord: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  feedbackTranslation: {
    color: '#ccc',
    fontSize: 22,
  },
});
