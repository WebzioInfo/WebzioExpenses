'use client';

import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Coins, Briefcase, AlertCircle, ArrowRight, Wallet, CreditCard, Smartphone, Banknote } from 'lucide-react';
import { useApp } from '@/src/context/ExpenseContext';
import { useAuth } from '@/src/context/AuthContext';
import Link from 'next/link';
import { formatCurrency, cn } from '@/src/utils/helpers';
import { ENTRY_TYPES } from '@/src/utils/constants';

const ACCOUNT_ICONS = {
  'Cash': Wallet,
  'Bank': Banknote,
  'UPI': Smartphone,
  'Petty Cash': CreditCard,
};

export default function Dashboard() {
  const { entries, accounts, people, loading, computeStats } = useApp();
  const { user } = useAuth();

  const stats = useMemo(() => {
    if (!entries || entries.length === 0) return null;
    return computeStats(entries);
  }, [entries]);

  const pendingEntries = useMemo(() =>
    entries.filter(t => t.status === 'Pending').slice(0, 5),
    [entries]
  );

  const recentEntries = useMemo(() =>
    entries.slice(0, 8),
    [entries]
  );

  // Account balances calculated from entries (PAID ONLY)
  const accountBalances = useMemo(() => {
    const balMap = {};
    entries.filter(t => t.status === 'Paid').forEach(t => {
      const acc = t.account || 'Cash';
      if (!balMap[acc]) balMap[acc] = 0;
      const amt = parseFloat(t.amount || 0);
      if (t.type === ENTRY_TYPES.MONEY_IN || t.type === ENTRY_TYPES.ADDED_MONEY) {
        balMap[acc] += amt;
      } else if (t.type === ENTRY_TYPES.MONEY_OUT || t.type === ENTRY_TYPES.SALARY) {
        balMap[acc] -= amt;
      }
    });
    return balMap;
  }, [entries]);

  if (loading) return (
    <div className="space-y-8 py-8 animate-pulse">
      {[1,2,3].map(i => <div key={i} className="h-32 bg-white/40 rounded-3xl shadow-clay-inner" />)}
    </div>
  );

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-10 py-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div>
          <h1 className="text-4xl font-black text-[#2D151F] tracking-tighter leading-none">
            Good {getGreeting()}, <span className="text-[#2D151F]/40">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-[10px] font-black text-[#2D151F]/30 uppercase tracking-[0.3em] mt-2">{today}</p>
        </div>
        <Link href="/add-transaction">
          <button className="h-12 px-8 bg-[#2D151F] text-accounting-bg rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-clay-plum transition-all shadow-clay-outer flex items-center gap-2 group">
            Add Entry
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </Link>
      </div>

      {/* Total Balance Hero */}
      <div className="bg-[#2D151F] text-accounting-bg rounded-3xl p-10 shadow-clay-outer relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/3 rounded-full -ml-10 -mb-10" />
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] mb-3">Total Balance (Paid)</p>
            <p className="text-6xl font-black tracking-tighter">
              {stats ? (
                <span className={stats.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {formatCurrency(stats.balance)}
                </span>
              ) : '₹0.00'}
            </p>
          </div>
          
          {stats && (stats.pendingIn !== 0 || stats.pendingOut !== 0) && (
            <div className="flex flex-col gap-2 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm min-w-[200px]">
              <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Unrealized (Pending)</p>
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-white/40">Inflow:</span>
                <span className="text-emerald-400">+{formatCurrency(stats.pendingIn)}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-white/40">Outflow:</span>
                <span className="text-red-400">-{formatCurrency(stats.pendingOut)}</span>
              </div>
              <div className="h-px bg-white/10 my-1" />
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-white/60">Net Pending:</span>
                <span className={stats.pending >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {stats.pending >= 0 ? '+' : ''}{formatCurrency(stats.pending)}
                </span>
              </div>
            </div>
          )}
        </div>

        {stats && (
          <div className="grid grid-cols-2 gap-4 mt-10 relative z-10">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Money In (Paid)</p>
              <p className="text-xl font-black text-emerald-400">{formatCurrency(stats.moneyIn)}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Money Out (Paid)</p>
              <p className="text-xl font-black text-red-400">{formatCurrency(stats.moneyOut + stats.salary)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Money In', value: stats.moneyIn, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Money Out', value: stats.moneyOut, icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' },
            { label: 'Added Money', value: stats.addedMoney, icon: Coins, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Salary', value: stats.salary, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(card => (
            <div key={card.label} className="clay-card p-6 text-left">
              <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center mb-4 shadow-clay-inner', card.bg)}>
                <card.icon size={18} strokeWidth={2.5} className={card.color} />
              </div>
              <p className="text-[9px] font-black text-[#2D151F]/30 uppercase tracking-widest">{card.label}</p>
              <p className={cn('text-2xl font-black tracking-tighter mt-1', card.color)}>{formatCurrency(card.value)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pending Amount Alert */}
      {stats && stats.pending > 0 && (
        <div className="flex items-center justify-between p-5 bg-accounting-bg border border-amber-200 rounded-2xl shadow-clay-inner">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-amber-600 shrink-0" strokeWidth={2.5} />
            <div>
              <p className="font-black text-amber-800 text-sm">Pending Amount</p>
              <p className="text-[9px] font-black text-amber-600/60 uppercase tracking-widest">Payments not yet received</p>
            </div>
          </div>
          <p className="text-xl font-black text-amber-700">{formatCurrency(stats.pending)}</p>
        </div>
      )}

      {/* Account Balances */}
      {Object.keys(accountBalances).length > 0 && (
        <div>
          <h2 className="text-[10px] font-black text-[#2D151F]/30 uppercase tracking-[0.3em] mb-4 px-1">Account Balances</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(accountBalances).map(([name, balance]) => {
              const Icon = ACCOUNT_ICONS[name] || Wallet;
              return (
                <div key={name} className="clay-card p-5 text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-accounting-bg flex items-center justify-center shadow-clay-inner">
                      <Icon size={16} strokeWidth={2} className="text-[#2D151F]/40" />
                    </div>
                    <p className="text-[9px] font-black text-[#2D151F]/40 uppercase tracking-widest">{name}</p>
                  </div>
                  <p className={cn('text-2xl font-black tracking-tighter', balance >= 0 ? 'text-[#2D151F]' : 'text-red-500')}>
                    {formatCurrency(balance)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending Entries Reminders */}
      {pendingEntries.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-[10px] font-black text-[#2D151F]/30 uppercase tracking-[0.3em]">Pending Reminders</h2>
            <Link href="/transactions?filter=Pending" className="text-[9px] font-black text-[#2D151F]/40 hover:text-[#2D151F] uppercase tracking-widest transition-colors">View All</Link>
          </div>
          <div className="space-y-2">
            {pendingEntries.map(entry => (
              <div key={entry.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-amber-100 shadow-clay-inner group">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse shrink-0" />
                  <div>
                    <p className="font-black text-[#2D151F] text-sm group-hover:translate-x-0.5 transition-transform">{entry.title}</p>
                    <p className="text-[9px] font-black text-[#2D151F]/30 uppercase tracking-widest">{entry.type} · {entry.date}</p>
                  </div>
                </div>
                <p className="font-black text-amber-600 text-base">{formatCurrency(parseFloat(entry.amount))}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Entries */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-[10px] font-black text-[#2D151F]/30 uppercase tracking-[0.3em]">Recent Entries</h2>
          <Link href="/transactions" className="text-[9px] font-black text-[#2D151F]/40 hover:text-[#2D151F] uppercase tracking-widest transition-colors flex items-center gap-1">
            View All <ArrowRight size={10} />
          </Link>
        </div>

        {recentEntries.length === 0 ? (
          <div className="clay-card p-16 flex flex-col items-center justify-center text-center space-y-3">
            <p className="text-base font-black text-[#2D151F]/30 uppercase tracking-tighter">No entries yet</p>
            <p className="text-[10px] font-black text-[#2D151F]/20 uppercase tracking-widest">Add your first entry to get started</p>
            <Link href="/add-transaction">
              <button className="mt-2 h-10 px-6 bg-[#2D151F] text-accounting-bg rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-clay-plum transition-all shadow-clay-outer">
                Add Entry
              </button>
            </Link>
          </div>
        ) : (
          <div className="clay-card overflow-hidden">
            {recentEntries.map((entry, i) => (
              <div key={entry.id} className={cn('flex items-center justify-between p-5 group hover:bg-accounting-bg/30 transition-colors', i > 0 && 'border-t border-[#2D151F]/5')}>
                <div className="flex items-center gap-4">
                  <TypeDot type={entry.type} />
                  <div>
                    <p className="font-black text-[#2D151F] text-sm group-hover:translate-x-0.5 transition-transform">{entry.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[8px] font-black text-[#2D151F]/30 uppercase tracking-widest">{entry.type}</span>
                      {entry.account && <span className="text-[8px] font-black text-[#2D151F]/20 uppercase">· {entry.account}</span>}
                      {entry.projectName && <span className="text-[8px] font-black text-[#2D151F]/20 uppercase">· {entry.projectName}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn('font-black text-base', getAmountColor(entry.type))}>
                    {isPositive(entry.type) ? '+' : '-'}{formatCurrency(parseFloat(entry.amount))}
                  </p>
                  <p className="text-[8px] font-black text-[#2D151F]/20 uppercase tracking-widest">{entry.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function getAmountColor(type) {
  if (type === ENTRY_TYPES.MONEY_IN || type === ENTRY_TYPES.ADDED_MONEY) return 'text-emerald-600';
  return 'text-red-500';
}

function isPositive(type) {
  return type === ENTRY_TYPES.MONEY_IN || type === ENTRY_TYPES.ADDED_MONEY;
}

function TypeDot({ type }) {
  const colors = {
    'Money In': 'bg-emerald-400',
    'Money Out': 'bg-red-400',
    'Added Money': 'bg-blue-400',
    'Salary': 'bg-amber-400',
    'Transfer': 'bg-purple-400',
  };
  return <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', colors[type] || 'bg-gray-300')} />;
}
