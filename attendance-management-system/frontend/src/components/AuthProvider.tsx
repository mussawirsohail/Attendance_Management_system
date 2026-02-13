// src/components/AuthProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on initial load
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    // Prevent access to protected routes if not logged in
    if (!token && !['/login', '/signup'].includes(window.location.pathname)) {
      router.push('/login');
    }
  }, [router]);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
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