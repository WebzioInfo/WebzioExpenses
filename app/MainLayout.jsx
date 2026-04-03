'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/src/components/Sidebar';
import Navbar from '@/src/components/Navbar';
import { useAuth } from '@/src/context/AuthContext';
import QuickAdd from '@/src/components/QuickAdd';

// Pages that don't need the main layout (full-screen)
const PUBLIC_PATHS = ['/login'];

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, needsSetup, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        if (!isPublic) router.replace('/login');
      } else if (isAuthenticated && isPublic) {
        // Logged in user on login/setup page — go home
        router.replace('/');
      }
    }
  }, [loading, needsSetup, isAuthenticated, isPublic, router, pathname]);

  // While checking auth, show minimal loader
  if (loading) {
    return (
      <div className="min-h-screen bg-accounting-bg flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 bg-[#2D151F]/10 rounded-2xl mx-auto animate-pulse shadow-clay-inner" />
          <p className="text-[9px] font-black text-[#2D151F]/30 uppercase tracking-[0.4em]">Loading...</p>
        </div>
      </div>
    );
  }

  // Prevent flash of protected content while redirecting
  if ((needsSetup || !isAuthenticated) && !isPublic) {
    return null;
  }

  // Public pages (login, setup) — render without shell
  if (isPublic) return <>{children}</>;

  return (
    <div className="flex h-screen bg-accounting-bg selection:bg-[#2D151F] selection:text-[#F4F3DC]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-10 focus:outline-none scroll-smooth">
          <div className="max-w-7xl mx-auto page-transition pb-28">
            {children}
          </div>
        </main>
      </div>
      {/* Floating Quick Add */}
      <QuickAdd />
    </div>
  );
}
