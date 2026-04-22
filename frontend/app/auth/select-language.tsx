import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CircleBtn, TopBar } from '../../components/chrome';
import { Theme, Type } from '../../constants/theme';
import { api } from '../../services/api';
import logger from '../../services/logger';

type LangMeta = {
  code: string;
  name: string;
  en: string;
  hello: string;
  flag: [string, string, string];
};

// Native-script display names and flag stripes. Counts come from the DB.
const LANG_META: Record<string, LangMeta> = {
  it: {
    code: 'it',
    name: 'Italiano',
    en: 'Italian',
    hello: 'Ciao.',
    flag: ['#008C45', '#FFFFFF', '#CD212A'],
  },
  de: {
    code: 'de',
    name: 'Deutsch',
    en: 'German',
    hello: 'Hallo.',
    flag: ['#000000', '#DD0000', '#FFCE00'],
  },
  en: {
    code: 'en',
    name: 'English',
    en: 'English',
    hello: 'Hello.',
    flag: ['#012169', '#FFFFFF', '#C8102E'],
  },
  'pt-BR': {
    code: 'pt-BR',
    name: 'Português',
    en: 'Portuguese (BR)',
    hello: 'Olá.',
    flag: ['#009C3B', '#FFDF00', '#002776'],
  },
};

type Lang = LangMeta & { packs: number; cards: number };

