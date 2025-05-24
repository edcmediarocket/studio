
"use client";

import { useEffect } from 'react';
import { requestPermission, onMessageListener } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

// Example function to simulate sending token to backend
// In a real app, this would be an API call to your server
async function sendTokenToServer(token: string) {
  console.log("Attempting to send FCM token to server (simulated):", token);
  // Example:
  // const firebaseUser = auth.currentUser;
  // if (firebaseUser) {
  //   const response = await fetch('/api/save-fcm-token', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ userId: firebaseUser.uid, token }),
  //   });
  //   if (response.ok) {
  //     console.log("FCM token saved to backend.");
  //   } else {
  //     console.error("Failed to save FCM token to backend.");
  //   }
  // }
  return Promise.resolve(); // Simulate success
}

export function FcmInitializer() {
  const { toast } = useToast();

  useEffect(() => {
    const setupFCM = async () => {
      if (!('Notification' in window)) {
        console.log('This browser does not support desktop notification');
        return;
      }

      try {
        const token = await requestPermission();
        if (token) {
          console.log("FCM Token received in FcmInitializer:", token);
          // *** IMPORTANT: Send this token to your backend server ***
          // Your backend needs this token to send targeted notifications.
          // Example: await sendTokenToServer(token);
          await sendTokenToServer(token); // Placeholder for actual backend call

          toast({
            title: "Push Notifications Enabled",
            description: "You're all set to receive important alerts from Rocket Meme!",
            duration: 7000,
          });
        }
      } catch (error) {
        console.error("Error during FCM permission request in FcmInitializer:", error);
        // Toast for error is handled within requestPermission usually
      }

      try {
        onMessageListener()
          .then((payload: any) => {
            console.log('Foreground message received. ', payload);
            toast({
              title: payload.notification?.title || "New Rocket Meme Alert!",
              description: payload.notification?.body || "You have a new notification.",
            });
          })
          .catch(err => console.error('Failed to listen for foreground messages: ', err));
      } catch (error) {
        console.error("Error setting up onMessageListener:", error);
      }
    };

    setupFCM();
  }, [toast]);

  return null;
}
