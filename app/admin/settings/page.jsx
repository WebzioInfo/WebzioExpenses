'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  RotateCcw, 
  Download, 
  Upload, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  CreditCard, 
  Plus, 
  History,
  LayoutGrid,
  Zap,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useConfig } from '@/src/context/ConfigContext';
import { cn } from '@/src/lib/utils';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import Input from '@/src/components/ui/Input';
import Modal from '@/src/components/ui/Modal';
import { useToast } from '@/src/context/ToastContext';

export default function AdminSettingsPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const { accounts = [], addAccount, updateAccount, deleteAccount, refreshConfig } = useConfig();
  const { showToast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'backup', 'reset', 'account'
  const [editingAccount, setEditingAccount] = useState(null);
  const [accountForm, setAccountForm] = useState({ name: '', type: 'bank' });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace('/');
    }
  }, [isAdmin, authLoading, router]);

  const handleSystemAction = async (action, data = null) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data })
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message, 'success');
        if (action !== 'backup') await refreshConfig();
      } else {
        throw new Error(result.error || 'Protocol failed');
      }
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
      setModalOpen(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/system');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `webzio_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      showToast('System state exported successfully', 'success');
    } catch (error) {
      showToast('Export failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, accountForm);
      } else {
        await addAccount(accountForm);
      }
      setModalOpen(false);
      setEditingAccount(null);
      setAccountForm({ name: '', type: 'bank' });
    } catch (error) {
      showToast('Account mutation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-12">
      {/* Header Strategy */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 rounded-3xl bg-accounting-text flex items-center justify-center text-white shadow-2xl -outer border border-white/20">
            <ShieldCheck size={32} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-4xl font-montserrat font-black text-accounting-text tracking-tighter leading-none">Admin Protocol</h1>
            <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest mt-3 opacity-60 italic">Strategic System Governance Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-accounting-bg/40 p-2 rounded-2xl border border-white -inner">
           <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center -inner text-emerald-500">
              <Zap size={18} strokeWidth={3} className="animate-pulse" />
           </div>
           <div>
              <p className="text-[8px] font-black text-secondary-text uppercase tracking-widest leading-none">System Pulse</p>
              <p className="text-[10px] font-black text-accounting-text mt-1">Operational & Ready</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Left Column: Accounts and Health */}
        <div className="xl:col-span-4 space-y-8">
          <Card className="p-8 space-y-8 border border-accounting-text/5 shadow-2xl">
            <div className="flex items-center justify-between px-1">
               <div className="flex items-center gap-3">
                  <CreditCard size={18} strokeWidth={3} className="text-accounting-text" />
                  <h3 className="text-[11px] font-black text-accounting-text uppercase tracking-widest">Fiscal Pointers</h3>
               </div>
               <Button 
                variant="secondary" 
                size="sm" 
                className="w-8 h-8 p-0 rounded-xl"
                onClick={() => {
                  setEditingAccount(null);
                  setAccountForm({ name: '', type: 'bank' });
                  setModalType('account');
                  setModalOpen(true);
                }}
               >
                 <Plus size={16} strokeWidth={3} />
               </Button>
            </div>
            
            <div className="space-y-3">
               {accounts.map(acc => (
                 <div key={acc.id} className="group flex items-center justify-between p-4 bg-accounting-bg/20 rounded-2xl border border-white -inner hover:bg-white transition-all cursor-pointer"
                  onClick={() => {
                    setEditingAccount(acc);
                    setAccountForm({ name: acc.name, type: acc.type });
                    setModalType('account');
                    setModalOpen(true);
                  }}>
                    <div className="flex items-center gap-4">
                       <div className="w-8 h-8 rounded-lg bg-accounting-text text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                          {acc.name[0]}
                       </div>
                       <div>
                          <p className="text-xs font-black text-accounting-text uppercase tracking-tighter">{acc.name}</p>
                          <p className="text-[9px] font-bold text-secondary-text opacity-40 uppercase tracking-widest">{acc.type}</p>
                       </div>
                    </div>
                    <Button variant="ghost" size="sm" icon={Trash2} className="opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-500 transition-all p-0 w-8 h-8" 
                      onClick={(e) => { e.stopPropagation(); if(confirm('Disable account pointer?')) deleteAccount(acc.id); }} />
                 </div>
               ))}
            </div>
          </Card>

          <Card className="p-8 bg-accounting-text text-white space-y-6 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-10 -translate-y-10 blur-xl" />
             <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                   <Activity size={18} strokeWidth={3} className="text-emerald-400" />
                   <h3 className="text-[11px] font-black uppercase tracking-widest">System Metrics</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/10 -inner">
                      <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Active Pointers</p>
                      <p className="text-2xl font-black mt-1">{accounts.length}</p>
                   </div>
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/10 -inner">
                      <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Uptime Pulse</p>
                      <p className="text-2xl font-black mt-1 text-emerald-400">99.9%</p>
                   </div>
                </div>
             </div>
          </Card>
        </div>

        {/* Right Column: Strategic Controls */}
        <div className="xl:col-span-8 space-y-8">
          <Card className="p-10 space-y-10 border border-accounting-text/5 shadow-2xl">
            {/* Backup Engine */}
            <div className="space-y-6">
               <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-4">
                     <div className="w-11 h-11 rounded-2xl bg-accounting-bg/60 flex items-center justify-center -inner border border-white">
                        <Download size={20} strokeWidth={3} className="text-accounting-text" />
                     </div>
                     <div>
                        <h3 className="text-[11px] font-black text-accounting-text uppercase tracking-widest leading-none">Backup Infrastructure</h3>
                        <p className="text-[9px] font-bold text-secondary-text/40 uppercase tracking-widest mt-2 italic">Export/Import full system state</p>
                     </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button onClick={handleExport} className="flex flex-col items-center p-8 bg-accounting-bg/30 rounded-[2.5rem] border-2 border-dashed border-white hover:bg-white hover:border-accounting-text/10 transition-all group overflow-hidden relative">
                     <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center -inner mb-4 shadow-sm">
                        <Download size={24} strokeWidth={3} className="text-accounting-text group-hover:scale-110 transition-transform" />
                     </div>
                     <span className="text-[10px] font-black text-accounting-text uppercase tracking-widest">Download Snapshot</span>
                     <p className="text-[8px] font-bold text-secondary-text/40 mt-2 italic">Strategic JSON Archive</p>
                  </button>
                  <button onClick={() => { setModalType('import'); setModalOpen(true); }} className="flex flex-col items-center p-8 bg-accounting-bg/30 rounded-[2.5rem] border-2 border-dashed border-white hover:bg-white hover:border-accounting-text/10 transition-all group overflow-hidden relative">
                     <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center -inner mb-4 shadow-sm">
                        <Upload size={24} strokeWidth={3} className="text-accounting-text group-hover:translate-y-[-2px] transition-transform" />
                     </div>
                     <span className="text-[10px] font-black text-accounting-text uppercase tracking-widest">Restore Hierarchy</span>
                     <p className="text-[8px] font-bold text-secondary-text/40 mt-2 italic">Upload External Database</p>
                  </button>
               </div>
            </div>

            {/* Protocol Resets */}
            <div className="space-y-6 pt-10 border-t border-accounting-bg">
               <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center -inner border border-red-100">
                     <RotateCcw size={20} strokeWidth={3} className="text-red-500" />
                  </div>
                  <div>
                     <h3 className="text-[11px] font-black text-accounting-text uppercase tracking-widest leading-none">Initialization Protocols</h3>
                     <p className="text-[9px] font-bold text-secondary-text/40 uppercase tracking-widest mt-2 italic">Destructive system resets (Admin Only)</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-8 space-y-6 bg-red-50/10 border-red-100 rounded-[2.5rem] relative group hover:bg-red-50/30 transition-all">
                     <div className="flex items-center justify-between">
                        <History size={20} strokeWidth={3} className="text-red-400 opacity-20" />
                        <AlertTriangle size={18} strokeWidth={3} className="text-red-500" />
                     </div>
                     <div className="space-y-4">
                        <div>
                           <p className="text-[10px] font-black text-red-700 uppercase tracking-widest">Transactional Wipe</p>
                           <p className="text-[9px] font-bold text-red-800/40 mt-1 italic">Truncates all fiscal audit logs.</p>
                        </div>
                        <Button variant="danger" fullWidth className="h-14 tracking-widest" icon={RotateCcw} onClick={() => { setModalType('reset_tx'); setModalOpen(true); }}>
                           Execute Reset
                        </Button>
                     </div>
                  </Card>

                  <Card className="p-8 space-y-6 bg-accounting-text text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                     <div className="absolute inset-0 bg-red-600/10 group-hover:bg-red-600/20 transition-all" />
                     <div className="relative z-10 space-y-4">
                        <div className="flex items-center justify-between">
                           <LayoutGrid size={20} strokeWidth={3} className="opacity-20" />
                           <Trash2 size={18} strokeWidth={3} className="text-red-400" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">Factory Initialization</p>
                           <p className="text-[9px] font-bold text-white/30 mt-1 italic">Full system wipe (Except core users).</p>
                        </div>
                        <Button fullWidth className="h-14 bg-red-600/20 border border-red-600/30 hover:bg-red-600 text-white tracking-widest" icon={Trash2} onClick={() => { setModalType('reset_full'); setModalOpen(true); }}>
                           Factory Wipe
                        </Button>
                     </div>
                  </Card>
               </div>
            </div>
          </Card>
          
          <Card className="p-8 bg-accounting-bg/40 border border-accounting-text/5 flex items-start gap-6 shadow-sm">
             <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center -inner border border-accounting-text/5 shrink-0">
                <Lock size={20} strokeWidth={3} className="text-accounting-text/30" />
             </div>
             <div className="space-y-2">
                <p className="text-[11px] font-black text-accounting-text uppercase tracking-widest leading-none mt-1">Audit Metadata Integrity</p>
                <p className="text-[10px] font-bold text-secondary-text/40 leading-relaxed max-w-2xl italic">
                   Administrative actions are logged with role-based hardware identifiers. Mutating system-wide fiscal accounts affects historic reporting and dashboard aggregates instantly across all environments.
                </p>
             </div>
          </Card>
        </div>
      </div>

      {/* Protocol Modals */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={
        modalType === 'account' ? (editingAccount ? 'Authorize Modification' : 'Provision Account Pointer') :
        modalType === 'import' ? 'Security Protocol: Data Injection' :
        'System Integrity Warning'
      }>
        <div className="space-y-8">
           {modalType === 'account' ? (
             <form onSubmit={handleAccountSubmit} className="space-y-6">
                <Input label="Identity Label" required placeholder="e.g. HDFC Current, ICICI Savings..." value={accountForm.name} onChange={e => setAccountForm({...accountForm, name: e.target.value})} />
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondary-text uppercase tracking-widest px-1">Instrument Strategy</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['bank', 'cash', 'upi', 'petty_cash', 'other'].map(t => (
                      <button key={t} type="button" onClick={() => setAccountForm({...accountForm, type: t})} 
                      className={cn("py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", accountForm.type === t ? "bg-accounting-text text-white shadow-lg" : "bg-accounting-bg text-secondary-text/40 hover:text-accounting-text border border-white")}>{t.replace('_', ' ')}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 pt-6 border-t border-accounting-bg">
                   <Button type="submit" isLoading={loading} fullWidth className="h-14">{editingAccount ? 'Modify Pointer' : 'Provision Account'}</Button>
                   <Button variant="secondary" onClick={() => setModalOpen(false)} className="px-10 h-14">Abort</Button>
                </div>
             </form>
           ) : modalType === 'import' ? (
             <div className="space-y-10 text-center py-4">
                <div className="w-24 h-24 rounded-4xl bg-amber-50 border-2 border-dashed border-amber-200 flex items-center justify-center mx-auto -inner">
                   <Upload size={32} className="text-amber-500 group-hover:translate-y-[-2px] transition-transform animate-float" />
                </div>
                <div className="space-y-4">
                   <p className="text-xl font-black text-accounting-text uppercase tracking-tighter">Injection Protocol Required</p>
                   <p className="text-[10px] font-bold text-secondary-text leading-relaxed uppercase tracking-widest max-w-[320px] mx-auto italic">Warning: This interaction will truncate the current strategic database and reload it with the provided archive file.</p>
                </div>
                <input type="file" id="import-upload" className="hidden" accept=".json" onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => handleSystemAction('import', JSON.parse(e.target.result));
                    reader.readAsText(file);
                  }
                }} />
                <div className="flex flex-col gap-4">
                   <Button onClick={() => document.getElementById('import-upload').click()} isLoading={loading} fullWidth className="h-16 text-lg bg-amber-500 text-white border-none">Select System Archive</Button>
                   <Button variant="secondary" onClick={() => setModalOpen(false)} className="h-14">Abort Protocol</Button>
                </div>
             </div>
           ) : (
             <div className="space-y-10 text-center py-4">
                <div className="w-24 h-24 rounded-4xl bg-red-50 flex items-center justify-center mx-auto -inner border border-red-100">
                   <AlertTriangle size={32} className="text-red-500 animate-pulse" />
                </div>
                <div className="space-y-4">
                   <p className="text-xl font-black text-red-600 uppercase tracking-tighter">System Sanitization Hazard</p>
                   <p className="text-[10px] font-bold text-secondary-text leading-relaxed uppercase tracking-widest max-w-[320px] mx-auto italic">Executing this protocol will permanently destroy system records. This interaction cannot be reversed by human effort.</p>
                </div>
                <div className="flex flex-col gap-4 pt-6 border-t border-accounting-bg">
                   <Button variant="danger" onClick={() => handleSystemAction(modalType === 'reset_tx' ? 'reset_transactions' : 'full_reset')} isLoading={loading} fullWidth className="h-16 text-lg">Confirm Total Sanitization</Button>
                   <Button variant="secondary" onClick={() => setModalOpen(false)} className="h-14 text-accounting-text">Abort Initialization</Button>
                </div>
             </div>
           )}
        </div>
      </Modal>
    </div>
  );
}
