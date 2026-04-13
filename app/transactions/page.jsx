'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Download,
  Calendar,
  History,
  Folder,
  Users,
  CreditCard,
  ChevronRight,
  Plus,
  ArrowRightLeft,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertCircle,
  Edit2,
  Trash2
} from 'lucide-react';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import Input from '@/src/components/ui/Input';
import Select from '@/src/components/ui/Select';
import Table from '@/src/components/ui/Table';
import { useApp } from '@/src/context/ExpenseContext';
import { formatCurrency, cn, formatDate } from '@/src/lib/utils';
import { ENTRY_TYPES, DATE_FILTERS, ENTRY_STATUS } from '@/src/lib/constants';
import { useAuth } from '@/src/context/AuthContext';

function EntriesContent() {
  const { entries = [], deleteEntry, staff = [], projects = [], loading, exportCSV } = useApp();
  const { user, isSuperAdmin, isManagement } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('filter') || 'All');
  const [dateFilter, setDateFilter] = useState('All');

  const filtered = useMemo(() => {
    let list = [...entries];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t => t.title?.toLowerCase().includes(q) || t.personName?.toLowerCase().includes(q) || t.projectName?.toLowerCase().includes(q));
    }
    if (filterType !== 'All') list = list.filter(t => t.type === filterType);
    if (filterStatus !== 'All') list = list.filter(t => t.status === filterStatus);

    const now = new Date();
    if (dateFilter === DATE_FILTERS.TODAY) {
      list = list.filter(t => t.date === now.toISOString().split('T')[0]);
    } else if (dateFilter === DATE_FILTERS.THIS_MONTH) {
      list = list.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }
    return list;
  }, [entries, search, filterType, filterStatus, dateFilter]);

  const totals = useMemo(() => {
    const paid = filtered.filter(t => t.status === ENTRY_STATUS.PAID);
    const moneyIn = paid.filter(t => t.type === 'Money In' || t.type === 'Added Money').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const moneyOut = paid.filter(t => t.type === 'Money Out' || t.type === 'Salary').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    return { moneyIn, moneyOut, net: moneyIn - moneyOut };
  }, [filtered]);

  if (loading) return <div className="py-20 text-center font-black animate-pulse uppercase tracking-widest text-secondary-text/20">Loading Transactions...</div>;

  return (
    <div className="space-y-10 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-accounting-text">Transactions</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-text/40 mt-3">History of all entries</p>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => exportCSV(filtered)} icon={Download} className="h-14">Export</Button>
          {isManagement && (
            <Button onClick={() => router.push('/add-transaction')} icon={Plus} className="h-14 px-8 shadow-2xl">Add Entry</Button>
          )}
        </div>
      </div>

      {/* Stats Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatTile label="Total Income" value={formatCurrency(totals.moneyIn)} icon={ArrowUpCircle} color="emerald" />
        <StatTile label="Total Expenses" value={formatCurrency(totals.moneyOut)} icon={ArrowDownCircle} color="rose" />
        <StatTile label="Net Balance" value={formatCurrency(totals.net)} icon={ArrowRightLeft} color={totals.net >= 0 ? 'indigo' : 'rose'} />
      </div>

      {/* Workspace Controls */}
      <Card className="p-8 space-y-8 shadow-xl">
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1">
            <Input icon={Search} label="Search History" placeholder="Search by title, staff, or project..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="field-label">Date Range</label>
            <div className="flex p-1 bg-accounting-bg/40 rounded-2xl border border-white -inner">
              {['All', 'Today', 'This Month'].map(f => (
                <button 
                   key={f} 
                   onClick={() => setDateFilter(f === 'All' ? 'All' : (f === 'Today' ? DATE_FILTERS.TODAY : DATE_FILTERS.THIS_MONTH))}
                   className={cn("px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", dateFilter === (f === 'All' ? 'All' : (f === 'Today' ? DATE_FILTERS.TODAY : DATE_FILTERS.THIS_MONTH)) ? "bg-white text-accounting-text shadow-md" : "text-secondary-text/30 hover:text-accounting-text")}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-accounting-bg/50">
           <Select label="Filter Type" value={filterType} onChange={e => setFilterType(e.target.value)}>
             <option value="All">All Types</option>
             {Object.values(ENTRY_TYPES).map(t => <option key={t} value={t}>{t}</option>)}
           </Select>
           <Select label="Filter Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
             <option value="All">All Status</option>
             <option value="Paid">Paid</option>
             <option value="Pending">Pending</option>
           </Select>
           <div className="flex items-center justify-end pt-4">
              <p className="text-[10px] font-black text-secondary-text/30 uppercase tracking-widest leading-none">{filtered.length} matching entries</p>
           </div>
        </div>
      </Card>

      {/* Entry Registry */}
      <Card className="p-0 overflow-hidden shadow-2xl border border-accounting-text/5">
        <Table headers={['Date', 'Details', 'Category / Account', 'Amount', 'Actions']}>
          {filtered.map(entry => {
            const isInflow = entry.type === 'Money In' || entry.type === 'Added Money';
            return (
              <tr key={entry.id} className="group hover:bg-accounting-bg/10 transition-colors">
                <td className="w-40 py-6">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-accounting-bg/40 flex items-center justify-center -inner border border-white text-secondary-text/30">
                        <Calendar size={14} strokeWidth={3} />
                      </div>
                      <p className="text-[11px] font-bold text-accounting-text">{formatDate(entry.date)}</p>
                   </div>
                </td>
                <td className="max-w-md">
                   <div className="space-y-3">
                      <p className="font-extrabold text-accounting-text text-[15px] uppercase tracking-tight group-hover:translate-x-1 transition-transform">{entry.title}</p>
                      <div className="flex flex-wrap gap-2">
                         {entry.projectName && <TagLabel icon={Folder} label={entry.projectName} color="blue" />}
                         {entry.personName && <TagLabel icon={Users} label={entry.personName} color="gray" />}
                         {entry.status === 'Pending' && <TagLabel icon={AlertCircle} label="Pending" color="rose" animate />}
                      </div>
                   </div>
                </td>
                <td className="w-48">
                   <div className="space-y-2">
                      <span className={cn("px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border -inner shadow-sm inline-block", isInflow ? "bg-emerald-50 text-emerald-700 border-emerald-100":"bg-rose-50 text-rose-700 border-rose-100")}>
                        {entry.type}
                      </span>
                      <p className="text-[9px] font-bold text-secondary-text/40 uppercase tracking-widest px-1">{entry.account || 'DIRECT CARRY'}</p>
                   </div>
                </td>
                <td className="w-40">
                   <p className={cn("text-2xl font-black tracking-tighter", isInflow ? "text-emerald-600":"text-rose-500")}>
                     {isInflow ? '+':'-'}{formatCurrency(entry.amount)}
                   </p>
                </td>
                <td className="w-24">
                   <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <Button variant="ghost" icon={Edit2} onClick={() => router.push(`/add-transaction?edit=${entry.id}`)} className="w-10 h-10 p-0 bg-white border border-accounting-text/5 shadow-sm" />
                      {isSuperAdmin && (
                        <Button variant="ghost" icon={Trash2} onClick={() => { if(confirm('Delete transaction?')) deleteEntry(entry.id); }} className="w-10 h-10 p-0 text-rose-300 hover:text-rose-600 bg-white border border-accounting-text/5 shadow-sm" />
                      )}
                   </div>
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </div>
  );
}

function StatTile({ label, value, icon: Icon, color }) {
  return (
    <Card className="p-7 flex items-center justify-between shadow-lg border border-transparent hover:border-accounting-text/5 transition-all">
      <div className="space-y-2">
        <p className="text-[9px] font-black uppercase tracking-widest text-secondary-text/30 leading-none">{label}</p>
        <p className={cn("text-3xl font-black tracking-tighter leading-none", `text-${color}-600`)}>{value}</p>
      </div>
      <div className={cn("w-14 h-14 rounded-3xl flex items-center justify-center -inner border border-white shadow-lg", `bg-${color}-50`)}>
        <Icon size={24} className={cn("stroke-[3px]", `text-${color}-600`)} />
      </div>
    </Card>
  );
}

function TagLabel({ icon: Icon, label, color, animate }) {
  return (
    <span className={cn(
      "px-2.5 py-1 text-[8px] font-black rounded-lg uppercase tracking-widest flex items-center gap-1.5 border shadow-sm",
      color === 'blue' ? "bg-blue-50 text-blue-700 border-blue-100" : (color === 'rose' ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-accounting-bg text-secondary-text/60 border-white -inner"),
      animate && "animate-pulse"
    )}>
      <Icon size={9} strokeWidth={4} /> {label}
    </span>
  );
}

export default function FinancePage() {
  return <Suspense fallback={null}><EntriesContent /></Suspense>;
}
