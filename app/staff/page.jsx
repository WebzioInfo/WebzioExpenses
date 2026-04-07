'use client';

import React, { useState } from 'react';
import { useApp } from '@/src/context/ExpenseContext';
import { formatCurrency, cn } from '@/src/lib/utils';
import Modal from '@/src/components/ui/Modal';
import { StaffDetailPanel } from '@/src/components/Staff/StaffDetailPanel';
import { Plus, Edit2, Trash2, TrendingDown, Coins, Briefcase, ChevronRight, Users } from 'lucide-react';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import Input from '@/src/components/ui/Input';
import { STAFF_ROLES } from '@/src/lib/constants';
import { CardSkeleton } from '@/src/components/ui/Skeleton';

const BLANK = { name: '', email: '', role: 'Staff', note: '' };

const ROLE_STYLES = {
  Admin: 'bg-purple-50 text-purple-700 border-purple-200',
  Staff: 'bg-blue-50 text-blue-700 border-blue-200',
  Freelancer: 'bg-amber-50 text-amber-700 border-amber-200',
};

const ROLE_AVATAR = {
  Admin: 'bg-purple-600',
  Staff: 'bg-blue-600',
  Freelancer: 'bg-amber-600',
};

export default function StaffPage() {
  const { user, isAdmin, isManagement } = useAuth();
  const { staff = [], entries = [], tasks = [], addStaff, updateStaff, deleteStaff, loading } = useApp();
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const openAdd = () => { setEditId(null); setForm(BLANK); setModal(true); };
  const openEdit = (p, e) => { e.stopPropagation(); setEditId(p.id); setForm({ name: p.name, email: p.email || '', role: p.role || 'Staff', note: p.note || '' }); setModal(true); };
  const closeModal = () => { setModal(false); setEditId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editId) await updateStaff(editId, form);
    else await addStaff(form);
    setSaving(false);
    closeModal();
  };

  const getStaffStats = (personId) => {
    const tx = entries.filter(t => String(t.personId) === String(personId));
    const salary = tx.filter(t => t.type === 'Salary').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const expense = tx.filter(t => t.type === 'Money Out').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const added = tx.filter(t => t.type === 'Added Money').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    return { salary, expense, added, count: tx.length };
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
          <h1 className="text-4xl font-black text-accounting-text tracking-tighter leading-none">Personnel Registry</h1>
          <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest mt-2">{staff?.length || 0} registered systemic entities</p>
        </div>
        {isManagement && <Button onClick={openAdd} icon={Plus}>Add Stakeholder</Button>}
      </div>

      {/* Staff Grid */}
      {!staff || staff.length === 0 ? (
        <Card className="p-20 flex flex-col items-center text-center space-y-4 border-2 border-dashed border-accounting-text/5">
          <div className="w-20 h-20 rounded-3xl bg-accounting-bg flex items-center justify-center -inner border border-white">
            <Users size={32} strokeWidth={1.5} className="text-secondary-text/30" />
          </div>
          <p className="text-lg font-black text-accounting-text uppercase tracking-tighter leading-none">The registry is currently empty</p>
          <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest max-w-[240px]">Initialize the system by adding founders, operational staff, and freelancers.</p>
          {isManagement && <Button onClick={openAdd} icon={Plus} className="mt-4 px-10">Add First Staff</Button>}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {staff.map(person => {
            const stats = getStaffStats(person.id);
            const role = person.role || 'Staff';
            const initials = person.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';

            return (
              <Card
                key={person.id}
                onClick={() => setSelectedPerson(person)}
                className="p-6 space-y-6 group cursor-pointer hover:border-accounting-text/10 hover:shadow-2xl transition-all duration-300"
              >
                {/* Top Row: Avatar + Name + Actions */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Avatar circle */}
                    <div className={cn(
                      'w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-lg shadow-accounting-text/5',
                      '-inner border border-white/20',
                      ROLE_AVATAR[role] || ROLE_AVATAR.Staff
                    )}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-accounting-text text-base tracking-tight leading-none truncate group-hover:translate-x-0.5 transition-transform">{person.name}</h3>
                      <span className={cn('inline-block mt-2.5 px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest border -inner', ROLE_STYLES[role] || ROLE_STYLES.Staff)}>
                        {role}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons (visible on hover) */}
                  {isManagement && (
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all shrink-0 -translate-y-1 group-hover:translate-y-0">
                      <Button variant="ghost" size="sm" icon={Edit2} iconSize={12} onClick={(e) => openEdit(person, e)} className="w-8 h-8 p-0 text-secondary-text hover:text-accounting-text bg-white shadow-sm border border-accounting-text/5" />
                      <Button variant="ghost" size="sm" icon={Trash2} iconSize={12} onClick={(e) => { e.stopPropagation(); if (confirm(`Remove ${person.name}?`)) deleteStaff(person.id); }} className="w-8 h-8 p-0 text-red-400 hover:text-red-600 bg-white shadow-sm border border-accounting-text/5" />
                    </div>
                  )}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: 'Settled Payouts', value: stats.salary, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'System Inflow', value: stats.added, icon: Coins, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Personal Expenses', value: stats.expense, icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between p-3 bg-accounting-bg/40 rounded-2xl -inner border border-white">
                      <div className="flex items-center gap-2 text-[8px] font-black text-secondary-text uppercase tracking-widest opacity-60">
                        <s.icon size={10} strokeWidth={3} /> {s.label}
                      </div>
                      <p className={cn('font-black text-xs tracking-tight', s.color)}>{formatCurrency(s.value)}</p>
                    </div>
                  ))}
                </div>

                {person.note && (
                  <p className="text-[10px] text-secondary-text/60 italic border-l-2 border-accounting-text/10 pl-3 leading-relaxed line-clamp-2">
                    {person.note}
                  </p>
                )}

                {/* View Details CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-accounting-text/5">
                  <div className="flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-accounting-text/10" />
                     <span className="text-[8px] font-black text-secondary-text/40 uppercase tracking-widest">
                        {stats.count} Recorded Events
                     </span>
                  </div>
                  <span className="flex items-center gap-1.5 text-[8px] font-black text-secondary-text group-hover:text-accounting-text uppercase tracking-widest transition-all">
                    Access Ledger <ChevronRight size={10} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── ADD / EDIT MODAL ─── */}
      <Modal isOpen={modal} onClose={closeModal} title={editId ? 'Modify Stakeholder' : 'Provision Personnel'} subtitle="Systematic identification registry">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Stakeholder Identity Name"
            required
            placeholder="e.g. Ahmed Ali"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Dispatch Email Alignment"
            type="email"
            placeholder="e.g. ahmed@webzio.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
          <div className="space-y-4">
            <label className="text-[10px] font-black text-secondary-text uppercase tracking-widest px-1">Functional Protocol Role</label>
            <div className="grid grid-cols-3 gap-3">
              {['Admin', 'HR', 'Staff', 'Freelancer'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: r }))}
                  className={cn(
                    "h-12 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border -inner",
                    form.role === r 
                      ? "bg-accounting-text text-white border-transparent shadow-lg shadow-accounting-text/10" 
                      : "bg-accounting-bg/40 text-secondary-text/40 border-white hover:border-accounting-text/10"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Procedural Notes"
            placeholder="Optional context for this entity..."
            value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
          />
          <div className="flex gap-4 pt-4 border-t border-accounting-bg">
            <Button type="submit" isLoading={saving} fullWidth className="h-14">
              {editId ? 'Authorize Update' : 'Initialize Stakeholder'}
            </Button>
            <Button variant="secondary" type="button" onClick={closeModal} className="h-14 px-10">Abort</Button>
          </div>
        </form>
      </Modal>

      {/* ─── STAFF DETAIL PANEL ─── */}
      <StaffDetailPanel
        person={selectedPerson}
        entries={entries}
        tasks={tasks}
        onClose={() => setSelectedPerson(null)}
      />
    </div>
  );
}
