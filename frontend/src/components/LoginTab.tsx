"use client";

import { useState } from 'react';
import { GoogleIcon } from './GoogleIcon';
import { sendOtp, verifyOtp, googleLogin } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export function LoginTab() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSendOtp = async () => {
    setIsLoading(true);
    try {
      const res = await sendOtp(email);
      if (res.success) {
        setOtpSent(true);
        toast.success('OTP sent successfully!');
      } else {
        toast.error(res.message || 'Failed to send OTP');
      }
    } catch {
      toast.error('An unexpected error occurred');
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try {
      const res = await verifyOtp(email, otp);
      if (res.token) {
        login(res.token);
        toast.success('Logged in successfully!');
      } else {
        toast.error(res.message || 'Invalid OTP');
      }
    } catch {
      toast.error('An unexpected error occurred');
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <button onClick={googleLogin} className="w-full flex items-center justify-center gap-3 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white font-semibold">
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
        onClick={otpSent ? handleVerifyOtp : handleSendOtp}
        className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all text-white font-semibold disabled:bg-blue-800"
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : (otpSent ? 'Verify OTP' : 'Send OTP')}
      </button>
    </div>
  );
}
