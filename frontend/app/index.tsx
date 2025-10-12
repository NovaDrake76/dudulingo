import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { api } from '../services/api'

WebBrowser.maybeCompleteAuthSession()

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'

export default function Index() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const isAuthenticated = await api.checkAuth()
      if (isAuthenticated) {
        // check if user has selected language
        const selectedLanguage = await AsyncStorage.getItem('selectedLanguage')
        if (!selectedLanguage) {
          router.replace('/auth/select-language')
          return
        }

        // check if user has selected a deck
        const selectedDeck = await AsyncStorage.getItem('selectedDeck')
        if (!selectedDeck) {
          router.replace('/select-deck')
          return
        }

        // user is fully onboarded, go to learn page
        router.replace('/(tabs)/learn')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const result = await WebBrowser.openAuthSessionAsync(
        `${API_URL}/auth/google`,
        'dudulingo://auth/callback'
      )

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url)
        const token = url.searchParams.get('token')
        
        if (token) {
          await api.saveAuthToken(token)
          router.replace('/auth/select-language')
        }
      }
    } catch (error) {
      console.error('Login failed:', error)
    }
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
      <Text style={styles.logo}>Dudulingo</Text>
      <Text style={styles.tagline}>Learn languages the fun way!</Text>

      <Pressable style={styles.googleButton} onPress={handleGoogleLogin}>
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#58cc02',
    marginBottom: 16,
  },
  tagline: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 60,
    textAlign: 'center',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
})