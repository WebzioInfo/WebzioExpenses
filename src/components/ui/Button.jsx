import React from 'react';
import { cn } from '../../utils/helpers';

const Button = ({ children, onClick, className, variant = 'primary', ...props }) => {
  const variants = {
    primary: 'clay-btn-primary',
    outline: 'clay-btn',
    ghost: 'bg-transparent text-[#2D151F]/40 hover:text-[#2D151F] hover:bg-[#2D151F]/5',
    danger: 'clay-btn bg-red-50 text-red-600 border-red-100',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'clay-btn py-4 px-8 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
