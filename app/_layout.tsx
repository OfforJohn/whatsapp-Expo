import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "@/components/utils/authStore";
import { View, ActivityIndicator } from "react-native";
import { StateProvider } from "@/src/context/StateContext";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isLoggedIn, authLoaded } = useAuthStore();

  useEffect(() => {
    if (!authLoaded) return;

    const onLoginScreen = segments[0] === "sign-in" || segments[0] === "sign-up";

    if (!isLoggedIn && !onLoginScreen) {
      const timer = setTimeout(() => {
        router.replace("/sign-in");
      }, 100);
      return () => clearTimeout(timer);
    }

    if (isLoggedIn && onLoginScreen) {
      const timer = setTimeout(() => {
        router.replace("/");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [authLoaded, isLoggedIn, segments]);

  if (!authLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#00A884" />
      </View>
    );
  }

  // ✅ Wrap your entire app in StateProvider
  return (
    <StateProvider>
      <Slot />
    </StateProvider>
  );
}
