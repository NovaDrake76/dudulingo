import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { api } from '../../services/api';
import i18n, { setLocale } from '../../services/i18n';
import { useAuth } from '../_layout';

type User = {
  _id: string;
  name: string;
  photoUrl?: string;
  selectedLanguage?: string;
};

export default function Profile() {
  const { setToken } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [locale, setLocaleState] = useState(i18n.locale);

  // Fetches user data when the screen is focused
  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await api.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData])
  );

  const handleLogout = async () => {
    await setToken(null);
    router.replace('/auth/sign-in');
  };

  const changeLocale = (newLocale: string) => {
    setLocale(newLocale);
    setLocaleState(newLocale);
  };
  
  const getLanguageName = (code?: string) => {
    if (code === 'en') return 'English';
    if (code === 'pt-BR') return 'Português';
    return 'Not set';
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#58cc02" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.name}>Could not load user profile.</Text>
        <Pressable style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>{i18n.t('logOut')}</Text>
        </Pressable>
      </View>
    );
  }


  return (
    <View style={styles.container}>

      {user.photoUrl ? (
        <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarPlaceholderText}>{user.name?.[0]}</Text>
        </View>
      )}
      <Text style={styles.name}>{user.name}</Text>

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
        <Text style={styles.currentLearningLanguage}>{getLanguageName(user.selectedLanguage)}</Text>
         <Pressable style={styles.secondaryButton} onPress={() => router.push('/auth/select-language')}>
            <Text style={styles.secondaryButtonText}>Change</Text>
        </Pressable>
      </View>

      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>{i18n.t('logOut')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
   avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1f1f1f',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarPlaceholderText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 48,
  },
  section: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 12,
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  language: {
    color: '#ccc',
    fontSize: 18,
    marginHorizontal: 15,
  },
  activeLanguage: {
    color: '#58cc02',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
  },
  currentLearningLanguage: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  secondaryButton: {
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: '#58cc02',
  },
  secondaryButtonText: {
    color: '#58cc02',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#EA4335',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    marginTop: 'auto',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});