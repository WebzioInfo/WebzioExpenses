'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'next/navigation';
import Modal from '@/src/components/ui/Modal';
import { Plus, Edit2, ShieldCheck, User, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from '@/src/utils/helpers';

const BLANK = { name: '', email: '', password: '', role: 'staff' };

export default function UsersPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Redirect non-admins
  useEffect(() => {
    if (!isAdmin) router.replace('/');
  }, [isAdmin]);

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const openAdd = () => { setEditId(null); setForm(BLANK); setError(''); setModal(true); };
  const openEdit = (u) => { setEditId(u.id); setForm({ name: u.name, email: u.email, password: '', role: u.role }); setError(''); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) { setError('Please fill all required fields.'); return; }
    if (!editId && !form.password) { setError('Password is required for new users.'); return; }
    setSaving(true);
    setError('');

    const res = await fetch('/api/users', {
      method: editId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editId ? { id: editId, ...form } : form),
    });

    if (res.ok) {
      await fetchUsers();
      setModal(false);
    } else {
      const err = await res.json();
      setError(err.error || 'Something went wrong.');
    }
    setSaving(false);
  };

  const toggleActive = async (user) => {
    await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...user, isActive: !user.isActive }),
    });
    await fetchUsers();
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-3xl font-black text-[#2D151F] tracking-tighter leading-none">Users</h1>
          <p className="text-[9px] font-black text-[#2D151F]/30 uppercase tracking-[0.3em] mt-1">Manage system access</p>
        </div>
        <button onClick={openAdd} className="h-11 px-6 bg-[#2D151F] text-[#F4F3DC] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#4A2B3A] transition-all shadow-clay-outer flex items-center gap-2">
          <Plus size={14} strokeWidth={2.5} /> Add User
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><div className="w-10 h-10 bg-[#2D151F]/10 rounded-2xl animate-pulse shadow-clay-inner" /></div>
      ) : (
        <div className="clay-card overflow-hidden">
          {users.map((user, i) => (
            <div key={user.id} className={cn('flex items-center justify-between p-5 group', i > 0 && 'border-t border-[#2D151F]/5', !user.isActive && 'opacity-40')}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#2D151F] flex items-center justify-center text-[#F4F3DC] text-sm font-black shrink-0">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-[#2D151F] text-sm">{user.name}</p>
                    <span className={cn('px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-lg border shadow-clay-inner flex items-center gap-1', user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-[#F4F3DC] text-[#2D151F]/40 border-[#2D151F]/10')}>
                      {user.role === 'admin' ? <ShieldCheck size={8} strokeWidth={2.5} /> : <User size={8} strokeWidth={2.5} />}
                      {user.role}
                    </span>
                  </div>
                  <p className="text-[9px] font-black text-[#2D151F]/30">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(user)} className="w-9 h-9 rounded-xl flex items-center justify-center text-[#2D151F]/30 hover:text-[#2D151F] hover:bg-[#F4F3DC] transition-all shadow-clay-inner">
                  <Edit2 size={14} strokeWidth={2.5} />
                </button>
                <button onClick={() => toggleActive(user)} className={cn('w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-clay-inner', user.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-[#2D151F]/20 hover:bg-[#F4F3DC]')} title={user.isActive ? 'Disable' : 'Enable'}>
                  {user.isActive ? <ToggleRight size={16} strokeWidth={2.5} /> : <ToggleLeft size={16} strokeWidth={2.5} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit User' : 'Add User'} subtitle="User account settings">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="field-label">Full Name <span className="text-red-400">*</span></label>
            <input required className="clay-input w-full" placeholder="e.g. Ahmed Ali" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="field-label">Email <span className="text-red-400">*</span></label>
            <input type="email" required className="clay-input w-full" placeholder="user@webzio.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="field-label">{editId ? 'New Password (leave blank to keep)' : 'Password *'}</label>
            <input type="password" className="clay-input w-full" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="field-label">Role</label>
            <div className="flex gap-2">
              {['admin', 'staff'].map(r => (
                <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))} className={cn('flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border-2 transition-all', form.role === r ? 'bg-[#2D151F] border-[#2D151F] text-[#F4F3DC] shadow-clay-inner' : 'border-transparent bg-[#F4F3DC]/60 text-[#2D151F]/40')}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 h-12 bg-[#2D151F] text-[#F4F3DC] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#4A2B3A] transition-all shadow-clay-outer disabled:opacity-50">
              {saving ? 'Saving...' : editId ? 'Update User' : 'Add User'}
            </button>
            <button type="button" onClick={() => setModal(false)} className="h-12 px-6 clay-btn text-[#2D151F]/40 text-[9px] font-black uppercase tracking-widest">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
