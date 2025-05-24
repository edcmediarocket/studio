
"use client";

import { useEffect } from 'react';
import { requestPermission, onMessageListener } from '@/lib/firebase'; // Assuming firebase.ts exports these
import { useToast } from '@/hooks/use-toast'; // Using your app's toast system

export function FcmInitializer() {
  const { toast } = useToast();

  useEffect(() => {
    const setupFCM = async () => {
      // Check if Notification API is available (basic check, Firebase SDK does more)
      if (!('Notification' in window)) {
        console.log('This browser does not support desktop notification');
        return;
      }

      // Request permission
      try {
        const token = await requestPermission();
        if (token) {
          console.log("FCM Token received in FcmInitializer:", token);
          // Here you would typically send the token to your backend
          // to store it against the authenticated user (e.g., in Firestore).
          // Example: await sendTokenToServer(token);
          toast({
            title: "Notifications Enabled",
            description: "You will now receive price alerts!",
            duration: 5000,
          });
        } else {
          // Permission denied or error getting token
          // Handled within requestPermission, but you can add more UI feedback here if needed
        }
      } catch (error) {
        console.error("Error during FCM permission request:", error);
      }

      // Listen for foreground messages
      try {
        onMessageListener()
          .then((payload: any) => { // Cast to any if payload structure is unknown
            console.log('Foreground message received. ', payload);
            toast({
              title: payload.notification?.title || "New Notification",
              description: payload.notification?.body || "You have a new message.",
            });
          })
          .catch(err => console.error('Failed to listen for foreground messages: ', err));
      } catch (error) {
        console.error("Error setting up onMessageListener:", error);
      }
    };

    setupFCM();
  }, [toast]);

  return null; // This component does not render anything visible
}
