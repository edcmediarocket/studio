// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyD1l4ELRKb-9Ic2IgVy99Q5NUt43kI879o", // From previous user input, matches example except last char
  authDomain: "meme-prophet-xpyi0.firebaseapp.com",
  projectId: "meme-prophet-xpyi0",
  storageBucket: "meme-prophet-xpyio.appspot.com", // Corrected to match user's App.js example
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
    console.log("Firebase Messaging not initialized or not supported.");
    return null;
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      const token = await getToken(messagingInstance, {
        vapidKey: 'BDsu4ZwCLkC-kLMQXZap-cyDs1Uq-5oDDKmH6ow0gWuagzVHmgLO-ta8vdXsjylg3yMyUjFDS6NE4nsH7X_DItg', // VAPID key from user's example
      });
      console.log('FCM Token:', token);
      // In a real app, you would send this token to your backend server to store it.
      // Example: await sendTokenToBackend(token, auth.currentUser?.uid);
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
  new Promise((resolve, reject) => { // Added reject for error handling
    if (!messagingInstance) {
      const errorMsg = "Firebase Messaging not initialized or not supported for onMessageListener.";
      console.log(errorMsg);
      reject(new Error(errorMsg));
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

// Updated ADMIN_EMAILS to be an array to support multiple admins
export const ADMIN_EMAILS = [
  "coreyenglish517@gmail.com".toLowerCase(),
  "giomazetti@gmail.com".toLowerCase()
];

export { app, auth, db, messagingInstance as messaging };
