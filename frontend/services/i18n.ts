import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import en from '../translations/en.json';
import ptBR from '../translations/pt-br.json';

const i18n = new I18n({
  en,
  'pt-BR': ptBR,
});

i18n.defaultLocale = 'en';
i18n.locale = Localization.getLocales()[0].languageTag;
i18n.enableFallback = true;

export const setLocale = async (locale: string) => {
  i18n.locale = locale;
  await AsyncStorage.setItem('user-locale', locale);
};

export const getLocale = async () => {
  const locale = await AsyncStorage.getItem('user-locale');
  return locale || i18n.defaultLocale;
};

export default i18n;