import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AppColors } from '../constants/theme';
import { api } from '../services/api';
import i18n from '../services/i18n';
import logger from '../services/logger';

type ImageResult = {
  title: string;
  url: string;
  thumbnailUrl: string;
  license: string;
  source: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (image: { url: string; source: string; license: string }) => void;
};

export function ImageSearchModal({ visible, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ImageResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await api.searchImages(query.trim());
      setResults(data.results || []);
    } catch (error) {
      logger.error('Image search failed', { error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (image: ImageResult) => {
    onSelect({
      url: image.url,
      source: image.source,
      license: image.license,
    });
    setQuery('');
    setResults([]);
    onClose();
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{i18n.t('searchImage')}</Text>
            <Pressable onPress={handleClose}>
              <Ionicons name="close" size={28} color={AppColors.text} />
            </Pressable>
          </View>

          <View style={styles.searchRow}>
            <TextInput
              style={styles.input}
              value={query}
              onChangeText={setQuery}
              placeholder={i18n.t('searchImagesPlaceholder')}
              placeholderTextColor={AppColors.textMuted}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <Pressable style={styles.searchButton} onPress={handleSearch}>
              <Ionicons name="search" size={22} color={AppColors.text} />
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={AppColors.primary}
              style={styles.loader}
            />
          ) : results.length === 0 && query ? (
            <Text style={styles.emptyText}>{i18n.t('noImagesFound')}</Text>
          ) : (
            <FlatList
              data={results}
              numColumns={2}
              keyExtractor={(item, index) => `${item.url}-${index}`}
              contentContainerStyle={styles.grid}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.imageCard}
                  onPress={() => handleSelect(item)}
                >
                  <Image
                    source={{ uri: item.thumbnailUrl }}
                    style={styles.thumbnail}
                  />
                  <Text style={styles.imageTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.licenseText}>
                    {item.license}
                  </Text>
                </Pressable>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: AppColors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: AppColors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: AppColors.surface,
    color: AppColors.text,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  searchButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginTop: 40,
  },
  emptyText: {
    color: AppColors.textMuted,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  grid: {
    gap: 8,
  },
  imageCard: {
    flex: 1,
    margin: 4,
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 6,
  },
  imageTitle: {
    color: AppColors.textSubtle,
    fontSize: 11,
    textAlign: 'center',
  },
  licenseText: {
    color: AppColors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
});
