// hooks/use-auth.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [firstTime, setFirstTime] = useState(false);

  useEffect(() => {
    (async () => {
      const hasOpened = await AsyncStorage.getItem("hasOpened");

      if (!hasOpened) {
        setFirstTime(true);
        await AsyncStorage.setItem("hasOpened", "true");
      }

      setLoading(false);
    })();
  }, []);


  return { loading, firstTime };
}
