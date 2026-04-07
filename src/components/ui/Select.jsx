import React from 'react';
import { cn } from '@/src/lib/utils';
import { ChevronDown } from 'lucide-react';

const Select = ({
  label,
  error,
  children,
  className,
  ...props
}) => {
  return (
    <div className="w-full space-y-1.5">
      {label && <label className="field-label">{label}</label>}
      <div className="relative">
        <select
          className={cn(
            'clay-input w-full transition-all appearance-none pr-10',
            error && 'border-red-500 bg-red-50/10',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-accounting-text/30">
          <ChevronDown size={18} strokeWidth={2.5} />
        </div>
      </div>
      {error && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest pl-1 mt-1">{error}</p>}
    </div>
  );
};

export default Select;
