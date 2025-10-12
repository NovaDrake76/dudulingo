import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import GoogleIcon from '../../components/icons/GoogleIcon';
import { loginWithGoogle } from '../../services/auth';
import i18n, { setLocale } from '../../services/i18n';

export default function SignIn() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const result = await loginWithGoogle();
    if (!result.success) {
      alert(result.error || 'Failed to login. Please try again.');
      setLoading(false);
    }
    // On success, the app will navigate via the callback handler,
    // so we don't need to do anything here.
  };

  const changeLocale = (locale: string) => {
    setLocale(locale);
    router.replace('/auth/sign-in');
  };

  return (
    <View style={styles.container}>
      <View style={styles.languageSelector}>
        <Pressable onPress={() => changeLocale('en')}>
          <Text style={i18n.locale === 'en' ? styles.activeLanguage : styles.language}>EN</Text>
        </Pressable>
        <Text style={styles.language}>|</Text>
        <Pressable onPress={() => changeLocale('pt-BR')}>
          <Text style={i18n.locale === 'pt-BR' ? styles.activeLanguage : styles.language}>PT-BR</Text>
        </Pressable>
      </View>
      <View style={styles.card}>
        <Image
          source={require('../../assets/images/dudulingo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>{i18n.t('signInTitle')}</Text>
        <Text style={styles.subtitle}>{i18n.t('signInSubtitle')}</Text>

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
              <Text style={styles.googleText}>{i18n.t('continueWithGoogle')}</Text>
            </>
          )}
        </Pressable>

        <Text style={styles.footer}>
          {i18n.t('termsOfService')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  language: {
    color: '#ccc',
    fontSize: 16,
    marginHorizontal: 10,
  },
  activeLanguage: {
    color: '#58cc02',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
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
});