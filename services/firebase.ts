import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyB5gRFu8JZMN2v9i4BHYRGcvqUfAnkEuvw",
  authDomain: "reelsociety-15428.firebaseapp.com",
  projectId: "reelsociety-15428",
  storageBucket: "reelsociety-15428.firebasestorage.app",
  messagingSenderId: "373428769400",
  appId: "1:373428769400:web:de7b42761a38b59577d38d",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth =
  Platform.OS === "web"
    ? getAuth(app)
    : (() => {
        try {
          return initializeAuth(app, {
            persistence: getReactNativePersistence(ReactNativeAsyncStorage),
          });
        } catch {
          // initializeAuth can throw during fast refresh if already initialized.
          return getAuth(app);
        }
      })();

export const db = getFirestore(app);
export const storage = getStorage(app);
