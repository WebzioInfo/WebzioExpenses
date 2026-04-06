'use client';

import React, { useState } from 'react';
import { useApp } from '@/src/context/ExpenseContext';
import { formatCurrency, cn } from '@/src/lib/utils';
import Modal from '@/src/components/ui/Modal';
import { StaffDetailPanel } from '@/src/components/Staff/StaffDetailPanel';
import { Plus, Edit2, Trash2, TrendingDown, Coins, Briefcase, ChevronRight, Users } from 'lucide-react';
import Button from '@/src/components/ui/Button';
import { STAFF_ROLES } from '@/src/lib/constants';

const BLANK = { name: '', email: '', role: 'Staff', note: '' };

const ROLE_STYLES = {
  Admin:      'bg-purple-50 text-purple-700 border-purple-200',
  Staff:      'bg-blue-50 text-blue-700 border-blue-200',
  Freelancer: 'bg-amber-50 text-amber-700 border-amber-200',
};

const ROLE_AVATAR = {
  Admin:    'from-purple-400 to-purple-600',
  Staff:      'from-blue-400 to-blue-600',
  Freelancer: 'from-amber-400 to-amber-600',
};

import { CardSkeleton } from '@/src/components/ui/Skeleton';

export default function StaffPage() {
  const { staff, entries, tasks, addStaff, updateStaff, deleteStaff, loading } = useApp();
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
        <div className="space-y-2"><div className="w-48 h-8 bg-[#2D151F]/10 rounded-xl animate-pulse" /><div className="w-24 h-3 bg-[#2D151F]/10 rounded-lg animate-pulse" /></div>
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
          <h1 className="text-3xl font-black text-[#2D151F] tracking-tighter leading-none">Staff</h1>
          <p className="text-[9px] font-black text-accounting-text/60 uppercase tracking-[0.3em] mt-1">{staff?.length || 0} members</p>
        </div>
        <Button onClick={openAdd} icon={Plus}>Add Staff</Button>
      </div>

      {/* Staff Grid */}
      {!staff || staff.length === 0 ? (
        <div className="clay-card p-20 flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-accounting-bg flex items-center justify-center shadow-clay-inner mb-2">
            <Users size={24} strokeWidth={1.5} className="text-accounting-text/50" />
          </div>
          <p className="text-base font-black text-accounting-text/60 uppercase tracking-tighter">No staff yet</p>
          <p className="text-[9px] font-black text-accounting-text/50 uppercase tracking-widest">Add founders, staff and freelancers</p>
          <Button onClick={openAdd} icon={Plus} className="mt-3">Add Staff</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {staff.map(person => {
            const stats = getStaffStats(person.id);
            const role = person.role || 'Staff';
            const initials = person.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';

            return (
              <div
                key={person.id}
                onClick={() => setSelectedPerson(person)}
                className="clay-card p-6 space-y-5 group cursor-pointer hover:scale-[1.02] transition-all duration-300"
              >
                {/* Top Row: Avatar + Name + Actions */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Avatar circle */}
                    <div className={cn(
                      'w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black',
                      'bg-linear-to-br shadow-clay-inner',
                      ROLE_AVATAR[role] || ROLE_AVATAR.Staff
                    )}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-[#2D151F] text-base tracking-tight leading-tight truncate">{person.name}</h3>
                      <span className={cn('inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border shadow-clay-inner', ROLE_STYLES[role] || ROLE_STYLES.Staff)}>
                        {role}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons (visible on hover) */}
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                    <Button variant="ghost" size="sm" icon={Edit2} iconSize={13} onClick={(e) => openEdit(person, e)} className="w-8 h-8 p-0 text-accounting-text/60 hover:text-[#2D151F] hover:bg-accounting-bg" />
                    <Button variant="ghost" size="sm" icon={Trash2} iconSize={13} onClick={(e) => { e.stopPropagation(); if (confirm(`Remove ${person.name}?`)) deleteStaff(person.id); }} className="w-8 h-8 p-0 text-red-200 hover:text-red-600 hover:bg-red-50" />
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: 'Salary', value: stats.salary, icon: Briefcase, color: 'text-amber-600' },
                    { label: 'Added Money', value: stats.added, icon: Coins, color: 'text-emerald-600' },
                    { label: 'Expenses', value: stats.expense, icon: TrendingDown, color: 'text-red-500' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between px-3 py-2.5 bg-accounting-bg rounded-xl shadow-clay-inner border border-white/50">
                      <div className="flex items-center gap-2 text-[8px] font-black text-accounting-text/60 uppercase tracking-widest">
                        <s.icon size={10} strokeWidth={2.5} /> {s.label}
                      </div>
                      <p className={cn('font-black text-sm', s.color)}>{formatCurrency(s.value)}</p>
                    </div>
                  ))}
                </div>

                {person.note && (
                  <p className="text-[11px] text-accounting-text/60 italic border-l-2 border-[#2D151F]/10 pl-3 leading-relaxed line-clamp-2">
                    {person.note}
                  </p>
                )}

                {/* View Details CTA */}
                <div className="flex items-center justify-between pt-1 border-t border-[#2D151F]/5">
                  <span className="text-[8px] font-black text-accounting-text/50 uppercase tracking-widest">
                    {stats.count} {stats.count === 1 ? 'entry' : 'entries'}
                  </span>
                  <span className="flex items-center gap-1 text-[8px] font-black text-accounting-text/60 group-hover:text-[#2D151F] uppercase tracking-widest transition-colors">
                    View Details <ChevronRight size={10} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── ADD / EDIT MODAL ─── */}
      <Modal isOpen={modal} onClose={closeModal} title={editId ? 'Edit Staff' : 'Add Staff'} subtitle="Staff member details">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="field-label">Full Name <span className="text-red-400">*</span></label>
            <input
              required
              className="clay-input w-full"
              placeholder="e.g. Ahmed Ali"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="field-label">Email Address</label>
            <input
              type="email"
              className="clay-input w-full"
              placeholder="e.g. ahmed@webzio.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="field-label">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(STAFF_ROLES).map(r => (
                <Button
                  key={r}
                  type="button"
                  variant={form.role === r ? 'primary' : 'outline'}
                  onClick={() => setForm(f => ({ ...f, role: r }))}
                  className="py-3"
                >
                  {r}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="field-label">Notes</label>
            <input
              className="clay-input w-full"
              placeholder="Optional notes..."
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={saving} className="flex-1 h-12">
              {editId ? 'Update Staff' : 'Add Staff'}
            </Button>
            <Button variant="outline" type="button" onClick={closeModal} className="h-12 px-6 text-[#2D151F]/60">Cancel</Button>
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
