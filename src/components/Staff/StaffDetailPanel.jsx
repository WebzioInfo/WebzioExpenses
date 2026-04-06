'use client';

import React, { useMemo } from 'react';
import {
  X, Briefcase, Coins, TrendingDown, TrendingUp, User,
  Calendar, CreditCard, FileText, Hash, ArrowUpRight, ArrowDownRight, CheckCircle2
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/src/lib/utils';
import { ENTRY_TYPES, ENTRY_STATUS } from '@/src/lib/constants';

const ROLE_STYLES = {
  Admin: { badge: 'bg-purple-50 text-purple-700 border-purple-200', avatar: 'from-purple-400 to-purple-600' },
  Staff:   { badge: 'bg-blue-50 text-blue-700 border-blue-200',       avatar: 'from-blue-400 to-blue-600' },
  Freelancer: { badge: 'bg-amber-50 text-amber-700 border-amber-200', avatar: 'from-amber-400 to-amber-600' },
};

const TYPE_META = {
  [ENTRY_TYPES.MONEY_IN]:    { color: 'text-emerald-600', bg: 'bg-emerald-50', sign: '+', icon: TrendingUp },
  [ENTRY_TYPES.MONEY_OUT]:   { color: 'text-red-500',     bg: 'bg-red-50',     sign: '-', icon: TrendingDown },
  [ENTRY_TYPES.ADDED_MONEY]: { color: 'text-blue-600',    bg: 'bg-blue-50',    sign: '+', icon: Coins },
  [ENTRY_TYPES.SALARY]:      { color: 'text-amber-600',   bg: 'bg-amber-50',   sign: '-', icon: Briefcase },
  Transfer:                   { color: 'text-purple-600',  bg: 'bg-purple-50',  sign: '↔', icon: ArrowUpRight },
};

const TaskRow = ({ task }) => {
  const isDelayed = task.status !== 'Completed' && task.dueDate && task.dueDate < new Date().toISOString().split('T')[0];
  const statusColors = {
    'Completed':   'bg-emerald-50 text-emerald-600',
    'In Progress': 'bg-blue-50 text-blue-600',
    'Not Started': 'bg-accounting-bg text-accounting-text/40',
    'Delayed':     'bg-red-50 text-red-600',
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-clay-inner border border-white/50">
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-clay-inner',
          statusColors[isDelayed ? 'Delayed' : task.status] || 'bg-gray-50 text-gray-400'
        )}>
          <CheckCircle2 size={14} strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <p className="font-black text-accounting-text text-sm truncate">{task.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[8px] font-black text-accounting-text/30 uppercase tracking-widest">{task.projectName || 'Internal'}</span>
            <span className="text-accounting-text/10">·</span>
            <span className={cn('text-[8px] font-black uppercase tracking-widest', isDelayed ? 'text-red-500' : 'text-accounting-text/30')}>
              {isDelayed ? 'Delayed' : task.status}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right shrink-0 ml-3">
        <span className={cn(
          'text-[7px] font-black uppercase px-2 py-0.5 rounded-lg border shadow-clay-inner',
          task.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-accounting-bg text-accounting-text/30 border-transparent'
        )}>
          {task.priority}
        </span>
      </div>
    </div>
  );
};

