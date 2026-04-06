import React from 'react';
import { cn } from '@/src/lib/utils';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  onClick, 
  className, 
  variant = 'primary', 
  size = 'md',
  icon: Icon,
  iconSize = 14,
  isLoading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  ...props 
}) => {
  
  const variants = {
    // Premium Dark (Default for primary actions)
    primary: 'bg-[#2D151F] text-[#F4F3DC] shadow-clay-outer hover:bg-clay-plum active:shadow-clay-inner',
    
    // Light Cream (For specialized highlighted actions)
    secondary: 'bg-[#F4F3DC] text-[#2D151F] shadow-clay-outer hover:bg-white active:shadow-clay-inner',
    
    // White Outline (For secondary/neutral actions)
    outline: 'bg-white border border-[#2D151F]/10 text-[#2D151F]/60 shadow-clay-outer hover:bg-[#F4F3DC]/40 active:shadow-clay-inner',
    
    // Minimalist
    ghost: 'bg-transparent text-[#2D151F]/40 hover:text-[#2D151F] hover:bg-[#2D151F]/5',
    
    // Error/Danger
    danger: 'bg-red-50 text-red-600 border border-red-100 shadow-clay-outer hover:bg-red-100 active:shadow-clay-inner',
  };

  const sizes = {
    sm: 'h-9 px-4 text-[9px]',
    md: 'h-11 px-7 text-[10px]',
    lg: 'h-12 px-9 text-[11px]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={iconSize} />
      ) : Icon && (
        <Icon size={iconSize} strokeWidth={2.5} className="shrink-0" />
      )}
      <span>{children}</span>
    </button>
  );
};

export default Button;
