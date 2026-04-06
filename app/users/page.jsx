'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'next/navigation';
import Modal from '@/src/components/ui/Modal';
import { Plus, Edit2, ShieldCheck, User, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import Button from '@/src/components/ui/Button';

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
          <h1 className="text-3xl font-black text-accounting-bg tracking-tighter leading-none">Users</h1>
          <p className="text-[9px] font-black text-accounting-bg/30 uppercase tracking-[0.3em] mt-1">Manage system access</p>
        </div>
        <Button 
          onClick={openAdd} 
          icon={Plus}
        >
          Add User
        </Button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><div className="w-10 h-10 bg-accounting-bg/10 rounded-2xl animate-pulse shadow-clay-inner" /></div>
      ) : (
        <div className="clay-card overflow-hidden bg-accounting-accent">
          {users.map((user, i) => (
            <div key={user.id} className={cn('flex items-center justify-between p-5 group', i > 0 && 'border-t border-accounting-bg/5', !user.isActive && 'opacity-40')}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-accounting-bg flex items-center justify-center text-accounting-bg text-sm font-black shrink-0">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-accounting-bg text-sm">{user.name}</p>
                    <span className={cn('px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-lg border shadow-clay-inner flex items-center gap-1', user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-accounting-bg text-accounting-bg/40 border-accounting-bg/10')}>
                      {user.role === 'admin' ? <ShieldCheck size={8} strokeWidth={2.5} /> : <User size={8} strokeWidth={2.5} />}
                      {user.role}
                    </span>
                  </div>
                  <p className="text-[9px] font-black text-accounting-bg/30">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => openEdit(user)} 
                  icon={Edit2}
                  className="w-9 h-9 p-0"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toggleActive(user)} 
                  icon={user.isActive ? ToggleRight : ToggleLeft}
                  className={cn('w-9 h-9 p-0', user.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-accounting-bg/20')}
                  title={user.isActive ? 'Disable' : 'Enable'}
                />
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
                <Button 
                  key={r} 
                  variant={form.role === r ? 'secondary' : 'ghost'}
                  onClick={() => setForm(f => ({ ...f, role: r }))} 
                  className={cn('flex-1 py-3 text-[9px]', form.role !== r && 'text-accounting-bg/60')}
                >
                  {r}
                </Button>
              ))}
            </div>
          </div>
          {error && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button 
              type="submit" 
              isLoading={saving}
              className="flex-1 h-12"
            >
              {editId ? 'Update User' : 'Add User'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => setModal(false)}
              className="h-12 px-6"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
