import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getGreeting } from '@/src/lib/utils';

export const DashboardHeader = ({ user }) => {
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
      <div>
        <h1 className="text-4xl font-black text-accounting-text tracking-tighter leading-none">
          Good {getGreeting()}, <span className="text-accounting-text/40">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-[10px] font-black text-accounting-text/30 uppercase tracking-[0.3em] mt-2">{today}</p>
      </div>
      <Link href="/add-transaction">
        <button className="h-12 px-8 bg-accounting-text text-accounting-bg rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-accounting-text/80 transition-all shadow-clay-outer flex items-center gap-2 group">
          Add Entry
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </Link>
    </div>
  );
};
