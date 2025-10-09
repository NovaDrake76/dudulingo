import { router } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LanguageSelector from '../../components/language-selector';

// mocked post request
const postUserLanguage = async (language: string) => {
  console.log('User selected language:', language);
  await AsyncStorage.setItem('selectedLanguage', language);
  return Promise.resolve();
};

export default function SelectLanguage() {
  const handleSelectLanguage = async () => {
    await postUserLanguage('en');
    router.replace('/select-deck');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Which language do you want to learn?</Text>
      <LanguageSelector
        languageName="English"
        flagSource={require('../../assets/images/uk-flag.png')}
        onPress={handleSelectLanguage}
      />
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 48,
    textAlign: 'center',
  },
});