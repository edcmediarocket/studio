
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Added for future use if reading from Firestore

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyD1l4ELRKb-9Ic2IgVy99Q5NUt43kI879o", // User-provided
  authDomain: "meme-prophet-xpyi0.firebaseapp.com", // User-provided
  projectId: "meme-prophet-xpyi0", // User-provided
  storageBucket: "meme-prophet-xpyi0.appspot.com", // Corrected from user-provided
  messagingSenderId: "1080795361618", // User-provided
  appId: "1:1080795361618:web:44e0f318a3a9399e77ca8b" // User-provided
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

