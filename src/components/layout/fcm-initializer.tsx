
"use client";

import { useEffect } from 'react';
import { requestPermission, onMessageListener, auth } from '@/lib/firebase'; // Assuming messaging is initialized here
import { useToast } from '@/hooks/use-toast';
// import { auth } from '@/lib/firebase'; // Already imported from lib/firebase

// Example function to simulate sending token to backend
// In a real app, this would be an API call to your server
async function sendTokenToServer(uid: string | undefined, token: string) {
  console.log("Attempting to send FCM token to server:", { uid, token });
  
  if (!uid) {
    console.warn("No user UID available to send FCM token.");
    return;
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    console.warn("Backend URL for saving FCM token is not configured. Skipping sendTokenToServer.");
    return;
  }

  try {
    // Using fetch as axios might not be a direct dependency here
    // If you have axios: import axios from 'axios';
    // await axios.post(`${backendUrl}/save-token`, { uid, token });
    
    const response = await fetch(`${backendUrl}/save-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid, token }),
    });

    if (response.ok) {
      console.log("FCM token successfully sent to backend.");
      // toast({ title: "FCM Token Synced", description: "Notification preferences updated."}); // Optional success toast
    } else {
      console.error("Failed to send FCM token to backend. Status:", response.status);
      const errorData = await response.text().catch(() => "Could not parse error response.");
      console.error("Backend error details:", errorData);
      // Using toast from useToast() which needs to be called from the component body.
      // This function is outside the component, so direct toast call here isn't ideal.
      // Better to return a status or throw an error to be handled by the caller.
      // For now, we'll log and rely on a generic message if needed from the caller.
      throw new Error(`Failed to sync token. Server responded with ${response.status}`);
    }
  } catch (error) {
    console.error("Error sending FCM token to backend (network or other):", error);
    throw error; // Re-throw to be caught by the caller
  }
}

const FCM_SETUP_TOAST_SHOWN_KEY = 'rocketMemeFcmSetupToastShown_v1';

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
          const currentUser = auth.currentUser;
          if (currentUser?.uid) {
            try {
              await sendTokenToServer(currentUser.uid, token);
              const toastShown = localStorage.getItem(FCM_SETUP_TOAST_SHOWN_KEY);
              if (toastShown !== 'true') {
                toast({
                  title: "Push Notifications Enabled",
                  description: "You're all set to receive important alerts from Rocket Meme!",
                  duration: 7000,
                });
                localStorage.setItem(FCM_SETUP_TOAST_SHOWN_KEY, 'true');
              }
            } catch (sendError) {
              console.error("FcmInitializer: Error sending token to server", sendError);
              toast({
                title: "Notification Sync Issue",
                description: "Could not sync notification preferences with the server. Some alerts might not be received.",
                variant: "default",
                duration: 7000,
              });
            }
          } else {
            console.warn("FcmInitializer: User not logged in, cannot send FCM token to server.");
          }
        }
      } catch (error) {
        console.error("Error during FCM permission request in FcmInitializer:", error);
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

    const timer = setTimeout(() => {
        setupFCM();
    }, 1000); 

    return () => clearTimeout(timer);

  }, [toast]);

  return null;
}
