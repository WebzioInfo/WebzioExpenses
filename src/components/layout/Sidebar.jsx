'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  LayoutGrid,
  BarChart3, 
  Users, 
  Target, 
  CreditCard,
  Settings, 
  ShieldCheck, 
  Calendar as CalendarIcon,
  Objective
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { cn } from '@/src/lib/utils';
import Image from 'next/image';

export const Sidebar = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user, isManagement, isSuperAdmin, isHR, hasPermission } = useAuth();

  const navItems = [
    // 1. Dashboard
    { 
      name: 'Summary', 
      path: '/', 
      icon: LayoutDashboard, 
      section: 'Quick View', 
      module: 'Dashboard'
    },
    
    // 2. Work (Tasks)
    { 
      name: 'Tasks', 
      path: '/tasks', 
      icon: Target, 
      section: 'Operations', 
      module: 'Work'
    },
    
    // 3. Team (Staff)
    { 
      name: 'Team', 
      path: '/staff', 
      icon: Users, 
      section: 'Operations', 
      module: 'Team'
    },
    
    // 4. Projects
    { 
      name: 'Projects', 
      path: '/projects', 
      icon: LayoutGrid, 
      section: 'Operations', 
      module: 'Finance'
    },

    // 5. Finance (Entries)
    { 
      name: 'Transactions', 
      path: '/transactions', 
      icon: CreditCard, 
      section: 'Finance', 
      module: 'Finance'
    },
    
    // 6. CRM (Leads)
    { 
      name: 'Leads', 
      path: '/leads', 
      icon: BarChart3, 
      section: 'Finance', 
      module: 'CRM'
    },
    { 
      name: 'Clients', 
      path: '/clients', 
      icon: Users, 
      section: 'Finance', 
      module: 'CRM'
    },
    
    // Attendance & System
    { 
      name: 'Attendance', 
      path: '/attendance', 
      icon: CalendarIcon, 
      section: 'Tracking', 
      module: 'Attendance'
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: Settings, 
      section: 'System', 
      module: 'Settings'
    },
    
    // Admin
    { 
      name: 'Manage Users', 
      path: '/users', 
      icon: ShieldCheck, 
      section: 'Admin', 
      module: 'Settings' 
    },
  ].filter(item => {
    return hasPermission(item.module);
  });

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-accounting-text/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "h-full bg-white lg:bg-transparent z-50 transition-all duration-300 w-72 fixed lg:static shrink-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full py-10 px-5">
          {/* Logo Section */}
          <div className="px-3 mb-10">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center -outer relative overflow-hidden p-2.5">
                <Image src="/assets/logos/WEBZIOLOGO3.png" alt="Webzio" width={36} height={36} className="object-contain" priority />
              </div>
              <div>
                <span className="font-black text-xl tracking-tighter text-accounting-text leading-none uppercase block">Webzio</span>
                <span className="text-[8px] font-black text-accounting-text/40 tracking-[0.4em] uppercase">Enterprise</span>
              </div>
            </Link>
          </div>

          {/* Navigation Matrix */}
          <nav className="flex-1 space-y-8 overflow-y-auto px-1 custom-scrollbar">
            {['Quick View', 'Operations', 'Finance', 'Tracking', 'System', 'Admin'].map((section) => {
              const sectionItems = navItems.filter(i => i.section === section);
              if (sectionItems.length === 0) return null;

              return (
                <div key={section} className="space-y-3">
                  <h3 className="px-4 text-[9px] font-black text-secondary-text/20 uppercase tracking-[0.3em] font-montserrat">{section}</h3>
                  <div className="space-y-1.5">
                    {sectionItems.map((item) => {
                      const isActive = pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative",
                            isActive
                              ? "bg-accounting-text text-white shadow-2xl shadow-accounting-text/20 -outer"
                              : "text-secondary-text/60 hover:text-accounting-text hover:bg-white/60 hover:shadow-xl hover:-outer"
                          )}
                        >
                          <item.icon size={18} strokeWidth={isActive ? 3 : 2} className="shrink-0" />
                          <span className="text-[10px] font-black uppercase tracking-[0.15em]">{item.name}</span>
                          {isActive && <div className="ml-auto w-1.5 h-1.5 bg-accounting-bg/30 rounded-full" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Identity Tag */}
          <div className="px-3 mt-8">
            <div className="p-5 bg-accounting-bg/40 rounded-3xl -inner border border-white flex flex-col items-center text-center gap-2">
               <p className="text-[8px] font-black text-accounting-text/30 uppercase tracking-[0.2em]">User Role</p>
               <p className="text-[10px] font-black text-accounting-text uppercase">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
