import { useAuthStore } from '@/stores/authStore';
import { authService, User } from '@/services/authService';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';
import Cookies from 'js-cookie';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, login: storeLogin, logout: storeLogout, updateUser } = useAuthStore();

  useEffect(() => {
    const token = Cookies.get('token');
    if (token && !user) {
      // Re-fetch user if token exists but user doesn't (page reload)
      authService.getMe().then((res) => {
        if (res.success && res.data?.user) {
          storeLogin(res.data.user, token);
        } else {
          storeLogout();
        }
      });
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await authService.loginWithPassword(email, password);
      if (res.success && res.data?.token && res.data.user) {
        storeLogin(res.data.user, res.data.token);
        toast.success('Logged in successfully');
        return true;
      }
      toast.error(res.message || 'Login failed');
      return false;
    } catch (error) {
      toast.error('Login failed');
      return false;
    }
  };

  const logout = () => {
    storeLogout();
    toast.success('Logged out successfully');
  };

  const register = async (name: string, email: string): Promise<boolean> => {
    try {
      const res = await authService.register(name, email);
      if (res.success) {
        toast.success(res.message || 'OTP sent successfully');
        return true;
      }
      toast.error(res.message || 'Registration failed');
      return false;
    } catch (error) {
      toast.error('Registration failed');
      return false;
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    try {
      const res = await authService.verifyOTP(email, otp);
      if (res.success && res.data?.token && res.data.user) {
        storeLogin(res.data.user, res.data.token);
        toast.success('Email verified successfully');
        return true;
      }
      toast.error(res.message || 'Invalid OTP');
      return false;
    } catch (error) {
      toast.error('Verification failed');
      return false;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const res = await authService.googleLogin();
      if (res.success) {
        toast.success('Logged in with Google');
      } else {
        toast.error(res.message || 'Google login not supported yet');
      }
    } catch (error) {
      toast.error('Google login failed');
    }
  };

  const updateProfile = async (name: string) => {
    try {
      const res = await authService.updateProfile(name);
      if (res.success) {
        updateUser({ name });
        toast.success('Profile updated');
        return true;
      }
      return false;
    } catch (error) {
      toast.error('Failed to update profile');
      return false;
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    verifyOTP,
    signInWithGoogle,
    updateProfile
  };
};

// Deprecated: AuthProvider is no longer needed with Zustand
export const AuthProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
