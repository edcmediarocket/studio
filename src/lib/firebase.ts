// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// To enable Firestore or other services, import them here
// import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';

// Firebase project configuration provided by the user.
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDRWV3OilblaZWlEDDcy1dOd5ysO5jxUjI",
  authDomain: "rocketmemefinal.firebaseapp.com",
  projectId: "rocketmemefinal",
  storageBucket: "rocketmemefinal.appspot.com", // Corrected: Removed 'firebasestorage' from the middle
  messagingSenderId: "213714563438",
  appId: "1:213714563438:web:2eddc648692a831471117f",
  measurementId: "YOUR_MEASUREMENT_ID_HERE" // Optional: for Google Analytics - User can add this if needed
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // If already initialized, use that instance
}

const auth = getAuth(app);
// const db = getFirestore(app); // Uncomment if you need Firestore
// const storage = getStorage(app); // Uncomment if you need Storage

export const ADMIN_EMAIL = "admin@rocketmeme.com"; // Define admin email

export { app, auth /*, db, storage */ };
