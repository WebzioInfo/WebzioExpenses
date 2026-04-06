'use client';

import React, { useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, ShieldCheck, Download, AlertCircle, TrendingUp, TrendingDown, Coins, Briefcase, ArrowLeftRight } from 'lucide-react';
import { useApp } from '@/src/context/ExpenseContext';
import { formatCurrency, cn } from '@/src/lib/utils';
import Button from '@/src/components/ui/Button';

const TYPE_ICONS = {
  'Money In': { icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  'Money Out': { icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' },
  'Added Money': { icon: Coins, color: 'text-blue-600', bg: 'bg-blue-50' },
  'Salary': { icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
  'Transfer': { icon: ArrowLeftRight, color: 'text-purple-600', bg: 'bg-purple-50' },
};

function PendingContent() {
  const { entries = [], updateEntry, exportCSV, loading } = useApp();
  const router = useRouter();

  const pendingEntries = useMemo(() => {
    if (!entries) return [];
    return entries.filter(t => t.status === 'Pending').sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [entries]);

  const totalOwed = useMemo(() => {
    return pendingEntries.filter(t => t.type === 'Money In').reduce((s, t) => s + parseFloat(t.amount), 0);
  }, [pendingEntries]);

  const totalToPay = useMemo(() => {
    return pendingEntries.filter(t => t.type !== 'Money In').reduce((s, t) => s + parseFloat(t.amount), 0);
  }, [pendingEntries]);

  const handleMarkPaid = async (entry) => {
    await updateEntry(entry.id, { ...entry, status: 'Paid' });
  };

  if (loading) return (
    <div className="space-y-4 py-8 animate-pulse">
      {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white/40 rounded-2xl shadow-clay-inner" />)}
    </div>
  );

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div>
          <h1 className="text-3xl font-black text-amber-700 tracking-tighter leading-none flex items-center gap-3">
            <AlertCircle size={28} className="text-amber-500" strokeWidth={3} />
            Pending Payments
          </h1>
          <p className="text-[9px] font-black text-amber-700/40 uppercase tracking-[0.3em] mt-2">
            {pendingEntries.length} items awaiting resolution
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => exportCSV(pendingEntries, 'pending_payments')}
          icon={Download}
          className="bg-white border-amber-200 text-amber-700"
        >
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 shadow-clay-inner">
          <p className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest mb-1">Owed to Us</p>
          <p className="text-3xl font-black text-emerald-600 tracking-tighter">{formatCurrency(totalOwed)}</p>
        </div>
        <div className="p-6 bg-red-50 rounded-3xl border border-red-100 shadow-clay-inner">
          <p className="text-[10px] font-black text-red-500/50 uppercase tracking-widest mb-1">We Owe</p>
          <p className="text-3xl font-black text-red-500 tracking-tighter">{formatCurrency(totalToPay)}</p>
        </div>
      </div>

      {/* List */}
      {pendingEntries.length === 0 ? (
        <div className="clay-card p-20 flex flex-col items-center text-center space-y-3">
          <ShieldCheck size={48} className="text-emerald-400 mb-2" strokeWidth={1.5} />
          <p className="text-base font-black text-[#2D151F]/30 uppercase tracking-tighter">All clear!</p>
          <p className="text-[9px] font-black text-[#2D151F]/20 uppercase tracking-widest">No pending payments found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingEntries.map((entry) => {
            const typeConf = TYPE_ICONS[entry.type] || TYPE_ICONS['Money Out'];
            const TypeIcon = typeConf.icon;
            const isInflow = entry.type === 'Money In' || entry.type === 'Added Money';

            return (
              <div key={entry.id} className="clay-card p-5 border border-amber-100/50 relative overflow-hidden group hover:shadow-clay-outer hover:bg-white transition-all">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-clay-inner', typeConf.bg)}>
                      <TypeIcon size={20} className={typeConf.color} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="font-black text-[#2D151F] text-lg leading-tight">{entry.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black text-clay-plum/40 bg-accounting-bg px-2 py-0.5 rounded-lg uppercase tracking-wider">{entry.date}</span>
                        {entry.personName && <span className="text-[9px] font-black text-[#2D151F]/30 uppercase">· {entry.personName}</span>}
                        {entry.projectName && <span className="text-[9px] font-black text-[#2D151F]/30 uppercase">· {entry.projectName}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center sm:text-right gap-6">
                    <div>
                      <p className={cn('text-xl font-black tracking-tighter', isInflow ? 'text-emerald-600' : 'text-red-500')}>
                        {isInflow ? '+' : '-'}{formatCurrency(parseFloat(entry.amount))}
                      </p>
                      <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest animate-pulse">Pending</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleMarkPaid(entry)}
                        icon={ShieldCheck}
                        className="bg-emerald-500 hover:bg-emerald-600 shadow-sm"
                      >
                        Mark Paid
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/add-transaction?edit=${entry.id}`)}
                        icon={Edit2}
                        className="w-10 h-10 p-0 text-[#2D151F]/40"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PendingPaymentsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center"><div className="w-10 h-10 bg-[#2D151F]/10 rounded-2xl animate-pulse mx-auto" /></div>}>
      <PendingContent />
    </Suspense>
  );
}
