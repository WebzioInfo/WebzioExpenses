import React from 'react';
import Link from 'next/link';
import { ArrowRight, History, Receipt } from 'lucide-react';
import { formatCurrency, cn } from '@/src/lib/utils';
import Card from '../ui/Card';
import { ENTRY_TYPES } from '@/src/lib/constants';
import Button from '../ui/Button';

export const RecentTransactions = ({ transactions = [] }) => {
  if (transactions.length === 0) {
    return (
      <Card className="p-20 flex flex-col items-center justify-center text-center space-y-4 border border-accounting-text/5">
        <div className="w-16 h-16 rounded-3xl bg-accounting-bg/40 flex items-center justify-center -inner border border-white/50">
          <History size={28} className="text-accounting-text/20" strokeWidth={2.5} />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-black text-accounting-text uppercase tracking-tighter">No historical data</p>
          <p className="text-[10px] font-bold text-secondary-text uppercase tracking-widest leading-relaxed px-10">Start recording transactions to see your financial activity here.</p>
        </div>
        <Link href="/add-transaction">
          <Button variant="secondary" size="sm" className="mt-2">Record First Entry</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
           <Receipt size={14} className="text-secondary-text" strokeWidth={3} />
           <h3 className="text-[10px] font-black text-secondary-text uppercase tracking-[0.2em] leading-none">Journal Snapshot</h3>
        </div>
        <Link href="/transactions">
          <Button variant="ghost" size="sm" className="h-8 px-4 text-[9px]">
            View Audit Log <ArrowRight size={10} className="ml-1" strokeWidth={3} />
          </Button>
        </Link>
      </div>

      <Card className="p-0 overflow-hidden border border-accounting-text/5 shadow-xl">
        {transactions.map((entry, i) => (
          <div 
            key={entry.id} 
            className={cn(
              'flex items-center justify-between p-6 group hover:bg-accounting-bg/40 transition-all duration-300', 
              i > 0 && 'border-t border-accounting-bg'
            )}
          >
            <div className="flex items-center gap-5">
              {/* Type Indicator */}
              <div className={cn(
                'w-1.5 h-8 rounded-full shrink-0 shadow-sm transition-all group-hover:h-10', 
                getTypeColor(entry.type)
              )} />
              
              <div>
                <p className="font-black text-accounting-text text-sm tracking-tight group-hover:translate-x-1 transition-transform">
                  {entry.title}
                </p>
                <div className="flex items-center gap-2 mt-1.5 overflow-hidden">
                  <span className={cn(
                    "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border -inner",
                    getBadgeStyle(entry.type)
                  )}>
                    {entry.type}
                  </span>
                  {entry.account && (
                    <span className="text-[9px] font-bold text-secondary-text/50 uppercase tracking-tight truncate">
                      • {entry.account}
                    </span>
                  )}
                  {entry.projectName && (
                    <span className="text-[9px] font-bold text-secondary-text/30 uppercase tracking-tight truncate max-w-[120px]">
                      • {entry.projectName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0 ml-4">
              <p className={cn(
                'text-lg font-black tracking-tighter leading-none mb-1.5', 
                getAmountColor(entry.type)
              )}>
                {isPositive(entry.type) ? '+' : '-'}{formatCurrency(parseFloat(entry.amount))}
              </p>
              <p className="text-[9px] font-black text-secondary-text/40 uppercase tracking-widest italic">{entry.date}</p>
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
    [ENTRY_TYPES.MONEY_IN]: 'bg-emerald-500',
    [ENTRY_TYPES.MONEY_OUT]: 'bg-red-500',
    [ENTRY_TYPES.ADDED_MONEY]: 'bg-blue-500',
    [ENTRY_TYPES.SALARY]: 'bg-amber-500',
    [ENTRY_TYPES.TRANSFER]: 'bg-accounting-text',
  };
  return colors[type] || 'bg-secondary-text';
};

const getBadgeStyle = (type) => {
  const styles = {
    [ENTRY_TYPES.MONEY_IN]: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    [ENTRY_TYPES.MONEY_OUT]: 'bg-red-50 text-red-700 border-red-100',
    [ENTRY_TYPES.ADDED_MONEY]: 'bg-blue-50 text-blue-700 border-blue-100',
    [ENTRY_TYPES.SALARY]: 'bg-amber-50 text-amber-700 border-amber-100',
    [ENTRY_TYPES.TRANSFER]: 'bg-accounting-bg text-accounting-text border-accounting-text/10',
  };
  return styles[type] || 'bg-accounting-bg text-secondary-text border-accounting-text/5';
};

const getAmountColor = (type) => {
  if (type === ENTRY_TYPES.MONEY_IN || type === ENTRY_TYPES.ADDED_MONEY) return 'text-emerald-600';
  return 'text-red-600';
};

const isPositive = (type) => {
  return type === ENTRY_TYPES.MONEY_IN || type === ENTRY_TYPES.ADDED_MONEY;
};
