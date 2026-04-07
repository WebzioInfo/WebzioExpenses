'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  ShieldCheck, 
  CreditCard, 
  Settings2, 
  FolderKanban, 
  Database,
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import Card from '@/src/components/ui/Card';

const SETTINGS_NAV = [
  { name: 'Staff Management', href: '/admin-settings/staff', icon: Users },
  { name: 'Permissions', href: '/admin-settings/users', icon: ShieldCheck },
  { name: 'Accounts', href: '/admin-settings/accounts', icon: CreditCard },
  { name: 'Categories', href: '/admin-settings/categories', icon: Settings2 },
  { name: 'Project Settings', href: '/admin-settings/projects', icon: FolderKanban },
  { name: 'System Control', href: '/admin-settings/system', icon: Database },
];

export default function AdminSettingsLayout({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace('/');
    }
  }, [isAdmin, loading, router]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-accounting-text/10 border-t-accounting-text rounded-full animate-spin" />
    </div>
  );

  if (!isAdmin) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-8 py-6 max-w-7xl mx-auto">
      {/* Settings Sidebar */}
      <aside className="w-full lg:w-72 shrink-0">
        <div className="sticky top-24 space-y-4">
          <div className="px-2 mb-6">
            <h1 className="text-2xl font-black text-accounting-text tracking-tighter uppercase leading-none">Admin Settings</h1>
            <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest mt-2">Global System Control</p>
          </div>

          <nav className="space-y-1">
            {SETTINGS_NAV.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group",
                    isActive 
                      ? "bg-accounting-text text-white shadow-lg translate-x-1" 
                      : "text-secondary-text hover:bg-white hover:shadow-sm"
                  )}
                >
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={cn(isActive ? "text-white" : "group-hover:text-accounting-text")} />
                  <span className="text-[11px] font-black uppercase tracking-widest flex-1">{item.name}</span>
                  {isActive && <ChevronRight size={14} strokeWidth={3} />}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-secondary-text hover:bg-white transition-all mt-8 group"
          >
            <LayoutDashboard size={18} strokeWidth={2} className="group-hover:text-accounting-text" />
            <span className="text-[11px] font-black uppercase tracking-widest">Back to Dashboard</span>
          </Link>
        </div>
      </aside>

      {/* Main Settings Content */}
      <main className="flex-1 min-w-0">
        <Card className="min-h-[70vh] shadow-xl border border-white/40">
           {children}
        </Card>
      </main>
    </div>
  );
}
