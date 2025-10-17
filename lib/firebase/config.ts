import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDtaqb6mV0S80OQMqputGA-irIMXelCyVc",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "w1nnerfinassas.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://w1nnerfinassas-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "w1nnerfinassas",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "w1nnerfinassas.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "357136853596",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:357136853596:web:6f1d2ece51a3529fff1499",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ZLH7V4Q66S",
}

// Warn if using fallback configuration
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.warn("[Firebase] Using fallback configuration. For production, set environment variables in .env.local")
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
