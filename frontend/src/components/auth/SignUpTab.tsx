"use client";

import { useState } from 'react';
import { GoogleIcon } from './GoogleIcon';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export function SignUpTab() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, verifyOTP, signInWithGoogle } = useAuth();

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const success = await register(name, email);
      if (success) {
        setOtpSent(true);
      }
    } catch {
      toast.error('An unexpected error occurred');
    }
    setIsLoading(false);
  };

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      await verifyOTP(email, otp);
    } catch {
      toast.error('An unexpected error occurred');
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <button onClick={signInWithGoogle} className="w-full flex items-center justify-center gap-3 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white font-semibold">
        <GoogleIcon className="w-6 h-6" />
        Continue with Google
      </button>
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-t border-[rgba(59,130,246,0.2)]" />
        <span className="text-gray-400 text-sm">OR</span>
        <hr className="flex-1 border-t border-[rgba(59,130,246,0.2)]" />
      </div>
      <div className="space-y-4">
        <input 
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={otpSent}
        />
        <input 
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={otpSent}
        />
        {otpSent && (
          <input 
            type="text"
            placeholder="6-Digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        )}
      </div>
      <button 
        onClick={otpSent ? handleVerify : handleRegister}
        className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all text-white font-semibold disabled:bg-blue-800"
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : (otpSent ? 'Create Account' : 'Send OTP')}
      </button>
    </div>
  );
}
