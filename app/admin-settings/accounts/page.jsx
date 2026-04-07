'use client';

import React, { useState } from 'react';
import { useApp } from '@/src/context/ExpenseContext';
import { formatCurrency, cn } from '@/src/lib/utils';
import Modal from '@/src/components/ui/Modal';
import { Plus, Edit2, Trash2, CreditCard, Building2, Smartphone, Wallet, Landmark } from 'lucide-react';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';
import Select from '@/src/components/ui/Select';
import Table from '@/src/components/ui/Table';

const BLANK = { name: '', type: 'Bank' };
const ACCOUNT_TYPES = [
  { id: 'Bank', icon: Building2 },
  { id: 'Cash', icon: Wallet },
  { id: 'UPI', icon: Smartphone },
  { id: 'Petty Cash', icon: Landmark },
];

export default function AccountsManagementPage() {
  const { accounts = [], addAccount, updateAccount, deleteAccount, loading } = useApp();
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setEditId(null); setForm(BLANK); setModal(true); };
  const openEdit = (a) => { setEditId(a.id); setForm({ name: a.name, type: a.type || 'Bank' }); setModal(true); };
  const closeModal = () => { setModal(false); setEditId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editId) await updateAccount(editId, form);
    else await addAccount(form);
    setSaving(false);
    closeModal();
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
          <h2 className="text-xl font-black text-accounting-text tracking-tighter uppercase">Financial Accounts</h2>
          <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest mt-1">Manage cash and bank accounts</p>
        </div>
        <Button onClick={openAdd} icon={Plus}>Add Account</Button>
      </div>

      <Table headers={['Account Name', 'Type', 'Current Balance', 'Actions']}>
        {accounts.map((account) => {
          const typeInfo = ACCOUNT_TYPES.find(t => t.id === account.type) || ACCOUNT_TYPES[0];
          return (
            <tr key={account.id}>
              <td>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accounting-bg flex items-center justify-center text-accounting-text/40 shadow-sm border border-white">
                    <typeInfo.icon size={18} strokeWidth={2.5} />
                  </div>
                  <p className="font-black text-accounting-text text-sm">{account.name}</p>
                </div>
              </td>
              <td>
                <span className="px-3 py-1 rounded-lg bg-accounting-bg border border-accounting-text/5 text-[9px] font-black uppercase tracking-widest text-accounting-text">
                  {account.type}
                </span>
              </td>
              <td>
                <p className={cn("font-black text-sm tracking-tighter", parseFloat(account.balance) < 0 ? "text-red-500" : "text-emerald-600")}>
                  {formatCurrency(account.balance || 0)}
                </p>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(account)} icon={Edit2} className="w-9 h-9 p-0" />
                  <Button variant="ghost" size="sm" onClick={() => { if(confirm(`Disable ${account.name}?`)) deleteAccount(account.id); }} icon={Trash2} className="w-9 h-9 p-0 text-red-400 hover:text-red-600" />
                </div>
              </td>
            </tr>
          );
        })}
        {accounts.length === 0 && (
          <tr>
            <td colSpan={4} className="py-20 text-center">
              <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest italic">No financial accounts registered yet.</p>
            </td>
          </tr>
        )}
      </Table>

      <Modal isOpen={modal} onClose={closeModal} title={editId ? 'Edit Account' : 'New Financial Account'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Account Name" 
            required 
            placeholder="e.g. HDFC Current Account, Office Cash..." 
            value={form.name} 
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
          />
          
          <Select 
            label="Account Type" 
            value={form.type} 
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
          >
            {ACCOUNT_TYPES.map(t => (
              <option key={t.id} value={t.id}>{t.id}</option>
            ))}
          </Select>

          <div className="p-5 bg-blue-50 border border-blue-100 rounded-3xl space-y-2">
             <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
               <Plus size={12} strokeWidth={3} /> Important Note
             </p>
             <p className="text-[11px] font-bold text-blue-600 leading-relaxed">
               New accounts start with a balance of ₹0. To add an opening balance, please record an "Added Money" transaction after creation.
             </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" isLoading={saving} fullWidth>{editId ? 'Update Account' : 'Create Account'}</Button>
            <Button variant="secondary" onClick={closeModal} className="px-10">Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
