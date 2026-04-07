'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  Briefcase, 
  ArrowLeftRight, 
  ShieldCheck, 
  AlertCircle, 
  XCircle, 
  RefreshCw,
  Notebook,
  History,
  LayoutGrid,
  CreditCard,
  Target,
  Zap,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useApp } from '@/src/context/ExpenseContext';
import { useAuth } from '@/src/context/AuthContext';
import { ENTRY_TYPES, ENTRY_STATUS, RECURRING_FREQUENCIES } from '@/src/lib/constants';
import { cn } from '@/src/lib/utils';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import Input from '@/src/components/ui/Input';
import Select from '@/src/components/ui/Select';

const TYPE_OPTIONS = [
  { id: ENTRY_TYPES.MONEY_IN, label: 'Income Inflow', icon: TrendingUp, color: 'text-emerald-600', active: 'bg-emerald-50 border-emerald-200' },
  { id: ENTRY_TYPES.MONEY_OUT, label: 'Expense Outflow', icon: TrendingDown, color: 'text-red-500', active: 'bg-red-50 border-red-200' },
  { id: ENTRY_TYPES.ADDED_MONEY, label: 'Capital Injection', icon: Coins, color: 'text-blue-600', active: 'bg-blue-50 border-blue-200' },
  { id: ENTRY_TYPES.SALARY, label: 'Payroll Protocol', icon: Briefcase, color: 'text-amber-600', active: 'bg-amber-50 border-amber-200' },
  { id: ENTRY_TYPES.TRANSFER, label: 'Internal Transfer', icon: ArrowLeftRight, color: 'text-accounting-text', active: 'bg-accounting-bg/40 border-accounting-text/10' },
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
  category: '',
  status: ENTRY_STATUS.PAID,
  paymentMethod: '',
  notes: '',
  scope: 'company',
  isRecurring: false,
  recurringFrequency: RECURRING_FREQUENCIES.MONTHLY,
};

