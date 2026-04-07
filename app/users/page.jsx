'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'next/navigation';
import Modal from '@/src/components/ui/Modal';
import { Plus, Edit2, ShieldCheck, User, ToggleLeft, ToggleRight, UserPlus, Users as UsersIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import Input from '@/src/components/ui/Input';
import Table from '@/src/components/ui/Table';

const BLANK = { name: '', email: '', password: '', role: 'Staff', permissions: ['Tasks', 'Dashboard'] };
const ALL_MODULES = ['Dashboard', 'Tasks', 'Finance', 'CRM', 'Attendance'];

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
  }, [isAdmin, router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
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
    const res = await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...user, isActive: !user.isActive }),
    });
    if (res.ok) await fetchUsers();
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8 px-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div>
          <h1 className="text-4xl font-black text-accounting-text tracking-tighter leading-none">Access Matrix</h1>
          <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest mt-2">{users.length} registered system entities</p>
        </div>
        <Button
          onClick={openAdd}
          icon={UserPlus}
          className="h-12 px-8"
        >
          Provision User
        </Button>
      </div>

      {loading ? (
        <div className="py-32 flex justify-center">
          <div className="w-12 h-12 border-4 border-accounting-text/10 border-t-accounting-text rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        /* Empty State */
        <Card className="p-24 flex flex-col items-center justify-center text-center space-y-6 border-2 border-dashed border-accounting-text/5">
          <div className="w-20 h-20 rounded-3xl bg-accounting-bg/40 flex items-center justify-center -inner border border-white">
             <UsersIcon size={32} className="text-secondary-text/30" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-black text-accounting-text uppercase tracking-tighter">No users available</p>
            <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest leading-loose max-w-[240px]">
              The system matrix is currently empty. Provision your first user to grant access.
            </p>
          </div>
          <Button variant="secondary" onClick={openAdd} icon={Plus}>Add new user</Button>
        </Card>
      ) : (
        /* Table Section */
        <Card className="p-0 overflow-hidden shadow-2xl border border-accounting-text/5">
          <Table headers={['Identity', 'Status', 'Module Access', 'Actions']}>
            {users.map((user) => (
              <tr key={user.id} className={cn('group transition-colors', !user.isActive && 'bg-accounting-bg/20 grayscale opacity-60')}>
                <td className="p-6">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-accounting-text text-white flex items-center justify-center text-lg font-black shadow-lg shadow-accounting-text/10 shrink-0 capitalize">
                      {user.name?.[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-black text-accounting-text text-base tracking-tight leading-none">{user.name}</p>
                        <span className={cn(
                          'px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-lg border -inner flex items-center gap-1.5',
                          user.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                          user.role === 'HR' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          'bg-accounting-bg/60 text-secondary-text border-white'
                        )}>
                          {user.role === 'Admin' ? <ShieldCheck size={9} strokeWidth={3} /> : <User size={9} strokeWidth={3} />}
                          {user.role}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-secondary-text mt-2 lowercase">{user.email}</p>
                    </div>
                  </div>
                </td>
                
                <td className="w-32">
                  <span className={cn(
                    "px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border -inner",
                    user.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                  )}>
                    {user.isActive ? 'Authorized' : 'Suspended'}
                  </span>
                </td>

                <td className="max-w-xs">
                  <div className="flex flex-wrap gap-1.5">
                    {(() => {
                      let perms = [];
                      try {
                        perms = typeof user.permissions === 'string' 
                          ? JSON.parse(user.permissions || '[]') 
                          : (user.permissions || []);
                      } catch (e) {
                        perms = [];
                      }
                      if (!Array.isArray(perms)) perms = [];
                      
                      return (
                        <>
                          {perms.slice(0, 3).map(p => (
                            <span key={p} className="px-2 py-0.5 bg-accounting-bg/40 text-secondary-text text-[7px] font-black rounded-lg uppercase tracking-tight border border-white">
                              {p}
                            </span>
                          ))}
                          {perms.length > 3 && (
                            <span className="text-[7px] font-black text-secondary-text/30 px-1">+More</span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </td>

                <td className="w-24">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(user)}
                      icon={Edit2}
                      className="w-9 h-9 p-0 rounded-xl"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(user)}
                      icon={user.isActive ? ToggleRight : ToggleLeft}
                      className={cn('w-9 h-9 p-0 rounded-xl', user.isActive ? 'text-emerald-500 hover:text-emerald-600' : 'text-red-400')}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {/* Provisioning Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Modify Credentials' : 'Provision Entity'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Logical Identity Name" 
            required 
            placeholder="e.g. Ahmed Ali" 
            value={form.name} 
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
          />
          <Input 
            label="System Email Pointer" 
            type="email" 
            required 
            placeholder="user@webzio.com" 
            value={form.email} 
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
          />
          <Input 
            label={editId ? 'New Vault Key (optional)' : 'Vault Key *'} 
            type="password" 
            placeholder="••••••••" 
            value={form.password} 
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
          />
          <div className="space-y-4">
            <label className="text-[10px] font-black text-secondary-text uppercase tracking-widest px-1">Functional Protocol Role</label>
            <div className="grid grid-cols-3 gap-3">
              {['Admin', 'HR', 'Staff'].map(r => (
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
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
               <AlertCircle size={16} className="text-red-500" strokeWidth={3} />
               <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">{error}</p>
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t border-accounting-bg">
            <Button
              type="submit"
              isLoading={saving}
              fullWidth
              className="h-14"
            >
              {editId ? 'Authorized Update' : 'Initialize Provisioning'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setModal(false)}
              className="px-10 h-14"
            >
              Abort
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import { AlertCircle } from 'lucide-react';
