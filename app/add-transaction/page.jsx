'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, TrendingUp, TrendingDown, Coins, Briefcase, ArrowLeftRight, ShieldCheck, AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import { useApp } from '@/src/context/ExpenseContext';
import { useAuth } from '@/src/context/AuthContext';
import { ENTRY_TYPES, ENTRY_STATUS, ACCOUNTS, INCOME_CATEGORIES, EXPENSE_CATEGORIES, RECURRING_FREQUENCIES } from '@/src/lib/constants';
import { cn } from '@/src/lib/utils';

const TYPE_OPTIONS = [
  { id: ENTRY_TYPES.MONEY_IN, label: 'Money In', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  { id: ENTRY_TYPES.MONEY_OUT, label: 'Money Out', icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50 border-red-200' },
  { id: ENTRY_TYPES.ADDED_MONEY, label: 'Added Money', icon: Coins, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { id: ENTRY_TYPES.SALARY, label: 'Salary', icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  { id: ENTRY_TYPES.TRANSFER, label: 'Transfer', icon: ArrowLeftRight, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
];

const STATUS_OPTIONS = [
  { id: ENTRY_STATUS.PAID, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  { id: ENTRY_STATUS.PENDING, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  { id: ENTRY_STATUS.CANCELLED, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 border-red-200' },
];

const BLANK = {
  type: ENTRY_TYPES.MONEY_OUT,
  title: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  account: 'Cash',
  destination_account_id: '',
  personId: '',
  projectId: '',
  category: EXPENSE_CATEGORIES[0],
  status: ENTRY_STATUS.PAID,
  paymentMethod: '',
  notes: '',
  scope: 'company',
  isRecurring: false,
  recurringFrequency: RECURRING_FREQUENCIES.MONTHLY,
};

function AddEntryContent() {
  const { addEntry, updateEntry, entries, people, projects, accounts, categories: dynamicCategories } = useApp();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  useEffect(() => {
    if (editId && entries.length > 0) {
      const t = entries.find(e => e.id.toString() === editId);
      if (t) setForm({ ...BLANK, ...t, amount: t.amount.toString(), personId: t.personId || '', projectId: t.projectId || '', destination_account_id: t.destination_account_id || '' });
    }
  }, [editId, entries]);

  const handleTypeChange = (type) => {
    set('type', type);
    const filteredCats = dynamicCategories.filter(c => c.type === (type === ENTRY_TYPES.MONEY_IN ? 'Money In' : 'Money Out'));
    set('category', filteredCats.length > 0 ? filteredCats[0].name : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Please enter a title.'); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Please enter a valid amount greater than 0.'); return; }
    setError('');
    setSaving(true);

    const data = {
      ...form,
      amount: parseFloat(form.amount),
      personId: form.personId || null,
      projectId: form.scope === 'project' ? (form.projectId || null) : null,
      createdBy: user?.name || '',
    };

    if (data.scope === 'project' && !data.projectId) {
      setError('Project is required when scope is set to "Project".');
      setSaving(false);
      return;
    }

    if (editId) {
      await updateEntry(editId, data);
    } else {
      await addEntry(data);
    }
    setSaving(false);
    router.push('/transactions');
  };

  const accountList = accounts.length > 0 ? accounts.map(a => a.name) : Object.values(ACCOUNTS);
  const categoriesList = dynamicCategories.filter(c => c.type === (form.type === ENTRY_TYPES.MONEY_IN ? 'Money In' : 'Money Out')).map(c => c.name);
  const isTransfer = form.type === ENTRY_TYPES.TRANSFER;

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-5 px-1">
        <button onClick={() => router.back()} className="w-12 h-12 clay-btn p-0 hover:bg-accounting-bg hover:text-accounting-bg transition-all">
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-accounting-bg tracking-tighter leading-none">
            {editId ? 'Edit Entry' : 'Add Entry'}
          </h1>
          <p className="text-[9px] font-black text-accounting-bg/30 uppercase tracking-[0.3em] mt-1">
            {editId ? 'Update this financial entry' : 'Record a new financial entry'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="clay-card p-8 space-y-8">

        {/* Type */}
        <div className="space-y-3">
          <label className="field-label">Type</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {TYPE_OPTIONS.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTypeChange(t.id)}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all',
                  form.type === t.id ? `${t.bg} shadow-clay-inner` : 'border-transparent bg-accounting-bg/40 text-accounting-bg/30 hover:bg-white'
                )}
              >
                <t.icon size={18} strokeWidth={2.5} className={form.type === t.id ? t.color : ''} />
                <span className="text-[8px] font-black uppercase tracking-widest text-center leading-tight">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title + Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-2">
            <label className="field-label">Title <span className="text-red-400">*</span></label>
            <input
              required
              className="clay-input w-full"
              placeholder="e.g. Client payment, Office rent..."
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="field-label">Amount (₹) <span className="text-red-400">*</span></label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-accounting-bg/30">₹</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                className="clay-input w-full pl-10 font-black text-lg"
                placeholder="0.00"
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Account + (Target Account if Transfer) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="field-label">{isTransfer ? 'From Account' : 'Account'} <span className="text-red-400">*</span></label>
            <select className="clay-input w-full" value={form.account} onChange={e => set('account', e.target.value)}>
              {accountList.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          {isTransfer && (
            <div className="space-y-2 animate-in slide-in-from-right duration-300">
              <label className="field-label">To Account <span className="text-red-400">*</span></label>
              <select 
                className="clay-input w-full" 
                value={form.destination_account_id} 
                onChange={e => set('destination_account_id', e.target.value)}
                required
              >
                <option value="">Select Target</option>
                {accountList.filter(a => a !== form.account).map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          )}
          {!isTransfer && (
            <div className="space-y-2">
              <label className="field-label">Payment</label>
              <select className="clay-input w-full" value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
                <option value="">Not specified</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          )}
        </div>

        {/* Scope */}
        <div className="space-y-3">
          <label className="field-label">Entry Scope</label>
          <div className="flex gap-2">
            {[
              { id: 'company', label: 'General / Company', icon: Briefcase },
              { id: 'project', label: 'Project Specific', icon: TrendingUp },
            ].map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  set('scope', s.id);
                  if (s.id === 'company') set('projectId', '');
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 text-[9px] font-black uppercase tracking-widest transition-all',
                  form.scope === s.id ? 'bg-accounting-bg text-accounting-bg shadow-clay-outer border-accounting-bg' : 'border-transparent bg-accounting-bg/40 text-accounting-bg/30'
                )}
              >
                <s.icon size={14} strokeWidth={2.5} />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Staff + Project */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="field-label">Staff {(form.type === ENTRY_TYPES.SALARY || form.type === ENTRY_TYPES.ADDED_MONEY) && <span className="text-red-400">*</span>}</label>
            <select className="clay-input w-full" value={form.personId} onChange={e => set('personId', e.target.value)}>
              <option value="">None</option>
              {people.map(p => <option key={p.id} value={p.id}>{p.name} ({p.role})</option>)}
            </select>
          </div>
          {form.scope === 'project' && (
            <div className="space-y-2 animate-in slide-in-from-left duration-300">
              <label className="field-label">Project <span className="text-red-400">*</span></label>
              <select required className="clay-input w-full border-red-200" value={form.projectId} onChange={e => set('projectId', e.target.value)}>
                <option value="">Select Project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Category */}
        {!isTransfer && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="field-label mb-0">Category</label>
              <Link href="/categories" className="text-[8px] font-black text-accounting-bg/30 hover:text-accounting-bg uppercase tracking-widest">Manage</Link>
            </div>
            <select className="clay-input w-full" value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">Select Category</option>
              {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
              {(form.type === ENTRY_TYPES.SALARY) && <option value="Salary">Salary</option>}
              {(form.type === ENTRY_TYPES.ADDED_MONEY) && <option value="Investment">Investment</option>}
            </select>
          </div>
        )}

        {/* Status */}
        <div className="space-y-3">
          <label className="field-label">Status</label>
          <div className="flex gap-2">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => set('status', s.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 text-[9px] font-black uppercase tracking-widest transition-all',
                  form.status === s.id ? `${s.bg} shadow-clay-inner` : 'border-transparent bg-accounting-bg/40 text-accounting-bg/30'
                )}
              >
                <s.icon size={14} strokeWidth={2.5} className={form.status === s.id ? s.color : ''} />
                {s.id}
              </button>
            ))}
          </div>
        </div>

        {/* Recurring */}
        <div className="p-5 bg-accounting-bg/50 rounded-2xl shadow-clay-inner border border-white/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw size={16} strokeWidth={2.5} className="text-accounting-bg/40" />
              <label className="field-label mb-0">Repeat automatically</label>
            </div>
            <button
              type="button"
              onClick={() => set('isRecurring', !form.isRecurring)}
              className={cn(
                'w-12 h-6 rounded-full transition-all duration-300 relative',
                form.isRecurring ? 'bg-accounting-bg' : 'bg-accounting-bg/20'
              )}
            >
              <div className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all', form.isRecurring ? 'left-7' : 'left-1')} />
            </button>
          </div>
          {form.isRecurring && (
            <div className="flex gap-2">
              {Object.values(RECURRING_FREQUENCIES).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => set('recurringFrequency', f)}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border',
                    form.recurringFrequency === f ? 'bg-accounting-bg text-accounting-bg border-accounting-bg' : 'border-accounting-bg/10 text-accounting-bg/30'
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="field-label">Notes</label>
          <textarea
            rows={3}
            className="clay-input w-full resize-none text-sm"
            placeholder="Optional notes..."
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <AlertCircle size={16} className="text-red-500 shrink-0" strokeWidth={2.5} />
            <p className="text-[11px] font-black text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 h-14 bg-accounting-bg text-accounting-bg rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-clay-plum active:scale-95 transition-all shadow-clay-outer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={16} strokeWidth={2.5} />
            {saving ? 'Saving...' : editId ? 'Update Entry' : 'Save Entry'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="h-14 px-8 clay-btn text-accounting-bg/40 text-[10px] font-black uppercase tracking-widest"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AddEntryPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 bg-accounting-bg/10 rounded-2xl animate-pulse shadow-clay-inner" />
      </div>
    }>
      <AddEntryContent />
    </Suspense>
  );
}
