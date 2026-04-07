'use client';

import React, { useState } from 'react';
import { useApp } from '@/src/context/ExpenseContext';
import { formatCurrency, cn } from '@/src/lib/utils';
import Modal from '@/src/components/ui/Modal';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, CheckCircle, Clock, Briefcase, LayoutGrid, FileText } from 'lucide-react';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import Input from '@/src/components/ui/Input';

const BLANK = { name: '', clientName: '', description: '', status: 'Active' };

export default function ProjectsManagementPage() {
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
    <div className="flex items-center justify-center py-32">
       <div className="w-10 h-10 border-4 border-accounting-text/10 border-t-accounting-text rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-accounting-text tracking-tighter uppercase">Project Settings</h2>
          <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest mt-1">Manage project status and tracking</p>
        </div>
        <Button onClick={openAdd} icon={Plus}>Add Project</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map(project => {
          const stats = getProjectStats(project.id);
          const isActive = (project.status || 'Active') === 'Active';
          return (
            <Card key={project.id} className="group border border-transparent hover:border-accounting-text/5">
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-1">
                  <h3 className="font-black text-accounting-text text-base tracking-tight leading-none">{project.name}</h3>
                  <p className="text-[9px] font-black text-secondary-text uppercase tracking-widest">{project.clientName || 'Private Client'}</p>
                </div>
                <div className={cn('px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border -inner', isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-accounting-bg text-accounting-text/40 border-accounting-text/5')}>
                  {project.status || 'Active'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                 <div className="p-4 bg-emerald-50/50 rounded-2xl -inner border border-emerald-100/50">
                    <p className="text-[7px] font-black text-emerald-600/60 uppercase tracking-widest mb-1 flex items-center gap-1.5"><TrendingUp size={10} strokeWidth={3} /> Income</p>
                    <p className="text-sm font-black text-emerald-600 tracking-tighter">{formatCurrency(stats.income)}</p>
                 </div>
                 <div className="p-4 bg-red-50/50 rounded-2xl -inner border border-red-100/50">
                    <p className="text-[7px] font-black text-red-500/60 uppercase tracking-widest mb-1 flex items-center gap-1.5"><TrendingDown size={10} strokeWidth={3} /> Outflow</p>
                    <p className="text-sm font-black text-red-500 tracking-tighter">{formatCurrency(stats.expense)}</p>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-accounting-bg">
                <div className="flex gap-1.5">
                  <Button variant="ghost" size="sm" icon={Edit2} onClick={() => openEdit(project)} className="w-8 h-8 p-0" />
                  <Button variant="ghost" size="sm" icon={Trash2} onClick={() => { if (confirm(`Archive "${project.name}"?`)) deleteProject(project.id); }} className="w-8 h-8 p-0 text-red-400 hover:text-red-600" />
                </div>
                <p className={cn("text-[10px] font-black uppercase tracking-tighter", stats.profit >= 0 ? "text-accounting-text" : "text-red-500")}>
                  Balance: {formatCurrency(stats.profit)}
                </p>
              </div>
            </Card>
          );
        })}
        {projects.length === 0 && (
           <div className="col-span-full py-20 text-center opacity-30">
              <p className="text-[10px] font-black uppercase tracking-widest">No projects registered</p>
           </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={closeModal} title={editId ? 'Modify Project' : 'New Project'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Project Name" required placeholder="e.g. Website Overhaul" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Client Identification" placeholder="e.g. Google India" icon={Briefcase} value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} />
          
          <div className="space-y-2">
            <label className="field-label">Current Phase</label>
            <div className="flex gap-4">
              {['Active', 'Completed', 'On Hold'].map(s => (
                <Button
                  key={s}
                  type="button"
                  variant={form.status === s ? 'primary' : 'secondary'}
                  onClick={() => setForm(f => ({ ...f, status: s }))}
                  size="sm"
                  fullWidth
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="field-label">Scope & Description</label>
            <textarea
              className="clay-input w-full min-h-[100px] resize-none"
              placeholder="Project goals, milestones, etc..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" isLoading={saving} fullWidth>{editId ? 'Save Changes' : 'Initialize Project'}</Button>
            <Button variant="secondary" onClick={closeModal} className="px-10">Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
