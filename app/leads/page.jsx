'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/src/context/ExpenseContext';
import { useAuth } from '@/src/context/AuthContext';
import { cn, formatDate } from '@/src/lib/utils';
import Modal from '@/src/components/ui/Modal';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import Input from '@/src/components/ui/Input';
import Select from '@/src/components/ui/Select';
import {
  Plus,
  Search,
  Phone,
  Mail,
  User,
  ArrowRight,
  Trash2,
  TrendingUp,
  Target,
  Zap,
  CheckCircle2,
  History
} from 'lucide-react';

const STATUS_DESIGN = {
  'New': { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  'Contacted': { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  'Converted': { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  'Lost': { color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
};

export default function CRMPage() {
  const { leads = [], addLead, updateLead, deleteLead, addClient, loading } = useApp();
  const { isManagement } = useAuth();

  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [form, setForm] = useState({ name: '', phone: '', email: '', source: 'Manual', notes: '' });
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    let result = leads.filter(l => l.isActive);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l => l.name.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q));
    }
    if (filterStatus !== 'All') result = result.filter(l => l.status === filterStatus);
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
    if (!confirm(`Convert ${lead.name} to Client?`)) return;
    setSaving(true);
    try {
      await addClient({ name: lead.name, phone: lead.phone, email: lead.email, company: lead.source, notes: lead.notes });
      await updateLead(lead.id, { ...lead, status: 'Converted' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center font-black animate-pulse uppercase tracking-widest text-secondary-text/20">Accessing Lead Pipeline...</div>;

  return (
    <div className="space-y-10 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-accounting-text">Leads</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-text/40 mt-3">Sales Pipeline</p>
        </div>
        <Button onClick={() => setModal(true)} icon={Plus} className="h-14 px-8 shadow-2xl">Add Lead</Button>
      </div>

      {/* Snapshot Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <PipelineBox label="New Leads" count={leads.filter(l => l.status === 'New' && l.isActive).length} color="blue" />
        <PipelineBox label="In Contact" count={leads.filter(l => l.status === 'Contacted' && l.isActive).length} color="amber" />
        <PipelineBox label="Converted" count={leads.filter(l => l.status === 'Converted' && l.isActive).length} color="emerald" />
        <PipelineBox label="Lost" count={leads.filter(l => l.status === 'Lost' && l.isActive).length} color="rose" />
      </div>

      {/* Control Surface */}
      <Card className="p-8 flex flex-col md:flex-row gap-6 items-center shadow-xl">
        <div className="flex-1 w-full">
          <Input icon={Search} placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="min-w-[200px]">
          <option value="All">All Status</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Converted">Converted</option>
          <option value="Lost">Lost</option>
        </Select>
      </Card>

      {/* Lead Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
        {filtered.length === 0 ? (
          <div className="col-span-1 md:col-span-2 py-40 text-center opacity-20 font-black uppercase tracking-widest text-[11px]">No active leads identified in current matrix</div>
        ) : (
          filtered.map(lead => <LeadCard key={lead.id} lead={lead} onConvert={() => handleConvert(lead)} onDelete={async () => { if(confirm('Purge lead?')) await deleteLead(lead.id); }} />)
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Initialize Lead Capture">
        <form onSubmit={handleSubmit} className="space-y-8 p-1">
          <Input label="Lead Identity Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. John Doe" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Contact Communication" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone..." />
            <Input label="Digital Endpoint" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email..." />
          </div>
          <Input label="Acquisition Source" value={form.source} onChange={e => setForm({...form, source: e.target.value})} placeholder="e.g. LinkedIn, Referral" />
          <div className="space-y-2">
            <label className="field-label">Requirement Matrix & Notes</label>
            <textarea className="clay-input w-full min-h-[100px] resize-none" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Operational requirements..." />
          </div>
          <div className="flex gap-4 pt-6">
            <Button type="submit" isLoading={saving} fullWidth className="h-14">Capture Intake</Button>
            <Button variant="secondary" onClick={() => setModal(false)} className="h-14 px-10">Abort</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function PipelineBox({ label, count, color }) {
  return (
    <Card className="p-6 text-center space-y-2 border border-accounting-text/5 shadow-lg group">
      <p className="text-[9px] font-black uppercase tracking-widest text-secondary-text/30 leading-none">{label}</p>
      <p className={cn("text-4xl font-black tracking-tighter leading-none transition-transform group-hover:scale-110", `text-${color}-600`)}>{count}</p>
    </Card>
  );
}

function LeadCard({ lead, onConvert, onDelete }) {
  const design = STATUS_DESIGN[lead.status] || STATUS_DESIGN['New'];
  return (
    <Card className="p-7 flex flex-col h-full group border border-transparent hover:border-accounting-text/5 shadow-none hover:shadow-2xl transition-all duration-500">
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-accounting-bg flex items-center justify-center -inner border border-white text-secondary-text/30 shadow-sm">
            <User size={20} className="stroke-[2.5px]" />
          </div>
          <div className="min-w-0">
             <h3 className="font-extrabold text-accounting-text text-[15px] uppercase tracking-tight truncate group-hover:translate-x-1 transition-transform">{lead.name}</h3>
             <p className="text-[8px] font-black text-secondary-text/40 uppercase tracking-[0.2em] mt-2">{lead.source}</p>
          </div>
        </div>
        <div className={cn("px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border -inner shadow-sm", design.bg, design.color, design.border)}>
          {lead.status}
        </div>
      </div>

      <div className="flex-1 space-y-4">
        <div className="grid grid-cols-1 gap-2.5">
           <ContactBit icon={Phone} value={lead.phone || 'NO TEL ALIGNED'} />
           <ContactBit icon={Mail} value={lead.email || 'NO EMAIL ALIGNED'} />
        </div>
        {lead.notes && (
          <div className="p-4 bg-accounting-bg/40 rounded-2xl border border-white -inner text-[11px] text-secondary-text/60 italic leading-relaxed">
            {lead.notes}
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-accounting-bg/60 flex items-center justify-between">
        <p className="text-[8px] font-black text-secondary-text/20 uppercase tracking-widest">Added {formatDate(lead.created_at)}</p>
        <div className="flex gap-2">
          {lead.status !== 'Converted' && (
            <Button size="sm" variant="secondary" icon={CheckCircle2} onClick={onConvert} className="h-9 px-4 text-[9px]">Convert</Button>
          )}
          <Button variant="ghost" icon={Trash2} onClick={onDelete} className="w-9 h-9 p-0 text-rose-300 hover:text-rose-500 bg-white border border-accounting-text/5" />
        </div>
      </div>
    </Card>
  );
}

function ContactBit({ icon: Icon, value }) {
  return (
    <div className="flex items-center gap-3 text-[10px] font-bold text-secondary-text/40 uppercase tracking-widest">
      <Icon size={12} strokeWidth={3} className="text-secondary-text/20" /> {value}
    </div>
  );
}
