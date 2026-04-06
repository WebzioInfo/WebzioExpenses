'use client';

import React, { useState, Suspense } from 'react';
import { Tag, Plus, Edit2, Trash2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useApp } from '@/src/context/ExpenseContext';
import { cn } from '@/src/lib/utils';
import Button from '@/src/components/ui/Button';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div className="space-y-2"><div className="w-48 h-8 bg-[#2D151F]/10 rounded-xl animate-pulse" /><div className="w-24 h-3 bg-[#2D151F]/10 rounded-lg animate-pulse" /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div>
          <h1 className="text-3xl font-black text-[#2D151F] tracking-tighter leading-none">Categories</h1>
          <p className="text-[9px] font-black text-accounting-text/60 uppercase tracking-[0.3em] mt-1">Manage find-tuned expense and income labels</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} icon={Plus}>New Category</Button>
        )}
      </div>

      {isAdding && (
        <div className="clay-card p-6 animate-in slide-in-from-top duration-300">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-[9px] font-black text-accounting-text/60 uppercase tracking-widest ml-1">Category Name</label>
              <input
                required
                className="clay-input w-full h-11 text-sm"
                placeholder="e.g. Subsistence, Cloud Hosting..."
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-accounting-text/60 uppercase tracking-widest ml-1">Type</label>
              <select 
                className="clay-input h-11 text-sm w-full sm:w-40" 
                value={form.type} 
                onChange={e => setForm({ ...form, type: e.target.value })}
              >
                <option value="Money In">Money In</option>
                <option value="Money Out">Money Out</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" isLoading={false} className="h-11 px-6">
                {editingId ? 'Update' : 'Save'}
              </Button>
              <Button variant="outline" type="button" onClick={resetForm} className="h-11 px-6 text-[#2D151F]">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Income Categories */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest px-1 flex items-center gap-2">
            <TrendingUp size={12} /> Income Labels
          </h2>
          <div className="clay-card overflow-hidden">
            {categoriesByType['Money In'].length === 0 ? (
              <p className="p-10 text-center text-[10px] font-black text-accounting-text/50 uppercase">No income categories</p>
            ) : (
              categoriesByType['Money In'].map((cat, i) => (
                <div key={cat.id} className={cn('flex items-center justify-between p-4 group hover:bg-accounting-bg/20 transition-colors', i > 0 && 'border-t border-[#2D151F]/5')}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-clay-inner">
                      <Tag size={14} />
                    </div>
                    <span className="text-sm font-black text-[#2D151F]">{cat.name}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => startEdit(cat)} 
                      icon={Edit2}
                      className="p-2 w-8 h-8 flex items-center justify-center text-accounting-text/60 hover:text-[#2D151F]"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => { if(confirm('Delete this category?')) deleteCategory(cat.id) }} 
                      icon={Trash2}
                      className="p-2 w-8 h-8 flex items-center justify-center text-red-300 hover:text-red-500"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expense Categories */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black text-red-500/50 uppercase tracking-widest px-1 flex items-center gap-2">
            <TrendingDown size={12} /> Expense Labels
          </h2>
          <div className="clay-card overflow-hidden">
            {categoriesByType['Money Out'].length === 0 ? (
              <p className="p-10 text-center text-[10px] font-black text-accounting-text/50 uppercase">No expense categories</p>
            ) : (
              categoriesByType['Money Out'].map((cat, i) => (
                <div key={cat.id} className={cn('flex items-center justify-between p-4 group hover:bg-accounting-bg/20 transition-colors', i > 0 && 'border-t border-[#2D151F]/5')}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shadow-clay-inner">
                      <Tag size={14} />
                    </div>
                    <span className="text-sm font-black text-[#2D151F]">{cat.name}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => startEdit(cat)} 
                      icon={Edit2}
                      className="p-2 w-8 h-8 flex items-center justify-center text-accounting-text/60 hover:text-[#2D151F]"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => { if(confirm('Delete this category?')) deleteCategory(cat.id) }} 
                      icon={Trash2}
                      className="p-2 w-8 h-8 flex items-center justify-center text-red-300 hover:text-red-500"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3">
        <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[10px] font-black text-amber-800 uppercase leading-relaxed tracking-wide">
          Note: Deleting a category will not delete transactions using it, but it will no longer appear in filters or dropdowns.
        </p>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center"><div className="w-10 h-10 bg-[#2D151F]/10 rounded-2xl animate-pulse mx-auto" /></div>}>
      <CategoriesContent />
    </Suspense>
  );
}
