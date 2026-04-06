import React from 'react';
import { TrendingUp, TrendingDown, Coins, Briefcase, AlertCircle } from 'lucide-react';
import { formatCurrency, cn } from '@/src/lib/utils';
import { Card } from '../ui/Card';

export const StatsHero = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="space-y-10">
      {/* Total Balance Hero */}
      <Card variant="dark" className="p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/3 rounded-full -ml-10 -mb-10" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] mb-3">Total Balance (Paid)</p>
            <p className="text-6xl font-black tracking-tighter">
              <span className={stats.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {formatCurrency(stats.balance)}
              </span>
            </p>
          </div>

          {(stats.pendingIn !== 0 || stats.pendingOut !== 0) && (
            <div className="flex flex-col gap-2 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm min-w-[200px]">
              <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Unrealized (Pending)</p>
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-white/40">Inflow:</span>
                <span className="text-emerald-400">+{formatCurrency(stats.pendingIn)}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-white/40">Outflow:</span>
                <span className="text-red-400">-{formatCurrency(stats.pendingOut)}</span>
              </div>
              <div className="h-px bg-white/10 my-1" />
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-white/60">Net Pending:</span>
                <span className={stats.pending >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {stats.pending >= 0 ? '+' : ''}{formatCurrency(stats.pending)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 relative z-10">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 shadow-clay-inner">
            <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Money In</p>
            <p className="text-xl font-black text-emerald-400">{formatCurrency(stats.moneyIn + stats.addedMoney)}</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 shadow-clay-inner">
            <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Money Out</p>
            <p className="text-xl font-black text-red-500">{formatCurrency(stats.moneyOut)}</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 shadow-clay-inner">
            <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Salary</p>
            <p className="text-xl font-black text-amber-400">{formatCurrency(stats.salary)}</p>
          </div>
        </div>
      </Card>

      {/* CRM & ERP Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
        <StatCard label="Active Projects" value={stats.totalProjects} icon={Briefcase} variant="blue" isCount={true} />
        <StatCard label="Team Members" value={stats.totalStaff} icon={TrendingUp} variant="success" isCount={true} />
        <StatCard label="Total Tasks" value={stats.totalTasks} icon={Coins} variant="pending" isCount={true} />
        <StatCard label="Delayed" value={stats.delayedTasks} icon={AlertCircle} variant="error" isCount={true} />
        <StatCard label="Success Rate" value={stats.totalTasks > 0 ? Math.round((stats.completedTasks/stats.totalTasks)*100) + '%' : '0%'} icon={TrendingUp} variant="success" isCount={true} />
      </div>

      {/* Stat Cards Breakdown (Financial) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Earnings" value={stats.moneyIn} icon={TrendingUp} variant="success" />
        <StatCard label="Expenses" value={stats.moneyOut} icon={TrendingDown} variant="error" />
        <StatCard label="Invested" value={stats.addedMoney} icon={Coins} variant="blue" />
        <StatCard label="Salaries" value={stats.salary} icon={Briefcase} variant="warning" />
        <StatCard label="Pending" value={stats.pending} icon={AlertCircle} variant="pending" isNet={true} />
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, variant, isNet, isCount }) => {
  const styles = {
    success: { color: 'text-emerald-600', bg: 'bg-emerald-50' },
    error: { color: 'text-red-500', bg: 'bg-red-50' },
    blue: { color: 'text-blue-600', bg: 'bg-blue-50' },
    warning: { color: 'text-amber-600', bg: 'bg-amber-50' },
    pending: { color: 'text-purple-600', bg: 'bg-purple-50' },
  };

  return (
    <Card className="text-left py-6">
      <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center mb-4 shadow-clay-inner', styles[variant].bg)}>
        <Icon size={18} strokeWidth={2.5} className={styles[variant].color} />
      </div>
      <p className="text-[9px] font-black text-accounting-text/60 uppercase tracking-widest leading-none">{label}</p>
      <p className={cn('text-2xl font-black tracking-tighter mt-1.5', styles[variant].color)}>
        {isCount ? value : (isNet && value > 0 ? '+' : '') + formatCurrency(value)}
      </p>
    </Card>
  );
};
