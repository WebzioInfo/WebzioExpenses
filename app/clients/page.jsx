'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/src/context/ExpenseContext';
import { useAuth } from '@/src/context/AuthContext';
import { cn } from '@/src/lib/utils';
import Modal from '@/src/components/ui/Modal';
import Button from '@/src/components/ui/Button';
import {
  Plus,
  Search,
  Briefcase,
  Phone,
  Mail,
  Trash2,
  Settings,
  Globe
} from 'lucide-react';
import { CardSkeleton } from '@/src/components/ui/Skeleton';

export default function ClientsPage() {
  const { clients = [], projects = [], addClient, updateClient, deleteClient, loading } = useApp();
  const { isAdmin } = useAuth();

  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  const filteredClients = useMemo(() => {
    let result = clients.filter(c => c.isActive);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q));
    }
    return result;
  }, [clients, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await addClient(form);
    setSaving(false);
    setModal(false);
    setForm({ name: '', phone: '', email: '', company: '', notes: '' });
  };

  if (loading) return (
    <div className="space-y-8 py-6">
      <div className="h-10 w-48 bg-accounting-text/5 animate-pulse rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div>
          <h1 className="text-3xl font-black text-accounting-text tracking-tighter leading-none">Clients</h1>
          <p className="text-[9px] font-black text-accounting-text/60 uppercase tracking-[0.3em] mt-1">
            {filteredClients.length} professional partnerships
          </p>
        </div>
        <Button
          onClick={() => setModal(true)}
          icon={Plus}
        >
          Add Client
        </Button>
      </div>

      {/* Filters */}
      <div className="clay-card p-6">
        <label className="field-label mb-2 block">Search Directory</label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-accounting-text/30" size={16} />
          <input
            className="clay-input w-full pl-11 h-12"
            placeholder="Search by client name or company..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
        {filteredClients.length === 0 ? (
          <div className="md:col-span-3 clay-card p-20 flex flex-col items-center text-center">
            <Globe size={48} className="text-[#2D151F]/10 mb-4" strokeWidth={1} />
            <p className="text-xl font-black text-[#2D151F]/40 uppercase tracking-tighter">No clients found</p>
          </div>
        ) : (
          filteredClients.map(client => {
            const clientProjects = projects.filter(p => p.client === client.name || p.clientId === client.id);

            return (
              <div key={client.id} className="clay-card p-6 flex flex-col group hover:border-[#2D151F]/20 transition-all duration-300">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#2D151F]/5 flex items-center justify-center -inner">
                    <Briefcase size={24} className="text-[#2D151F]/60" strokeWidth={1.5} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" icon={Settings} className="p-0 h-9 w-9 text-[#2D151F]/30" />
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Trash2}
                      onClick={async () => { if (confirm('Delete client?')) await deleteClient(client.id); }}
                      className="p-0 h-9 w-9 text-red-300 hover:text-red-500 hover:bg-red-50"
                    />
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="font-black text-[#2D151F] text-xl leading-tight mb-1">{client.name}</h3>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">
                      {client.company || 'Private Individual'}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {client.phone && (
                      <div className="flex items-center gap-3 text-xs font-bold text-[#2D151F]/60">
                        <Phone size={14} className="opacity-40" /> {client.phone}
                      </div>
                    )}
                    {client.email && (
                      <div className="flex items-center gap-3 text-xs font-bold text-[#2D151F]/60">
                        <Mail size={14} className="opacity-40" /> {client.email}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#2D151F]/5">
                    <p className="text-[9px] font-black text-[#2D151F]/40 uppercase tracking-widest mb-3">Project History</p>
                    <div className="flex flex-wrap gap-2">
                      {clientProjects.length === 0 ? (
                        <span className="text-[10px] font-bold text-[#2D151F]/30 italic">No assigned projects</span>
                      ) : (
                        clientProjects.slice(0, 3).map(p => (
                          <span key={p.id} className="px-3 py-1 bg-[#2D151F]/5 text-[#2D151F]/60 text-[10px] font-black rounded-lg uppercase tracking-tight">
                            {p.name}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Client Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="New Partnership" subtitle="Add a business client">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="field-label">Contact Person <span className="text-red-400">*</span></label>
            <input required className="clay-input w-full" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Client name..." />
          </div>
          <div className="space-y-1.5">
            <label className="field-label">Company Name</label>
            <input className="clay-input w-full" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Business name (if any)..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="field-label">Phone</label>
              <input className="clay-input w-full" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone..." />
            </div>
            <div className="space-y-1.5">
              <label className="field-label">Email</label>
              <input type="email" className="clay-input w-full" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email..." />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="field-label">Notes / Relationship Details</label>
            <textarea className="clay-input w-full min-h-[100px]" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Internal company notes..." />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={saving} className="flex-1 h-12">Add Client</Button>
            <Button variant="outline" onClick={() => setModal(false)} className="h-12 px-6 text-[#2D151F]">Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
