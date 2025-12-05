/* authStore.ts */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { auth } from "./firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { router } from "expo-router";

const isWeb = Platform.OS === "web";

type AuthState = {
  userId: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  authLoaded: boolean;
  manualLogout: boolean;                // ⭐ NEW FLAG

  setUser: (user: any) => void;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  initializeAuthListener: () => void;
};

const secureStorage = {
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  getItem: (key: string) => SecureStore.getItemAsync(key),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      userId: null,
      isLoggedIn: false,
      loading: false,
      authLoaded: false,
      manualLogout: false,               // ⭐ INITIAL VALUE


      setUser: (user) => 
        set({ 
          userId: user?.uid ?? null, 
          isLoggedIn: !!user, 
          authLoaded: true 
        }),


initializeAuthListener: () => {
  onAuthStateChanged(auth, async (user) => {

    console.log("🔥 Firebase Auth Change — user:", user ? user.uid : "NO USER");

    if (get().manualLogout) {
      console.log("🚫 Manual logout active → blocking auto-restore");
      set({
        userId: null,
        isLoggedIn: false,
        authLoaded: true,
      });
      return;
    }

    if (user) {
      console.log("✅ Firebase says: LOGGED IN:", user.uid);

      set({
        userId: user.uid,
        isLoggedIn: true,
        manualLogout: false,
        authLoaded: true,
      });

    } else {
      console.log("❌ Firebase says: LOGGED OUT");

      set({
        userId: null,
        isLoggedIn: false,
        authLoaded: true,
      });
    }
  });
},





      logIn: async (email, password) => {
        set({ loading: true });
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);

          if (!isWeb) {
            await SecureStore.setItemAsync("email", email);
            await SecureStore.setItemAsync("password", password);
          }

          set({
            userId: userCredential.user.uid,
            isLoggedIn: true,
            loading: false,
            manualLogout: false     // ⭐ Reset logout flag
          });

        } catch (e) {
          set({ loading: false });
          throw e;
        }
      },



      logOut: async () => {
        try {
          await signOut(auth);

          // Clear secure storage
          if (!isWeb) {
            await SecureStore.deleteItemAsync("email");
            await SecureStore.deleteItemAsync("password");
            await SecureStore.deleteItemAsync("auth-store");
          } else {
            localStorage.removeItem("auth-store");
          }

          // Clear Zustand state
          set({
            userId: null,
            isLoggedIn: false,
            authLoaded: true,
            loading: false,
            manualLogout: true      // ⭐ VERY IMPORTANT
          });

          console.log("Logout successful");
    

        } catch (e) {
          console.error("Logout failed:", e);
        }
      },


    }),
    {
      name: "auth-store",
      storage: isWeb 
        ? createJSONStorage(() => localStorage)
        : createJSONStorage(() => secureStorage),

      onRehydrateStorage: () => (state) => {
        state?.initializeAuthListener();
      },
    }
  )
);
