import { useState } from 'react'
import { View, Text, Pressable, StyleSheet, Image, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { loginWithGoogle } from '../../services/auth'
import GoogleIcon from '../../components/icons/GoogleIcon'

export default function SignIn() {
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    const result = await loginWithGoogle()
    if (result.success) {
      router.replace('/(tabs)/learn')
    } else {
      alert('failed to login. please try again.')
    }
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={require('../../assets/images/dudulingo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Repecards</Text>
        <Text style={styles.subtitle}>Expand your vocabulary, conquer new languages.</Text>



        <Pressable
          style={({ pressed }) => [
            styles.googleButton,
            pressed && styles.googleButtonPressed,
          ]}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#1f1f1f" />
          ) : (
            <>
              <GoogleIcon />
              <Text style={styles.googleText}>continue with google</Text>
            </>
          )}
        </Pressable>

        <Text style={styles.footer}>
          by continuing, you agree to our terms of service
        </Text>
      </View>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#121212',
    width: '100%',
    maxWidth: 420,
    paddingVertical: 48,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 24,
  },
  title: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#58cc02',
    marginBottom: 6,
  },
  subtitle: {
    color: '#ccc',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 36,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
    gap: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  googleButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  googleText: {
    color: '#1f1f1f',
    fontSize: 17,
    fontWeight: '600',
  },
  footer: {
    color: '#777',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 28,
  },
})
