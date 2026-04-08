import React, { useMemo } from 'react';
import { useStats } from '@/src/hooks/useStats';
import { DashboardHeader } from './Header';
import { StatsHero } from './StatsHero';
import { AccountBalances } from './AccountBalances';
import { RecentTransactions } from './RecentTransactions';
import { AlertCircle } from 'lucide-react';
import { formatCurrency, cn } from '@/src/lib/utils';
import Card from '../ui/Card';

export const AdminDashboard = ({ user, entries = [], projects = [], staff = [], tasks = [], isFounder }) => {
  const stats = useStats(entries);

  const crmStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      totalProjects: projects.length,
      totalStaff: staff.length,
      totalTasks: tasks.length,
      delayedTasks: tasks.filter(t => t.status !== 'Completed' && t.status !== 'Approved' && t.dueDate && t.dueDate < today).length,
      completedTasks: tasks.filter(t => t.status === 'Completed' || t.status === 'Approved').length,
    };
  }, [projects, staff, tasks]);

  const combinedStats = { ...stats, ...crmStats };

  const recentEntries = useMemo(() =>
    entries.slice(0, 8),
    [entries]
  );

  return (
    <div className="space-y-10 py-6">
      {/* Header */}
      <DashboardHeader user={user} />

      {/* Financial & CRM Overview - Adaptive Visibility */}
      {isFounder ? (
        <StatsHero stats={combinedStats} />
      ) : (
        <Card className="p-8 border border-accounting-text/5 shadow-2xl">
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Total Personnel" value={combinedStats.totalStaff} variant="accounting-text" />
              <StatCard label="Live Objectives" value={combinedStats.totalTasks} variant="blue-600" />
              <StatCard label="Operational Completion" value={combinedStats.completedTasks} variant="emerald-600" />
              <StatCard label="Strategic Delays" value={combinedStats.delayedTasks} variant="rose-500" />
           </div>
        </Card>
      )}

      {/* Pending Net Benefit Alert - Founder Only */}
      {isFounder && stats.pendingIn > 0 && (
        <div className="flex items-center justify-between p-5 bg-accounting-bg border border-amber-200 rounded-2xl -inner">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-amber-600 shrink-0" strokeWidth={2.5} />
            <div>
              <p className="font-black text-amber-800 text-sm">Pending Inflow</p>
              <p className="text-[9px] font-black text-amber-600/60 uppercase tracking-widest">Payments due to the company</p>
            </div>
          </div>
          <p className="text-xl font-black text-amber-700">{formatCurrency(stats.pendingIn)}</p>
        </div>
      )}

      {/* Account Balances - Founder Only */}
      {isFounder && <AccountBalances accounts={stats.accountBalances} />}

      {/* Recent Transactions */}
      <RecentTransactions transactions={recentEntries} />
    </div>
  );
};

const StatCard = ({ label, value, variant }) => {
  return (
    <div className="text-center p-4 space-y-1">
      <p className="text-[8px] font-black text-secondary-text/40 uppercase tracking-widest leading-none">{label}</p>
      <p className={cn('text-2xl font-black tracking-tighter leading-none', `text-${variant}`)}>{value}</p>
    </div>
  );
};
