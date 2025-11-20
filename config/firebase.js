import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, collection } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBap_zf0Nhghp3K-LCCqSAU6kYA8lnEvBc",
  authDomain: "golf-club-522dd.firebaseapp.com",
  projectId: "golf-club-522dd",
  storageBucket: "golf-club-522dd.firebasestorage.app",
  messagingSenderId: "600567638058",
  appId: "1:600567638058:web:f35064a411ba9625713b53",
  measurementId: "G-WN87MY8N6X"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Use correct auth initialization based on platform
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app); // Use standard web auth
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };

export const db = getFirestore(app);
export const storage = getStorage(app);
export const usersRef = collection(db, 'users');
