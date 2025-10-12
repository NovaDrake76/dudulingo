import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import i18n, { setLocale } from '../../services/i18n';
import { useAuth } from '../_layout';

const mockUser = {
  name: 'Dudu',
  photoUrl: require('../../assets/images/dudulingo.png'),
};

export default function Profile() {
  const { setToken } = useAuth();

  const handleLogout = async () => {
    await setToken(null);
    router.replace('/auth/sign-in');
  };

  const changeLocale = (locale: string) => {
    setLocale(locale);
    router.replace('/(tabs)/profile');
  };

  return (
    <View style={styles.container}>
      <Image source={mockUser.photoUrl} style={styles.avatar} />
      <Text style={styles.name}>{mockUser.name}</Text>
      <View style={styles.languageSelector}>
        <Pressable onPress={() => changeLocale('en')}>
          <Text style={i18n.locale === 'en' ? styles.activeLanguage : styles.language}>EN</Text>
        </Pressable>
        <Text style={styles.language}>|</Text>
        <Pressable onPress={() => changeLocale('pt-BR')}>
          <Text style={i18n.locale === 'pt-BR' ? styles.activeLanguage : styles.language}>PT-BR</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 48,
  },
  button: {
    backgroundColor: '#EA4335',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
});