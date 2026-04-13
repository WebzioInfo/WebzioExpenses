'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/src/context/ExpenseContext';
import { formatCurrency, cn } from '@/src/lib/utils';
import Modal from '@/src/components/ui/Modal';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, CheckCircle, Clock } from 'lucide-react';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import Input from '@/src/components/ui/Input';
import { CardSkeleton } from '@/src/components/ui/Skeleton';

const BLANK = { name: '', clientName: '', description: '', status: 'Active' };

export default function ProjectsPage() {
  const { projects = [], entries = [], addProject, updateProject, deleteProject, loading } = useApp();
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setEditId(null); setForm(BLANK); setModal(true); };
  const openEdit = (p) => { setEditId(p.id); setForm({ name: p.name, clientName: p.clientName || '', description: p.description || '', status: p.status || 'Active' }); setModal(true); };
  const closeModal = () => { setModal(false); setEditId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editId) await updateProject(editId, form);
    else await addProject(form);
    setSaving(false);
    closeModal();
  };

  const getProjectStats = (projectId) => {
    const tx = entries.filter(t => t.projectId === projectId);
    const income = tx.filter(t => t.type === 'Money In').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const expense = tx.filter(t => t.type === 'Money Out' || t.type === 'Salary').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    return { income, expense, profit: income - expense, count: tx.length };
  };

  if (loading) return (
    <div className="space-y-8 py-6">
      <div className="flex items-center justify-between px-1">
        <div className="space-y-2"><div className="w-48 h-8 bg-accounting-text/10 rounded-xl animate-pulse" /><div className="w-24 h-3 bg-accounting-text/10 rounded-lg animate-pulse" /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-4xl font-black text-accounting-text tracking-tighter leading-none">Projects</h1>
          <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest mt-2">{projects.length} Total Projects</p>
        </div>
        <Button onClick={openAdd} icon={Plus}>Add Project</Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card className="p-20 flex flex-col items-center text-center space-y-4 border-2 border-dashed border-accounting-text/5">
          <p className="text-lg font-black text-accounting-text uppercase tracking-tighter leading-none">No projects found</p>
          <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest max-w-[240px]">Add your first project to track income and expenses.</p>
          <Button onClick={openAdd} icon={Plus} className="mt-4 px-10">Add Project</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map(project => {
            const stats = getProjectStats(project.id);
            const isActive = (project.status || 'Active') === 'Active';
            return (
              <Card key={project.id} className="p-7 space-y-7 group hover:scale-[1.01] hover:border-accounting-text/10 transition-all duration-300">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1 min-w-0">
                    <h3 className="font-black text-accounting-text text-lg tracking-tight leading-none truncate group-hover:translate-x-0.5 transition-transform">{project.name}</h3>
                    {project.clientName && (
                      <p className="text-[9px] font-black text-secondary-text/60 uppercase tracking-widest leading-none">{project.clientName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border -inner', isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-accounting-bg text-accounting-text/30 border-transparent')}>
                      {isActive ? <CheckCircle size={10} strokeWidth={3} /> : <Clock size={10} strokeWidth={3} />}
                      {project.status || 'Active'}
                    </div>
                  </div>
                </div>

                {/* Stats Spotlight */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50 rounded-2xl -inner border border-white space-y-2">
                    <div className="flex items-center gap-1.5 text-[8px] font-black text-emerald-600/80 uppercase tracking-widest">
                      <TrendingUp size={10} strokeWidth={3} /> Income
                    </div>
                    <p className="text-lg font-black text-emerald-600 tracking-tight">{formatCurrency(stats.income)}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-2xl -inner border border-white space-y-2">
                    <div className="flex items-center gap-1.5 text-[8px] font-black text-red-500/80 uppercase tracking-widest">
                      <TrendingDown size={10} strokeWidth={3} /> Expenses
                    </div>
                    <p className="text-lg font-black text-red-500 tracking-tight">{formatCurrency(stats.expense)}</p>
                  </div>
                </div>

                {/* Economic Summary */}
                <div className="flex items-center justify-between pt-5 border-t border-accounting-text/5">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-secondary-text/40 uppercase tracking-widest leading-none">Net Profit Margin</p>
                    <p className={cn('text-2xl font-black tracking-tighter leading-none', stats.profit >= 0 ? 'text-accounting-text' : 'text-red-600')}>
                      {formatCurrency(stats.profit)}
                    </p>
                  </div>
                  <div className="flex gap-2 p-1 bg-accounting-bg/40 rounded-2xl -inner border border-white opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                    <Button variant="ghost" size="sm" icon={Edit2} iconSize={12} onClick={() => openEdit(project)} className="w-9 h-9 p-0 text-secondary-text hover:text-accounting-text" />
                    <Button variant="ghost" size="sm" icon={Trash2} iconSize={12} onClick={() => { if (confirm(`Delete project "${project.name}"?`)) deleteProject(project.id); }} className="w-9 h-9 p-0 text-red-400 hover:text-red-600" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── ADD / EDIT MODAL ─── */}
      <Modal isOpen={modal} onClose={closeModal} title={editId ? 'Edit Project' : 'Add Project'} subtitle="Project identity and details">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Project Name" 
            required 
            placeholder="e.g. Website Development" 
            value={form.name} 
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
          />
          <Input 
            label="Client Name" 
            placeholder="e.g. Acme Corp" 
            value={form.clientName} 
            onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} 
          />
          
          <div className="space-y-4">
            <label className="text-[10px] font-black text-secondary-text uppercase tracking-widest px-1">Project Status</label>
            <div className="flex p-1.5 bg-accounting-bg/40 rounded-2xl border border-white -inner">
              {['Active', 'Completed'].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, status: s }))}
                  className={cn(
                    "flex-1 py-3 h-12 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                    form.status === s 
                      ? "bg-white text-accounting-text shadow-lg shadow-accounting-text/5" 
                      : "text-secondary-text/30 hover:text-accounting-text"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-secondary-text uppercase tracking-widest px-1">Notes</label>
            <textarea 
              className="clay-input w-full min-h-[120px] resize-none text-[13px] leading-relaxed" 
              placeholder="Strategic notes regarding project objectives..." 
              value={form.description} 
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-accounting-bg">
            <Button type="submit" isLoading={saving} fullWidth className="h-14">
              {editId ? 'Save Changes' : 'Create Project'}
            </Button>
            <Button variant="secondary" type="button" onClick={closeModal} className="h-14 px-10">Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
