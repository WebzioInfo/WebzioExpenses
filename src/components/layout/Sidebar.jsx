'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, List, FolderKanban, Users, BarChart3, Settings, UserCog, AlertCircle, Briefcase, Tag, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { cn } from '@/src/lib/utils';
import Image from 'next/image';

export const Sidebar = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'staff', 'freelancer'] },
    { name: 'My Work', path: '/tasks', icon: CheckCircle2, roles: ['admin', 'staff', 'freelancer'] },
    { name: 'My Money', path: '/transactions', icon: List, roles: ['admin', 'staff', 'freelancer'] },
    { name: 'Projects', path: '/projects', icon: FolderKanban, roles: ['admin'] },
    { name: 'Staff', path: '/staff', icon: Users, roles: ['admin'] },
    { name: 'Leads', path: '/leads', icon: BarChart3, roles: ['admin'] },
    { name: 'Clients', path: '/clients', icon: BarChart3, roles: ['admin'] },
    { name: 'Categories', path: '/categories', icon: Tag, roles: ['admin'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['admin', 'staff'] },
    { name: 'Users', path: '/users', icon: UserCog, roles: ['admin'] },
  ].filter(item => item.roles.includes(user?.role));

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-accounting-text/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "h-full bg-white lg:bg-transparent z-50 transition-all duration-300 w-72 fixed lg:static shrink-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full py-10 px-5">
          {/* Logo */}
          <div className="px-3 mb-10">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-clay-outer relative after:absolute after:inset-0 after:rounded-2xl after:shadow-clay-inner group-hover:scale-105 transition-transform overflow-hidden p-2.5">
                <Image src="/assets/logos/WEBZIOLOGO5-01-CROPPEDFOR LOGO.png" alt="Webzio" width={36} height={36} className="object-contain" priority />
              </div>
              <div>
                <span className="font-black text-xl tracking-tighter text-accounting-text leading-none uppercase block">Webzio</span>
                <span className="text-[8px] font-black text-accounting-text/60 tracking-[0.4em] uppercase">Accounts</span>
              </div>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group",
                    isActive
                      ? "bg-accounting-text text-accounting-bg shadow-clay-outer"
                      : "text-accounting-text/70 hover:text-accounting-text hover:bg-white hover:shadow-clay-outer"
                  )}
                >
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                  <span className="text-[11px] font-black uppercase tracking-[0.15em]">{item.name}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 bg-accounting-bg/40 rounded-full" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-3 mt-6">
            <div className="p-4 bg-accounting-bg rounded-2xl shadow-clay-inner border border-white/40">
              <p className="text-[8px] font-black text-accounting-text/60 uppercase tracking-widest">© {new Date().getFullYear()} Webzio International</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
