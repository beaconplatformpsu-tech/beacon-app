// Firebase app + services initialisation.
// Import from here rather than initialising firebase multiple times.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const isTest = process.env.NODE_ENV === 'test';

// Prevent duplicate initialisation in dev hot-reload, and skip entirely in Jest
const app = isTest ? {} as any : (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp());

export const auth = isTest ? {} as any : getAuth(app);
export const db = isTest ? {} as any : getDatabase(app);
export const storage = isTest ? {} as any : getStorage(app);
export default app;
