import React, { useMemo } from 'react';
import { useStats } from '@/src/hooks/useStats';
import { DashboardHeader } from './Header';
import { StatsHero } from './StatsHero';
import { AccountBalances } from './AccountBalances';
import { RecentTransactions } from './RecentTransactions';
import { AlertCircle, Target, Users, LayoutGrid, CheckCircle } from 'lucide-react';
import { formatCurrency, cn } from '@/src/lib/utils';
import Card from '../ui/Card';

export const AdminDashboard = ({ user, entries = [], projects = [], staff = [], tasks = [], isSuperAdmin }) => {
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
      <DashboardHeader user={user} />

      {isSuperAdmin ? (
        <StatsHero stats={combinedStats} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <KPIBox label="Total Projects" value={combinedStats.totalProjects} icon={LayoutGrid} color="indigo" />
           <KPIBox label="Total Staff" value={combinedStats.totalStaff} icon={Users} color="accounting-text" />
           <KPIBox label="Active Tasks" value={combinedStats.totalTasks} icon={Target} color="blue" />
           <KPIBox label="Completed Tasks" value={combinedStats.completedTasks} icon={CheckCircle} color="emerald" />
        </div>
      )}

      {isSuperAdmin && stats.pendingIn > 0 && (
        <div className="flex items-center justify-between p-6 bg-white rounded-3xl border border-amber-200 shadow-xl shadow-amber-900/5 -inner">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center -inner border border-white">
               <AlertCircle size={24} className="text-amber-600" strokeWidth={3} />
            </div>
            <div>
              <p className="font-black text-amber-950 text-base tracking-tight leading-none">Pending Income</p>
              <p className="text-[10px] font-black text-amber-600/40 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                 Payment expected
              </p>
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600 tracking-tighter">{formatCurrency(stats.pendingIn)}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-8 space-y-10">
           <RecentTransactions transactions={recentEntries} />
        </div>
        <div className="xl:col-span-4 space-y-10">
           {isSuperAdmin && <AccountBalances accounts={stats.accountBalances} />}
        </div>
      </div>
    </div>
  );
};

function KPIBox({ label, value, icon: Icon, color }) {
  return (
    <Card className="p-7 space-y-4 hover:shadow-2xl transition-all border border-transparent hover:border-accounting-text/5">
       <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-secondary-text/30">{label}</p>
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center -inner border border-white shadow-sm", `bg-${color === 'accounting-text' ? 'accounting-bg' : color + '-50'}`)}>
            <Icon size={18} className={cn("stroke-[3px]", `text-${color}-600`)} />
          </div>
       </div>
       <p className="text-4xl font-black tracking-tighter text-accounting-text">{value}</p>
    </Card>
  );
}
