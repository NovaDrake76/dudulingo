import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { getToken } from "../services/auth";

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [firstTime, setFirstTime] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const hasOpened = await AsyncStorage.getItem("hasOpened");

      if (!hasOpened) {
        setFirstTime(true);
        await AsyncStorage.setItem("hasOpened", "true");
      }

      setIsAuthenticated(!!token);
      setLoading(false);
    })();
  }, []);

  return { loading, firstTime, isAuthenticated };
}