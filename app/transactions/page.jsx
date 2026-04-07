'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  Briefcase, 
  ArrowLeftRight, 
  Tag, 
  Folder, 
  AlertCircle, 
  Download,
  Calendar,
  History,
  Layers,
  Users,
  CreditCard,
  ChevronRight
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
  const { entries = [], deleteEntry, staff = [], projects = [], accounts = [], loading, exportCSV } = useApp();
  const { isAdmin } = useAuth();
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

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.title?.toLowerCase().includes(q) ||
        t.personName?.toLowerCase().includes(q) ||
        t.projectName?.toLowerCase().includes(q)
      );
    }

    if (filterType !== 'All') list = list.filter(t => t.type === filterType);
    if (filterStatus !== 'All') list = list.filter(t => t.status === filterStatus);
    if (filterProject !== 'All') list = list.filter(t => t.projectId === filterProject);
    if (filterPerson !== 'All') list = list.filter(t => t.personId === filterPerson);

    const now = new Date();
    if (dateFilter === DATE_FILTERS.TODAY) {
      const today = now.toISOString().split('T')[0];
      list = list.filter(t => t.date === today);
    } else if (dateFilter === DATE_FILTERS.THIS_MONTH) {
      list = list.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (dateFilter === DATE_FILTERS.THIS_YEAR) {
      list = list.filter(t => new Date(t.date).getFullYear() === now.getFullYear());
    }

    return list;
  }, [entries, search, filterType, filterStatus, filterProject, filterPerson, dateFilter]);

  const totals = useMemo(() => {
    const moneyIn = filtered.filter(t => t.type === 'Money In' || t.type === 'Added Money').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const moneyOut = filtered.filter(t => t.type === 'Money Out' || t.type === 'Salary').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    return { moneyIn, moneyOut };
  }, [filtered]);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
       <div className="w-12 h-12 border-4 border-accounting-text/10 border-t-accounting-text rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 py-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-1">
        <div>
          <h1 className="text-4xl font-black text-accounting-text tracking-tighter leading-none">Fiscal Ledger</h1>
          <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest mt-2">{entries.length} audited systemic events</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => exportCSV(filtered)} icon={Download}>Export Summary</Button>
          {isAdmin && <Button onClick={() => router.push('/add-transaction')} icon={Plus}>Record Entry</Button>}
        </div>
      </div>

      <Card className="p-8 border border-accounting-text/5 shadow-2xl space-y-8">
         <div className="flex flex-col xl:flex-row gap-6">
            <div className="flex-1">
               <Input 
                icon={Search} 
                label="Identifier Lookup"
                placeholder="Search by title, stakeholder or initiative..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
               />
            </div>
            <div className="space-y-4 lg:min-w-[400px]">
               <label className="text-[10px] font-black text-secondary-text uppercase tracking-widest px-1">Temporal Scope</label>
               <div className="flex p-1.5 bg-accounting-bg/40 rounded-2xl border border-white -inner">
                  {['All', ...Object.values(DATE_FILTERS)].map(df => (
                    <button 
                       key={df} 
                       onClick={() => setDateFilter(df)}
                       className={cn(
                        "flex-1 h-11 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                        dateFilter === df ? "bg-white text-accounting-text shadow-lg shadow-accounting-text/5" : "text-secondary-text/30 hover:text-accounting-text"
                       )}
                    >
                       {df}
                    </button>
                  ))}
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-accounting-bg">
            <Select label="Economic Classification" value={filterType} onChange={e => setFilterType(e.target.value)}>
               <option value="All">All Classifications</option>
               {Object.values(ENTRY_TYPES).map(t => <option key={t} value={t}>{t}</option>)}
            </Select>

            <Select label="Settlement Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
               <option value="All">All Statuses</option>
               <option value={ENTRY_STATUS.PAID}>Authorized</option>
               <option value={ENTRY_STATUS.PENDING}>In Verification</option>
            </Select>

            <Select label="Project Allocation" value={filterProject} onChange={e => setFilterProject(e.target.value)}>
               <option value="All">All Projects</option>
               {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>

            <Select label="Stakeholder Filter" value={filterPerson} onChange={e => setFilterPerson(e.target.value)}>
               <option value="All">All Stakeholders</option>
               {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
         </div>
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4 py-8 bg-white/50 rounded-3xl border border-accounting-text/5">
         <div className="flex items-center gap-10">
            <div className="space-y-1">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[9px] font-black text-secondary-text uppercase tracking-widest">Aggregated Inflow</p>
               </div>
               <p className="text-3xl font-black text-emerald-600 tracking-tighter leading-none">{formatCurrency(totals.moneyIn)}</p>
            </div>
            <div className="space-y-1">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <p className="text-[9px] font-black text-secondary-text uppercase tracking-widest">Aggregated Outflow</p>
               </div>
               <p className="text-3xl font-black text-red-500 tracking-tighter leading-none">{formatCurrency(totals.moneyOut)}</p>
            </div>
         </div>
         <div className="flex items-center gap-2 px-6 py-3 bg-accounting-bg/40 rounded-3xl -inner border border-white">
            <History size={14} className="text-secondary-text/30" />
            <p className="text-[9px] font-black text-secondary-text uppercase tracking-widest">{filtered.length} audited records</p>
         </div>
      </div>

      <Card className="p-0 overflow-hidden border border-accounting-text/5 shadow-2xl">
        <Table headers={['Registry Date', 'Operational Detail', 'Classification', 'Settlement', 'Actions']}>
          {filtered.map((entry) => {
            const isInflow = entry.type === 'Money In' || entry.type === 'Added Money';
            return (
              <tr key={entry.id} className="group hover:bg-accounting-bg/10 transition-all">
                <td className="w-40">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-2xl bg-accounting-bg/40 flex items-center justify-center -inner border border-white text-secondary-text/30">
                        <Calendar size={16} strokeWidth={3} />
                     </div>
                     <p className="text-[11px] font-black text-secondary-text leading-none">{formatDate(entry.date)}</p>
                  </div>
                </td>
                <td className="max-w-md">
                  <div className="space-y-3">
                     <p className="font-black text-accounting-text text-base tracking-tight leading-none group-hover:translate-x-1 transition-transform">{entry.title}</p>
                     <div className="flex flex-wrap items-center gap-2">
                        {entry.projectName && (
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[8px] font-black rounded-lg uppercase tracking-widest flex items-center gap-1.5 border border-blue-100 shadow-sm">
                            <Folder size={9} strokeWidth={3} /> {entry.projectName}
                          </span>
                        )}
                        {entry.personName && (
                          <span className="px-2.5 py-1 bg-accounting-bg/60 text-secondary-text text-[8px] font-black rounded-lg uppercase tracking-widest flex items-center gap-1.5 border border-white shadow-sm">
                            <Users size={9} strokeWidth={3} /> {entry.personName}
                          </span>
                        )}
                        {entry.status === ENTRY_STATUS.PENDING && (
                          <span className="px-2.5 py-1 bg-red-50 text-red-600 text-[8px] font-black rounded-lg uppercase tracking-widest flex items-center gap-1.5 border border-red-100 animate-pulse shadow-sm">
                            <AlertCircle size={9} strokeWidth={3} /> Verification Required
                          </span>
                        )}
                     </div>
                  </div>
                </td>
                <td className="w-48">
                  <div className="space-y-2">
                     <span className={cn(
                       "px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border -inner shadow-sm inline-block",
                       isInflow ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                     )}>
                        {entry.type}
                     </span>
                     <div className="flex items-center gap-2 px-1 opacity-40">
                        <CreditCard size={10} strokeWidth={3} className="text-secondary-text" />
                        <p className="text-[9px] font-bold text-secondary-text uppercase tracking-widest truncate max-w-[120px]">{entry.account || 'DIRECT'}</p>
                     </div>
                  </div>
                </td>
                <td className="w-40">
                   <p className={cn("text-2xl font-black tracking-tighter leading-none", isInflow ? "text-emerald-600" : "text-red-500")}>
                      {isInflow ? '+' : '-'}{formatCurrency(parseFloat(entry.amount || 0))}
                   </p>
                </td>
                <td className="w-24">
                  {isAdmin && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                      <Button variant="ghost" size="sm" icon={Edit2} onClick={() => router.push(`/add-transaction?edit=${entry.id}`)} className="w-10 h-10 p-0 text-secondary-text hover:text-accounting-text bg-white border border-accounting-text/5 shadow-sm" />
                      <Button variant="ghost" size="sm" icon={Trash2} onClick={() => { if(confirm('Permanent System Purge?')) deleteEntry(entry.id); }} className="w-10 h-10 p-0 text-red-400 hover:text-red-600 bg-white border border-accounting-text/5 shadow-sm" />
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </Table>
        
        {filtered.length === 0 && (
           <div className="py-40 text-center space-y-6">
              <div className="w-24 h-24 rounded-[2.5rem] bg-accounting-bg/40 flex items-center justify-center -inner border border-white mx-auto">
                 <History size={40} className="text-secondary-text/10" strokeWidth={1} />
              </div>
              <div className="space-y-1">
                 <p className="text-[11px] font-black text-secondary-text uppercase tracking-widest italic">Temporal Matrix Null</p>
                 <p className="text-[9px] font-bold text-secondary-text/20 uppercase tracking-widest italic">Zero matching auditing records found in current scope.</p>
              </div>
           </div>
        )}
      </Card>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={null}>
      <EntriesContent />
    </Suspense>
  );
}
