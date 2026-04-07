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
  iconSize = 16,
  isLoading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  ...props
}) => {

  const variants = {
    // Primary: #2D151F
    primary: 'clay-btn-primary',

    // Secondary: Border 1px solid #2D151F
    secondary: 'clay-btn-secondary',

    // Neutral Outline (Legacy support, mapped to secondary or ghost)
    outline: 'clay-btn-secondary opacity-70',

    // Minimalist
    ghost: 'hover:bg-accounting-text/5 text-accounting-text/60 hover:text-accounting-text',

    // Error/Danger: #b91c1c
    danger: 'clay-btn-danger',
    
    // Disabled (handled by class but can be explicit)
    disabled: 'clay-btn-disabled',
  };

  const sizes = {
    sm: 'h-9 px-4 text-[10px]',
    md: 'h-11 px-7 text-[11px]',
    lg: 'h-13 px-9 text-[12px]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        'clay-btn transition-all duration-300 active:scale-95 disabled:scale-100',
        disabled || isLoading ? 'clay-btn-disabled' : variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={iconSize} />
      ) : Icon && (
        <Icon size={iconSize} strokeWidth={3} className="shrink-0" />
      )}
      {children && <span>{children}</span>}
    </button>
  );
};

export default Button;
