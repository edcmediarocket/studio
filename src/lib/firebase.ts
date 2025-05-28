
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { getMessaging, getToken, onMessage, isSupported, type Messaging } from 'firebase/messaging';
import { getStorage } from "firebase/storage";
import { getAnalytics, type Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyD1l4ELRKb-9Ic2IgVy99Q5NUt43kI879o",
  authDomain: "meme-prophet-xpyi0.firebaseapp.com",
  projectId: "meme-prophet-xpyi0",
  storageBucket: "meme-prophet-xpyi0.appspot.com",
  messagingSenderId: "1080795361618",
  appId: "1:1080795361618:web:44e0f318a3a9399e77ca8b",
  measurementId: "G-27NL1D4JLQ"
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

let analytics: Analytics | null = null;
let messagingInstance: Messaging | null = null;

if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
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
      const token = await getToken(messagingInstance, {
        vapidKey: 'BDsu4ZwCLkC-kLMQXZap-cyDs1Uq-5oDDKmH6ow0gWuagzVHmgLO-ta8vdXsjylg3yMyUjFDS6NE4nsH7X_DItg',
      });
      console.log('FCM Token retrieved in requestPermission:', token);
      // Placeholder for sending token to backend.
      // Example: await sendTokenToBackend(auth.currentUser?.uid, token);
      return token;
    } else {
      console.warn('Notification permission denied.');
      return null;
    }
  } catch (error) {
    console.error('Error retrieving FCM token or requesting permission:', error);
    return null;
  }
};


// Handle foreground messages
export const onMessageListener = () =>
  new Promise((resolve, reject) => {
    if (!messagingInstance) {
      const errorMsg = "Firebase Messaging not initialized or not supported for onMessageListener.";
      console.warn(errorMsg);
      reject(new Error(errorMsg));
      return;
    }
    onMessage(messagingInstance, (payload) => {
      console.log('Foreground message received. ', payload);
      resolve(payload);
    }, (error) => {
      console.error('Error receiving foreground message: ', error);
      reject(error);
    });
  });

export const ADMIN_EMAILS = [
  "coreyenglish517@gmail.com".toLowerCase(),
  "giomazetti@gmail.com".toLowerCase()
];

export { app, auth, db, storage, analytics, messagingInstance as messaging, onAuthStateChanged, type FirebaseUser, doc, getDoc, onSnapshot, type Unsubscribe };
