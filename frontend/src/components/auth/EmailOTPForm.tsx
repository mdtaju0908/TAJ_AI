"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSeparator, 
  InputOTPSlot 
} from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/useAuth";
import { useOTP } from "@/hooks/useOTP";
import { Loader2, Mail, User, ArrowRight, RefreshCw } from "lucide-react";
import { AuthError } from "./AuthError";
import toast from "react-hot-toast";

type AuthStep = "email" | "otp" | "name";

interface EmailOTPFormProps {
  isSignUp: boolean;
  onSuccess: () => void;
}

export function EmailOTPForm({ isSignUp, onSuccess }: EmailOTPFormProps) {
  const { sendOTP, verifyOTP, updateProfile, login } = useAuth();
  const { timer, canResend, startTimer } = useOTP();
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleSendOTP = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const success = await sendOTP(email);
      if (success) {
        setStep("otp");
        startTimer();
        toast.success("OTP sent to your email");
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const token = await verifyOTP(email, otp);
      if (token) {
        login(token);
        if (isSignUp) {
          setStep("name");
        } else {
          toast.success("Welcome back!");
          onSuccess();
        }
      } else {
        setError("Invalid OTP code. Please try again.");
      }
    } catch (err) {
      setError("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const success = await updateProfile(name);
      if (success) {
        toast.success(`Welcome, ${name}!`);
        onSuccess();
      } else {
        setError("Failed to update profile");
      }
    } catch (err) {
      setError("Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  if (step === "email") {
    return (
      <form onSubmit={handleSendOTP} className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-300">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            leadingIcon={<Mail className="w-4 h-4" />}
            className="h-12 bg-white/5 border-white/10"
            required
          />
        </div>
        <AuthError message={error} />
        <Button
          type="submit"
          disabled={loading || !email}
          className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all group"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              Continue with Email
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </form>
    );
  }

  if (step === "otp") {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
        <div className="space-y-2 text-center">
          <Label className="text-gray-300 text-sm">Enter the 6-digit code sent to</Label>
          <div className="text-white font-medium">{email}</div>
        </div>

        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            disabled={loading}
          >
            <InputOTPGroup className="gap-2">
              <InputOTPSlot index={0} className="w-10 h-12 md:w-12 md:h-14 bg-white/5 border-white/10 text-lg md:text-xl rounded-lg" />
              <InputOTPSlot index={1} className="w-10 h-12 md:w-12 md:h-14 bg-white/5 border-white/10 text-lg md:text-xl rounded-lg" />
              <InputOTPSlot index={2} className="w-10 h-12 md:w-12 md:h-14 bg-white/5 border-white/10 text-lg md:text-xl rounded-lg" />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup className="gap-2">
              <InputOTPSlot index={3} className="w-10 h-12 md:w-12 md:h-14 bg-white/5 border-white/10 text-lg md:text-xl rounded-lg" />
              <InputOTPSlot index={4} className="w-10 h-12 md:w-12 md:h-14 bg-white/5 border-white/10 text-lg md:text-xl rounded-lg" />
              <InputOTPSlot index={5} className="w-10 h-12 md:w-12 md:h-14 bg-white/5 border-white/10 text-lg md:text-xl rounded-lg" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <AuthError message={error} />

        <div className="space-y-4">
          <Button
            onClick={handleVerifyOTP}
            disabled={loading || otp.length !== 6}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Code"}
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-400">Didn't get a code? </span>
            <button
              onClick={handleSendOTP}
              disabled={loading || !canResend}
              className="text-blue-400 hover:text-blue-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
            >
              {canResend ? (
                <>
                  <RefreshCw className="w-3 h-3" />
                  Resend now
                </>
              ) : (
                `Resend in ${timer}s`
              )}
            </button>
          </div>
          
          <button 
            onClick={() => setStep("email")}
            className="w-full text-center text-xs text-gray-500 hover:text-gray-400 underline underline-offset-4"
          >
            Change email address
          </button>
        </div>
      </div>
    );
  }

  if (step === "name") {
    return (
      <form onSubmit={handleUpdateProfile} className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-300">Your Full Name</Label>
          <Input
            id="name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            leadingIcon={<User className="w-4 h-4" />}
            className="h-12 bg-white/5 border-white/10"
            required
            autoFocus
          />
          <p className="text-xs text-gray-500">How should we call you?</p>
        </div>
        <AuthError message={error} />
        <Button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all group"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              Complete Sign Up
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </form>
    );
  }

  return null;
}
