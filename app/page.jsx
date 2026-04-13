'use client';

import React, { useMemo } from 'react';
import { useApp } from '@/src/context/ExpenseContext';
import { useAuth } from '@/src/context/AuthContext';
import { useStats } from '@/src/hooks/useStats';
import { DashboardHeader } from '@/src/components/Dashboard/Header';
import { StatsHero } from '@/src/components/Dashboard/StatsHero';
import { AccountBalances } from '@/src/components/Dashboard/AccountBalances';
import { RecentTransactions } from '@/src/components/Dashboard/RecentTransactions';
import { StatsSkeleton } from '@/src/components/ui/Skeleton';
import { AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/src/lib/utils';

import { AdminDashboard } from '@/src/components/Dashboard/AdminDashboard';
import { StaffDashboard } from '@/src/components/Dashboard/StaffDashboard';

export default function Dashboard() {
  const { entries = [], projects = [], staff = [], tasks = [], loading } = useApp();
  const { user, isManagement, isSuperAdmin, viewMode } = useAuth();

  if (loading) return (
    <div className="space-y-10 py-6">
      <div className="h-10 w-64 bg-accounting-text/5 animate-pulse rounded-xl mb-8" />
      <div className="h-64 bg-accounting-text/5 animate-pulse rounded-3xl mb-8 -inner" />
      <div className="grid grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-32 bg-accounting-text/5 animate-pulse rounded-2xl -inner" />)}
      </div>
    </div>
  );

  // Management (Founder/Admin/HR) but in Personal View
  if (isManagement && viewMode === 'personal') {
    return <StaffDashboard
      user={user}
      tasks={tasks}
      entries={entries}
      loading={loading}
    />;
  }

  // If Management (Founder or HR) AND in Company View -> Show Adaptive Management Dashboard
  if (isManagement) {
    return <AdminDashboard
      user={user}
      entries={entries}
      projects={projects}
      staff={staff}
      tasks={tasks}
      isSuperAdmin={isSuperAdmin}
    />;
  }

  // If Staff/Freelancer -> Show Personal Dashboard
  return <StaffDashboard
    user={user}
    tasks={tasks}
    entries={entries}
    loading={loading}
  />;
}