function AddEntryContent() {
  const { addEntry, updateEntry, entries = [], staff = [], projects = [], accounts = [], categories: dynamicCategories = [], loading: appLoading } = useApp();
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
      return;
    }

    if (editId && entries.length > 0) {
      const t = entries.find(e => e.id.toString() === editId);
      if (t) setForm({ 
        ...BLANK, 
        ...t, 
        amount: (t.amount || 0).toString(), 
        personId: t.personId || '', 
        projectId: t.projectId || '', 
        destination_account_id: t.destination_account_id || '',
        paymentMethod: t.paymentMethod || '',
        category: t.category || '',
        account: t.account || 'Cash',
        status: t.status || ENTRY_STATUS.PAID
      });
    }
  }, [editId, entries, isAdmin, loading, router]);

  const handleTypeChange = (type) => {
    set('type', type);
    const filteredCats = dynamicCategories.filter(c => c.type === (type === ENTRY_TYPES.MONEY_IN ? 'Money In' : 'Money Out'));
    set('category', filteredCats.length > 0 ? filteredCats[0].name : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('System audit requires a heading title'); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Economic value must be a positive integer'); return; }
    setError('');
    setSaving(true);

    const data = {
      ...form,
      amount: parseFloat(form.amount || 0),
      personId: form.personId || null,
      projectId: form.scope === 'project' ? (form.projectId || null) : null,
      createdBy: user?.name || 'System Operator',
    };

    try {
      if (editId) await updateEntry(editId, data);
      else await addEntry(data);
      router.push('/transactions');
    } catch (err) {
      setError('System failure: Unable to commit data to ledger.');
    } finally {
      setSaving(false);
    }
  };

  const categoriesList = dynamicCategories.filter(c => c.type === (form.type === ENTRY_TYPES.MONEY_IN ? 'Money In' : 'Money Out')).map(c => c.name);
  const isTransfer = form.type === ENTRY_TYPES.TRANSFER;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-8">
          <Button variant="secondary" onClick={() => router.back()} className="w-14 h-14 p-0 rounded-2xl group border-accounting-text/10 bg-white">
             <ArrowLeft size={20} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform text-accounting-text" />
          </Button>
          <div>
            <h1 className="text-4xl font-black text-accounting-text tracking-tighter leading-none">
              {editId ? 'Authorize Modification' : 'Manual Entry Protocol'}
            </h1>
            <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest mt-3">
               {editId ? `AUDIT ID: ${editId}` : 'RECORDING NEW FISCAL EVENT'}
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 p-4 bg-accounting-bg/40 rounded-3xl -inner border border-white">
           <div className="text-right">
              <p className="text-[9px] font-black text-secondary-text uppercase tracking-widest leading-none">Operator Identity</p>
              <p className="text-sm font-black text-accounting-text mt-1">{user?.name}</p>
           </div>
           <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center -inner shadow-sm">
              <ShieldCheck size={18} strokeWidth={3} className="text-emerald-600" />
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="p-12 space-y-12 border border-accounting-text/5 shadow-[0_30px_60px_-15px_rgba(45,21,31,0.1)]">
          
          {/* Economic Classification Matrix */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-secondary-text uppercase tracking-widest px-1 flex items-center gap-2">
              <Target size={14} strokeWidth={3} /> Strategic Classification
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {TYPE_OPTIONS.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTypeChange(t.id)}
                  className={cn(
                    'flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-500 gap-4 group',
                    form.type === t.id 
                      ? t.active + " border-transparent shadow-xl scale-[1.03]" 
                      : "bg-accounting-bg/20 border-transparent text-secondary-text/30 hover:bg-white hover:border-accounting-bg/50"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center -inner transition-all",
                    form.type === t.id ? "bg-white shadow-xl border border-white/20" : "bg-white/40"
                  )}>
                    <t.icon size={22} strokeWidth={3} className={form.type === t.id ? t.color : 'text-secondary-text/20'} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-10 border-t border-accounting-bg">
            <div className="space-y-8">
              <Input 
                label="Primary Audit Heading" 
                required 
                placeholder="Brief description of the fiscal event..." 
                value={form.title} 
                onChange={e => set('title', e.target.value)} 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="Economic Value (₹)" 
                  type="number" 
                  step="0.01" 
                  required 
                  placeholder="0.00" 
                  value={form.amount || ''} 
                  onChange={e => set('amount', e.target.value)} 
                />
                <Input 
                  label="Ledger Posting Date" 
                  type="date" 
                  required 
                  value={form.date || ''} 
                  onChange={e => set('date', e.target.value)} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select label={isTransfer ? "Fund Origin Source" : "Audit Account Pointer"} value={form.account || ''} onChange={e => set('account', e.target.value)}>
                  {accounts.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                </Select>

                {isTransfer ? (
                  <Select label="Deployment Destination" required value={form.destination_account_id || ''} onChange={e => set('destination_account_id', e.target.value)}>
                    <option value="">Select Target...</option>
                    {accounts.filter(a => a.name !== form.account).map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                  </Select>
                ) : (
                  <Select label="Settlement Instrument" value={form.paymentMethod || ''} onChange={e => set('paymentMethod', e.target.value)}>
                    <option value="">Unspecified</option>
                    <option value="Cash">Physical Currency</option>
                    <option value="Bank">Bank Automated</option>
                    <option value="UPI">Digital Interface / UPI</option>
                    <option value="Cheque">Physical Cheque</option>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-8 flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Select label="Stakeholder Attribution" value={form.personId || ''} onChange={e => set('personId', e.target.value)}>
                    <option value="">General Systems</option>
                    {staff.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                 </Select>
                 <Select label="Precision Taxonomy Tag" value={form.category || ''} onChange={e => set('category', e.target.value)}>
                    <option value="">Unlabeled</option>
                    {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                 </Select>
              </div>

              <Card className="p-8 bg-accounting-bg/30 rounded-3xl -inner border border-white space-y-6">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest px-1">Functional Deployment Scope</p>
                   {form.scope === 'project' && <Zap size={14} className="text-blue-500 animate-pulse" strokeWidth={3} />}
                </div>
                <div className="flex p-1 bg-white/40 rounded-2xl border border-white shadow-sm">
                  <button 
                    type="button" 
                    onClick={() => { set('scope', 'company'); set('projectId', ''); }}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                      form.scope === 'company' ? "bg-accounting-text text-white shadow-xl" : "text-secondary-text/30 hover:text-accounting-text"
                    )}
                  >Global Corporate</button>
                  <button 
                    type="button" 
                    onClick={() => set('scope', 'project')}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                      form.scope === 'project' ? "bg-accounting-text text-white shadow-xl" : "text-secondary-text/30 hover:text-accounting-text"
                    )}
                  >Initiative Specific</button>
                </div>
                {form.scope === 'project' && (
                  <Select required label="Strategic Initiative Link" value={form.projectId || ''} onChange={e => set('projectId', e.target.value)} className="animate-in fade-in slide-in-from-top-1">
                    <option value="">Identify Target Project...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </Select>
                )}
              </Card>

              <div className="mt-auto">
                 <Select label="Fulfillment Status Protocol" value={form.status || ''} onChange={e => set('status', e.target.value)}>
                    <option value={ENTRY_STATUS.PAID}>Direct Immediate Settlement (Paid)</option>
                    <option value={ENTRY_STATUS.PENDING}>Future Obligatory Liquidation (Pending)</option>
                 </Select>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-accounting-bg space-y-8">
             <div className="flex items-center justify-between bg-accounting-bg/40 p-6 rounded-3xl border border-white -inner">
                <div className="flex items-center gap-4">
                   <div className={cn(
                     "w-10 h-10 rounded-2xl flex items-center justify-center transition-all border border-white",
                     form.isRecurring ? "bg-accounting-text text-white shadow-lg" : "bg-white text-secondary-text/20"
                   )}>
                      <RefreshCw size={18} strokeWidth={3} className={form.isRecurring ? "animate-spin-slow" : ""} />
                   </div>
                   <div className="space-y-1">
                      <p className="text-[11px] font-black text-accounting-text uppercase tracking-widest leading-none">Automated Recursion Engine</p>
                      <p className="text-[9px] font-bold text-secondary-text/40 uppercase tracking-widest">Enable periodic automatic duplication</p>
                   </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => set('isRecurring', !form.isRecurring)}
                  className={cn(
                    "w-14 h-7 rounded-full relative transition-all duration-300 border-2",
                    form.isRecurring ? "bg-accounting-text border-transparent shadow-inner" : "bg-white border-accounting-bg shadow-sm"
                  )}
                >
                   <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all border", form.isRecurring ? "left-8" : "left-1 border-accounting-bg")} />
                </button>
             </div>
             
             {form.isRecurring && (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-2 bg-accounting-bg/20 rounded-3xl border border-white -inner animate-in slide-in-from-top-4">
                  {Object.values(RECURRING_FREQUENCIES).map(f => (
                    <button 
                      key={f} 
                      type="button" 
                      onClick={() => set('recurringFrequency', f)}
                      className={cn(
                        "py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                        form.recurringFrequency === f 
                          ? "bg-white text-accounting-text shadow-xl border border-accounting-text/5" 
                          : "text-secondary-text/20 hover:text-accounting-text"
                      )}
                    >{f}</button>
                  ))}
               </div>
             )}
          </div>

          <div className="space-y-4 pt-4">
            <label className="text-[10px] font-black text-secondary-text uppercase tracking-widest px-2">Procedural Context & Audit Metadata</label>
            <textarea
              className="clay-input w-full min-h-[140px] bg-accounting-bg/20 resize-none text-[13px] leading-relaxed placeholder:text-secondary-text/10 p-6"
              placeholder="Strategic references, voucher codes or internal context..."
              value={form.notes || ''}
              onChange={e => set('notes', e.target.value)}
            />
          </div>

          {error && (
            <div className="p-5 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 animate-in shake duration-500 shadow-lg shadow-red-200/10">
              <XCircle size={22} className="text-red-500" strokeWidth={3} />
              <p className="text-[10px] font-black text-red-700 uppercase tracking-widest leading-none">{error}</p>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6 pt-10 border-t border-accounting-bg">
             <Button type="submit" isLoading={saving} fullWidth className="h-20 text-xl tracking-tighter">
                {editId ? 'Authorize System Modification' : 'Commit Economic Interaction'}
             </Button>
             <Button variant="secondary" onClick={() => router.back()} className="px-16 h-20 text-accounting-text text-lg">Abort Registry</Button>
          </div>
        </Card>
      </form>

      {/* Utility Legend */}
      <div className="mt-12 p-8 bg-white/50 rounded-[2.5rem] border border-accounting-text/5 flex items-start gap-6 shadow-sm">
         <Info size={24} strokeWidth={3} className="text-accounting-text/20 mt-1" />
         <div className="space-y-2">
            <p className="text-[11px] font-black text-accounting-text uppercase tracking-[0.2em] leading-none">Security Protocol Advisory</p>
            <p className="text-[10px] font-bold text-secondary-text/60 leading-relaxed italic max-w-2xl">
               All entries recorded through this interface are logically permanently audited. Strategic role attribution and initiative links are critical for generating accurate quarterly economic forecasts. Ensure fund origin and destination pointers are verified.
            </p>
         </div>
      </div>
    </div>
  );
}

export default function AddEntryPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center"><div className="w-12 h-12 border-4 border-accounting-text/10 border-t-accounting-text rounded-full animate-spin mx-auto" /></div>}>
      <AddEntryContent />
    </Suspense>
  );
}

const Info = ({ size, strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);
