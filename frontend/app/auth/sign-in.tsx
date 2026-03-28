import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import GoogleIcon from '../../components/icons/GoogleIcon';
import { AppColors } from '../../constants/theme';
import i18n, { setLocale } from '../../services/i18n';

export default function SignIn() {
  const floatY = useSharedValue(0);
  const locale = i18n.locale;

  useEffect(() => {
    floatY.value = withRepeat(
      withTiming(-12, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const handleLogin = () => {
    const redirectUri = window?.location
      ? window.location.origin + '/auth/callback'
      : 'http://localhost:8081/auth/callback';
    const stateData = JSON.stringify({ redirectUri });
    const stateBase64 = btoa(stateData);
    // Force production URL (env not loading on web dev server)
    const apiUrl = 'https://dudulingo-api.onrender.com';
    const googleAuthUrl = apiUrl + '/auth/google?state=' + encodeURIComponent(stateBase64);

    // DEBUG: Log the URLs being used
    console.log('🔍 DEBUG OAuth URLs:');
    console.log('API URL:', apiUrl);
    console.log('Google Auth URL:', googleAuthUrl);
    console.log('Redirect URI:', redirectUri);

    if (typeof window !== 'undefined') {
      window.location.href = googleAuthUrl;
    } else {
      router.push(googleAuthUrl as any);
    }
  };

  const changeLocale = (newLocale: string) => {
    setLocale(newLocale);
    router.replace('/auth/sign-in');
  };

  return (
    <View style={styles.container}>
      <View style={styles.localeRow}>
        <Pressable onPress={() => changeLocale('en')}>
          <Text style={locale === 'en' ? styles.activeLocale : styles.locale}>EN</Text>
        </Pressable>
        <Text style={styles.locale}>|</Text>
        <Pressable onPress={() => changeLocale('pt-BR')}>
          <Text style={locale === 'pt-BR' ? styles.activeLocale : styles.locale}>PT-BR</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Animated.View style={floatingStyle}>
          <Image
            source={require('../../assets/images/repecardsLogo.png')}
            style={styles.logo}
          />
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(200)} style={styles.title}>
          Repecards
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(350)} style={styles.subtitle}>
          {i18n.t('signInSubtitle')}
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(500)} style={{ width: '100%' }}>
          <Pressable
            style={({ pressed }) => [
              styles.googleButton,
              pressed && styles.googleButtonPressed,
            ]}
            onPress={handleLogin}
          >
            <GoogleIcon />
            <Text style={styles.googleButtonText}>{i18n.t('continueWithGoogle')}</Text>
          </Pressable>
        </Animated.View>

        <Text style={styles.terms}>{i18n.t('termsOfService')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  localeRow: {
    position: 'absolute',
    top: 50,
    flexDirection: 'row',
    gap: 12,
  },
  locale: {
    color: AppColors.textMuted,
    fontSize: 15,
  },
  activeLocale: {
    color: AppColors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: AppColors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: AppColors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.white,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  googleButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  googleButtonText: {
    color: AppColors.dark,
    fontSize: 16,
    fontWeight: '600',
  },
  terms: {
    color: AppColors.textDim,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
});
