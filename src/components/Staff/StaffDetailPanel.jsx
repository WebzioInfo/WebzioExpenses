'use client';

import React, { useMemo } from 'react';
import {
  X, Briefcase, Coins, TrendingDown, TrendingUp, User,
  Calendar, CreditCard, FileText, Hash, ArrowUpRight, ArrowDownRight, CheckCircle2, Zap, Target
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/src/lib/utils';
import { ENTRY_TYPES, ENTRY_STATUS } from '@/src/lib/constants';
import Button from '../ui/Button';
import Card from '../ui/Card';

const ROLE_STYLES = {
  Admin: { badge: 'bg-purple-50 text-purple-700 border-purple-100', avatar: 'bg-purple-600' },
  Staff: { badge: 'bg-blue-50 text-blue-700 border-blue-100', avatar: 'bg-blue-600' },
  Freelancer: { badge: 'bg-amber-50 text-amber-700 border-amber-100', avatar: 'bg-amber-600' },
};

const TYPE_META = {
  [ENTRY_TYPES.MONEY_IN]: { color: 'text-emerald-600', bg: 'bg-emerald-50', sign: '+', icon: TrendingUp },
  [ENTRY_TYPES.MONEY_OUT]: { color: 'text-red-500', bg: 'bg-red-50', sign: '-', icon: TrendingDown },
  [ENTRY_TYPES.ADDED_MONEY]: { color: 'text-blue-600', bg: 'bg-blue-50', sign: '+', icon: Coins },
  [ENTRY_TYPES.SALARY]: { color: 'text-amber-600', bg: 'bg-amber-50', sign: '-', icon: Briefcase },
  Transfer: { color: 'text-purple-600', bg: 'bg-purple-50', sign: '↔', icon: ArrowUpRight },
};

const TaskRow = ({ task }) => {
  const isDelayed = task.status !== 'Completed' && task.dueDate && task.dueDate < new Date().toISOString().split('T')[0];
  const statusConfig = {
    'Completed': { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircle2 },
    'In Progress': { bg: 'bg-blue-50', text: 'text-blue-600', icon: Zap },
    'Not Started': { bg: 'bg-accounting-bg text-secondary-text/30', text: 'text-secondary-text/40', icon: Target },
    'Delayed': { bg: 'bg-red-50', text: 'text-red-600', icon: AlertCircle },
  };

  const config = statusConfig[isDelayed ? 'Delayed' : task.status] || statusConfig['Not Started'];

  return (
    <Card className="flex items-center justify-between p-5 border border-transparent hover:border-accounting-text/5 shadow-none hover:shadow-xl transition-all">
      <div className="flex items-center gap-4 min-w-0">
        <div className={cn(
          'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 -inner border border-white',
          config.bg, config.text
        )}>
          <config.icon size={16} strokeWidth={3} />
        </div>
        <div className="min-w-0">
          <p className="font-black text-accounting-text text-sm tracking-tight leading-none truncate">{task.title}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[8px] font-black text-secondary-text/40 uppercase tracking-widest">{task.projectName || 'Internal System'}</span>
            <span className="w-1 h-1 rounded-full bg-accounting-text/10" />
            <span className={cn('text-[8px] font-black uppercase tracking-widest', isDelayed ? 'text-red-500' : 'text-secondary-text/40')}>
              {isDelayed ? 'Overdue Directive' : task.status}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right shrink-0 ml-3">
        <span className={cn(
          'text-[7px] font-black uppercase px-2 py-1 rounded-lg border -inner shadow-sm',
          task.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-accounting-bg/40 text-secondary-text/30 border-white'
        )}>
          {task.priority} Priority
        </span>
      </div>
    </Card>
  );
};

export const StaffDetailPanel = ({ person, entries = [], tasks = [], onClose }) => {
  const [activeTab, setActiveTab] = React.useState('finance');
  const isOpen = !!person;

  const staffTx = useMemo(() => {
    if (!person) return [];
    return entries
      .filter(e => e.personId === person.id || String(e.personId) === String(person.id))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [person, entries]);

  const staffTasks = useMemo(() => {
    if (!person) return [];
    return tasks.filter(t => t.assignedTo === person.id || String(t.assignedTo) === String(person.id));
  }, [person, tasks]);

  const stats = useMemo(() => {
    const sum = (arr) => arr.reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const completed = staffTasks.filter(t => t.status === 'Completed').length;
    const total = staffTasks.length;
    return {
      salary: sum(staffTx.filter(t => t.type === ENTRY_TYPES.SALARY)),
      moneyOut: sum(staffTx.filter(t => t.type === ENTRY_TYPES.MONEY_OUT)),
      addedMoney: sum(staffTx.filter(t => t.type === ENTRY_TYPES.ADDED_MONEY)),
      moneyIn: sum(staffTx.filter(t => t.type === ENTRY_TYPES.MONEY_IN)),
      totalTx: staffTx.length,
      paidTx: staffTx.filter(t => t.status === ENTRY_STATUS.PAID).length,
      pendingTx: staffTx.filter(t => t.status === ENTRY_STATUS.PENDING).length,
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
      <div
        className={cn(
          'fixed inset-0 z-100 bg-accounting-text/20 backdrop-blur-sm transition-all duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          'fixed top-0 right-0 h-full z-110 w-full max-w-xl bg-accounting-bg flex flex-col',
          'transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          '-outer shadow-[-30px_0_60px_-15px_rgba(45,21,31,0.1)]',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {!person ? null : (
          <>
            <div className="relative bg-accounting-text p-10 pb-12 shrink-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-20 -translate-y-20 blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <div className={cn(
                    'w-16 h-16 rounded-3xl flex items-center justify-center text-white text-2xl font-black',
                    '-inner border border-white/20 shadow-xl',
                    roleStyle.avatar
                  )}>
                    {initials}
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-black text-white tracking-tighter leading-none">{person.name}</h2>
                    <div className="flex items-center gap-3">
                      <span className={cn('px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border', roleStyle.badge)}>
                        {role}
                      </span>
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest italic">{person.email || 'No registry email'}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  icon={X}
                  className="w-11 h-11 p-0 text-white/30 hover:text-white hover:bg-white/10 border border-white/10 rounded-2xl"
                />
              </div>

              {person.note && (
                <p className="relative z-10 mt-8 text-[11px] text-white/40 italic border-l-2 border-white/10 pl-4 leading-relaxed max-w-md">
                  {person.note}
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pb-12">
              <div className="px-8 -mt-6 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <SummaryTile label="Settled Salary" value={stats.salary} color="text-amber-600" bg="bg-amber-50" icon={Briefcase} />
                  <SummaryTile label="Operational Outflow" value={stats.moneyOut} color="text-red-500" bg="bg-red-50" icon={TrendingDown} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-xl border border-accounting-text/5">
                    <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest leading-none">Operational Efficiency</p>
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(45,21,31,0.05)" strokeWidth="8" />
                        <circle cx="48" cy="48" r="42" fill="none" stroke="currentColor" strokeWidth="8"
                          strokeDasharray={264}
                          strokeDashoffset={264 - (264 * stats.performance) / 100}
                          strokeLinecap="round"
                          className={cn('transition-all duration-1000', stats.performance > 80 ? 'text-emerald-500' : stats.performance > 50 ? 'text-blue-500' : 'text-amber-500')}
                        />
                      </svg>
                      <span className="absolute text-2xl font-black text-accounting-text tracking-tighter">{stats.performance}%</span>
                    </div>
                  </Card>
                  
                  <Card className="p-8 flex flex-col justify-between shadow-xl border border-accounting-text/5">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest leading-none">Directive Completion</p>
                      <p className="text-4xl font-black text-accounting-text tracking-tighter">
                        {stats.completedTasks}
                        <span className="text-base text-secondary-text/30 ml-2 font-black uppercase tracking-tight">/ {stats.totalTasks}</span>
                      </p>
                    </div>
                    <div className="flex gap-4 pt-4 border-t border-accounting-bg/50">
                      <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-600">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Finalized
                      </span>
                      <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-blue-600">
                         <div className="w-2 h-2 rounded-full bg-blue-500" /> Pending
                      </span>
                    </div>
                  </Card>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-2 p-1.5 bg-accounting-bg/40 rounded-3xl -inner border border-white">
                    <button
                      onClick={() => setActiveTab('finance')}
                      className={cn(
                        'flex-1 py-3 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all',
                        activeTab === 'finance' ? 'bg-white text-accounting-text shadow-sm' : 'text-secondary-text/40 hover:text-accounting-text'
                      )}
                    >
                      Fiscal Ledger
                    </button>
                    <button
                      onClick={() => setActiveTab('tasks')}
                      className={cn(
                        'flex-1 py-3 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all',
                        activeTab === 'tasks' ? 'bg-white text-accounting-text shadow-sm' : 'text-secondary-text/40 hover:text-accounting-text'
                      )}
                    >
                      Directive Matrix
                    </button>
                  </div>

                  <div className="space-y-4">
                    {activeTab === 'finance' ? (
                      staffTx.length === 0 ? <EmptyState text="Zero fiscal activity recorded" /> : staffTx.map((tx, j) => <TxRow key={tx.id || j} tx={tx} />)
                    ) : (
                      staffTasks.length === 0 ? <EmptyState text="No operational directives found" /> : staffTasks.map((task, k) => <TaskRow key={task.id || k} task={task} />)
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

const SummaryTile = ({ label, value, color, bg, icon: Icon }) => (
  <Card className={cn('flex items-center gap-4 p-5 shadow-xl border border-accounting-text/5')}>
    <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 -inner border border-white', bg)}>
      <Icon size={16} strokeWidth={3} className={color} />
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-black text-secondary-text/40 uppercase tracking-widest truncate leading-none mb-2">{label}</p>
      <p className={cn('text-xl font-black tracking-tighter leading-none', color)}>{formatCurrency(value)}</p>
    </div>
  </Card>
);

const TxRow = ({ tx }) => {
  const meta = TYPE_META[tx.type] || { color: 'text-accounting-text', bg: 'bg-accounting-bg/40', sign: '', icon: FileText };
  const Icon = meta.icon;
  const isPending = tx.status === ENTRY_STATUS.PENDING;

  return (
    <Card className="group flex items-center justify-between p-5 border border-transparent hover:border-accounting-text/5 shadow-none hover:shadow-2xl transition-all">
      <div className="flex items-center gap-5 min-w-0">
        <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 -inner border border-white', meta.bg)}>
          <Icon size={18} strokeWidth={3} className={meta.color} />
        </div>
        <div className="min-w-0">
          <p className="font-black text-accounting-text text-base tracking-tight leading-none truncate group-hover:translate-x-0.5 transition-transform">
            {tx.title}
          </p>
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            <span className="text-[8px] font-black text-secondary-text/40 uppercase tracking-widest">{tx.type}</span>
            <span className="w-1 h-1 rounded-full bg-accounting-text/10" />
            <span className="text-[8px] font-black text-secondary-text/40 uppercase tracking-widest flex items-center gap-1.5">
              <CreditCard size={9} strokeWidth={3} /> {tx.account || 'Direct Settlement'}
            </span>
          </div>
        </div>
      </div>

      <div className="text-right shrink-0 ml-4">
        <p className={cn('font-black text-lg tracking-tighter leading-none', meta.color)}>
          {meta.sign}{formatCurrency(parseFloat(tx.amount))}
        </p>
        <div className="flex items-center justify-end gap-3 mt-2">
           {isPending && (
            <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[7px] font-black uppercase tracking-widest rounded-lg border border-amber-100 animate-pulse">
              In Verification
            </span>
          )}
          <span className="text-[8px] font-bold text-secondary-text/30 flex items-center gap-1.5">
            <Calendar size={9} strokeWidth={3} /> {formatDate(tx.date)}
          </span>
        </div>
      </div>
    </Card>
  );
};

const EmptyState = ({ text = "System matrix is empty" }) => (
  <Card className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40 shadow-none border-2 border-dashed bg-transparent">
    <div className="w-16 h-16 rounded-3xl bg-accounting-bg/40 flex items-center justify-center -inner border border-white">
      <FileText size={24} strokeWidth={1.5} />
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase tracking-widest">{text}</p>
      <p className="text-[9px] font-bold italic max-w-[200px]">Strategic data will appear here once systemic events are finalized.</p>
    </div>
  </Card>
);

import { AlertCircle } from 'lucide-react';
