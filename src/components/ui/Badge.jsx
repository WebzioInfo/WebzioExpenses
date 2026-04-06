import React from 'react';
import { cn } from '@/src/lib/utils';

export const Badge = ({ children, className, variant = 'default', dot = false, ...props }) => {
  const variants = {
    default: 'bg-accounting-text/5 text-accounting-text/60',
    success: 'bg-emerald-50 text-emerald-600',
    error: 'bg-red-50 text-red-500',
    warning: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  const dots = {
    default: 'bg-accounting-text/30',
    success: 'bg-emerald-400',
    error: 'bg-red-400',
    warning: 'bg-amber-400',
    blue: 'bg-blue-400',
    purple: 'bg-purple-400',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && <div className={cn('w-1.5 h-1.5 rounded-full', dots[variant])} />}
      {children}
    </div>
  );
};
