import React, { useMemo } from 'react';
import { useStats } from '@/src/hooks/useStats';
import { DashboardHeader } from './Header';
import { StatsHero } from './StatsHero';
import { AccountBalances } from './AccountBalances';
import { RecentTransactions } from './RecentTransactions';
import { AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/src/lib/utils';

export const AdminDashboard = ({ user, entries = [], projects = [], staff = [], tasks = [] }) => {
  const stats = useStats(entries);
  
  const crmStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      totalProjects: projects.length,
      totalStaff: staff.length,
      totalTasks: tasks.length,
      delayedTasks: tasks.filter(t => t.status !== 'Completed' && t.dueDate && t.dueDate < today).length,
      completedTasks: tasks.filter(t => t.status === 'Completed').length,
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

      {/* Financial & CRM Overview */}
      <StatsHero stats={combinedStats} />

      {/* Pending Net Benefit Alert */}
      {stats.pendingIn > 0 && (
        <div className="flex items-center justify-between p-5 bg-accounting-bg border border-amber-200 rounded-2xl shadow-clay-inner">
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

      {/* Account Balances */}
      <AccountBalances accounts={stats.accountBalances} />

      {/* Recent Transactions */}
      <RecentTransactions transactions={recentEntries} />
    </div>
  );
};
