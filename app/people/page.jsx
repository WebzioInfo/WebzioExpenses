'use client';

import React, { useState } from 'react';
import { useApp } from '@/src/context/ExpenseContext';
import { formatCurrency, cn } from '@/src/utils/helpers';
import Modal from '@/src/components/ui/Modal';
import { Plus, Edit2, Trash2, TrendingDown, Coins, Briefcase } from 'lucide-react';
import { STAFF_ROLES } from '@/src/utils/constants';

const BLANK = { name: '', role: 'Staff', note: '' };

export default function StaffPage() {
  const { people, entries, addPerson, updatePerson, deletePerson, loading } = useApp();
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setEditId(null); setForm(BLANK); setModal(true); };
  const openEdit = (p) => { setEditId(p.id); setForm({ name: p.name, role: p.role || 'Staff', note: p.note || '' }); setModal(true); };
  const closeModal = () => { setModal(false); setEditId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editId) await updatePerson(editId, form);
    else await addPerson(form);
    setSaving(false);
    closeModal();
  };

  const getStaffStats = (personId) => {
    const tx = entries.filter(t => t.personId === personId);
    const salary = tx.filter(t => t.type === 'Salary').reduce((s, t) => s + parseFloat(t.amount), 0);
    const investment = tx.filter(t => t.type === 'Added Money').reduce((s, t) => s + parseFloat(t.amount), 0);
    const expense = tx.filter(t => t.type === 'Money Out').reduce((s, t) => s + parseFloat(t.amount), 0);
    return { salary, investment, expense };
  };

  const roleColors = {
    'Founder': 'bg-purple-50 text-purple-700 border-purple-200',
    'Staff': 'bg-blue-50 text-blue-700 border-blue-200',
    'Freelancer': 'bg-amber-50 text-amber-700 border-amber-200',
  };

  if (loading) return <div className="py-20 flex justify-center"><div className="w-10 h-10 bg-[#2D151F]/10 rounded-2xl animate-pulse shadow-clay-inner" /></div>;

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-3xl font-black text-[#2D151F] tracking-tighter leading-none">Staff</h1>
          <p className="text-[9px] font-black text-[#2D151F]/30 uppercase tracking-[0.3em] mt-1">{people.length} members</p>
        </div>
        <button onClick={openAdd} className="h-11 px-7 bg-[#2D151F] text-[#F4F3DC] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#4A2B3A] transition-all shadow-clay-outer flex items-center gap-2">
          <Plus size={14} strokeWidth={2.5} /> Add Staff
        </button>
      </div>

      {/* Staff Grid */}
      {people.length === 0 ? (
        <div className="clay-card p-20 flex flex-col items-center text-center space-y-3">
          <p className="text-base font-black text-[#2D151F]/30 uppercase tracking-tighter">No staff yet</p>
          <p className="text-[9px] font-black text-[#2D151F]/20 uppercase tracking-widest">Add founders, staff and freelancers</p>
          <button onClick={openAdd} className="mt-3 h-10 px-6 bg-[#2D151F] text-[#F4F3DC] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#4A2B3A] transition-all shadow-clay-outer">
            Add Staff
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {people.map(person => {
            const stats = getStaffStats(person.id);
            return (
              <div key={person.id} className="clay-card p-7 space-y-6 group hover:scale-[1.01] transition-transform duration-300">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1 min-w-0">
                    <h3 className="font-black text-[#2D151F] text-lg tracking-tighter leading-tight">{person.name}</h3>
                    <span className={cn('inline-block px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border shadow-clay-inner', roleColors[person.role] || roleColors['Staff'])}>
                      {person.role}
                    </span>
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(person)} className="w-9 h-9 rounded-xl flex items-center justify-center text-[#2D151F]/30 hover:text-[#2D151F] hover:bg-[#F4F3DC] transition-all shadow-clay-inner">
                      <Edit2 size={14} strokeWidth={2.5} />
                    </button>
                    <button onClick={() => { if (confirm(`Remove ${person.name}?`)) deletePerson(person.id); }} className="w-9 h-9 rounded-xl flex items-center justify-center text-red-200 hover:text-red-600 hover:bg-red-50 transition-all shadow-clay-inner">
                      <Trash2 size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {[
                    { label: 'Total Salary', value: stats.salary, icon: Briefcase, color: 'text-amber-600' },
                    { label: 'Total Added Money', value: stats.investment, icon: Coins, color: 'text-emerald-600' },
                    { label: 'Total Expenses', value: stats.expense, icon: TrendingDown, color: 'text-red-500' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between p-3 bg-[#F4F3DC]/40 rounded-xl shadow-clay-inner border border-white/50">
                      <div className="flex items-center gap-2 text-[8px] font-black text-[#2D151F]/30 uppercase tracking-widest">
                        <s.icon size={10} strokeWidth={2.5} /> {s.label}
                      </div>
                      <p className={cn('font-black text-base', s.color)}>{formatCurrency(s.value)}</p>
                    </div>
                  ))}
                </div>

                {person.note && (
                  <p className="text-[11px] text-[#2D151F]/30 italic border-l-2 border-[#2D151F]/10 pl-3 leading-relaxed">{person.note}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modal} onClose={closeModal} title={editId ? 'Edit Staff' : 'Add Staff'} subtitle="Staff member details">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="field-label">Full Name <span className="text-red-400">*</span></label>
            <input required className="clay-input w-full" placeholder="e.g. Ahmed Ali" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="field-label">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(STAFF_ROLES).map(r => (
                <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))}
                  className={cn('py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border-2 transition-all', form.role === r ? 'bg-[#2D151F] border-[#2D151F] text-[#F4F3DC] shadow-clay-inner' : 'border-transparent bg-[#F4F3DC]/60 text-[#2D151F]/40 hover:bg-white')}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="field-label">Notes</label>
            <input className="clay-input w-full" placeholder="Optional notes..." value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 h-12 bg-[#2D151F] text-[#F4F3DC] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#4A2B3A] transition-all shadow-clay-outer disabled:opacity-50">
              {saving ? 'Saving...' : editId ? 'Update Staff' : 'Add Staff'}
            </button>
            <button type="button" onClick={closeModal} className="h-12 px-6 clay-btn text-[#2D151F]/40 text-[9px] font-black uppercase tracking-widest">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
