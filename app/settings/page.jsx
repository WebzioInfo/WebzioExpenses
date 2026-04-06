'use client';

import React, { useState } from 'react';
import { useApp } from '@/src/context/ExpenseContext';
import Button from '@/src/components/ui/Button';
import { Download, Upload, Plus, Trash2, Check, Shield, UserCog, Database } from 'lucide-react';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/src/lib/constants';
import { cn } from '@/src/lib/utils';

export default function SettingsPage() {
  const { 
    exportData, 
    entries, 
    loading, 
    accounts, 
    addAccount, 
    systemUsers = [], 
    updateSystemUser,
    updateSystemUserPermissions 
  } = useApp();
  
  const [activeTab, setActiveTab] = useState('accounts');
  const [importStatus, setImportStatus] = useState('');
  const [newAccount, setNewAccount] = useState({ name: '', type: 'bank' });

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus('Reading file...');
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      setImportStatus(`Found ${data.entries?.length || 0} entries. Use the migration script to import into database.`);
    } catch {
      setImportStatus('Error: Invalid JSON file.');
    }
  };

  const tabs = [
    { id: 'accounts', label: 'Accounts', icon: Database },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'categories', label: 'Categories', icon: UserCog },
    { id: 'data', label: 'Data & Backup', icon: Upload },
  ];

  if (loading) return (
    <div className="py-20 flex flex-col items-center gap-4">
      <div className="w-12 h-12 bg-[#2D151F]/10 rounded-2xl animate-pulse shadow-clay-inner" />
      <p className="text-[10px] font-black text-[#2D151F]/30 uppercase tracking-widest">Waking up system...</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      <div className="px-1">
        <h1 className="text-3xl font-black text-[#2D151F] tracking-tighter leading-none">Settings</h1>
        <p className="text-[9px] font-black text-[#2D151F]/30 uppercase tracking-[0.3em] mt-1">Manage your system preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2.5 px-1 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map(t => (
          <Button 
            key={t.id} 
            variant={activeTab === t.id ? 'primary' : 'outline'}
            onClick={() => setActiveTab(t.id)}
            icon={t.icon}
            iconSize={13}
            className="shrink-0"
          >
            {t.label}
          </Button>
        ))}
      </div>

      {activeTab === 'accounts' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
          <div className="clay-card p-8 space-y-6">
            <h3 className="font-black text-[#2D151F] uppercase tracking-tighter flex items-center gap-2">
              <Database size={16} /> Manage Accounts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {accounts.map(acc => (
                <div key={acc.id} className="flex items-center justify-between p-5 bg-accounting-bg/40 rounded-3xl border border-white/40 shadow-clay-inner group">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-[#2D151F] uppercase tracking-tight">{acc.name}</span>
                    <span className="text-[8px] font-black text-[#2D151F]/40 uppercase tracking-widest">{acc.type}</span>
                  </div>
                  <Check size={14} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
                </div>
              ))}
            </div>
          </div>

          <div className="clay-card p-8 space-y-5">
            <h3 className="font-black text-[#2D151F] uppercase tracking-tighter">Add New Account</h3>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newAccount.name) return;
                await addAccount(newAccount);
                setNewAccount({ name: '', type: 'bank' });
              }} 
              className="flex flex-col sm:flex-row gap-3"
            >
              <input 
                className="clay-input flex-1 h-12 text-sm" 
                placeholder="Account Name (e.g. HDFC, Petty Cash...)" 
                value={newAccount.name}
                onChange={e => setNewAccount({...newAccount, name: e.target.value})}
              />
              <select 
                className="clay-input w-full sm:w-32 h-12 text-sm"
                value={newAccount.type}
                onChange={e => setNewAccount({...newAccount, type: e.target.value})}
              >
                <option value="bank">Bank</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="other">Other</option>
              </select>
              <Button type="submit" className="h-12 sm:w-24 shrink-0" icon={Plus}>Add</Button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
          <div className="clay-card p-8 space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="font-black text-[#2D151F] uppercase tracking-tighter flex items-center gap-2">
                 <Shield size={16} /> System Permissions
               </h3>
            </div>
            <p className="text-[11px] text-[#2D151F]/40 leading-relaxed italic">
              Admins have full access. For Staff/Freelancers, enable specific module permissions below.
            </p>
            
            <div className="space-y-4">
              {systemUsers.length === 0 ? (
                <div className="p-10 text-center clay-card shadow-clay-inner">
                  <p className="text-[10px] font-black text-[#2D151F]/30 uppercase tracking-widest">No system users found.</p>
                </div>
              ) : systemUsers.map(u => (
                <div key={u.id} className="p-6 bg-white rounded-[32px] shadow-clay-inner border border-white/40 space-y-5 group hover:border-[#2D151F]/10 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-[#2D151F]/5 rounded-2xl flex items-center justify-center shadow-clay-inner">
                         <UserCog className="text-[#2D151F]/30" size={18} />
                       </div>
                       <div>
                         <p className="font-black text-[#2D151F] text-base leading-none">{u.name}</p>
                         <p className="text-[9px] font-black text-[#2D151F]/30 uppercase tracking-widest mt-1">{u.email}</p>
                       </div>
                    </div>
                    <select 
                      className="clay-input h-10 text-[9px] font-black uppercase tracking-widest min-w-[140px]"
                      value={u.role}
                      onChange={async (e) => {
                        await updateSystemUser(u.id, { role: e.target.value, permissions: u.permissions });
                      }}
                    >
                      <option value="admin">Administrator</option>
                      <option value="staff">Standard Staff</option>
                      <option value="freelancer">Freelancer</option>
                    </select>
                  </div>

                  {u.role !== 'admin' && (
                    <div className="pt-4 border-t border-[#2D151F]/5">
                      <p className="text-[8px] font-black text-[#2D151F]/30 uppercase tracking-widest mb-3">Module Access Permissions</p>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {['Finance', 'Projects', 'Tasks', 'CRM'].map(mod => {
                          const hasMod = u.permissions?.includes(mod);
                          return (
                            <Button
                              key={mod}
                              size="sm"
                              variant={hasMod ? 'primary' : 'outline'}
                              onClick={async () => {
                                const newPerms = hasMod 
                                  ? u.permissions.filter(p => p !== mod)
                                  : [...(u.permissions || []), mod];
                                await updateSystemUserPermissions(u.id, { permissions: newPerms });
                              }}
                              icon={hasMod ? Check : null}
                              className={cn('h-10 text-[8px]', !hasMod && 'bg-accounting-bg border-transparent opacity-60')}
                            >
                              {mod}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
          <div className="clay-card p-8 space-y-5">
            <h3 className="font-black text-[#2D151F] uppercase tracking-tighter flex items-center gap-2">
              <Check className="text-emerald-500" size={16} /> Income Categories
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {INCOME_CATEGORIES.map(c => (
                <div key={c} className="flex items-center justify-between p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl shadow-clay-inner">
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tight">{c}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="clay-card p-8 space-y-5">
            <h3 className="font-black text-[#2D151F] uppercase tracking-tighter flex items-center gap-2">
              <Check className="text-red-400" size={16} /> Expense Categories
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {EXPENSE_CATEGORIES.map(c => (
                <div key={c} className="flex items-center justify-between p-4 bg-red-50/50 border border-red-100 rounded-2xl shadow-clay-inner">
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-tight">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'data' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
          {/* Export */}
          <div className="clay-card p-8 space-y-5">
            <h3 className="font-black text-[#2D151F] uppercase tracking-tighter">Export Backup</h3>
            <p className="text-sm text-[#2D151F]/40 leading-relaxed">Download all your data as a JSON backup file. Recommended weekly for safety.</p>
            <Button
              onClick={exportData}
              icon={Download}
              className="h-12"
            >
              Download Backup ({entries.length} items)
            </Button>
          </div>

          {/* Import */}
          <div className="clay-card p-8 space-y-5">
            <h3 className="font-black text-[#2D151F] uppercase tracking-tighter">Import / Restore</h3>
            <p className="text-sm text-[#2D151F]/40 leading-relaxed">Select a JSON backup file to preview its content. Bulk imports must be done via migration scripts.</p>
            <label className="group relative">
               <input type="file" accept=".json" onChange={handleImport} className="hidden" id="restore-file" />
               <Button 
                 variant="outline" 
                 icon={Upload} 
                 className="h-12 text-[#2D151F]"
                 onClick={() => document.getElementById('restore-file').click()}
               >
                 Select Backup File
               </Button>
            </label>
            {importStatus && (
              <div className="p-5 bg-accounting-bg rounded-3xl shadow-clay-inner border border-white/20">
                <p className="text-[10px] font-black text-[#2D151F]/50 uppercase tracking-widest leading-relaxed">{importStatus}</p>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-[32px] shadow-clay-inner flex gap-4">
            <Shield className="text-amber-800 shrink-0 mt-0.5" size={16} />
            <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest leading-relaxed">
              Data Integrity Policy: All deletions are soft-delete only. No financial data is permanently erased. Use system admin tools for reconciliation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
