'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/src/context/ExpenseContext';
import { formatCurrency, cn } from '@/src/lib/utils';
import Modal from '@/src/components/ui/Modal';
import { StaffDetailPanel } from '@/src/components/Staff/StaffDetailPanel';
import { Plus, Edit2, Trash2, Users, Briefcase, ChevronRight, Target, Award, ShieldAlert, Zap, ShieldCheck } from 'lucide-react';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import Input from '@/src/components/ui/Input';
import { useAuth } from '@/src/context/AuthContext';

const ROLE_THEMES = {
  Founder: 'bg-indigo-600 text-white border-transparent',
  HR: 'bg-emerald-600 text-white border-transparent',
  Staff: 'bg-accounting-text text-white border-transparent',
  Freelancer: 'bg-amber-500 text-white border-transparent',
};

const BLANK_STAFF = { name: '', email: '', role: 'Staff', note: '', permissions: ['Dashboard', 'Work'] };
const ALL_MODULES = ['Dashboard', 'Work', 'Team', 'Finance', 'CRM', 'Attendance'];

export default function TeamPage() {
  const { isManagement } = useAuth();
  const { staff = [], entries = [], tasks = [], addStaff, updateStaff, deleteStaff, loading } = useApp();
  
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(BLANK_STAFF);
  const [saving, setSaving] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const staffProfiles = useMemo(() => {
    return staff.map(person => {
      const personId = String(person.id);
      const personEntries = entries.filter(t => String(t.personId) === personId);
      const personTasks = tasks.filter(t => String(t.assignedTo) === personId);
      
      const totalTasks = personTasks.length;
      const completed = personTasks.filter(t => t.status === 'Completed' || t.status === 'Approved').length;
      const rejected = personTasks.filter(t => t.status === 'Needs Revision').length;
      const delayed = personTasks.filter(t => t.status === 'Delayed').length;
      
      return {
        ...person,
        metrics: {
          completionRate: totalTasks ? Math.round((completed / totalTasks) * 100) : 0,
          delayRate: totalTasks ? Math.round((delayed / totalTasks) * 100) : 0,
          qualityScore: totalTasks ? Math.round(((completed - rejected) / totalTasks) * 100) : 0,
          totalTasks,
          salaryTotal: personEntries.filter(t => t.type === 'Salary').reduce((s, t) => s + parseFloat(t.amount || 0), 0)
        }
      };
    });
  }, [staff, entries, tasks]);

  const openAdd = () => { setEditId(null); setForm(BLANK_STAFF); setModal(true); };
  const openEdit = (p, e) => { 
    e.stopPropagation(); 
    setEditId(p.id); 
    setForm({ 
      name: p.name, 
      email: p.email || '', 
      role: p.role || 'Staff', 
      note: p.note || '',
      permissions: Array.isArray(p.permissions) ? p.permissions : ['Dashboard', 'Work']
    }); 
    setModal(true); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editId) await updateStaff(editId, form);
    else await addStaff(form);
    setSaving(false);
    setModal(false);
  };

  if (loading) return <div className="py-20 text-center font-black animate-pulse uppercase tracking-widest text-secondary-text/20">Loading Team...</div>;

  return (
    <div className="space-y-10 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-accounting-text">Staff</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-text/40 mt-3">Team Members</p>
        </div>
        {isManagement && (
          <Button onClick={openAdd} icon={Plus} className="h-14 px-8 shadow-2xl">Add Member</Button>
        )}
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {staffProfiles.map(person => (
          <StaffCard 
            key={person.id} 
            person={person} 
            isManagement={isManagement} 
            onEdit={(e) => openEdit(person, e)}
            onDelete={(e) => { e.stopPropagation(); if(confirm(`Remove ${person.name}?`)) deleteStaff(person.id); }}
            onClick={() => setSelectedPerson(person)}
          />
        ))}
      </div>

      {/* Detail Panel */}
      <StaffDetailPanel
        person={selectedPerson}
        entries={entries}
        tasks={tasks}
        onClose={() => setSelectedPerson(null)}
      />

      {/* Add/Edit Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? "Edit Member" : "Add Staff Member"}>
        <form onSubmit={handleSubmit} className="space-y-8 p-1">
          <Input label="Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <Input label="Email Address" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          
          <div className="space-y-3">
            <label className="field-label">System Role</label>
            <div className="grid grid-cols-2 gap-3">
              {['Founder', 'HR', 'Staff', 'Freelancer'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({...form, role: r})}
                  className={cn(
                    "h-14 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border -inner shadow-sm",
                    form.role === r ? "bg-accounting-text text-white border-transparent" : "bg-white text-secondary-text/40 border-accounting-text/5 hover:border-accounting-text/20"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="field-label">Administrative Notes</label>
            <textarea 
              className="clay-input w-full min-h-[80px] resize-none" 
              value={form.note} 
              onChange={e => setForm({...form, note: e.target.value})}
            />
          </div>

          {/* Module Access Control */}
          <div className="space-y-3 p-5 bg-accounting-bg/40 rounded-3xl -inner border border-white/50">
            <label className="field-label flex items-center justify-between">
              Module Access Control
              <span className="text-[8px] font-black text-secondary-text uppercase tracking-widest">Active Permissions</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {ALL_MODULES.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    const perms = form.permissions || [];
                    const newPerms = perms.includes(m) ? perms.filter(p => p !== m) : [...perms, m];
                    setForm({...form, permissions: newPerms});
                  }}
                  className={cn(
                    "flex items-center gap-2.5 p-3.5 rounded-2xl border-2 transition-all text-left",
                    form.permissions?.includes(m)
                      ? "bg-accounting-text border-accounting-text text-white shadow-lg"
                      : "bg-white border-accounting-text/10 text-secondary-text hover:border-accounting-text/30"
                  )}
                >
                   <div className={cn("w-5 h-5 rounded-lg flex items-center justify-center shrink-0 -inner", form.permissions?.includes(m) ? "bg-white/20" : "bg-accounting-bg")}>
                    {form.permissions?.includes(m) && <ShieldCheck size={12} strokeWidth={3} className="text-white" />}
                   </div>
                  <span className={cn("text-[9px] font-black uppercase tracking-widest leading-none", form.permissions?.includes(m) ? "text-white" : "text-accounting-text")}>{m}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button type="submit" isLoading={saving} fullWidth className="h-14">{editId ? 'Save Changes' : 'Add Staff'}</Button>
            <Button variant="secondary" onClick={() => setModal(false)} className="h-14 px-10">Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function StaffCard({ person, isManagement, onEdit, onDelete, onClick }) {
  const initials = person.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const roleColor = ROLE_THEMES[person.role] || ROLE_THEMES.Staff;

  return (
    <Card onClick={onClick} className="p-7 space-y-7 cursor-pointer hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-accounting-text/5 group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-5">
          <div className={cn("w-14 h-14 rounded-3xl flex items-center justify-center text-lg font-black -inner border border-white shadow-lg", roleColor)}>
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-accounting-text tracking-tight uppercase text-[15px] truncate group-hover:translate-x-1 transition-transform">{person.name}</h3>
            <p className="text-[10px] font-black text-secondary-text/40 uppercase tracking-widest mt-1.5">{person.role}</p>
          </div>
        </div>
        {isManagement && (
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" icon={Edit2} onClick={onEdit} className="w-9 h-9 p-0 bg-white border border-accounting-text/5" />
            <Button variant="ghost" icon={Trash2} onClick={onDelete} className="w-9 h-9 p-0 text-red-300 hover:text-red-500 bg-white border border-accounting-text/5" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
         <PerformanceRow label="Completion Rate" value={person.metrics.completionRate} color="emerald" icon={Award} />
         <div className="grid grid-cols-2 gap-3">
            <PerformanceBox label="Delayed Tasks" value={`${person.metrics.delayRate}%`} icon={ShieldAlert} color={person.metrics.delayRate > 20 ? 'rose' : 'accounting-text'} />
            <PerformanceBox label="Quality Score" value={`${person.metrics.qualityScore}%`} icon={Zap} color="indigo" />
         </div>
         <div className="flex items-center justify-between p-3.5 bg-accounting-bg/40 rounded-2xl border border-white -inner">
            <p className="text-[8px] font-black uppercase tracking-widest text-secondary-text/30 flex items-center gap-2"><Briefcase size={12}/> Net Payouts</p>
            <p className="text-[11px] font-black text-indigo-600">{formatCurrency(person.metrics.salaryTotal)}</p>
         </div>
      </div>

      <div className="flex items-center justify-between pt-5 border-t border-accounting-bg/50">
        <span className="text-[8px] font-black text-secondary-text/20 uppercase tracking-widest">{person.metrics.totalTasks} Tasks</span>
        <span className="flex items-center gap-1.5 text-[8px] font-black text-secondary-text/60 group-hover:text-accounting-text uppercase tracking-widest transition-colors">
          View Detail <ChevronRight size={10} strokeWidth={4} className="group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Card>
  );
}

function PerformanceRow({ label, value, color, icon: Icon }) {
  return (
    <div className="p-3.5 bg-accounting-bg/40 rounded-2xl border border-white -inner space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[8px] font-black uppercase tracking-widest text-secondary-text/30 flex items-center gap-2"><Icon size={12}/> {label}</p>
        <p className={cn("text-[10px] font-black", `text-${color}-600`)}>{value}%</p>
      </div>
      <div className="h-1.5 bg-accounting-bg/60 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-1000", `bg-${color}-500`)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function PerformanceBox({ label, value, icon: Icon, color }) {
  return (
    <div className="p-3.5 bg-accounting-bg/40 rounded-2xl border border-white -inner">
      <p className="text-[8px] font-black uppercase tracking-widest text-secondary-text/30 flex items-center gap-2 mb-2"><Icon size={12}/> {label}</p>
      <p className={cn("text-[13px] font-black tracking-tighter text-accounting-text", color && `text-${color}-600`)}>{value}</p>
    </div>
  );
}
