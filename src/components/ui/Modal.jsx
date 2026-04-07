'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import Button from './Button';

export default function Modal({ isOpen, onClose, title, subtitle, children, size = 'md' }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="absolute min-h-screen inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop — click to close */}
      <div
        className="absolute top-30 inset-0 bg-accounting-text/10 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className={cn(
          "relative w-full bg-white rounded-3xl -outer border border-white/50 overflow-hidden",
          "animate-in zoom-in-95 fade-in duration-300",
          sizeClasses[size]
        )}
        onClick={e => e.stopPropagation()}
      >
        {/* Inner highlight */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none -inner" />

        {/* Header */}
        <div className="flex items-start justify-between p-8 pb-6 border-b border-accounting-text/5">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-black text-accounting-text tracking-tighter leading-none">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[10px] font-black text-accounting-text/60 uppercase tracking-[0.25em] mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            icon={X}
            className="w-10 h-10 p-0"
            aria-label="Close"
          />
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto max-h-[75vh]">
          {children}
        </div>
      </div>
    </div>
  );
}
