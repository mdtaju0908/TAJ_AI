"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  signup: (name: string, email: string, password: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tajai_token');
    if (token) {
      // Here you would typically verify the token with your backend
      // For now, we'll just decode it (assuming JWT)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.id, name: payload.name, email: payload.email, avatar: payload.avatar });
      } catch (e) {
        localStorage.removeItem('tajai_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    localStorage.setItem('tajai_token', token);
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ id: payload.id, name: payload.name, email: payload.email, avatar: payload.avatar });
    } catch (e) {}
  };

  const logout = () => {
    localStorage.removeItem('tajai_token');
    setUser(null);
  };

  const signup = (name: string, email: string, password: string) => {
    const fakePayload = { id: Math.random().toString(36).slice(2), name, email };
    const token = `header.${btoa(JSON.stringify(fakePayload))}.signature`;
    login(token);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
