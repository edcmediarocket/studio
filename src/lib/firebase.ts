
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyD1l4ELRKb-9Ic2IgVy99Q5NUt43kI879o",
  authDomain: "meme-prophet-xpyi0.firebaseapp.com",
  projectId: "meme-prophet-xpyi0",
  storageBucket: "meme-prophet-xpyi0.appspot.com", // Corrected format
  messagingSenderId: "1080795361618",
  appId: "1:1080795361618:web:44e0f318a3a9399e77ca8b"
  // measurementId: "YOUR_MEASUREMENT_ID_HERE" // Optional
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // If already initialized, use that instance
}

const auth = getAuth(app);
const db = getFirestore(app);

// Define admin emails for client-side UI purposes (e.g., default tier assignment)
// Actual admin access for dashboard is now driven by custom claims.
export const ADMIN_EMAILS = [
  "coreyenglish517@gmail.com".toLowerCase(),
  "giomazetti@gmail.com".toLowerCase()
];

export { app, auth, db };
