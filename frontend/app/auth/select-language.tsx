import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import { Alert, StyleSheet, Text, View } from 'react-native'
import LanguageSelector from '../../components/language-selector'
import { api } from '../../services/api'

export default function SelectLanguage() {
  const handleSelectLanguage = async () => {
    try {
      await api.saveLanguage('en')
      await AsyncStorage.setItem('selectedLanguage', 'en')
      router.replace('/select-deck')
    } catch (error) {
      console.error('Failed to save language:', error)
      Alert.alert('Error', 'Failed to save language preference')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Which language do you want to learn?</Text>
      <LanguageSelector
        languageName="English"
        flagSource={require('../../assets/images/uk-flag.png')}
        onPress={handleSelectLanguage}
      />
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 48,
    textAlign: 'center',
  },
})