export const StaffDetailPanel = ({ person, entries = [], tasks = [], onClose }) => {
  const [activeTab, setActiveTab] = React.useState('finance');
  const isOpen = !!person;

  // All transactions for this staff member
  const staffTx = useMemo(() => {
    if (!person) return [];
    return entries
      .filter(e => e.personId === person.id || String(e.personId) === String(person.id))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [person, entries]);

  // All tasks for this staff member
  const staffTasks = useMemo(() => {
    if (!person) return [];
    return tasks.filter(t => t.assignedTo === person.id || String(t.assignedTo) === String(person.id));
  }, [person, tasks]);

  // Totals
  const stats = useMemo(() => {
    const sum = (arr) => arr.reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const completed = staffTasks.filter(t => t.status === 'Completed').length;
    const total = staffTasks.length;
    return {
      salary:     sum(staffTx.filter(t => t.type === ENTRY_TYPES.SALARY)),
      moneyOut:   sum(staffTx.filter(t => t.type === ENTRY_TYPES.MONEY_OUT)),
      addedMoney: sum(staffTx.filter(t => t.type === ENTRY_TYPES.ADDED_MONEY)),
      moneyIn:    sum(staffTx.filter(t => t.type === ENTRY_TYPES.MONEY_IN)),
      totalTx:    staffTx.length,
      paidTx:     staffTx.filter(t => t.status === ENTRY_STATUS.PAID).length,
      pendingTx:  staffTx.filter(t => t.status === ENTRY_STATUS.PENDING).length,
      totalTasks: total,
      completedTasks: completed,
      performance: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [staffTx, staffTasks]);

  const role = person?.role || 'Staff';
  const roleStyle = ROLE_STYLES[role] || ROLE_STYLES.Staff;
  const initials = person?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-accounting-text/20 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full z-50 w-full max-w-xl bg-accounting-bg shadow-clay-outer',
          'transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {!person ? null : (
          <>
            {/* ─── HEADER BAND ─── */}
            <div className="relative bg-accounting-text p-8 pb-10 shrink-0 overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />

              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <div className={cn(
                    'w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black',
                    'bg-gradient-to-br shadow-clay-inner',
                    roleStyle.avatar
                  )}>
                    {initials}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tighter leading-tight">{person.name}</h2>
                    <div className="flex items-center gap-2 mt-1.5 text-white/50">
                      <span className={cn('px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border', roleStyle.badge)}>
                        {role}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest">{person.email || 'No email set'}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/10"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              {person.note && (
                <p className="relative z-10 mt-5 text-[11px] text-white/40 italic border-l-2 border-white/10 pl-3 leading-relaxed">
                  {person.note}
                </p>
              )}
            </div>

            {/* ─── SCROLLABLE CONTENT ─── */}
            <div className="flex-1 overflow-y-auto pb-10">
              <div className="px-6 -mt-4 space-y-6">
                {/* Financial Overview */}
                <div className="bg-white rounded-3xl shadow-clay-outer border border-white/50 p-5 grid grid-cols-2 gap-3">
                  <SummaryTile label="Salary Paid" value={stats.salary} color="text-amber-600" bg="bg-amber-50" icon={Briefcase} />
                  <SummaryTile label="Expenses" value={stats.moneyOut} color="text-red-500" bg="bg-red-50" icon={TrendingDown} />
                </div>

                {/* Performance & Capacity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-3xl shadow-clay-outer border border-white/50 p-6 flex flex-col items-center justify-center text-center space-y-2">
                    <p className="text-[9px] font-black text-accounting-text/40 uppercase tracking-widest">Performance Score</p>
                    <div className="relative w-20 h-20 flex items-center justify-center">
                       <svg className="w-full h-full -rotate-90">
                          <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" className="text-accounting-bg" />
                          <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" 
                            strokeDasharray={213} 
                            strokeDashoffset={213 - (213 * stats.performance) / 100}
                            className={cn('transition-all duration-1000', stats.performance > 80 ? 'text-emerald-500' : stats.performance > 50 ? 'text-blue-500' : 'text-amber-500')} 
                          />
                       </svg>
                       <span className="absolute text-xl font-black text-accounting-text tracking-tighter">{stats.performance}%</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl shadow-clay-outer border border-white/50 p-6 flex flex-col justify-between">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-accounting-text/40 uppercase tracking-widest">Task Completion</p>
                      <p className="text-3xl font-black text-accounting-text tracking-tighter">{stats.completedTasks}<span className="text-sm text-accounting-text/20 ml-1">/ {stats.totalTasks}</span></p>
                    </div>
                    <div className="flex gap-2 text-[8px] font-black uppercase tracking-widest text-accounting-text/40">
                      <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Done</span>
                      <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Doing</span>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="space-y-4 pt-2">
                  <div className="flex gap-1 p-1 bg-accounting-text/5 rounded-2xl">
                    <button 
                      onClick={() => setActiveTab('finance')}
                      className={cn('flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all', activeTab === 'finance' ? 'bg-white shadow-clay-inner text-accounting-text' : 'text-accounting-text/30 hover:text-accounting-text')}
                    >
                      Finances
                    </button>
                    <button 
                      onClick={() => setActiveTab('tasks')}
                      className={cn('flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all', activeTab === 'tasks' ? 'bg-white shadow-clay-inner text-accounting-text' : 'text-accounting-text/30 hover:text-accounting-text')}
                    >
                      Task List
                    </button>
                  </div>

                  <div className="space-y-3">
                    {activeTab === 'finance' ? (
                      staffTx.length === 0 ? <EmptyState text="No entries" /> : staffTx.map((tx, j) => <TxRow key={tx.id || j} tx={tx} />)
                    ) : (
                      staffTasks.length === 0 ? <EmptyState text="No tasks" /> : staffTasks.map((task, k) => <TaskRow key={task.id || k} task={task} />)
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};


// ─── Sub-components ──────────────────────────────────────────

const SummaryTile = ({ label, value, color, bg, icon: Icon }) => (
  <div className="flex items-center gap-3 p-3 bg-accounting-bg rounded-2xl shadow-clay-inner">
    <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', bg)}>
      <Icon size={14} strokeWidth={2.5} className={color} />
    </div>
    <div className="min-w-0">
      <p className="text-[8px] font-black text-accounting-text/30 uppercase tracking-widest truncate">{label}</p>
      <p className={cn('text-base font-black tracking-tight', color)}>{formatCurrency(value)}</p>
    </div>
  </div>
);

const StatusPill = ({ label, value, color }) => (
  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-2xl shadow-clay-inner flex-1 justify-center">
    <span className="text-[8px] font-black text-accounting-text/30 uppercase tracking-widest">{label}</span>
    <span className={cn('text-xs font-black', color)}>{value}</span>
  </div>
);

const TxRow = ({ tx }) => {
  const meta = TYPE_META[tx.type] || { color: 'text-accounting-text', bg: 'bg-gray-50', sign: '', icon: FileText };
  const Icon = meta.icon;
  const isPending = tx.status === ENTRY_STATUS.PENDING;

  return (
    <div className="group flex items-center justify-between p-4 bg-white rounded-2xl shadow-clay-inner border border-white/50 hover:shadow-clay-outer transition-all duration-200">
      <div className="flex items-center gap-3 min-w-0">
        {/* Type Icon */}
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', meta.bg)}>
          <Icon size={14} strokeWidth={2.5} className={meta.color} />
        </div>
        <div className="min-w-0">
          <p className="font-black text-accounting-text text-sm leading-tight truncate group-hover:text-accounting-text/80 transition-colors">
            {tx.title}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-[8px] font-black text-accounting-text/25 uppercase tracking-wider">{tx.type}</span>
            {tx.account && (
              <>
                <span className="text-accounting-text/15">·</span>
                <span className="text-[8px] font-black text-accounting-text/25 uppercase tracking-wider flex items-center gap-0.5">
                  <CreditCard size={7} /> {tx.account}
                </span>
              </>
            )}
            {tx.projectName && (
              <>
                <span className="text-accounting-text/15">·</span>
                <span className="text-[8px] font-black text-accounting-text/25 uppercase tracking-wider">{tx.projectName}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Amount + Date + Status */}
      <div className="text-right shrink-0 ml-3">
        <p className={cn('font-black text-base tracking-tight', meta.color)}>
          {meta.sign}{formatCurrency(parseFloat(tx.amount))}
        </p>
        <div className="flex items-center justify-end gap-1.5 mt-0.5">
          <span className="text-[8px] font-black text-accounting-text/20 flex items-center gap-0.5">
            <Calendar size={7} /> {tx.date}
          </span>
          {isPending && (
            <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[7px] font-black uppercase tracking-widest rounded-full border border-amber-200 animate-pulse">
              pending
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ text = "No data yet" }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 bg-white rounded-3xl shadow-clay-inner w-full">
    <div className="w-14 h-14 rounded-2xl bg-accounting-bg flex items-center justify-center shadow-clay-inner">
      <FileText size={20} strokeWidth={2} className="text-accounting-text/20" />
    </div>
    <p className="text-sm font-black text-accounting-text/30 uppercase tracking-tighter">{text}</p>
    <p className="text-[10px] font-black text-accounting-text/20 uppercase tracking-widest max-w-[200px]">
      Information will appear here once entries or tasks are added
    </p>
  </div>
);
