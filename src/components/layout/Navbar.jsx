'use client';

import React, { useState } from 'react';
import { Menu, Bell, LogOut, ChevronDown, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useTransactions } from '@/src/context/TransactionContext';
import { cn } from '@/src/lib/utils';
import Link from 'next/link';
import Button from '../ui/Button';

export const Navbar = ({ onOpenSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const { transactions } = useTransactions();
  const [menuOpen, setMenuOpen] = useState(false);

  const pendingCount = transactions.filter(e => e.status === 'Pending').length;

  return (
    <header className="h-20 flex items-center justify-between px-6 sm:px-10 bg-transparent sticky top-0 z-30">
      <div className="flex-1 flex items-center justify-between">
        {/* Left: Mobile burger */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onOpenSidebar}
            icon={Menu}
            className="lg:hidden w-11 h-11 p-0 clay-btn -outer"
          />
          <div className="hidden lg:block">
            <p className="text-[8px] font-black text-accounting-text/60 uppercase tracking-[0.4em]">Webzio International</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Pending Bell */}
          <Link href="/transactions?filter=Pending" className="relative group">
            <Button
              variant="outline"
              className="w-11 h-11 p-0 m-0 flex items-center justify-center rounded-2xl bg-transparent border-none"
              icon={Bell}
            >
              {pendingCount > 0 && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              )}
            </Button>
          </Link>

          {/* User Menu */}
          <div className="relative w-full">
            <Button
              variant="outline"
              onClick={() => setMenuOpen(v => !v)}
              className="flex items-center justify-between gap-3 py-2 px-3 bg-white rounded-2xl -inner border-none h-auto"
            >
              <div className="hidden sm:flex items-center gap-2 text-left">
                {/* Profile Image */}
                <div className="w-8 h-8 rounded-xl bg-accounting-text flex items-center justify-center text-accounting-bg text-[10px] font-black overflow-hidden relative">
                  {user?.profile_pic ? (
                    <img src={user.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.[0]?.toUpperCase() || 'U'
                  )}
                </div>

                {/* Text */}
                <div className="flex flex-col leading-none">
                  <p className="text-[10px] font-black text-accounting-text">{user?.name}</p>
                  <p className="text-[8px] font-black text-accounting-text/60 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                    {isAdmin ? (
                      <ShieldCheck size={8} strokeWidth={2.5} className="text-emerald-500" />
                    ) : (
                      <User size={8} strokeWidth={2.5} />
                    )}
                    {user?.role}
                  </p>
                </div>
              </div>
              {/* <ChevronDown
                size={12}
                strokeWidth={2.5}
                className={cn(
                  "text-accounting-text/60 transition-transform",
                  menuOpen && "rotate-180"
                )}
              /> */}
            </Button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl -outer border border-white/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-4 border-b border-accounting-text/5">
                  <p className="text-[10px] font-black text-accounting-text">{user?.name}</p>
                  <p className="text-[8px] font-black text-accounting-text/60 uppercase tracking-widest">{user?.email}</p>
                </div>
                <Link href="/settings" onClick={() => setMenuOpen(false)}>
                  <div className="flex items-center gap-3 px-4 py-3 hover:bg-accounting-bg/40 text-accounting-text/60 hover:text-accounting-text transition-colors cursor-pointer">
                    <User size={14} strokeWidth={2.5} />
                    <span className="text-[10px] font-black uppercase tracking-wide">Settings</span>
                  </div>
                </Link>

                {isAdmin && (
                  <Link href="/users" onClick={() => setMenuOpen(false)}>
                    <div className="flex items-center gap-3 px-4 py-3 hover:bg-accounting-bg/40 text-accounting-text/60 hover:text-accounting-text transition-colors cursor-pointer">
                      <ShieldCheck size={14} strokeWidth={2.5} />
                      <span className="text-[10px] font-black uppercase tracking-wide">Manage Users</span>
                    </div>
                  </Link>
                )}
                <Button
                  onClick={logout}
                  variant="ghost"
                  fullWidth
                  icon={LogOut}
                  className="justify-start gap-3 px-4 py-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-none h-auto"
                >
                  <span className="text-[10px] font-black uppercase tracking-wide">Log Out</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
