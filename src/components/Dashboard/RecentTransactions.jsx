import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { formatCurrency, cn } from '@/src/lib/utils';
import { Card, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ENTRY_TYPES } from '@/src/lib/constants';
import Button from '../ui/Button';

export const RecentTransactions = ({ transactions = [] }) => {
  if (transactions.length === 0) {
    return (
      <Card className="p-16 flex flex-col items-center justify-center text-center space-y-3 mt-10">
        <p className="text-base font-black text-accounting-text/30 uppercase tracking-tighter">No entries yet</p>
        <p className="text-[10px] font-black text-accounting-text/20 uppercase tracking-widest">Add your first entry to get started</p>
        <Link href="/add-transaction">
          <Button className="mt-2 h-10 px-6">
            Add Entry
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4 px-1">
        <CardTitle className="mb-0">Recent Entries</CardTitle>
        <Link href="/transactions" className="text-[9px] font-black text-accounting-text/40 hover:text-accounting-text uppercase tracking-widest transition-colors flex items-center gap-1">
          View All <ArrowRight size={10} />
        </Link>
      </div>

      <Card className="p-0 overflow-hidden">
        {transactions.map((entry, i) => (
          <div 
            key={entry.id} 
            className={cn(
              'flex items-center justify-between p-5 group hover:bg-accounting-bg/30 transition-colors', 
              i > 0 && 'border-t border-accounting-text/5'
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', getTypeColor(entry.type))} />
              <div>
                <p className="font-black text-accounting-text text-sm group-hover:translate-x-0.5 transition-transform">
                  {entry.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[8px] font-black text-accounting-text/30 uppercase tracking-widest">{entry.type}</span>
                  {entry.account && <span className="text-[8px] font-black text-accounting-text/20 uppercase">· {entry.account}</span>}
                  {entry.projectName && <span className="text-[8px] font-black text-accounting-text/20 uppercase">· {entry.projectName}</span>}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={cn('font-black text-base', getAmountColor(entry.type))}>
                {isPositive(entry.type) ? '+' : '-'}{formatCurrency(parseFloat(entry.amount))}
              </p>
              <p className="text-[8px] font-black text-accounting-text/20 uppercase tracking-widest">{entry.date}</p>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

// Internal helpers for this component
const getTypeColor = (type) => {
  const colors = {
    [ENTRY_TYPES.MONEY_IN]: 'bg-emerald-400',
    [ENTRY_TYPES.MONEY_OUT]: 'bg-red-400',
    [ENTRY_TYPES.ADDED_MONEY]: 'bg-blue-400',
    [ENTRY_TYPES.SALARY]: 'bg-amber-400',
    [ENTRY_TYPES.TRANSFER]: 'bg-purple-400',
  };
  return colors[type] || 'bg-gray-300';
};

const getAmountColor = (type) => {
  if (type === ENTRY_TYPES.MONEY_IN || type === ENTRY_TYPES.ADDED_MONEY) return 'text-emerald-600';
  return 'text-red-500';
};

const isPositive = (type) => {
  return type === ENTRY_TYPES.MONEY_IN || type === ENTRY_TYPES.ADDED_MONEY;
};
