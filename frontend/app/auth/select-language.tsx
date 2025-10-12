import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';
import LanguageSelector from '../../components/language-selector';
import { api } from '../../services/api';
import i18n from '../../services/i18n';

export default function SelectLanguage() {
  const handleSelectLanguage = async (languageCode: string) => {
    try {
      await api.saveLanguage(languageCode);
      await AsyncStorage.setItem('selectedLanguage', languageCode);
      router.replace('/select-deck');
    } catch (error) {
      console.error('Failed to save language:', error);
      Alert.alert('Error', 'Failed to save language preference');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t('selectLanguageTitle')}</Text>
      <LanguageSelector
        languageName="English"
        flagSource={require('../../assets/images/uk-flag.png')}
        onPress={() => handleSelectLanguage('en')}
      />
      <View style={{ height: 20 }} />
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