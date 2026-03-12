"use client";

import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { Chrome } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  const loginDefaults = useMemo(() => ({ email: "", password: "" }), []);
  const signupDefaults = useMemo(() => ({ name: "", email: "", password: "", confirm: "" }), []);

  const [loginForm, setLoginForm] = useState(loginDefaults);
  const [signupForm, setSignupForm] = useState(signupDefaults);

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
  const validatePassword = (password: string) => password.length >= 8;

  const onLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(loginForm.email)) {
      toast.error("Please enter a valid email");
      return;
    }
    if (!validatePassword(loginForm.password)) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const payload = { id: Math.random().toString(36).slice(2), name: "User", email: loginForm.email };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      login(token);
      toast.success("Signed in");
      onClose();
    } catch {
      toast.error("Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const onSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!validateEmail(signupForm.email)) {
      toast.error("Please enter a valid email");
      return;
    }
    if (!validatePassword(signupForm.password)) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (signupForm.password !== signupForm.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      signup(signupForm.name, signupForm.email, signupForm.password);
      toast.success("Account created");
      onClose();
    } catch {
      toast.error("Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignIn = () => {
    try {
      const payload = { id: Math.random().toString(36).slice(2), name: "Google User", email: "user@example.com" };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      login(token);
      toast.success("Signed in with Google");
      onClose();
    } catch {
      toast.error("Google sign-in failed");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome back</DialogTitle>
          <DialogDescription>Sign in or create your account</DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
          <TabsList>
            <TabsTrigger value="login" active={tab === "login"} onClick={(v) => setTab(v as "login")}>
              Login
            </TabsTrigger>
            <TabsTrigger value="signup" active={tab === "signup"} onClick={(v) => setTab(v as "signup")}>
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" active={tab === "login"}>
            <form onSubmit={onLoginSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <button type="button" className="text-xs text-gray-400 hover:text-gray-200" aria-label="Forgot password">
                  Forgot password?
                </button>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Signing in..." : "Sign in"}
              </Button>
              <Separator />
              <Button type="button" variant="secondary" className="w-full flex items-center gap-2" onClick={onGoogleSignIn} aria-label="Sign in with Google">
                <Chrome className="w-4 h-4" /> Continue with Google
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" active={tab === "signup"}>
            <form onSubmit={onSignupSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="signup-name">Name</Label>
                <Input
                  id="signup-name"
                  placeholder="Your name"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm((f) => ({ ...f, password: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="signup-confirm">Confirm Password</Label>
                <Input
                  id="signup-confirm"
                  type="password"
                  placeholder="••••••••"
                  value={signupForm.confirm}
                  onChange={(e) => setSignupForm((f) => ({ ...f, confirm: e.target.value }))}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating..." : "Create account"}
              </Button>
              <Separator />
              <Button type="button" variant="secondary" className="w-full flex items-center gap-2" onClick={onGoogleSignIn} aria-label="Sign up with Google">
                <Chrome className="w-4 h-4" /> Continue with Google
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
