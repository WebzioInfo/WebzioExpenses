'use client';

import React, { useState } from 'react';
import { useApp } from '@/src/context/ExpenseContext';
import { formatCurrency, cn } from '@/src/lib/utils';
import Modal from '@/src/components/ui/Modal';
import { StaffDetailPanel } from '@/src/components/Staff/StaffDetailPanel';
import { Plus, Edit2, Trash2, TrendingDown, Coins, Briefcase, ChevronRight, Users, Mail, FileText, UserPlus } from 'lucide-react';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import Input from '@/src/components/ui/Input';
import { STAFF_ROLES } from '@/src/lib/constants';

const BLANK = { name: '', email: '', role: 'Staff', note: '' };

const ROLE_STYLES = {
  Admin: 'bg-purple-50 text-purple-700 border-purple-200',
  Staff: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Freelancer: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function StaffManagementPage() {
  const { staff = [], entries = [], tasks = [], addStaff, updateStaff, deleteStaff, loading } = useApp();
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const openAdd = () => { setEditId(null); setForm(BLANK); setModal(true); };
  const openEdit = (p, e) => { 
    e.stopPropagation(); 
    setEditId(p.id); 
    setForm({ name: p.name, email: p.email || '', role: p.role || 'Staff', note: p.note || '' }); 
    setModal(true); 
  };
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
    <div className="flex items-center justify-center py-32">
       <div className="w-10 h-10 border-4 border-accounting-text/10 border-t-accounting-text rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-accounting-text tracking-tighter uppercase">Staff Management</h2>
          <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest mt-1">Manage your team and roles</p>
        </div>
        <Button onClick={openAdd} icon={UserPlus}>Add Member</Button>
      </div>

      {staff.length === 0 ? (
        <div className="py-20 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-accounting-bg flex items-center justify-center -inner border border-white/50">
            <Users size={28} className="text-accounting-text/20" />
          </div>
          <div className="space-y-1">
            <p className="font-black text-accounting-text uppercase tracking-tighter">No staff members found</p>
            <p className="text-[10px] font-bold text-secondary-text uppercase tracking-widest">Start by adding your first team member</p>
          </div>
          <Button variant="secondary" onClick={openAdd} size="sm">Add Staff Member</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {staff.map(person => {
            const stats = getStaffStats(person.id);
            const role = person.role || 'Staff';
            const initials = person.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';

            return (
              <Card
                key={person.id}
                onClick={() => setSelectedPerson(person)}
                className="group border border-transparent hover:border-accounting-text/10"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-accounting-text text-white flex items-center justify-center text-lg font-black shadow-lg">
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-black text-accounting-text text-sm tracking-tight leading-none">{person.name}</h3>
                      <span className={cn('inline-block mt-2 px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border', ROLE_STYLES[role] || ROLE_STYLES.Staff)}>
                        {role}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" icon={Edit2} onClick={(e) => openEdit(person, e)} className="w-8 h-8 p-0" />
                    <Button variant="ghost" size="sm" icon={Trash2} onClick={(e) => { e.stopPropagation(); if (confirm(`Remove ${person.name}?`)) deleteStaff(person.id); }} className="w-8 h-8 p-0 text-red-500" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: 'Salary', value: stats.salary, color: 'text-accounting-text' },
                    { label: 'Expenses', value: stats.expense, color: 'text-red-500' },
                    { label: 'Stats', value: stats.count, color: 'text-secondary-text', isRaw: true },
                  ].map(s => (
                    <div key={s.label} className="p-3 bg-accounting-bg/40 rounded-2xl -inner text-center">
                      <p className="text-[7px] font-black text-secondary-text uppercase tracking-widest mb-1">{s.label}</p>
                      <p className={cn('font-black text-xs tracking-tighter', s.color)}>
                        {s.isRaw ? s.value : formatCurrency(s.value)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-accounting-bg">
                  <p className="text-[9px] font-black text-secondary-text uppercase tracking-widest">
                    {person.email || 'No email provided'}
                  </p>
                  <ChevronRight size={14} className="text-accounting-text/20 group-hover:text-accounting-text transition-colors" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Panel */}
      <StaffDetailPanel
        person={selectedPerson}
        entries={entries}
        tasks={tasks}
        onClose={() => setSelectedPerson(null)}
      />

      {/* Add/Edit Modal */}
      <Modal isOpen={modal} onClose={closeModal} title={editId ? 'Edit Staff Member' : 'Add Staff Member'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Full Name" required placeholder="e.g. Ahmed Ali" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Email Address" type="email" placeholder="e.g. ahmed@webzio.com" icon={Mail} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          
          <div className="space-y-2">
            <label className="field-label">Role Definition</label>
            <div className="grid grid-cols-3 gap-3">
              {Object.values(STAFF_ROLES).map(r => (
                <Button
                  key={r}
                  type="button"
                  variant={form.role === r ? 'primary' : 'secondary'}
                  onClick={() => setForm(f => ({ ...f, role: r }))}
                  size="sm"
                  fullWidth
                >
                  {r}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="field-label">Administrative Notes</label>
            <textarea
              className="clay-input w-full min-h-[100px] bg-white resize-none"
              placeholder="Private notes about this staff member..."
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" isLoading={saving} fullWidth>{editId ? 'Update Member' : 'Register Staff'}</Button>
            <Button variant="secondary" onClick={closeModal} className="px-10">Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
