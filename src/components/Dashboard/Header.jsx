import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getGreeting } from '@/src/lib/utils';
import Button from '../ui/Button';

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
        <Button 
          icon={ArrowRight}
          className="h-12 px-8 group"
        >
          Add Entry
        </Button>
      </Link>
    </div>
  );
};
