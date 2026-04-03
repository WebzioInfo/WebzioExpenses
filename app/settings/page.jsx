'use client';

import React, { useState } from 'react';
import { useApp } from '@/src/context/ExpenseContext';
import { Download, Upload, Plus, Trash2, Check } from 'lucide-react';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/src/utils/constants';
import { cn } from '@/src/utils/helpers';

export default function SettingsPage() {
  const { exportData, entries, loading } = useApp();
  const [activeTab, setActiveTab] = useState('categories');
  const [importStatus, setImportStatus] = useState('');

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
    { id: 'categories', label: 'Categories' },
    { id: 'data', label: 'Data & Backup' },
  ];

  if (loading) return <div className="py-20 flex justify-center"><div className="w-10 h-10 bg-[#2D151F]/10 rounded-2xl animate-pulse shadow-clay-inner" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6">
      <div className="px-1">
        <h1 className="text-3xl font-black text-[#2D151F] tracking-tighter leading-none">Settings</h1>
        <p className="text-[9px] font-black text-[#2D151F]/30 uppercase tracking-[0.3em] mt-1">Manage your system preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={cn('h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all', activeTab === t.id ? 'bg-[#2D151F] text-[#F4F3DC] shadow-clay-outer' : 'bg-white text-[#2D151F]/30 hover:bg-[#F4F3DC] shadow-clay-inner')}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="clay-card p-8 space-y-5">
            <h3 className="font-black text-[#2D151F] uppercase tracking-tighter">Income Categories</h3>
            <div className="space-y-2">
              {INCOME_CATEGORIES.map(c => (
                <div key={c} className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <span className="text-sm font-black text-emerald-700">{c}</span>
                  <Check size={14} className="text-emerald-400" strokeWidth={2.5} />
                </div>
              ))}
            </div>
            <p className="text-[9px] font-black text-[#2D151F]/20 uppercase tracking-widest">Custom categories can be added via database settings.</p>
          </div>
          <div className="clay-card p-8 space-y-5">
            <h3 className="font-black text-[#2D151F] uppercase tracking-tighter">Expense Categories</h3>
            <div className="space-y-2">
              {EXPENSE_CATEGORIES.map(c => (
                <div key={c} className="flex items-center justify-between p-3 bg-red-50/50 border border-red-100 rounded-xl">
                  <span className="text-sm font-black text-red-600">{c}</span>
                  <Check size={14} className="text-red-300" strokeWidth={2.5} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'data' && (
        <div className="space-y-6">
          {/* Export */}
          <div className="clay-card p-8 space-y-5">
            <h3 className="font-black text-[#2D151F] uppercase tracking-tighter">Export Backup</h3>
            <p className="text-sm text-[#2D151F]/50">Download all your data as a JSON backup file. Includes entries, staff, and projects.</p>
            <button
              onClick={exportData}
              className="flex items-center gap-2 h-12 px-6 bg-[#2D151F] text-[#F4F3DC] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#4A2B3A] transition-all shadow-clay-outer"
            >
              <Download size={16} strokeWidth={2.5} />
              Download Backup ({entries.length} entries)
            </button>
          </div>

          {/* Import */}
          <div className="clay-card p-8 space-y-5">
            <h3 className="font-black text-[#2D151F] uppercase tracking-tighter">Import / Restore</h3>
            <p className="text-sm text-[#2D151F]/50">Select a JSON backup file to preview it. For full database import, use the migration script.</p>
            <label className="flex items-center gap-2 h-12 px-6 clay-btn shadow-clay-outer cursor-pointer text-[10px] font-black uppercase tracking-widest text-[#2D151F]/40 hover:text-[#2D151F] w-fit">
              <Upload size={16} strokeWidth={2.5} />
              Select Backup File
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            {importStatus && (
              <div className="p-4 bg-[#F4F3DC] rounded-2xl shadow-clay-inner border border-white/40">
                <p className="text-[11px] font-black text-[#2D151F]/60">{importStatus}</p>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl shadow-clay-inner">
            <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest leading-relaxed">
              Data Safety: All deletions are soft-delete only. No data is permanently erased. Use the migration script for bulk imports.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
