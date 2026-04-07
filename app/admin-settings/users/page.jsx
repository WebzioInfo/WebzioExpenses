'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import Modal from '@/src/components/ui/Modal';
import { Plus, Edit2, ShieldCheck, User, ToggleLeft, ToggleRight, Search, Mail, Key } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';
import Table from '@/src/components/ui/Table';

const BLANK = { name: '', email: '', password: '', role: 'staff', permissions: ['Tasks', 'Dashboard'] };
const ALL_MODULES = ['Dashboard', 'Tasks', 'Finance', 'CRM', 'Attendance'];

export default function PermissionsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const openAdd = () => { setEditId(null); setForm(BLANK); setError(''); setModal(true); };
  const openEdit = (u) => {
    setEditId(u.id);
    setForm({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      permissions: u.permissions ? (typeof u.permissions === 'string' ? JSON.parse(u.permissions) : u.permissions) : ['Tasks']
    });
    setError('');
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) { setError('Name and email are required.'); return; }
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
      setError(err.error || 'Failed to save user.');
    }
    setSaving(false);
  };

  const toggleActive = async (user) => {
    await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...user, isActive: !user.isActive, permissions: user.permissions }),
    });
    await fetchUsers();
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-accounting-text tracking-tighter uppercase">Permissions & Roles</h2>
          <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest mt-1">Manage system access levels</p>
        </div>
        <Button onClick={openAdd} icon={Plus}>Assign New Role</Button>
      </div>

      {/* Search & Stats */}
      <div className="flex items-center gap-4 bg-accounting-bg/30 p-2 rounded-2xl -inner border border-white/50">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-accounting-text/30" size={16} />
          <input 
            className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold pl-11 text-accounting-text placeholder:text-accounting-text/30"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 border-l border-accounting-text/10">
          <p className="text-[9px] font-black text-secondary-text uppercase tracking-widest whitespace-nowrap">Total Systems Users: {users.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-accounting-text/10 border-t-accounting-text rounded-full animate-spin" /></div>
      ) : (
        <Table headers={['User', 'System Role', 'Status', 'Actions']}>
          {filteredUsers.map((user) => (
            <tr key={user.id} className={cn(!user.isActive && 'opacity-50 grayscale')}>
              <td>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accounting-text text-white flex items-center justify-center font-black shrink-0 shadow-lg">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-accounting-text text-sm leading-none">{user.name}</p>
                    <p className="text-[10px] font-bold text-secondary-text mt-1">{user.email}</p>
                  </div>
                </div>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accounting-bg border border-accounting-text/5 text-[9px] font-black uppercase tracking-widest text-accounting-text">
                    {user.role === 'admin' ? <ShieldCheck size={10} strokeWidth={3} className="text-purple-600" /> : <User size={10} strokeWidth={3} className="text-emerald-600" />}
                    {user.role}
                  </span>
                </div>
              </td>
              <td>
                <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest", user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
                  <div className={cn("w-1.5 h-1.5 rounded-full", user.isActive ? "bg-emerald-500" : "bg-red-500")} />
                  {user.isActive ? 'Active' : 'Disabled'}
                </div>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(user)} icon={Edit2} className="w-9 h-9 p-0" />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleActive(user)} 
                    icon={user.isActive ? ToggleRight : ToggleLeft} 
                    className={cn('w-9 h-9 p-0', user.isActive ? 'text-emerald-500' : 'text-red-500')}
                    title={user.isActive ? 'Disable' : 'Enable'}
                  />
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Permissions' : 'Assign System Role'} subtitle="Configure account access levels">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" required icon={User} placeholder="e.g. John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input label="Email Address" type="email" required icon={Mail} placeholder="name@webzio.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          
          <Input label={editId ? 'New Password (Optional)' : 'Password'} type="password" icon={Key} placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />

          <div className="space-y-3 p-5 bg-accounting-bg/40 rounded-3xl -inner border border-white/50">
            <label className="field-label flex items-center justify-between">
              Module Access Control
              <span className="text-[8px] font-black text-secondary-text uppercase tracking-widest">Active Permissions</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ALL_MODULES.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    const perms = form.permissions || [];
                    const newPerms = perms.includes(m) ? perms.filter(p => p !== m) : [...perms, m];
                    setForm(f => ({ ...f, permissions: newPerms }));
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
                  <span className={cn("text-[9px] font-black uppercase tracking-widest", form.permissions?.includes(m) ? "text-white" : "text-accounting-text")}>{m}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="p-3 bg-red-50 border border-red-100 rounded-xl text-[9px] font-black text-red-600 uppercase tracking-widest">{error}</p>}

          <div className="flex gap-4 pt-4">
            <Button type="submit" isLoading={saving} fullWidth>{editId ? 'Save Changes' : 'Assign Role'}</Button>
            <Button variant="secondary" onClick={() => setModal(false)} className="px-10">Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
