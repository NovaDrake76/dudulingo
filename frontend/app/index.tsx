import { Redirect } from "expo-router";
import { useAuth } from "../hooks/use-auth";

export default function Index() {
  const { loading, firstTime, isAuthenticated } = useAuth();

  if (loading) return null; 

  if (!isAuthenticated || firstTime) {
    return <Redirect href="/auth/sign-in" />;
  }

  return <Redirect href="/(tabs)/learn" />;
}