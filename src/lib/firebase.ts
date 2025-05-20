
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// To enable Firestore or other services, import them here
// import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyD1l4ELRKb-9Ic2IgVy99Q5NUt43kI879o",
  authDomain: "meme-prophet-xpyi0.firebaseapp.com",
  projectId: "meme-prophet-xpyi0",
  storageBucket: "meme-prophet-xpyi0.appspot.com", // Corrected to .appspot.com
  messagingSenderId: "1080795361618",
  appId: "1:1080795361618:web:44e0f318a3a9399e77ca8b"
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
// const db = getFirestore(app); // Uncomment if you need Firestore
// const storage = getStorage(app); // Uncomment if you need Storage

export const ADMIN_EMAIL = "coreyenglish517@gmail.com"; // Define admin email

export { app, auth /*, db, storage */ };
