
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'; // Added onAuthStateChanged and FirebaseUser
import { getFirestore, doc, getDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore'; // Added Firestore imports
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration - Ensure this is correct
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyD1Z4ELRKb-9Ic2IgVy99Q5NUt43kI879o", // Last provided API key
  authDomain: "meme-prophet-xpyi0.firebaseapp.com",
  projectId: "meme-prophet-xpyi0",
  storageBucket: "meme-prophet-xpyio.appspot.com", // Corrected from previous xpyi0.firebasestorage.app
  messagingSenderId: "1080795361618",
  appId: "1:1080795361618:web:44e0f318a3a9399e77ca8b"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
let messagingInstance: ReturnType<typeof getMessaging> | null = null;

if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      messagingInstance = getMessaging(app);
    } else {
      console.log("Firebase Messaging is not supported in this browser.");
    }
  }).catch(err => {
    console.error("Error checking FCM support:", err);
  });
}

// Request FCM token
export const requestPermission = async () => {
  if (!messagingInstance) {
    const message = "Firebase Messaging not initialized or not supported. Cannot request permission.";
    console.warn(message);
    return null;
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      // YOU WILL NEED TO REPLACE 'YOUR_VAPID_KEY_REPLACE_THIS' WITH YOUR ACTUAL VAPID KEY
      const token = await getToken(messagingInstance, {
        vapidKey: 'BDsu4ZwCLkC-kLMQXZap-cyDs1Uq-5oDDKmH6ow0gWuagzVHmgLO-ta8vdXsjylg3yMyUjFDS6NE4nsH7X_DItg',
      });
      console.log('FCM Token retrieved in requestPermission:', token);
      // Placeholder for sending token to backend.
      // If a user is logged in, you'd typically send their UID along with the token.
      // Example: await sendTokenToBackend(auth.currentUser?.uid, token);
      return token;
    } else {
      console.warn('Notification permission denied.');
      return null;
    }
  } catch (error) {
    console.error('Error retrieving FCM token or requesting permission:', error);
    return null; // Explicitly return null on error
  }
};


// Handle foreground messages
export const onMessageListener = () =>
  new Promise((resolve, reject) => { // Added reject for better error propagation
    if (!messagingInstance) {
      const errorMsg = "Firebase Messaging not initialized or not supported for onMessageListener.";
      console.warn(errorMsg);
      reject(new Error(errorMsg)); // Reject the promise
      return;
    }
    onMessage(messagingInstance, (payload) => {
      console.log('Foreground message received. ', payload);
      resolve(payload);
    }, (error) => { // Added error callback for onMessage
      console.error('Error receiving foreground message: ', error);
      reject(error);
    });
  });

export const ADMIN_EMAILS = [
  "coreyenglish517@gmail.com".toLowerCase(),
  "giomazetti@gmail.com".toLowerCase()
];

export { app, auth, db, storage, messagingInstance as messaging, onAuthStateChanged, type FirebaseUser, doc, getDoc, onSnapshot, type Unsubscribe };
