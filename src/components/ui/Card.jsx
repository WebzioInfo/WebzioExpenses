import React from 'react';
import { cn } from '@/src/lib/utils';

const Card = ({ children, className, onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'clay-card bg-white p-6 transition-all duration-300',
        onClick && 'cursor-pointer hover:shadow-lg active:scale-[0.99]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
