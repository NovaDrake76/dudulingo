import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppColors } from '../../constants/theme';
import { api } from '../../services/api';
import i18n, { setLocale } from '../../services/i18n';
import logger from '../../services/logger';

type User = {
  _id: string;
  name: string;
  selectedLanguage?: string | null;
};

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [locale, setLocaleState] = useState(i18n.locale);

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await api.getMe();
      setUser(userData);
    } catch (error) {
      logger.error('Failed to load user data', { error: String(error) });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData])
  );

  const handleResetProgress = () => {
    Alert.alert(
      'Reset progress?',
      'This will delete all your review progress. Installed language packs and cards stay. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.resetAllProgress();
              Alert.alert('Done', 'Your progress has been reset.');
            } catch (error) {
              logger.error('Failed to reset progress', { error: String(error) });
              Alert.alert('Error', 'Could not reset progress.');
            }
          },
        },
      ],
    );
  };

  const changeLocale = (newLocale: string) => {
    setLocale(newLocale);
    setLocaleState(newLocale);
  };

  const getLanguageName = (code?: string | null) => {
    if (code === 'en') return 'English';
    if (code === 'pt-BR') return 'Português';
    if (code === 'it') return 'Italiano';
    if (code === 'de') return 'Deutsch';
    return 'Not set';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarPlaceholderText}>{user?.name?.[0] ?? 'L'}</Text>
      </View>
      <Text style={styles.name}>{user?.name ?? 'Learner'}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Language</Text>
        <View style={styles.languageSelector}>
          <Pressable onPress={() => changeLocale('en')}>
            <Text style={locale === 'en' ? styles.activeLanguage : styles.language}>EN</Text>
          </Pressable>
          <Text style={styles.language}>|</Text>
          <Pressable onPress={() => changeLocale('pt-BR')}>
            <Text style={locale === 'pt-BR' ? styles.activeLanguage : styles.language}>PT-BR</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Language</Text>
        <Text style={styles.currentLearningLanguage}>
          {getLanguageName(user?.selectedLanguage)}
        </Text>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push('/auth/select-language')}
        >
          <Text style={styles.secondaryButtonText}>Change</Text>
        </Pressable>
      </View>

      <Pressable style={styles.button} onPress={handleResetProgress}>
        <Text style={styles.buttonText}>Reset progress</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: AppColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: AppColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarPlaceholderText: {
    color: AppColors.text,
    fontSize: 48,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 48,
  },
  section: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    color: AppColors.textMuted,
    marginBottom: 12,
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  language: {
    color: AppColors.textSubtle,
    fontSize: 18,
    marginHorizontal: 15,
  },
  activeLanguage: {
    color: AppColors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
  },
  currentLearningLanguage: {
    color: AppColors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  secondaryButton: {
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: AppColors.primary,
  },
  secondaryButtonText: {
    color: AppColors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: AppColors.danger,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    marginTop: 'auto',
    marginBottom: 20,
  },
  buttonText: {
    color: AppColors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
