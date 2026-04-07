import React from 'react';
import { cn } from '@/src/lib/utils';

const Input = ({
  label,
  error,
  className,
  type = 'text',
  icon: Icon,
  ...props
}) => {
  return (
    <div className="w-full space-y-1.5">
      {label && <label className="field-label">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-accounting-text/30 pointer-events-none">
            <Icon size={18} strokeWidth={2.5} />
          </div>
        )}
        <input
          type={type}
          className={cn(
            'clay-input w-full transition-all duration-200',
            Icon && 'pl-11',
            error && 'border-red-500 bg-red-50/10',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest pl-1 mt-1">{error}</p>}
    </div>
  );
};

export default Input;
