'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = async () => {
    try {
      // Server-side session validation
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
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
      router.push('/');
    } else {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setUser(null);
    router.push('/login');
  };

    const hasPermission = (moduleName) => {
      const role = user?.role?.toLowerCase();
      if (role === 'founder' || role === 'admin') return true;
      if (!user?.permissions) return false;
      return user.permissions.includes(moduleName);
    };

    return (
      <AuthContext.Provider
        value={{
          user,
          loading,
          isFounder: user?.role?.toLowerCase() === 'founder' || user?.role?.toLowerCase() === 'admin',
          isAdmin: user?.role?.toLowerCase() === 'founder' || user?.role?.toLowerCase() === 'admin',
          isHR: user?.role?.toLowerCase() === 'hr',
          isManagement: ['founder', 'admin', 'hr'].includes(user?.role?.toLowerCase()),
          permissions: user?.permissions || [],
          hasPermission,
          login,
          logout,
          refreshUser: checkAuth,
          isAuthenticated: !!user
        }}
      >
        {children}
      </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
