import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Theme } from '../constants/theme';

type Target = '/(tabs)/learn' | '/auth/select-language';

export default function Index() {
  const [target, setTarget] = useState<Target | null>(null);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem('selectedLanguage').then((lang) => {
      if (cancelled) return;
      setTarget(lang ? '/(tabs)/learn' : '/auth/select-language');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!target) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Theme.ink} />
      </View>
    );
  }

  return <Redirect href={target} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.paper,
  },
});
