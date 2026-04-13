'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('company'); 
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const savedMode = localStorage.getItem('webzio_view_mode');
    if (savedMode) setViewMode(savedMode);
  }, []);

  const toggleViewMode = () => {
    const newMode = viewMode === 'company' ? 'personal' : 'company';
    setViewMode(newMode);
    localStorage.setItem('webzio_view_mode', newMode);
  };

  const checkAuth = async () => {
    try {
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

  const role = user?.role?.toLowerCase();
  const isAdmin = role === 'admin' || role === 'founder';
  const isFounder = role === 'founder';
  const isHR = role === 'hr';
  const isStaff = role === 'staff';
  const isFreelancer = role === 'freelancer';
  const isSuperAdmin = isAdmin;
  const isManagement = isSuperAdmin || isHR;

  const hasPermission = (moduleName) => {
    if (isSuperAdmin) return true;
    
    // Normalize module names
    const target = moduleName.toLowerCase();
    const perms = (user?.permissions || []).map(p => p.toLowerCase());

    if (perms.includes(target)) return true;

    // HR Core Permissions Fallback
    if (isHR) {
      return ['team', 'work', 'attendance', 'dashboard'].includes(target);
    }
    
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        viewMode,
        toggleViewMode,
        isFounder,
        isAdmin,
        isSuperAdmin,
        isHR,
        isStaff,
        isFreelancer,
        isManagement,
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
