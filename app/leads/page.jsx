'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/src/context/ExpenseContext';
import { useAuth } from '@/src/context/AuthContext';
import { cn, formatDate } from '@/src/lib/utils';
import Modal from '@/src/components/ui/Modal';
import Button from '@/src/components/ui/Button';
import {
  Plus,
  Search,
  Phone,
  Mail,
  User,
  ArrowRight,
  Trash2,
  TrendingUp
} from 'lucide-react';
import { CardSkeleton } from '@/src/components/ui/Skeleton';

const STATUS_CONFIG = {
  'New': { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  'Contacted': { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  'Converted': { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  'Lost': { color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
};

export default function LeadsPage() {
  const { leads = [], addLead, updateLead, deleteLead, addClient, loading } = useApp();
  const { isAdmin } = useAuth();

  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'Manual',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  const filteredLeads = useMemo(() => {
    let result = leads.filter(l => l.isActive);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l => l.name.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q));
    }
    if (filterStatus !== 'All') {
      result = result.filter(l => l.status === filterStatus);
    }
    return result;
  }, [leads, search, filterStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await addLead(form);
    setSaving(false);
    setModal(false);
    setForm({ name: '', phone: '', email: '', source: 'Manual', notes: '' });
  };

  const handleConvert = async (lead) => {
    if (!confirm(`Convert ${lead.name} to a Client?`)) return;
    setSaving(true);
    try {
      // 1. Add as Client
      await addClient({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        company: lead.source, // Temporary placeholder
        notes: lead.notes
      });
      // 2. Update Lead status
      await updateLead(lead.id, { ...lead, status: 'Converted' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="space-y-8 py-6">
      <div className="h-10 w-48 bg-accounting-text/5 animate-pulse rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div>
          <h1 className="text-3xl font-black text-accounting-text tracking-tighter leading-none">Leads</h1>
          <p className="text-[9px] font-black text-accounting-text/60 uppercase tracking-[0.3em] mt-1">
            {filteredLeads.length} active leads in pipeline
          </p>
        </div>
        <Button
          onClick={() => setModal(true)}
          icon={Plus}
        >
          Add Lead
        </Button>
      </div>

      {/* Pipeline Progress Bits */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PipelineStat label="New" count={leads.filter(l => l.status === 'New' && l.isActive).length} color="text-blue-600" />
        <PipelineStat label="Contacted" count={leads.filter(l => l.status === 'Contacted' && l.isActive).length} color="text-amber-600" />
        <PipelineStat label="Converted" count={leads.filter(l => l.status === 'Converted' && l.isActive).length} color="text-emerald-600" />
        <PipelineStat label="Lost" count={leads.filter(l => l.status === 'Lost' && l.isActive).length} color="text-red-500" />
      </div>

      {/* Filters */}
      <div className="clay-card p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="space-y-1.5 md:col-span-2">
          <label className="field-label">Search Pipeline</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-accounting-text/30" size={16} />
            <input
              className="clay-input w-full pl-11 h-11"
              placeholder="Search leads by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="field-label">Status Filter</label>
          <select
            className="clay-input w-full h-11"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="All">All Leads</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Leads List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">
        {filteredLeads.length === 0 ? (
          <div className="md:col-span-2 clay-card p-20 flex flex-col items-center text-center">
            <TrendingUp size={48} className="text-[#2D151F]/10 mb-4" strokeWidth={1} />
            <p className="text-xl font-black text-[#2D151F]/40 uppercase tracking-tighter">No leads matched your search</p>
          </div>
        ) : (
          filteredLeads.map(lead => (
            <div key={lead.id} className="clay-card p-6 flex flex-col h-full group hover:border-[#2D151F]/20 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2D151F]/5 flex items-center justify-center -inner">
                    <User size={18} className="text-[#2D151F]/60" />
                  </div>
                  <div>
                    <h3 className="font-black text-[#2D151F] text-lg leading-tight">{lead.name}</h3>
                    <p className="text-[10px] font-black text-[#2D151F]/40 uppercase tracking-widest mt-1">{lead.source}</p>
                  </div>
                </div>
                <div className={cn(
                  "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest -inner border",
                  STATUS_CONFIG[lead.status]?.bg,
                  STATUS_CONFIG[lead.status]?.color,
                  STATUS_CONFIG[lead.status]?.border
                )}>
                  {lead.status}
                </div>
              </div>

              <div className="flex-1 space-y-3">
                {lead.phone && (
                  <div className="flex items-center gap-3 text-xs font-bold text-[#2D151F]/60">
                    <Phone size={14} /> {lead.phone}
                  </div>
                )}
                {lead.email && (
                  <div className="flex items-center gap-3 text-xs font-bold text-[#2D151F]/60">
                    <Mail size={14} /> {lead.email}
                  </div>
                )}
                {lead.notes && (
                  <div className="p-3 bg-[#2D151F]/5 rounded-xl text-[11px] text-[#2D151F]/60 leading-relaxed italic">
                    {lead.notes}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-5 border-t border-[#2D151F]/5 flex items-center justify-between">
                <div className="text-[10px] font-black text-[#2D151F]/30 uppercase tracking-widest">
                  Added {formatDate(lead.created_at)}
                </div>
                <div className="flex gap-2">
                  {lead.status !== 'Converted' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={ArrowRight}
                      onClick={() => handleConvert(lead)}
                    >
                      Convert
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Trash2}
                    onClick={async () => { if (confirm('Delete lead?')) await deleteLead(lead.id); }}
                    className="text-red-400 hover:text-red-600"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Lead Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add New Lead" subtitle="Capture a potential client">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="field-label">Client Name <span className="text-red-400">*</span></label>
            <input required className="clay-input w-full" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="field-label">Phone</label>
              <input className="clay-input w-full" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone number..." />
            </div>
            <div className="space-y-1.5">
              <label className="field-label">Email</label>
              <input type="email" className="clay-input w-full" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email address..." />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="field-label">Source / Lead Info</label>
            <input className="clay-input w-full" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="Referral, Social Media, etc." />
          </div>
          <div className="space-y-1.5">
            <label className="field-label">Requirement Details</label>
            <textarea className="clay-input w-full min-h-[100px]" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="What are they looking for?" />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={saving} className="flex-1 h-12">Add Lead</Button>
            <Button variant="outline" onClick={() => setModal(false)} className="h-12 px-6 text-[#2D151F]">Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const PipelineStat = ({ label, count, color }) => (
  <div className="clay-card p-5 flex flex-col items-center justify-center text-center">
    <p className="text-[8px] font-black text-accounting-text/40 uppercase tracking-widest mb-1">{label}</p>
    <p className={cn("text-2xl font-black tracking-tighter", color)}>{count}</p>
  </div>
);
