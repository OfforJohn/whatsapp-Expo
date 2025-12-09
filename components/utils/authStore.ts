/* authStore.ts */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { auth } from "./firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import axios from "axios";
import { GET_USER_BY_FIREBASE, ONBOARD_USER_ROUTE } from "@/utils/ApiRoutes";

const isWeb = Platform.OS === "web";

type AuthState = {
  isLoggedIn: boolean;
  loading: boolean;

  userId: string | null;        // Firebase UID
  backendId: number | null;     // Backend numeric ID

  authLoaded: boolean;
  manualLogout: boolean;

  setUser: (user: {
    uid: string;
    backendId: number;
    name?: string;
    email?: string;
    profileImage?: string;
    status?: string;
  }) => void;

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
      isLoggedIn: false,
      loading: false,

      userId: null,          // firebase UID
      backendId: null,       // backend numeric ID

      authLoaded: false,
      manualLogout: false,

      /** SAVE FIREBASE UID + BACKEND ID */
      setUser: (user) =>
        set({
          userId: user.uid,
          backendId: user.backendId,
          isLoggedIn: true,
          authLoaded: true,
          manualLogout: false,
        }),

      /** FIREBASE AUTH STATE LISTENER  */
/** FIREBASE AUTH STATE LISTENER */
initializeAuthListener: () => {
  onAuthStateChanged(auth, async (user) => {
    console.log("🔥 Firebase Auth Change — user:", user ? user.uid : "NO USER");

    if (!user) {
      console.log("❌ Firebase says: LOGGED OUT");
      set({
        userId: null,
        backendId: null,
        isLoggedIn: false,
        authLoaded: true,
      });
      return;
    }

    const uid = user.uid;
    console.log("✅ Firebase says: LOGGED IN:", uid);

    // Reset manualLogout on any login
    set({ manualLogout: false });

    // Fetch backend user
    try {
      const { data } = await axios.get(`${GET_USER_BY_FIREBASE}/${uid}`);

      let backendUser;
      if (data.status) {
        backendUser = data.data;
      } else {
        console.warn("⚠️ Backend user not found. Creating a new backend profile...");

        // Auto-onboard user if missing
        const onboardRes = await axios.post(ONBOARD_USER_ROUTE, {
          firebaseUid: uid,
          email: user.email || "unknown@example.com",
          name: user.displayName || "Unknown",
          about: "Available",
          image: "https://i.ibb.co/CJg5v0F/default-avatar.png",
        });
        backendUser = onboardRes.data.data;
      }

      // Save to Zustand
      set({
        userId: uid,
        backendId: backendUser.id,
        isLoggedIn: true,
        authLoaded: true,
      });

      console.log("🟢 Backend user restored:", backendUser.id);
    } catch (err) {
      console.error("❌ Failed to fetch or onboard backend user:", err);
      // Still mark authLoaded true to avoid hanging UI
      set({
        userId: uid,
        backendId: null,
        isLoggedIn: true,
        authLoaded: true,
      });
    }
  });
},




      /** LOGIN */
logIn: async (email: string, password: string) => {
  try {
    // Firebase login
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUid = userCred.user.uid;
    console.log("🔥 Firebase signed in:", firebaseUid);

    // Reset manualLogout
    set({ manualLogout: false });

    // Fetch backend user
    let backendUser;
    try {
      const { data } = await axios.get(`${GET_USER_BY_FIREBASE}/${firebaseUid}`);
      if (data.status) {
        backendUser = data.data;
      } else {
        console.warn("⚠️ Backend user not found. Creating backend profile...");

        const onboardRes = await axios.post(ONBOARD_USER_ROUTE, {
          firebaseUid,
          email,
          name: userCred.user.displayName || "Unknown",
          about: "Available",
          image: "https://i.ibb.co/CJg5v0F/default-avatar.png",
        });
        backendUser = onboardRes.data.data;
      }
    } catch (err) {
      console.error("❌ Failed to fetch backend user:", err);
      throw new Error("Failed to retrieve or create backend profile");
    }

    // Save to Zustand
    const { setUser } = useAuthStore.getState();
    setUser({
      uid: firebaseUid,
      backendId: backendUser.id,
      name: backendUser.name,
      email: backendUser.email,
      profileImage: backendUser.profilePicture,
      status: backendUser.about,
    });
    console.log("✅ Zustand stored user:", backendUser.id);

    // Optional: persist email/password for auto-login
    if (!isWeb) {
      await SecureStore.setItemAsync("email", email);
      await SecureStore.setItemAsync("password", password);
    } else {
      localStorage.setItem("email", email);
      localStorage.setItem("password", password);
    }
  } catch (err) {
    console.error("❌ Login failed:", err);
    throw err;
  }
},



      /** LOGOUT */
      logOut: async () => {
        try {
          await signOut(auth);

          // wipe secure storage
          if (!isWeb) {
            await SecureStore.deleteItemAsync("email");
            await SecureStore.deleteItemAsync("password");
            await SecureStore.deleteItemAsync("auth-store");
          } else {
            localStorage.removeItem("auth-store");
          }

          // wipe Zustand state
          set({
            userId: null,
            backendId: null,
            isLoggedIn: false,
            authLoaded: true,
            loading: false,
            manualLogout: true,
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
