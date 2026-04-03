'use client';

import React, { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Coins, Briefcase } from 'lucide-react';
import { useApp } from '@/src/context/ExpenseContext';
import { formatCurrency, cn } from '@/src/utils/helpers';
import { MonthlyBarChart, CategoryPieChart } from '@/src/components/Charts';
import { DATE_FILTERS } from '@/src/utils/constants';

const DATE_OPTS = ['This Month', 'Last Month', 'This Year', 'All Time'];

export default function ReportsPage() {
  const { entries, projects, loading, computeStats } = useApp();
  const [period, setPeriod] = useState('This Month');

  const filtered = useMemo(() => {
    const now = new Date();
    if (period === 'This Month') {
      return entries.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (period === 'Last Month') {
      const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return entries.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear();
      });
    } else if (period === 'This Year') {
      return entries.filter(t => new Date(t.date).getFullYear() === now.getFullYear());
    }
    return entries;
  }, [entries, period]);

  const stats = useMemo(() => computeStats(filtered), [filtered]);

  const projectPnL = useMemo(() =>
    projects.map(p => {
      const tx = entries.filter(t => t.projectId === p.id);
      const income = tx.filter(t => t.type === 'Money In').reduce((s, t) => s + parseFloat(t.amount), 0);
      const expense = tx.filter(t => t.type === 'Money Out' || t.type === 'Salary').reduce((s, t) => s + parseFloat(t.amount), 0);
      return { ...p, income, expense, profit: income - expense };
    }).sort((a, b) => b.profit - a.profit),
    [projects, entries]
  );

  const monthly6 = useMemo(() => Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = d.toLocaleString('default', { month: 'short' });
    const tx = entries.filter(t => {
      const td = new Date(t.date);
      return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
    });
    const income = tx.filter(t => t.type === 'Money In' || t.type === 'Added Money').reduce((s, t) => s + parseFloat(t.amount), 0);
    const expense = tx.filter(t => t.type === 'Money Out' || t.type === 'Salary').reduce((s, t) => s + parseFloat(t.amount), 0);
    return { month, income, expense };
  }).reverse(), [entries]);

  const categoryBreakdown = useMemo(() => {
    const map = {};
    filtered.filter(t => t.type === 'Money Out' || t.type === 'Salary').forEach(t => {
      const cat = t.category || 'Uncategorised';
      map[cat] = (map[cat] || 0) + parseFloat(t.amount);
    });
    return map;
  }, [filtered]);

  if (loading) return <div className="py-20 flex justify-center"><div className="w-10 h-10 bg-[#2D151F]/10 rounded-2xl animate-pulse shadow-clay-inner" /></div>;

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div>
          <h1 className="text-3xl font-black text-[#2D151F] tracking-tighter leading-none">Reports</h1>
          <p className="text-[9px] font-black text-[#2D151F]/30 uppercase tracking-[0.3em] mt-1">Financial overview</p>
        </div>
        <div className="flex gap-2">
          {DATE_OPTS.map(d => (
            <button key={d} onClick={() => setPeriod(d)} className={cn('h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all', period === d ? 'bg-[#2D151F] text-[#F4F3DC] shadow-clay-outer' : 'bg-white text-[#2D151F]/30 hover:bg-[#F4F3DC] shadow-clay-inner')}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {entries.length === 0 ? (
        <div className="clay-card p-20 text-center">
          <p className="text-base font-black text-[#2D151F]/30 uppercase tracking-tighter">No data available</p>
          <p className="text-[9px] font-black text-[#2D151F]/20 uppercase tracking-widest mt-2">Add entries to generate reports</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Money In', value: stats.moneyIn, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Money Out', value: stats.moneyOut, icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' },
              { label: 'Added Money', value: stats.addedMoney, icon: Coins, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Salary', value: stats.salary, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map(c => (
              <div key={c.label} className="clay-card p-6">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-clay-inner', c.bg)}>
                  <c.icon size={16} strokeWidth={2.5} className={c.color} />
                </div>
                <p className="text-[8px] font-black text-[#2D151F]/30 uppercase tracking-widest">{c.label}</p>
                <p className={cn('text-2xl font-black tracking-tighter mt-1', c.color)}>{formatCurrency(c.value)}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="clay-card p-8">
              <h3 className="font-black text-[#2D151F] uppercase tracking-tighter mb-6">6-Month Overview</h3>
              <MonthlyBarChart data={monthly6} />
            </div>
            <div className="clay-card p-8">
              <h3 className="font-black text-[#2D151F] uppercase tracking-tighter mb-6">Category Breakdown</h3>
              {Object.keys(categoryBreakdown).length > 0 ? (
                <CategoryPieChart data={categoryBreakdown} title="Expenses" />
              ) : (
                <p className="text-[10px] font-black text-[#2D151F]/20 uppercase tracking-widest text-center py-16">No expense data</p>
              )}
            </div>
          </div>

          {/* Project P&L */}
          <div className="clay-card p-8">
            <h3 className="font-black text-[#2D151F] uppercase tracking-tighter mb-6">Project Profit & Loss</h3>
            {projectPnL.length === 0 ? (
              <p className="text-[10px] font-black text-[#2D151F]/20 uppercase tracking-widest py-10 text-center">No projects available</p>
            ) : (
              <div className="space-y-3">
                {projectPnL.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-[#F4F3DC]/40 rounded-2xl shadow-clay-inner border border-white/40">
                    <div>
                      <p className="font-black text-[#2D151F] text-sm">{p.name}</p>
                      {p.clientName && <p className="text-[8px] font-black text-[#2D151F]/30 uppercase tracking-widest">{p.clientName}</p>}
                    </div>
                    <div className="text-right">
                      <p className={cn('font-black text-lg tracking-tighter', p.profit >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                        {formatCurrency(p.profit)}
                      </p>
                      <p className="text-[8px] font-black text-[#2D151F]/20 uppercase tracking-widest">In: {formatCurrency(p.income)} · Out: {formatCurrency(p.expense)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
