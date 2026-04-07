import React from 'react';
import { TrendingUp, TrendingDown, Coins, Briefcase, AlertCircle, Award, Target, Zap } from 'lucide-react';
import { formatCurrency, cn } from '@/src/lib/utils';
import Card from '../ui/Card';

export const StatsHero = ({ stats }) => {
  if (!stats) return null;

  const isNeg = stats.balance < 0;

  return (
    <div className="space-y-8">
      {/* Total Balance Hero - Strictly High Contrast */}
      <Card className="p-10 relative overflow-hidden border border-accounting-text/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accounting-bg/20 rounded-full -mr-32 -mt-32 -inner pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-accounting-bg/10 rounded-full -ml-20 -mb-20 -inner pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-accounting-text animate-pulse" />
              <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest">Net Business Value</p>
            </div>
            <p className="text-6xl md:text-7xl font-black tracking-tighter text-accounting-text">
              <span className={cn(isNeg ? "text-red-600" : "text-accounting-text")}>
                {formatCurrency(stats.balance)}
              </span>
            </p>
            <p className="text-[11px] font-bold text-secondary-text/60 mt-4 max-w-sm italic">
               Calculated from all accounts including cash, bank, and UPI transfers.
            </p>
          </div>

          {(stats.pendingIn !== 0 || stats.pendingOut !== 0) && (
            <div className="flex flex-col gap-3 bg-accounting-bg/40 p-6 rounded-3xl border border-white -inner backdrop-blur-md min-w-[260px] shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Target size={14} className="text-accounting-text/40" />
                <p className="text-[9px] font-black text-accounting-text/40 uppercase tracking-widest">Unrealized Revenue</p>
              </div>
              <div className="flex justify-between items-center text-sm font-black">
                <span className="text-secondary-text">Receivables:</span>
                <span className="text-emerald-600">+{formatCurrency(stats.pendingIn)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-black">
                <span className="text-secondary-text">Payables:</span>
                <span className="text-red-500">-{formatCurrency(stats.pendingOut)}</span>
              </div>
              <div className="h-px bg-accounting-text/5 my-1" />
              <div className="flex justify-between items-center text-sm font-black">
                <span className="text-accounting-text">Expected:</span>
                <span className={cn(stats.pending >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                  {stats.pending >= 0 ? '+' : ''}{formatCurrency(stats.pending)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 relative z-10">
          {[
            { label: 'Flow In', value: stats.moneyIn + stats.addedMoney, color: 'text-emerald-600', icon: TrendingUp },
            { label: 'Flow Out', value: stats.moneyOut, color: 'text-red-500', icon: TrendingDown },
            { label: 'Team Cost', value: stats.salary, color: 'text-accounting-text', icon: Briefcase },
          ].map(s => (
            <div key={s.label} className="p-5 bg-accounting-bg/30 rounded-2xl border border-white -inner flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-accounting-text/5">
                 <s.icon size={16} strokeWidth={3} className={s.color} />
              </div>
              <div>
                <p className="text-[8px] font-black text-secondary-text uppercase tracking-widest leading-none mb-1">{s.label}</p>
                <p className={cn("text-lg font-black tracking-tighter", s.color)}>{formatCurrency(s.value)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* CRM & ERP Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Projects" value={stats.totalProjects} icon={LayoutGrid} variant="plum" isCount={true} />
        <StatCard label="Team" value={stats.totalStaff} icon={Users} variant="plum" isCount={true} />
        <StatCard label="Tasks" value={stats.totalTasks} icon={Zap} variant="plum" isCount={true} />
        <StatCard label="Overdue" value={stats.delayedTasks} icon={AlertCircle} variant="error" isCount={true} />
        <StatCard label="Rate" value={stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) + '%' : '0%'} icon={Award} variant="success" isCount={true} />
      </div>

      {/* Financial Breakdown Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Earnings" value={stats.moneyIn} icon={TrendingUp} variant="success" />
        <StatCard label="Expenses" value={stats.moneyOut} icon={TrendingDown} variant="error" />
        <StatCard label="Investments" value={stats.addedMoney} icon={Coins} variant="plum" />
        <StatCard label="Salaries" value={stats.salary} icon={Briefcase} variant="plum" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} variant="warning" isNet={true} />
      </div>
    </div>
  );
};

import { LayoutGrid, Users, Clock } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, variant, isNet, isCount }) => {
  const styles = {
    success: { color: 'text-emerald-600', bg: 'bg-emerald-50' },
    error: { color: 'text-red-500', bg: 'bg-red-50' },
    plum: { color: 'text-accounting-text', bg: 'bg-accounting-bg/40' },
    warning: { color: 'text-amber-600', bg: 'bg-amber-100/30' },
  };

  const activeStyle = styles[variant] || styles.plum;

  return (
    <Card className="text-left py-6 px-5 border border-transparent hover:border-accounting-text/5 transition-all">
      <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center mb-4 -inner transition-transform group-hover:scale-110', activeStyle.bg)}>
        <Icon size={18} strokeWidth={3} className={activeStyle.color} />
      </div>
      <p className="text-[9px] font-black text-secondary-text uppercase tracking-widest leading-none">{label}</p>
      <p className={cn('text-2xl font-black tracking-tighter mt-2 leading-none', activeStyle.color)}>
        {isCount ? value : (isNet && value > 0 ? '+' : '') + formatCurrency(value)}
      </p>
    </Card>
  );
};
