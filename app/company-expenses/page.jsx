'use client';

import React, { useMemo, Suspense } from 'react';
import { Briefcase, CreditCard, PieChart, TrendingDown, ArrowRight, Wallet, Banknote, Smartphone } from 'lucide-react';
import { useApp } from '@/src/context/ExpenseContext';
import { formatCurrency, cn } from '@/src/utils/helpers';
import Link from 'next/link';

const ACCOUNT_ICONS = {
  'Cash': Wallet,
  'Bank': Banknote,
  'UPI': Smartphone,
  'Petty Cash': CreditCard,
};

function CompanyExpensesContent() {
  const { entries, loading } = useApp();

  const companyExpenses = useMemo(() => {
    if (!entries) return [];
    return entries.filter(t => 
      (t.type === 'Money Out' || t.type === 'Salary') && 
      (!t.projectId || t.projectId === '') &&
      t.status !== 'Cancelled'
    ).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [entries]);

  const stats = useMemo(() => {
    const total = companyExpenses.reduce((s, t) => s + parseFloat(t.amount), 0);
    const byCategory = {};
    companyExpenses.forEach(t => {
      const cat = t.category || 'Uncategorized';
      byCategory[cat] = (byCategory[cat] || 0) + parseFloat(t.amount);
    });
    return { total, byCategory };
  }, [companyExpenses]);

  if (loading) return (
    <div className="space-y-6 py-8 animate-pulse">
      <div className="h-40 bg-white/40 rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white/40 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="px-1">
        <h1 className="text-3xl font-black text-[#2D151F] tracking-tighter leading-none flex items-center gap-3">
          <Briefcase size={28} className="text-[#2D151F]/40" strokeWidth={3} />
          Company Expenses
        </h1>
        <p className="text-[9px] font-black text-[#2D151F]/30 uppercase tracking-[0.3em] mt-2">
          Tracking internal operational costs and general overhead
        </p>
      </div>

      {/* Hero Stats */}
      <div className="bg-[#2D151F] text-accounting-bg rounded-3xl p-10 shadow-clay-outer relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-20 -mt-20" />
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-3">Total Internal Spend</p>
        <p className="text-5xl font-black tracking-tighter text-red-400">
          {formatCurrency(stats.total)}
        </p>
        <div className="mt-8 flex gap-4">
          <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 uppercase text-[9px] font-black tracking-widest">
            {companyExpenses.length} Transactions
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Breakdown */}
        <div className="lg:col-span-1 space-y-6">
          <div className="clay-card p-6">
            <h2 className="text-[10px] font-black text-[#2D151F]/30 uppercase tracking-widest mb-6 flex items-center gap-2">
              <PieChart size={14} /> Category Breakdown
            </h2>
            <div className="space-y-4">
              {Object.entries(stats.byCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amt]) => {
                  const percentage = ((amt / stats.total) * 100).toFixed(1);
                  return (
                    <div key={cat} className="space-y-1.5">
                      <div className="flex justify-between items-end">
                        <p className="text-xs font-black text-[#2D151F]">{cat}</p>
                        <p className="text-xs font-black text-[#2D151F]/60">{formatCurrency(amt)}</p>
                      </div>
                      <div className="h-1.5 bg-accounting-bg rounded-full overflow-hidden shadow-clay-inner">
                        <div 
                          className="h-full bg-red-400 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right Column: Transactions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-black text-[#2D151F]/30 uppercase tracking-widest">Internal Spend Log</h2>
            <Link href="/transactions" className="text-[9px] font-black text-[#2D151F]/40 hover:text-[#2D151F] uppercase tracking-widest flex items-center gap-1">
              View All <ArrowRight size={10} />
            </Link>
          </div>

          {companyExpenses.length === 0 ? (
            <div className="clay-card p-20 flex flex-col items-center text-center">
              <p className="text-base font-black text-[#2D151F]/30 uppercase">No internal expenses</p>
            </div>
          ) : (
            <div className="space-y-3">
              {companyExpenses.map(entry => {
                const Icon = ACCOUNT_ICONS[entry.account] || Wallet;
                return (
                  <div key={entry.id} className="clay-card p-5 group hover:bg-accounting-bg/30 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-clay-inner text-red-400">
                        <TrendingDown size={18} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="font-black text-[#2D151F] text-sm group-hover:translate-x-0.5 transition-transform">{entry.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[8px] font-black text-[#2D151F]/30 uppercase tracking-widest">{entry.category}</span>
                          <span className="text-[8px] font-black text-[#2D151F]/20 uppercase">· {entry.date}</span>
                          <span className="flex items-center gap-1 text-[8px] font-black text-[#2D151F]/20 uppercase">
                            <Icon size={10} /> {entry.account}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="font-black text-red-500 text-base">-{formatCurrency(parseFloat(entry.amount))}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CompanyExpensesPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center"><div className="w-10 h-10 bg-[#2D151F]/10 rounded-2xl animate-pulse mx-auto shadow-clay-inner" /></div>}>
      <CompanyExpensesContent />
    </Suspense>
  );
}
