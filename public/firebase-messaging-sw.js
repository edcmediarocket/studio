// public/firebase-messaging-sw.js
// IMPORTANT: This file should be in your /public folder.

// Use the version matching your SDK (e.g., if your app uses Firebase v11.x.x, use a recent v10.x.x compat for the SW)
// Using 10.12.2 as a recent stable compat version. Adjust if needed for your specific main app Firebase SDK version.
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// This configuration MUST match the one used in your main application (src/lib/firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyD1Z4ELRKb-9Ic2IgVy99Q5NUt43kI879o",
  authDomain: "meme-prophet-xpyi0.firebaseapp.com",
  projectId: "meme-prophet-xpyi0",
  storageBucket: "meme-prophet-xpyio.appspot.com",
  messagingSenderId: "1080795361618",
  appId: "1:1080795361618:web:44e0f318a3a9399e77ca8b"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // Customize notification here
  const notificationTitle = payload.notification?.title || 'New Rocket Meme Alert!';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification.',
    icon: '/icons/icon-192x192.png' // Ensure you have this icon in /public/icons/
  };

  // For older browser compatibility or more control, you might need to use self.registration.showNotification
  if (self.registration && self.registration.showNotification) {
    return self.registration.showNotification(notificationTitle, notificationOptions);
  } else {
    // Fallback or handle differently if showNotification is not available on self.registration
    // This part is less common now but good to be aware of.
    // For most modern browsers, just initializing messaging and having onBackgroundMessage is enough
    // and the browser handles displaying the notification based on system settings.
    console.warn('[firebase-messaging-sw.js] self.registration.showNotification not available. Browser might handle display.');
  }
});
