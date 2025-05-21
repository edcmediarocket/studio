
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Added for future use if reading from Firestore

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDRWV3OilblaZWlEDDcy1dOd5ysO5jxUjI", // User-provided
  authDomain: "rocketmemefinal.firebaseapp.com", // User-provided
  projectId: "meme-prophet-xpyi0", // User-provided
  storageBucket: "meme-prophet-xpyi0.appspot.com", // Corrected from user-provided, was rocketmemefinal.firebasestorage.app
  messagingSenderId: "213714563438", // User-provided
  appId: "1:213714563438:web:2eddc648692a831471117f" // User-provided
  // measurementId: "YOUR_MEASUREMENT_ID_HERE" // Optional: for Google Analytics - User can add this if needed
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // If already initialized, use that instance
}

const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

// Define admin email
export const ADMIN_EMAIL = "coreyenglish517@gmail.com"; 

export { app, auth, db };
