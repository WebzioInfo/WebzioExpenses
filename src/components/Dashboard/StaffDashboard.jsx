'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  ChevronRight,
  Zap,
  Award,
  Wallet,
  History,
  Target
} from 'lucide-react';
import { formatCurrency, cn } from '@/src/lib/utils';
import Card from '../ui/Card';
import Button from '../ui/Button';

export const StaffDashboard = ({ user, tasks = [], entries = [], loading }) => {
  const router = useRouter();
  
  const stats = useMemo(() => {
    const activeTasks = tasks.filter(t => t.isActive !== false);
    const total = activeTasks.length;
    const completed = activeTasks.filter(t => t.status === 'Completed').length;
    const pending = activeTasks.filter(t => t.status === 'In Progress').length;
    const today = new Date().toISOString().split('T')[0];
    const delayed = activeTasks.filter(t => t.status !== 'Completed' && t.dueDate && t.dueDate < today).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const myEntries = entries.filter(e => e.personId === user?.staffId);
    
    // Earnings for staff: Salary + Money Out (paid to them)
    const income = myEntries.filter(e => e.type === 'Salary' || e.type === 'Money Out').reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
    const added = myEntries.filter(e => e.type === 'Added Money' || e.type === 'Money In').reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
    const expenses = 0; 

    return { total, completed, pending, delayed, rate, income, expenses, added };
  }, [tasks, entries, user?.staffId]);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
       <div className="w-10 h-10 border-4 border-accounting-text/10 border-t-accounting-text rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-10 py-6">
      {/* Welcome & Performance Hero */}
      <Card className="p-10 relative overflow-hidden border border-accounting-text/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accounting-bg/40 rounded-full -mr-32 -mt-32 -inner pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
          <div className="text-center md:text-left space-y-4 flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest">Active Workspace</p>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-accounting-text tracking-tighter leading-none">
              Hello, <span className="opacity-40">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-secondary-text text-sm font-bold max-w-md leading-relaxed italic">
              Your workflow is at <span className="text-emerald-600">{stats.rate}% efficiency</span> with {stats.pending} active goals currently in progress.
            </p>
          </div>

          <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="72" fill="transparent" stroke="rgba(45,21,31,0.05)" strokeWidth="14" />
              <circle cx="80" cy="80" r="72" fill="transparent" stroke="currentColor" strokeWidth="14"
                strokeDasharray={452.4} strokeDashoffset={452.4 - (452.4 * stats.rate) / 100}
                strokeLinecap="round" className="text-accounting-text transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-accounting-text tracking-tighter">{stats.rate}%</span>
              <span className="text-[9px] font-black text-secondary-text/40 uppercase tracking-widest">Score</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 relative z-10">
          <QuickStat label="Assigned" value={stats.total} icon={Target} color="text-accounting-text" />
          <QuickStat label="Completed" value={stats.completed} icon={CheckCircle2} color="text-emerald-600" />
          <QuickStat label="In Transit" value={stats.pending} icon={Zap} color="text-blue-600" />
          <QuickStat label="Overdue" value={stats.delayed} icon={AlertCircle} color={stats.delayed > 0 ? "text-red-500" : "text-secondary-text/30"} isWarning={stats.delayed > 0} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
               <Briefcase size={16} className="text-accounting-text" strokeWidth={3} />
               <h3 className="text-[10px] font-black text-secondary-text uppercase tracking-widest leading-none">Operational Directives</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/tasks')} className="h-8 text-[9px]">
               View Registry <ChevronRight size={10} className="ml-1" strokeWidth={3} />
            </Button>
          </div>

          <div className="space-y-4">
            {tasks.length === 0 ? (
              <EmptyPlaceholder icon={Briefcase} message="No directives found in the system matrix." />
            ) : (
              tasks.slice(0, 5).map(task => (
                <Card key={task.id} className="p-6 flex items-center justify-between group border border-transparent hover:border-accounting-text/5">
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center -inner border border-white",
                      task.status === 'Completed' ? "bg-emerald-50 text-emerald-600" :
                        task.status === 'In Progress' ? "bg-blue-50 text-blue-600" : "bg-accounting-bg text-secondary-text/30"
                    )}>
                      {task.status === 'Completed' ? <CheckCircle2 size={18} strokeWidth={3} /> : <Zap size={18} strokeWidth={3} />}
                    </div>
                    <div>
                      <h4 className="font-black text-accounting-text text-sm tracking-tight leading-none group-hover:translate-x-1 transition-transform">{task.title}</h4>
                      <p className="text-[9px] font-black text-secondary-text/40 uppercase tracking-widest mt-2">
                        Deadline: {task.dueDate || 'Open'} • {task.priority} Priority
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border -inner shadow-sm",
                    task.status === 'Completed' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                      task.status === 'In Progress' ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-accounting-bg text-secondary-text/50 border-white"
                  )}>
                    {task.status}
                  </span>
                </Card>
              ))
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-2 px-2">
             <Wallet size={16} className="text-accounting-text" strokeWidth={3} />
             <h3 className="text-[10px] font-black text-secondary-text uppercase tracking-widest leading-none">Financial Settlement</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FinanceStat label="Total Payouts" value={stats.income} icon={TrendingUp} variant="success" />
            <FinanceStat label="Net Receivable" value={stats.income - stats.expenses} icon={Award} variant="plum" />
          </div>

          <div className="mt-10">
            <div className="flex items-center justify-between px-2 mb-4">
               <p className="text-[9px] font-black text-secondary-text/40 uppercase tracking-widest">Recent ledger entries</p>
               <History size={12} className="text-secondary-text/20" />
            </div>
            <div className="space-y-2">
              {entries.length === 0 ? (
                <EmptyPlaceholder icon={Coins} message="No fiscal records available." />
              ) : (
                entries.slice(0, 4).map(entry => (
                  <Card key={entry.id} className="flex items-center justify-between p-4 border border-transparent hover:border-accounting-text/5">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-1.5 h-6 rounded-full",
                        (entry.type === 'Money Out' || entry.type === 'Salary' || entry.type === 'Money In' || entry.type === 'Added Money') ? "bg-emerald-500" : "bg-red-500"
                      )} />
                      <span className="text-xs font-black text-accounting-text tracking-tight">{entry.title}</span>
                    </div>
                    <span className={cn(
                      "text-sm font-black tracking-tighter",
                      (entry.type === 'Money Out' || entry.type === 'Salary' || entry.type === 'Money In' || entry.type === 'Added Money') ? "text-emerald-600" : "text-red-500"
                    )}>
                      {(entry.type === 'Money Out' || entry.type === 'Salary' || entry.type === 'Money In' || entry.type === 'Added Money') ? '+' : '-'}{formatCurrency(entry.amount)}
                    </span>
                  </Card>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const QuickStat = ({ label, value, icon: Icon, color, isWarning }) => (
  <div className={cn(
    "p-5 rounded-3xl bg-accounting-bg/30 border border-white -inner transition-all",
    isWarning && "border-red-100 bg-red-50 shadow-lg shadow-red-100/50"
  )}>
    <div className="flex items-center gap-2 mb-2">
      <Icon size={12} strokeWidth={3} className={cn("opacity-40", isWarning ? "text-red-500" : color)} />
      <span className={cn("text-[9px] font-black uppercase tracking-widest opacity-40", isWarning && "text-red-700")}>{label}</span>
    </div>
    <p className={cn("text-3xl font-black tracking-tighter leading-none", isWarning ? "text-red-600" : color)}>{value}</p>
  </div>
);

const FinanceStat = ({ label, value, icon: Icon, variant }) => {
  const styles = {
    success: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    plum: 'text-accounting-text bg-accounting-bg/40 border-accounting-text/10',
  };
  return (
    <Card className="p-8 border border-transparent hover:border-accounting-text/5 group">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 -inner border border-white group-hover:scale-110 transition-transform", styles[variant].split(' ')[1])}>
        <Icon size={20} strokeWidth={3} className={styles[variant].split(' ')[0]} />
      </div>
      <p className="text-[10px] font-black text-secondary-text/40 uppercase tracking-widest leading-none mb-2">{label}</p>
      <p className={cn("text-3xl font-black tracking-tighter leading-none", styles[variant].split(' ')[0])}>
        {formatCurrency(value)}
      </p>
    </Card>
  );
};

const EmptyPlaceholder = ({ icon: Icon, message }) => (
  <Card className="flex flex-col items-center justify-center py-16 text-center space-y-4 opacity-30 border-2 border-dashed bg-transparent shadow-none">
    <Icon size={32} strokeWidth={1.5} />
    <p className="text-[10px] font-black uppercase tracking-widest italic leading-relaxed px-10">{message}</p>
  </Card>
);
