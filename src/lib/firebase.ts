
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { getStorage } from "firebase/storage"; // Import Firebase Storage

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyD1Z4ELRKb-9Ic2IgVy99Q5NUt43kI879o",
  authDomain: "meme-prophet-xpyi0.firebaseapp.com",
  projectId: "meme-prophet-xpyi0",
  storageBucket: "meme-prophet-xpyio.appspot.com",
  messagingSenderId: "1080795361618",
  appId: "1:1080795361618:web:44e0f318a3a9399e77ca8b"
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
const storage = getStorage(app); // Initialize Firebase Storage
let messagingInstance: ReturnType<typeof getMessaging> | null = null;

// Initialize messaging only if supported by the browser
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

export const requestPermission = async () => {
  if (!messagingInstance) {
    const message = "Firebase Messaging not initialized or not supported. Cannot request permission.";
    console.warn(message);
    // Consider showing a toast or some UI feedback to the user
    // For now, returning null as per previous logic
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
      // Placeholder: send token to backend server
      // await sendTokenToBackend(token);
      return token;
    } else {
      console.warn('Notification permission denied.');
      // Potentially show a toast explaining why notifications won't work
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token or requesting permission. ', error);
    // Potentially show a toast about the error
    return null;
  }
};

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

// Updated ADMIN_EMAILS to be an array to support multiple admins
export const ADMIN_EMAILS = [
  "coreyenglish517@gmail.com".toLowerCase(),
  "giomazetti@gmail.com".toLowerCase()
];

export { app, auth, db, storage, messagingInstance as messaging };
