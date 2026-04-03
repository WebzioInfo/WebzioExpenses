'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = async () => {
    try {
      // First Check if System Needs Setup
      const setupRes = await fetch('/api/auth/setup');
      const setupData = await setupRes.json();
      
      if (setupData.needsSetup) {
        setNeedsSetup(true);
        return;
      }
      
      setNeedsSetup(false);
      
      // Check for local storage session
      const storedUser = localStorage.getItem('webzio_currentUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        // Re-validate session with API
        const res = await fetch('/api/auth/me', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: userData.id })
        });
        
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('webzio_currentUser');
          setUser(null);
        }
      }
    } catch (err) {
      console.error('Auth check error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      localStorage.setItem('webzio_currentUser', JSON.stringify(data.user));
      router.push('/');
    } else {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
  };

  const setup = async (userData) => {
    const res = await fetch('/api/auth/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      localStorage.setItem('webzio_currentUser', JSON.stringify(data.user));
      setNeedsSetup(false);
      router.push('/');
    } else {
      const err = await res.json();
      throw new Error(err.error || 'Setup failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('webzio_currentUser');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        needsSetup,
        isAdmin: user?.role === 'admin',
        login,
        setup,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
