import { create } from 'zustand';
import { User } from '@/services/authService';
import Cookies from 'js-cookie';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: (user, token) => {
    Cookies.set('token', token, { expires: 30 }); // 30 days
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    Cookies.remove('token');
    set({ user: null, isAuthenticated: false });
  },
  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
}));
