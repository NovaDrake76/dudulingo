import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/use-auth';

export default function Index() {
  const { loading, isAuthenticated, hasSelectedLanguage } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Redirect href="/auth/sign-in" />;
  }


  if (!hasSelectedLanguage) {
    return <Redirect href="/auth/select-language" />;
  }

  return <Redirect href="/(tabs)/learn" />;
}