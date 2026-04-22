import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ComponentProps, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Theme } from '../../constants/theme';
import { currentStreak, windowSinceMs } from '../../services/activity';
import { api } from '../../services/api';
import i18n from '../../services/i18n';
import logger from '../../services/logger';
import { beginReviewSession, endReviewSession } from '../../services/packs/installer';
import type { QuestionData } from '../../services/review/questionGenerator';
import { AnswerInput } from './components/AnswerInput';
import { AnswerOptions } from './components/AnswerOptions';
import { FeedbackDisplay } from './components/FeedbackDisplay';
import { QuestionDisplay } from './components/QuestionDisplay';
import { ReviewFooter } from './components/ReviewFooter';
import { SessionComplete } from './components/SessionComplete';
import { styles } from './components/styles';

type MissedEntry = { word: string; translation: string; miss: number };

export default function Review() {
  const { deckId } = useLocalSearchParams();
  const [sessionCards, setSessionCards] = useState<QuestionData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [typedAnswer, setTypedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [missedMap, setMissedMap] = useState<Map<string, MissedEntry>>(new Map());
  const startTimeRef = useRef<number>(Date.now());
  const endTimeRef = useRef<number | null>(null);
  const [deckName, setDeckName] = useState<string | undefined>(undefined);
  const preSessionStreakRef = useRef<number>(0);

  const currentQuestion = sessionCards[currentQuestionIndex];

  useEffect(() => {
    const startSession = async () => {
      setLoading(true);
      startTimeRef.current = Date.now();
      beginReviewSession();
      try {
        // Snapshot the streak before we log any new events so we can tell
        // the user whether this session actually extended it.
        try {
          const priorEvents = await api.getActivitySince(windowSinceMs(60));
          preSessionStreakRef.current = currentStreak(priorEvents);
        } catch {
          preSessionStreakRef.current = 0;
        }

        if (deckId && deckId !== 'general') {
          try {
            const deck = await api.getDeck(deckId as string);
            setDeckName(deck?.name);
          } catch {
            // non-fatal
          }
        }
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
    return () => {
      endReviewSession();
    };
  }, [deckId]);

  const checkAnswer = (answer: string) => {
    if (!currentQuestion) return;
    const isAnswerCorrect =
      answer.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);

    if (isAnswerCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      setMissedMap((prev) => {
        const next = new Map(prev);
        const key = currentQuestion.correctAnswer;
        const existing = next.get(key);
        const translation =
          (currentQuestion.feedback?.translation as string) ||
          (currentQuestion as any).prompt ||
          (currentQuestion as any).word ||
          '';
        next.set(key, {
          word: key,
          translation,
          miss: (existing?.miss ?? 0) + 1,
        });
        return next;
      });
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
        setShowResult(false);
        setSelectedAnswer('');
        setTypedAnswer('');
        setIsCorrect(false);
      } else {
        endTimeRef.current = Date.now();
        setCompleted(true);
      }
    } catch (error) {
      logger.error('Failed to submit review', { error: String(error) });
      Alert.alert(i18n.t('error'), i18n.t('failedToSaveProgress'));
    }
  };

  const getOptionStyle = (optionText: string) => {
    if (!showResult) return {};
    if (!currentQuestion) return {};
    const isThisTheCorrectAnswer =
      optionText.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
    const isThisTheSelectedAnswer = optionText === selectedAnswer;

    if (isThisTheCorrectAnswer) return styles.correctOption;
    if (isThisTheSelectedAnswer && !isThisTheCorrectAnswer) return styles.wrongOption;
    return styles.disabledOption;
  };

  const missedList = useMemo(() => Array.from(missedMap.values()), [missedMap]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.ink} />
      </View>
    );
  }

  if (completed) {
    const duration = (endTimeRef.current ?? Date.now()) - startTimeRef.current;
    return (
      <SessionCompleteWithStreak
        totalQuestions={sessionCards.length}
        correctCount={correctCount}
        durationMs={duration}
        missed={missedList}
        deckName={deckName}
        preSessionStreak={preSessionStreakRef.current}
        onDone={() => router.replace('/(tabs)/learn')}
        onReviewMore={() => router.replace('/select-deck')}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <Text>{i18n.t('noCardsToReview')}</Text>
      </View>
    );
  }

  const { questionType, options, feedback, ...questionContent } = currentQuestion;
  const progress = (currentQuestionIndex + (showResult ? 1 : 0)) / sessionCards.length;
  const isTyped = questionType?.includes('type_answer');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.closeBtn}
          hitSlop={8}
        >
          <Ionicons name="close" size={18} color={Theme.ink} />
        </Pressable>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentQuestionIndex + 1} / {sessionCards.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.kicker}>
          {isTyped ? i18n.t('typeYourAnswer').toUpperCase() : 'TRANSLATE'}
        </Text>

        {isTyped ? (
          <>
            <Text style={styles.typedPrompt}>
              {(questionContent as any).word || (questionContent as any).prompt || ''}
            </Text>
            {(questionContent as any).prompt ? (
              <Text style={styles.typedMeta}>{(questionContent as any).prompt}</Text>
            ) : null}
            <AnswerInput
              typedAnswer={typedAnswer}
              setTypedAnswer={setTypedAnswer}
              showResult={showResult}
            />
          </>
        ) : (
          <View style={styles.questionCard}>
            <QuestionDisplay {...(questionContent as any)} />
          </View>
        )}

        {!isTyped && options && (
          <AnswerOptions
            options={options}
            showResult={showResult}
            correctAnswer={currentQuestion.correctAnswer}
            selectedAnswer={selectedAnswer}
            getOptionStyle={getOptionStyle}
            handleSelectOption={handleSelectOption}
          />
        )}
      </ScrollView>

      {showResult ? (
        <FeedbackDisplay
          isCorrect={isCorrect}
          correctAnswer={currentQuestion.correctAnswer}
          translation={feedback?.translation}
          onContinue={handleNext}
        />
      ) : (
        <ReviewFooter
          questionType={questionType ?? ''}
          handleCheckTypedAnswer={handleCheckTypedAnswer}
        />
      )}
    </View>
  );
}

/**
 * Wraps SessionComplete to fetch the post-session streak. Split out so the
 * main screen's hook list stays stable across renders.
 */
function SessionCompleteWithStreak({
  preSessionStreak,
  ...props
}: Omit<ComponentProps<typeof SessionComplete>, 'streakDays' | 'streakExtended'> & {
  preSessionStreak: number;
}) {
  const [streakDays, setStreakDays] = useState(preSessionStreak);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const recent = await api.getActivitySince(windowSinceMs(60));
        if (cancelled) return;
        setStreakDays(currentStreak(recent));
      } catch (error) {
        logger.error('Failed to read post-session streak', { error: String(error) });
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SessionComplete
      {...props}
      streakDays={streakDays}
      streakExtended={loaded && streakDays > preSessionStreak}
    />
  );
}
