'use client';

import React, { useState } from 'react';
import { Plus, X, TrendingUp, TrendingDown, Coins, Briefcase, ShieldCheck, AlertCircle } from 'lucide-react';
import { useTransactions } from '@/src/context/TransactionContext';
import { useConfig } from '@/src/context/ConfigContext';
import { useAuth } from '@/src/context/AuthContext';
import { ENTRY_TYPES, ENTRY_STATUS } from '@/src/lib/constants';
import { cn } from '@/src/lib/utils';
import Button from '../ui/Button';

const TYPE_CONFIG = [
  { id: ENTRY_TYPES.MONEY_IN, label: 'Money In', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  { id: ENTRY_TYPES.MONEY_OUT, label: 'Money Out', icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50 border-red-200' },
  { id: ENTRY_TYPES.ADDED_MONEY, label: 'Added Money', icon: Coins, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { id: ENTRY_TYPES.SALARY, label: 'Salary', icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
];

const DEFAULT = {
  type: ENTRY_TYPES.MONEY_OUT,
  title: '',
  amount: '',
  account: 'Cash',
  date: new Date().toISOString().split('T')[0],
  category: 'Miscellaneous',
  status: ENTRY_STATUS.PAID,
  notes: '',
  personId: '',
  projectId: '',
};

export const QuickAdd = () => {
  const { addTransaction } = useTransactions();
  const { accounts, categories } = useConfig();
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Please enter a title.'); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Please enter a valid amount.'); return; }
    setError('');
    setSaving(true);
    await addTransaction({ ...form, amount: parseFloat(form.amount), createdBy: user?.name });
    setSaving(false);
    setOpen(false);
    setForm(DEFAULT);
  };

  const filteredCategories = categories.filter(c => c.type === form.type || !c.type);

  return (
    <>
      {isAdmin && (
        <Button
          onClick={() => setOpen(true)}
          className="fixed bottom-8 right-8 z-40 w-16 h-16 p-0"
          title="Quick Add"
          icon={Plus}
          iconSize={28}
        />
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-accounting-text/20 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl -outer border border-white/50 animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
            <div className="absolute inset-0 rounded-t-3xl sm:rounded-3xl pointer-events-none -inner" />

            <div className="flex items-center justify-between p-6 pb-4 border-b border-accounting-text/5">
              <div>
                <h3 className="text-xl font-black text-accounting-text tracking-tighter">Quick Add</h3>
                <p className="text-[9px] font-black text-accounting-text/30 uppercase tracking-widest mt-0.5">Save entry instantly</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                icon={X}
                className="w-9 h-9 p-0"
              />
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-4 gap-2">
                {TYPE_CONFIG.map(t => (
                  <Button
                    key={t.id}
                    variant={form.type === t.id ? 'secondary' : 'ghost'}
                    onClick={() => set('type', t.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 h-auto",
                      form.type === t.id ? t.bg : "bg-accounting-bg/40 text-accounting-text/30"
                    )}
                  >
                    <t.icon size={16} strokeWidth={2.5} className={form.type === t.id ? t.color : ''} />
                    <span className="text-[8px] font-black uppercase tracking-wide leading-tight">{t.label}</span>
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-3">
                <input
                  className="clay-input col-span-3 h-12 text-sm"
                  placeholder="What is this for?"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                />
                <div className="col-span-2 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-accounting-text/30">₹</span>
                  <input
                    type="number"
                    className="clay-input w-full h-12 pl-8 text-sm font-black"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={e => set('amount', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select className="clay-input h-12 text-xs font-black uppercase" value={form.account} onChange={e => set('account', e.target.value)}>
                  {accounts.map(a => <option key={a.id || a.name} value={a.name}>{a.name}</option>)}
                  {accounts.length === 0 && <option value="Cash">Cash</option>}
                </select>
                <input type="date" className="clay-input h-12 text-xs" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>

              <div className="flex gap-2">
                {[ENTRY_STATUS.PAID, ENTRY_STATUS.PENDING].map(s => (
                  <Button
                    key={s}
                    variant={form.status === s ? 'secondary' : 'ghost'}
                    onClick={() => set('status', s)}
                    className={cn(
                      "flex-1 gap-1.5 py-2.5 rounded-xl text-[9px]",
                      form.status === s
                        ? s === 'Paid' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'
                        : 'bg-accounting-bg/40 text-accounting-text/30'
                    )}
                    icon={s === 'Paid' ? ShieldCheck : AlertCircle}
                  >
                    {s}
                  </Button>
                ))}
              </div>

              {error && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{error}</p>}

              <Button
                type="submit"
                isLoading={saving}
                fullWidth
                className="h-13"
              >
                Add Entry
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
