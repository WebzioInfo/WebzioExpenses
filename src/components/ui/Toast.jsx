'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import Button from './Button';

export default function Toast({ message, type, onClose }) {
  const icons = {
    success: <CheckCircle className="text-emerald-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    info: <Info className="text-brand-dark/40" size={20} />,
  };

  const borders = {
    success: "border-emerald-500/20",
    error: "border-red-500/20",
    info: "border-brand-dark/5",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9, transition: { duration: 0.2 } }}
      className="pointer-events-auto"
    >
      <div className={cn(
        "clay-card p-5 min-w-[320px] flex items-center justify-between gap-6",
        "border border-white/40 backdrop-blur-md",
        borders[type]
      )}>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/60 rounded-2xl shadow-clay-inner border border-white/20">
            {icons[type]}
          </div>
          <div className="space-y-0.5">
             <p className="text-[10px] font-black uppercase tracking-widest text-brand-dark/30">{type}</p>
             <p className="text-sm font-black text-brand-dark leading-snug">{message}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          icon={X}
        />
      </div>
    </motion.div>
  );
}
