import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { api } from '../services/api'
import { loginWithGoogle } from '../services/auth'

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
    const result = await loginWithGoogle();
    if (result.success) {
      router.replace('/auth/select-language');
    } else {
      console.error('Login failed:', result.error);
    }
  };

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