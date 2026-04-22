import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppColors } from '../constants/theme';
import { api } from '../services/api';
import i18n from '../services/i18n';
import logger from '../services/logger';

export default function CreateDeck() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(i18n.t('error'), i18n.t('required'));
      return;
    }

    setSaving(true);
    try {
      const newDeck = await api.createDeck({
        name: name.trim(),
        description: description.trim() || undefined,
      });

      await api.addDeckToUser(newDeck._id);

      Alert.alert(i18n.t('deckCreated'), '', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      logger.error('Failed to create deck', { error: String(error) });
      Alert.alert(i18n.t('error'), 'Failed to create deck');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{i18n.t('createDeck')}</Text>

        <Text style={styles.label}>{i18n.t('deckName')}</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Food & Drinks"
          placeholderTextColor={AppColors.textMuted}
        />

        <Text style={styles.label}>{i18n.t('deckDescription')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="e.g. Common food and drink vocabulary"
          placeholderTextColor={AppColors.textMuted}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.footer}>
        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? '...' : i18n.t('save')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    color: AppColors.textMuted,
    fontSize: 14,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: AppColors.surface,
    color: AppColors.text,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 20,
    paddingBottom: 32,
  },
  saveButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: AppColors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
