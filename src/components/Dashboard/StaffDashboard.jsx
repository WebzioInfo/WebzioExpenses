import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, CheckCircle2, Clock, AlertCircle, TrendingUp, TrendingDown, Coins, ChevronRight } from 'lucide-react';
import { formatCurrency, cn } from '@/src/lib/utils';
import { Card } from '../ui/Card';
import Button from '../ui/Button';

export const StaffDashboard = ({ user, tasks = [], entries = [], loading }) => {
  const router = useRouter();
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const pending = tasks.filter(t => t.status === 'In Progress').length;
    const today = new Date().toISOString().split('T')[0];
    const delayed = tasks.filter(t => t.status !== 'Completed' && t.dueDate && t.dueDate < today).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Financials
    const income = entries.filter(e => e.type === 'Money In' || e.type === 'Salary').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const expenses = entries.filter(e => e.type === 'Money Out').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const added = entries.filter(e => e.type === 'Added Money').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    return { total, completed, pending, delayed, rate, income, expenses, added };
  }, [tasks, entries]);

  if (loading) return <div className="animate-pulse space-y-6">
    <div className="h-32 bg-[#2D151F]/5 rounded-3xl" />
    <div className="grid grid-cols-3 gap-4">
      <div className="h-40 bg-[#2D151F]/5 rounded-3xl" />
      <div className="h-40 bg-[#2D151F]/5 rounded-3xl" />
      <div className="h-40 bg-[#2D151F]/5 rounded-3xl" />
    </div>
  </div>;

  return (
    <div className="space-y-10 py-6">
      {/* Welcome & Performance Hero */}
      <Card variant="dark" className="p-8 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="text-center md:text-left space-y-2">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Personal Workspace</p>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Hello, <span className="text-emerald-400">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-white/60 font-medium max-w-md">
              You have {stats.pending} tasks in progress and {stats.delayed > 0 ? `${stats.delayed} delayed` : 'no delays'}.
            </p>
          </div>

          {/* Performance Circle */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64" cy="64" r="58"
                fill="transparent"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="12"
              />
              <circle
                cx="64" cy="64" r="58"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={364.4}
                strokeDashoffset={364.4 - (364.4 * stats.rate) / 100}
                strokeLinecap="round"
                className="text-emerald-400 transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{stats.rate}%</span>
              <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Score</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
           <QuickStat label="Assigned" value={stats.total} icon={Briefcase} />
           <QuickStat label="Completed" value={stats.completed} icon={CheckCircle2} />
           <QuickStat label="Pending" value={stats.pending} icon={Clock} />
           <QuickStat label="Delayed" value={stats.delayed} icon={AlertCircle} isWarning={stats.delayed > 0} />
        </div>
      </Card>

      {/* My Work Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-[#2D151F] flex items-center gap-3">
              <Briefcase size={22} strokeWidth={2.5} />
              My Tasks
            </h2>
            <Button variant="ghost" size="sm" icon={ChevronRight} onClick={() => router.push('/tasks')} className="text-emerald-600 hover:text-emerald-700 text-[10px]">View All</Button>
          </div>
          
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <EmptyPlaceholder icon={Briefcase} message="No tasks assigned yet" />
            ) : (
              tasks.slice(0, 5).map(task => (
                <Card key={task.id} className="p-5 flex items-center justify-between group hover:border-[#2D151F]/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shadow-clay-inner shrink-0",
                      task.status === 'Completed' ? "bg-emerald-50 text-emerald-600" : 
                      task.status === 'In Progress' ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                    )}>
                      {task.status === 'Completed' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                    </div>
                    <div>
                      <h4 className="font-black text-[#2D151F] text-sm leading-tight">{task.title}</h4>
                      <p className="text-[10px] font-black text-[#2D151F]/40 uppercase tracking-wider mt-1">
                        Due: {task.dueDate || 'No date'} • {task.priority} Priority
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-clay-inner",
                    task.status === 'Completed' ? "bg-emerald-100 text-emerald-700" : 
                    task.status === 'In Progress' ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                  )}>
                    {task.status}
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* My Money Section */}
        <section className="space-y-6">
          <h2 className="text-xl font-black text-[#2D151F] flex items-center gap-3 px-2">
            <Coins size={22} strokeWidth={2.5} />
            My Money
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FinanceCard label="Total Earnings" amount={stats.income} icon={TrendingUp} variant="success" />
            <FinanceCard label="Total Expenses" amount={stats.expenses} icon={TrendingDown} variant="error" />
            <FinanceCard label="Added Funds" amount={stats.added} icon={Coins} variant="blue" />
            <FinanceCard label="Net Balance" amount={stats.income - stats.expenses} icon={CheckCircle2} variant="warning" />
          </div>

          <div className="mt-8">
            <h3 className="text-xs font-black text-[#2D151F]/40 uppercase tracking-widest px-2 mb-4">Recent Transactions</h3>
            <div className="space-y-3">
              {entries.length === 0 ? (
                <EmptyPlaceholder icon={Coins} message="No financial data available" />
              ) : (
                entries.slice(0, 4).map(entry => (
                  <div key={entry.id} className="flex items-center justify-between p-4 bg-white/40 border border-[#2D151F]/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        entry.type === 'Money Out' ? "bg-red-500" : "bg-emerald-500"
                      )} />
                      <span className="text-xs font-bold text-[#2D151F]">{entry.title}</span>
                    </div>
                    <span className={cn(
                      "text-xs font-black",
                      entry.type === 'Money Out' ? "text-red-600" : "text-emerald-600"
                    )}>
                      {entry.type === 'Money Out' ? '-' : '+'}{formatCurrency(entry.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const QuickStat = ({ label, value, icon: Icon, isWarning }) => (
  <div className={cn(
    "p-4 rounded-2xl bg-white/5 border border-white/10 shadow-clay-inner",
    isWarning && "border-red-400/30 bg-red-400/5 text-red-400"
  )}>
    <div className="flex items-center gap-2 mb-1">
      <Icon size={12} strokeWidth={3} className={cn("text-white/40", isWarning && "text-red-400")} />
      <span className={cn("text-[8px] font-black text-white/40 uppercase tracking-widest", isWarning && "text-red-400/60")}>{label}</span>
    </div>
    <p className="text-xl font-black tracking-tight">{value}</p>
  </div>
);

const FinanceCard = ({ label, amount, icon: Icon, variant }) => {
  const styles = {
    success: "text-emerald-600 bg-emerald-50",
    error: "text-red-500 bg-red-50",
    blue: "text-blue-600 bg-blue-50",
    warning: "text-amber-600 bg-amber-50",
  };
  return (
    <Card className="p-6">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-clay-inner", styles[variant])}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <p className="text-[9px] font-black text-[#2D151F]/40 uppercase tracking-widest leading-none mb-1.5">{label}</p>
      <p className={cn("text-xl font-black tracking-tight", styles[variant].split(' ')[0])}>
        {formatCurrency(amount)}
      </p>
    </Card>
  );
};

const EmptyPlaceholder = ({ icon: Icon, message }) => (
  <div className="flex flex-col items-center justify-center py-10 px-4 bg-white/20 border-2 border-dashed border-[#2D151F]/5 rounded-3xl">
    <Icon size={32} className="text-[#2D151F]/10 mb-3" strokeWidth={1.5} />
    <p className="text-xs font-bold text-[#2D151F]/30">{message}</p>
  </div>
);
