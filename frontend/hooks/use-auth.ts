import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { getToken } from '../services/auth';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const language = await AsyncStorage.getItem('selectedLanguage');

      setIsAuthenticated(!!token);
      setHasSelectedLanguage(!!language);
      setLoading(false);
    })();
  }, []);

  return { loading, isAuthenticated, hasSelectedLanguage };
}