import { router, useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { api } from '../../services/api'
import i18n from '../../services/i18n'

type UserStats = {
  totalWords: number
  masteredWords: number
  learningWords: number
}

export default function Learn() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    try {
      const userStats = await api.getUserStats()
      setStats(userStats)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadStats()
    }, [])
  )

  const handleStartReview = async () => {
    try {
      router.push('../review/general')
    } catch (error) {
      console.error('Failed to start review:', error)
      Alert.alert('Error', 'Failed to start review')
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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{i18n.t('yourProgress')}</Text>

      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalWords}</Text>
            <Text style={styles.statLabel}>{i18n.t('totalWords')}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, styles.masteredColor]}>{stats.masteredWords}</Text>
            <Text style={styles.statLabel}>{i18n.t('mastered')}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, styles.learningColor]}>{stats.learningWords}</Text>
            <Text style={styles.statLabel}>{i18n.t('learning')}</Text>
          </View>
        </View>
      )}

      <View style={styles.actionsContainer}>
        <Pressable style={styles.primaryButton} onPress={handleStartReview}>
          <Text style={styles.primaryButtonText}>{i18n.t('startReview')}</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push('/select-deck')}
        >
          <Text style={styles.secondaryButtonText}>{i18n.t('addNewDeck')}</Text>
        </Pressable>
      </View>

      {stats && stats.totalWords === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {i18n.t('noDecks')}
          </Text>
          <Text style={styles.emptyStateSubtext}>
            {i18n.t('noDecksSubtitle')}
          </Text>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#58cc02',
    marginBottom: 36,
    marginTop: 60,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  statCard: {
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 20,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  masteredColor: {
    color: '#58cc02',
  },
  learningColor: {
    color: '#1cb0f6',
  },
  statLabel: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
  },
  actionsContainer: {
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#58cc02',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#58cc02',
  },
  secondaryButtonText: {
    color: '#58cc02',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
  },
})