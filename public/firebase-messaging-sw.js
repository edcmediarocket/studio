// public/firebase-messaging-sw.js
// Ensure this version matches your Firebase SDK version (e.g., from package.json)
importScripts('https://www.gstatic.com/firebasejs/11.7.3/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.7.3/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker with your project's configuration
const firebaseConfig = {
    apiKey: "AIzaSyD1l4ELRKb-9Ic2IgVy99Q5NUt43kI879o",
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
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);

  // Customize notification here
  const notificationTitle = payload.notification?.title || 'Rocket Meme Alert!';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification from Rocket Meme.',
    icon: '/icons/icon-192x192.png', // Ensure you have this icon in /public/icons/
    // badge: '/icons/badge-72x72.png', // Optional: for Android status bar
    // image: payload.notification?.image, // Optional: if your notifications include images
    // data: payload.data, // Optional: to pass data for notification click handling
    // actions: [ // Optional: add action buttons
    //   { action: 'explore', title: 'Explore Now', icon: '/icons/action-explore.png' },
    //   { action: 'close', title: 'Close', icon: '/icons/action-close.png' }
    // ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Optional: handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click Received.', event.notification);
  event.notification.close();

  // This openWindow() logic is simplified. You might need more complex logic
  // to focus an existing tab or open a specific URL based on event.notification.data.
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it.
      for (const client of clientList) {
        // You might want to check client.url to see if it's the correct page
        // and navigate if needed using client.navigate('your-specific-url').
        if (client.url === '/' && 'focus' in client) { // Example: focus if it's the root URL
          return client.focus();
        }
      }
      // If no window is open or a specific relevant window isn't found, open a new one.
      if (clients.openWindow) {
        // You can use event.notification.data?.url or a default path
        const urlToOpen = event.notification.data?.url || '/';
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