export default function SelectLanguage() {
  const [langs, setLangs] = useState<Lang[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [inventory, me] = await Promise.all([
          api.getLanguageInventory(),
          api.getMe(),
        ]);
        if (cancelled) return;

        const rows: Lang[] = inventory
          .filter((r) => LANG_META[r.lang])
          .map((r) => ({
            ...LANG_META[r.lang],
            packs: r.packCount,
            cards: r.cardCount,
          }))
          .sort((a, b) => b.cards - a.cards);

        setLangs(rows);
        // Default to whichever language the user had, or the biggest one.
        const preferred = me?.selectedLanguage ?? rows[0]?.code ?? null;
        setPicked(preferred);
      } catch (error) {
        logger.error('Failed to load language inventory', { error: String(error) });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleContinue = async () => {
    if (!picked || saving) return;
    setSaving(true);
    try {
      await api.saveLanguage(picked);
      router.replace('/(tabs)/learn');
    } catch (error) {
      logger.error('Failed to save language', { error: String(error) });
      Alert.alert('Error', 'Could not save your language choice.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Theme.ink} />
      </View>
    );
  }

  const pickedLang = langs.find((l) => l.code === picked) ?? langs[0];

  return (
    <View style={styles.container}>
      <TopBar
        leading={
          <CircleBtn onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={14} color={Theme.ink} />
          </CircleBtn>
        }
        trailing={
          pickedLang ? (
            <Pressable
              onPress={() => router.replace('/(tabs)/learn')}
              hitSlop={8}
              style={{ paddingVertical: 6, paddingHorizontal: 10 }}
            >
              <Text style={styles.skip}>Skip</Text>
            </Pressable>
          ) : null
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBlock}>
          <Text style={styles.stepKicker}>PICK A LANGUAGE</Text>
          <Text style={styles.hero}>
            What will you{'\n'}learn today?
          </Text>
          <Text style={styles.sub}>
            Pick one to start. You can change this anytime from your profile.
          </Text>
        </View>

        {langs.length === 0 ? (
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyTitle}>No language packs installed.</Text>
            <Text style={styles.emptyBody}>
              Bundled content didn&apos;t load. Try reinstalling the app.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {langs.map((l) => {
              const selected = l.code === picked;
              return (
                <Pressable
                  key={l.code}
                  onPress={() => setPicked(l.code)}
                  style={({ pressed }) => [
                    styles.card,
                    selected && styles.cardOn,
                    pressed && { opacity: 0.95 },
                  ]}
                >
                  <View style={styles.flag}>
                    <View style={[styles.flagStripe, { backgroundColor: l.flag[0] }]} />
                    <View style={[styles.flagStripe, { backgroundColor: l.flag[1] }]} />
                    <View style={[styles.flagStripe, { backgroundColor: l.flag[2] }]} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.cardName}>{l.name}</Text>
                      <Text style={styles.cardEn}>{l.en}</Text>
                    </View>
                    <View style={styles.cardMetaRow}>
                      <Text style={styles.cardMeta}>
                        {l.packs} {l.packs === 1 ? 'pack' : 'packs'}
                      </Text>
                      <Text style={styles.dot}>·</Text>
                      <Text style={styles.cardMeta}>{l.cards} cards</Text>
                      <Text style={styles.dot}>·</Text>
                      <Text style={styles.hello}>&ldquo;{l.hello}&rdquo;</Text>
                    </View>
                  </View>
                  <View style={[styles.radio, selected && styles.radioOn]}>
                    {selected && <Ionicons name="checkmark" size={12} color="#fff" />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      {pickedLang && (
        <View style={styles.footer}>
          <Pressable
            onPress={handleContinue}
            disabled={saving}
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.ctaText}>Continue with {pickedLang.en}</Text>
            <Ionicons name="chevron-forward" size={12} color={Theme.paper} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.paper },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.paper,
  },
  scroll: { paddingBottom: 32 },
  skip: {
    fontFamily: Type.sansSemi,
    fontSize: 12.5,
    color: Theme.inkMute,
  },

  heroBlock: { paddingHorizontal: 20, paddingTop: 6 },
  stepKicker: {
    fontFamily: Type.sansSemi,
    fontSize: 11,
    letterSpacing: 1.4,
    color: Theme.inkMute,
  },
  hero: {
    fontFamily: Type.serif,
    fontSize: 36,
    lineHeight: 38,
    letterSpacing: -0.6,
    color: Theme.ink,
    marginTop: 8,
  },
  sub: {
    fontFamily: Type.sans,
    fontSize: 13.5,
    color: Theme.inkSoft,
    lineHeight: 20,
    marginTop: 8,
  },

  list: { paddingHorizontal: 20, paddingTop: 20, gap: 10 },
  card: {
    backgroundColor: Theme.card,
    borderWidth: 1,
    borderColor: Theme.line,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardOn: { borderColor: Theme.forest },
  flag: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: Theme.line,
  },
  flagStripe: { flex: 1 },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  cardName: {
    fontFamily: Type.serif,
    fontSize: 22,
    color: Theme.ink,
    letterSpacing: -0.4,
  },
  cardEn: {
    fontFamily: Type.sans,
    fontStyle: 'italic',
    fontSize: 11.5,
    color: Theme.inkMute,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
    flexWrap: 'wrap',
  },
  cardMeta: {
    fontFamily: Type.sans,
    fontSize: 11.5,
    color: Theme.inkMute,
  },
  dot: { color: Theme.inkFaint, fontSize: 12 },
  hello: {
    fontFamily: Type.serifItalic,
    fontSize: 13,
    color: Theme.inkSoft,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Theme.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    borderColor: Theme.forest,
    backgroundColor: Theme.forest,
  },

  emptyBlock: { paddingHorizontal: 20, paddingTop: 40 },
  emptyTitle: {
    fontFamily: Type.serif,
    fontSize: 20,
    color: Theme.ink,
    marginBottom: 6,
  },
  emptyBody: {
    fontFamily: Type.sans,
    fontSize: 14,
    color: Theme.inkSoft,
    lineHeight: 20,
  },

  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    backgroundColor: Theme.paper,
    borderTopWidth: 0.5,
    borderTopColor: Theme.line,
  },
  cta: {
    paddingVertical: 15,
    paddingHorizontal: 18,
    backgroundColor: Theme.ink,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: {
    fontFamily: Type.sansSemi,
    fontSize: 15,
    color: Theme.paper,
    letterSpacing: -0.1,
  },
});
