'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/src/context/ExpenseContext';
import { formatCurrency, cn } from '@/src/lib/utils';
import Modal from '@/src/components/ui/Modal';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, CheckCircle, Clock } from 'lucide-react';
import Button from '@/src/components/ui/Button';

const BLANK = { name: '', clientName: '', description: '', status: 'Active' };

import { CardSkeleton } from '@/src/components/ui/Skeleton';

export default function ProjectsPage() {
  const { projects, entries, addProject, updateProject, deleteProject, loading } = useApp();
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
    const income = tx.filter(t => t.type === 'Money In').reduce((s, t) => s + parseFloat(t.amount), 0);
    const expense = tx.filter(t => t.type === 'Money Out' || t.type === 'Salary').reduce((s, t) => s + parseFloat(t.amount), 0);
    return { income, expense, profit: income - expense, count: tx.length };
  };

  if (loading) return (
    <div className="space-y-8 py-6">
      <div className="flex items-center justify-between px-1">
        <div className="space-y-2"><div className="w-48 h-8 bg-[#2D151F]/10 rounded-xl animate-pulse" /><div className="w-24 h-3 bg-[#2D151F]/10 rounded-lg animate-pulse" /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
      </div>
    </div>
  );

  return (
    <>
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-3xl font-black text-[#2D151F] tracking-tighter leading-none">Projects</h1>
          <p className="text-[9px] font-black text-accounting-text/60 uppercase tracking-[0.3em] mt-1">{projects.length} active projects</p>
        </div>
        <Button onClick={openAdd} icon={Plus}>Add Project</Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="clay-card p-20 flex flex-col items-center text-center space-y-3">
          <p className="text-base font-black text-accounting-text/60 uppercase tracking-tighter">No projects yet</p>
          <p className="text-[9px] font-black text-accounting-text/50 uppercase tracking-widest">Add your first project to start tracking</p>
          <Button onClick={openAdd} icon={Plus} className="mt-3">Add Project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map(project => {
            const stats = getProjectStats(project.id);
            const isActive = (project.status || 'Active') === 'Active';
            return (
              <div key={project.id} className="clay-card p-7 space-y-6 group hover:scale-[1.01] transition-transform duration-300">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <h3 className="font-black text-[#2D151F] text-lg tracking-tighter leading-tight truncate">{project.name}</h3>
                    {project.clientName && (
                      <p className="text-[9px] font-black text-accounting-text/60 uppercase tracking-widest">{project.clientName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <div className={cn('flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-wide border shadow-clay-inner', isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-[#F4F3DC] text-[#2D151F]/40 border-[#2D151F]/10')}>
                      {isActive ? <CheckCircle size={10} strokeWidth={2.5} /> : <Clock size={10} strokeWidth={2.5} />}
                      {project.status || 'Active'}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-emerald-50/50 rounded-2xl shadow-clay-inner border border-emerald-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-[8px] font-black text-emerald-600/60 uppercase tracking-widest">
                      <TrendingUp size={10} strokeWidth={2.5} /> Money In
                    </div>
                    <p className="text-lg font-black text-emerald-600">{formatCurrency(stats.income)}</p>
                  </div>
                  <div className="p-4 bg-red-50/50 rounded-2xl shadow-clay-inner border border-red-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-[8px] font-black text-red-500/60 uppercase tracking-widest">
                      <TrendingDown size={10} strokeWidth={2.5} /> Money Out
                    </div>
                    <p className="text-lg font-black text-red-500">{formatCurrency(stats.expense)}</p>
                  </div>
                </div>

                {/* Profit */}
                <div className="flex items-center justify-between pt-2 border-t border-[#2D151F]/5">
                  <div>
                    <p className="text-[8px] font-black text-accounting-text/60 uppercase tracking-widest">Profit</p>
                    <p className={cn('text-2xl font-black tracking-tighter', stats.profit >= 0 ? 'text-[#2D151F]' : 'text-red-600')}>
                      {formatCurrency(stats.profit)}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" icon={Edit2} iconSize={14} onClick={() => openEdit(project)} className="w-9 h-9 p-0 text-accounting-text/60 hover:text-[#2D151F] hover:bg-[#F4F3DC]" />
                    <Button variant="ghost" size="sm" icon={Trash2} iconSize={14} onClick={() => { if (confirm(`Archive "${project.name}"?`)) deleteProject(project.id); }} className="w-9 h-9 p-0 text-red-200 hover:text-red-600 hover:bg-red-50" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
      {/* Modal */}
      <Modal isOpen={modal} onClose={closeModal} title={editId ? 'Edit Project' : 'Add Project'} subtitle="Project details">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="field-label">Project Name <span className="text-red-400">*</span></label>
            <input required className="clay-input w-full" placeholder="e.g. Website Redesign" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="field-label">Client Name</label>
            <input className="clay-input w-full" placeholder="e.g. Acme Corp" value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="field-label">Status</label>
            <div className="flex gap-2">
              {['Active', 'Completed'].map(s => (
                <Button
                  key={s}
                  type="button"
                  variant={form.status === s ? 'primary' : 'outline'}
                  onClick={() => setForm(f => ({ ...f, status: s }))}
                  className={cn('flex-1 py-3', form.status === s && s !== 'Active' && 'bg-[#F4F3DC] text-[#2D151F]')}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="field-label">Notes</label>
            <textarea className="clay-input w-full resize-none text-sm" rows={3} placeholder="Optional notes..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={saving} className="flex-1 h-12">
              {editId ? 'Update Project' : 'Add Project'}
            </Button>
            <Button variant="outline" type="button" onClick={closeModal} className="h-12 px-6 text-[#2D151F]">Cancel</Button>
          </div>
        </form>
      </Modal>
</>
  );
}
