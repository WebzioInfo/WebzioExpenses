'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Navbar } from '@/src/components/layout/Navbar';
import { QuickAdd } from '@/src/components/layout/QuickAdd';
import { useAuth } from '@/src/context/AuthContext';
import { Skeleton } from '@/src/components/ui/Skeleton';

// Pages that don't need the main layout (full-screen)
const PUBLIC_PATHS = ['/login'];

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        if (!isPublic) router.replace('/login');
      } else if (isAuthenticated && isPublic) {
        // Logged in user on login page — go home
        router.replace('/');
      }
    }
  }, [loading, isAuthenticated, isPublic, router, pathname]);

  // While checking auth, show premium loader
  if (loading) {
    return (
      <div className="min-h-screen bg-accounting-bg flex items-center justify-center">
        <div className="space-y-6 text-center animate-in fade-in duration-500">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 bg-accounting-bg/10 rounded-2xl animate-pulse -inner" />
            <div className="absolute inset-2 border-2 border-t-accounting-bg border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black text-accounting-text uppercase tracking-[0.4em]">Webzio Accounting</p>
            <p className="text-[8px] font-black text-accounting-text/60 uppercase tracking-widest animate-pulse">Establishing Secure Session...</p>
          </div>
        </div>
      </div>
    );
  }

  // Prevent flash of protected content while redirecting
  if (!isAuthenticated && !isPublic) {
    return null;
  }

  // Public pages (login) — render without shell
  if (isPublic) return <>{children}</>;

  return (
    <div className="flex h-screen bg-accounting-bg selection:bg-accounting-bg selection:text-accounting-bg">
      {/* Navigation Layer */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-10 focus:outline-none scroll-smooth">
          <div className="max-w-7xl mx-auto pb-28 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>

        {/* Floating Actions */}
        <QuickAdd />
      </div>
    </div>
  );
}
