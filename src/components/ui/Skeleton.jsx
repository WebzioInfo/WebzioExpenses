import React from 'react';
import { cn } from '@/src/lib/utils';

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse rounded-2xl bg-accounting-text/5 -inner", className)}
      {...props}
    />
  );
};

export const SkeletonPulse = ({ className }) => (
  <div className={cn("w-full h-32", className)}>
    <Skeleton className="w-full h-full" />
  </div>
);

export const CardSkeleton = () => (
  <div className="clay-card p-6 space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton className="w-16 h-16 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-5 border-t border-accounting-text/5 items-center">
    <Skeleton className="h-4 w-16" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <Skeleton className="h-8 w-24 rounded-xl" />
    <Skeleton className="h-4 w-12" />
    <Skeleton className="h-5 w-20" />
    <Skeleton className="h-9 w-20 rounded-xl" />
  </div>
);

export const TableSkeleton = () => (
  <div className="clay-card overflow-hidden">
    <div className="h-12 bg-accounting-text/5 border-b border-accounting-text/5" />
    {[1, 2, 3, 4, 5].map(i => <TableRowSkeleton key={i} />)}
  </div>
);

export const StatsSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <Skeleton key={i} className="h-28 rounded-3xl shrink-0" />
    ))}
  </div>
);
