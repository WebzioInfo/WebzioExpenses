import React from 'react';
import { cn } from '@/src/lib/utils';

export const Card = ({ children, className, variant = 'default', ...props }) => {
  const variants = {
    default: 'bg-white shadow-clay-inner border border-accounting-text/5',
    outer: 'bg-white shadow-clay-outer border border-accounting-text/5',
    dark: 'bg-accounting-text text-accounting-bg shadow-clay-outer',
    muted: 'bg-accounting-bg shadow-clay-inner border border-stone-200',
  };

  return (
    <div 
      className={cn(
        'rounded-3xl p-6 transition-all duration-300',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className }) => (
  <h3 className={cn('text-[10px] font-black text-accounting-text/30 uppercase tracking-[0.3em] mb-4', className)}>
    {children}
  </h3>
);
