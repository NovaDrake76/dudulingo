import { router } from 'expo-router';
import { Alert, Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppColors } from '../../constants/theme';
import { api } from '../../services/api';
import i18n from '../../services/i18n';
import logger from '../../services/logger';

type LangChoice = {
  code: string;
  label: string;
  flag: ImageSourcePropType;
};

const CHOICES: LangChoice[] = [
  { code: 'en', label: 'English', flag: require('../../assets/images/uk-flag.png') },
  { code: 'it', label: 'Italiano', flag: require('../../assets/images/it-flag.png') },
  { code: 'de', label: 'Deutsch', flag: require('../../assets/images/de-flag.png') },
];

export default function SelectLanguage() {
  const handleSelectLanguage = async (code: string) => {
    try {
      await api.saveLanguage(code);
      router.replace('/select-deck');
    } catch (error) {
      logger.error('Failed to save language', { error: String(error) });
      Alert.alert('Error', 'Could not save your language choice.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t('selectLanguageTitle')}</Text>
      <Text style={styles.subtitle}>
        Pick a language you want to learn. You can change this later.
      </Text>

      <View style={styles.list}>
        {CHOICES.map((choice) => (
          <Pressable
            key={choice.code}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => handleSelectLanguage(choice.code)}
          >
            <Image source={choice.flag} style={styles.flag} />
            <Text style={styles.rowLabel}>{choice.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: AppColors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: AppColors.textMuted,
    marginBottom: 32,
  },
  list: {
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  rowPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  flag: {
    width: 52,
    height: 36,
    borderRadius: 4,
    marginRight: 18,
  },
  rowLabel: {
    color: AppColors.text,
    fontSize: 20,
    fontWeight: '600',
  },
});
