import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ImageSearchModal } from '../components/ImageSearchModal';
import { AppColors } from '../constants/theme';
import { api } from '../services/api';
import i18n from '../services/i18n';
import logger from '../services/logger';

type Deck = {
  _id: string;
  name: string;
};

type SelectedImage = {
  url: string;
  source: string;
  license: string;
};

export default function AddCard() {
  const [answer, setAnswer] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedDeckId, setSelectedDeckId] = useState('');
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    try {
      const allDecks = await api.getAllDecks();
      setDecks(allDecks);
      if (allDecks.length > 0) {
        setSelectedDeckId(allDecks[0]._id);
      }
    } catch (error) {
      logger.error('Failed to load decks', { error: String(error) });
    }
  };

  const handleSave = async () => {
    if (!answer.trim() || !prompt.trim()) {
      Alert.alert(i18n.t('error'), i18n.t('required'));
      return;
    }

    setSaving(true);
    try {
      await api.createCard({
        type: 'basic',
        answer: answer.trim(),
        prompt: prompt.trim(),
        imageUrl: selectedImage?.url,
        imageSource: selectedImage?.source,
        imageLicense: selectedImage?.license,
        lang: 'pt-BR',
        deckId: selectedDeckId || undefined,
      });

      Alert.alert(i18n.t('cardCreated'), '', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      logger.error('Failed to create card', { error: String(error) });
      Alert.alert(i18n.t('error'), 'Failed to create card');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{i18n.t('createCard')}</Text>

        <Text style={styles.label}>{i18n.t('word')}</Text>
        <TextInput
          style={styles.input}
          value={answer}
          onChangeText={setAnswer}
          placeholder="e.g. Dog"
          placeholderTextColor={AppColors.textMuted}
        />

        <Text style={styles.label}>{i18n.t('translation')}</Text>
        <TextInput
          style={styles.input}
          value={prompt}
          onChangeText={setPrompt}
          placeholder="e.g. Cachorro"
          placeholderTextColor={AppColors.textMuted}
        />

        <Text style={styles.label}>{i18n.t('selectImage')}</Text>
        {selectedImage ? (
          <View style={styles.selectedImageContainer}>
            <Image source={{ uri: selectedImage.url }} style={styles.selectedImage} />
            <View style={styles.imageMeta}>
              <Text style={styles.licenseText}>{selectedImage.license}</Text>
              <Pressable onPress={() => setSelectedImage(null)}>
                <Ionicons name="close-circle" size={24} color={AppColors.error} />
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            style={styles.imageSearchButton}
            onPress={() => setShowImageSearch(true)}
          >
            <Ionicons name="image-outline" size={24} color={AppColors.primary} />
            <Text style={styles.imageSearchButtonText}>{i18n.t('searchImage')}</Text>
          </Pressable>
        )}

        {decks.length > 0 && (
          <>
            <Text style={styles.label}>{i18n.t('selectDeckForCard')}</Text>
            <View style={styles.deckSelector}>
              {decks.map((deck) => (
                <Pressable
                  key={deck._id}
                  style={[
                    styles.deckOption,
                    selectedDeckId === deck._id && styles.deckOptionSelected,
                  ]}
                  onPress={() => setSelectedDeckId(deck._id)}
                >
                  <Text
                    style={[
                      styles.deckOptionText,
                      selectedDeckId === deck._id && styles.deckOptionTextSelected,
                    ]}
                  >
                    {deck.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>

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

      <ImageSearchModal
        visible={showImageSearch}
        onClose={() => setShowImageSearch(false)}
        onSelect={setSelectedImage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
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
  imageSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderStyle: 'dashed',
    gap: 10,
  },
  imageSearchButtonText: {
    color: AppColors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  selectedImageContainer: {
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 12,
  },
  selectedImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  imageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  licenseText: {
    color: AppColors.textMuted,
    fontSize: 12,
  },
  deckSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  deckOption: {
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  deckOptionSelected: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.correctBg,
  },
  deckOptionText: {
    color: AppColors.textSubtle,
    fontSize: 14,
  },
  deckOptionTextSelected: {
    color: AppColors.primary,
    fontWeight: 'bold',
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
