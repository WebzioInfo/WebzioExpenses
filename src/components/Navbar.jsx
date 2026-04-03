'use client';

import React, { useState } from 'react';
import { Menu, Bell, LogOut, ChevronDown, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useApp } from '@/src/context/ExpenseContext';
import { cn } from '../utils/helpers';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = ({ onOpenSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const { entries } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  const pendingCount = entries.filter(e => e.status === 'Pending').length;

  return (
    <header className="h-20 flex items-center justify-between px-6 sm:px-10 bg-transparent sticky top-0 z-30">
      <div className="flex-1 flex items-center justify-between">
        {/* Left: Mobile burger */}
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden w-11 h-11 clay-btn hover:bg-[#2D151F] hover:text-[#F4F3DC] transition-all shadow-clay-outer"
          >
            <Menu size={18} strokeWidth={2.5} />
          </button>
          <div className="hidden lg:block">
            <p className="text-[8px] font-black text-[#2D151F]/30 uppercase tracking-[0.4em]">Webzio International</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Pending Bell */}
          <Link href="/transactions?filter=Pending" className="relative">
            <button className="w-11 h-11 clay-btn text-[#2D151F]/30 hover:text-[#2D151F] transition-all">
              <Bell size={16} strokeWidth={2.5} />
              {pendingCount > 0 && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              )}
            </button>
          </Link>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="flex items-center gap-3 py-2 px-3 clay-btn hover:bg-white transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-[#2D151F] flex items-center justify-center text-[#F4F3DC] text-[10px] font-black">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[10px] font-black text-[#2D151F] leading-none">{user?.name}</p>
                <p className="text-[8px] font-black text-[#2D151F]/30 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                  {isAdmin ? <ShieldCheck size={8} strokeWidth={2.5} className="text-emerald-500" /> : <User size={8} strokeWidth={2.5} />}
                  {user?.role}
                </p>
              </div>
              <ChevronDown size={12} strokeWidth={2.5} className={cn('text-[#2D151F]/30 transition-transform', menuOpen && 'rotate-180')} />
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-clay-outer border border-white/50 overflow-hidden z-50">
                <div className="p-4 border-b border-[#2D151F]/5">
                  <p className="text-[10px] font-black text-[#2D151F]">{user?.name}</p>
                  <p className="text-[8px] font-black text-[#2D151F]/30 uppercase tracking-widest">{user?.email}</p>
                </div>
                {isAdmin && (
                  <Link href="/users" onClick={() => setMenuOpen(false)}>
                    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#F4F3DC]/40 text-[#2D151F]/60 hover:text-[#2D151F] transition-colors cursor-pointer">
                      <User size={14} strokeWidth={2.5} />
                      <span className="text-[10px] font-black uppercase tracking-wide">Manage Users</span>
                    </div>
                  </Link>
                )}
                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors">
                  <LogOut size={14} strokeWidth={2.5} />
                  <span className="text-[10px] font-black uppercase tracking-wide">Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;