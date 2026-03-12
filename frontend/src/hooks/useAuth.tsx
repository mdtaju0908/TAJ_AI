import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { toast } from 'react-hot-toast';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, login: storeLogin, logout: storeLogout, updateUser } = useAuthStore();

  const login = (token: string) => {
    // In a real app, decode token to get user info.
    // For now, we mock it or fetch user profile.
    // Assuming token is just a string for now.
    storeLogin({
      id: 'mock-user-id',
      email: 'user@example.com',
      name: 'User',
      provider: 'email'
    });
  };

  const logout = () => {
    storeLogout();
    toast.success('Logged out successfully');
  };

  const sendOTP = async (email: string) => {
    try {
      const res = await authService.sendOTP(email);
      return res.success;
    } catch (error) {
      toast.error('Failed to send OTP');
      return false;
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const res = await authService.verifyOTP(email, otp);
      if (res.success && res.user) {
        storeLogin({
          ...res.user,
          provider: 'email'
        } as any);
        return res.token || 'mock-token';
      }
      return null;
    } catch (error) {
      toast.error('Failed to verify OTP');
      return null;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const res = await authService.googleLogin();
      if (res.success && res.user) {
        storeLogin({
          ...res.user,
          provider: 'google'
        } as any);
        toast.success('Logged in with Google');
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
    sendOTP,
    verifyOTP,
    signInWithGoogle,
    updateProfile
  };
};

// Deprecated: AuthProvider is no longer needed with Zustand
export const AuthProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
