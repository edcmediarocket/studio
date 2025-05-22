
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/icons/logo";
import { KeyRound, AtSign, Loader2, UserPlus, Smartphone, MessageSquare, Send } from "lucide-react"; // Added Send icon
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
    if (loginMode === 'phone' && !window.recaptchaVerifier && recaptchaContainerRef.current && auth) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
          'size': 'invisible',
          'callback': (response: any) => {
            // console.log("reCAPTCHA verified");
          },
          'expired-callback': () => {
            toast({ title: "reCAPTCHA Expired", description: "Please try sending the code again.", variant: "default" });
          }
        });
        window.recaptchaVerifier.render().catch(err => {
            console.error("RecaptchaVerifier render error:", err);
            const detailedErrorMsg = "Failed to initialize reCAPTCHA for phone sign-in. This might be due to browser settings (e.g., blocking cookies/sessionStorage, strict privacy extensions) or network issues. Please check your browser settings and try refreshing.";
            setError(detailedErrorMsg);
            toast({ title: "Phone Sign-In Security Check Failed", description: detailedErrorMsg, variant: "destructive", duration: 10000 });
        });
      } catch (err) {
        console.error("Error initializing RecaptchaVerifier:", err);
        const detailedErrorMsg = "Failed to initialize phone sign-in security. Please check Firebase reCAPTCHA configuration and browser settings. If the issue persists, try refreshing the page.";
        setError(detailedErrorMsg);
        toast({ title: "Phone Sign-In Error", description: detailedErrorMsg, variant: "destructive", duration: 10000 });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginMode]); 


  const handleEmailSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!auth) {
      setError("Authentication service not ready.");
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
      setError(err.message || `Failed to ${isSignUpMode ? 'sign up' : 'login'}. Please check your credentials.`);
      toast({ title: `${isSignUpMode ? 'Sign Up' : 'Login'} Failed`, description: err.message || "An error occurred.", variant: "destructive" });
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) {
      setError("Authentication service not ready.");
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
    } catch (err: any)_LOG_Type.ERROR, "Auth", "signInWithPopup", err);
      const errorCode = err.code;
      const errorMessage = err.message;
      if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
        toast({
          title: "Google Sign-In Cancelled",
          description: "The Google Sign-In window was closed or cancelled before completion. Please ensure popups are allowed and try again if you wish to sign in with Google.",
          variant: "default",
          duration: 7000,
        });
        setError(null); // Don't show a red error for user cancellation
      } else {
        setError(errorMessage || "Failed to login with Google. Please try again.");
        toast({ title: "Google Sign-In Failed", description: errorMessage || "Please try again.", variant: "destructive" });
      }
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleSendCode = async () => {
    if (!auth) {
      setError("Authentication service not ready.");
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
      let detailedErrorMsg = err.message || "Failed to send verification code. Ensure reCAPTCHA is configured and phone number is valid.";
      if (err.code === 'auth/captcha-check-failed' || err.code === 'auth/missing-recaptcha-token') {
        detailedErrorMsg = "reCAPTCHA verification failed. Please complete the security check and try again. If issues persist, check browser extensions or refresh the page.";
      } else if (err.message && (err.message.includes("missing initial state") || err.message.includes("sessionStorage is inaccessible"))) {
        detailedErrorMsg = "Authentication failed due to missing session data. This can be caused by browser privacy settings (like blocking third-party cookies or sessionStorage) or extensions. Please check your browser settings and try again. Using an incognito window might also help diagnose the issue.";
      }
      setError(detailedErrorMsg);
      toast({ title: "Code Send Failed", description: detailedErrorMsg, variant: "destructive", duration: 10000 });
      
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear(); 
        if (recaptchaContainerRef.current && auth) {
             try {
                window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, { size: 'invisible' });
                // Note: It's not always necessary or safe to call .render() again here immediately
                // Firebase might handle re-rendering internally or on next attempt.
                // Awaiting render here could also cause issues if the container isn't perfectly ready.
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
      setError("No confirmation result found. Please request a new code.");
      toast({ title: "Error", description: "Verification session expired or was not initiated. Please send code again.", variant: "destructive" });
      setIsCodeSent(false); // Reset to allow resending code
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
      setError(err.message || "Failed to verify code. It might be incorrect or expired.");
      toast({ title: "Verification Failed", description: err.message || "Code incorrect or expired.", variant: "destructive" });
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
              <p className="text-xs text-center text-muted-foreground -mt-2">
                If Google Sign-In doesn't work, ensure popups are enabled and try again.
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
                      placeholder={isSignUpMode ? "Choose a strong password" : "Enter your password"}
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

    