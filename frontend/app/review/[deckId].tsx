import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { api } from '../../services/api'

type QuestionData = {
  cardId: string
  questionType: string
  correctAnswer: string
  imageUrl?: string
  word?: string
  translation?: string
  options?: string[] | { text: string; imageUrl: string }[]
}

export default function Review() {
  const { deckId } = useLocalSearchParams()
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [typedAnswer, setTypedAnswer] = useState<string>('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [loading, setLoading] = useState(true)
  const [cardsReviewed, setCardsReviewed] = useState(0)

  const loadNextQuestion = async () => {
    setLoading(true)
    setShowResult(false)
    setSelectedAnswer('')
    setTypedAnswer('')

    try {
      const questionData = await api.getNextReviewCard()
      if (questionData.message) {
        // no more cards
        router.back()
        return
      }
      setCurrentQuestion(questionData)
    } catch (error) {
      console.error('Failed to load question:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNextQuestion()
  }, [])

  const handleAnswer = () => {
    if (!currentQuestion) return

    let userAnswer = ''
    
    if (currentQuestion.questionType.includes('type_answer')) {
      userAnswer = typedAnswer.trim().toLowerCase()
    } else {
      userAnswer = selectedAnswer
    }

    const correct = userAnswer === currentQuestion.correctAnswer.toLowerCase()
    setIsCorrect(correct)
    setShowResult(true)
  }

  const handleNext = async () => {
    if (!currentQuestion) return

    // submit the answer with rating (5 = correct, 0 = incorrect)
    const rating = isCorrect ? 5 : 0
    
    try {
      await api.submitReview(currentQuestion.cardId, rating)
      setCardsReviewed(prev => prev + 1)
      
      // load next question
      loadNextQuestion()
    } catch (error) {
      console.error('Failed to submit review:', error)
    }
  }

  const renderQuestion = () => {
    if (!currentQuestion) return null

    const { questionType, imageUrl, word, translation, options } = currentQuestion

    return (
      <View style={styles.questionContainer}>
        {/* Show image if question type includes image */}
        {questionType.includes('image') && imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.questionImage} />
        )}

        {/* Show word if needed */}
        {questionType.includes('word') && word && !questionType.includes('image_word') && (
          <Text style={styles.questionWord}>{word}</Text>
        )}

        {/* Show translation if needed */}
        {questionType.includes('translation') && translation && (
          <Text style={styles.questionTranslation}>{translation}</Text>
        )}

        {/* Multiple choice options */}
        {questionType.includes('multiple_choice') && options && (
          <View style={styles.optionsContainer}>
            {options.map((option, index) => {
              const isImageOption = typeof option === 'object' && 'imageUrl' in option
              const optionText = isImageOption ? option.text : option
              const optionImage = isImageOption ? option.imageUrl : null

              return (
                <Pressable
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedAnswer === optionText && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedAnswer(optionText)}
                  disabled={showResult}
                >
                  {optionImage && (
                    <Image source={{ uri: optionImage }} style={styles.optionImage} />
                  )}
                  <Text style={styles.optionText}>{optionText}</Text>
                </Pressable>
              )
            })}
          </View>
        )}

        {/* Type answer input */}
        {questionType.includes('type_answer') && (
          <TextInput
            style={styles.input}
            placeholder="Type your answer..."
            placeholderTextColor="#888"
            value={typedAnswer}
            onChangeText={setTypedAnswer}
            editable={!showResult}
            autoCapitalize="none"
            autoCorrect={false}
          />
        )}
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#58cc02" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progressText}>Cards reviewed: {cardsReviewed}</Text>
      </View>

      {renderQuestion()}

      {showResult && (
        <View style={[styles.resultContainer, isCorrect ? styles.correctResult : styles.wrongResult]}>
          <Text style={styles.resultText}>
            {isCorrect ? '✓ Correct!' : '✗ Wrong!'}
          </Text>
          <Text style={styles.correctAnswerText}>
            Correct answer: {currentQuestion?.correctAnswer}
          </Text>
        </View>
      )}

      {!showResult ? (
        <Pressable style={styles.submitButton} onPress={handleAnswer}>
          <Text style={styles.submitButtonText}>Check Answer</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionImage: {
    width: 250,
    height: 250,
    borderRadius: 12,
    marginBottom: 30,
  },
  questionWord: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  questionTranslation: {
    fontSize: 24,
    color: '#ccc',
    marginBottom: 30,
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
  },
  selectedOption: {
    backgroundColor: '#58cc02',
  },
  optionImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
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
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  resultContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  correctResult: {
    backgroundColor: '#58cc02',
  },
  wrongResult: {
    backgroundColor: '#ff4b4b',
  },
  resultText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  correctAnswerText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#58cc02',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#1cb0f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
})