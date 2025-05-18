
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/icons/logo";
import { KeyRound, AtSign, Loader2, UserPlus } from "lucide-react";
import { auth } from '@/lib/firebase'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
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

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (isSignUpMode) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "Sign Up Successful", description: "Welcome! Your account has been created." });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Login Successful", description: "Welcome back!" });
      }
      router.push('/'); // Redirect to dashboard
    } catch (err: any) {
      console.error("Email/Password action error:", err);
      setError(err.message || `Failed to ${isSignUpMode ? 'sign up' : 'login'}. Please check your credentials.`);
      toast({ title: `${isSignUpMode ? 'Sign Up' : 'Login'} Failed`, description: err.message || "An error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Google Sign-In Successful", description: "Welcome!" });
      router.push('/'); // Redirect to dashboard
    } catch (err: any) {
      console.error("Google login error:", err);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        toast({
          title: "Google Sign-In Cancelled",
          description: "The Google Sign-In popup was closed or the process was cancelled by the user or browser.",
          variant: "default", 
        });
      } else {
        setError(err.message || "Failed to login with Google. Please try again.");
        toast({ title: "Google Sign-In Failed", description: err.message || "Please try again.", variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setError(null); // Clear errors when switching modes
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background to-primary/30">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <Link href="/" className="inline-block mx-auto mb-4">
            <Logo className="h-12 w-auto" />
          </Link>
          <CardTitle className="text-2xl">
            {isSignUpMode ? "Create Your Rocket Meme Account" : "Welcome Back to Rocket Meme!"}
          </CardTitle>
          <CardDescription>
            {isSignUpMode ? "Fill in your details to get started." : "Enter your credentials or sign in with Google to access your dashboard."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button variant="outline" className="w-full text-lg py-6" onClick={handleGoogleLogin} disabled={isLoading}>
            {isLoading && !isSignUpMode ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Sign in with Google
          </Button>
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
          <form onSubmit={handleSubmit} className="grid gap-4">
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                  placeholder={isSignUpMode ? "Choose a strong password" : "Enter your password"}
                />
              </div>
            </div>
            {error && <p className="text-xs text-destructive text-center">{error}</p>}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-lg py-6" disabled={isLoading}>
              {isLoading && isSignUpMode ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading && !isSignUpMode ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {!isLoading && isSignUpMode ? <UserPlus className="mr-2 h-5 w-5" /> : null}
              {!isLoading && !isSignUpMode && !isSignUpMode ? <KeyRound className="mr-2 h-5 w-5" /> : null}
              {isSignUpMode ? "Sign Up" : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 text-sm">
           {!isSignUpMode && (
            <Link href="#" className="font-medium text-primary hover:text-neon hover:underline">
                Forgot your password?
            </Link>
           )}
          <Button variant="link" onClick={toggleMode} className="font-medium text-primary hover:text-neon">
            {isSignUpMode ? "Already have an account? Login" : "Don't have an account? Sign Up"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    