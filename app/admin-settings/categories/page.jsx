'use client';

import React, { useState } from 'react';
import { Tag, Plus, Edit2, Trash2, TrendingUp, TrendingDown, AlertCircle, BookmarkPlus } from 'lucide-react';
import { useApp } from '@/src/context/ExpenseContext';
import { cn } from '@/src/lib/utils';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import Input from '@/src/components/ui/Input';
import Select from '@/src/components/ui/Select';

export default function CategoriesManagementPage() {
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
    <div className="flex items-center justify-center py-32">
       <div className="w-10 h-10 border-4 border-accounting-text/10 border-t-accounting-text rounded-full animate-spin" />
    </div>
  );

  const categoriesByType = {
    'Money In': categories.filter(c => c.type === 'Money In'),
    'Money Out': categories.filter(c => c.type === 'Money Out'),
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-accounting-text tracking-tighter uppercase">Categories</h2>
          <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest mt-1">Manage financial labels</p>
        </div>
        {!isAdding && <Button onClick={() => setIsAdding(true)} icon={BookmarkPlus}>New Category</Button>}
      </div>

      {isAdding && (
        <Card className="bg-accounting-bg/30 border-2 border-accounting-text/5 -inner animate-in slide-in-from-top duration-300">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1">
              <Input 
                label="Category Name" 
                required 
                placeholder="e.g. Subsistence, Cloud Hosting..." 
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })} 
                autoFocus
              />
            </div>
            <div className="w-full md:w-48">
              <Select 
                label="Logic Type" 
                value={form.type} 
                onChange={e => setForm({ ...form, type: e.target.value })}
              >
                <option value="Money In">Money In</option>
                <option value="Money Out">Money Out</option>
              </Select>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button type="submit" className="px-8">{editingId ? 'Update' : 'Save'}</Button>
              <Button variant="secondary" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Income Categories */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-emerald-600 px-2 flex items-center gap-2 uppercase tracking-widest">
            <TrendingUp size={14} strokeWidth={3} /> Income Labels
          </h3>
          <div className="clay-card border border-accounting-text/5 overflow-hidden">
            {categoriesByType['Money In'].length === 0 ? (
               <div className="p-10 text-center opacity-40"><p className="text-[10px] font-black uppercase tracking-widest">Empty</p></div>
            ) : (
              categoriesByType['Money In'].map((cat, i) => (
                <div key={cat.id} className={cn('flex items-center justify-between p-4 group hover:bg-accounting-bg/40 transition-colors', i > 0 && 'border-t border-accounting-text/5')}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center -inner border border-emerald-100 shadow-sm">
                      <Tag size={16} strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-black text-accounting-text tracking-tight">{cat.name}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(cat)} icon={Edit2} className="w-8 h-8 p-0" />
                    <Button variant="ghost" size="sm" onClick={() => { if (confirm('Delete this category?')) deleteCategory(cat.id) }} icon={Trash2} className="w-8 h-8 p-0 text-red-400 hover:text-red-600" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expense Categories */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-red-500 px-2 flex items-center gap-2 uppercase tracking-widest">
            <TrendingDown size={14} strokeWidth={3} /> Expense Labels
          </h3>
          <div className="clay-card border border-accounting-text/5 overflow-hidden">
            {categoriesByType['Money Out'].length === 0 ? (
               <div className="p-10 text-center opacity-40"><p className="text-[10px] font-black uppercase tracking-widest">Empty</p></div>
            ) : (
              categoriesByType['Money Out'].map((cat, i) => (
                <div key={cat.id} className={cn('flex items-center justify-between p-4 group hover:bg-accounting-bg/40 transition-colors', i > 0 && 'border-t border-accounting-text/5')}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center -inner border border-red-100 shadow-sm">
                      <Tag size={16} strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-black text-accounting-text tracking-tight">{cat.name}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(cat)} icon={Edit2} className="w-8 h-8 p-0" />
                    <Button variant="ghost" size="sm" onClick={() => { if (confirm('Delete this category?')) deleteCategory(cat.id) }} icon={Trash2} className="w-8 h-8 p-0 text-red-400 hover:text-red-600" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="p-5 bg-accounting-bg rounded-3xl border border-accounting-text/5 flex gap-4 -inner opacity-70">
        <AlertCircle size={20} className="text-accounting-text/30 shrink-0 mt-0.5" strokeWidth={2.5} />
        <p className="text-[11px] font-bold text-accounting-text/40 leading-relaxed tracking-tight italic uppercase">
          Warning: Deleting a category will not remove existing transactions but will hide the label from future select menus and filters.
        </p>
      </div>
    </div>
  );
}
