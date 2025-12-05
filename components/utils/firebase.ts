import { initializeApp } from "firebase/app";

import {
initializeAuth,
browserLocalPersistence,
indexedDBLocalPersistence,
} from "firebase/auth";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// @ts-ignore
import { getReactNativePersistence } from "@firebase/auth/dist/rn/index.js";


// Your Firebase config
const firebaseConfig = {
apiKey: "AIzaSyAdRmpL8XB1uz-DLbKII0w75yBwe1s7D4A",
authDomain: "whatapp-d6d8a.firebaseapp.com",
projectId: "whatapp-d6d8a",
storageBucket: "whatapp-d6d8a.firebasestorage.app",
messagingSenderId: "66051827717",
appId: "1:66051827717:web:22f4afc64d4740692d146c",
measurementId: "G-Z3W735JYDS",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with platform-specific persistence
export const auth =
Platform.OS === "web"
? initializeAuth(app, {
persistence: [browserLocalPersistence, indexedDBLocalPersistence],
})
: initializeAuth(app, {
persistence: getReactNativePersistence(AsyncStorage),
});

export default app;
