'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, Edit2, Trash2, TrendingUp, TrendingDown, Coins, Briefcase, ArrowLeftRight, Tag, Folder, AlertCircle, ShieldCheck, XCircle, Plus, Download } from 'lucide-react';
import { useApp } from '@/src/context/ExpenseContext';
import { formatCurrency, formatDate, cn } from '@/src/utils/helpers';
import { ENTRY_TYPES, DATE_FILTERS } from '@/src/utils/constants';

const TYPE_ICONS = {
  'Money In': { icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  'Money Out': { icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' },
  'Added Money': { icon: Coins, color: 'text-blue-600', bg: 'bg-blue-50' },
  'Salary': { icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
  'Transfer': { icon: ArrowLeftRight, color: 'text-purple-600', bg: 'bg-purple-50' },
};

const STATUS_STYLES = {
  'Paid': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
  'Cancelled': 'bg-red-50 text-red-600 border-red-200',
};

function EntriesContent() {
  const { entries, deleteEntry, people, projects, loading, exportCSV } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('filter') || 'All');
  const [filterProject, setFilterProject] = useState('All');
  const [filterPerson, setFilterPerson] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');

  const filtered = useMemo(() => {
    if (!entries) return [];
    let list = [...entries];

    // Search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.title?.toLowerCase().includes(q) ||
        t.personName?.toLowerCase().includes(q) ||
        t.projectName?.toLowerCase().includes(q)
      );
    }

    // Type
    if (filterType !== 'All') list = list.filter(t => t.type === filterType);

    // Status
    if (filterStatus !== 'All') list = list.filter(t => t.status === filterStatus);

    // Project
    if (filterProject !== 'All') list = list.filter(t => t.projectId === filterProject);

    // Person
    if (filterPerson !== 'All') list = list.filter(t => t.personId === filterPerson);

    // Date
    const now = new Date();
    if (dateFilter === DATE_FILTERS.TODAY) {
      const today = now.toISOString().split('T')[0];
      list = list.filter(t => t.date === today);
    } else if (dateFilter === DATE_FILTERS.THIS_MONTH) {
      list = list.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (dateFilter === DATE_FILTERS.LAST_MONTH) {
      const lastM = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      list = list.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === lastM.getMonth() && d.getFullYear() === lastM.getFullYear();
      });
    } else if (dateFilter === DATE_FILTERS.THIS_YEAR) {
      list = list.filter(t => new Date(t.date).getFullYear() === now.getFullYear());
    }

    return list;
  }, [entries, search, filterType, filterStatus, filterProject, filterPerson, dateFilter]);

  const totals = useMemo(() => {
    const moneyIn = filtered.filter(t => t.type === 'Money In').reduce((s, t) => s + parseFloat(t.amount), 0);
    const moneyOut = filtered.filter(t => t.type === 'Money Out' || t.type === 'Salary').reduce((s, t) => s + parseFloat(t.amount), 0);
    return { moneyIn, moneyOut };
  }, [filtered]);

  if (loading) return (
    <div className="space-y-4 py-8 animate-pulse">
      {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-white/40 rounded-2xl shadow-clay-inner" />)}
    </div>
  );

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div>
          <h1 className="text-3xl font-black text-[#2D151F] tracking-tighter leading-none">Entries</h1>
          <p className="text-[9px] font-black text-[#2D151F]/30 uppercase tracking-[0.3em] mt-1">{entries.length} total entries</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportCSV(filtered)}
            className="h-11 px-6 bg-white border border-[#2D151F]/10 text-[#2D151F]/60 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#F4F3DC]/40 transition-all shadow-clay-outer flex items-center gap-2"
          >
            <Download size={14} strokeWidth={2.5} /> Export CSV
          </button>
          <button
            onClick={() => router.push('/add-transaction')}
            className="h-11 px-7 bg-[#2D151F] text-[#F4F3DC] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#4A2B3A] transition-all shadow-clay-outer flex items-center gap-2"
          >
            <Plus size={14} strokeWidth={2.5} /> Add Entry
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="clay-card p-5 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2D151F]/30" strokeWidth={2.5} />
          <input
            className="clay-input w-full pl-11 h-11 text-sm"
            placeholder="Search by title, staff, or project..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Type */}
          <select className="clay-input h-10 text-xs" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="All">All Types</option>
            {Object.values(ENTRY_TYPES).map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* Status */}
          <select className="clay-input h-10 text-xs" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Project */}
          <select className="clay-input h-10 text-xs" value={filterProject} onChange={e => setFilterProject(e.target.value)}>
            <option value="All">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          {/* Staff */}
          <select className="clay-input h-10 text-xs" value={filterPerson} onChange={e => setFilterPerson(e.target.value)}>
            <option value="All">All Staff</option>
            {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {/* Date Quick Filters */}
        <div className="flex flex-wrap gap-2">
          {['All', ...Object.values(DATE_FILTERS)].map(df => (
            <button
              key={df}
              onClick={() => setDateFilter(df)}
              className={cn(
                'h-8 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all',
                dateFilter === df ? 'bg-[#2D151F] text-[#F4F3DC] shadow-clay-outer' : 'bg-[#F4F3DC]/60 text-[#2D151F]/40 hover:bg-white'
              )}
            >
              {df}
            </button>
          ))}
        </div>
      </div>

      {/* Summary bar */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-[9px] font-black text-[#2D151F]/30 uppercase tracking-widest">{filtered.length} entries shown</p>
          <div className="flex gap-4">
            <span className="text-[9px] font-black text-emerald-600 uppercase">In: {formatCurrency(totals.moneyIn)}</span>
            <span className="text-[9px] font-black text-red-500 uppercase">Out: {formatCurrency(totals.moneyOut)}</span>
          </div>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="clay-card p-20 flex flex-col items-center text-center space-y-3">
          <p className="text-base font-black text-[#2D151F]/30 uppercase tracking-tighter">No data available</p>
          <p className="text-[9px] font-black text-[#2D151F]/20 uppercase tracking-widest">Try adjusting your filters or add a new entry</p>
        </div>
      ) : (
        <div className="clay-card overflow-hidden">
          {/* Table Header */}
          <div className="hidden lg:grid grid-cols-[1fr_2fr_1fr_1fr_1fr_auto] gap-0 px-6 py-4 border-b border-[#2D151F]/5 bg-[#F4F3DC]/40">
            {['Date', 'Title', 'Type', 'Account', 'Amount', 'Actions'].map(h => (
              <p key={h} className="text-[8px] font-black text-[#2D151F]/30 uppercase tracking-[0.25em]">{h}</p>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((entry, i) => {
            const typeConf = TYPE_ICONS[entry.type] || { icon: Tag, color: 'text-gray-400', bg: 'bg-gray-50' };
            const TypeIcon = typeConf.icon;
            const isInflow = entry.type === 'Money In' || entry.type === 'Added Money';

            return (
              <div
                key={entry.id}
                className={cn('group grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr_1fr_1fr_auto] gap-3 lg:gap-0 items-center px-6 py-5 hover:bg-[#F4F3DC]/20 transition-colors', i > 0 && 'border-t border-[#2D151F]/5')}
              >
                {/* Date */}
                <div>
                  <p className="text-xs font-black text-[#2D151F]/60">{entry.date}</p>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <p className="font-black text-[#2D151F] text-sm group-hover:translate-x-0.5 transition-transform">{entry.title}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {entry.category && <span className="px-2 py-0.5 text-[8px] font-black text-[#2D151F]/40 bg-[#F4F3DC] rounded-lg uppercase tracking-wide">{entry.category}</span>}
                    {entry.personName && (
                      <span className="px-2 py-0.5 text-[8px] font-black text-[#2D151F]/40 bg-[#2D151F]/5 rounded-lg uppercase tracking-wide">{entry.personName}</span>
                    )}
                    {entry.projectName && (
                      <span className="px-2 py-0.5 text-[8px] font-black text-blue-600/60 bg-blue-50 rounded-lg uppercase tracking-wide flex items-center gap-1">
                        <Folder size={8} />
                        {entry.projectName}
                      </span>
                    )}
                    {entry.status === 'Pending' && (
                      <span className="px-2 py-0.5 text-[8px] font-black text-amber-600 bg-amber-50 border border-amber-200 rounded-lg uppercase tracking-wide flex items-center gap-1 animate-pulse">
                        <AlertCircle size={8} /> Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Type */}
                <div>
                  <div className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-wide shadow-clay-inner', typeConf.color, typeConf.bg)}>
                    <TypeIcon size={11} strokeWidth={2.5} />
                    {entry.type}
                  </div>
                </div>

                {/* Account */}
                <div>
                  <span className="text-xs font-black text-[#2D151F]/40">{entry.account || '—'}</span>
                </div>

                {/* Amount */}
                <div>
                  <p className={cn('font-black text-base tracking-tighter', isInflow ? 'text-emerald-600' : 'text-red-500')}>
                    {isInflow ? '+' : '-'}{formatCurrency(parseFloat(entry.amount))}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => router.push(`/add-transaction?edit=${entry.id}`)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[#2D151F]/40 hover:text-[#2D151F] hover:bg-white transition-all shadow-clay-inner"
                    title="Edit"
                  >
                    <Edit2 size={14} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => { if (confirm('Delete this entry?')) deleteEntry(entry.id); }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-red-300 hover:text-red-600 hover:bg-red-50 transition-all shadow-clay-inner"
                    title="Delete"
                  >
                    <Trash2 size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center"><div className="w-10 h-10 bg-[#2D151F]/10 rounded-2xl animate-pulse shadow-clay-inner mx-auto" /></div>}>
      <EntriesContent />
    </Suspense>
  );
}
