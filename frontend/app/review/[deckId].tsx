import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { AppColors } from '../../constants/theme';
import { api } from '../../services/api';
import i18n from '../../services/i18n';
import logger from '../../services/logger';
import { AnswerInput } from './components/AnswerInput';
import { AnswerOptions } from './components/AnswerOptions';
import { FeedbackDisplay } from './components/FeedbackDisplay';
import { QuestionDisplay } from './components/QuestionDisplay';
import { ReviewFooter } from './components/ReviewFooter';
import { styles } from './components/styles';

type QuestionData = {
  cardId: string;
  questionType: string;
  correctAnswer: string;
  imageUrl?: string;
  audioUrl?: string;
  word?: string;
  prompt?: string;
  options?: string[] | { text: string; imageUrl: string }[];
  feedback: {
    word: string;
    translation: string;
    imageUrl?: string;
    audioUrl?: string;
  };
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
    return { transform: [{ rotateY: `${spin}deg` }] };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const spin = interpolate(flipAnimation.value, [0, 1], [180, 360]);
    return { transform: [{ rotateY: `${spin}deg` }] };
  });

  useEffect(() => {
    const startSession = async () => {
      setLoading(true);
      try {
        const sessionData =
          deckId === 'general'
            ? await api.getGeneralReviewSession()
            : await api.getDeckReviewSession(deckId as string);

        if (sessionData.cards && sessionData.cards.length > 0) {
          setSessionCards(sessionData.cards);
        } else {
          Alert.alert(i18n.t('allDone'), i18n.t('noCardsToReview'), [
            { text: 'OK', onPress: () => router.back() },
          ]);
        }
      } catch (error) {
        logger.error('Failed to start session', { error: String(error) });
        Alert.alert(i18n.t('error'), i18n.t('failedToStartSession'), [
          { text: 'OK', onPress: () => router.back() },
        ]);
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
    const rating = !isCorrect
      ? 'very_hard'
      : currentQuestion.questionType?.includes('type_answer')
        ? 'medium'
        : 'easy';

    try {
      await api.submitReview(currentQuestion.cardId, rating);
      const nextIndex = currentQuestionIndex + 1;

      if (nextIndex < sessionCards.length) {
        setCurrentQuestionIndex(nextIndex);
      } else {
        Alert.alert('Session Complete!', "You've finished this review session.", [
          { text: 'OK', onPress: () => router.replace('/(tabs)/learn') },
        ]);
        return;
      }

      setShowResult(false);
      setSelectedAnswer('');
      setTypedAnswer('');
      setIsCorrect(false);
      flipAnimation.value = 0;
    } catch (error) {
      logger.error('Failed to submit review', { error: String(error) });
      Alert.alert(i18n.t('error'), i18n.t('failedToSaveProgress'));
    }
  };

  const getOptionStyle = (optionText: string) => {
    if (!showResult) {
      return {};
    }
  
    const isThisTheCorrectAnswer = optionText.toLowerCase() === currentQuestion?.correctAnswer.toLowerCase();
    const isThisTheSelectedAnswer = optionText === selectedAnswer;

    if (isThisTheCorrectAnswer) {
      return styles.correctOption;
    }
    if (isThisTheSelectedAnswer && !isThisTheCorrectAnswer) {
      return styles.wrongOption;
    }
    return styles.disabledOption;
  };

if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View>
        <Text>No question available.</Text>
      </View>
    )
  }

  const { questionType, options, feedback, ...questionContent } = currentQuestion;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${((currentQuestionIndex + 1) / sessionCards.length) * 100}%` },
            ]}
          />
        </View>
        <Animated.Text style={styles.progressText}>
          {`${i18n.t('card')} ${currentQuestionIndex + 1} ${i18n.t('of')} ${sessionCards.length}`}
        </Animated.Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View>
          <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
            <QuestionDisplay {...questionContent} />
          </Animated.View>
          <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
            {feedback && <FeedbackDisplay feedback={feedback} />}
          </Animated.View>
        </View>

        {questionType?.includes('_mc') && options && (
          <AnswerOptions
            options={options}
            showResult={showResult}
            getOptionStyle={getOptionStyle}
            handleSelectOption={handleSelectOption}
          />
        )}

        {questionType?.includes('type_answer') && (
          <AnswerInput
            typedAnswer={typedAnswer}
            setTypedAnswer={setTypedAnswer}
            showResult={showResult}
          />
        )}
      </ScrollView>

      <ReviewFooter
        showResult={showResult}
        isCorrect={isCorrect}
        questionType={questionType}
        handleNext={handleNext}
        handleCheckTypedAnswer={handleCheckTypedAnswer}
      />
    </View>
  );
}