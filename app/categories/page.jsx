'use client';

import React, { useState, Suspense } from 'react';
import { Tag, Plus, Edit2, Trash2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useApp } from '@/src/context/ExpenseContext';
import { cn } from '@/src/lib/utils';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import Input from '@/src/components/ui/Input';
import Select from '@/src/components/ui/Select';
import { TableSkeleton } from '@/src/components/ui/Skeleton';

function CategoriesContent() {
  const { categories = [], addCategory, updateCategory, deleteCategory, loading } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'Money Out' });

  const resetForm = () => {
    setForm({ name: '', type: 'Money Out' });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingId) {
      await updateCategory(editingId, form);
    } else {
      await addCategory(form);
    }
    resetForm();
  };

  const startEdit = (cat) => {
    setForm({ name: cat.name, type: cat.type });
    setEditingId(cat.id);
    setIsAdding(true);
  };

  if (loading) return (
    <div className="space-y-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-1">
        <div className="space-y-2"><div className="w-48 h-8 bg-accounting-text/10 rounded-xl animate-pulse" /><div className="w-24 h-3 bg-accounting-text/10 rounded-lg animate-pulse" /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <TableSkeleton />
        <TableSkeleton />
      </div>
    </div>
  );

  const categoriesByType = {
    'Money In': categories.filter(c => c.type === 'Money In'),
    'Money Out': categories.filter(c => c.type === 'Money Out'),
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-1">
        <div>
          <h1 className="text-4xl font-black text-accounting-text tracking-tighter leading-none">Category Matrix</h1>
          <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest mt-2">Precision labeling for systemic fiscal events</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} icon={Plus}>Provision Tag</Button>
        )}
      </div>

      {/* Addition / Modification Interface */}
      {isAdding && (
        <Card className="p-8 animate-in slide-in-from-top duration-300 border border-accounting-text/5 shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row items-end gap-6">
            <div className="flex-1 w-full lg:w-auto">
              <Input
                label="Strategic Label Name"
                required
                placeholder="e.g. Cloud Infrastructure, Marketing Assets..."
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                autoFocus
              />
            </div>
            <div className="w-full lg:w-64">
              <Select
                label="Economic Flow Type"
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
              >
                <option value="Money In">System Inflow</option>
                <option value="Money Out">System Outflow</option>
              </Select>
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <Button type="submit" className="h-12 px-10 flex-1 lg:flex-none">
                {editingId ? 'Authorize Update' : 'Initialize Tag'}
              </Button>
              <Button variant="secondary" type="button" onClick={resetForm} className="h-12 px-6">
                Abort
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Category Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Income Categories */}
        <div className="space-y-5">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest flex items-center gap-2">
               <TrendingUp size={14} strokeWidth={3} /> Inflow Protocols
            </h2>
            <span className="text-[9px] font-black text-secondary-text/20 uppercase tracking-widest">{categoriesByType['Money In'].length} Active</span>
          </div>
          <Card className="overflow-hidden border border-accounting-text/5 shadow-xl">
            {categoriesByType['Money In'].length === 0 ? (
              <div className="p-20 text-center space-y-3 opacity-20">
                <Tag size={32} className="mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-widest leading-none">Registry Null</p>
              </div>
            ) : (
              <div className="divide-y divide-accounting-bg">
                {categoriesByType['Money In'].map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-5 group hover:bg-accounting-bg/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center -inner border border-white">
                        <Tag size={16} strokeWidth={3} />
                      </div>
                      <span className="text-base font-black text-accounting-text tracking-tight group-hover:translate-x-0.5 transition-transform">{cat.name}</span>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(cat)} icon={Edit2} className="w-9 h-9 p-0 text-secondary-text hover:text-accounting-text bg-white border border-accounting-text/5 shadow-sm" />
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm('Delete this category?')) deleteCategory(cat.id) }} icon={Trash2} className="w-9 h-9 p-0 text-red-300 hover:text-red-500 bg-white border border-accounting-text/5 shadow-sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Expense Categories */}
        <div className="space-y-5">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black text-red-500/60 uppercase tracking-widest flex items-center gap-2">
               <TrendingDown size={14} strokeWidth={3} /> Outflow Protocols
            </h2>
            <span className="text-[9px] font-black text-secondary-text/20 uppercase tracking-widest">{categoriesByType['Money Out'].length} Active</span>
          </div>
          <Card className="overflow-hidden border border-accounting-text/5 shadow-xl">
            {categoriesByType['Money Out'].length === 0 ? (
              <div className="p-20 text-center space-y-3 opacity-20">
                <Tag size={32} className="mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-widest leading-none">Registry Null</p>
              </div>
            ) : (
              <div className="divide-y divide-accounting-bg">
                {categoriesByType['Money Out'].map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-5 group hover:bg-accounting-bg/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center -inner border border-white">
                        <Tag size={16} strokeWidth={3} />
                      </div>
                      <span className="text-base font-black text-accounting-text tracking-tight group-hover:translate-x-0.5 transition-transform">{cat.name}</span>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(cat)} icon={Edit2} className="w-9 h-9 p-0 text-secondary-text hover:text-accounting-text bg-white border border-accounting-text/5 shadow-sm" />
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm('Delete this category?')) deleteCategory(cat.id) }} icon={Trash2} className="w-9 h-9 p-0 text-red-400 hover:text-red-600 bg-white border border-accounting-text/5 shadow-sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Utility Alert */}
      <Card className="p-6 bg-amber-50/50 border border-amber-200/50 flex gap-4 shadow-none -inner">
        <AlertCircle size={20} strokeWidth={3} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-[11px] font-black text-amber-800 uppercase tracking-wide leading-none">Strategic Maintenance Protocol</p>
          <p className="text-[10px] font-bold text-amber-900/60 leading-relaxed italic">
            Note: Tag deletion is a logical operation. Existing transactions will retain their historical labeling, but the tag will be purged from future selection matrices.
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center"><div className="w-12 h-12 border-4 border-accounting-text/10 border-t-accounting-text rounded-full animate-spin mx-auto" /></div>}>
      <CategoriesContent />
    </Suspense>
  );
}
