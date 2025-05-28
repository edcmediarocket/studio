
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/icons/logo";
import { KeyRound, AtSign, Loader2, UserPlus, Smartphone, MessageSquare, Send } from "lucide-react";
import { auth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
);

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoadingPhone, setIsLoadingPhone] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [loginMode, setLoginMode] = useState<'email' | 'phone'>('email');

  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let verifier: RecaptchaVerifier | undefined;
    if (loginMode === 'phone' && !window.recaptchaVerifier && recaptchaContainerRef.current && auth) {
      try {
        verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
          'size': 'invisible',
          'callback': (response: any) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
          },
          'expired-callback': () => {
            toast({ title: "reCAPTCHA Expired", description: "Please try sending the code again.", variant: "default" });
          }
        });
        verifier.render().catch(err => {
            console.error("RecaptchaVerifier render error:", err);
            const detailedErrorMsg = "Failed to initialize reCAPTCHA. Check browser settings (cookies/sessionStorage, privacy extensions) or network. Refresh if issues persist.";
            setError(detailedErrorMsg);
            toast({ title: "reCAPTCHA Error", description: detailedErrorMsg, variant: "destructive", duration: 10000 });
        });
        window.recaptchaVerifier = verifier;
      } catch (err) {
        console.error("Error initializing RecaptchaVerifier:", err);
        const detailedErrorMsg = "Failed to initialize phone sign-in security. Check Firebase reCAPTCHA config & browser settings. Refresh if issues persist.";
        setError(detailedErrorMsg);
        toast({ title: "Phone Sign-In Init Error", description: detailedErrorMsg, variant: "destructive", duration: 10000 });
      }
    }
    
    return () => {
      if (window.recaptchaVerifier) {
         try {
          window.recaptchaVerifier.clear();
        } catch (e) {
           console.warn("Error clearing global reCAPTCHA verifier on unmount:", e);
        }
      }
    };
  }, [loginMode, toast]); 

  const handleEmailSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!auth) {
      setError("Authentication service not ready. Please try again shortly.");
      toast({ title: "Error", description: "Auth service not ready.", variant: "destructive" });
      return;
    }
    setIsLoadingEmail(true);
    setError(null);

    try {
      if (isSignUpMode) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "Sign Up Successful", description: "Welcome! Your account has been created." });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Login Successful", description: "Welcome back!" });
      }
      router.push('/');
    } catch (err: any) {
      console.error("Email/Password action error:", err);
      let errorMessage = err.message || `Failed to ${isSignUpMode ? 'sign up' : 'login'}. Please check your credentials.`;
      if (err.code === 'auth/user-not-found' && !isSignUpMode) {
        errorMessage = "User not found. Have you signed up? Or try Google Sign-In.";
      } else if (err.code === 'auth/wrong-password' && !isSignUpMode) {
        errorMessage = "Incorrect password. Please try again.";
      } else if (err.code === 'auth/email-already-in-use' && isSignUpMode) {
        errorMessage = "This email is already in use. Please try logging in.";
      } else if (err.code === 'auth/api-key-not-valid') {
        errorMessage = "Firebase API Key is invalid. Please check the Firebase configuration in your app. If you are the developer, verify the API key in your Firebase project settings.";
      }
      setError(errorMessage);
      toast({ title: `${isSignUpMode ? 'Sign Up' : 'Login'} Failed`, description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) {
      setError("Authentication service not ready. Please try again shortly.");
      toast({ title: "Error", description: "Auth service not ready.", variant: "destructive" });
      return;
    }
    setIsLoadingGoogle(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Google Sign-In Successful", description: "Welcome!" });
      router.push('/');
    } catch (err: any) {
      const errorCode = err.code;
      const errorMessageText = err.message;
      if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
        toast({
          title: "Google Sign-In Cancelled",
          description: "Popup closed or request cancelled. Ensure popups are allowed and no extensions are blocking it. Try again.",
          variant: "default",
          duration: 7000,
        });
        setError(null);
      } else if (errorCode === 'auth/account-exists-with-different-credential') {
         setError("An account already exists with this email using a different sign-in method (e.g., email/password). Try that method.");
         toast({ title: "Account Conflict", description: "This email is linked to a different sign-in method. Try that method.", variant: "destructive", duration: 10000});
      } else if (errorCode === 'auth/api-key-not-valid') {
        setError("Firebase API Key is invalid for Google Sign-In. Please check Firebase configuration. If you are the developer, verify the API key and OAuth settings in your Firebase and Google Cloud projects.");
        toast({ title: "Google Sign-In Failed", description: "Firebase API Key invalid or OAuth misconfigured. Check configuration.", variant: "destructive", duration: 10000 });
      } else if (errorMessageText && (errorMessageText.toLowerCase().includes("action is invalid") || errorMessageText.toLowerCase().includes("redirect uri mismatch"))) {
          setError("Google Sign-In failed: Invalid authentication action or redirect URI mismatch. Check Firebase/Google Cloud project settings (Authorized Domains, OAuth Redirect URIs).");
          toast({ title: "Google Sign-In Failed", description: "Configuration issue suspected (redirect URIs). Check Firebase/Google Cloud settings.", variant: "destructive", duration: 10000 });
      } else {
        console.error("Google sign-in error:", err);
        setError(errorMessageText || "Failed to login with Google. Ensure popups are allowed and no extensions block them.");
        toast({ title: "Google Sign-In Failed", description: errorMessageText || "Please try again. Ensure popups are allowed.", variant: "destructive", duration: 8000 });
      }
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleSendCode = async () => {
    if (!auth) {
      setError("Authentication service not ready. Please try again shortly.");
      toast({ title: "Error", description: "Auth service not ready.", variant: "destructive" });
      return;
    }
    if (!window.recaptchaVerifier) {
        setError("reCAPTCHA verifier not initialized. Please refresh the page and try again.");
        toast({ title: "Error", description: "Security check not ready. Please refresh.", variant: "destructive" });
        return;
    }
    if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
        setError("Invalid phone number format. Please include '+' and country code (e.g., +12223334444).");
        toast({ title: "Invalid Phone", description: "Use format like +12223334444.", variant: "destructive" });
        return;
    }
    setIsLoadingPhone(true);
    setError(null);
    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      window.confirmationResult = confirmation;
      setIsCodeSent(true);
      toast({ title: "Verification Code Sent", description: `Code sent to ${phoneNumber}.` });
    } catch (err: any) {
      console.error("Error sending verification code:", err);
      let detailedErrorMsg = err.message || "Failed to send code. Check reCAPTCHA config & phone number.";
      if (err.code === 'auth/captcha-check-failed' || err.code === 'auth/missing-recaptcha-token') {
        detailedErrorMsg = "reCAPTCHA verification failed. Complete the security check or refresh. Check browser extensions.";
      } else if (err.message && (err.message.toLowerCase().includes("missing initial state") || err.message.toLowerCase().includes("sessionstorage is inaccessible"))) {
        detailedErrorMsg = "Auth failed due to missing session data. Check browser privacy settings (cookies/sessionStorage) or extensions. Ensure popups are allowed and try an incognito window.";
      } else if (err.code === 'auth/api-key-not-valid') {
        detailedErrorMsg = "Firebase API Key is invalid for phone sign-in. Please check Firebase configuration. If you are the developer, verify the API key in your Firebase project settings.";
      }
      setError(detailedErrorMsg);
      toast({ title: "Code Send Failed", description: detailedErrorMsg, variant: "destructive", duration: 10000 });

      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear(); 
        if (recaptchaContainerRef.current && auth) {
             try {
                window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, { size: 'invisible' });
             } catch (renderErr) {
                console.error("RecaptchaVerifier re-initialization error during error handling:", renderErr);
             }
        }
      }
    } finally {
      setIsLoadingPhone(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!window.confirmationResult) {
      setError("No confirmation result. Please request a new code.");
      toast({ title: "Error", description: "Verification session expired/not initiated. Send code again.", variant: "destructive" });
      setIsCodeSent(false);
      return;
    }
    setIsLoadingPhone(true);
    setError(null);
    try {
      await window.confirmationResult.confirm(verificationCode);
      toast({ title: "Phone Sign-In Successful", description: "Welcome!" });
      router.push('/');
    } catch (err: any) {
      console.error("Error verifying code:", err);
      let detailedErrorMsg = err.message || "Failed to verify code. Incorrect or expired.";
      if (err.code === 'auth/api-key-not-valid') {
        detailedErrorMsg = "Firebase API Key is invalid during code verification. Check Firebase configuration. If you are the developer, verify the API key in your Firebase project settings.";
      }
      setError(detailedErrorMsg);
      toast({ title: "Verification Failed", description: detailedErrorMsg, variant: "destructive" });
    } finally {
      setIsLoadingPhone(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setError(null);
  };

  const switchLoginMethod = (method: 'email' | 'phone') => {
    setLoginMode(method);
    setError(null);
    setIsCodeSent(false);
    setPhoneNumber('');
    setVerificationCode('');
  };


  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background to-primary/30">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <Link href="/" className="inline-block mx-auto mb-4">
            <Logo className="h-12 w-auto" />
          </Link>
          <CardTitle className="text-2xl">
            {loginMode === 'email' ? (isSignUpMode ? "Create Your Rocket Meme Account" : "Welcome Back!") : "Sign In with Phone"}
          </CardTitle>
          <CardDescription>
            {loginMode === 'email' ? (isSignUpMode ? "Fill in your details to get started." : "Enter your credentials or sign in with Google.") : (isCodeSent ? "Enter the verification code sent to your phone." : "Enter your phone number to receive a verification code.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {loginMode === 'email' && (
            <>
              <Button variant="outline" className="w-full text-lg py-6" onClick={handleGoogleLogin} disabled={isLoadingGoogle || isLoadingEmail || isLoadingPhone}>
                {isLoadingGoogle ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                Sign in with Google
              </Button>
              <p className="text-xs text-center text-muted-foreground -mt-2 px-2">
                If Google Sign-In fails or popup is cancelled, ensure popups are allowed in your browser and no extensions (like ad blockers or privacy guards) are interfering.
              </p>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <form onSubmit={handleEmailSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@rocketmeme.com"
                      required
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoadingEmail || isLoadingGoogle || isLoadingPhone}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      required
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoadingEmail || isLoadingGoogle || isLoadingPhone}
                      placeholder={isSignUpMode ? "Create a strong password (min. 6 characters)" : "Enter your password"}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-lg py-6" disabled={isLoadingEmail || isLoadingGoogle || isLoadingPhone}>
                  {isLoadingEmail && isSignUpMode ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isLoadingEmail && !isSignUpMode ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {!isLoadingEmail && isSignUpMode ? <UserPlus className="mr-2 h-5 w-5" /> : null}
                  {!isLoadingEmail && !isSignUpMode ? <KeyRound className="mr-2 h-5 w-5" /> : null}
                  {isSignUpMode ? "Sign Up" : "Login"}
                </Button>
              </form>
            </>
          )}

          {loginMode === 'phone' && (
            <div className="grid gap-4">
              {!isCodeSent ? (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="+12223334444"
                        required
                        className="pl-10"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={isLoadingPhone}
                      />
                    </div>
                     <p className="text-xs text-muted-foreground">Include '+' and country code.</p>
                  </div>
                  <Button onClick={handleSendCode} className="w-full bg-primary hover:bg-primary/90 text-lg py-6" disabled={isLoadingPhone || !phoneNumber.trim()}>
                    {isLoadingPhone ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                    Send Verification Code
                  </Button>
                </>
              ) : (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="verificationCode">Verification Code</Label>
                     <div className="relative">
                      <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="verificationCode"
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter 6-digit code"
                        required
                        className="pl-10"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        disabled={isLoadingPhone}
                      />
                    </div>
                  </div>
                  <Button onClick={handleVerifyCode} className="w-full bg-primary hover:bg-primary/90 text-lg py-6" disabled={isLoadingPhone || !verificationCode.trim()}>
                    {isLoadingPhone ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-5 w-5" />}
                    Verify & Sign In
                  </Button>
                   <Button variant="link" size="sm" onClick={() => { setIsCodeSent(false); setError(null); }} disabled={isLoadingPhone}>
                     Entered wrong number or didn't get code?
                  </Button>
                </>
              )}
              <div ref={recaptchaContainerRef} id="recaptcha-container-login"></div>
            </div>
          )}

          {error && <p className="text-xs text-destructive text-center pt-2">{error}</p>}

        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 text-sm pt-4">
          {loginMode === 'email' && !isSignUpMode && (
            <Link href="#" className="font-medium text-primary hover:text-neon hover:underline">
              Forgot your password?
            </Link>
          )}
          {loginMode === 'email' && (
            <Button variant="link" onClick={toggleAuthMode} className="font-medium text-primary hover:text-neon">
              {isSignUpMode ? "Already have an account? Login" : "Don't have an account? Sign Up"}
            </Button>
          )}
          <Button variant="link" onClick={() => switchLoginMethod(loginMode === 'email' ? 'phone' : 'email')} className="font-medium text-primary hover:text-neon">
            {loginMode === 'email' ? "Sign in with Phone Number" : "Sign in with Email/Password"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
