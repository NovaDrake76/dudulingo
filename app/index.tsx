import { Redirect } from "expo-router";
import { useAuth } from "../hooks/use-auth";

export default function Index() {
  const { loading, firstTime } = useAuth();

  if (loading) return null; 

  if (firstTime) {
    return <Redirect href="/auth/sign-in" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
