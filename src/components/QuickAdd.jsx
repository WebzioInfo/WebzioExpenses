'use client';

import React, { useState } from 'react';
import { Plus, X, TrendingUp, TrendingDown, Coins, Briefcase, ArrowLeftRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useApp } from '@/src/context/ExpenseContext';
import { useAuth } from '@/src/context/AuthContext';
import { ENTRY_TYPES, ENTRY_STATUS, ACCOUNTS, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/src/utils/constants';
import { cn } from '@/src/utils/helpers';

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
  category: EXPENSE_CATEGORIES[0],
  status: ENTRY_STATUS.PAID,
  notes: '',
  personId: '',
  projectId: '',
};

export default function QuickAdd() {
  const { addEntry, people, projects, accounts } = useApp();
  const { user } = useAuth();
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
    await addEntry({ ...form, amount: parseFloat(form.amount), createdBy: user?.name });
    setSaving(false);
    setOpen(false);
    setForm(DEFAULT);
  };

  const categories = form.type === ENTRY_TYPES.MONEY_IN ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 z-40 w-16 h-16 bg-[#2D151F] text-[#F4F3DC] rounded-2xl flex items-center justify-center shadow-clay-outer hover:scale-110 active:scale-95 transition-all duration-200"
        title="Add Entry (Quick)"
      >
        <Plus size={28} strokeWidth={3} />
      </button>

      {/* Quick Add Panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-[#2D151F]/20 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-clay-outer border border-white/50 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
            <div className="absolute inset-0 rounded-t-3xl sm:rounded-3xl pointer-events-none shadow-clay-inner" />

            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-[#2D151F]/5">
              <div>
                <h3 className="text-xl font-black text-[#2D151F] tracking-tighter">Add Entry</h3>
                <p className="text-[9px] font-black text-[#2D151F]/30 uppercase tracking-widest mt-0.5">Quick save</p>
              </div>
              <button onClick={() => setOpen(false)} className="w-9 h-9 rounded-xl flex items-center justify-center text-[#2D151F]/30 hover:bg-[#F4F3DC] hover:text-[#2D151F] transition-all">
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Type Selector */}
              <div className="grid grid-cols-4 gap-2">
                {TYPE_CONFIG.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { set('type', t.id); set('category', t.id === ENTRY_TYPES.MONEY_IN ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]); }}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-2xl border-2 text-center transition-all",
                      form.type === t.id ? `${t.bg} shadow-clay-inner` : "border-transparent bg-[#F4F3DC]/40 text-[#2D151F]/30"
                    )}
                  >
                    <t.icon size={16} strokeWidth={2.5} className={form.type === t.id ? t.color : ''} />
                    <span className="text-[8px] font-black uppercase tracking-wide leading-tight">{t.label}</span>
                  </button>
                ))}
              </div>

              {/* Title + Amount */}
              <div className="grid grid-cols-5 gap-3">
                <input
                  className="clay-input col-span-3 h-12 text-sm"
                  placeholder="Title"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                />
                <div className="col-span-2 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[#2D151F]/30">₹</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    className="clay-input w-full h-12 pl-8 text-sm font-black"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={e => set('amount', e.target.value)}
                  />
                </div>
              </div>

              {/* Account + Date */}
              <div className="grid grid-cols-2 gap-3">
                <select className="clay-input h-12 text-xs font-black uppercase" value={form.account} onChange={e => set('account', e.target.value)}>
                  {(accounts.length > 0 ? accounts.map(a => a.name) : Object.values(ACCOUNTS)).map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
                <input type="date" className="clay-input h-12 text-xs" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>

              {/* Status */}
              <div className="flex gap-2">
                {[ENTRY_STATUS.PAID, ENTRY_STATUS.PENDING].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set('status', s)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border",
                      form.status === s
                        ? s === 'Paid' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'
                        : 'border-transparent bg-[#F4F3DC]/40 text-[#2D151F]/30'
                    )}
                  >
                    {s === 'Paid' ? <ShieldCheck size={12} strokeWidth={2.5} /> : <AlertCircle size={12} strokeWidth={2.5} />}
                    {s}
                  </button>
                ))}
              </div>

              {error && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{error}</p>}

              <button
                type="submit"
                disabled={saving}
                className="w-full h-13 bg-[#2D151F] text-[#F4F3DC] rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#4A2B3A] active:scale-95 transition-all shadow-clay-outer disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Entry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
