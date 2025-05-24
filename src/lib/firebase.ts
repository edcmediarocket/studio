
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'; // Added isSupported

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyD1l4ELRKb-9Ic2IgVy99Q5NUt43kI879o", // From previous user input
  authDomain: "meme-prophet-xpyi0.firebaseapp.com", // From previous user input
  projectId: "meme-prophet-xpyi0", // From previous user input
  storageBucket: "meme-prophet-xpyi0.appspot.com", // Corrected format
  messagingSenderId: "1080795361618", // From previous user input
  appId: "1:1080795361618:web:44e0f318a3a9399e77ca8b" // From previous user input
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
let messagingInstance: ReturnType<typeof getMessaging> | null = null;

// Initialize messaging only if supported by the browser
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      messagingInstance = getMessaging(app);
    } else {
      console.log("Firebase Messaging is not supported in this browser.");
    }
  });
}

export const requestPermission = async () => {
  if (!messagingInstance) {
    console.log("Firebase Messaging not initialized or not supported.");
    return null;
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      const token = await getToken(messagingInstance, {
        vapidKey: 'YOUR_VAPID_KEY_REPLACE_THIS', // IMPORTANT: Replace with your actual VAPID key
      });
      console.log('FCM Token:', token);
      // TODO: Send this token to your server to store it (e.g., in Firestore)
      return token;
    } else {
      console.log('Notification permission denied.');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token or permission:', error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messagingInstance) {
      console.log("Firebase Messaging not initialized or not supported for onMessageListener.");
      return; // Or reject the promise
    }
    onMessage(messagingInstance, (payload) => {
      console.log('Message received. ', payload);
      resolve(payload);
    });
  });


export const ADMIN_EMAILS = [
  "coreyenglish517@gmail.com".toLowerCase(),
  "giomazetti@gmail.com".toLowerCase()
];

export { app, auth, db, messagingInstance as messaging };
