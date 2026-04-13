'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Zap,
  Wallet,
  History,
  Target,
  ChevronRight,
  Target as ObjectiveIcon,
  Briefcase
} from 'lucide-react';
import { formatCurrency, cn } from '@/src/lib/utils';
import Card from '../ui/Card';
import Button from '../ui/Button';

export const StaffDashboard = ({ user, tasks = [], entries = [], loading }) => {
  const router = useRouter();
  
  const stats = useMemo(() => {
    const activeTasks = tasks.filter(t => t.isActive !== false);
    const total = activeTasks.length;
    const completed = activeTasks.filter(t => t.status === 'Completed' || t.status === 'Approved').length;
    const today = new Date().toISOString().split('T')[0];
    const delayed = activeTasks.filter(t => t.status !== 'Completed' && t.status !== 'Approved' && t.dueDate && t.dueDate < today).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const myEntries = entries.filter(e => String(e.personId) === String(user?.staffId));
    const income = myEntries.filter(e => e.type === 'Salary' || e.type === 'Money Out' || e.type === 'Money In' || e.type === 'Added Money').reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

    return { total, completed, delayed, rate, income, active: activeTasks.filter(t => t.status === 'In Progress').length };
  }, [tasks, entries, user?.staffId]);

  if (loading) return <div className="py-20 text-center font-black animate-pulse uppercase tracking-widest text-secondary-text/20">Accessing Personal Matrix...</div>;

  return (
    <div className="space-y-10 py-6">
      {/* Welcome Hero */}
      <Card className="p-10 relative overflow-hidden shadow-2xl border border-accounting-text/5 bg-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accounting-bg/40 rounded-full -mr-40 -mt-40 -inner pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row justify-between items-center gap-12 relative z-10">
          <div className="text-center lg:text-left space-y-5 flex-1">
            <div className="flex items-center justify-center lg:justify-start gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-[10px] font-black text-secondary-text/30 uppercase tracking-[0.3em]">Personal Intelligence Portal</p>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-accounting-text tracking-tighter leading-none">
              Hello, <span className="opacity-30">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-secondary-text/60 text-sm font-bold max-w-sm leading-relaxed italic">
              Executing at <span className="text-indigo-600">{stats.rate}% efficiency</span> with {stats.active} mission-critical objectives in active progress.
            </p>
          </div>

          <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
             <div className="absolute inset-0 rounded-full bg-accounting-bg/40 -inner border border-white" />
             <svg className="w-full h-full transform -rotate-90 relative z-10">
                <circle cx="96" cy="96" r="84" fill="transparent" stroke="rgba(45,21,31,0.03)" strokeWidth="16" />
                <circle cx="96" cy="96" r="84" fill="transparent" stroke="#2D151F" strokeWidth="16"
                  strokeDasharray={527} strokeDashoffset={527 - (527 * stats.rate) / 100}
                  strokeLinecap="round" className="transition-all duration-1000 ease-out" />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <span className="text-4xl font-black text-accounting-text tracking-tighter">{stats.rate}%</span>
                <span className="text-[9px] font-black text-secondary-text/40 uppercase tracking-widest">Efficiency</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 relative z-10">
          <HeroTile label="Assigned" value={stats.total} icon={Target} color="indigo" />
          <HeroTile label="Completed" value={stats.completed} icon={CheckCircle2} color="emerald" />
          <HeroTile label="In Flight" value={stats.active} icon={Zap} color="blue" />
          <HeroTile label="Overdue" value={stats.delayed} icon={AlertCircle} color="rose" warning={stats.delayed > 0} />
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Left Column: Tasks */}
        <section className="xl:col-span-7 space-y-6">
           <div className="flex items-center justify-between px-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-text/40 flex items-center gap-2">
                 <ObjectiveIcon size={14} /> My Active Objectives
              </p>
              <Button variant="ghost" size="sm" onClick={() => router.push('/tasks')} className="text-[9px] h-8">Registry View</Button>
           </div>
           
           <div className="space-y-4">
              {tasks.length === 0 ? (
                <EmptyState icon={Briefcase} message="No objectives currently assigned to your profile." />
              ) : (
                tasks.slice(0, 5).map(task => <DashboardTask key={task.id} task={task} />)
              )}
           </div>
        </section>

        {/* Right Column: Earnings & Activity */}
        <section className="xl:col-span-5 space-y-8">
           <div className="space-y-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-text/40 flex items-center gap-2 px-2">
                 <Wallet size={14} /> My Net Earnings
              </p>
              <Card className="p-8 space-y-2 border border-accounting-text/5 shadow-xl bg-white group overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 -inner border border-white opacity-0 group-hover:opacity-100 transition-opacity" />
                 <p className="text-[10px] font-black text-secondary-text/20 uppercase tracking-widest leading-none">Aggregated Settlements</p>
                 <p className="text-5xl font-black text-accounting-text tracking-tighter transition-transform group-hover:translate-x-1">{formatCurrency(stats.income)}</p>
                 <div className="pt-4 flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-emerald-600 opacity-60">
                    <History size={12} /> View Full Payout Ledger
                 </div>
              </Card>
           </div>

           <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-text/40 flex items-center gap-2 px-2">
                 <History size={14} /> My Activity Entry
              </p>
              <div className="space-y-2">
                {entries.length === 0 ? (
                  <EmptyState icon={History} message="No recent activity recorded." />
                ) : (
                  entries.slice(0, 4).map(entry => <SimpleEntry key={entry.id} entry={entry} />)
                )}
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

function HeroTile({ label, value, icon: Icon, color, warning }) {
  return (
    <div className={cn(
      "p-6 rounded-3xl bg-accounting-bg/30 border border-white -inner transition-all",
      warning && "border-rose-100 bg-rose-50 shadow-xl shadow-rose-900/5 animate-shiver"
    )}>
      <div className="flex items-center gap-2.5 mb-3 opacity-30">
        <Icon size={14} strokeWidth={3} className={cn(warning && "text-rose-600")} />
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className={cn("text-3xl font-black tracking-tighter leading-none text-accounting-text", warning && "text-rose-600")}>{value}</p>
    </div>
  );
}

function DashboardTask({ task }) {
  const isDone = task.status === 'Completed' || task.status === 'Approved';
  return (
    <Card className="p-5 flex items-center justify-between group border border-transparent hover:border-accounting-text/5 transition-all">
       <div className="flex items-center gap-5 min-w-0">
          <div className={cn(
            "w-11 h-11 rounded-2xl flex items-center justify-center -inner border border-white shrink-0",
            isDone ? "bg-emerald-50 text-emerald-600" : (task.status === 'In Progress' ? "bg-blue-50 text-blue-600" : "bg-accounting-bg text-secondary-text/20")
          )}>
            {isDone ? <CheckCircle2 size={18} strokeWidth={3} /> : <Zap size={18} strokeWidth={3} />}
          </div>
          <div className="min-w-0">
             <h4 className="font-extrabold text-accounting-text text-[13px] uppercase tracking-tight group-hover:translate-x-1 transition-transform truncate">{task.title}</h4>
             <p className="text-[8px] font-black text-secondary-text/30 uppercase tracking-[0.2em] mt-1.5">{task.priority} Priority • {task.dueDate ? formatDate(task.dueDate) : 'No Deadline'}</p>
          </div>
       </div>
       <ChevronRight size={14} strokeWidth={3} className="text-secondary-text/20 group-hover:translate-x-1 transition-transform" />
    </Card>
  );
}

function SimpleEntry({ entry }) {
  const isInflow = ['Money In', 'Added Money', 'Salary', 'Money Out'].includes(entry.type);
  return (
    <Card className="p-4 flex items-center justify-between border border-transparent hover:border-accounting-text/5 transition-all">
       <div className="flex items-center gap-4 min-w-0">
          <div className={cn("w-1.5 h-6 rounded-full shrink-0", isInflow ? "bg-emerald-500" : "bg-rose-500")} />
          <span className="text-[11px] font-black text-accounting-text uppercase truncate">{entry.title}</span>
       </div>
       <span className={cn("text-[13px] font-black tracking-tighter", isInflow ? "text-emerald-600" : "text-rose-500")}>
          {isInflow ? '+' : '-'}{formatCurrency(entry.amount)}
       </span>
    </Card>
  );
}

function EmptyState({ icon: Icon, message }) {
  return (
    <Card className="py-14 flex flex-col items-center justify-center text-center opacity-20 border-2 border-dashed bg-transparent shadow-none space-y-4">
       <Icon size={24} strokeWidth={2} />
       <p className="text-[9px] font-black uppercase tracking-widest">{message}</p>
    </Card>
  );
}
